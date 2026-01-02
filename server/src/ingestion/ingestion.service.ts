import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { DsaProblem } from '../dsa/problem.entity';
import { Tag } from '../tags/tag.entity';

import { CompanyProblem } from '../dsa/company-problem.entity';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectRepository(DsaProblem)
    private problemRepo: Repository<DsaProblem>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(CompanyProblem)
    private companyProblemRepo: Repository<CompanyProblem>,
    private readonly httpService: HttpService,
  ) {}

  async ingestProblem(slug: string): Promise<DsaProblem> {
    this.logger.log(`Ingesting problem on-demand: ${slug}`);
    
    // 1. Fetch from LeetCode
    const data = await this.fetchLeetCodeData(slug);
    if (!data) {
      this.logger.error(`Problem not found on LeetCode: ${slug}`);
      throw new NotFoundException(`Problem not found: ${slug}`);
    }

    // 2. Process Tags
    const tags: Tag[] = [];
    if (data.topicTags) {
      for (const t of data.topicTags) {
        let tag = await this.tagRepo.findOne({ where: { name: t.name } });
        if (!tag) {
          tag = this.tagRepo.create({ name: t.name, category: 'topic' });
          tag = await this.tagRepo.save(tag);
        }
        tags.push(tag);
      }
    }

    // 3. Process Problem
    let problem = await this.problemRepo.findOne({ 
      where: { titleSlug: data.titleSlug },
      relations: ['tags']
    });
    
    if (!problem) {
      problem = this.problemRepo.create({
        title: data.title,
        titleSlug: data.titleSlug,
        difficulty: data.difficulty,
        platformProblemId: data.questionId,
        isPaidOnly: data.isPaidOnly,
        tags: tags,
      });
    } else {
      // Update existing, merge tags
      // Preserve existing 'company' tags, overwrite 'topic' tags
      const companyTags = problem.tags.filter(t => t.category === 'company');
      
      // Merge unique tags
      const mergedTags = [...companyTags];
      const existingIds = new Set(companyTags.map(t => t.id));
      
      tags.forEach(t => {
        if (!existingIds.has(t.id)) {
          mergedTags.push(t);
        }
      });

      problem.tags = mergedTags;
      problem.difficulty = data.difficulty;
      problem.title = data.title;
      problem.isPaidOnly = data.isPaidOnly;
    }

    return this.problemRepo.save(problem);
  }

  async seedLiquidSLR(): Promise<{ companies: number, problemsProcesssed: number, newProblems: number }> {
    const repoPath = path.join(process.cwd(), 'scripts', 'data', 'liquidslr_repo');
    
    if (!fs.existsSync(repoPath)) {
      throw new NotFoundException('LiquidSLR repo not found at ' + repoPath);
    }

    const companyDirs = fs.readdirSync(repoPath).filter(f => fs.statSync(path.join(repoPath, f)).isDirectory());
    this.logger.log(`Found ${companyDirs.length} companies. Starting Full Ingestion...`);

    // 1. Cache Problems and Tags
    const allProblems = await this.problemRepo.find({ select: ['id', 'titleSlug'] });
    const problemMap = new Map<string, string>(); // slug -> id
    allProblems.forEach(p => problemMap.set(p.titleSlug, p.id));
    
    const allTags = await this.tagRepo.find();
    const tagMap = new Map<string, Tag>(); // name -> Tag
    allTags.forEach(t => tagMap.set(t.name.toLowerCase(), t));

    let problemsProcessed = 0;
    let newProblemsCount = 0;

    for (const companyName of companyDirs) {
      const csvPath = path.join(repoPath, companyName, '5. All.csv');
      if (!fs.existsSync(csvPath)) continue;

      this.logger.log(`-> Processing ${companyName}...`);
      
      let records: any[] = [];
      try {
        const fileContent = fs.readFileSync(csvPath, 'utf8');
        records = parse(fileContent, {
          columns: true, 
          skip_empty_lines: true,
          relax_quotes: true
        });
      } catch (e) {
        continue;
      }

      // Ensure company tag exists
      let companyTag = tagMap.get(companyName.toLowerCase());
      if (!companyTag) {
        companyTag = this.tagRepo.create({ name: companyName, category: 'company' });
        await this.tagRepo.save(companyTag);
        tagMap.set(companyName.toLowerCase(), companyTag);
      }

      for (const record of records) {
        const link = record['Link'];
        if (!link) continue;
        
        const slug = link.split('/').filter((p: string) => p.length > 0).pop();
        if (!slug) continue;

        let problemId = problemMap.get(slug);

        // If Problem Missing -> CREATE IT
        if (!problemId) {
          const title = record['Title'];
          let difficulty = record['Difficulty'];
          if (difficulty) {
            difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
          }

          // Process Topics: "Array, Hash Table"
          const rawTopics = record['Topics'];
          const problemTags: Tag[] = [];
          
          if (rawTopics) {
             const topicNames = rawTopics.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
             for (const tName of topicNames) {
                let tag = tagMap.get(tName.toLowerCase());
                if (!tag) {
                   tag = this.tagRepo.create({ name: tName, category: 'topic' });
                   await this.tagRepo.save(tag);
                   tagMap.set(tName.toLowerCase(), tag);
                }
                problemTags.push(tag);
             }
          }

          const newProblem = this.problemRepo.create({
            title: title || slug,
            titleSlug: slug,
            difficulty: difficulty,
            platformProblemId: undefined, 
            isPaidOnly: false, 
            tags: problemTags
          });

          // Save and Update Map
          try {
             const saved = await this.problemRepo.save(newProblem) as DsaProblem;
             problemId = saved.id;
             problemMap.set(slug, saved.id);
             newProblemsCount++;
          } catch (e) {
             this.logger.warn(`Failed to create problem ${slug}: ${e.message}`);
             continue;
          }
        }

        // Now we have problemId. Add Stats.
        if (problemId) {
           problemsProcessed++;
           
           // Link company tag
           try {
             await this.problemRepo.createQueryBuilder()
               .relation(DsaProblem, 'tags')
               .of(problemId)
               .add(companyTag);
           } catch (e) {} // Existed

           // Add/Update CompanyProblem Stat
           const freqVal = parseFloat(record['Frequency'] || '0');
           
           const existingStat = await this.companyProblemRepo.findOne({
             where: { companyName: companyName, problem: { id: problemId } }
           });

           if (!existingStat) {
             const stat = this.companyProblemRepo.create({
               companyName: companyName,
               problem: { id: problemId } as DsaProblem,
               frequency: freqVal,
               duration: 'all'
             });
             await this.companyProblemRepo.save(stat);
           } else if (Math.abs(existingStat.frequency - freqVal) > 0.01) {
             existingStat.frequency = freqVal;
             await this.companyProblemRepo.save(existingStat);
           }
        }
      }
    }

    this.logger.log(`Full Ingestion Complete. Processed: ${problemsProcessed}, Newly Created: ${newProblemsCount}`);
    return { companies: companyDirs.length, problemsProcesssed: problemsProcessed, newProblems: newProblemsCount };
  }

  private async fetchLeetCodeData(slug: string) {
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          titleSlug
          difficulty
          isPaidOnly
          topicTags { name slug }
        }
      }
    `;

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://leetcode.com/graphql', {
          query,
          variables: { titleSlug: slug },
        }, {
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
          }
        })
      );
      return response.data?.data?.question;
    } catch (e) {
      this.logger.error('Failed to fetch from LeetCode', e);
      return null;
    }
  }
}

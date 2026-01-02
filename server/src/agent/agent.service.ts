import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyProblem } from '../dsa/company-problem.entity';
import { IntentAnalyzerService } from './services/intent-analyzer.service';
import { PlanGeneratorService } from './services/plan-generator.service';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectRepository(CompanyProblem)
    private companyProblemRepo: Repository<CompanyProblem>,
    private configService: ConfigService,
    private intentAnalyzer: IntentAnalyzerService,
    private planGenerator: PlanGeneratorService,
  ) {}

  async generatePlan(userInput: string) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('No GEMINI_API_KEY found. Falling back to basic logic.');
      return this.generateMockPlan(userInput);
    }

    try {
      // 1. Analyze User Intent
      const intent = await this.intentAnalyzer.analyze(userInput);

      if (!intent.company) {
        return {
          message: "Could you please specify which company you're interviewing with? (e.g., 'I have an interview with Google')."
        };
      }

      // 2. Retrieve Data (RAG)
      const problems = await this.companyProblemRepo.find({
        where: { companyName: intent.company },
        order: { frequency: 'DESC' },
        take: 15,
        relations: ['problem']
      });

      if (problems.length === 0) {
        return {
          message: `I don't have detailed frequency data for "${intent.company}" yet. Would you like a general Top 75 plan instead?`
        };
      }

      // 3. Generate Optimized Plan
      const planMarkdown = await this.planGenerator.generate(intent, problems);

      return {
        company: intent.company,
        role: intent.role,
        timeframe: intent.timeframe,
        planMarkdown,
        problems: problems.map(p => ({
          title: p.problem.title,
          slug: p.problem.titleSlug,
          frequency: p.frequency,
          difficulty: p.problem.difficulty,
          link: `https://leetcode.com/problems/${p.problem.titleSlug}`
        }))
      };
    } catch (error) {
      this.logger.error(`Plan Generation Failed: ${error.message}`);
      throw error;
    }
  }

  private async generateMockPlan(userInput: string) {
    // Simple basic fallback if AI is down or no key
    const companies = ['Google', 'Amazon', 'Meta', 'Uber'];
    let company = 'Google';
    for (const c of companies) {
      if (userInput.toLowerCase().includes(c.toLowerCase())) {
        company = c;
        break;
      }
    }

    const problems = await this.companyProblemRepo.find({
      where: { companyName: company },
      order: { frequency: 'DESC' },
      take: 10,
      relations: ['problem']
    });

    return {
      message: "Running in basic mode (AI Key missing).",
      company,
      planMarkdown: `# Study Plan for ${company}\nFocus on the linked problems below.`,
      problems: problems.map(p => ({
        title: p.problem.title,
        slug: p.problem.titleSlug,
        frequency: p.frequency,
        link: `https://leetcode.com/problems/${p.problem.titleSlug}`
      }))
    };
  }
}

import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tag } from '../tags/tag.entity';
import { CompanyProblem } from './company-problem.entity';

@Entity()
export class DsaProblem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  titleSlug: string; // 'two-sum'

  @Column({ nullable: true })
  difficulty: string; // 'Easy', 'Medium', 'Hard'
  
  @Column({ unique: true, nullable: true })
  platformProblemId: string; // LeetCode frontend ID

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: false })
  isPaidOnly: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Tag, (tag) => tag.dsaProblems)
  @JoinTable()
  tags: Tag[];

  @OneToMany(() => CompanyProblem, (cp) => cp.problem)
  companyStats: CompanyProblem[];
}

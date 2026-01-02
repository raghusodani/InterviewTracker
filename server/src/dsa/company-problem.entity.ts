import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DsaProblem } from './problem.entity';

@Entity()
@Index(['companyName', 'frequency']) // Composite index for fast "Top X Company Questions" queries
export class CompanyProblem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  companyName: string;

  @Column({ type: 'float', default: 0 })
  frequency: number;

  @Column({ nullable: true })
  duration: string; // '30d', '6m', '1y', 'all'

  @ManyToOne(() => DsaProblem, (problem) => problem.companyStats)
  problem: DsaProblem;
}

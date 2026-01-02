import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DsaProblem } from '../dsa/problem.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  category: string; // 'topic', 'pattern', 'company'

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => DsaProblem, (problem) => problem.tags)
  dsaProblems: DsaProblem[];
}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DsaProblem } from '../dsa/problem.entity';
import { Tag } from '../tags/tag.entity';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

import { CompanyProblem } from '../dsa/company-problem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DsaProblem, Tag, CompanyProblem]),
    HttpModule,
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}

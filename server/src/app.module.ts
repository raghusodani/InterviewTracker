import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyProblem } from './dsa/company-problem.entity';
import { DsaProblem } from './dsa/problem.entity';
import { IngestionModule } from './ingestion/ingestion.module';
import { Tag } from './tags/tag.entity';

import { AgentModule } from './agent/agent.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [DsaProblem, Tag, CompanyProblem],
      synchronize: true, // Only for development/prototyping
    }),
    TypeOrmModule.forFeature([DsaProblem, Tag, CompanyProblem]),
    IngestionModule,
    AgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

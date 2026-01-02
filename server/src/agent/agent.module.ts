import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyProblem } from '../dsa/company-problem.entity';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AiProviderService } from './services/ai-provider.service';
import { IntentAnalyzerService } from './services/intent-analyzer.service';
import { PlanGeneratorService } from './services/plan-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyProblem]),
    HttpModule,
  ],
  controllers: [AgentController],
  providers: [
    AgentService,
    AiProviderService,
    IntentAnalyzerService,
    PlanGeneratorService,
  ],
  exports: [AgentService],
})
export class AgentModule {}

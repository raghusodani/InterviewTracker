import { Body, Controller, Post } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('plan')
  async getPlan(@Body() body: { userInput: string }) {
    return this.agentService.generatePlan(body.userInput);
  }
}

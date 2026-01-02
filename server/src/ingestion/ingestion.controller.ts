import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('leetcode')
  async ingestLeetCode(@Body() body: { slug: string }) {
    if (!body.slug) {
      throw new BadRequestException('Slug is required');
    }
    const problem = await this.ingestionService.ingestProblem(body.slug);
    return { success: true, problem };
  }

  @Post('companies/liquidslr')
  async seedLiquidSLR() {
    const result = await this.ingestionService.seedLiquidSLR();
    return { success: true, ...result };
  }
}

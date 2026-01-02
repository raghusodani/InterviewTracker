import { Injectable } from '@nestjs/common';
import { UserIntent } from '../interfaces/agent.interfaces';
import { AiProviderService } from './ai-provider.service';

@Injectable()
export class PlanGeneratorService {
  constructor(private readonly aiProvider: AiProviderService) {}

  async generate(intent: UserIntent, problems: any[]): Promise<string> {
    const problemList = problems
      .map(p => `- ${p.problem.title} (Frequency Score: ${p.frequency.toFixed(1)}, Difficulty: ${p.problem.difficulty})`)
      .join('\n');

    const prompt = `
      You are an Expert Interview Coach specialized in Big Tech (MAANG).
      
      User Context:
      - Company: ${intent.company}
      - Role: ${intent.role}
      - Timeframe: ${intent.timeframe}
      
      Real-world Data for ${intent.company}:
      The following questions are the most frequently asked in recent ${intent.company} interviews:
      ${problemList}
      
      Task:
      Create a high-impact, premium study plan tailored to the user's timeframe.
      
      Structure the response as follows:
      1. **Strategic Overview**: A brief brief on what ${intent.company} specifically looks for (e.g., algorithmic efficiency, system scalability, cultural fit).
      2. **Day-by-Day or Stage-by-Stage Plan**: Group the provided questions into logical daily tasks.
      3. **Technical Deep Dive**: Briefly explain *why* these specific problems are important for ${intent.company} (e.g., "Google loves Graph traversal").
      4. **Cultural/Behavioral Prep**: Specific advice on the non-technical aspects of ${intent.company}'s interview process.
      5. **Closing Advice**: Top 3 tips for interview day.
      
      Formatting: Use clean Markdown with headers, bold text, and lists. Make it look professional and encouraging.
    `;

    return this.aiProvider.generateContent(prompt, false);
  }
}

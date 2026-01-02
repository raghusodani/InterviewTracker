import { Injectable, Logger } from '@nestjs/common';
import { UserIntent } from '../interfaces/agent.interfaces';
import { AiProviderService } from './ai-provider.service';

@Injectable()
export class IntentAnalyzerService {
  private readonly logger = new Logger(IntentAnalyzerService.name);

  constructor(private readonly aiProvider: AiProviderService) {}

  async analyze(userInput: string): Promise<UserIntent> {
    const prompt = `
      You are an elite Technical Career Consultant and Recruiter.
      Analyze the user's request for interview preparation.
      
      User Input: "${userInput}"
      
      Task: Extract the following structured data:
      1. target company (the name of the company they are interviewing with).
      2. role level/title (e.g., L3/Junior, L5/Senior, Staff, Manager, Intern).
      3. timeframe (how long they have until the interview, e.g., "1 week", "3 days").
      4. specific domain if mentioned (e.g., Frontend, Backend, Systems, Mobile).
      
      Return ONLY a JSON object with these keys: 
      { "company": string | null, "role": string, "timeframe": string, "domain": string | null }
      
      If the company name is missing or ambiguous, return null for company.
    `;

    try {
      const response = await this.aiProvider.generateContent(prompt, true);
      const cleaned = this.aiProvider.cleanJson(response);
      return JSON.parse(cleaned);
    } catch (e) {
      this.logger.error('Failed to analyze intent with AI, using fallback extraction');
      return this.fallbackExtraction(userInput);
    }
  }

  private fallbackExtraction(userInput: string): UserIntent {
    const companies = ['Google', 'Amazon', 'Meta', 'Facebook', 'Uber', 'Microsoft', 'Apple', 'Netflix'];
    const lowerInput = userInput.toLowerCase();
    
    let foundCompany: string | null = null;
    for (const c of companies) {
      if (lowerInput.includes(c.toLowerCase())) {
        foundCompany = c;
        break;
      }
    }

    return {
      company: foundCompany,
      role: 'Software Engineer',
      timeframe: 'Custom'
    };
  }
}

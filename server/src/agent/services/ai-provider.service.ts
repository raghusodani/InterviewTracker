import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateContent(prompt: string, jsonMode = false): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const formatInstruction = jsonMode ? " Respond strictly in valid JSON format." : "";

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, {
          contents: [{ parts: [{ text: prompt + formatInstruction }] }]
        })
      );

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('AI returned empty response');
      }

      return text;
    } catch (e: any) {
      this.logger.error(`AI Provider Error: ${e.response?.data?.error?.message || e.message}`);
      throw e;
    }
  }

  cleanJson(text: string): string {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }
}

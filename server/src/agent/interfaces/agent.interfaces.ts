export interface UserIntent {
  company: string | null;
  role: string;
  timeframe: string;
  experienceLevel?: string;
}

export interface AiResponse {
  text: string;
  raw?: any;
}

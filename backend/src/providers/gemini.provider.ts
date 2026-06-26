import { ConversationMessage } from '../types';
import { BaseAIProvider } from './base.provider';
import { config } from '../config';
import { logger } from '../utils/logger';





export class GeminiProvider extends BaseAIProvider {
  readonly name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = config.GEMINI_API_KEY;
    this.model = config.GEMINI_MODEL;

    if (!this.apiKey) {
      logger.warn('Gemini API key not configured');
    }
  }

  async generateSchema(
    messages: ConversationMessage[],
    systemPrompt: string,
  ): Promise<string> {

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${error}`);
    }

    const data = await response.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.extractJSON(content);
  }
}

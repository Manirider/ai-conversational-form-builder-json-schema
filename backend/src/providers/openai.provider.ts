import { ConversationMessage } from '../types';
import { BaseAIProvider } from './base.provider';
import { config } from '../config';
import { logger } from '../utils/logger';





export class OpenAIProvider extends BaseAIProvider {
  readonly name = 'openai';
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = config.OPENAI_API_KEY;
    this.model = config.OPENAI_MODEL;

    if (!this.apiKey) {
      logger.warn('OpenAI API key not configured');
    }
  }

  async generateSchema(
    messages: ConversationMessage[],
    systemPrompt: string,
  ): Promise<string> {
    const formattedMessages = this.formatMessages(messages, systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices[0]?.message?.content || '';
    return this.extractJSON(content);
  }
}

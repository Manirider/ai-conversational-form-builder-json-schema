import { ConversationMessage } from '../types';
import { BaseAIProvider } from './base.provider';
import { config } from '../config';
import { logger } from '../utils/logger';





export class AnthropicProvider extends BaseAIProvider {
  readonly name = 'anthropic';
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = config.ANTHROPIC_API_KEY;
    this.model = config.ANTHROPIC_MODEL;

    if (!this.apiKey) {
      logger.warn('Anthropic API key not configured');
    }
  }

  async generateSchema(
    messages: ConversationMessage[],
    systemPrompt: string,
  ): Promise<string> {

    const formattedMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: formattedMessages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${error}`);
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };

    const content = data.content?.[0]?.text || '';
    return this.extractJSON(content);
  }
}

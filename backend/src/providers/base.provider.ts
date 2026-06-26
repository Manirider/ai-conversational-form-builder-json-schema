import { ConversationMessage, IAIProvider } from '../types';
import { logger } from '../utils/logger';





export abstract class BaseAIProvider implements IAIProvider {
  abstract readonly name: string;

  abstract generateSchema(
    messages: ConversationMessage[],
    systemPrompt: string,
  ): Promise<string>;





  protected extractJSON(response: string): string {

    const jsonBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (jsonBlockMatch) {
      return jsonBlockMatch[1].trim();
    }


    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0].trim();
    }

    logger.warn(`${this.name}: Could not extract JSON from response`);
    return response.trim();
  }




  protected formatMessages(
    messages: ConversationMessage[],
    systemPrompt: string,
  ): Array<{ role: string; content: string }> {
    return [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];
  }
}

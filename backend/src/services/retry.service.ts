import { ConversationMessage, IAIProvider, JSONSchema } from '../types';
import { validateSchema, isClarificationResponse } from '../validators/schema.validator';
import { getRetryPrompt } from '../conversation/prompts';
import { config } from '../config';
import { logger } from '../utils/logger';





export async function generateWithRetry(
  provider: IAIProvider,
  messages: ConversationMessage[],
  systemPrompt: string,
): Promise<{ schema: JSONSchema } | { clarification: { questions: string[] } }> {
  const maxRetries = config.MAX_RETRIES;
  let lastErrors: string[] = [];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {

      let currentPrompt = systemPrompt;
      if (attempt > 0 && lastErrors.length > 0) {
        currentPrompt = `${systemPrompt}\n\n${getRetryPrompt(lastErrors, attempt)}`;
      }

      logger.debug(`Generation attempt ${attempt + 1}/${maxRetries + 1}`, {
        provider: provider.name,
      });


      const rawResponse = await provider.generateSchema(messages, currentPrompt);


      let parsed: unknown;
      try {
        parsed = JSON.parse(rawResponse);
      } catch {
        lastErrors = [`Invalid JSON: ${rawResponse.substring(0, 200)}`];
        logger.warn(`Attempt ${attempt + 1}: JSON parse failed`);
        continue;
      }


      if (isClarificationResponse(parsed)) {
        return { clarification: { questions: (parsed as { questions: string[] }).questions } };
      }


      const validation = validateSchema(parsed);
      if (validation.valid) {
        logger.info(`Schema generated successfully on attempt ${attempt + 1}`);
        return { schema: parsed as JSONSchema };
      }

      lastErrors = validation.errors;
      logger.warn(`Attempt ${attempt + 1}: Schema validation failed`, {
        errors: validation.errors,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastErrors = [`Provider error: ${message}`];
      logger.error(`Attempt ${attempt + 1}: Provider error`, { error: message });
    }
  }


  throw new Error('Failed to generate valid schema after multiple attempts.');
}

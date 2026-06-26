import {
  GenerateRequest,
  GenerateResponse,
  ConversationMessage,
  JSONSchema,
} from '../types';
import { conversationStore } from '../storage/memory.store';
import { getProvider } from '../providers/factory';
import { MockProvider } from '../providers/mock.provider';
import { SYSTEM_PROMPT, getEvolutionPrompt } from '../conversation/prompts';
import { generateWithRetry } from './retry.service';
import { computeSchemaDiff, mergeSchemas } from '../utils/schemaDiff';
import { sanitizePromptInput } from '../utils/sanitizer';
import { logger } from '../utils/logger';
import { AppError } from '../middlewares/errorHandler';





export async function generateForm(
  request: GenerateRequest,
): Promise<GenerateResponse> {
  const { prompt, conversationId, mock_llm_failure } = request;


  const { sanitized, injectionDetected } = sanitizePromptInput(prompt);
  if (injectionDetected) {
    logger.warn('Prompt injection attempt detected', { prompt: prompt.substring(0, 100) });
  }


  let conversation = conversationId
    ? conversationStore.get(conversationId)
    : undefined;

  if (conversationId && !conversation) {
    throw new AppError(404, `Conversation ${conversationId} not found`);
  }

  if (!conversation) {
    conversation = conversationStore.create();
  }

  const convId = conversation.conversationId;


  const userMessage: ConversationMessage = {
    role: 'user',
    content: sanitized,
    timestamp: new Date().toISOString(),
  };
  conversationStore.addMessage(convId, userMessage);


  const provider = getProvider();


  if (mock_llm_failure && provider instanceof MockProvider) {
    (provider as MockProvider).setFailure(true);
  }

  try {

    let systemPrompt = SYSTEM_PROMPT;
    const existingSchema = conversationStore.getCurrentSchema(convId);
    if (existingSchema) {
      systemPrompt += '\n\n' + getEvolutionPrompt(JSON.stringify(existingSchema, null, 2));
    }


    const result = await generateWithRetry(
      provider,
      conversation.messages,
      systemPrompt,
    );


    if ('clarification' in result) {
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: JSON.stringify({
          status: 'clarification_needed',
          questions: result.clarification.questions,
        }),
        timestamp: new Date().toISOString(),
      };
      conversationStore.addMessage(convId, assistantMessage);

      return {
        status: 'clarification_needed',
        conversationId: convId,
        questions: result.clarification.questions,
      };
    }


    let finalSchema: JSONSchema = result.schema;


    if (!finalSchema.$schema) {
      finalSchema.$schema = 'http://json-schema.org/draft-07/schema#';
    }


    if (existingSchema) {
      finalSchema = mergeSchemas(existingSchema, finalSchema);
    }


    const previousSchema = existingSchema;
    const previousVersion = conversation.currentVersion;


    const newVersion = conversationStore.addSchemaVersion(convId, finalSchema, sanitized);


    const assistantMessage: ConversationMessage = {
      role: 'assistant',
      content: JSON.stringify(finalSchema),
      timestamp: new Date().toISOString(),
    };
    conversationStore.addMessage(convId, assistantMessage);


    const response: GenerateResponse = {
      status: 'success',
      conversationId: convId,
      version: newVersion,
      schema: finalSchema,
    };


    if (previousSchema) {
      (response as any).previousSchema = previousSchema;
      (response as any).diff = computeSchemaDiff(
        previousSchema,
        finalSchema,
        previousVersion,
        newVersion,
      );
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Form generation failed', { conversationId: convId, error: message });
    throw new AppError(500, message);
  } finally {

    if (mock_llm_failure && provider instanceof MockProvider) {
      (provider as MockProvider).setFailure(false);
    }
  }
}

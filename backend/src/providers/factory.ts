import { IAIProvider } from '../types';
import { config } from '../config';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { AnthropicProvider } from './anthropic.provider';
import { MockProvider } from './mock.provider';
import { logger } from '../utils/logger';





export function createProvider(): IAIProvider {
  const providerName = config.AI_PROVIDER;

  logger.info(`Initializing AI provider: ${providerName}`);

  switch (providerName) {
    case 'openai':
      return new OpenAIProvider();
    case 'gemini':
      return new GeminiProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'mock':
      return new MockProvider();
    default:
      logger.warn(`Unknown provider "${providerName}", falling back to mock`);
      return new MockProvider();
  }
}


let providerInstance: IAIProvider | null = null;





export function getProvider(): IAIProvider {
  if (!providerInstance) {
    providerInstance = createProvider();
  }
  return providerInstance;
}




export function resetProvider(): void {
  providerInstance = null;
}

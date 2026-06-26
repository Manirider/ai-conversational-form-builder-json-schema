




export type AIProviderType = 'openai' | 'gemini' | 'anthropic' | 'mock';


export type MessageRole = 'user' | 'assistant' | 'system';


export type ResponseStatus = 'success' | 'clarification_needed' | 'error';






export interface ConversationMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
}


export interface SchemaVersion {
  version: number;
  schema: JSONSchema;
  timestamp: string;
  prompt: string;
}


export interface FormSubmission {
  id: string;
  data: Record<string, unknown>;
  timestamp: string;
}


export interface ConversationState {
  conversationId: string;
  messages: ConversationMessage[];
  schemaVersions: SchemaVersion[];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  submissions?: FormSubmission[];
}






export interface JSONSchema {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  type?: string | string[];
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  definitions?: Record<string, JSONSchema>;
  items?: JSONSchema | JSONSchema[];
  additionalProperties?: boolean | JSONSchema;
  [key: string]: unknown;
}


export interface JSONSchemaProperty {
  type?: string | string[];
  title?: string;
  description?: string;
  format?: string;
  enum?: unknown[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: JSONSchema | JSONSchema[];
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  oneOf?: JSONSchemaProperty[];
  anyOf?: JSONSchemaProperty[];
  allOf?: JSONSchemaProperty[];
  $ref?: string;

  'x-show-when'?: {
    field: string;
    value?: unknown;
    equals?: unknown;
  };
  [key: string]: unknown;
}






export interface GenerateRequest {
  prompt: string;
  conversationId?: string;
  mock_llm_failure?: boolean;
}


export interface GenerateSuccessResponse {
  status: 'success';
  conversationId: string;
  version: number;
  schema: JSONSchema;
  previousSchema?: JSONSchema;
  diff?: SchemaDiff;
}


export interface ClarificationResponse {
  status: 'clarification_needed';
  conversationId: string;
  questions: string[];
}


export type GenerateResponse = GenerateSuccessResponse | ClarificationResponse;


export interface ErrorResponse {
  error: string;
  details?: string;
}






export type DiffChangeType = 'added' | 'removed' | 'modified';


export interface DiffChange {
  field: string;
  type: DiffChangeType;
  oldValue?: unknown;
  newValue?: unknown;
}


export interface SchemaDiff {
  changes: DiffChange[];
  fromVersion: number;
  toVersion: number;
}






export interface IAIProvider {
  readonly name: string;
  generateSchema(
    messages: ConversationMessage[],
    systemPrompt: string,
  ): Promise<string>;
}






export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  version: string;
  provider: string;
}





export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'sent' | 'error';
export type ResponseStatus = 'success' | 'clarification_needed' | 'error';


export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status: MessageStatus;

  questions?: string[];

  isSchema?: boolean;
}


export interface JSONSchema {
  $schema?: string;
  title?: string;
  description?: string;
  type?: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  definitions?: Record<string, JSONSchema>;
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
  items?: JSONSchema;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  'x-show-when'?: {
    field: string;
    value?: unknown;
    equals?: unknown;
  };
  'x-ui-widget'?: string;
  [key: string]: unknown;
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

export interface ErrorResponse {
  error: string;
  details?: string;
}

export type GenerateResponse = GenerateSuccessResponse | ClarificationResponse;


export interface FormSubmission {
  id: string;
  data: Record<string, unknown>;
  timestamp: string;
}


export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  version: number;
  messageCount: number;
}

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ConversationState, ConversationMessage, SchemaVersion, JSONSchema, FormSubmission } from '../types';
import { logger } from '../utils/logger';





class ConversationStore {
  private conversations = new Map<string, ConversationState>();
  private dataFilePath = path.join(
    process.cwd(),
    'data',
    process.env.NODE_ENV === 'test'
      ? `conversations_test_${uuidv4()}.json`
      : 'conversations.json'
  );
  private persistPromise: Promise<void> = Promise.resolve();

  constructor() {
    this.init();
  }





  private init(): void {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dataFilePath)) {
        const fileContent = fs.readFileSync(this.dataFilePath, 'utf8');
        const data = JSON.parse(fileContent) as [string, ConversationState][];
        this.conversations = new Map(data);
        logger.info(`Loaded ${this.conversations.size} conversations from persistent storage`, { path: this.dataFilePath });
      }
    } catch (error) {
      logger.error('Failed to load conversations from disk, checking backup', {
        error: error instanceof Error ? error.message : String(error),
      });


      const backupPath = `${this.dataFilePath}.bak`;
      if (fs.existsSync(backupPath)) {
        try {
          const fileContent = fs.readFileSync(backupPath, 'utf8');
          const data = JSON.parse(fileContent) as [string, ConversationState][];
          this.conversations = new Map(data);
          logger.info(`Recovered ${this.conversations.size} conversations from backup`, { path: backupPath });
        } catch (backupError) {
          logger.error('Failed to recover from backup, starting fresh', {
            error: backupError instanceof Error ? backupError.message : String(backupError),
          });
        }
      }
    }
  }





  private async persist(): Promise<void> {
    this.persistPromise = this.persistPromise.then(async () => {
      try {
        const tempPath = `${this.dataFilePath}.tmp`;
        const backupPath = `${this.dataFilePath}.bak`;
        const serialized = JSON.stringify(Array.from(this.conversations.entries()), null, 2);


        await fs.promises.writeFile(tempPath, serialized, 'utf8');


        if (fs.existsSync(this.dataFilePath)) {
          await fs.promises.copyFile(this.dataFilePath, backupPath);
        }


        try {
          await fs.promises.rename(tempPath, this.dataFilePath);
        } catch (renameError) {

          await fs.promises.copyFile(tempPath, this.dataFilePath);
          await fs.promises.unlink(tempPath);
        }
      } catch (error) {
        logger.error('Failed to persist conversations state to disk', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
    return this.persistPromise;
  }




  create(): ConversationState {
    const conversationId = uuidv4();
    const now = new Date().toISOString();

    const state: ConversationState = {
      conversationId,
      messages: [],
      schemaVersions: [],
      currentVersion: 0,
      createdAt: now,
      updatedAt: now,
      submissions: [],
    };

    this.conversations.set(conversationId, state);
    logger.debug('Created conversation', { conversationId });
    this.persist();
    return state;
  }




  get(conversationId: string): ConversationState | undefined {
    return this.conversations.get(conversationId);
  }




  getAll(): ConversationState[] {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }




  delete(conversationId: string): boolean {
    const deleted = this.conversations.delete(conversationId);
    if (deleted) {
      logger.debug('Deleted conversation', { conversationId });
      this.persist();
    }
    return deleted;
  }




  addMessage(conversationId: string, message: ConversationMessage): void {
    const state = this.conversations.get(conversationId);
    if (!state) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    state.messages.push(message);
    state.updatedAt = new Date().toISOString();
    this.persist();
  }





  addSchemaVersion(
    conversationId: string,
    schema: JSONSchema,
    prompt: string,
  ): number {
    const state = this.conversations.get(conversationId);
    if (!state) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const version = state.currentVersion + 1;
    const schemaVersion: SchemaVersion = {
      version,
      schema,
      timestamp: new Date().toISOString(),
      prompt,
    };

    state.schemaVersions.push(schemaVersion);
    state.currentVersion = version;
    state.updatedAt = new Date().toISOString();

    logger.debug('Added schema version', { conversationId, version });
    this.persist();
    return version;
  }




  getCurrentSchema(conversationId: string): JSONSchema | undefined {
    const state = this.conversations.get(conversationId);
    if (!state || state.schemaVersions.length === 0) {
      return undefined;
    }

    return state.schemaVersions[state.schemaVersions.length - 1].schema;
  }




  getPreviousSchema(conversationId: string): JSONSchema | undefined {
    const state = this.conversations.get(conversationId);
    if (!state || state.schemaVersions.length < 2) {
      return undefined;
    }

    return state.schemaVersions[state.schemaVersions.length - 2].schema;
  }




  addSubmission(conversationId: string, data: Record<string, unknown>): FormSubmission {
    const state = this.conversations.get(conversationId);
    if (!state) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const submission: FormSubmission = {
      id: uuidv4(),
      data,
      timestamp: new Date().toISOString(),
    };

    if (!state.submissions) {
      state.submissions = [];
    }
    state.submissions.push(submission);
    state.updatedAt = new Date().toISOString();

    logger.debug('Added submission to conversation', { conversationId, submissionId: submission.id });
    this.persist();
    return submission;
  }




  getSubmissions(conversationId: string): FormSubmission[] {
    const state = this.conversations.get(conversationId);
    if (!state) {
      return [];
    }
    return state.submissions || [];
  }




  clear(): void {
    this.conversations.clear();
    this.persist();
  }
}


export const conversationStore = new ConversationStore();


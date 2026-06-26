import { create } from 'zustand';
import {
  ChatMessage,
  JSONSchema,
  SchemaDiff,
  GenerateSuccessResponse,
  ClarificationResponse,
  ConversationSummary,
  FormSubmission,
} from '../types';
import {
  generateForm,
  getConversations,
  getConversation,
  deleteConversation,
  submitFormData,
  getSubmissions,
} from '../services/api';


let messageIdCounter = 0;
function generateId(): string {
  return `msg_${Date.now()}_${++messageIdCounter}`;
}


function computeSchemaDiff(
  oldSchema: JSONSchema | undefined,
  newSchema: JSONSchema,
  fromVersion: number,
  toVersion: number,
): SchemaDiff {
  const changes: SchemaDiff['changes'] = [];

  const oldProps = oldSchema?.properties || {};
  const newProps = newSchema.properties || {};
  const oldRequired = new Set(oldSchema?.required || []);
  const newRequired = new Set(newSchema.required || []);


  for (const field of Object.keys(newProps)) {
    if (!(field in oldProps)) {
      changes.push({
        field,
        type: 'added',
        newValue: newProps[field],
      });
    }
  }


  for (const field of Object.keys(oldProps)) {
    if (!(field in newProps)) {
      changes.push({
        field,
        type: 'removed',
        oldValue: oldProps[field],
      });
    }
  }


  for (const field of Object.keys(newProps)) {
    if (field in oldProps) {
      const oldProp = JSON.stringify(oldProps[field]);
      const newProp = JSON.stringify(newProps[field]);
      const requiredChanged = oldRequired.has(field) !== newRequired.has(field);

      if (oldProp !== newProp || requiredChanged) {
        changes.push({
          field,
          type: 'modified',
          oldValue: oldProps[field],
          newValue: newProps[field],
        });
      }
    }
  }

  return { changes, fromVersion, toVersion };
}


export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}


interface FormState {

  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;


  currentSchema: JSONSchema | null;
  previousSchema: JSONSchema | null;
  schemaVersion: number;
  diff: SchemaDiff | null;


  darkMode: boolean;
  toasts: Toast[];
  activePanel: 'renderer' | 'diff' | 'export' | 'submissions';
  sidebarOpen: boolean;


  conversationsList: ConversationSummary[];
  submissions: FormSubmission[];


  sendMessage: (prompt: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  toggleDarkMode: () => void;
  setActivePanel: (panel: 'renderer' | 'diff' | 'export' | 'submissions') => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  resetConversation: () => void;


  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  submitForm: (data: Record<string, unknown>) => Promise<void>;
  loadSubmissions: () => Promise<void>;
}

export const useFormStore = create<FormState>((set, get) => ({

  messages: [],
  conversationId: null,
  isLoading: false,
  currentSchema: null,
  previousSchema: null,
  schemaVersion: 0,
  diff: null,
  darkMode: true,
  toasts: [],
  activePanel: 'renderer',
  sidebarOpen: true, 
  conversationsList: [],
  submissions: [],



  sendMessage: async (prompt: string) => {
    const { conversationId, messages } = get();


    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    set({ messages: [...messages, userMessage], isLoading: true });

    try {
      const response = await generateForm(prompt, conversationId || undefined);

      if (response.status === 'clarification_needed') {
        const clarification = response as ClarificationResponse;
        const aiMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: 'I need some more details to build the right form for you:',
          timestamp: new Date().toISOString(),
          status: 'sent',
          questions: clarification.questions,
        };

        set((state) => ({
          messages: [...state.messages, aiMessage],
          conversationId: clarification.conversationId,
          isLoading: false,
        }));


        await get().loadConversations();
      } else {
        const success = response as GenerateSuccessResponse;
        const aiMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: `✅ Generated **${success.schema.title || 'Form'}** (v${success.version})\n\n${success.schema.description || ''}`,
          timestamp: new Date().toISOString(),
          status: 'sent',
          isSchema: true,
        };

        set((state) => ({
          messages: [...state.messages, aiMessage],
          conversationId: success.conversationId,
          currentSchema: success.schema,
          previousSchema: success.previousSchema || state.previousSchema,
          schemaVersion: success.version,
          diff: success.diff || null,
          isLoading: false,
          activePanel: 'renderer',
        }));

        get().addToast('success', `Schema v${success.version} generated successfully`);


        await get().loadConversations();


        await get().loadSubmissions();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';

      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `❌ Error: ${message}`,
        timestamp: new Date().toISOString(),
        status: 'error',
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));

      get().addToast('error', message);
    }
  },

  retryLastMessage: async () => {
    const { messages } = get();
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {

      const filtered = messages.filter(
        (m) => m.status !== 'error' || m.id !== messages[messages.length - 1]?.id,
      );
      set({ messages: filtered });
      await get().sendMessage(lastUserMessage.content);
    }
  },

  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.darkMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: newMode };
    });
  },

  setActivePanel: (panel) => set({ activePanel: panel }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (type, message) => {
    const id = `toast_${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  resetConversation: () => {
    set({
      messages: [],
      conversationId: null,
      currentSchema: null,
      previousSchema: null,
      schemaVersion: 0,
      diff: null,
      submissions: [],
      activePanel: 'renderer',
    });
  },



  loadConversations: async () => {
    try {
      const list = await getConversations();
      set({ conversationsList: list });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load conversations';
      get().addToast('error', message);
    }
  },

  loadConversation: async (id) => {
    set({ isLoading: true });
    try {
      const conv = await getConversation(id);


      let schemaMsgIndex = 0;
      const mappedMessages: ChatMessage[] = conv.messages.map((msg: any, index: number) => {
        const isUser = msg.role === 'user';
        if (isUser) {
          return {
            id: `msg_${index}_${Date.now()}`,
            role: 'user',
            content: msg.content,
            timestamp: msg.timestamp,
            status: 'sent',
          };
        }

        try {
          const parsed = JSON.parse(msg.content);
          if (parsed && typeof parsed === 'object') {
            if (parsed.status === 'clarification_needed') {
              return {
                id: `msg_${index}_${Date.now()}`,
                role: 'assistant',
                content: 'I need some more details to build the right form for you:',
                timestamp: msg.timestamp,
                status: 'sent',
                questions: parsed.questions,
              };
            }


            const schemaVer = conv.schemaVersions[schemaMsgIndex];
            schemaMsgIndex++;

            const title = parsed.title || schemaVer?.schema.title || 'Form';
            const version = schemaVer?.version || schemaMsgIndex;
            const description = parsed.description || schemaVer?.schema.description || '';

            return {
              id: `msg_${index}_${Date.now()}`,
              role: 'assistant',
              content: `✅ Generated **${title}** (v${version})\n\n${description}`,
              timestamp: msg.timestamp,
              status: 'sent',
              isSchema: true,
            };
          }
        } catch (e) {

        }

        return {
          id: `msg_${index}_${Date.now()}`,
          role: 'assistant',
          content: msg.content,
          timestamp: msg.timestamp,
          status: 'sent',
        };
      });

      const schemaVersions = conv.schemaVersions || [];
      const currentSchema = schemaVersions.length > 0 ? schemaVersions[schemaVersions.length - 1].schema : null;
      const previousSchema = schemaVersions.length > 1 ? schemaVersions[schemaVersions.length - 2].schema : null;
      const schemaVersion = conv.currentVersion || schemaVersions.length;

      let diffVal = null;
      if (currentSchema && previousSchema) {
        diffVal = computeSchemaDiff(
          previousSchema,
          currentSchema,
          schemaVersion - 1,
          schemaVersion
        );
      }

      set({
        conversationId: conv.conversationId,
        messages: mappedMessages,
        currentSchema,
        previousSchema,
        schemaVersion,
        diff: diffVal,
        isLoading: false,
        activePanel: 'renderer',
      });


      await get().loadSubmissions();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load conversation';
      set({ isLoading: false });
      get().addToast('error', message);
    }
  },

  deleteConversation: async (id) => {
    try {
      await deleteConversation(id);
      get().addToast('success', 'Conversation deleted successfully');

      const { conversationId } = get();
      if (conversationId === id) {
        get().resetConversation();
      }

      await get().loadConversations();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete conversation';
      get().addToast('error', message);
    }
  },

  submitForm: async (data) => {
    const { conversationId } = get();
    if (!conversationId) {
      get().addToast('error', 'No active conversation found to submit form responses');
      return;
    }

    try {
      const res = await submitFormData(conversationId, data);
      get().addToast('success', 'Form submitted successfully');

            set((state) => ({
        submissions: [...state.submissions, res.submission]
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit form responses';
      get().addToast('error', message);
    }
  },

  loadSubmissions: async () => {
    const { conversationId } = get();
    if (!conversationId) {
      set({ submissions: [] });
      return;
    }

    try {
      const list = await getSubmissions(conversationId);
      set({ submissions: list });
    } catch (error) {

      console.error('Failed to load submissions', error);
      set({ submissions: [] });
    }
  },
}));

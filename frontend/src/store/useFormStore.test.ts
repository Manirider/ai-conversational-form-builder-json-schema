import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFormStore } from './useFormStore';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  generateForm: vi.fn(),
  checkHealth: vi.fn(),
  getConversations: vi.fn(),
  getConversation: vi.fn(),
  deleteConversation: vi.fn(),
  submitFormData: vi.fn(),
  getSubmissions: vi.fn(),
}));

describe('useFormStore', () => {
  beforeEach(() => {
    useFormStore.getState().resetConversation();
    useFormStore.setState({
      toasts: [],
      conversationsList: [],
      submissions: [],
      sidebarOpen: true,
    });
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const state = useFormStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.conversationId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.currentSchema).toBeNull();
    expect(state.previousSchema).toBeNull();
    expect(state.schemaVersion).toBe(0);
    expect(state.diff).toBeNull();
    expect(state.darkMode).toBe(true);
    expect(state.toasts).toEqual([]);
    expect(state.activePanel).toBe('renderer');
    expect(state.sidebarOpen).toBe(true);
    expect(state.conversationsList).toEqual([]);
    expect(state.submissions).toEqual([]);
  });

  it('toggles dark mode', () => {
    const classListAdd = vi.fn();
    const classListRemove = vi.fn();
    Object.defineProperty(globalThis, 'document', {
      value: {
        documentElement: {
          classList: {
            add: classListAdd,
            remove: classListRemove,
          },
        },
      },
      writable: true,
    });

    const store = useFormStore.getState();
    expect(store.darkMode).toBe(true);

    store.toggleDarkMode();
    expect(useFormStore.getState().darkMode).toBe(false);
    expect(classListRemove).toHaveBeenCalledWith('dark');

    store.toggleDarkMode();
    expect(useFormStore.getState().darkMode).toBe(true);
    expect(classListAdd).toHaveBeenCalledWith('dark');
  });

  it('sets active panel', () => {
    const store = useFormStore.getState();
    store.setActivePanel('diff');
    expect(useFormStore.getState().activePanel).toBe('diff');
  });

  it('toggles sidebar state', () => {
    const store = useFormStore.getState();
    expect(store.sidebarOpen).toBe(true);
    store.setSidebarOpen(false);
    expect(useFormStore.getState().sidebarOpen).toBe(false);
  });

  it('adds and removes toast messages', () => {
    const store = useFormStore.getState();
    store.addToast('success', 'Form updated successfully');

        let toasts = useFormStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Form updated successfully');

    const id = toasts[0].id;
    store.removeToast(id);
    expect(useFormStore.getState().toasts).toHaveLength(0);
  });

  it('sends message successfully and updates state', async () => {
    const mockSuccessResponse = {
      status: 'success',
      conversationId: 'conv_123',
      version: 1,
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Signup Form',
        type: 'object',
        properties: { name: { type: 'string' } },
      },
      previousSchema: null,
      diff: null,
    };

    vi.mocked(api.generateForm).mockResolvedValue(mockSuccessResponse as any);
    vi.mocked(api.getConversations).mockResolvedValue([]);
    vi.mocked(api.getSubmissions).mockResolvedValue([]);

    const store = useFormStore.getState();
    await store.sendMessage('Create a signup form');

    const state = useFormStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.conversationId).toBe('conv_123');
    expect(state.schemaVersion).toBe(1);
    expect(state.currentSchema).toEqual(mockSuccessResponse.schema);
    expect(state.messages).toHaveLength(2); 
    expect(state.messages[0].role).toBe('user');
    expect(state.messages[1].role).toBe('assistant');
    expect(state.messages[1].isSchema).toBe(true);
    expect(api.getConversations).toHaveBeenCalled();
  });

  it('handles clarification response from API', async () => {
    const mockClarificationResponse = {
      status: 'clarification_needed',
      conversationId: 'conv_123',
      questions: ['What input fields do you need?'],
    };

    vi.mocked(api.generateForm).mockResolvedValue(mockClarificationResponse as any);
    vi.mocked(api.getConversations).mockResolvedValue([]);

    const store = useFormStore.getState();
    await store.sendMessage('Create form');

    const state = useFormStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.conversationId).toBe('conv_123');
    expect(state.messages).toHaveLength(2);
    expect(state.messages[1].questions).toEqual(['What input fields do you need?']);
    expect(api.getConversations).toHaveBeenCalled();
  });

  it('handles API errors elegantly', async () => {
    vi.mocked(api.generateForm).mockRejectedValue(new Error('Backend error'));

    const store = useFormStore.getState();
    await store.sendMessage('Create form');

    const state = useFormStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.messages).toHaveLength(2);
    expect(state.messages[1].status).toBe('error');
    expect(state.messages[1].content).toContain('Backend error');
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].type).toBe('error');
  });

  it('loads conversations list successfully', async () => {
    const mockList = [
      { id: '1', title: 'Form A', updatedAt: '2026-06-23', createdAt: '2026-06-23', version: 1, messageCount: 2 },
    ];
    vi.mocked(api.getConversations).mockResolvedValue(mockList);

    const store = useFormStore.getState();
    await store.loadConversations();

    expect(useFormStore.getState().conversationsList).toEqual(mockList);
  });

  it('loads detailed conversation successfully and maps messages', async () => {
    const mockDetails = {
      conversationId: 'conv_123',
      currentVersion: 2,
      createdAt: '2026-06-23T12:00:00Z',
      updatedAt: '2026-06-23T12:10:00Z',
      messages: [
        { role: 'user', content: 'Create a login form', timestamp: '2026-06-23T12:00:00Z' },
        { role: 'assistant', content: JSON.stringify({ title: 'Login Form', description: 'Enter details' }), timestamp: '2026-06-23T12:00:05Z' },
      ],
      schemaVersions: [
        { version: 1, schema: { type: 'object', title: 'Login Form', description: 'Enter details' }, timestamp: '2026-06-23T12:00:05Z' },
      ],
    };

    vi.mocked(api.getConversation).mockResolvedValue(mockDetails);
    vi.mocked(api.getSubmissions).mockResolvedValue([]);

    const store = useFormStore.getState();
    await store.loadConversation('conv_123');

    const state = useFormStore.getState();
    expect(state.conversationId).toBe('conv_123');
    expect(state.messages).toHaveLength(2);
    expect(state.messages[0].role).toBe('user');
    expect(state.messages[1].role).toBe('assistant');
    expect(state.messages[1].isSchema).toBe(true);
    expect(state.messages[1].content).toContain('✅ Generated **Login Form** (v1)');
    expect(state.currentSchema).toEqual(mockDetails.schemaVersions[0].schema);
    expect(api.getSubmissions).toHaveBeenCalledWith('conv_123');
  });

  it('deletes conversation successfully and resets if matches active conversation', async () => {
    vi.mocked(api.deleteConversation).mockResolvedValue({ status: 'success' });
    vi.mocked(api.getConversations).mockResolvedValue([]);

    useFormStore.setState({ conversationId: 'conv_123' });

    const store = useFormStore.getState();
    await store.deleteConversation('conv_123');

    expect(useFormStore.getState().conversationId).toBeNull();
    expect(api.deleteConversation).toHaveBeenCalledWith('conv_123');
    expect(api.getConversations).toHaveBeenCalled();
  });

  it('submits form responses successfully', async () => {
    const mockSubmission = { id: 'sub_1', data: { name: 'Alice' }, timestamp: '2026-06-23' };
    vi.mocked(api.submitFormData).mockResolvedValue({ status: 'success', submission: mockSubmission });

        useFormStore.setState({ conversationId: 'conv_123' });

    const store = useFormStore.getState();
    await store.submitForm({ name: 'Alice' });

    expect(useFormStore.getState().submissions).toHaveLength(1);
    expect(useFormStore.getState().submissions[0]).toEqual(mockSubmission);
  });
});

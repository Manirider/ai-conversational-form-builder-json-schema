import { GenerateResponse, ErrorResponse, ConversationSummary, FormSubmission } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/form` : '/api/form';




export async function generateForm(
  prompt: string,
  conversationId?: string,
  mockFailure?: boolean,
): Promise<GenerateResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const body: Record<string, unknown> = { prompt };
    if (conversationId) body.conversationId = conversationId;
    if (mockFailure) body.mock_llm_failure = true;

    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        error: `Request failed with status ${response.status}`,
      }));
      throw new Error(errorData.error);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}




export async function checkHealth(): Promise<{
  status: string;
  provider: string;
}> {
  const response = await fetch('/health');
  return response.json();
}




export async function getConversations(): Promise<ConversationSummary[]> {
  const response = await fetch(`${API_BASE}/conversations`);
  if (!response.ok) {
    throw new Error('Failed to load conversations list');
  }
  return response.json();
}




export async function getConversation(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/conversations/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load conversation details');
  }
  return response.json();
}




export async function deleteConversation(id: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete conversation');
  }
  return response.json();
}




export async function submitFormData(
  id: string,
  data: Record<string, unknown>,
): Promise<{ status: string; submission: FormSubmission }> {
  const response = await fetch(`${API_BASE}/conversations/${id}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to submit form responses');
  }
  return response.json();
}




export async function getSubmissions(id: string): Promise<FormSubmission[]> {
  const response = await fetch(`${API_BASE}/conversations/${id}/submissions`);
  if (!response.ok) {
    throw new Error('Failed to load submissions list');
  }
  return response.json();
}

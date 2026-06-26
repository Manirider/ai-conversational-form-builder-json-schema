import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ChatPanel from '../ChatPanel';
import { useFormStore } from '../../store/useFormStore';

vi.mock('../../store/useFormStore', () => ({
  useFormStore: vi.fn(),
}));

describe('ChatPanel Component', () => {
  const mockSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders initial state with suggestions when there are no messages', () => {
    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        messages: [],
        isLoading: false,
        sendMessage: mockSendMessage,
      };
      return selector(state);
    });

    render(<ChatPanel />);
    
    expect(screen.getByTestId('chat-pane')).toBeInTheDocument();
    expect(screen.getByText('Describe your form')).toBeInTheDocument();
    expect(screen.getByText('Create a user registration form with name, email, and password')).toBeInTheDocument();
  });

  it('renders messages and handles user input submission', () => {
    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        messages: [
          { id: '1', role: 'user', content: 'hello', timestamp: new Date().toISOString(), status: 'sent' },
          { id: '2', role: 'assistant', content: 'how can I help?', timestamp: new Date().toISOString(), status: 'sent' }
        ],
        isLoading: false,
        sendMessage: mockSendMessage,
      };
      return selector(state);
    });

    render(<ChatPanel />);

    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('how can I help?')).toBeInTheDocument();

    const textarea = screen.getByTestId('chat-input');
    fireEvent.change(textarea, { target: { value: 'build a new form' } });
    
    const sendButton = screen.getByTitle('Send message');
    fireEvent.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith('build a new form');
  });

  it('shows typing indicator when loading', () => {
    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        messages: [
          { id: '1', role: 'user', content: 'hello', timestamp: new Date().toISOString(), status: 'sent' }
        ],
        isLoading: true,
        sendMessage: mockSendMessage,
      };
      return selector(state);
    });

    render(<ChatPanel />);
    expect(screen.getByText('Generating schema...')).toBeInTheDocument();
  });
});

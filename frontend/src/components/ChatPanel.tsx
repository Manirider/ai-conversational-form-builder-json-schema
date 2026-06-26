import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Wand2 } from 'lucide-react';
import { useFormStore } from '../store/useFormStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const SUGGESTIONS = [
  'Create a user registration form with name, email, and password',
  'Build a contact form with subject dropdown and message',
  'Make a customer feedback survey with rating and comments',
  'Make a form for booking a meeting room',
];


const ChatPanel: React.FC = () => {
  const messages = useFormStore((s) => s.messages);
  const isLoading = useFormStore((s) => s.isLoading);
  const sendMessage = useFormStore((s) => s.sendMessage);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      setInput('');
      await sendMessage(trimmed);
      inputRef.current?.focus();
    },
    [input, isLoading, sendMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (isLoading) return;
      sendMessage(suggestion);
    },
    [isLoading, sendMessage],
  );

  return (
    <div data-testid="chat-pane" className="flex flex-col h-full">
      {}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-brand-500/20">
              <Wand2 className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-xl font-semibold text-surface-100 mb-2">
              Describe your form
            </h2>
            <p className="text-sm text-surface-400 mb-6 max-w-sm">
              Tell me what kind of form you need and I'll generate it with a valid JSON Schema.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left px-4 py-3 glass-panel-subtle hover:bg-surface-700/50 
                             text-sm text-surface-300 hover:text-surface-100 transition-all duration-200
                             cursor-pointer group"
                >
                  <span className="text-brand-400 mr-2">→</span>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {}
      <form
        onSubmit={handleSubmit}
        className="border-t border-surface-700/50 p-4"
      >
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              data-testid="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your form..."
              disabled={isLoading}
              rows={1}
              className="input-field resize-none pr-12 min-h-[48px] max-h-[120px]"
              style={{ height: 'auto', overflow: 'hidden' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary p-3 flex-shrink-0"
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(ChatPanel);

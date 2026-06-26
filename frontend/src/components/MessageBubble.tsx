import React from 'react';
import { User, Bot, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import { useFormStore } from '../store/useFormStore';

interface Props {
  message: ChatMessage;
}


const MessageBubble: React.FC<Props> = ({ message }) => {
  const retryLastMessage = useFormStore((s) => s.retryLastMessage);
  const sendMessage = useFormStore((s) => s.sendMessage);
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-brand-500/20 text-brand-400'
            : isError
              ? 'bg-red-500/20 text-red-400'
              : 'bg-emerald-500/20 text-emerald-400'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block px-4 py-3 rounded-xl text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-600 text-white rounded-tr-sm'
              : isError
                ? 'glass-panel-subtle border-red-500/30 text-red-300 rounded-tl-sm'
                : 'glass-panel-subtle rounded-tl-sm'
          }`}
        >
          {}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {}
          {message.questions && message.questions.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.questions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(question)}
                  className="block w-full text-left px-3 py-2 rounded-lg 
                             bg-surface-700/50 hover:bg-surface-600/50 
                             text-surface-200 hover:text-white text-xs
                             transition-all duration-200 cursor-pointer border border-surface-600/30"
                >
                  <span className="text-brand-400 font-medium mr-2">{i + 1}.</span>
                  {question}
                </button>
              ))}
            </div>
          )}

          {}
          {isError && (
            <button
              onClick={retryLastMessage}
              className="mt-2 flex items-center gap-1.5 text-xs text-red-400 
                         hover:text-red-300 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>

        {}
        <div
          className={`text-xs text-surface-500 mt-1 ${isUser ? 'text-right' : ''}`}
        >
          {formatTime(message.timestamp)}
          {isError && (
            <span className="ml-2 text-red-400">
              <AlertCircle className="w-3 h-3 inline" /> Failed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MessageBubble);

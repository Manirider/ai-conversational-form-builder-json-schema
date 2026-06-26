import React from 'react';


const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
        <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse-soft" />
      </div>
      <div className="glass-panel-subtle px-4 py-3 rounded-xl rounded-tl-sm">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-surface-400 animate-bounce-dot"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-surface-400 animate-bounce-dot"
            style={{ animationDelay: '0.16s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-surface-400 animate-bounce-dot"
            style={{ animationDelay: '0.32s' }}
          />
        </div>
      </div>
      <span className="text-xs text-surface-500">Generating schema...</span>
    </div>
  );
};

export default React.memo(TypingIndicator);

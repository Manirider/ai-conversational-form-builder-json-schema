import React from 'react';
import { Moon, Sun, RotateCcw, Sparkles, PanelLeft } from 'lucide-react';
import { useFormStore } from '../store/useFormStore';


const Header: React.FC = () => {
  const darkMode = useFormStore((s) => s.darkMode);
  const toggleDarkMode = useFormStore((s) => s.toggleDarkMode);
  const resetConversation = useFormStore((s) => s.resetConversation);
  const conversationId = useFormStore((s) => s.conversationId);
  const sidebarOpen = useFormStore((s) => s.sidebarOpen);
  const setSidebarOpen = useFormStore((s) => s.setSidebarOpen);

  return (
    <header className="glass-panel border-b border-surface-700/50 px-6 py-3 flex items-center justify-between z-50">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800/80 transition-colors mr-1"
            title="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            <span className="gradient-text">AI Form Builder</span>
          </h1>
          <p className="text-xs text-surface-400 -mt-0.5">Conversational Schema Generator</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {conversationId && (
          <button
            onClick={resetConversation}
            className="btn-ghost text-sm flex items-center gap-1.5"
            title="New conversation"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
        <button
          onClick={toggleDarkMode}
          className="btn-ghost p-2"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

export default React.memo(Header);

import React, { useEffect } from 'react';
import { useFormStore } from '../store/useFormStore';
import { 
  Plus, 
  Trash2, 
  MessageSquare, 
  PanelLeftClose, 
  PanelLeft, 
  Calendar,
  Layers
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const sidebarOpen = useFormStore((s) => s.sidebarOpen);
  const setSidebarOpen = useFormStore((s) => s.setSidebarOpen);
  const conversationsList = useFormStore((s) => s.conversationsList);
  const conversationId = useFormStore((s) => s.conversationId);
  const loadConversations = useFormStore((s) => s.loadConversations);
  const loadConversation = useFormStore((s) => s.loadConversation);
  const deleteConversation = useFormStore((s) => s.deleteConversation);
  const resetConversation = useFormStore((s) => s.resetConversation);

  
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const handleNewChat = () => {
    resetConversation();
  };

  
  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside className="w-64 h-full bg-surface-900/90 backdrop-blur-md border-r border-surface-800/80 flex flex-col transition-all duration-300 relative flex-shrink-0">
      {}
      <div className="flex items-center justify-between p-4 border-b border-surface-800/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-sm text-surface-100 tracking-wide">
            Form History
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1.5 rounded-md text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold
                     bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/20
                     hover:border-brand-500/40 transition-all active:scale-[0.98] shadow-md shadow-brand-500/5"
        >
          <Plus className="w-4 h-4" />
          New Form Chat
        </button>
      </div>

      {}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin">
        <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-surface-500 uppercase">
          Recent Forms
        </div>
        {conversationsList.length === 0 ? (
          <div className="p-4 text-center text-xs text-surface-500 italic">
            No history yet
          </div>
        ) : (
          conversationsList.map((conv) => {
            const isActive = conversationId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                           ${
                             isActive
                               ? 'bg-surface-800/80 text-brand-300 border-l-2 border-brand-500'
                               : 'hover:bg-surface-800/40 text-surface-300'
                           }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-surface-500 group-hover:text-surface-400'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium truncate leading-tight flex-1">
                        {conv.title}
                      </p>
                      <span className="text-[9px] px-1 rounded bg-surface-700/60 text-surface-400 flex-shrink-0">
                        v{conv.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-surface-500">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatDate(conv.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this form history and all its saved data?')) {
                      deleteConversation(conv.id);
                    }
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-surface-700/80 hover:text-red-400 text-surface-500 transition-all duration-150"
                  title="Delete form history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {}
      <div className="p-4 border-t border-surface-800/80 text-[10px] text-surface-500 flex justify-between items-center bg-surface-950/20">
        <span>AI Builder v1.0.0</span>
        <span className="text-brand-400/80">Premium Active</span>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);

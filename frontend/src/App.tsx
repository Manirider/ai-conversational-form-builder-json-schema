import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import FormRenderer from './components/FormRenderer';
import SchemaDiff from './components/SchemaDiff';
import ExportPanel from './components/ExportPanel';
import SubmissionsPanel from './components/SubmissionsPanel';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import { useFormStore } from './store/useFormStore';
import { Eye, GitCompare, Package, Database } from 'lucide-react';


const App: React.FC = () => {
  const activePanel = useFormStore((s) => s.activePanel);
  const setActivePanel = useFormStore((s) => s.setActivePanel);
  const currentSchema = useFormStore((s) => s.currentSchema);
  const diff = useFormStore((s) => s.diff);
  const submissions = useFormStore((s) => s.submissions);

  
  const [splitPos, setSplitPos] = useState(45); 
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isResizing) return;
      const container = (e.currentTarget as HTMLElement);
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;
      setSplitPos(Math.max(25, Math.min(75, percent)));
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const panels = [
    { key: 'renderer' as const, label: 'Preview', icon: Eye },
    { key: 'diff' as const, label: 'Diff', icon: GitCompare, badge: diff?.changes.length },
    { key: 'export' as const, label: 'Export', icon: Package },
    { key: 'submissions' as const, label: 'Submissions', icon: Database, badge: submissions.length },
  ];

  return (
    <div className="h-screen flex flex-col bg-surface-950 overflow-hidden">
      <Header />

      <div
        className="flex-1 flex overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {}
        <Sidebar />

        {}
        <div
          className="h-full border-r border-surface-700/50 overflow-hidden flex flex-col"
          style={{ width: `${splitPos}%` }}
        >
          <ChatPanel />
        </div>

        {}
        <div
          className={`w-1.5 cursor-col-resize flex-shrink-0 transition-colors duration-150 hover:bg-brand-500/30 
                      ${isResizing ? 'bg-brand-500/40' : 'bg-surface-800'}`}
          onMouseDown={handleMouseDown}
        />

        {}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-surface-700/50 bg-surface-900/50">
            {panels.map((panel) => (
              <button
                key={panel.key}
                onClick={() => setActivePanel(panel.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-all duration-200 ${
                  activePanel === panel.key
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/30'
                }`}
              >
                <panel.icon className="w-3.5 h-3.5" />
                {panel.label}
                {panel.badge && panel.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-400">
                    {panel.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {}
          <div className="flex-1 overflow-hidden">
            {activePanel === 'renderer' && <FormRenderer />}
            {activePanel === 'diff' && <SchemaDiff />}
            {activePanel === 'export' && <ExportPanel />}
            {activePanel === 'submissions' && <SubmissionsPanel />}
          </div>
        </div>
      </div>

      {}
      <ToastContainer />
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { useFormStore } from '../store/useFormStore';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  FileCode,
  Info
} from 'lucide-react';

const SubmissionsPanel: React.FC = () => {
  const submissions = useFormStore((s) => s.submissions);
  const currentSchema = useFormStore((s) => s.currentSchema);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopyAll = () => {
    if (submissions.length === 0) return;
    navigator.clipboard.writeText(JSON.stringify(submissions, null, 2));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyOne = (index: number, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportJSON = () => {
    if (submissions.length === 0) return;
    const blob = new Blob([JSON.stringify(submissions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form_submissions_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  if (!currentSchema) {
    return (
      <div data-testid="submissions-panel" className="flex flex-col items-center justify-center h-full text-center px-4">
        <Database className="w-8 h-8 text-surface-600 mb-3" />
        <h3 className="text-sm text-surface-400 font-medium">No Form Generated Yet</h3>
        <p className="text-xs text-surface-500 mt-1">
          Chat with the AI on the left to build a form first.
        </p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div data-testid="submissions-panel" className="flex flex-col items-center justify-center h-full text-center px-4">
        <Database className="w-8 h-8 text-surface-600 mb-3" />
        <h3 className="text-sm text-surface-400 font-medium">No Submissions Yet</h3>
        <p className="text-xs text-surface-500 mt-1">
          Go to the **Preview** tab, fill out the form, and submit it to see results here.
        </p>
        <div className="mt-4 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-900 border border-surface-800 text-[11px] text-surface-400 max-w-xs text-left">
          <Info className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <span>Responses are saved locally and persist across page reloads.</span>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="submissions-panel" className="h-full flex flex-col overflow-hidden bg-surface-950">
      {}
      <div className="flex items-center justify-between p-4 border-b border-surface-800/80 bg-surface-900/30 flex-shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-surface-200">
            Form Submissions
          </h3>
          <p className="text-xs text-surface-500 mt-0.5">
            Collected {submissions.length} {submissions.length === 1 ? 'response' : 'responses'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-surface-700 hover:bg-surface-800 text-surface-300 transition-colors"
            title="Copy all submissions to clipboard"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy All
              </>
            )}
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-lg shadow-brand-500/10"
            title="Download JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {submissions.map((submission, index) => {
          const isExpanded = !!expandedIndices[index];
          const hasData = submission.data && Object.keys(submission.data).length > 0;
          
          return (
            <div
              key={submission.id}
              className="rounded-xl border border-surface-800 bg-surface-900/40 hover:bg-surface-900/60 transition-all duration-200 overflow-hidden"
            >
              {}
              <div 
                onClick={() => toggleExpand(index)}
                className="flex items-center justify-between p-3.5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-surface-800 text-brand-400 flex-shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-surface-200 font-mono truncate">
                        ID: {submission.id.substring(0, 8)}...
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium">
                        Submission #{submissions.length - index}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-surface-500">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{formatDate(submission.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyOne(index, submission.data);
                    }}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
                    title="Copy this response data"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-surface-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-400" />
                  )}
                </div>
              </div>

              {}
              {isExpanded && (
                <div className="border-t border-surface-800 bg-surface-950/40 p-4 space-y-4">
                  {}
                  {hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {Object.entries(submission.data).map(([key, val]) => {
                        let displayVal = '';
                        if (typeof val === 'object' && val !== null) {
                          displayVal = JSON.stringify(val);
                        } else {
                          displayVal = String(val);
                        }
                        
                        
                        const cleanKey = key
                          .replace(/[-_]+/g, ' ')
                          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

                        return (
                          <div 
                            key={key} 
                            className="p-2.5 rounded-lg bg-surface-900/60 border border-surface-800/60"
                          >
                            <span className="block text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                              {cleanKey}
                            </span>
                            <span className="block text-xs font-medium text-surface-200 mt-1 break-all">
                              {displayVal === 'true' && '✅ Yes'}
                              {displayVal === 'false' && '❌ No'}
                              {displayVal !== 'true' && displayVal !== 'false' && displayVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-surface-500 italic">No data values submitted</p>
                  )}

                  {}
                  <div className="rounded-lg border border-surface-800 bg-surface-950 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-900 border-b border-surface-800 text-[10px] font-semibold text-surface-400">
                      <FileCode className="w-3.5 h-3.5 text-brand-400" />
                      <span>RAW PAYLOAD JSON</span>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto bg-black/30">
                      {JSON.stringify(submission.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(SubmissionsPanel);

import React from 'react';
import { useFormStore } from '../store/useFormStore';
import { GitCompare, Plus, Minus, PenLine } from 'lucide-react';


const SchemaDiff: React.FC = () => {
  const diff = useFormStore((s) => s.diff);
  const schemaVersion = useFormStore((s) => s.schemaVersion);

  if (!diff || diff.changes.length === 0) {
    return (
      <div
        data-testid="schema-diff-panel"
        className="flex flex-col items-center justify-center h-full text-center px-4"
      >
        <GitCompare className="w-8 h-8 text-surface-600 mb-3" />
        <h3 className="text-sm text-surface-400 font-medium">No changes yet</h3>
        <p className="text-xs text-surface-500 mt-1">
          Schema differences will appear here after modifications.
        </p>
      </div>
    );
  }

  const added = diff.changes.filter((c) => c.type === 'added');
  const removed = diff.changes.filter((c) => c.type === 'removed');
  const modified = diff.changes.filter((c) => c.type === 'modified');

  return (
    <div data-testid="schema-diff-panel" className="h-full overflow-y-auto p-4">
      {}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-brand-400" />
          Schema Diff
        </h3>
        <span className="text-xs text-surface-500">
          v{diff.fromVersion} → v{diff.toVersion}
        </span>
      </div>

      {}
      <div className="flex gap-2 mb-4">
        {added.length > 0 && (
          <span className="badge-success">+{added.length} added</span>
        )}
        {removed.length > 0 && (
          <span className="badge-error">-{removed.length} removed</span>
        )}
        {modified.length > 0 && (
          <span className="badge-warning">~{modified.length} modified</span>
        )}
      </div>

      {}
      <div className="space-y-1.5 font-mono text-sm">
        {added.map((change) => (
          <div
            key={`add-${change.field}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-emerald-300">{change.field}</span>
            {!!change.newValue && typeof change.newValue === 'object' && (
              <span className="text-emerald-500/60 text-xs ml-auto">
                {(change.newValue as Record<string, unknown>).type as string}
              </span>
            )}
          </div>
        ))}

        {removed.map((change) => (
          <div
            key={`rem-${change.field}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <Minus className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="text-red-300 line-through">{change.field}</span>
          </div>
        ))}

        {modified.map((change) => (
          <div
            key={`mod-${change.field}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <PenLine className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-amber-300">{change.field}</span>
            <span className="text-amber-500/60 text-xs ml-auto">modified</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SchemaDiff);

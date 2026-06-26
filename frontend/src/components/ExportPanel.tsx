import React, { useCallback } from 'react';
import { useFormStore } from '../store/useFormStore';
import {
  Download,
  Copy,
  Terminal,
  FileJson,
  Database,
  Package,
} from 'lucide-react';


const ExportPanel: React.FC = () => {
  const currentSchema = useFormStore((s) => s.currentSchema);
  const addToast = useFormStore((s) => s.addToast);

  const schemaJSON = currentSchema ? JSON.stringify(currentSchema, null, 2) : '';

  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        addToast('success', `${label} copied to clipboard`);
      } catch {
        addToast('error', 'Failed to copy to clipboard');
      }
    },
    [addToast],
  );

  const downloadFile = useCallback(
    (content: string, filename: string, type: string) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('success', `${filename} downloaded`);
    },
    [addToast],
  );

  const generateCurl = useCallback((): string => {
    const body = JSON.stringify({
      prompt: 'Generate form',
      conversationId: useFormStore.getState().conversationId,
    });
    return `curl -X POST http://localhost:3001/api/form/generate \\
  -H "Content-Type: application/json" \\
  -d '${body}'`;
  }, []);

  const generateSampleData = useCallback((): string => {
    if (!currentSchema?.properties) return '{}';

    const sample: Record<string, unknown> = {};
    for (const [key, prop] of Object.entries(currentSchema.properties)) {
      switch (prop.type) {
        case 'string':
          if (prop.enum && Array.isArray(prop.enum)) {
            sample[key] = prop.enum[0];
          } else if (prop.format === 'email') {
            sample[key] = 'user@example.com';
          } else if (prop.format === 'date') {
            sample[key] = '2025-01-15';
          } else if (prop.format === 'uri') {
            sample[key] = 'https://example.com';
          } else {
            sample[key] = prop.default || `Sample ${prop.title || key}`;
          }
          break;
        case 'integer':
        case 'number':
          sample[key] = prop.minimum ?? prop.default ?? 0;
          break;
        case 'boolean':
          sample[key] = prop.default ?? false;
          break;
        case 'array':
          sample[key] = [];
          break;
        case 'object':
          sample[key] = {};
          break;
        default:
          sample[key] = null;
      }
    }
    return JSON.stringify(sample, null, 2);
  }, [currentSchema]);

  if (!currentSchema) {
    return (
      <div
        data-testid="export-panel"
        className="flex flex-col items-center justify-center h-full text-center px-4"
      >
        <Package className="w-8 h-8 text-surface-600 mb-3" />
        <h3 className="text-sm text-surface-400 font-medium">Nothing to export</h3>
        <p className="text-xs text-surface-500 mt-1">
          Generate a form schema first.
        </p>
      </div>
    );
  }

  const actions = [
    {
      icon: FileJson,
      label: 'Export JSON',
      description: 'Download schema as JSON file',
      onClick: () =>
        downloadFile(
          schemaJSON,
          `${currentSchema.title?.replace(/\s+/g, '_').toLowerCase() || 'schema'}.json`,
          'application/json',
        ),
      color: 'text-brand-400',
      testId: 'export-json-button',
    },
    {
      icon: Copy,
      label: 'Copy JSON',
      description: 'Copy schema to clipboard',
      onClick: () => copyToClipboard(schemaJSON, 'JSON Schema'),
      color: 'text-emerald-400',
      testId: 'copy-code-button',
    },
    {
      icon: Terminal,
      label: 'Copy cURL',
      description: 'Copy API request as cURL',
      onClick: () => copyToClipboard(generateCurl(), 'cURL command'),
      color: 'text-amber-400',
      testId: 'copy-curl-button',
    },
    {
      icon: Download,
      label: 'Download Schema',
      description: 'Download Draft-07 schema',
      onClick: () =>
        downloadFile(schemaJSON, 'schema-draft07.json', 'application/json'),
      color: 'text-cyan-400',
    },
    {
      icon: Database,
      label: 'Sample Data',
      description: 'Download example payload',
      onClick: () =>
        downloadFile(generateSampleData(), 'sample-data.json', 'application/json'),
      color: 'text-purple-400',
    },
    {
      icon: Copy,
      label: 'Copy API Request',
      description: 'Copy full request body',
      onClick: () =>
        copyToClipboard(
          JSON.stringify({ prompt: 'Generate form', schema: currentSchema }, null, 2),
          'API request',
        ),
      color: 'text-rose-400',
    },
  ];

  return (
    <div data-testid="export-panel" className="h-full overflow-y-auto p-4">
      <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
        <Package className="w-4 h-4 text-brand-400" />
        Export Schema
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            data-testid={action.testId}
            className="flex flex-col items-start gap-1.5 px-3 py-3 rounded-lg
                       bg-surface-800/50 hover:bg-surface-700/50 border border-surface-700/30
                       hover:border-surface-600/50 transition-all duration-200 group text-left"
          >
            <action.icon className={`w-4 h-4 ${action.color}`} />
            <span className="text-xs font-medium text-surface-200 group-hover:text-white">
              {action.label}
            </span>
            <span className="text-[10px] text-surface-500 leading-tight">
              {action.description}
            </span>
          </button>
        ))}
      </div>

      {}
      <div className="mt-4">
        <h4 className="text-xs font-medium text-surface-400 mb-2">Preview</h4>
        <pre className="text-xs font-mono text-surface-300 bg-surface-800/50 rounded-lg p-3 
                        overflow-x-auto border border-surface-700/30 max-h-[200px] overflow-y-auto">
          {schemaJSON}
        </pre>
      </div>
    </div>
  );
};

export default React.memo(ExportPanel);

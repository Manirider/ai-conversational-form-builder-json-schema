import React, { useMemo, useState, useCallback } from 'react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';

const RJSFForm = Form as any;
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { useFormStore } from '../store/useFormStore';
import { FileText, Eye } from 'lucide-react';


const FormRenderer: React.FC = () => {
  const currentSchema = useFormStore((s) => s.currentSchema);
  const schemaVersion = useFormStore((s) => s.schemaVersion);
  const submitForm = useFormStore((s) => s.submitForm);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  
  const { rjsfSchema, uiSchema } = useMemo(() => {
    if (!currentSchema) return { rjsfSchema: null, uiSchema: {} };

    const ui: UiSchema = {};
    const properties = currentSchema.properties || {};

    
    for (const [key, prop] of Object.entries(properties)) {
      if (prop['x-ui-widget'] === 'textarea') {
        ui[key] = { 'ui:widget': 'textarea', 'ui:options': { rows: 4 } };
      }
      if (prop.format === 'date') {
        ui[key] = { ...ui[key], 'ui:widget': 'date' };
      }
    }

    
    const cleanSchema = JSON.parse(JSON.stringify(currentSchema));
    if (cleanSchema.properties) {
      for (const prop of Object.values(cleanSchema.properties) as Record<string, unknown>[]) {
        delete prop['x-ui-widget'];
        delete prop['x-show-when'];
      }
    }

    return { rjsfSchema: cleanSchema as RJSFSchema, uiSchema: ui };
  }, [currentSchema]);

  
  const visibleSchema = useMemo(() => {
    if (!currentSchema || !rjsfSchema) return rjsfSchema;

    const originalProps = currentSchema.properties || {};
    const filteredProperties: Record<string, unknown> = {};
    const filteredRequired: string[] = [];

    for (const [key, prop] of Object.entries(originalProps)) {
      const showWhen = prop['x-show-when'];
      if (showWhen) {
        const { field, value, equals } = showWhen;
        const targetValue = value !== undefined ? value : equals;
        if (formData[field] !== targetValue) {
          continue; 
        }
      }
      
      const cleanProp = { ...prop };
      delete (cleanProp as Record<string, unknown>)['x-ui-widget'];
      delete (cleanProp as Record<string, unknown>)['x-show-when'];
      filteredProperties[key] = cleanProp;

      if (currentSchema.required?.includes(key)) {
        filteredRequired.push(key);
      }
    }

    return {
      ...rjsfSchema,
      properties: filteredProperties,
      required: filteredRequired.length > 0 ? filteredRequired : undefined,
    } as RJSFSchema;
  }, [currentSchema, rjsfSchema, formData]);

  const handleChange = useCallback((data: any) => {
    setFormData(data.formData || {});
  }, []);

  const handleSubmit = useCallback((data: any) => {
    submitForm(data.formData);
    setFormData({});
  }, [submitForm]);

  if (!currentSchema || !visibleSchema) {
    return (
      <div
        data-testid="form-renderer-pane"
        className="flex flex-col items-center justify-center h-full text-center px-6"
      >
        <div className="w-14 h-14 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4 border border-surface-700/30">
          <FileText className="w-7 h-7 text-surface-500" />
        </div>
        <h3 className="text-surface-300 font-medium mb-1">No form yet</h3>
        <p className="text-sm text-surface-500 max-w-xs">
          Describe a form in the chat to generate a live preview here.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="form-renderer-pane" className="h-full overflow-y-auto p-5">
      {}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-400" />
            {currentSchema.title || 'Generated Form'}
          </h2>
          {currentSchema.description && (
            <p className="text-sm text-surface-400 mt-0.5">{currentSchema.description}</p>
          )}
        </div>
        <span className="badge-info">v{schemaVersion}</span>
      </div>

      {}
      <div className="rjsf-form">
        <RJSFForm
          schema={visibleSchema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          validator={validator}
          liveValidate
          showErrorList={false}
          noHtml5Validate
        />
      </div>
    </div>
  );
};

export default React.memo(FormRenderer);

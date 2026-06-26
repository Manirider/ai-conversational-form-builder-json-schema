import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ExportPanel from '../ExportPanel';
import { useFormStore } from '../../store/useFormStore';

vi.mock('../../store/useFormStore', () => ({
  useFormStore: vi.fn(),
}));

describe('ExportPanel Component', () => {
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });
  });

  it('renders empty state when no schema exists', () => {
    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        currentSchema: null,
        addToast: mockAddToast,
      };
      return selector(state);
    });

    render(<ExportPanel />);
    expect(screen.getByTestId('export-panel')).toBeInTheDocument();
    expect(screen.getByText('Nothing to export')).toBeInTheDocument();
  });

  it('renders export actions when schema is present', () => {
    const mockSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Registration Form',
      type: 'object',
      properties: {
        name: { type: 'string' }
      }
    };

    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        currentSchema: mockSchema,
        addToast: mockAddToast,
      };
      return selector(state);
    });

    render(<ExportPanel />);

    expect(screen.getByTestId('export-panel')).toBeInTheDocument();
    
    const exportJsonBtn = screen.getByTestId('export-json-button');
    const copyJsonBtn = screen.getByTestId('copy-code-button');
    const copyCurlBtn = screen.getByTestId('copy-curl-button');

    expect(exportJsonBtn).toBeInTheDocument();
    expect(copyJsonBtn).toBeInTheDocument();
    expect(copyCurlBtn).toBeInTheDocument();
  });

  it('handles copy action triggers', async () => {
    const mockSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Registration Form',
      type: 'object',
      properties: {
        name: { type: 'string' }
      }
    };

    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        currentSchema: mockSchema,
        addToast: mockAddToast,
      };
      return selector(state);
    });

    render(<ExportPanel />);

    const copyJsonBtn = screen.getByTestId('copy-code-button');
    fireEvent.click(copyJsonBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});

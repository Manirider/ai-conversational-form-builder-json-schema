import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import FormRenderer from '../FormRenderer';
import { useFormStore } from '../../store/useFormStore';

vi.mock('../../store/useFormStore', () => ({
  useFormStore: vi.fn(),
}));

describe('FormRenderer Component', () => {
  const mockSubmitForm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no schema exists', () => {
    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        currentSchema: null,
        schemaVersion: 0,
        submitForm: mockSubmitForm,
      };
      return selector(state);
    });

    render(<FormRenderer />);
    expect(screen.getByTestId('form-renderer-pane')).toBeInTheDocument();
    expect(screen.getByText('No form yet')).toBeInTheDocument();
  });

  it('renders form fields from JSON Schema', () => {
    const mockSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Test Registration Form',
      description: 'A form for testing',
      type: 'object',
      properties: {
        username: {
          type: 'string',
          title: 'Username',
          description: 'Your username',
        },
      },
      required: ['username'],
    };

    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        currentSchema: mockSchema,
        schemaVersion: 1,
        submitForm: mockSubmitForm,
      };
      return selector(state);
    });

    render(<FormRenderer />);
    expect(screen.getByTestId('form-renderer-pane')).toBeInTheDocument();
    expect(screen.getAllByText('Test Registration Form')[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
  });

  it('handles conditional visibility (x-show-when with equals)', () => {
    const mockSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Conditional Form',
      type: 'object',
      properties: {
        subscribe: {
          type: 'boolean',
          title: 'Subscribe to newsletter',
        },
        email: {
          type: 'string',
          title: 'Email Address',
          'x-show-when': {
            field: 'subscribe',
            equals: true,
          },
        },
      },
    };

    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        currentSchema: mockSchema,
        schemaVersion: 1,
        submitForm: mockSubmitForm,
      };
      return selector(state);
    });

    render(<FormRenderer />);
    
    
    const checkbox = screen.getByLabelText('Subscribe to newsletter');
    expect(checkbox).toBeInTheDocument();

    
    expect(screen.queryByLabelText('Email Address')).not.toBeInTheDocument();

    
    fireEvent.click(checkbox);

    
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });
});

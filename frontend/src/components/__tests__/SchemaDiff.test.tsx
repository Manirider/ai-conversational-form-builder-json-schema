import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import SchemaDiff from '../SchemaDiff';
import { useFormStore } from '../../store/useFormStore';

vi.mock('../../store/useFormStore', () => ({
  useFormStore: vi.fn(),
}));

describe('SchemaDiff Component', () => {
  it('renders empty state when there are no changes', () => {
    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        diff: null,
        schemaVersion: 0,
      };
      return selector(state);
    });

    render(<SchemaDiff />);
    expect(screen.getByTestId('schema-diff-panel')).toBeInTheDocument();
    expect(screen.getByText('No changes yet')).toBeInTheDocument();
  });

  it('renders changes when diff is present', () => {
    const mockDiff = {
      fromVersion: 1,
      toVersion: 2,
      changes: [
        { field: 'phone', type: 'added', newValue: { type: 'string' } },
        { field: 'age', type: 'removed', oldValue: { type: 'integer' } },
        { field: 'name', type: 'modified', oldValue: { type: 'string' }, newValue: { type: 'string', minLength: 2 } },
      ],
    };

    vi.mocked(useFormStore).mockImplementation((selector: any) => {
      const state = {
        diff: mockDiff,
        schemaVersion: 2,
      };
      return selector(state);
    });

    render(<SchemaDiff />);

    expect(screen.getByTestId('schema-diff-panel')).toBeInTheDocument();
    expect(screen.getByText('v1 → v2')).toBeInTheDocument();

    
    expect(screen.getByText('phone')).toBeInTheDocument();

    
    expect(screen.getByText('age')).toBeInTheDocument();

    
    expect(screen.getByText('name')).toBeInTheDocument();
  });
});

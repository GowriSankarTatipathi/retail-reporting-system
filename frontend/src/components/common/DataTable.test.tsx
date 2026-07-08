import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './DataTable';

interface Row {
  id: number;
  name: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
];

describe('DataTable', () => {
  it('renders provided rows', () => {
    render(
      <DataTable
        columns={columns}
        data={[
          { id: 1, name: 'Alpha' },
          { id: 2, name: 'Beta' },
        ]}
        getRowId={(row) => String(row.id)}
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows an empty state when there are no rows', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(row) => String(row.id)}
        emptyTitle="Nothing here"
      />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows skeleton rows while loading instead of the empty state', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(row) => String(row.id)}
        isLoading
        emptyTitle="Nothing here"
      />
    );
    expect(screen.queryByText('Nothing here')).not.toBeInTheDocument();
  });

  it('shows an error state with a working retry action', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[]}
        getRowId={(row) => String(row.id)}
        errorMessage="Network error"
        onRetry={onRetry}
      />
    );
    expect(screen.getByText('Network error')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders a pagination footer only when pagination props are provided', () => {
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={[{ id: 1, name: 'Alpha' }]}
        getRowId={(row) => String(row.id)}
      />
    );
    expect(screen.queryByText(/rows per page/i)).not.toBeInTheDocument();

    rerender(
      <DataTable
        columns={columns}
        data={[{ id: 1, name: 'Alpha' }]}
        getRowId={(row) => String(row.id)}
        pagination={{
          pageIndex: 0,
          pageSize: 20,
          totalRows: 1,
          onPageChange: vi.fn(),
          onPageSizeChange: vi.fn(),
        }}
      />
    );
    expect(screen.getByText(/rows per page/i)).toBeInTheDocument();
  });
});

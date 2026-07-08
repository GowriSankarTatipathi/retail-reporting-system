import { useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  Box,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;

  /** Server-side pagination - omit to disable the pagination footer entirely. */
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalRows: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };

  /** Server-side sorting - omit to fall back to client-side sorting. */
  manualSorting?: {
    sorting: SortingState;
    onSortingChange: (sorting: SortingState) => void;
  };

  /** Rendered above the table (search box, filter controls, export buttons, etc.). */
  toolbar?: ReactNode;
}

const SKELETON_ROWS = 5;

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading,
  errorMessage,
  onRetry,
  emptyTitle = 'No results',
  emptyDescription,
  onRowClick,
  pagination,
  manualSorting,
  toolbar,
}: DataTableProps<T>) {
  const [clientSorting, setClientSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);

  const sorting = manualSorting?.sorting ?? clientSorting;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: manualSorting
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(sorting) : updater;
          manualSorting.onSortingChange(next);
        }
      : setClientSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    manualSorting: !!manualSorting,
    manualPagination: true,
    getRowId,
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flexGrow: 1 }}>{toolbar}</Box>
        <Tooltip title="Show/hide columns">
          <IconButton
            size="small"
            onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
            aria-label="Toggle column visibility"
          >
            <ViewColumnOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={columnMenuAnchor}
          open={!!columnMenuAnchor}
          onClose={() => setColumnMenuAnchor(null)}
        >
          {table.getAllLeafColumns().map((column) => (
            <MenuItem
              key={column.id}
              dense
              onClick={() => column.toggleVisibility()}
              sx={{ gap: 1 }}
            >
              <Checkbox size="small" checked={column.getIsVisible()} sx={{ p: 0 }} />
              {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {errorMessage ? (
        <ErrorState message={errorMessage} onRetry={onRetry} />
      ) : (
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <TableSortLabel
                          active={!!header.column.getIsSorted()}
                          direction={header.column.getIsSorted() === 'desc' ? 'desc' : 'asc'}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {isLoading ? (
                // Skeleton placeholder rows/cells have no data identity, so an
                // index key is fine here.
                Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {columns.map((_col, colIndex) => (
                      <TableCell key={`skeleton-cell-${colIndex}`}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ border: 0 }}>
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover={!!onRowClick}
                    onClick={() => onRowClick?.(row.original)}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.totalRows}
          page={pagination.pageIndex}
          onPageChange={(_, page) => pagination.onPageChange(page)}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
          rowsPerPageOptions={[10, 20, 50]}
        />
      )}
    </Box>
  );
}

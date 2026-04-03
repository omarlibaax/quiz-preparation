import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

type Props<T extends { id: string }> = {
  columns: ColumnDef<T>[]
  rows: T[]
  onRowClick?: (row: T) => void
  loading?: boolean
}

export function ReportDataTable<T extends { id: string }>({ columns, rows, onRowClick, loading = false }: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [visibility, setVisibility] = useState<VisibilityState>({})
  const [selection, setSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      columnVisibility: visibility,
      rowSelection: selection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVisibility,
    onRowSelectionChange: setSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  })

  const total = rows.length
  const selectedCount = useMemo(() => Object.keys(selection).length, [selection])

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Rows: <strong>{total}</strong>
        </span>
        <span>
          Selected: <strong>{selectedCount}</strong>
        </span>
      </div>
      <div className="max-h-[520px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none px-3 py-2 font-semibold"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 text-slate-400" colSpan={columns.length}>
                    Loading...
                  </td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400" colSpan={columns.length}>
                  No records found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className="border-t border-slate-100 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Columns</span>
          {table.getAllLeafColumns().map((column) => (
            <label key={column.id} className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} />
              {column.id}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
          >
            Prev
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

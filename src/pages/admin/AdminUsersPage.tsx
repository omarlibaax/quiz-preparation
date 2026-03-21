import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { EmptyState } from '../../components/admin/EmptyState'
import type { MockUserRow } from '../../data/adminDashboardMock'
import { mockUsers } from '../../data/adminDashboardMock'
import { cn } from '../../utils/cn'

export default function AdminUsersPage() {
  const [data, setData] = useState<MockUserRow[]>(() => [...mockUsers])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'STUDENT' | 'ADMIN'>('all')

  const tableData = useMemo(() => {
    if (roleFilter === 'all') return data
    return data.filter((u) => u.role === roleFilter)
  }, [data, roleFilter])

  const columns = useMemo<ColumnDef<MockUserRow>[]>(
    () => [
      { accessorKey: 'name', header: 'Name', cell: (info) => info.getValue() },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Role' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              const next = row.original.status === 'active' ? 'blocked' : 'active'
              setData((prev) =>
                prev.map((u) => (u.id === row.original.id ? { ...u, status: next } : u)),
              )
              toast.success(`User ${next === 'active' ? 'activated' : 'blocked'} (demo)`)
            }}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold transition',
              row.original.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400',
            )}
          >
            {row.original.status}
          </button>
        ),
      },
      { accessorKey: 'joined', header: 'Joined' },
    ],
    [],
  )

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">User management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Demo directory — connect <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">GET /api/users</code> when available.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search name or email…"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'STUDENT' | 'ADMIN')}
        >
          <option value="all">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {data.length === 0 ? (
        <EmptyState title="No users" description="Import or invite users to populate this list." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === 'asc' ? ' ↑' : h.column.getIsSorted() === 'desc' ? ' ↓' : null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-slate-800 dark:text-slate-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

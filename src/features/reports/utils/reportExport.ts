import type { ColumnDef } from '@tanstack/react-table'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

type ExportRow = Record<string, unknown>

function columnHeader<T extends ExportRow>(column: ColumnDef<T>) {
  if (typeof column.header === 'string') return column.header
  if ('accessorKey' in column && typeof column.accessorKey === 'string') return column.accessorKey
  return 'Column'
}

function normalizeRows<T extends ExportRow>(rows: T[], columns: ColumnDef<T>[]) {
  return rows.map((row) => {
    const out: Record<string, unknown> = {}
    columns.forEach((col) => {
      if (!('accessorKey' in col) || typeof col.accessorKey !== 'string') return
      out[columnHeader(col)] = row[col.accessorKey]
    })
    return out
  })
}

export function exportToCsv<T extends ExportRow>(rows: T[], columns: ColumnDef<T>[], filename: string) {
  const normalized = normalizeRows(rows, columns)
  const worksheet = XLSX.utils.json_to_sheet(normalized)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToExcel<T extends ExportRow>(rows: T[], columns: ColumnDef<T>[], filename: string) {
  const normalized = normalizeRows(rows, columns)
  const worksheet = XLSX.utils.json_to_sheet(normalized)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export function exportToPdf<T extends ExportRow>(
  rows: T[],
  columns: ColumnDef<T>[],
  filename: string,
  title: string,
  subtitle: string,
) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const headers = columns
    .filter((c) => 'accessorKey' in c && typeof c.accessorKey === 'string')
    .map((c) => columnHeader(c))

  const body = rows.map((row) =>
    columns
      .filter((c) => 'accessorKey' in c && typeof c.accessorKey === 'string')
      .map((c) => {
        if (!('accessorKey' in c) || typeof c.accessorKey !== 'string') return ''
        const value = row[c.accessorKey]
        return value == null ? '' : String(value)
      }),
  )

  doc.setFontSize(14)
  doc.text(title, 14, 14)
  doc.setFontSize(10)
  doc.text(subtitle, 14, 21)

  autoTable(doc, {
    startY: 26,
    head: [headers],
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [99, 102, 241] },
    theme: 'striped',
  })

  doc.save(`${filename}.pdf`)
}

export function printReportHtml({
  title,
  subtitle,
  tableHtml,
}: {
  title: string
  subtitle: string
  tableHtml: string
}) {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800')
  if (!win) return

  const generatedAt = new Date().toLocaleString()
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 14mm; }
          body { font-family: Arial, sans-serif; color: #0f172a; }
          .header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px; }
          .logo { font-weight: 800; color: #4f46e5; }
          .subtitle { color: #475569; font-size: 12px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; }
          th { background: #eef2ff; }
          tfoot { position: fixed; bottom: 0; left: 0; right: 0; color: #64748b; font-size: 11px; display:flex; justify-content:space-between; }
          .page::after { content: counter(page); }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">QuizAdmin</div>
          <div>${title}</div>
        </div>
        <div class="subtitle">${subtitle}</div>
        ${tableHtml}
        <tfoot>
          <div>Generated: ${generatedAt}</div>
          <div>Page <span class="page"></span></div>
        </tfoot>
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

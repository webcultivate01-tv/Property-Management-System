// Generic client-side exporters: CSV, Excel (.xlsx), PDF.
// Libraries are imported dynamically so they're only downloaded when needed.
//
// Usage:
//   const columns = [
//     { key: 'name',  label: 'Name' },
//     { key: 'email', label: 'Email' },
//     { key: 'createdAt', label: 'Created', format: (v) => new Date(v).toLocaleDateString() },
//   ];
//   exportToExcel({ rows, columns, filename: 'inquiries', sheet: 'Inquiries' });
//   exportToPDF({ rows, columns, filename: 'inquiries', title: 'Inquiries Report' });
//   exportToCSV({ rows, columns, filename: 'inquiries' });

const get = (obj, path) =>
  path.split('.').reduce((acc, p) => (acc == null ? acc : acc[p]), obj);

const formatCell = (row, col) => {
  const raw = get(row, col.key);
  if (col.format) return col.format(raw, row);
  if (raw == null) return '';
  if (raw instanceof Date) return raw.toLocaleString();
  if (typeof raw === 'object') return JSON.stringify(raw);
  return raw;
};

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

export function exportToCSV({ rows, columns, filename = 'export' }) {
  const headers = columns.map((c) => c.label).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const value = String(formatCell(row, c) ?? '').replace(/"/g, '""');
        return `"${value}"`;
      })
      .join(',')
  );
  const csv = '﻿' + [headers, ...lines].join('\n'); // BOM for Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${filename}-${timestamp()}.csv`);
}

export async function exportToExcel({
  rows,
  columns,
  filename = 'export',
  sheet = 'Sheet1',
}) {
  const XLSX = await import('xlsx');
  const data = rows.map((row) => {
    const obj = {};
    columns.forEach((c) => {
      obj[c.label] = formatCell(row, c);
    });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data, {
    header: columns.map((c) => c.label),
  });
  // Auto width based on longest value per column
  ws['!cols'] = columns.map((c) => {
    const max = Math.max(
      c.label.length,
      ...data.map((d) => String(d[c.label] ?? '').length)
    );
    return { wch: Math.min(Math.max(max + 2, 10), 60) };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `${filename}-${timestamp()}.xlsx`);
}

export async function exportToPDF({
  rows,
  columns,
  filename = 'export',
  title = 'Report',
  subtitle,
  orientation = 'landscape',
}) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableMod.default || autoTableMod.autoTable;

  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(99, 102, 241); // brand-500
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Telvine Realty', 40, 28);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 40, 46);
  doc.setFontSize(9);
  doc.text(
    `Generated ${new Date().toLocaleString()}`,
    pageWidth - 40,
    28,
    { align: 'right' }
  );
  if (subtitle) {
    doc.text(subtitle, pageWidth - 40, 46, { align: 'right' });
  }

  // Table
  autoTable(doc, {
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => String(formatCell(row, c) ?? ''))),
    startY: 80,
    styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
    headStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    margin: { left: 30, right: 30 },
    didDrawPage: (data) => {
      const page = doc.internal.getCurrentPageInfo().pageNumber;
      const total = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `Page ${page} of ${total}`,
        pageWidth - 40,
        doc.internal.pageSize.getHeight() - 20,
        { align: 'right' }
      );
      doc.text(
        '© Telvine Realty',
        40,
        doc.internal.pageSize.getHeight() - 20
      );
    },
  });

  doc.save(`${filename}-${timestamp()}.pdf`);
}

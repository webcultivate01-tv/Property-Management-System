import { useEffect, useRef, useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exporters';
import { cn } from '@/lib/utils';

/**
 * Reusable export dropdown.
 *
 * Props:
 *   getData()    -> Promise<rows[]> | rows[]  — function that returns the dataset to export
 *   columns      -> [{ key, label, format? }] — column definitions
 *   filename     -> base filename (no extension)
 *   title        -> PDF title
 *   variant      -> 'outline' (default) | 'primary'
 */
export function ExportMenu({
  getData,
  columns,
  filename = 'export',
  title = 'Report',
  variant = 'outline',
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const run = async (format) => {
    setOpen(false);
    setBusy(true);
    try {
      const rows = await Promise.resolve(getData());
      if (!rows || !rows.length) {
        toast.error('No data to export');
        return;
      }
      const opts = { rows, columns, filename, title };
      if (format === 'pdf') await exportToPDF(opts);
      else if (format === 'excel') await exportToExcel(opts);
      else exportToCSV(opts);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        disabled={busy}
        className={cn(
          variant === 'primary' ? 'btn-primary' : 'btn-outline',
          'gap-2'
        )}
      >
        {busy ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download size={16} />
        )}
        Export
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 z-30 rounded-xl bg-white border border-slate-200 shadow-glow overflow-hidden">
          <MenuItem icon={FileType} title="PDF" description=".pdf · printable report" onClick={() => run('pdf')} />
          <MenuItem icon={FileSpreadsheet} title="Excel" description=".xlsx · with formatting" onClick={() => run('excel')} />
          <MenuItem icon={FileText} title="CSV" description=".csv · plain text" onClick={() => run('csv')} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition text-left"
    >
      <Icon size={18} className="text-brand-600 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    </button>
  );
}

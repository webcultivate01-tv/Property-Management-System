import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Upload, X, FileSpreadsheet, Check, AlertTriangle, Download,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

/**
 * CSV / XLSX import for Properties.
 * Three steps: pick file → preview → import.
 * No server changes — each row is POSTed via the existing create endpoint.
 */

const SAMPLE_HEADER = [
  'title', 'description', 'propertyType', 'listingType', 'price', 'pricePeriod',
  'address', 'city', 'state', 'country', 'zipCode',
  'bedrooms', 'bathrooms', 'area', 'areaUnit', 'parking',
  'yearBuilt', 'furnishing', 'status', 'featured', 'amenities',
];

const REQUIRED = ['title', 'description', 'propertyType', 'listingType', 'price', 'address', 'city', 'state'];

const ENUMS = {
  propertyType: ['apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'pg'],
  listingType: ['sale', 'rent'],
  pricePeriod: ['one-time', 'monthly', 'yearly'],
  areaUnit: ['sqft', 'sqm', 'acre'],
  furnishing: ['unfurnished', 'semi-furnished', 'furnished'],
  status: ['available', 'sold', 'rented', 'pending', 'draft'],
};

export function CsvImportModal({ open, onClose, onDone }) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });
  const fileRef = useRef(null);

  const reset = () => {
    setRows([]);
    setErrors([]);
    setProgress({ done: 0, total: 0, failed: 0 });
    if (fileRef.current) fileRef.current.value = '';
  };

  const close = () => { reset(); onClose?.(); };

  const downloadTemplate = () => {
    const csv =
      SAMPLE_HEADER.join(',') + '\n' +
      [
        '3BHK Sea-View Apartment in Bandra',
        '"Spacious 1450 sqft apartment with panoramic sea views, modular kitchen, 3 balconies."',
        'apartment', 'sale', 25000000, 'one-time',
        '"Hill Road, Bandra West"', 'Mumbai', 'Maharashtra', 'India', '400050',
        3, 2, 1450, 'sqft', 1,
        2019, 'semi-furnished', 'available', 'true',
        '"Swimming Pool, Gym, 24/7 Security, Power Backup"',
      ].join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file) => {
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
      if (!raw.length) {
        toast.error('File looks empty');
        return;
      }
      const { mapped, errors } = parseRows(raw);
      setRows(mapped);
      setErrors(errors);
      if (errors.length) toast.error(`${errors.length} row(s) have issues — review below.`);
      else toast.success(`${mapped.length} row(s) ready to import.`);
    } catch (e) {
      console.error(e);
      toast.error('Could not parse file');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    onFile(e.dataTransfer.files?.[0]);
  };

  const importAll = async () => {
    const ok = rows.filter((r) => !r._errors?.length);
    if (!ok.length) return;
    setImporting(true);
    setProgress({ done: 0, total: ok.length, failed: 0 });
    let done = 0; let failed = 0;
    for (const row of ok) {
      const fd = new FormData();
      Object.entries(row.data).forEach(([k, v]) => {
        if (k === 'amenities') {
          fd.append('amenities', JSON.stringify(v));
        } else if (k === 'featured') {
          fd.append(k, v ? 'true' : 'false');
        } else if (v !== undefined && v !== null && v !== '') {
          fd.append(k, v);
        }
      });
      try {
        await propertyService.create(fd);
        done += 1;
      } catch {
        failed += 1;
      }
      setProgress({ done: done + failed, total: ok.length, failed });
    }
    setImporting(false);
    if (failed === 0) {
      toast.success(`Imported ${done} propert${done === 1 ? 'y' : 'ies'}`);
      onDone?.();
    } else {
      toast.error(`${done} imported, ${failed} failed`);
    }
  };

  const validCount = rows.filter((r) => !r._errors?.length).length;

  return (
    <Modal
      open={open}
      onClose={importing ? undefined : close}
      title="Bulk import properties from CSV"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={importing}>
            {rows.length ? 'Cancel' : 'Close'}
          </Button>
          {rows.length > 0 && (
            <Button onClick={importAll} loading={importing} disabled={!validCount}>
              <Upload size={15} /> Import {validCount} row{validCount === 1 ? '' : 's'}
            </Button>
          )}
        </>
      }
    >
      {rows.length === 0 ? (
        <div className="space-y-4">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="block border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <FileSpreadsheet size={40} className="mx-auto text-slate-400 mb-2" />
            <div className="font-semibold text-slate-700 dark:text-slate-200">
              Drop a CSV or Excel file here, or click to browse
            </div>
            <div className="text-xs text-slate-500 mt-1">
              First row should be column headers — see template below.
            </div>
          </label>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div>
              <div className="text-sm font-semibold dark:text-slate-100">Need a template?</div>
              <div className="text-xs text-slate-500">Download a sample file with all supported columns + one example row.</div>
            </div>
            <button onClick={downloadTemplate} className="btn-outline gap-2 text-sm">
              <Download size={14} /> Download CSV
            </button>
          </div>

          <details className="text-xs text-slate-500 dark:text-slate-400">
            <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">Column reference</summary>
            <div className="mt-2 grid sm:grid-cols-2 gap-x-4 gap-y-1">
              {SAMPLE_HEADER.map((h) => (
                <div key={h} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${REQUIRED.includes(h) ? 'bg-rose-500' : 'bg-slate-400'}`} />
                  <code>{h}</code>
                  {REQUIRED.includes(h) && <span className="text-rose-500 text-[10px]">required</span>}
                </div>
              ))}
            </div>
            <p className="mt-2">Enums: <code>propertyType</code> ({ENUMS.propertyType.join(', ')}), <code>listingType</code> ({ENUMS.listingType.join(', ')}), <code>status</code> ({ENUMS.status.join(', ')}). <code>amenities</code> is a comma-separated list. <code>featured</code> is true/false. Images cannot be imported via CSV.</p>
          </details>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <div className="text-sm">
              <span className="font-bold text-emerald-600">{validCount} valid</span>
              {errors.length > 0 && (
                <span className="ml-3 font-bold text-rose-600">{errors.length} with issues</span>
              )}
            </div>
            <button onClick={reset} className="ml-auto text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white inline-flex items-center gap-1">
              <X size={12} /> Choose a different file
            </button>
          </div>

          {importing && (
            <div className="p-3 rounded-xl border border-brand-200 dark:border-brand-400/30 bg-brand-50 dark:bg-brand-500/10">
              <div className="text-sm font-semibold text-brand-700 dark:text-brand-200">
                Importing {progress.done} of {progress.total}…
              </div>
              <div className="h-2 mt-2 bg-white/70 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                />
              </div>
              {progress.failed > 0 && (
                <div className="text-xs text-rose-600 mt-1">{progress.failed} failed so far</div>
              )}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 text-left w-6">#</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {rows.map((r, i) => (
                  <tr key={i} className={r._errors?.length ? 'bg-rose-50/50 dark:bg-rose-500/5' : ''}>
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium dark:text-slate-100 truncate max-w-[14rem]">
                        {r.data.title || <span className="text-rose-500">(missing)</span>}
                      </div>
                      {r._errors?.length > 0 && (
                        <div className="text-rose-600 mt-0.5 flex items-center gap-1">
                          <AlertTriangle size={11} /> {r._errors.join('; ')}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 dark:text-slate-200">{r.data.city || '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.data.price ? Number(r.data.price).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-3 py-2 dark:text-slate-200">{r.data.propertyType || '—'}</td>
                    <td className="px-3 py-2">
                      {r._errors?.length
                        ? <span className="inline-flex items-center gap-1 text-rose-600"><AlertTriangle size={11} /> Skip</span>
                        : <span className="inline-flex items-center gap-1 text-emerald-600"><Check size={11} /> Ready</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

function parseRows(raw) {
  const errors = [];
  const mapped = raw.map((src, idx) => {
    const lower = {};
    Object.keys(src).forEach((k) => { lower[String(k).toLowerCase().trim()] = src[k]; });
    const data = {};
    SAMPLE_HEADER.forEach((h) => {
      const v = lower[h.toLowerCase()];
      data[h] = v == null ? '' : String(v).trim();
    });

    // Coerce types.
    if (data.price !== '') data.price = Number(String(data.price).replace(/[^\d.]/g, '')) || 0;
    ['bedrooms', 'bathrooms', 'area', 'parking', 'yearBuilt'].forEach((k) => {
      if (data[k] !== '') data[k] = Number(data[k]) || 0;
    });
    if (data.featured !== '') data.featured = /^(1|true|yes|y)$/i.test(data.featured);
    if (data.amenities) {
      data.amenities = String(data.amenities).split(/[;,]/).map((s) => s.trim()).filter(Boolean);
    } else {
      data.amenities = [];
    }

    // Apply defaults for optional enum fields.
    if (!data.pricePeriod) data.pricePeriod = 'one-time';
    if (!data.areaUnit) data.areaUnit = 'sqft';
    if (!data.furnishing) data.furnishing = 'unfurnished';
    if (!data.status) data.status = 'available';
    if (!data.country) data.country = 'India';

    const rowErrors = [];
    REQUIRED.forEach((k) => {
      if (data[k] === '' || data[k] == null || data[k] === 0 && k === 'price') {
        rowErrors.push(`missing "${k}"`);
      }
    });
    Object.entries(ENUMS).forEach(([k, allowed]) => {
      if (data[k] && !allowed.includes(data[k])) {
        rowErrors.push(`invalid ${k}: "${data[k]}"`);
      }
    });

    if (rowErrors.length) errors.push({ row: idx + 1, errors: rowErrors });
    return { data, _errors: rowErrors };
  });
  return { mapped, errors };
}

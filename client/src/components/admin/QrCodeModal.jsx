import { useEffect, useRef, useState } from 'react';
import { Download, Copy, X, QrCode, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Open by dispatching:
 *   window.dispatchEvent(new CustomEvent('tools:open-qr', {
 *     detail: { url, title }
 *   }))
 */
export function QrCodeModal() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const onOpen = (ev) => {
      setUrl(ev?.detail?.url || window.location.origin);
      setTitle(ev?.detail?.title || '');
      setOpen(true);
    };
    window.addEventListener('tools:open-qr', onOpen);
    return () => window.removeEventListener('tools:open-qr', onOpen);
  }, []);

  useEffect(() => {
    if (!open || !url) return;
    let cancelled = false;
    (async () => {
      const QR = await import('qrcode');
      if (cancelled || !canvasRef.current) return;
      try {
        await QR.toCanvas(canvasRef.current, url, {
          width: 280,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
      } catch (e) {
        console.error('QR render failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, [open, url]);

  const download = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    const slug = (title || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    a.href = dataUrl;
    a.download = `qr-${slug || 'link'}.png`;
    a.click();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[95] bg-slate-900/50 backdrop-blur-sm grid place-items-center p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient text-white grid place-items-center">
            <QrCode size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-lg dark:text-slate-100">Share QR Code</div>
            {title && <div className="text-xs text-slate-500 truncate">{title}</div>}
          </div>
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 grid place-items-center">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
          <div className="mt-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 break-all">
            {url}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={copy} className="btn-outline gap-2">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button onClick={download} className="btn-primary gap-2">
              <Download size={15} /> Download
            </button>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 text-center">
            Print on flyers, signage, or business cards to take visitors straight to the listing.
          </div>
        </div>
      </div>
    </div>
  );
}

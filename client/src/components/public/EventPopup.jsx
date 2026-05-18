// EventPopup
// ----------
// Shows the latest active "popup" event when a visitor lands on a public page.
// - Dismisses on overlay click, X, ESC, or the CTA button.
// - Remembers dismissal in sessionStorage so it doesn't reappear on every nav.
//   Each event has its own key, so a NEW event will pop up again.
// - Mobile responsive, with framer-motion entrance.
// - Silently skipped on /admin and auth pages.

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CalendarDays, Sparkles } from 'lucide-react';
import { fetchPopupEvent, dismissPopup } from '@/store/slices/eventSlice';

const HIDE_PATHS = ['/admin', '/login', '/register', '/forgot-password', '/reset-password'];
const STORAGE_KEY = 'eventPopup:dismissed';

const dismissedSet = () => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const persistDismiss = (id) => {
  const s = dismissedSet();
  s.add(id);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...s]));
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export default function EventPopup() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const popup = useSelector((s) => s.events.popup);
  const popupLoaded = useSelector((s) => s.events.popupLoaded);

  const blocked = HIDE_PATHS.some((p) => pathname.startsWith(p));

  // Fetch the active popup once per session, but never on hidden routes.
  useEffect(() => {
    if (!popupLoaded && !blocked) dispatch(fetchPopupEvent());
  }, [dispatch, popupLoaded, blocked]);

  // Respect the per-event sessionStorage dismissal.
  const alreadyDismissed = popup && dismissedSet().has(popup._id);
  const visible = !blocked && popup && !alreadyDismissed;

  // ESC key closes the popup.
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    if (popup?._id) persistDismiss(popup._id);
    dispatch(dismissPopup());
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm cursor-default"
          />

          {/* Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-popup-title"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            className="relative w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ borderTop: `5px solid ${popup.color || '#f97316'}` }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md"
              aria-label="Close popup"
            >
              <X size={18} />
            </button>

            {/* Optional image */}
            {popup.image?.url ? (
              <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                <img
                  src={popup.image.url}
                  alt={popup.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="aspect-[16/6] flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(135deg, ${popup.color || '#f97316'} 0%, ${shade(popup.color || '#f97316', -40)} 100%)`,
                }}
              >
                <Sparkles size={56} className="opacity-80" />
              </div>
            )}

            <div className="px-6 py-5 sm:px-7 sm:py-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">
                <span
                  className="px-2 py-0.5 rounded-md text-white"
                  style={{ background: popup.color || '#f97316' }}
                >
                  {popup.type || 'Event'}
                </span>
                {popup.discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                    -{popup.discountPercent}% off
                  </span>
                )}
              </div>

              <h2
                id="event-popup-title"
                className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight"
              >
                {popup.title}
              </h2>

              {popup.description && (
                <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                  {popup.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <CalendarDays size={15} className="shrink-0" />
                <span>{formatDate(popup.startDate)}</span>
                {popup.endDate && <span>→ {formatDate(popup.endDate)}</span>}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl font-semibold text-white shadow-md transition hover:opacity-95"
                  style={{ background: popup.color || '#f97316' }}
                >
                  Got it
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Tint helper used when the event has no image — darkens the accent for the gradient.
function shade(hex, amt) {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = Math.max(Math.min(((num >> 16) & 0xff) + amt, 255), 0);
  const g = Math.max(Math.min(((num >> 8) & 0xff) + amt, 255), 0);
  const b = Math.max(Math.min((num & 0xff) + amt, 255), 0);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

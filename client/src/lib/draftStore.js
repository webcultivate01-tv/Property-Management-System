// Thin wrapper around localStorage for typed form drafts.
const PREFIX = 'tlv-draft:';

export const draftStore = {
  load(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  save(key, data) {
    try {
      const payload = { savedAt: Date.now(), data };
      localStorage.setItem(PREFIX + key, JSON.stringify(payload));
    } catch {
      // quota or disabled — ignore silently
    }
  },
  clear(key) {
    try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
  },
};

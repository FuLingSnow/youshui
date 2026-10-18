export const $ = (id) => document.getElementById(id);

export function cleanMOTD(text) {
  return String(text || '').replace(/\u00a7[0-9a-fk-orK-OR]/g, '').replace(/§[0-9a-fk-orK-OR]/g, '');
}

export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

const AVATAR_COLORS = ['#0e7490', '#4338ca', '#be185d', '#b45309', '#15803d', '#6d28d9', '#b91c1c', '#0369a1'];

export function avatarColor(name) {
  let h = 0;
  for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function avatarFirst(name) {
  const s = String(name).trim();
  return s ? [...s][0].toUpperCase() : '?';
}

export function copyToClipboard(text) {
  return new Promise((resolve) => {
    const fallback = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return !!ok;
      } catch {
        return false;
      }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => resolve(true), () => resolve(fallback()));
    } else {
      resolve(fallback());
    }
  });
}

import { DONORS } from './config.js';
import { $ } from './utils.js';

export function maskQQ(qq) {
  qq = String(qq);
  const len = qq.length;
  if (len <= 2) return qq;
  if (len === 3) return qq[0] + '*' + qq[2];
  const keepStart = Math.ceil(len * 0.25);
  const keepEnd = Math.floor(len * 0.25);
  return qq.slice(0, keepStart) + '*'.repeat(len - keepStart - keepEnd) + qq.slice(-keepEnd);
}

export function renderSupport() {
  const list = $('donor-list');
  if (!list) return;
  list.innerHTML = '';
  const donors = [...DONORS].sort((a, b) => (b.qqq || 0) - (a.qqq || 0));
  donors.forEach((d) => {
    const item = document.createElement('div');
    item.className = 'flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 transition hover:border-amber-400/30 hover:bg-white/10';
    const img = document.createElement('img');
    img.className = 'w-14 h-14 rounded-full border border-white/15 object-cover';
    img.src = 'https://q1.qlogo.cn/g?b=qq&nk=' + d.qq + '&s=100';
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => { img.src = 'https://q1.qlogo.cn/g?b=qq&nk=0&s=100'; };
    const name = document.createElement('span');
    name.className = 'text-xs text-slate-300';
    name.textContent = maskQQ(d.qq);
    item.appendChild(img);
    item.appendChild(name);
    list.appendChild(item);
  });
}

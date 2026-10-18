import { NEWS } from './config.js';
import { $ } from './utils.js';

export function sortedNews() {
  return [...NEWS].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function buildNewsCard(n, compact) {
  const item = document.createElement('div');
  item.className = 'glass rounded-2xl p-5 ' + (compact ? '' : 'md:p-6') + ' card-hover';
  let html =
    '<div class="flex flex-wrap items-center gap-2.5">' +
      (n.tag ? '<span class="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-[11px]">' + n.tag + '</span>' : '') +
      '<span class="text-xs text-slate-500">' + n.date + '</span>' +
    '</div>' +
    '<h3 class="mt-3 text-base font-semibold text-white">' + n.title + '</h3>';
  if (n.intro) html += '<p class="mt-2 text-sm text-slate-400 leading-relaxed">' + n.intro + '</p>';
  if (n.items && n.items.length) {
    html += '<ul class="mt-3 space-y-2">';
    n.items.forEach((it) => {
      html += '<li class="flex items-start gap-2.5 text-sm text-slate-300">' +
                '<span class="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400/70 shrink-0"></span>' +
                '<span class="leading-relaxed">' + it + '</span>' +
              '</li>';
    });
    html += '</ul>';
  }
  if (n.foot) html += '<p class="mt-3 text-xs text-cyan-200/70 leading-relaxed">' + n.foot + '</p>';
  if (n.link) {
    html += '<a href="' + n.link + '" target="_blank" rel="noopener noreferrer" ' +
            'class="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-white ' +
            'bg-gradient-to-r from-cyan-500/80 to-violet-500/80 hover:from-cyan-400/90 hover:to-violet-400/90 ' +
            'border border-white/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,.3)]">' +
            (n.linkText || '查看详情') + ' ↗</a>';
  }
  item.innerHTML = html;
  return item;
}

export function renderNews() {
  const wrap = $('news-list');
  if (!wrap) return;
  wrap.innerHTML = '';
  sortedNews().slice(0, 3).forEach((n) => {
    wrap.appendChild(buildNewsCard(n, true));
  });
}

export function renderNewsFull() {
  const wrap = $('news-full');
  if (!wrap) return;
  wrap.innerHTML = '';
  const list = sortedNews();
  if (list.length === 0) {
    wrap.innerHTML = '<div class="glass rounded-2xl p-10 text-center text-sm text-slate-500">暂无公告</div>';
    return;
  }
  list.forEach((n) => {
    wrap.appendChild(buildNewsCard(n, false));
  });
}

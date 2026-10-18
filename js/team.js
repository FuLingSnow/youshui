import { $ } from './utils.js';

const GITHUB_SVG =
  '<svg class="w-4 h-4 text-slate-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.13 0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>';

export const TEAM = [
  {
    name: '茯苓',
    role: '服务器所有者',
    roleIcon: '👑',
    qq: '472137987',
    qqLink: 'https://qm.qq.com/q/I3joh9uFWi',
    github: 'FuLingSnow',
    intro: '悠水小筑的创建者与守护者。从开荒的第一铲方块到四服互联，始终坚持以公益为初心，用心维护服务器与社区，希望每一位玩家都能在这里找到属于自己的家园。'
  }
];

export function buildTeamCard(m) {
  const card = document.createElement('div');
  card.className = 'glass rounded-2xl p-5 md:p-6 card-hover flex flex-col items-center text-center';
  const avatar = 'https://q1.qlogo.cn/g?b=qq&nk=' + m.qq + '&s=100';
  let html =
    '<img src="' + avatar + '" alt="' + m.name + '" loading="lazy" ' +
    'onerror="this.onerror=null;this.src=\'https://q1.qlogo.cn/g?b=qq&nk=0&s=100\'" ' +
    'class="w-20 h-20 rounded-full border-2 border-cyan-400/30 object-cover shadow-[0_0_20px_rgba(34,211,238,.15)]" />' +
    '<div class="mt-3 text-base font-semibold text-white">' + m.name + '</div>' +
    '<span class="mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-300 text-[11px]">' +
      (m.roleIcon || '👑') + ' ' + m.role + '</span>' +
    '<p class="mt-3 text-sm text-slate-400 leading-relaxed">' + m.intro + '</p>';
  const links = [];
  if (m.qqLink) {
    links.push(
      '<a href="' + m.qqLink + '" target="_blank" rel="noopener" title="QQ：' + m.qq + '" ' +
      'class="w-8 h-8 rounded-lg glass-soft flex items-center justify-center text-base transition hover:bg-white/10">🐧</a>'
    );
  }
  if (m.github) {
    links.push(
      '<a href="https://github.com/' + m.github + '" target="_blank" rel="noopener" ' +
      'title="GitHub：' + m.github + '" ' +
      'class="w-8 h-8 rounded-lg glass-soft flex items-center justify-center transition hover:bg-white/10">' + GITHUB_SVG + '</a>'
    );
  }
  if (links.length) {
    html += '<div class="mt-4 flex items-center justify-center gap-2">' + links.join('') + '</div>';
  }
  card.innerHTML = html;
  return card;
}

export function renderTeam() {
  const wrap = $('team-list');
  if (!wrap) return;
  wrap.innerHTML = '';
  TEAM.forEach((m) => wrap.appendChild(buildTeamCard(m)));
}

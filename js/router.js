import { $ } from './utils.js';
import { BACKEND_ENABLED } from './config.js';
import { queryDefault } from './monitor.js';
import { queryHomeStatus, queryHomePeak, queryHomeTrend, queryHomeActivePlayers, queryHomeHeatmap, queryHomeDaily } from './home.js';
import { loadPlayer, profileNameFromHash, showProfilePrompt } from './player.js';

export const ROUTES = {
  home:    { view: 'view-home',    title: '悠水小筑 - 我的世界MC服务器状态查询与游玩指南' },
  ...(BACKEND_ENABLED ? {
    monitor: { view: 'view-monitor', title: '悠水小筑 · 服务器状态监控 - 我的世界MC服务器在线查询' },
    player:  { view: 'view-player',  title: '悠水小筑 · 玩家档案 - 我的世界MC服务器玩家数据' },
  } : {}),
  news:    { view: 'view-news',    title: '悠水小筑 · 更新公告 - 我的世界MC服务器资讯' },
  guide:   { view: 'view-guide',   title: '悠水小筑 · 游玩指南 - 我的世界Java版基岩版入服教程' },
  mods:    { view: 'view-mods',    title: '悠水小筑 · 模组服 - 我的世界模组服务器介绍' },
  support: { view: 'view-support', title: '悠水小筑 · 支持我们 - 我的世界MC服务器' },
};

let hasQueried = false;

function parseAnchor() {
  const m = (location.hash || '').match(/\?a=([\w-]+)/);
  return m ? m[1] : null;
}

export function currentRoute() {
  const h = location.hash || '#/';
  if (!BACKEND_ENABLED && (h.startsWith('#/monitor') || h.startsWith('#/player'))) return 'home';
  if (h.startsWith('#/monitor')) return 'monitor';
  if (h.startsWith('#/news')) return 'news';
  if (h.startsWith('#/guide')) return 'guide';
  if (h.startsWith('#/mods')) return 'mods';
  if (h.startsWith('#/support')) return 'support';
  if (h.startsWith('#/player')) return 'player';
  return 'home';
}

function closeMobileMenu() {
  const menu = $('mobile-menu');
  const btn = $('menu-btn');
  const icon = $('menu-icon');
  if (menu) menu.hidden = true;
  if (btn) btn.setAttribute('aria-expanded', 'false');
  if (icon) icon.textContent = '☰';
}

export function renderRoute() {
  const route = currentRoute();

  Object.keys(ROUTES).forEach((key) => {
    const el = $(ROUTES[key].view);
    if (!el) return;
    if (key === route) {
      el.classList.remove('is-hidden');
      el.classList.add('view-enter');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.remove('view-enter'));
      });
    } else {
      el.classList.add('is-hidden');
      el.classList.remove('view-enter');
    }
  });

  document.querySelectorAll('.nav-link').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });

  document.title = ROUTES[route].title;

  closeMobileMenu();

  window.scrollTo(0, 0);

  if (route === 'monitor' && !hasQueried) {
    hasQueried = true;
    queryDefault();
  }

  if (route === 'home' && BACKEND_ENABLED) {
    queryHomeStatus();
    queryHomePeak();
    queryHomeTrend();
    queryHomeActivePlayers();
    queryHomeHeatmap();
    queryHomeDaily();
  }

  if (route === 'player') {
    const pname = profileNameFromHash();
    if (pname) {
      loadPlayer(pname);
    } else {
      showProfilePrompt();
    }
  }

  const anchor = parseAnchor();
  if (anchor) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  }
}

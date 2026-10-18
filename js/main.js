import './starfield.js';

import { $, copyToClipboard } from './utils.js';
import { BACKEND_ENABLED } from './config.js';
import { renderNews, renderNewsFull } from './news.js';
import { renderSupport } from './support.js';
import { renderTeam } from './team.js';
import { queryStatus } from './monitor.js';
import { renderRoute } from './router.js';
import { queryHomeStatus, queryHomePeak, queryHomeTrend, queryHomeActivePlayers, queryHomePlayerWall, queryHomeHeatmap, queryHomeDaily } from './home.js';
import { renderServerCards, fillServerAddrs, fillVersionTexts } from './servers.js';

document.getElementById('year').textContent = new Date().getFullYear();

if (BACKEND_ENABLED) {
  startBackendFeatures();
} else {
  applyBackendOff();
}

renderServerCards();
fillServerAddrs();
fillVersionTexts();
renderNews();
renderNewsFull();
renderSupport();
renderTeam();

function startBackendFeatures() {
  queryHomeStatus();
  queryHomePeak();
  queryHomeTrend();
  queryHomeActivePlayers();
  queryHomePlayerWall();
  queryHomeHeatmap();
  queryHomeDaily();
  setInterval(() => {
    queryHomeStatus();
    queryHomePeak();
    queryHomeTrend();
    queryHomeActivePlayers();
    queryHomePlayerWall();
    queryHomeHeatmap();
    queryHomeDaily();
  }, 60000);

  $('status-form').addEventListener('submit', (e) => {
    e.preventDefault();
    queryStatus();
  });

  $('btn-retry').addEventListener('click', queryStatus);
}

function applyBackendOff() {
  document.documentElement.classList.add('backend-off');
  document.querySelectorAll('[data-backend]').forEach((el) => el.remove());
}

$('menu-btn').addEventListener('click', () => {
  const menu = $('mobile-menu');
  const btn = $('menu-btn');
  const icon = $('menu-icon');
  const willOpen = menu.hidden;
  menu.hidden = !willOpen;
  btn.setAttribute('aria-expanded', String(willOpen));
  icon.textContent = willOpen ? '✕' : '☰';
});

document.querySelectorAll('[data-copy-addr]').forEach((el) => {
  el.addEventListener('click', () => copyAddr(el));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyAddr(el);
    }
  });
});

function copyAddr(el) {
  const addr = el.getAttribute('data-copy-addr');
  if (!addr) return;
  const fb = el.querySelector('[data-copy-feedback]');
  const orig = fb ? (fb.dataset.orig || fb.textContent) : '';
  if (fb) fb.dataset.orig = orig;
  copyToClipboard(addr).then((ok) => {
    if (!fb) return;
    fb.textContent = ok ? '已复制' : '复制失败';
    setTimeout(() => { fb.textContent = orig; }, 1600);
  });
}

window.addEventListener('hashchange', renderRoute);
renderRoute();

import { API_BASE, REQUEST_TIMEOUT, PLAYER_AVATAR } from './config.js';
import { $, avatarColor, avatarFirst, escapeHTML } from './utils.js';

const PROFILE_DAYS = 90;

export function profileNameFromHash() {
  const m = (location.hash || '').match(/\?name=([^&]*)/);
  if (!m) return '';
  try {
    return decodeURIComponent(m[1]);
  } catch (e) {
    return m[1];
  }
}

export async function loadPlayer(name) {
  const box = $('player-profile');
  if (!box) return;
  box.innerHTML = `
    <div class="py-14 flex items-center justify-center gap-2 text-sm text-slate-400">
      <span class="inline-block w-4 h-4 rounded-full border-2 border-cyan-400/60 border-t-transparent animate-spin"></span>
      正在查询 <span class="text-white font-medium">${escapeHTML(name)}</span> 的档案…
    </div>`;
  try {
    const res = await fetch(API_BASE + '/api/home/player-profile?name=' + encodeURIComponent(name) + '&days=' + PROFILE_DAYS, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    const json = await res.json();
    if (!res.ok || !json || !json.ok) {
      box.innerHTML = emptyState('档案查询失败，请稍后重试。');
      return;
    }
    if (!json.found) {
      box.innerHTML = emptyState(`未找到玩家「${escapeHTML(json.name)}」的上线记录（首次出现后即开始永久记录）。<br/>请检查名字拼写，或从玩家墙 / 在线玩家列表点击进入档案。`);
      return;
    }
    box.innerHTML = renderProfile(json);
    const fp = box.querySelector('.footprint-chart');
    if (fp) renderFootprint(fp, json);
  } catch (e) {
    box.innerHTML = emptyState('无法连接后端服务，请稍后重试。');
  }
}

export function showProfilePrompt() {
  const box = $('player-profile');
  if (!box) return;
  box.innerHTML = `
    <div class="py-14 text-center">
      <div class="mx-auto w-16 h-16 rounded-2xl glass-soft flex items-center justify-center text-3xl">👤</div>
      <p class="mt-4 text-sm text-slate-400">从主页「玩家墙 / 近一周活跃玩家」或监控页在线玩家列表点击任意玩家，即可查看 TA 的档案。</p>
    </div>`;
}

function emptyState(message) {
  return `
    <div class="py-14 text-center">
      <div class="mx-auto w-16 h-16 rounded-2xl glass-soft flex items-center justify-center text-3xl">👤</div>
      <p class="mt-4 text-sm text-slate-400 leading-relaxed">${message}</p>
      <a href="#/" class="mt-6 inline-flex items-center gap-1.5 rounded-xl glass-soft px-5 py-2.5 text-sm text-slate-200 hover:bg-white/10 transition">返回主页</a>
    </div>`;
}

function fmtDateTime(ts) {
  const d = new Date(ts * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtMinutes(m) {
  if (m < 60) return m + ' 分钟';
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} 小时 ${r} 分` : `${h} 小时`;
}

function renderProfile(p) {
  const src = PLAYER_AVATAR + encodeURIComponent(p.name) + '/64';
  const online = p.online;
  const stat = (label, value) => `
    <div class="rounded-2xl glass-soft p-4">
      <div class="text-xs text-slate-400">${label}</div>
      <div class="mt-1.5 text-base sm:text-lg text-white font-semibold break-words leading-snug">${value}</div>
    </div>`;

  return `
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <span class="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden text-xl font-bold text-white/85 select-none shrink-0"
            style="background:${avatarColor(p.name)}">
        ${escapeHTML(avatarFirst(p.name))}
        <img src="${src}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover"
             onerror="this.style.display='none'"/>
      </span>
      <div class="flex-1 min-w-0 text-center sm:text-left">
        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <h3 class="text-2xl font-bold text-white break-all">${escapeHTML(p.name)}</h3>
          ${online
            ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs text-emerald-300"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>当前在线</span>'
            : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400"><span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>当前离线</span>'}
        </div>
        <p class="mt-1.5 text-xs text-slate-500">最后上线：${fmtDateTime(p.last_seen)}</p>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      ${stat('首次发现', fmtDateTime(p.first_seen))}
      ${stat('最近活跃', fmtDateTime(p.last_seen))}
      ${stat('活跃天数', p.active_days + ' 天')}
      ${stat('累计在线', fmtMinutes(p.hit_count))}
    </div>

    <div class="mt-7">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="text-xs text-slate-400">📅 每日在线足迹（近 ${p.days} 天）</div>
        <div class="text-[11px] text-slate-500">柱高 = 当天在线分钟</div>
      </div>
      <div class="footprint-chart mt-3 w-full h-40"></div>
    </div>

    <p class="mt-6 text-[11px] text-slate-600">
      每分钟采样一次 · 足迹日志永久保存 · 活跃天数自然日去重 · 累计在线为采样分钟近似。
    </p>`;
}

function renderFootprint(host, p) {
  const daily = Array.isArray(p.daily) ? p.daily : [];
  if (!daily.length) {
    host.innerHTML = '<div class="flex items-center justify-center h-full text-xs text-slate-500">暂无采样数据</div>';
    return;
  }
  const rect = host.getBoundingClientRect();
  const W = Math.max(320, Math.floor(rect.width || host.clientWidth || 640));
  const H = Math.max(120, Math.floor(rect.height || host.clientHeight || 160));
  const padL = 30, padR = 6, padT = 10, padB = 20;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxHits = Math.max(1, ...daily.map((d) => d.hits));
  const niceStep = (m, target) => {
    const raw = m / Math.max(1, target);
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))));
    const norm = raw / mag;
    const f = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return f * mag;
  };
  const step = Math.max(1, niceStep(maxHits, 4));
  const yMax = Math.max(5, Math.ceil(maxHits / step) * step);
  const nTicks = Math.round(yMax / step);
  const n = daily.length;
  const band = innerW / n;
  const barW = Math.max(2, Math.min(18, band * 0.62));
  const labelStep = Math.max(1, Math.ceil(30 / band));
  let gridLines = '';
  let yLabels = '';
  for (let i = 0; i <= nTicks; i++) {
    const v = i * step;
    const y = padT + innerH - (i / nTicks) * innerH;
    gridLines += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="rgba(148,163,184,.12)" stroke-width="1"/>`;
    yLabels += `<text x="${padL - 6}" y="${(y + 3).toFixed(1)}" fill="rgba(148,163,184,.7)" font-size="10" text-anchor="end">${v}</text>`;
  }
  let bars = '';
  let xLabels = '';
  let lastShown = 0;
  daily.forEach((d, i) => {
    const cx = padL + band * i + band / 2;
    const x = (cx - barW / 2).toFixed(1);
    const v = Math.max(0, d.hits || 0);
    const bh = v > 0 ? Math.max(2, (v / yMax) * innerH) : 1.5;
    const y = (padT + innerH - bh).toFixed(1);
    const fill = v > 0 ? 'url(#fpFill)' : 'rgba(148,163,184,.14)';
    bars += `<rect class="fbar" x="${x}" y="${y}" width="${barW}" height="${bh.toFixed(1)}" rx="${Math.min(2, barW / 3)}" fill="${fill}"/>`;
    if (i % labelStep === 0) {
      xLabels += `<text x="${cx.toFixed(1)}" y="${H - 6}" fill="rgba(148,163,184,.7)" font-size="9" text-anchor="middle">${d.label}</text>`;
      lastShown = i;
    }
  });
  if (n - 1 > lastShown && (n - 1 - lastShown) * band >= 26) {
    const cx = padL + band * (n - 1) + band / 2;
    xLabels += `<text x="${cx.toFixed(1)}" y="${H - 6}" fill="rgba(148,163,184,.7)" font-size="9" text-anchor="middle">${daily[n - 1].label}</text>`;
  }
  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="none" class="block">
      <defs>
        <linearGradient id="fpFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(34,211,238,.5)"/>
          <stop offset="100%" stop-color="rgba(34,211,238,.9)"/>
        </linearGradient>
      </defs>
      ${gridLines}
      ${yLabels}
      ${bars}
      ${xLabels}
      <g class="tt-group" style="display:none; pointer-events:none">
        <line class="tt-guide" stroke="rgba(148,163,184,.45)" stroke-width="1" stroke-dasharray="2 2"/>
        <g class="tt-box">
          <rect width="98" height="30" rx="5" fill="rgba(15,23,42,.92)" stroke="rgba(103,232,249,.45)"/>
          <text class="tt-val" x="49" y="13" fill="rgba(255,255,255,.96)" font-size="11" text-anchor="middle" font-weight="600">--</text>
          <text class="tt-time" x="49" y="24" fill="rgba(148,163,184,.9)" font-size="9" text-anchor="middle">--</text>
        </g>
      </g>
    </svg>
  `;
  const svg = host.querySelector('svg');
  const rects = [...svg.querySelectorAll('rect.fbar')];
  const defs = rects.map((r) => r.getAttribute('fill'));
  const ttGroup = svg.querySelector('.tt-group');
  const guide = svg.querySelector('.tt-guide');
  const box = svg.querySelector('.tt-box');
  const valText = svg.querySelector('.tt-val');
  const timeText = svg.querySelector('.tt-time');
  const ttW = 98, ttH = 30;
  let prevIdx = -1;
  const resetPrev = () => {
    if (prevIdx >= 0) rects[prevIdx].setAttribute('fill', defs[prevIdx]);
    prevIdx = -1;
  };
  svg.addEventListener('mousemove', (e) => {
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    const localX = ((e.clientX - r.left) / r.width) * W;
    if (localX < padL - 4 || localX > W - padR + 4) {
      ttGroup.style.display = 'none';
      resetPrev();
      return;
    }
    const idx = Math.max(0, Math.min(n - 1, Math.round((localX - padL) / band)));
    if (idx !== prevIdx) {
      resetPrev();
      prevIdx = idx;
      rects[idx].setAttribute('fill', 'rgba(251,191,36,.85)');
    }
    const cx = padL + band * idx + band / 2;
    guide.setAttribute('x1', cx.toFixed(1));
    guide.setAttribute('x2', cx.toFixed(1));
    guide.setAttribute('y1', padT);
    guide.setAttribute('y2', (padT + innerH).toFixed(1));
    const d = daily[idx];
    let bx = cx + 8;
    if (bx + ttW > W - 2) bx = cx - ttW - 8;
    const ry = parseFloat(rects[idx].getAttribute('y'));
    let by = ry - ttH - 6;
    if (by < padT) by = Math.min(ry + 6, H - padB - ttH);
    if (by + ttH > H - padB) by = H - padB - ttH;
    box.setAttribute('transform', `translate(${bx.toFixed(1)}, ${by.toFixed(1)})`);
    valText.textContent = d.hits > 0 ? `${d.hits} 分钟` : '未上线';
    timeText.textContent = d.date;
    ttGroup.style.display = '';
  });
  svg.addEventListener('mouseleave', () => {
    ttGroup.style.display = 'none';
    resetPrev();
  });
}

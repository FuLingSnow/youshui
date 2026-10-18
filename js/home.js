import { API_BASE, REQUEST_TIMEOUT, PLAYER_AVATAR } from './config.js';
import { $, avatarColor, avatarFirst, escapeHTML } from './utils.js';

const AVATAR_SIZE = '/64';

const HOME_SERVER = { host: 'flyzm.online', port: 25565 };

export async function queryHomeStatus() {
  const dot = $('home-badge-dot');
  const text = $('home-badge-text');
  if (!dot || !text) return;
  const url = API_BASE + '/api/home/snapshot';
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    const json = await res.json();
    if (json && json.ok) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.9)]';
      text.textContent = json.online + '/' + json.max + ' 人';
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-rose-500';
      text.textContent = '服务器离线';
    }
  } catch {
    dot.className = 'w-2 h-2 rounded-full bg-amber-400';
    text.textContent = '加载中…';
  }
}

export async function queryHomePeak() {
  const val = $('home-peak-value');
  if (!val) return;
  try {
    const res = await fetch(API_BASE + '/api/home/peak', { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    const json = await res.json();
    if (json && json.ok && json.peak) {
      val.textContent = json.peak.online + ' 人';
    } else {
      val.textContent = '—';
    }
  } catch {
    val.textContent = '—';
  }
}

export async function queryHomeTrend() {
  const wrap = $('home-trend-chart');
  const stat = $('home-trend-stat');
  const count = $('home-trend-count');
  if (!wrap) return;
  try {
    const res = await fetch(API_BASE + '/api/home/trend', { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    const json = await res.json();
    const points = (json && json.points) || [];
    renderTrend(wrap, points);
    if (count) count.textContent = String(points.length);
    if (stat) {
      if (points.length === 0) {
        stat.textContent = '暂无数据';
      } else {
        const online = points.map(p => p.online);
        const max = Math.max(...online);
        const avg = (online.reduce((a, b) => a + b, 0) / online.length).toFixed(1);
        const last = points[points.length - 1].online;
        stat.textContent = `当前 ${last} · 峰值 ${max} · 均值 ${avg}`;
      }
    }
  } catch {
    wrap.innerHTML = '<div class="h-full flex items-center justify-center text-xs text-slate-500">加载失败</div>';
  }
}

function renderTrend(wrap, points) {
  if (!points.length) {
    wrap.innerHTML = '<div class="h-full flex items-center justify-center text-xs text-slate-500">暂无数据</div>';
    return;
  }
  const rect = wrap.getBoundingClientRect();
  const W = Math.max(320, Math.floor(rect.width));
  const H = Math.max(120, Math.floor(rect.height));
  const padL = 32, padR = 8, padT = 8, padB = 22;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxOnline = Math.max(1, ...points.map(p => p.online));
  const niceStep = (m, target) => {
    const raw = m / Math.max(1, target);
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))));
    const norm = raw / mag;
    const f = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return f * mag;
  };
  const step = niceStep(maxOnline, 5);
  const yMax = Math.max(5, Math.ceil(maxOnline / step) * step);
  const nTicks = Math.round(yMax / step);
  const xStep = points.length > 1 ? innerW / (points.length - 1) : innerW;
  const yPx = (v) => padT + innerH - (v / yMax) * innerH;

  let gridLines = '';
  let yLabels = '';
  for (let i = 0; i <= nTicks; i++) {
    const v = i * step;
    const y = padT + innerH - (i / nTicks) * innerH;
    gridLines += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="rgba(148,163,184,.12)" stroke-width="1"/>`;
    yLabels += `<text x="${padL - 6}" y="${(y + 3).toFixed(1)}" fill="rgba(148,163,184,.7)" font-size="10" text-anchor="end">${v}</text>`;
  }

  const pts = points.map((p, i) => {
    const x = padL + i * xStep;
    const y = yPx(p.online);
    return [x.toFixed(1), y.toFixed(1)];
  });
  const linePath = pts.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${padT + innerH} L ${pts[0][0]} ${padT + innerH} Z`;

  const n = points.length;
  const first = points[0], last = points[n - 1];
  const fmt = (ts) => {
    const d = new Date(ts * 1000);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  };
  const xLabels = `
    <text x="${padL}" y="${H - 6}" fill="rgba(148,163,184,.7)" font-size="10">${fmt(first.ts)}</text>
    <text x="${(W - padR).toFixed(1)}" y="${H - 6}" fill="rgba(148,163,184,.7)" font-size="10" text-anchor="end">${fmt(last.ts)}</text>
  `;

  const lastXY = pts[pts.length - 1];
  const maxIdx = points.reduce((mi, p, i) => (p.online > points[mi].online ? i : mi), 0);
  const maxXY = pts[maxIdx];

  wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="none" class="block">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(34,211,238,.45)"/>
          <stop offset="100%" stop-color="rgba(34,211,238,0)"/>
        </linearGradient>
      </defs>
      ${gridLines}
      ${yLabels}
      <path d="${areaPath}" fill="url(#trendFill)"/>
      <path d="${linePath}" fill="none" stroke="rgba(34,211,238,.95)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${maxXY[0]}" cy="${maxXY[1]}" r="3" fill="rgba(251,191,36,.95)" stroke="rgba(15,23,42,.9)" stroke-width="1"/>
      <circle cx="${lastXY[0]}" cy="${lastXY[1]}" r="3" fill="rgba(16,185,129,.95)" stroke="rgba(15,23,42,.9)" stroke-width="1"/>
      <g class="tt-group" style="display:none; pointer-events:none">
        <line class="tt-guide" stroke="rgba(148,163,184,.45)" stroke-width="1" stroke-dasharray="2 2"/>
        <circle class="tt-dot" r="4" fill="rgba(34,211,238,1)" stroke="rgba(15,23,42,.9)" stroke-width="1.5"/>
        <g class="tt-box">
          <rect width="72" height="28" rx="5" fill="rgba(15,23,42,.92)" stroke="rgba(103,232,249,.45)"/>
          <text class="tt-val" x="36" y="13" fill="rgba(255,255,255,.96)" font-size="11" text-anchor="middle" font-weight="600">--</text>
          <text class="tt-time" x="36" y="23" fill="rgba(148,163,184,.9)" font-size="9" text-anchor="middle">--</text>
        </g>
      </g>
      ${xLabels}
    </svg>
  `;

  const svg = wrap.querySelector('svg');
  const ttGroup = svg.querySelector('.tt-group');
  const guide = svg.querySelector('.tt-guide');
  const dot = svg.querySelector('.tt-dot');
  const box = svg.querySelector('.tt-box');
  const valText = svg.querySelector('.tt-val');
  const timeText = svg.querySelector('.tt-time');

  svg.addEventListener('mousemove', (e) => {
    const r = svg.getBoundingClientRect();
    if (!r.width) return;
    const localX = ((e.clientX - r.left) / r.width) * W;
    if (localX < padL - 4 || localX > W - padR + 4) {
      ttGroup.style.display = 'none';
      return;
    }
    const idx = Math.max(0, Math.min(points.length - 1, Math.round((localX - padL) / xStep)));
    const [px, py] = pts[idx];
    const p = points[idx];
    const pxNum = parseFloat(px);
    const pyNum = parseFloat(py);
    ttGroup.style.display = '';
    guide.setAttribute('x1', px);
    guide.setAttribute('x2', px);
    guide.setAttribute('y1', padT);
    guide.setAttribute('y2', (padT + innerH).toFixed(1));
    dot.setAttribute('cx', px);
    dot.setAttribute('cy', py);
    const ttW = 72, ttH = 28;
    let bx = pxNum + 8;
    if (bx + ttW > W - 2) bx = pxNum - ttW - 8;
    let by = pyNum - ttH / 2;
    if (by < padT) by = padT;
    if (by + ttH > padT + innerH) by = padT + innerH - ttH;
    box.setAttribute('transform', `translate(${bx.toFixed(1)}, ${by.toFixed(1)})`);
    valText.textContent = `${p.online} 人`;
    timeText.textContent = fmt(p.ts);
  });
  svg.addEventListener('mouseleave', () => {
    ttGroup.style.display = 'none';
  });
}

export async function queryHomeActivePlayers() {
  const list = $('home-active-list');
  const empty = $('home-active-empty');
  const brief = $('home-week-brief');
  if (!list) return;
  try {
    const [listRes, cmpRes] = await Promise.all([
      fetch(API_BASE + '/api/home/active-players?days=7&min_days=3', { signal: AbortSignal.timeout(REQUEST_TIMEOUT) }),
      fetch(API_BASE + '/api/home/player-comparison?days=7', { signal: AbortSignal.timeout(REQUEST_TIMEOUT) }),
    ]);
    const json = await listRes.json();
    const items = (json && json.items) || [];
    if (items.length === 0) {
      list.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
    } else {
      if (empty) empty.classList.add('hidden');
      list.innerHTML = items.map((it) => {
        const dayWord = it.days >= 7 ? '满勤' : `${it.days} 天`;
        const src = PLAYER_AVATAR + encodeURIComponent(it.name) + AVATAR_SIZE;
        const href = '#/player?name=' + encodeURIComponent(it.name);
        return `
          <a href="${href}" title="查看 ${escapeHTML(it.name)} 的玩家档案"
             class="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 hover:bg-white/5 transition">
            <span class="flex items-center gap-2 min-w-0">
              <span class="relative inline-flex items-center justify-center w-6 h-6 rounded-full overflow-hidden shrink-0 text-[10px] font-bold text-white/85 select-none" style="background:${avatarColor(it.name)}">
                ${escapeHTML(avatarFirst(it.name))}
                <img src="${src}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover"/>
              </span>
              <span class="text-slate-200 truncate">${escapeHTML(it.name)}</span>
            </span>
            <span class="shrink-0 text-[11px] ${it.days >= 7 ? 'text-emerald-300' : 'text-cyan-300'}">${dayWord}</span>
          </a>
        `;
      }).join('');
      list.querySelectorAll('img').forEach((img) => {
        img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
      });
    }
    if (brief) {
      if (cmpRes.ok) {
        const cmp = await cmpRes.json();
        brief.textContent = cmp && cmp.ok
          ? `本周新面孔 ${cmp.new_players} 人 · ${cmp.returning_players} 位老友回归`
          : '本周玩家统计暂不可用';
      } else {
        brief.textContent = '本周玩家统计暂不可用';
      }
    }
  } catch {
    list.innerHTML = '<li class="text-xs text-slate-500 px-2.5 py-1.5">加载失败</li>';
    if (brief) brief.textContent = '本周玩家统计暂不可用';
  }
}

export async function queryHomePlayerWall() {
  const grid = $('home-wall-grid');
  const total = $('home-wall-total');
  if (!grid) return;
  try {
    const res = await fetch(API_BASE + '/api/home/player-wall?days=30&limit=120', { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    const json = await res.json();
    const items = (json && json.items) || [];
    grid.innerHTML = items.map((it) => {
      const src = PLAYER_AVATAR + encodeURIComponent(it.name) + '/48';
      const href = '#/player?name=' + encodeURIComponent(it.name);
      return `
        <a href="${href}" title="${escapeHTML(it.name)} · 活跃 ${it.days} 天 · 点击查看档案"
           class="relative inline-flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden text-[9px] font-bold text-white/85 select-none transition hover:ring-2 hover:ring-cyan-400/70"
           style="background:${avatarColor(it.name)}">
          ${escapeHTML(avatarFirst(it.name))}
          <img src="${src}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover"/>
        </a>
      `;
    }).join('');
    grid.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
    });
    if (total) total.textContent = json && json.ok ? String(json.total) : '—';
  } catch {
    grid.innerHTML = '';
    if (total) total.textContent = '—';
  }
}

const HEAT_WEEKDAY = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
let heatRetry = 0;
const resizeRedraws = {};
function bindResizeRedraw(key, chart, redraw) {
  const prev = resizeRedraws[key];
  if (prev) window.removeEventListener('resize', prev.fn);
  let timer = null;
  const fn = () => {
    if (!document.body.contains(chart)) {
      window.removeEventListener('resize', fn);
      delete resizeRedraws[key];
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => redraw(), 120);
  };
  resizeRedraws[key] = { fn };
  window.addEventListener('resize', fn);
}

export async function queryHomeHeatmap() {
  const chart = $('home-heatmap-chart');
  const note = $('home-heatmap-note');
  if (!chart) return;
  if (!chart.getClientRects().length) return;
  try {
    const res = await fetch(API_BASE + '/api/home/heatmap?days=30', { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    const json = await res.json();
    renderHeatmap(chart, json);
    bindResizeRedraw('heat', chart, () => renderHeatmap(chart, json));
    if (note) {
      if (json && json.ok && json.peak && json.peak.avg > 0) {
        const p = json.peak;
        note.textContent = `最热闹时段：${HEAT_WEEKDAY[p.weekday]} ${String(p.hour).padStart(2, '0')}:00`;
      } else {
        note.textContent = '暂无足够采样数据';
      }
    }
  } catch {
    chart.innerHTML = '<div class="text-xs text-slate-500 py-4">加载失败</div>';
    if (note) note.textContent = '';
  }
}

function renderHeatmap(chart, json) {
  if (!json || !json.ok || !json.matrix) {
    chart.innerHTML = '<div class="text-xs text-slate-500 py-4">暂无数据</div>';
    return;
  }
  const availW = Math.floor(chart.getBoundingClientRect().width) || 0;
  if (availW < 280) {
    if (heatRetry < 30) {
      heatRetry++;
      requestAnimationFrame(() => renderHeatmap(chart, json));
      return;
    }
    heatRetry = 0;
  }
  const matrix = json.matrix;
  const maxAvg = Math.max(1, json.max_avg || 0);
  const cols = 24, rows = 7, gap = 3;
  const padL = 30, padT = 6, padB = 18, padR = 8;
  const cellH = 10;
  const usable = Math.max(0, availW - padL - padR);
  let cellW = Math.floor((usable - (cols - 1) * gap) / cols);
  cellW = Math.max(4, Math.min(30, cellW));
  const W = padL + cols * cellW + (cols - 1) * gap + padR;
  const H = padT + rows * cellH + (rows - 1) * gap + padB;
  const col = (i) => padL + i * (cellW + gap);
  const rowY = (i) => padT + i * (cellH + gap);
  const fill = (v) => (v <= 0 ? 'rgba(148,163,184,.08)' : `rgba(34,211,238,${(0.16 + 0.78 * (v / maxAvg)).toFixed(3)})`);
  let cells = '';
  for (let wd = 0; wd < rows; wd++) {
    const y = rowY(wd);
    cells += `<text x="${padL - 6}" y="${(y + cellH / 2 + 3).toFixed(1)}" fill="rgba(148,163,184,.75)" font-size="9" text-anchor="end">${HEAT_WEEKDAY[wd].charAt(1)}</text>`;
    for (let hr = 0; hr < cols; hr++) {
      const v = matrix[wd][hr] || 0;
      cells += `
        <rect x="${col(hr)}" y="${y.toFixed(1)}" width="${cellW}" height="${cellH}" rx="2" fill="${fill(v)}">
          <title>${HEAT_WEEKDAY[wd]} ${String(hr).padStart(2, '0')}:00 · 平均 ${v} 人</title>
        </rect>`;
    }
  }
  let axis = '';
  [0, 6, 12, 18, 23].forEach((hr) => {
    axis += `<text x="${col(hr)}" y="${H - 4}" fill="rgba(148,163,184,.6)" font-size="8">${String(hr).padStart(2, '0')}</text>`;
  });
  chart.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="block mx-auto">
      ${cells}
      ${axis}
    </svg>
  `;
}

export async function queryHomeDaily() {
  const chart = $('home-daily-chart');
  const note = $('home-daily-note');
  if (!chart) return;
  try {
    const res = await fetch(API_BASE + '/api/home/daily-peak?days=7', { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
    const json = await res.json();
    renderDaily(chart, json);
    bindResizeRedraw('daily', chart, () => renderDaily(chart, json));
    if (note) {
      const items = (json && json.ok && json.items) || [];
      note.textContent = items.length && json.max_peak > 0 ? `近 7 天最高 ${json.max_peak} 人` : '暂无数据';
    }
  } catch {
    chart.innerHTML = '<div class="text-xs text-slate-500 py-3">加载失败</div>';
    if (note) note.textContent = '';
  }
}

function renderDaily(chart, json) {
  const items = (json && json.ok && Array.isArray(json.items)) ? json.items : [];
  if (!items.length) {
    chart.innerHTML = '<div class="text-xs text-slate-500 py-3">暂无采样数据</div>';
    return;
  }
  const availW = Math.floor(chart.clientWidth) || 0;
  const baseW = 440;
  const minW = 240;
  const W = availW >= baseW ? availW : Math.max(minW, availW);
  const H = 112;
  const padL = 4, padR = 4, padT = 16, padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxPeak = Math.max(0, json.max_peak || 0);
  const yMax = Math.max(3, Math.ceil((maxPeak + 1) / 2) * 2);
  const band = innerW / items.length;
  const barW = Math.max(8, Math.min(32, Math.floor(band * 0.55)));
  let bars = '';
  let labels = '';
  items.forEach((it, i) => {
    const cx = padL + band * i + band / 2;
    const x = (cx - barW / 2).toFixed(1);
    const v = Math.max(0, it.peak || 0);
    const bh = v > 0 ? Math.max(2, (v / yMax) * innerH) : 1.5;
    const y = (padT + innerH - bh).toFixed(1);
    const alpha = v > 0 ? 0.35 + 0.55 * (v / Math.max(1, maxPeak)) : 0;
    const fill = v > 0 ? `rgba(34,211,238,${alpha.toFixed(3)})` : 'rgba(148,163,184,.14)';
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${bh.toFixed(1)}" rx="3" fill="${fill}"></rect>`;
    if (v > 0) {
      bars += `<text x="${cx}" y="${(padT + innerH - bh - 4).toFixed(1)}" fill="rgba(226,232,240,.9)" font-size="9" text-anchor="middle">${v}</text>`;
    }
    labels += `<text x="${cx}" y="${H - 14}" fill="rgba(148,163,184,.8)" font-size="9" text-anchor="middle">${it.label}</text>`;
    labels += `<text x="${cx}" y="${H - 3}" fill="rgba(148,163,184,.55)" font-size="8" text-anchor="middle">${HEAT_WEEKDAY[it.weekday] ? HEAT_WEEKDAY[it.weekday].charAt(1) : ''}</text>`;
  });
  chart.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="block mx-auto">
      ${bars}
      ${labels}
    </svg>
  `;
}

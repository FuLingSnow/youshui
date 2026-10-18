import { API_BASE, DEFAULT_HOST, DEFAULT_PORT, REQUEST_TIMEOUT, PLAYER_AVATAR, SERVERS } from './config.js';
import { $, cleanMOTD, avatarColor, avatarFirst, escapeHTML } from './utils.js';
import { serverAddr } from './servers.js';

export function showOnly(id) {
  ['skeleton', 'online-view', 'error-view'].forEach((v) => {
    const el = $(v);
    if (!el) return;
    const show = v === id;
    el.hidden = !show;
    el.classList.toggle('is-hidden', !show);
  });
}

export function setHeaderBadge(state) {
  const dot = $('header-dot');
  const text = $('header-badge-text');
  if (!dot || !text) return;
  dot.className = 'w-2 h-2 rounded-full';
  if (state === 'online') {
    dot.classList.add('bg-emerald-400', 'shadow-[0_0_10px_rgba(52,211,153,.9)]');
    text.textContent = '服务器在线监控中';
  } else if (state === 'offline') {
    dot.classList.add('bg-rose-500', 'shadow-[0_0_10px_rgba(244,63,94,.9)]');
    text.textContent = '服务器离线或不可达';
  } else if (state === 'loading') {
    dot.classList.add('bg-amber-400', 'animate-pulse');
    text.textContent = '正在查询服务器…';
  } else {
    dot.classList.add('bg-slate-500');
    text.textContent = '后端服务未连接';
  }
}

export function renderOnline(data) {
  showOnly('online-view');
  setHeaderBadge('online');

  const icon = data.icon;
  if (icon) {
    $('server-icon').src = icon;
    $('server-icon').classList.remove('hidden');
    $('icon-fallback').classList.add('hidden');
  } else {
    $('server-icon').classList.add('hidden');
    $('icon-fallback').classList.remove('hidden');
  }

  $('server-motd').textContent = cleanMOTD(data.motd) || '（服务器未设置 MOTD）';
  const isBedrock = data.protocol === 'bedrock';
  const defaultPort = isBedrock ? 19132 : 25565;
  $('server-host').textContent = data.host + (data.port !== defaultPort ? ':' + data.port : '');
  $('server-version').textContent = data.version;
  $('server-latency').textContent = data.latency_ms;
  $('server-players').textContent = data.players.online;
  $('server-max').textContent = data.players.max;

  const protocolBadge = $('server-protocol');
  if (protocolBadge) {
    if (isBedrock) {
      protocolBadge.textContent = '基岩版';
      protocolBadge.className = 'inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-[10px] font-semibold tracking-wide text-amber-300 align-middle mr-1.5';
    } else {
      protocolBadge.textContent = 'JAVA';
      protocolBadge.className = 'inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/20 text-[10px] font-semibold tracking-wide text-cyan-300 align-middle mr-1.5';
    }
  }

  const dot = $('status-dot');
  dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)] animate-pulse';
  $('status-text').textContent = '在线';

  const on = data.players.online, max = data.players.max || 1;
  $('bar-players').textContent = on;
  $('bar-max').textContent = data.players.max;
  $('player-bar').style.width = Math.min(100, Math.round((on / max) * 100)) + '%';

  const list = data.player_list || [];
  $('player-count').textContent = '(' + list.length + ')';
  const box = $('player-list');
  box.innerHTML = '';
  if (list.length === 0) {
    box.innerHTML = '<span class="text-sm text-slate-500">暂无在线玩家（部分服务器不公开玩家列表）</span>';
  } else {
    list.slice(0, 100).forEach((name) => {
      const src = PLAYER_AVATAR + encodeURIComponent(name) + '/40';
      const el = document.createElement('a');
      el.href = '#/player?name=' + encodeURIComponent(name);
      el.title = name + ' · 点击查看玩家档案';
      el.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-200 hover:border-cyan-400/40 hover:text-cyan-200 transition';
      el.innerHTML = `
        <span class="relative inline-flex items-center justify-center w-5 h-5 rounded-full overflow-hidden shrink-0 text-[9px] font-bold text-white/85 select-none" style="background:${avatarColor(name)}">
          ${escapeHTML(avatarFirst(name))}
          <img src="${src}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover"/>
        </span>
        <span>${escapeHTML(name)}</span>`;
      el.querySelector('img').addEventListener('error', () => { el.querySelector('img').style.display = 'none'; }, { once: true });
      box.appendChild(el);
    });
    if (list.length > 100) {
      box.insertAdjacentHTML('beforeend', '<span class="px-3 py-1.5 text-xs text-slate-500">+ ' + (list.length - 100) + ' 人</span>');
    }
  }

  const srvTip = data.srv ? ' · SRV 解析到 ' + data.srv.split(' -> ')[1] : '';
  const protoTip = isBedrock ? '基岩版' : 'Java 版';
  $('query-meta').textContent = '查询耗时 ' + data.elapsed_ms + ' ms' + srvTip + ' · ' + protoTip + ' · 数据来源：悠水小筑';
}

export function renderError(title, message) {
  showOnly('error-view');
  $('error-title').textContent = title;
  $('error-message').textContent = message;
  const iconBox = $('error-icon');
  iconBox.className = 'w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center text-3xl mb-4';
  iconBox.textContent = '⚠️';
  setHeaderBadge(title === '后端服务未连接' ? 'none' : 'offline');
}

export function queryDefault() {
  $('input-host').value = DEFAULT_HOST;
  $('input-port').value = String(DEFAULT_PORT);
  queryStatus();
}

(() => {
  const protoSel = $('input-protocol');
  const portInput = $('input-port');
  if (!protoSel || !portInput) return;
  protoSel.addEventListener('change', () => {
    portInput.value = protoSel.value === 'bedrock' ? '19132' : '25565';
  });
})();

let statusInFlight = false;

export async function queryStatus() {
  if (statusInFlight) return;
  statusInFlight = true;

  const host = ($('input-host').value || DEFAULT_HOST).trim();
  const port = parseInt($('input-port').value, 10) || DEFAULT_PORT;
  const protocol = (($('input-protocol') || {}).value || 'java');

  if (!host) {
    renderError('地址无效', '请输入服务器地址，例如 flyzm.online');
    statusInFlight = false;
    return;
  }

  showOnly('skeleton');
  setHeaderBadge('loading');
  $('btn-query').disabled = true;
  $('btn-query').textContent = '查询中…';

  const url = API_BASE + '/api/mc/status?host=' + encodeURIComponent(host) + '&port=' + port + '&protocol=' + encodeURIComponent(protocol);
  const controller = new AbortController();
  const abortAfter = (protocol === 'bedrock' || protocol === 'auto') ? 25000 : REQUEST_TIMEOUT;
  const timer = setTimeout(() => controller.abort(), abortAfter);

  try {
    let resp;
    try {
      resp = await fetch(url, { signal: controller.signal });
    } catch (err) {
      if (err.name === 'AbortError') {
        renderError('请求超时', '后端服务响应超时，请稍后重试。');
      } else {
        renderError('后端服务未连接', '无法连接后端服务，请稍后重试。');
      }
      return;
    }

    let json = null;
    try {
      json = await resp.json();
    } catch (_) {
      json = null;
    }

    if (json && json.error) {
      const e = json.error;
      renderError('查询失败', (e.message || '未知错误') + '（错误码：' + (e.code || 'UNKNOWN') + '）');
      return;
    }

    if (!resp.ok) {
      if (resp.status === 429) {
        renderError('查询过于频繁', '请求太频繁啦，请稍等几秒再试。');
      } else if (resp.status >= 500) {
        renderError('后端服务繁忙', '后端服务暂时不可用，请稍后重试。');
      } else {
        renderError('请求失败', '请求未成功（HTTP ' + resp.status + '），请稍后重试。');
      }
      return;
    }

    if (json && json.success && json.data) {
      renderOnline(json.data);
    } else {
      const e = json && json.error ? json.error : {};
      renderError('服务器离线', (e.message || '未知错误') + '（错误码：' + (e.code || 'UNKNOWN') + '）');
    }
  } catch (err) {
    renderError('数据解析失败', '后端返回的数据无法解析，请稍后重试。');
  } finally {
    clearTimeout(timer);
    statusInFlight = false;
    $('btn-query').disabled = false;
    $('btn-query').textContent = '查询状态';
  }
}

(() => {
  const wrap = $('quick-servers');
  if (!wrap) return;
  wrap.innerHTML = SERVERS.map((srv) => `
    <button type="button" data-server="${srv.key}"
            class="inline-flex items-center gap-2 rounded-xl glass-soft px-3.5 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white">
      <span class="font-mono font-semibold text-cyan-300">${serverAddr(srv)}</span>
      <span>${srv.label} · ${srv.edition}</span>
    </button>`).join('');
  wrap.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const srv = SERVERS.find((s) => s.key === btn.dataset.server);
      if (!srv) return;
      $('input-host').value = srv.host;
      $('input-port').value = String(srv.port);
      const proto = $('input-protocol');
      if (proto && srv.protocol) proto.value = srv.protocol;
      queryStatus();
    });
  });
})();

import { SERVERS, SUBWORLDS, RECOMMENDED_VERSION, VERSION_MIN, VERSION_MAX, VERSION_RANGE } from './config.js';
import { $ } from './utils.js';

const VERSION_TEXT = {
  recommended: RECOMMENDED_VERSION,
  min: VERSION_MIN,
  max: VERSION_MAX,
  range: VERSION_RANGE,
};

export function serverAddr(srv) {
  const defPort = srv.protocol === 'bedrock' ? 19132 : 25565;
  return srv.port && srv.port !== defPort ? srv.host + ':' + srv.port : srv.host;
}

export function fillServerAddrs() {
  document.querySelectorAll('[data-srv]').forEach((el) => {
    const srv = SERVERS.find((s) => s.key === el.dataset.srv);
    if (srv) el.textContent = serverAddr(srv);
  });
}

export function fillVersionTexts() {
  document.querySelectorAll('[data-ver]').forEach((el) => {
    const text = VERSION_TEXT[el.dataset.ver];
    if (text) el.textContent = text;
  });
}

export function renderServerCards() {
  const ipBox = $('home-server-ip');
  if (ipBox) {
    ipBox.innerHTML = SERVERS.map((srv) => `
      <div role="button" tabindex="0" data-copy-addr="${serverAddr(srv)}"
           title="点击复制${srv.label}地址 ${serverAddr(srv)}"
           aria-label="点击复制${srv.label}地址 ${serverAddr(srv)}"
           class="cursor-pointer select-none rounded-lg -mx-1 px-1 py-1 transition hover:bg-white/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="font-mono text-cyan-300 font-semibold text-sm md:text-base break-all">${serverAddr(srv)}</span>
          <span class="shrink-0 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300">${srv.edition}</span>
        </div>
        <div class="mt-0.5 text-[11px] text-slate-500"><span data-copy-feedback>点击复制</span> · ${srv.tip}</div>
      </div>
    `).join('');
  }

  const countBox = $('home-server-count');
  if (countBox) countBox.textContent = String(SUBWORLDS.length);
  const listBox = $('home-subworld-list');
  if (listBox) {
    listBox.innerHTML = SUBWORLDS.map((w) => `
      <a href="#/guide?a=gameplay" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full glass-soft text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition">
        <span>${w.icon}</span>${w.name}
      </a>
    `).join('');
  }
}

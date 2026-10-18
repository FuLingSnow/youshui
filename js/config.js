export const BACKEND_ENABLED = true;
export const API_BASE = BACKEND_ENABLED ? 'https://api.flyzm.online' : '';
export const DEFAULT_HOST = 'flyzm.online';
export const DEFAULT_PORT = 25565;
export const REQUEST_TIMEOUT = 8000;
export const PLAYER_AVATAR = 'https://minotar.net/avatar/';

export const RECOMMENDED_VERSION = '26.3';
export const VERSION_MIN = '1.20.1';
export const VERSION_MAX = '26.3';
export const VERSION_RANGE = `${VERSION_MIN} - ${VERSION_MAX}`;

export const SERVERS = [
  { key: 'main', label: '主入口', host: 'flyzm.online', port: 25565, protocol: 'java', edition: 'Java 版', tip: `支持 ${VERSION_RANGE} 跨版本连接` },
  { key: 'backup', label: '备用入口', host: 'mc.flyzm.online', port: 1, protocol: 'java', edition: 'Java 版', tip: '主入口连不上时使用' },
  { key: 'bedrock', label: '基岩入口', host: 'mc.flyzm.online', port: 2, protocol: 'bedrock', edition: '基岩版', tip: '手机 / Win 国际版适用' },
];

export const SUBWORLDS = [
  { icon: '⚡', name: '生电工坊', tag: '技术服' },
  { icon: '🏰', name: '主域服', tag: '生存服' },
  { icon: '🛝', name: '游乐幻境', tag: '迷你游戏服' },
  { icon: '🌌', name: '狭域万象', tag: '特色玩法服' },
];

export const DONORS = [
  { qq: '768289964', qqq: 1 },
  { qq: '313298737', qqq: 2 },
];

export const NEWS = [
  {
    date: '2026-08-25',
    tag: '活动',
    title: '指定服务端抽奖开启',
    intro: '回馈玩家福利来啦！指定服务端抽奖现已开启，共 2 个名额。',
    items: [
      '开奖时间：8 月 28 日 20:00',
      '中奖名单将在开奖后于公告中公布',
    ],
    foot: '心动不如行动，说不定欧皇就是你！',
    link: 'https://m.q.qq.com/a/p/1110632690?s=pages%2Flottery-detail%2Findex%3FlotteryId%3D1400948',
    linkText: '立即参与抽奖',
  },
  {
    date: '2026-08-25',
    tag: '新服',
    title: '全新子服「狭域万象」上线',
    intro: '狭域万象子服正式入驻悠水小筑，全新「浮域空岛」模式内测中。',
    items: [
      '浮域空岛：漂浮的空岛群间拓展领地，空中家园等你搭建-内测中',
      '单方块随机空岛：从一颗方块开始，层层挖掘，随机世界由你创造-计划中',
      '海域生存：置身汪洋，于海面与岛屿间开启漂泊冒险-计划中',
      '内测期间欢迎反馈建议，玩法将根据大家意见持续打磨',
    ],
    foot: '更多狭域玩法正在路上，敬请期待！',
  },
  {
    date: '2026-06-15',
    tag: '版本升级',
    title: '主域 · 生电子服升级至 26.1.2',
    intro: '主域子服与生电子服已同步升级至最新版本 26.1.2。',
    items: [
      '更稳定的服务端表现与更流畅的游戏体验',
      `客户端 ${VERSION_RANGE} 均可正常连接`,
    ],
    foot: '如遇连接异常，请尝试更新客户端后重进。',
  },
  {
    date: '2026-06-01',
    tag: '新服',
    title: '生电子服 1.21.11 版本上线',
    intro: '生电子服正式运行 1.21.11。',
    items: [
      '红石机制与版本特性全面同步',
      '生电存档数据与主域互通',
    ],
    foot: '红石佬们可以放心开工了！',
  },
  {
    date: '2026-05-09',
    tag: '新服',
    title: '全新子服「游乐幻境」上线',
    intro: '期待已久的游乐幻境子服正式开放！',
    items: [
      '集休闲娱乐于一体，海量趣味玩法等你体验',
      '适合与小伙伴结伴游玩，欢乐加倍',
    ],
    foot: '快去幻境里找找属于你的快乐吧！',
  },
  {
    date: '2026-05-01',
    tag: '上线',
    title: '悠水小筑 1.21.11 版本正式上线',
    intro: '悠水小筑服务器于今日正式上线 1.21.11 版本，开启全新篇章！',
    items: [
      '全面兼容最新客户端版本',
      '新版本特性完整开放，畅享全新内容',
    ],
    foot: '感谢大家的陪伴与支持，我们一直在路上！',
  },
];

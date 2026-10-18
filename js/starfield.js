const canvas = document.getElementById('starfield');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let particles = [];

  const HUES = ['34,211,238', '56,189,248', '103,232,249', '125,211,252'];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    init();
  }

  function init() {
    const count = Math.min(220, Math.max(80, Math.floor((W * H) / 7000)));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.4,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        phase: Math.random() * Math.PI * 2,
        freq: Math.random() * 0.02 + 0.005,
        color: HUES[Math.floor(Math.random() * HUES.length)],
      });
    }
  }

  function frame(now) {
    const t = now * 0.001;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -3) p.x = W + 3; else if (p.x > W + 3) p.x = -3;
      if (p.y < -3) p.y = H + 3; else if (p.y > H + 3) p.y = -3;
      const alpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * p.freq * 60 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color + ',' + alpha.toFixed(3) + ')';
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
}

// Zero AI App Factory — Premium Templates
// Each template is a complete, production-ready starting point.
// Gemini customizes every file based on the user's description.

export const TEMPLATES: Record<
  string,
  { files: Record<string, string>; description: string; category: string; techStack: string[] }
> = {

  // ─── LANDING PAGE ─────────────────────────────────────────────────────────
  landing: {
    description: "Marketing & landing page",
    category: "web",
    techStack: ["HTML", "Tailwind CSS", "Vanilla JS"],
    files: {
      "index.html": `<!DOCTYPE html><html lang="en" class="dark"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>App</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: { extend: { colors: { primary: '#8b5cf6', bg0: '#030305', card: '#141419' } } }
  }
</script>
<style>
  body { background-color: #030305; color: white; display: flex; flex-direction: column; min-height: 100vh; }
  .glass { background: rgba(20,20,25,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
  .blob { position: fixed; top: -20%; left: -10%; width: 50vw; height: 50vw; background: #8b5cf6; filter: blur(150px); opacity: 0.12; z-index: -1; animation: float 10s infinite alternate; pointer-events: none; }
  .blob2 { position: fixed; bottom: -20%; right: -10%; width: 40vw; height: 40vw; background: #ec4899; filter: blur(120px); opacity: 0.08; z-index: -1; animation: float 14s infinite alternate-reverse; pointer-events: none; }
  @keyframes float { 0% { transform: translateY(0) scale(1) } 100% { transform: translateY(30px) scale(1.05) } }
  .gradient-text { background: linear-gradient(135deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
</style>
</head><body class="antialiased overflow-x-hidden">
<div class="blob"></div>
<div class="blob2"></div>

<nav class="fixed w-full z-50 glass px-6 py-4 flex justify-between items-center">
  <div class="text-xl font-bold tracking-tighter">Brand.</div>
  <div class="hidden md:flex gap-8">
    <a href="#features" class="text-gray-400 hover:text-white transition text-sm">Features</a>
    <a href="#pricing" class="text-gray-400 hover:text-white transition text-sm">Pricing</a>
    <a href="#about" class="text-gray-400 hover:text-white transition text-sm">About</a>
  </div>
  <button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50 hover:scale-105 transition-all">Get Started</button>
</nav>

<main class="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
  <span class="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-purple-300 mb-8">
    <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
    Now in public beta
  </span>
  <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
    Build The Future<br><span class="gradient-text">Faster.</span>
  </h1>
  <p class="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
    The premium platform designed to turn your ideas into reality. Powerful, elegant, and blazing fast.
  </p>
  <div class="flex flex-col sm:flex-row items-center gap-4 mb-16">
    <button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3.5 rounded-full font-bold text-base hover:scale-105 transition shadow-lg shadow-purple-500/30">Start Building →</button>
    <button class="glass text-white px-8 py-3.5 rounded-full font-medium text-base hover:bg-white/10 transition">Watch Demo</button>
  </div>

  <div id="features" class="grid md:grid-cols-3 gap-6 max-w-4xl w-full mt-12">
    <div class="glass p-6 rounded-2xl text-left hover:-translate-y-1 transition-transform">
      <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-2xl">⚡</div>
      <h3 class="font-bold text-lg mb-2">Lightning Fast</h3>
      <p class="text-gray-400 text-sm">Built for performance from the ground up. Zero compromises.</p>
    </div>
    <div class="glass p-6 rounded-2xl text-left hover:-translate-y-1 transition-transform">
      <div class="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 text-2xl">🛡️</div>
      <h3 class="font-bold text-lg mb-2">Enterprise Security</h3>
      <p class="text-gray-400 text-sm">Bank-grade encryption protecting your most sensitive data.</p>
    </div>
    <div class="glass p-6 rounded-2xl text-left hover:-translate-y-1 transition-transform">
      <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-2xl">🤖</div>
      <h3 class="font-bold text-lg mb-2">AI-Powered</h3>
      <p class="text-gray-400 text-sm">Intelligent automation that learns and adapts to your workflow.</p>
    </div>
  </div>
</main>

<script src="script.js"></script></body></html>`,
      "script.js": `// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Parallax blob on mouse move
document.addEventListener('mousemove', (e) => {
  const blob = document.querySelector('.blob');
  const x = (e.clientX / window.innerWidth - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  if (blob) blob.style.transform = \`translate(\${x}px, \${y}px)\`;
});`,
    },
  },

  // ─── DASHBOARD ────────────────────────────────────────────────────────────
  dashboard: {
    description: "Admin dashboard with sidebar and charts",
    category: "web",
    techStack: ["HTML", "Tailwind CSS", "Chart.js"],
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8">
<title>Dashboard</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>tailwind.config = { darkMode: 'class', theme: { extend: { colors: { bg: '#05050a', card: '#0f0f18' } } } }</script>
<style>
  body { background-color: #05050a; color: white; display: flex; height: 100vh; overflow: hidden; margin: 0; }
  .glass { background: rgba(15,15,24,0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
  .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 12px; transition: background 0.2s; color: #9ca3af; font-size: 14px; }
  .sidebar-link:hover, .sidebar-link.active { background: rgba(139,92,246,0.15); color: white; }
  .sidebar-link.active { border: 1px solid rgba(139,92,246,0.3); }
</style>
</head><body>

<aside class="w-64 glass border-r border-white/5 flex flex-col p-4 shrink-0">
  <div class="flex items-center gap-3 px-2 mb-8 mt-2">
    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">Z</div>
    <span class="font-bold text-lg tracking-tight">Console</span>
  </div>
  <nav class="flex flex-col gap-1">
    <a href="#" class="sidebar-link active"><span>📊</span> Overview</a>
    <a href="#" class="sidebar-link"><span>📈</span> Analytics</a>
    <a href="#" class="sidebar-link"><span>👥</span> Users</a>
    <a href="#" class="sidebar-link"><span>💳</span> Revenue</a>
    <a href="#" class="sidebar-link"><span>⚙️</span> Settings</a>
  </nav>
  <div class="mt-auto glass p-4 rounded-2xl">
    <p class="text-xs text-gray-500 mb-1">Storage Used</p>
    <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div class="h-full w-2/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
    </div>
    <p class="text-xs text-gray-400 mt-1">6.4 GB / 10 GB</p>
  </div>
</aside>

<main class="flex-1 overflow-y-auto p-8">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-2xl font-bold">Overview</h1>
      <p class="text-gray-500 text-sm mt-1">Welcome back, Admin 👋</p>
    </div>
    <div class="flex items-center gap-3">
      <button class="glass px-4 py-2 rounded-xl text-sm text-gray-300 hover:text-white transition">Export</button>
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"></div>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
    <div class="glass p-5 rounded-2xl">
      <div class="flex justify-between items-start mb-4">
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">📈</div>
        <span class="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+12.5%</span>
      </div>
      <p class="text-gray-400 text-sm">Total Revenue</p>
      <p class="text-2xl font-bold mt-1">$124,590</p>
    </div>
    <div class="glass p-5 rounded-2xl">
      <div class="flex justify-between items-start mb-4">
        <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">👥</div>
        <span class="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+8.1%</span>
      </div>
      <p class="text-gray-400 text-sm">Active Users</p>
      <p class="text-2xl font-bold mt-1">28,492</p>
    </div>
    <div class="glass p-5 rounded-2xl">
      <div class="flex justify-between items-start mb-4">
        <div class="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl">📦</div>
        <span class="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">-2.3%</span>
      </div>
      <p class="text-gray-400 text-sm">Orders</p>
      <p class="text-2xl font-bold mt-1">1,847</p>
    </div>
    <div class="glass p-5 rounded-2xl">
      <div class="flex justify-between items-start mb-4">
        <div class="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">⭐</div>
        <span class="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+0.4</span>
      </div>
      <p class="text-gray-400 text-sm">Avg Rating</p>
      <p class="text-2xl font-bold mt-1">4.8</p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="glass p-6 rounded-2xl lg:col-span-2">
      <h2 class="font-semibold mb-4">Revenue Overview</h2>
      <canvas id="chart" height="100"></canvas>
    </div>
    <div class="glass p-6 rounded-2xl">
      <h2 class="font-semibold mb-4">Top Products</h2>
      <div class="space-y-3" id="products-list"></div>
    </div>
  </div>
</main>

<script src="script.js"></script></body></html>`,
      "script.js": `const ctx = document.getElementById('chart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Revenue',
      data: [32000, 48000, 41000, 62000, 78000, 91000, 124000],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', callback: v => '$' + (v/1000) + 'k' } }
    }
  }
});

const products = [
  { name: 'Pro Plan', sales: 892, color: '#8b5cf6' },
  { name: 'Ultra Plan', sales: 421, color: '#ec4899' },
  { name: 'Add-ons', sales: 213, color: '#3b82f6' },
  { name: 'Enterprise', sales: 109, color: '#10b981' },
];

document.getElementById('products-list').innerHTML = products.map(p => \`
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div style="width:8px;height:8px;border-radius:50%;background:\${p.color}"></div>
      <span class="text-sm text-gray-300">\${p.name}</span>
    </div>
    <span class="text-sm font-semibold">\${p.sales}</span>
  </div>
\`).join('');`,
    },
  },

  // ─── TOOL ─────────────────────────────────────────────────────────────────
  tool: {
    description: "Single-page utility tool",
    category: "app",
    techStack: ["HTML", "Tailwind CSS", "Vanilla JS"],
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tool</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config = { darkMode: 'class', theme: { extend: { colors: { primary: '#10b981', bg: '#020617', card: '#0f172a' } } } }</script>
<style>
  body { background: #020617; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
  .glass { background: rgba(15,23,42,0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
  textarea:focus, input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
</style>
</head><body>
<main class="w-full max-w-4xl glass p-8 md:p-12 rounded-[2rem] shadow-2xl">
  <header class="mb-10 text-center">
    <h1 class="text-4xl font-extrabold tracking-tight mb-2">Smart Utility</h1>
    <p class="text-gray-400 text-lg">Process your data effortlessly</p>
  </header>
  <div class="grid md:grid-cols-2 gap-8">
    <div class="flex flex-col gap-4">
      <label class="font-bold text-gray-300 uppercase tracking-widest text-xs">Input</label>
      <textarea id="input" rows="10" class="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm resize-none transition" placeholder="Enter your input here..."></textarea>
      <button id="run-btn" class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition shadow-lg shadow-emerald-500/25">
        ▶ Execute Task
      </button>
    </div>
    <div class="flex flex-col gap-4">
      <label class="font-bold text-gray-300 uppercase tracking-widest text-xs">Output</label>
      <div id="output" class="w-full h-[260px] bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm overflow-auto transition">
        <span class="text-gray-500">Waiting for execution...</span>
      </div>
      <button id="copy-btn" class="glass text-gray-300 font-medium py-3 rounded-xl hover:text-white hover:bg-white/5 transition text-sm border border-white/5">
        📋 Copy Output
      </button>
    </div>
  </div>
</main>
<script src="script.js"></script></body></html>`,
      "script.js": `document.getElementById('run-btn').addEventListener('click', () => {
  const input = document.getElementById('input').value.trim();
  const output = document.getElementById('output');
  if (!input) { output.innerHTML = '<span class="text-red-400">⚠ No input provided</span>'; return; }
  output.textContent = 'Processing...\n';
  setTimeout(() => {
    output.textContent = 'Processed Output:\n' + input;
  }, 400);
});
document.getElementById('copy-btn').addEventListener('click', () => {
  const text = document.getElementById('output').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy Output'; }, 2000);
  });
});`,
    },
  },

  // ─── GAME ─────────────────────────────────────────────────────────────────
  game: {
    description: "Browser game with canvas",
    category: "game",
    techStack: ["HTML Canvas", "Vanilla JS"],
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8">
<title>Game</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; overflow: hidden; }
  canvas { background: radial-gradient(ellipse at center, #1a0b2e 0%, #000 100%); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 60px rgba(168,85,247,0.2); }
  #ui { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; font-size: 14px; font-weight: 700; }
  .ui-pill { background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); padding: 8px 20px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); }
  #overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
  h1 { font-size: 64px; font-weight: 900; background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -2px; }
  #start-btn { background: white; color: black; padding: 14px 40px; border-radius: 100px; font-size: 18px; font-weight: 800; cursor: pointer; border: none; transition: transform 0.2s; }
  #start-btn:hover { transform: scale(1.05); }
</style>
</head><body>
<div id="ui">
  <div class="ui-pill">SCORE <span id="score" style="color:#a855f7">0</span></div>
  <div class="ui-pill">LIVES <span id="lives" style="color:#ec4899">3</span></div>
</div>
<canvas id="game" width="800" height="500"></canvas>
<div id="overlay">
  <h1>NEON RUSH</h1>
  <p style="color:#9ca3af;font-size:18px">Dodge everything. Survive.</p>
  <button id="start-btn">START GAME</button>
</div>
<script src="script.js"></script></body></html>`,
      "script.js": `const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let score = 0, lives = 3, running = false, frame = 0;
let player = { x: 100, y: 250, w: 30, h: 30, vy: 0, jumping: false };
let obstacles = [];
const GRAVITY = 0.6, JUMP_FORCE = -14, SPEED = 4;

function spawnObstacle() {
  obstacles.push({ x: 820, y: 220 + Math.random() * 200, w: 20, h: 20 + Math.random() * 60, speed: SPEED + score * 0.002 });
}

function drawPlayer() {
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#a855f7';
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.w, player.h, 8);
  ctx.fill();
  ctx.restore();
}

function update() {
  if (!running) return;
  frame++;
  if (frame % 90 === 0) spawnObstacle();
  player.vy += GRAVITY;
  player.y += player.vy;
  if (player.y + player.h >= 480) { player.y = 480 - player.h; player.vy = 0; player.jumping = false; }
  obstacles = obstacles.filter(o => o.x > -50);
  obstacles.forEach(o => {
    o.x -= o.speed;
    if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
      lives--;
      document.getElementById('lives').textContent = lives;
      obstacles = [];
      if (lives <= 0) { running = false; document.getElementById('overlay').style.display = 'flex'; document.querySelector('h1').textContent = 'GAME OVER'; document.querySelector('#overlay p').textContent = 'Score: ' + score; document.getElementById('start-btn').textContent = 'PLAY AGAIN'; }
    }
  });
  score++;
  document.getElementById('score').textContent = score;
}

function draw() {
  ctx.clearRect(0, 0, 800, 500);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0, 480, 800, 20);
  drawPlayer();
  obstacles.forEach(o => {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ec4899';
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.roundRect(o.x, o.y, o.w, o.h, 4);
    ctx.fill();
    ctx.restore();
  });
  update();
  requestAnimationFrame(draw);
}

document.getElementById('start-btn').addEventListener('click', () => {
  score = 0; lives = 3; frame = 0; obstacles = [];
  player = { x: 100, y: 250, w: 30, h: 30, vy: 0, jumping: false };
  document.getElementById('score').textContent = '0';
  document.getElementById('lives').textContent = '3';
  document.getElementById('overlay').style.display = 'none';
  running = true;
});

document.addEventListener('keydown', e => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && !player.jumping) {
    player.vy = JUMP_FORCE; player.jumping = true;
  }
});
canvas.addEventListener('click', () => { if (!player.jumping) { player.vy = JUMP_FORCE; player.jumping = true; } });

draw();`,
    },
  },

  // ─── AI CHAT ──────────────────────────────────────────────────────────────
  "ai-chat": {
    description: "AI chat interface",
    category: "app",
    techStack: ["HTML", "Tailwind CSS", "Vanilla JS"],
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Chat</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config = { darkMode: 'class' }</script>
<style>
  body { background: #09090b; color: white; display: flex; flex-direction: column; height: 100vh; font-family: system-ui, sans-serif; margin: 0; overflow: hidden; }
  .glass { background: rgba(18,18,22,0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
  .msg-user { background: linear-gradient(135deg, #7c3aed, #6d28d9); border-radius: 20px 20px 4px 20px; }
  .msg-ai { background: rgba(30,30,40,0.9); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px 20px 20px 4px; }
  #messages::-webkit-scrollbar { width: 4px; }
  #messages::-webkit-scrollbar-track { background: transparent; }
  #messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
</style>
</head><body>
<header class="glass px-4 py-3 flex items-center gap-3 border-b border-white/5">
  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-sm">AI</div>
  <div>
    <p class="font-semibold text-sm">Assistant</p>
    <p class="text-xs text-green-400 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span> Online</p>
  </div>
</header>

<div id="messages" class="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
  <div class="flex gap-3">
    <div class="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
    <div class="msg-ai px-4 py-3 text-sm leading-relaxed max-w-[80%]">
      Hello! I'm your AI assistant. How can I help you today? 👋
    </div>
  </div>
</div>

<div class="border-t border-white/5 p-4 max-w-3xl mx-auto w-full">
  <div class="glass flex items-end gap-3 rounded-2xl px-4 py-3">
    <textarea id="input" rows="1" placeholder="Send a message..." class="flex-1 bg-transparent text-sm resize-none focus:outline-none placeholder-gray-600 max-h-32"></textarea>
    <button id="send-btn" class="shrink-0 w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition text-sm">→</button>
  </div>
  <p class="text-center text-xs text-gray-600 mt-2">AI may make mistakes. Verify important information.</p>
</div>

<script src="script.js"></script></body></html>`,
      "script.js": `const input = document.getElementById('input');
const messages = document.getElementById('messages');

const RESPONSES = [
  "That's a great question! Let me think about that...",
  "I'd be happy to help with that. Here's what I know...",
  "Interesting! Based on my training data, I can tell you...",
  "Great point! There are several ways to approach this...",
];

function addMessage(content, isUser) {
  const div = document.createElement('div');
  div.className = 'flex gap-3' + (isUser ? ' justify-end' : '');
  div.innerHTML = isUser
    ? \`<div class="msg-user px-4 py-3 text-sm leading-relaxed max-w-[80%]">\${content}</div>\`
    : \`<div class="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
       <div class="msg-ai px-4 py-3 text-sm leading-relaxed max-w-[80%]">\${content}</div>\`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, true);
  input.value = '';
  input.style.height = 'auto';
  setTimeout(() => addMessage(RESPONSES[Math.floor(Math.random() * RESPONSES.length)], false), 800);
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 128) + 'px'; });`,
    },
  },

  // ─── PORTFOLIO ────────────────────────────────────────────────────────────
  portfolio: {
    description: "Dark developer portfolio",
    category: "web",
    techStack: ["HTML", "Tailwind CSS", "Vanilla JS"],
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portfolio</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { background: #030303; color: white; font-family: 'SF Pro Display', system-ui, sans-serif; overflow-x: hidden; }
  .glass { background: rgba(15,15,15,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
  .gradient-text { background: linear-gradient(135deg, #fff 0%, #888 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .project-card { transition: transform 0.3s, box-shadow 0.3s; }
  .project-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
  section { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 80px 24px; max-width: 960px; margin: 0 auto; }
</style>
</head><body>

<nav class="fixed top-0 inset-x-0 z-50 glass border-b border-white/5 px-8 py-4">
  <div class="max-w-5xl mx-auto flex justify-between items-center">
    <span class="font-bold text-lg">YourName.</span>
    <div class="flex gap-8 text-sm text-gray-400">
      <a href="#work" class="hover:text-white transition">Work</a>
      <a href="#about" class="hover:text-white transition">About</a>
      <a href="#contact" class="hover:text-white transition">Contact</a>
    </div>
  </div>
</nav>

<section id="hero" class="min-h-screen items-start justify-center pt-32">
  <div class="text-xs text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
    <span class="w-12 h-px bg-gray-700"></span>
    Available for hire
  </div>
  <h1 class="text-6xl md:text-8xl font-black leading-none mb-8">
    <span class="gradient-text">Full-Stack</span><br>
    Developer.
  </h1>
  <p class="text-gray-400 text-xl max-w-lg leading-relaxed mb-12">
    I build elegant, performant, and scalable software that people love to use.
  </p>
  <div class="flex gap-4">
    <a href="#work" class="bg-white text-black px-8 py-4 rounded-2xl font-semibold text-sm hover:scale-105 transition">View Work</a>
    <a href="#contact" class="glass text-white px-8 py-4 rounded-2xl font-semibold text-sm hover:bg-white/5 transition">Get in Touch</a>
  </div>
</section>

<section id="work">
  <p class="text-xs text-gray-500 uppercase tracking-[0.3em] mb-12 flex items-center gap-3"><span class="w-12 h-px bg-gray-700"></span> Selected Work</p>
  <div class="grid md:grid-cols-2 gap-6">
    <div class="project-card glass p-8 rounded-3xl">
      <div class="w-full h-40 rounded-2xl bg-gradient-to-br from-violet-900 to-purple-900 mb-6"></div>
      <h3 class="font-bold text-xl mb-2">Project Alpha</h3>
      <p class="text-gray-400 text-sm mb-4">A complete SaaS platform built with Next.js, Supabase, and Stripe.</p>
      <div class="flex gap-2 flex-wrap">
        <span class="text-xs glass px-3 py-1 rounded-full text-gray-300">Next.js</span>
        <span class="text-xs glass px-3 py-1 rounded-full text-gray-300">TypeScript</span>
        <span class="text-xs glass px-3 py-1 rounded-full text-gray-300">Supabase</span>
      </div>
    </div>
    <div class="project-card glass p-8 rounded-3xl">
      <div class="w-full h-40 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 mb-6"></div>
      <h3 class="font-bold text-xl mb-2">Project Beta</h3>
      <p class="text-gray-400 text-sm mb-4">Real-time collaborative whiteboard with WebSockets and Canvas API.</p>
      <div class="flex gap-2 flex-wrap">
        <span class="text-xs glass px-3 py-1 rounded-full text-gray-300">React</span>
        <span class="text-xs glass px-3 py-1 rounded-full text-gray-300">WebSockets</span>
        <span class="text-xs glass px-3 py-1 rounded-full text-gray-300">Bun</span>
      </div>
    </div>
  </div>
</section>

<script src="script.js"></script></body></html>`,
      "script.js": `// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Cursor glow
const glow = document.createElement('div');
glow.style.cssText = 'position:fixed;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:left 0.15s,top 0.15s;';
document.body.appendChild(glow);
document.addEventListener('mousemove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });`,
    },
  },

  // ─── SAAS STARTER ─────────────────────────────────────────────────────────
  "saas-starter": {
    description: "SaaS application with auth, dashboard, and pricing",
    category: "app",
    techStack: ["HTML", "Tailwind CSS", "Vanilla JS"],
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SaaS Starter</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config = { darkMode: 'class', theme: { extend: { colors: { brand: '#6366f1', bg0: '#09090b' } } } }</script>
<style>
  body { background: #09090b; color: white; font-family: 'Inter', system-ui, sans-serif; margin: 0; }
  .glass { background: rgba(18,18,24,0.8); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.07); }
  .page { display: none; } .page.active { display: flex; }
  .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
  .plan-card.featured { border-color: #6366f1; box-shadow: 0 0 40px rgba(99,102,241,0.15); }
  .plan-card.featured:hover { transform: scale(1.02); }
</style>
</head><body>

<!-- NAV -->
<nav class="fixed inset-x-0 top-0 z-50 glass border-b border-white/5 px-6 py-4">
  <div class="max-w-6xl mx-auto flex justify-between items-center">
    <span class="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SaaSApp</span>
    <div class="flex items-center gap-4">
      <button onclick="showPage('pricing')" class="text-sm text-gray-400 hover:text-white transition">Pricing</button>
      <button onclick="showPage('login')" class="glass px-4 py-2 rounded-xl text-sm hover:bg-white/5 transition">Sign In</button>
      <button onclick="showPage('signup')" class="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-xl text-sm font-semibold transition">Get Started</button>
    </div>
  </div>
</nav>

<!-- LANDING -->
<div id="page-landing" class="page active flex-col items-center justify-center min-h-screen pt-20 px-4 text-center">
  <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-300 mb-8">
    <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Now in Beta
  </div>
  <h1 class="text-5xl md:text-7xl font-black leading-none mb-6 max-w-4xl">
    The <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Smarter</span><br>Way to Build SaaS
  </h1>
  <p class="text-gray-400 text-lg md:text-xl max-w-2xl mb-10">Ship your SaaS product 10x faster. Authentication, billing, and everything you need — pre-built and production-ready.</p>
  <div class="flex gap-4 flex-wrap justify-center">
    <button onclick="showPage('signup')" class="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-indigo-500/30">Start for Free</button>
    <button onclick="showPage('pricing')" class="glass px-8 py-4 rounded-2xl font-medium text-lg hover:bg-white/5 transition">View Pricing</button>
  </div>
</div>

<!-- LOGIN -->
<div id="page-login" class="page flex-col items-center justify-center min-h-screen px-4">
  <div class="glass p-8 rounded-3xl w-full max-w-sm">
    <h2 class="text-2xl font-bold text-center mb-6">Welcome back</h2>
    <div class="space-y-4">
      <input type="email" placeholder="Email" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition">
      <input type="password" placeholder="Password" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition">
      <button onclick="showPage('dashboard')" class="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-semibold text-sm transition">Sign In</button>
    </div>
    <p class="text-center text-sm text-gray-500 mt-4">No account? <button onclick="showPage('signup')" class="text-indigo-400 hover:text-indigo-300">Sign up</button></p>
  </div>
</div>

<!-- SIGNUP -->
<div id="page-signup" class="page flex-col items-center justify-center min-h-screen px-4">
  <div class="glass p-8 rounded-3xl w-full max-w-sm">
    <h2 class="text-2xl font-bold text-center mb-2">Create account</h2>
    <p class="text-gray-400 text-sm text-center mb-6">Start your 14-day free trial</p>
    <div class="space-y-4">
      <input type="text" placeholder="Full name" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition">
      <input type="email" placeholder="Email" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition">
      <input type="password" placeholder="Password" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition">
      <button onclick="showPage('dashboard')" class="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-semibold text-sm transition">Create Account</button>
    </div>
  </div>
</div>

<!-- PRICING -->
<div id="page-pricing" class="page flex-col items-center min-h-screen pt-24 px-4 pb-12">
  <h2 class="text-4xl font-black mb-3 text-center">Simple Pricing</h2>
  <p class="text-gray-400 text-center mb-12">No surprises. Cancel anytime.</p>
  <div class="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
    <div class="plan-card glass p-6 rounded-2xl border border-white/10 flex flex-col">
      <h3 class="font-bold text-lg mb-1">Free</h3>
      <p class="text-gray-400 text-sm mb-4">Get started</p>
      <div class="text-4xl font-black mb-6">$0<span class="text-gray-500 text-base font-normal">/mo</span></div>
      <ul class="space-y-2 text-sm text-gray-300 mb-8 flex-1">
        <li>✓ 3 projects</li><li>✓ 1 team member</li><li>✓ 1GB storage</li>
      </ul>
      <button onclick="showPage('signup')" class="glass w-full py-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition">Get Started</button>
    </div>
    <div class="plan-card glass featured p-6 rounded-2xl border flex flex-col relative">
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-xs font-bold px-4 py-1 rounded-full">POPULAR</div>
      <h3 class="font-bold text-lg mb-1">Pro</h3>
      <p class="text-gray-400 text-sm mb-4">For growing teams</p>
      <div class="text-4xl font-black mb-6">$29<span class="text-gray-500 text-base font-normal">/mo</span></div>
      <ul class="space-y-2 text-sm text-gray-300 mb-8 flex-1">
        <li>✓ Unlimited projects</li><li>✓ 10 team members</li><li>✓ 50GB storage</li><li>✓ Priority support</li>
      </ul>
      <button onclick="showPage('signup')" class="bg-indigo-600 hover:bg-indigo-700 w-full py-3 rounded-xl text-sm font-semibold transition">Get Pro</button>
    </div>
    <div class="plan-card glass p-6 rounded-2xl border border-white/10 flex flex-col">
      <h3 class="font-bold text-lg mb-1">Enterprise</h3>
      <p class="text-gray-400 text-sm mb-4">Custom everything</p>
      <div class="text-4xl font-black mb-6">Custom</div>
      <ul class="space-y-2 text-sm text-gray-300 mb-8 flex-1">
        <li>✓ Unlimited everything</li><li>✓ Dedicated support</li><li>✓ SLA guarantee</li><li>✓ Custom contracts</li>
      </ul>
      <button class="glass w-full py-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition">Contact Sales</button>
    </div>
  </div>
</div>

<!-- DASHBOARD -->
<div id="page-dashboard" class="page flex-col min-h-screen pt-20 px-6 max-w-5xl mx-auto w-full">
  <div class="flex justify-between items-center mb-8">
    <div><h1 class="text-2xl font-bold">Dashboard</h1><p class="text-gray-500 text-sm">Welcome back!</p></div>
    <button onclick="showPage('landing')" class="glass px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition">Sign Out</button>
  </div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="glass p-5 rounded-2xl"><p class="text-gray-400 text-xs mb-1">Users</p><p class="text-2xl font-bold">1,294</p></div>
    <div class="glass p-5 rounded-2xl"><p class="text-gray-400 text-xs mb-1">Revenue</p><p class="text-2xl font-bold">$8.4k</p></div>
    <div class="glass p-5 rounded-2xl"><p class="text-gray-400 text-xs mb-1">Projects</p><p class="text-2xl font-bold">24</p></div>
    <div class="glass p-5 rounded-2xl"><p class="text-gray-400 text-xs mb-1">Uptime</p><p class="text-2xl font-bold text-green-400">99.9%</p></div>
  </div>
  <div class="glass p-6 rounded-2xl"><p class="text-gray-400 text-center py-12">Your dashboard content will appear here.</p></div>
</div>

<script src="script.js"></script></body></html>`,
      "script.js": `function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  window.scrollTo(0, 0);
}`,
    },
  },

  // ─── E-COMMERCE ───────────────────────────────────────────────────────────
  ecommerce: {
    description: "Product store with cart",
    category: "web",
    techStack: ["HTML", "Tailwind CSS", "Vanilla JS"],
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Store</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { background: #09090b; color: white; font-family: system-ui, sans-serif; margin: 0; }
  .glass { background: rgba(18,18,22,0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
  .product-card { transition: transform 0.2s, box-shadow 0.2s; }
  .product-card:hover { transform: translateY(-4px); }
  #cart-panel { position: fixed; right: -400px; top: 0; bottom: 0; width: 380px; background: #111118; border-left: 1px solid rgba(255,255,255,0.06); transition: right 0.3s; z-index: 100; padding: 24px; overflow-y: auto; }
  #cart-panel.open { right: 0; }
</style>
</head><body>
<nav class="fixed inset-x-0 top-0 z-50 glass border-b border-white/5 px-6 py-4 flex justify-between items-center">
  <span class="font-black text-xl">STORE</span>
  <button onclick="toggleCart()" class="glass px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition">
    🛒 Cart <span id="cart-count" class="bg-purple-600 text-xs w-5 h-5 rounded-full flex items-center justify-center">0</span>
  </button>
</nav>

<div class="pt-20 px-6 pb-12 max-w-6xl mx-auto">
  <div class="mb-12 text-center">
    <h1 class="text-5xl font-black mb-3">Premium Collection</h1>
    <p class="text-gray-400">Handpicked products for the discerning buyer</p>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="products"></div>
</div>

<div id="cart-panel">
  <div class="flex justify-between items-center mb-6">
    <h2 class="font-bold text-lg">Your Cart</h2>
    <button onclick="toggleCart()" class="text-gray-400 hover:text-white text-xl">✕</button>
  </div>
  <div id="cart-items" class="space-y-4 mb-6"></div>
  <div id="cart-total" class="glass p-4 rounded-2xl mb-4 hidden">
    <div class="flex justify-between font-bold"><span>Total</span><span id="total-price"></span></div>
  </div>
  <button id="checkout-btn" class="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-2xl font-bold transition hidden">Checkout →</button>
</div>

<script src="script.js"></script></body></html>`,
      "script.js": `const PRODUCTS = [
  { id: 1, name: 'Minimal Watch', price: 299, emoji: '⌚', color: 'from-slate-800 to-slate-900' },
  { id: 2, name: 'Premium Headphones', price: 449, emoji: '🎧', color: 'from-purple-900 to-indigo-900' },
  { id: 3, name: 'Smart Bag', price: 189, emoji: '👜', color: 'from-amber-900 to-orange-900' },
  { id: 4, name: 'Wireless Earbuds', price: 179, emoji: '🎵', color: 'from-blue-900 to-cyan-900' },
  { id: 5, name: 'Leather Wallet', price: 89, emoji: '💼', color: 'from-green-900 to-teal-900' },
  { id: 6, name: 'Sunglasses', price: 249, emoji: '🕶️', color: 'from-pink-900 to-rose-900' },
];

let cart = [];

function renderProducts() {
  document.getElementById('products').innerHTML = PRODUCTS.map(p => \`
    <div class="product-card glass rounded-3xl overflow-hidden">
      <div class="h-48 bg-gradient-to-br \${p.color} flex items-center justify-center text-6xl">\${p.emoji}</div>
      <div class="p-5">
        <h3 class="font-bold text-lg mb-1">\${p.name}</h3>
        <div class="flex justify-between items-center">
          <span class="text-xl font-black">$\${p.price}</span>
          <button onclick="addToCart(\${p.id})" class="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition">Add to Cart</button>
        </div>
      </div>
    </div>
  \`).join('');
}

function addToCart(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...prod, qty: 1 });
  renderCart();
}

function renderCart() {
  document.getElementById('cart-count').textContent = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cart-items').innerHTML = cart.map(i => \`
    <div class="flex items-center justify-between p-3 rounded-xl bg-white/5">
      <div class="flex items-center gap-3">
        <span class="text-2xl">\${i.emoji}</span>
        <div><p class="text-sm font-medium">\${i.name}</p><p class="text-xs text-gray-400">×\${i.qty}</p></div>
      </div>
      <span class="font-bold">$\${i.price * i.qty}</span>
    </div>
  \`).join('') || '<p class="text-gray-500 text-sm text-center py-8">Your cart is empty</p>';
  document.getElementById('total-price').textContent = '$' + total;
  document.getElementById('cart-total').classList.toggle('hidden', cart.length === 0);
  document.getElementById('checkout-btn').classList.toggle('hidden', cart.length === 0);
}

function toggleCart() {
  document.getElementById('cart-panel').classList.toggle('open');
}

renderProducts();
renderCart();`,
    },
  },
}

export type TemplateKey = keyof typeof TEMPLATES

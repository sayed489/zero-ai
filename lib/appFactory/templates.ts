// Ultra-lightweight Tailwind-powered templates designed for maximum reliability with small models
export const TEMPLATES: Record<
  string,
  { files: Record<string, string>; description: string; category: string }
> = {
  landing: {
    description: "Marketing/landing page",
    category: "web",
    files: {
      "index.html": `<!DOCTYPE html><html lang="en" class="dark"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>App</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: { primary: '#8b5cf6', background: '#030305', card: '#141419' }
      }
    }
  }
</script>
<style>
  body { background-color: #030305; color: white; display: flex; flex-direction: column; min-height: 100vh; }
  .glass { background: rgba(20,20,25,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
  .blob { position: fixed; top: -20%; left: -10%; width: 50vw; height: 50vw; background: #8b5cf6; filter: blur(150px); opacity: 0.15; z-index: -1; animation: float 10s infinite alternate; }
  @keyframes float { 0% { transform: translateY(0) } 100% { transform: translateY(20px) } }
</style>
</head><body class="antialiased overflow-x-hidden">
<div class="blob"></div>

<!-- NAVIGATION -->
<nav class="fixed w-full z-50 glass px-6 py-4 flex justify-between items-center">
  <div class="text-xl font-bold tracking-tighter">Brand.</div>
  <div class="hidden md:flex gap-6"><a href="#" class="text-gray-400 hover:text-white transition">Features</a><a href="#" class="text-gray-400 hover:text-white transition">Pricing</a></div>
  <button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-purple-500/30 transition">Get Started</button>
</nav>

<!-- HERO -->
<main class="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
  <span class="glass px-4 py-1.5 rounded-full text-sm text-gray-400 mb-6">✨ AI Generation Engine</span>
  <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">Build The Future <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Faster.</span></h1>
  <p class="text-gray-400 text-lg md:text-xl max-w-2xl mb-10">The premium starter template designed to make any AI output look like it was built by a senior design engineer.</p>
  <button class="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition">Start Building &rarr;</button>
</main>

<script src="script.js"></script></body></html>`,
      "script.js": `// Smooth scroll logic here`,
    },
  },

  dashboard: {
    description: "Admin dashboard with sidebar",
    category: "web",
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8">
<title>Dashboard</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  tailwind.config = { darkMode: 'class', theme: { extend: { colors: { bg: '#05050a', card: '#14141e' } } } }
</script>
<style>
  body { background-color: #05050a; color: white; display: flex; height: 100vh; overflow: hidden; }
  .glass { background: rgba(20,20,30,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
</style>
</head><body>

<!-- SIDEBAR -->
<aside class="w-64 glass border-r h-full p-6 flex flex-col gap-2">
  <div class="text-xl font-bold mb-8 text-white tracking-tight">✦ Console</div>
  <a href="#" class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium transition"><span class="text-xl">📊</span> Overview</a>
  <a href="#" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"><span class="text-xl">⚙️</span> Settings</a>
</aside>

<!-- MAIN CONTENT -->
<main class="flex-1 overflow-y-auto p-8">
  <header class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold">Overview</h1>
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500"></div>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="glass p-6 rounded-2xl flex items-center gap-4">
      <div class="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center text-2xl">📈</div>
      <div>
        <p class="text-gray-400 text-sm">Revenue</p>
        <p class="text-3xl font-bold">$124k</p>
      </div>
    </div>
  </div>

  <div class="glass p-6 rounded-2xl">
    <canvas id="chart" height="100"></canvas>
  </div>
</main>

<script src="script.js"></script></body></html>`,
      "script.js": `const ctx=document.getElementById('chart').getContext('2d');
new Chart(ctx,{type:'line',data:{labels:['Jan','Feb','Mar','Apr'],datasets:[{label:'Users',data:[12,19,15,25],borderColor:'#3b82f6',tension:0.4}]}});`,
    },
  },

  tool: {
    description: "Single-page utility tool",
    category: "app",
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tool</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = { darkMode: 'class', theme: { extend: { colors: { primary: '#10b981', bg: '#020617', card: '#0f172a' } } } }
</script>
<style>
  body { background-color: #020617; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
  .glass { background: rgba(15,23,42,0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
</style>
</head><body>

<main class="w-full max-w-4xl glass p-8 md:p-12 rounded-[2rem] shadow-2xl">
  <header class="mb-10 text-center">
    <h1 class="text-4xl font-extrabold tracking-tight mb-2">Smart Utility</h1>
    <p class="text-gray-400 text-lg">Process your data effortlessly</p>
  </header>

  <div class="grid md:grid-cols-2 gap-8">
    <div class="flex flex-col gap-4">
      <label class="font-bold text-gray-300 uppercase tracking-widest text-sm">Input</label>
      <textarea id="input" class="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-green-500 focus:outline-none transition"></textarea>
      <button id="run-btn" class="bg-white text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition shadow-[0_0_20px_rgba(255,255,255,0.2)]">Execute Task</button>
    </div>
    <div class="flex flex-col gap-4">
      <label class="font-bold text-gray-300 uppercase tracking-widest text-sm">Output</label>
      <div id="output" class="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-mono overflow-auto overflow-wrap-break-word">Waiting for execution...</div>
    </div>
  </div>
</main>

<script src="script.js"></script></body></html>`,
      "script.js": `document.getElementById('run-btn').addEventListener('click', () => {
  const input = document.getElementById('input').value;
  document.getElementById('output').textContent = 'Processed:\\n' + input;
});`,
    },
  },

  game: {
    description: "Browser game with canvas",
    category: "game",
    files: {
      "index.html": `<!DOCTYPE html><html class="dark"><head><meta charset="UTF-8">
<title>Game</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { background: #000; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; margin: 0; }
  canvas { background: radial-gradient(ellipse at center, #1a0b2e 0%, #000 100%); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 50px rgba(168,85,247,0.15); }
  .glass { background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); }
</style>
</head><body>

<div class="relative w-[800px] h-[500px]">
  <div class="absolute top-4 left-6 right-6 flex justify-between z-10 font-bold tracking-widest pointer-events-none">
    <div class="glass px-6 py-2 rounded-full border border-white/10">SCORE <span id="score" class="text-purple-400 ml-2 text-xl">0</span></div>
  </div>
  
  <canvas id="game" width="800" height="500"></canvas>
  
  <div id="overlay" class="absolute inset-0 glass flex flex-col items-center justify-center rounded-3xl transition-opacity">
    <h1 id="title" class="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-2 tracking-tighter">NEON RUSH</h1>
    <p id="subtitle" class="text-gray-400 text-xl mb-8">Press Start to Play</p>
    <button id="start-btn" class="bg-white text-black px-10 py-3 rounded-full font-bold text-xl hover:scale-110 transition shadow-[0_0_30px_rgba(255,255,255,0.3)]">START GAME</button>
  </div>
</div>

<script src="script.js"></script></body></html>`,
      "script.js": `const canvas = document.getElementById('game'); const ctx = canvas.getContext('2d');
let running = false;
function draw() { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#a855f7'; ctx.shadowBlur=20; ctx.shadowColor='#a855f7'; ctx.fillRect(350,200,100,100); }
document.getElementById('start-btn').addEventListener('click', () => { running = true; document.getElementById('overlay').style.opacity = '0'; document.getElementById('overlay').style.pointerEvents = 'none'; draw(); });
draw();`,
    },
  },
}

export type TemplateKey = keyof typeof TEMPLATES

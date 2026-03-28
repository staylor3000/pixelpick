'use strict';

// =============================================
// Constants
// =============================================

const ROUND_COLOURS = [
  { name: 'Blush',    hsl: [340, 80, 79] },
  { name: 'Mint',     hsl: [155, 55, 67] },
  { name: 'Sky',      hsl: [205, 75, 75] },
  { name: 'Lavender', hsl: [270, 60, 77] },
  { name: 'Peach',    hsl: [28,  90, 76] },
  { name: 'Sage',     hsl: [120, 30, 70] },
  { name: 'Lemon',    hsl: [48,  80, 66] },
  { name: 'Lilac',    hsl: [285, 50, 77] },
];

const GREYSCALE_COLOURS = [
  { name: 'Silver',   hsl: [0, 0, 75] },
  { name: 'Ash',      hsl: [0, 0, 65] },
  { name: 'Dove',     hsl: [0, 0, 82] },
  { name: 'Slate',    hsl: [0, 0, 55] },
  { name: 'Pearl',    hsl: [0, 0, 88] },
  { name: 'Graphite', hsl: [0, 0, 45] },
  { name: 'Cloud',    hsl: [0, 0, 92] },
  { name: 'Stone',    hsl: [0, 0, 60] },
];

const LOGO_CYCLES = {
  pastel: [
    { pixel: 'hsl(340,80%,68%)', pick: 'hsl(340,80%,82%)' },
    { pixel: 'hsl(155,55%,56%)', pick: 'hsl(155,55%,72%)' },
    { pixel: 'hsl(205,75%,65%)', pick: 'hsl(205,75%,80%)' },
    { pixel: 'hsl(270,60%,66%)', pick: 'hsl(270,60%,82%)' },
    { pixel: 'hsl(28,90%,65%)',  pick: 'hsl(28,90%,79%)'  },
    { pixel: 'hsl(48,80%,61%)',  pick: 'hsl(48,80%,75%)'  },
  ],
  grey: [
    { pixel: 'hsl(0,0%,50%)', pick: 'hsl(0,0%,68%)' },
    { pixel: 'hsl(0,0%,40%)', pick: 'hsl(0,0%,58%)' },
    { pixel: 'hsl(0,0%,58%)', pick: 'hsl(0,0%,74%)' },
  ],
};

const RANKS = [
  { min: 0,  emoji: '🐛', title: 'Colour Newbie',    desc: 'Everyone starts somewhere!' },
  { min: 2,  emoji: '🦋', title: 'Getting There',    desc: 'Your eyes are warming up.' },
  { min: 4,  emoji: '🎨', title: 'Colour Spotter',   desc: 'Solid perception skills.' },
  { min: 6,  emoji: '🦅', title: 'Eagle Eye',        desc: 'Most people tap out before you did.' },
  { min: 9,  emoji: '💎', title: 'Diamond Vision',   desc: "You're in the top tier of colour perceivers." },
  { min: 12, emoji: '🌈', title: 'Chromatic Legend', desc: "Extraordinary. Are you sure you're human?" },
];

const MARATHON_RANKS = [
  { ms: 1000 * 60 * 60,      title: 'Are You Okay?',      emoji: '😅' },
  { ms: 1000 * 60 * 60 * 6,  title: 'Please Go Outside',  emoji: '🌳' },
  { ms: 1000 * 60 * 60 * 24, title: 'Do You Have a Job?', emoji: '💼' },
  { ms: 1000 * 60 * 60 * 72, title: 'Actual Cryptid',     emoji: '👁️' },
];

// Filter UI definitions
const FILTER_DEFS = [
  {
    id: 'tone', label: 'Tone',
    options: [
      { value: 'pastel', icon: '',   name: 'Pastel',    desc: 'colour',    active: { bg: '#E8D8FF', color: '#7040BB' } },
      { value: 'grey',   icon: '◑', name: 'Greyscale', desc: 'no colour', active: { bg: '#E0E0E0', color: '#444444' } },
      { value: 'dark',   icon: '',   name: 'Dark',      desc: null,        comingSoon: true },
      { value: 'neon',   icon: '',   name: 'Neon',      desc: null,        comingSoon: true },
    ],
  },
  {
    id: 'lives', label: 'Lives',
    options: [
      { value: 'classic', icon: '♥♥♥', name: 'Classic', desc: '3 lives',  active: { bg: '#FFD6E0', color: '#C0405A' } },
      { value: 'endless', icon: '∞',   name: 'Endless', desc: 'no limit', active: { bg: '#FFE4C8', color: '#C06820' } },
    ],
  },
  {
    id: 'timer', label: 'Timer',
    options: [
      { value: '60',  icon: '',   name: '60 sec',   desc: 'classic', active: { bg: '#C8F0E0', color: '#2A7A58' } },
      { value: '30',  icon: '',   name: '30 sec',   desc: 'rush',    active: { bg: '#FFE4C8', color: '#C06820' } },
      { value: 'none',icon: '∞', name: 'No timer', desc: 'chill',   active: { bg: '#FFD6E0', color: '#C0405A' } },
    ],
  },
  {
    id: 'shape', label: 'Shape',
    options: [
      { value: 'square',  icon: '■', name: 'Square',  desc: 'classic', active: { bg: '#C8E8FF', color: '#2A6AAA' } },
      { value: 'circle',  icon: '●', name: 'Circle',  desc: 'round',   active: { bg: '#FFD6E0', color: '#C0405A' } },
      { value: 'diamond', icon: '◆', name: 'Diamond', desc: 'rotated', active: { bg: '#FFF3C0', color: '#B8880A' } },
      { value: 'random',  icon: '✦', name: 'Random',  desc: 'surprise',active: { bg: '#E8D8FF', color: '#7040BB' } },
    ],
  },
];

// Weighted pools for Quick Start: Random (excludes coming-soon options)
const RANDOM_POOLS = {
  tone:  ['pastel', 'pastel', 'pastel', 'grey'],
  lives: ['classic', 'classic', 'endless'],
  timer: ['60', '60', '30', 'none'],
  shape: ['square', 'circle', 'diamond', 'random'],
};

// Custom SVG cursor for gameplay
const CURSOR_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='6' fill='none' stroke='white' stroke-width='2' opacity='0.9'/><line x1='16' y1='4' x2='16' y2='11' stroke='white' stroke-width='2' stroke-linecap='round' opacity='0.9'/><line x1='16' y1='21' x2='16' y2='28' stroke='white' stroke-width='2' stroke-linecap='round' opacity='0.9'/><line x1='4' y1='16' x2='11' y2='16' stroke='white' stroke-width='2' stroke-linecap='round' opacity='0.9'/><line x1='21' y1='16' x2='28' y2='16' stroke='white' stroke-width='2' stroke-linecap='round' opacity='0.9'/></svg>`;
const GAME_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(CURSOR_SVG)}") 16 16, crosshair`;

// =============================================
// Filter state — persisted in sessionStorage
// =============================================

let filterTone  = sessionStorage.getItem('filterTone')  || 'pastel';
let filterLives = sessionStorage.getItem('filterLives') || 'classic';
let filterTimer = sessionStorage.getItem('filterTimer') || '60';
let filterShape = sessionStorage.getItem('filterShape') || 'random';

function setFilter(id, value) {
  if (id === 'tone')  { filterTone  = value; sessionStorage.setItem('filterTone',  value); }
  if (id === 'lives') { filterLives = value; sessionStorage.setItem('filterLives', value); }
  if (id === 'timer') { filterTimer = value; sessionStorage.setItem('filterTimer', value); }
  if (id === 'shape') { filterShape = value; sessionStorage.setItem('filterShape', value); }
}

// =============================================
// DOM references
// =============================================

const startScreen    = document.getElementById('start-screen');
const gameScreen     = document.getElementById('game-screen');
const resultScreen   = document.getElementById('result-screen');
const floatingPixels = document.getElementById('floating-pixels');

const logoPixel = document.querySelector('.logo-pixel');
const logoPick  = document.querySelector('.logo-pick');

const playBtn      = document.getElementById('play-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const shareBtn     = document.getElementById('share-btn');

const gameCanvas   = document.getElementById('game-canvas');
const targetPatch  = document.getElementById('target-patch');
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const timerPill    = document.getElementById('timer-pill');
const livesDisplay = document.getElementById('lives-display');

// =============================================
// Game state
// =============================================

let state = {};
let logoCycleInterval = null;
let logoCycleIdx = 0;
let currentLiveColour = '#2A2438';

function getColourPalette(tone) {
  return tone === 'grey' ? GREYSCALE_COLOURS : ROUND_COLOURS;
}

function resetState() {
  const timerStart = filterTimer === '60' ? 60 : filterTimer === '30' ? 30 : null;

  state = {
    round:         1,
    score:         0,
    lives:         filterLives === 'classic' ? 3 : Infinity,
    timeRemaining: timerStart,
    colourOrder:   shuffle(getColourPalette(filterTone)),
    currentColour: null,
    currentShape:  null,
    timerInterval: null,
    missedColours: {},
    wrongClicks:   0,
    active:        false,
    startTime:     null,
    // Snapshot of filters at game start
    tone:          filterTone,
    livesMode:     filterLives,
    timerMode:     filterTimer,
    shapeMode:     filterShape,
  };
}

// =============================================
// Utilities
// =============================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function getDelta(round) {
  return Math.max(2, 18 - (round - 1) * 1.5);
}

function getSize(round) {
  return Math.max(28, 80 - (round - 1) * 4);
}

function getRank(rounds) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (rounds >= r.min) rank = r;
  }
  return rank;
}

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function getComboText(tone, lives, timer, shape) {
  const toneLabel  = { pastel: 'Pastel', grey: 'Greyscale' }[tone]  || tone;
  const livesLabel = { classic: '3 lives', endless: 'Endless lives' }[lives] || lives;
  const timerLabel = { '60': '60 seconds', '30': '30 seconds', none: 'No timer' }[timer] || timer;
  const shapeLabel = { square: 'Square', circle: 'Circle', diamond: 'Diamond', random: 'Random shape' }[shape] || shape;
  return `${toneLabel} · ${livesLabel} · ${timerLabel} · ${shapeLabel}`;
}

// =============================================
// Logo colour cycle
// =============================================

function setLiveColour(colour) {
  currentLiveColour = colour;
  playBtn.style.background = colour;
  const qsClassic = document.querySelector('.btn-qs-classic');
  if (qsClassic) qsClassic.style.background = colour;
  applyAllFilterActiveStates();
}

function startLogoCycle() {
  stopLogoCycle();
  logoCycleIdx = 0;

  const cycles = LOGO_CYCLES[filterTone] || LOGO_CYCLES.pastel;
  logoPixel.style.color = cycles[0].pixel;
  logoPick.style.color  = cycles[0].pick;
  setLiveColour(cycles[0].pixel);

  logoCycleInterval = setInterval(() => {
    const c = LOGO_CYCLES[filterTone] || LOGO_CYCLES.pastel;
    logoCycleIdx = (logoCycleIdx + 1) % c.length;
    logoPixel.style.color = c[logoCycleIdx].pixel;
    logoPick.style.color  = c[logoCycleIdx].pick;
    setLiveColour(c[logoCycleIdx].pixel);
  }, 2000);
}

function stopLogoCycle() {
  clearInterval(logoCycleInterval);
  logoCycleInterval = null;
}

// =============================================
// Filter UI
// =============================================

function renderFilterRows() {
  const container = document.getElementById('filter-rows');
  container.innerHTML = '';

  FILTER_DEFS.forEach(({ id, label, options }) => {
    const row = document.createElement('div');
    row.className = 'filter-row';

    const lbl = document.createElement('span');
    lbl.className   = 'filter-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    const opts = document.createElement('div');
    opts.className = 'filter-options';

    options.forEach((opt, i) => {
      if (i > 0) {
        const divider = document.createElement('div');
        divider.className = 'filter-divider';
        opts.appendChild(divider);
      }

      const btn = document.createElement('button');
      btn.className        = 'filter-btn';
      btn.dataset.filter   = id;
      btn.dataset.value    = opt.value;

      if (opt.comingSoon) {
        btn.disabled = true;
        btn.classList.add('filter-coming-soon');
        btn.innerHTML = `
          ${opt.icon ? `<span class="filter-icon">${opt.icon}</span>` : ''}
          <span class="filter-name">${opt.name}</span>
          <span class="coming-soon-pill">soon</span>`;
      } else {
        btn.innerHTML = `
          ${opt.icon ? `<span class="filter-icon">${opt.icon}</span>` : ''}
          <span class="filter-name">${opt.name}</span>
          <span class="filter-desc">${opt.desc}</span>`;
        btn.addEventListener('click', () => onFilterClick(id, opt.value));
      }

      opts.appendChild(btn);
    });

    row.appendChild(opts);
    container.appendChild(row);
  });

  applyAllFilterActiveStates();
  updateComboPreview();
}

function applyAllFilterActiveStates() {
  applyFilterActiveState('tone',  filterTone);
  applyFilterActiveState('lives', filterLives);
  applyFilterActiveState('timer', filterTimer);
  applyFilterActiveState('shape', filterShape);
}

function applyFilterActiveState(filterId, activeValue) {
  const def  = FILTER_DEFS.find(f => f.id === filterId);
  const btns = document.querySelectorAll(`.filter-btn[data-filter="${filterId}"]`);

  btns.forEach(btn => {
    const opt = def.options.find(o => o.value === btn.dataset.value);
    if (!opt || opt.comingSoon) return;

    if (btn.dataset.value === activeValue) {
      btn.classList.add('active');
      btn.style.background = currentLiveColour;
      btn.style.color      = 'white';
    } else {
      btn.classList.remove('active');
      btn.style.background = '';
      btn.style.color      = '';
    }
  });
}

function onFilterClick(filterId, value) {
  setFilter(filterId, value);
  applyFilterActiveState(filterId, value);
  updateComboPreview();

  if (filterId === 'tone') {
    floatingPixels.classList.toggle('greyscale', filterTone === 'grey');
    startLogoCycle();
  }
}

function updateComboPreview() {
  const el = document.getElementById('combo-preview');
  if (el) el.textContent = getComboText(filterTone, filterLives, filterTimer, filterShape);
}

// =============================================
// Quick Start buttons
// =============================================

function renderQuickStartButtons() {
  const container = document.getElementById('quick-start-row');
  if (!container) return;

  const classicBtn = document.createElement('button');
  classicBtn.className = 'btn-qs btn-qs-classic';
  classicBtn.textContent = 'Quick Start: Classic';
  classicBtn.addEventListener('click', () => {
    setFilter('tone',  'pastel');
    setFilter('lives', 'classic');
    setFilter('timer', '60');
    setFilter('shape', 'square');
    applyAllFilterActiveStates();
    updateComboPreview();
    initGame();
  });

  const randomBtn = document.createElement('button');
  randomBtn.className = 'btn-qs btn-qs-random';
  randomBtn.textContent = 'Quick Start: Random';
  randomBtn.addEventListener('click', () => {
    if (randomBtn.disabled) return;

    for (const [key, pool] of Object.entries(RANDOM_POOLS)) {
      setFilter(key, pool[Math.floor(Math.random() * pool.length)]);
    }

    applyAllFilterActiveStates();

    const preview = document.getElementById('combo-preview');
    if (preview) {
      preview.classList.remove('combo-animate');
      void preview.offsetWidth;
      preview.classList.add('combo-animate');
    }
    updateComboPreview();
    floatingPixels.classList.toggle('greyscale', filterTone === 'grey');
    startLogoCycle();

    const orig = randomBtn.textContent;
    randomBtn.textContent = "Let's go!";
    randomBtn.disabled = true;

    setTimeout(() => {
      randomBtn.textContent = orig;
      randomBtn.disabled = false;
      initGame();
    }, 600);
  });

  container.appendChild(classicBtn);
  container.appendChild(randomBtn);
}

// =============================================
// Screen management
// =============================================

function showScreen(name) {
  startScreen.classList.toggle('hidden',  name !== 'start');
  gameScreen.classList.toggle('hidden',   name !== 'game');
  resultScreen.classList.toggle('hidden', name !== 'result');
}

// =============================================
// Shape
// =============================================

function applyShape(el, shape, size) {
  el.style.width  = size + 'px';
  el.style.height = size + 'px';

  if (shape === 'square') {
    el.style.borderRadius = '6px';
    el.style.transform    = 'rotate(0deg)';
  } else if (shape === 'circle') {
    el.style.borderRadius = '50%';
    el.style.transform    = 'rotate(0deg)';
  } else if (shape === 'diamond') {
    el.style.borderRadius = '6px';
    el.style.transform    = 'rotate(45deg)';
    el.style.width  = (size * 0.85) + 'px';
    el.style.height = (size * 0.85) + 'px';
  }
}

function isClickOnTarget(clientX, clientY) {
  const rect = targetPatch.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;

  if (state.currentShape === 'circle') {
    const r = rect.width / 2;
    return (dx * dx + dy * dy) <= (r * r);
  }
  if (state.currentShape === 'diamond') {
    const half = rect.width / 2;
    return (Math.abs(dx) + Math.abs(dy)) <= half;
  }
  return clientX >= rect.left && clientX <= rect.right &&
         clientY >= rect.top  && clientY <= rect.bottom;
}

// =============================================
// Game flow
// =============================================

function initGame() {
  stopLogoCycle();
  resetState();
  showScreen('game');
  gameScreen.style.cursor = GAME_CURSOR;

  timerPill.style.display = state.timerMode === 'none' ? 'none' : '';

  const hudCombo = document.getElementById('hud-combo-text');
  if (hudCombo) {
    const toneLabel  = { pastel: 'Pastel', grey: 'Greyscale' }[state.tone];
    const livesLabel = { classic: '3 lives', endless: 'Endless' }[state.livesMode];
    const timerLabel = { '60': '60s', '30': '30s', none: 'No timer' }[state.timerMode];
    const shapeLabel = { square: 'Square', circle: 'Circle', diamond: 'Diamond', random: 'Random' }[state.shapeMode];
    hudCombo.textContent = `${toneLabel}  ·  ${livesLabel}  ·  ${timerLabel}  ·  ${shapeLabel}`;
  }

  requestAnimationFrame(() => {
    state.startTime = Date.now();
    startRound();
    if (state.timerMode !== 'none') startTimer();
    // state.active is enabled by startRound after round label
  });
}

function startRound() {
  const { round } = state;

  const idx = (round - 1) % state.colourOrder.length;
  if (idx === 0 && round > 1) {
    state.colourOrder = shuffle(getColourPalette(state.tone));
  }

  const colour        = state.colourOrder[idx];
  state.currentColour = colour;

  const [h, s, l] = colour.hsl;
  const delta     = getDelta(round);
  const size      = getSize(round);
  const targetL   = (l + delta <= 94) ? l + delta : l - delta;

  // Determine shape for this round
  const shapes = ['square', 'circle', 'diamond'];
  state.currentShape = state.shapeMode === 'random'
    ? shapes[Math.floor(Math.random() * shapes.length)]
    : state.shapeMode;

  // Background crossfade (skip transition on round 1)
  if (round > 1) {
    gameCanvas.style.transition = 'background-color 0.35s ease';
  }
  gameCanvas.style.backgroundColor = hsl(h, s, l);

  // Apply shape / colour to target; hide during transition
  applyShape(targetPatch, state.currentShape, size);
  targetPatch.style.backgroundColor = hsl(h, s, targetL);
  targetPatch.style.opacity    = '0';
  targetPatch.style.transition = 'none';

  setTimeout(() => {
    placeTarget();
    gameCanvas.style.transition = '';
    requestAnimationFrame(() => {
      targetPatch.style.transition = 'opacity 0.2s ease';
      targetPatch.style.opacity    = '1';
    });
    showRoundLabel(round);
    updateHUD();

    setTimeout(() => {
      targetPatch.style.transition = '';
      state.active = true;
    }, 1000);
  }, 200);
}

function placeTarget() {
  const margin    = 80;
  const hudHeight = 80;
  const w         = window.innerWidth;
  const h         = window.innerHeight;

  // Use CSS size for bounds (applyShape already set width/height on the element)
  const elW = parseFloat(targetPatch.style.width)  || 60;
  const elH = parseFloat(targetPatch.style.height) || 60;

  const minX = margin;
  const maxX = w - margin - elW;
  const minY = margin + hudHeight;
  const maxY = h - margin - elH;

  const x = Math.floor(Math.random() * Math.max(1, maxX - minX)) + minX;
  const y = Math.floor(Math.random() * Math.max(1, maxY - minY)) + minY;

  targetPatch.style.left = `${x}px`;
  targetPatch.style.top  = `${y}px`;
}

// =============================================
// Timer
// =============================================

function startTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeRemaining = Math.max(0, state.timeRemaining - 1);
    updateHUD();
    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      endGame('timer');
    }
  }, 1000);
}

// =============================================
// HUD
// =============================================

function updateHUD() {
  scoreDisplay.textContent = state.score;

  if (state.timerMode !== 'none') {
    timerDisplay.textContent = state.timeRemaining;
    const urgentAt = state.timerMode === '30' ? 8 : 10;
    timerPill.classList.toggle('timer-urgent', state.timeRemaining <= urgentAt);
  }

  livesDisplay.innerHTML = '';
  if (state.livesMode === 'endless') {
    const span = document.createElement('span');
    span.className   = 'heart heart-full';
    span.textContent = '∞';
    span.style.fontSize = '1.8rem';
    livesDisplay.appendChild(span);
  } else {
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className   = `heart ${i < state.lives ? 'heart-full' : 'heart-empty'}`;
      span.textContent = '♥';
      livesDisplay.appendChild(span);
    }
  }
}

// =============================================
// Click / touch handling
// =============================================

function handleInput(clientX, clientY) {
  if (!state.active) return;

  if (isClickOnTarget(clientX, clientY)) {
    correctClick(clientX, clientY);
  } else {
    wrongClick();
  }
}

function correctClick(clientX, clientY) {
  state.active = false;

  const delta    = getDelta(state.round);
  const timeMult = state.timeRemaining !== null ? state.timeRemaining / 60 : 1;
  const points   = Math.round(100 * (delta / 18) * timeMult);
  state.score   += points;

  spawnRipple(clientX, clientY);
  spawnScorePopup(clientX, clientY, points);
  navigator.vibrate && navigator.vibrate(25);
  updateHUD();

  state.round++;
  setTimeout(() => startRound(), 300);
}

function wrongClick() {
  state.wrongClicks++;

  const name = state.currentColour.name;
  state.missedColours[name] = (state.missedColours[name] || 0) + 1;

  flashWrongClick();
  navigator.vibrate && navigator.vibrate([40, 20, 40]);

  if (state.livesMode === 'classic') {
    state.lives = Math.max(0, state.lives - 1);
    updateHUD();

    if (state.lives === 0) {
      state.active = false;
      gameScreen.classList.add('shake');
      setTimeout(() => {
        gameScreen.classList.remove('shake');
        clearInterval(state.timerInterval);
        endGame('lives');
      }, 500);
    }
  } else {
    updateHUD();
  }
}

function flashWrongClick() {
  const flash = document.createElement('div');
  flash.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:radial-gradient(ellipse at center, transparent 40%, rgba(220,50,50,0.45) 100%)',
    'pointer-events:none',
    'animation:flashFade 0.4s ease-out forwards',
    'z-index:99',
  ].join(';');
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 400);
}

function spawnRipple(x, y) {
  [
    { maxSize: 120, duration: 500 },
    { maxSize: 150, duration: 700 },
  ].forEach(({ maxSize, duration }) => {
    const el = document.createElement('div');
    el.style.cssText = [
      `position:fixed`,
      `left:${x}px`,
      `top:${y}px`,
      `width:0`,
      `height:0`,
      `border-radius:50%`,
      `border:3px solid rgba(255,255,255,0.8)`,
      `transform:translate(-50%,-50%)`,
      `pointer-events:none`,
      `z-index:100`,
    ].join(';');
    document.body.appendChild(el);
    el.animate(
      [
        { width: '0px',          height: '0px',          opacity: 1 },
        { width: `${maxSize}px`, height: `${maxSize}px`, opacity: 0 },
      ],
      { duration, easing: 'ease-out', fill: 'forwards' }
    );
    setTimeout(() => el.remove(), duration + 50);
  });
}

function spawnScorePopup(x, y, points) {
  const el = document.createElement('div');
  el.textContent = `+${points}`;
  el.style.cssText = [
    `position:fixed`,
    `left:${x}px`,
    `top:${y}px`,
    `font-family:'Fredoka One',sans-serif`,
    `font-size:28px`,
    `color:white`,
    `text-shadow:0 2px 8px rgba(0,0,0,0.2)`,
    `pointer-events:none`,
    `transform:translate(-50%,-50%)`,
    `animation:scoreFloat 0.8s ease-out forwards`,
    `z-index:101`,
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function showRoundLabel(round) {
  const el = document.createElement('div');
  el.textContent = `Round ${round}`;
  el.style.cssText = [
    `position:fixed`,
    `top:50%`,
    `left:50%`,
    `transform:translate(-50%,-50%)`,
    `font-family:'Fredoka One',sans-serif`,
    `font-size:36px`,
    `color:white`,
    `text-shadow:0 2px 12px rgba(0,0,0,0.15)`,
    `pointer-events:none`,
    `animation:roundLabelFade 1s ease-in-out forwards`,
    `z-index:102`,
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// =============================================
// End game / Results
// =============================================

function getHardestColour() {
  const entries = Object.entries(state.missedColours);
  if (entries.length === 0) return 'None missed!';
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function endGame() {
  clearInterval(state.timerInterval);
  state.active = false;
  gameScreen.style.cursor = '';

  const rounds     = state.round - 1;
  const elapsed    = Date.now() - state.startTime;
  const hardest    = getHardestColour();
  const percentile = Math.min(99, Math.round((rounds / 12) * 95) + 3);

  let displayRank = { ...getRank(rounds) };

  // Marathon override for endless + no-timer
  if (state.livesMode === 'endless' && state.timerMode === 'none') {
    for (const mr of MARATHON_RANKS) {
      if (elapsed >= mr.ms) {
        displayRank.title = mr.title;
        displayRank.emoji = mr.emoji;
      }
    }
  }

  if (state.currentColour) {
    const [h, s, l] = state.currentColour.hsl;
    resultScreen.style.backgroundColor = hsl(h, s, l);
  }

  // Combo pill
  const toneText  = state.tone === 'grey' ? 'Greyscale' : 'Pastel';
  const livesText = state.livesMode === 'classic' ? 'Classic' : 'Endless';
  const timerText = { '60': '60s', '30': '30s', none: 'No timer' }[state.timerMode];
  const shapeText = { square: 'Square', circle: 'Circle', diamond: 'Diamond', random: 'Random' }[state.shapeMode];
  document.getElementById('result-combo-pill').textContent =
    `${toneText}  ·  ${livesText}  ·  ${timerText}  ·  ${shapeText}`;

  const showScore = state.timerMode !== 'none';
  document.getElementById('result-score').textContent = showScore ? state.score : rounds;
  document.getElementById('result-label').textContent = showScore ? 'score' : 'rounds survived';
  document.getElementById('result-rounds').style.display = showScore ? '' : 'none';

  document.getElementById('result-title').textContent      = displayRank.title;
  document.getElementById('result-desc').textContent       = getRank(rounds).desc;
  document.getElementById('result-rounds').textContent     = `${rounds} round${rounds !== 1 ? 's' : ''} survived`;
  document.getElementById('result-hardest').textContent    = `Trickiest colour: ${hardest}`;
  document.getElementById('result-percentile').textContent = `Better than ${percentile}% of players`;
  document.getElementById('result-elapsed').textContent    = `Time taken: ${formatElapsed(elapsed)}`;

  const wrongNote = state.livesMode === 'endless' ? " (didn't count)" : '';
  document.getElementById('result-wrong-picks').textContent = `✗ Wrong picks: ${state.wrongClicks}${wrongNote}`;

  shareBtn.dataset.score     = state.score;
  shareBtn.dataset.rounds    = rounds;
  shareBtn.dataset.rank      = displayRank.title;
  shareBtn.dataset.tone      = state.tone;
  shareBtn.dataset.livesMode = state.livesMode;
  shareBtn.dataset.timerMode = state.timerMode;
  shareBtn.dataset.shapeMode = state.shapeMode;

  showScreen('result');
}

// =============================================
// Share
// =============================================

shareBtn.addEventListener('click', () => {
  const score     = shareBtn.dataset.score;
  const rounds    = shareBtn.dataset.rounds;
  const rank      = shareBtn.dataset.rank;
  const tone      = shareBtn.dataset.tone;
  const livesMode = shareBtn.dataset.livesMode;
  const timerMode = shareBtn.dataset.timerMode;
  const shapeMode = shareBtn.dataset.shapeMode;

  const toneLabel  = { pastel: 'Pastel', grey: 'Greyscale' }[tone];
  const livesLabel = { classic: '3 lives', endless: 'Endless lives' }[livesMode];
  const timerLabel = { '60': '60s', '30': '30s', none: 'No timer' }[timerMode];
  const shapeLabel = { square: 'Square', circle: 'Circle', diamond: 'Diamond', random: 'Random shape' }[shapeMode];

  const primaryLine = timerMode !== 'none'
    ? `I scored ${score} on pixelpick`
    : `I survived ${rounds} rounds on pixelpick`;

  const modeTag = `(${toneLabel} · ${livesLabel} · ${timerLabel} · ${shapeLabel})`;

  const text = `${primaryLine} ${modeTag}\npixelpick.net`;

  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const orig = shareBtn.textContent;
      shareBtn.textContent = 'Copied!';
      setTimeout(() => { shareBtn.textContent = orig; }, 2000);
    }).catch(() => {
      const orig = shareBtn.textContent;
      shareBtn.textContent = 'Unable to copy';
      setTimeout(() => { shareBtn.textContent = orig; }, 2000);
    });
  }
});

// =============================================
// Event listeners
// =============================================

playBtn.addEventListener('click', initGame);

document.getElementById('home-btn').addEventListener('click', () => {
  clearInterval(state.timerInterval);
  state.active = false;
  gameScreen.style.cursor = '';
  timerPill.style.display = '';
  showScreen('start');
  startLogoCycle();
});

playAgainBtn.addEventListener('click', () => {
  showScreen('start');
  startLogoCycle();
});

gameCanvas.addEventListener('click', (e) => {
  handleInput(e.clientX, e.clientY);
});

gameCanvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  handleInput(t.clientX, t.clientY);
}, { passive: false });

// =============================================
// Initialise start screen
// =============================================

renderQuickStartButtons();
renderFilterRows();
floatingPixels.classList.toggle('greyscale', filterTone === 'grey');
startLogoCycle();

// =============================================
// Floating pixels on start screen
// =============================================

(function generateFloatingPixels() {
  const colours = ['#F4A0B8','#80D8B0','#90C8F0','#C0A0E8','#FFBB88','#A0C8A0','#F0D060','#D8A8E0'];
  const count   = 11;

  for (let i = 0; i < count; i++) {
    const el       = document.createElement('div');
    el.className   = 'floating-pixel';
    const size     = Math.floor(Math.random() * 25) + 16;
    const colour   = colours[Math.floor(Math.random() * colours.length)];
    const left     = Math.floor(Math.random() * 92) + 4;
    const duration = (Math.random() * 12 + 12).toFixed(1);
    const delay    = -(Math.random() * 24).toFixed(1);

    el.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `background:${colour}`,
      `left:${left}%`,
      `animation-duration:${duration}s`,
      `animation-delay:${delay}s`,
    ].join(';');

    floatingPixels.appendChild(el);
  }
}());

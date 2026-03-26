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

const LOGO_CYCLES = [
  { pixel: 'hsl(340, 80%, 74%)', pick: 'hsl(340, 80%, 86%)' },
  { pixel: 'hsl(155, 55%, 62%)', pick: 'hsl(155, 55%, 74%)' },
  { pixel: 'hsl(205, 75%, 70%)', pick: 'hsl(205, 75%, 82%)' },
  { pixel: 'hsl(270, 60%, 72%)', pick: 'hsl(270, 60%, 84%)' },
  { pixel: 'hsl(28,  90%, 71%)', pick: 'hsl(28,  90%, 83%)' },
  { pixel: 'hsl(120, 30%, 65%)', pick: 'hsl(120, 30%, 77%)' },
  { pixel: 'hsl(48,  80%, 61%)', pick: 'hsl(48,  80%, 73%)' },
  { pixel: 'hsl(285, 50%, 72%)', pick: 'hsl(285, 50%, 84%)' },
];

const RANKS = [
  { min: 0,  emoji: '🐛', title: 'Colour Newbie',    desc: 'Everyone starts somewhere!' },
  { min: 2,  emoji: '🦋', title: 'Getting There',    desc: 'Your eyes are warming up.' },
  { min: 4,  emoji: '🎨', title: 'Colour Spotter',   desc: 'Solid perception skills.' },
  { min: 6,  emoji: '🦅', title: 'Eagle Eye',        desc: 'Most people tap out before you did.' },
  { min: 9,  emoji: '💎', title: 'Diamond Vision',   desc: "You're in the top tier of colour perceivers." },
  { min: 12, emoji: '🌈', title: 'Chromatic Legend', desc: "Extraordinary. Are you sure you're human?" },
];

// =============================================
// DOM references
// =============================================

const startScreen  = document.getElementById('start-screen');
const gameScreen   = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const logoPixel = document.querySelector('.logo-pixel');
const logoPick  = document.querySelector('.logo-pick');

const playBtn      = document.getElementById('play-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const shareBtn     = document.getElementById('share-btn');

const gameCanvas    = document.getElementById('game-canvas');
const targetPatch   = document.getElementById('target-patch');
const scoreDisplay  = document.getElementById('score-display');
const timerDisplay  = document.getElementById('timer-display');
const timerPill     = document.getElementById('timer-pill');
const livesDisplay  = document.getElementById('lives-display');

// =============================================
// Game state
// =============================================

let state = {};
let logoCycleInterval = null;
let logoCycleIdx = 0;

function resetState() {
  state = {
    round:          1,
    score:          0,
    lives:          3,
    timeRemaining:  60,
    colourOrder:    shuffle(ROUND_COLOURS),
    currentColour:  null,
    targetRect:     null,
    timerInterval:  null,
    missedColours:  {},   // colourName → miss count
    active:         false,
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

// =============================================
// Logo colour cycle
// =============================================

function startLogoCycle() {
  stopLogoCycle();
  logoCycleIdx = 0;

  // Set first colour immediately so there's no flash from CSS defaults
  logoPixel.style.color = LOGO_CYCLES[0].pixel;
  logoPick.style.color  = LOGO_CYCLES[0].pick;

  logoCycleInterval = setInterval(() => {
    logoCycleIdx = (logoCycleIdx + 1) % LOGO_CYCLES.length;
    logoPixel.style.color = LOGO_CYCLES[logoCycleIdx].pixel;
    logoPick.style.color  = LOGO_CYCLES[logoCycleIdx].pick;
  }, 2000);
}

function stopLogoCycle() {
  clearInterval(logoCycleInterval);
  logoCycleInterval = null;
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
// Game flow
// =============================================

function initGame() {
  stopLogoCycle();
  resetState();
  showScreen('game');

  // Allow layout to settle before placing target
  requestAnimationFrame(() => {
    startRound();
    startTimer();
    state.active = true;
  });
}

function startRound() {
  const { round } = state;

  // Cycle and reshuffle colours every 8 rounds
  const idx = (round - 1) % state.colourOrder.length;
  if (idx === 0 && round > 1) {
    state.colourOrder = shuffle(ROUND_COLOURS);
  }

  const colour       = state.colourOrder[idx];
  state.currentColour = colour;

  const [h, s, l] = colour.hsl;
  const delta      = getDelta(round);
  const size       = getSize(round);

  // Target lightness: add delta, or subtract if near ceiling
  const targetL = (l + delta <= 94) ? l + delta : l - delta;

  // Apply background colour with crossfade (transition set by correctClick)
  gameCanvas.style.backgroundColor = hsl(h, s, l);

  // Size and colour the target
  targetPatch.style.width           = `${size}px`;
  targetPatch.style.height          = `${size}px`;
  targetPatch.style.backgroundColor = hsl(h, s, targetL);

  placeTarget(size);
  updateHUD();
}

function placeTarget(size) {
  const margin    = 80;
  const hudHeight = 80; // safe clearance below HUD
  const w         = window.innerWidth;
  const h         = window.innerHeight;

  const minX = margin;
  const maxX = w - margin - size;
  const minY = margin + hudHeight;
  const maxY = h - margin - size;

  // Clamp in case viewport is very small
  const x = Math.floor(Math.random() * Math.max(1, maxX - minX)) + minX;
  const y = Math.floor(Math.random() * Math.max(1, maxY - minY)) + minY;

  targetPatch.style.left = `${x}px`;
  targetPatch.style.top  = `${y}px`;

  state.targetRect = { x, y, width: size, height: size };
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
  timerDisplay.textContent = state.timeRemaining;
  timerPill.classList.toggle('timer-urgent', state.timeRemaining <= 10);

  // Rebuild hearts
  livesDisplay.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const span = document.createElement('span');
    span.className = `heart ${i < state.lives ? 'heart-full' : 'heart-empty'}`;
    span.textContent = '♥';
    livesDisplay.appendChild(span);
  }
}

// =============================================
// Click / Touch handling
// =============================================

function handleInput(clientX, clientY) {
  if (!state.active) return;

  const t = state.targetRect;
  const hit = clientX >= t.x && clientX <= t.x + t.width
           && clientY >= t.y && clientY <= t.y + t.height;

  if (hit) {
    correctClick(clientX, clientY);
  } else {
    wrongClick();
  }
}

function correctClick(clientX, clientY) {
  state.active = false;

  const delta  = getDelta(state.round);
  const points = Math.round(100 * (delta / 18) * (state.timeRemaining / 60));
  state.score += points;

  showRipple(clientX, clientY);
  updateHUD();

  // Crossfade into next round's background
  gameCanvas.style.transition = 'background-color 0.3s ease';
  state.round++;

  setTimeout(() => {
    startRound();
    gameCanvas.style.transition = '';
    state.active = true;
  }, 300);
}

function wrongClick() {
  state.lives = Math.max(0, state.lives - 1);

  // Track miss for current colour
  const name = state.currentColour.name;
  state.missedColours[name] = (state.missedColours[name] || 0) + 1;

  updateHUD();
  flashWrong();

  if (state.lives === 0) {
    state.active = false;
    gameScreen.classList.add('shake');
    setTimeout(() => {
      gameScreen.classList.remove('shake');
      clearInterval(state.timerInterval);
      endGame('lives');
    }, 500);
  }
}

function flashWrong() {
  gameCanvas.classList.remove('wrong-flash');
  // Force reflow to restart animation
  void gameCanvas.offsetWidth;
  gameCanvas.classList.add('wrong-flash');
  setTimeout(() => gameCanvas.classList.remove('wrong-flash'), 400);
}

function showRipple(x, y) {
  const el = document.createElement('div');
  el.className = 'ripple';
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 650);
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

  const rounds     = state.round - 1;
  const rank       = getRank(rounds);
  const hardest    = getHardestColour();
  const percentile = Math.min(99, Math.round((rounds / 12) * 95) + 3);

  // Tint result screen with last played colour
  if (state.currentColour) {
    const [h, s, l] = state.currentColour.hsl;
    resultScreen.style.backgroundColor = hsl(h, s, l);
  }

  document.getElementById('result-emoji').textContent      = rank.emoji;
  document.getElementById('result-title').textContent      = rank.title;
  document.getElementById('result-desc').textContent       = rank.desc;
  document.getElementById('result-score').textContent      = state.score;
  document.getElementById('result-rounds').textContent     = `${rounds} round${rounds !== 1 ? 's' : ''} survived`;
  document.getElementById('result-hardest').textContent    = `Trickiest colour: ${hardest}`;
  document.getElementById('result-percentile').textContent = `Better than ${percentile}% of players`;

  // Store for share button
  shareBtn.dataset.score  = state.score;
  shareBtn.dataset.rounds = rounds;
  shareBtn.dataset.rank   = rank.title;

  showScreen('result');
}

// =============================================
// Share
// =============================================

shareBtn.addEventListener('click', () => {
  const score  = shareBtn.dataset.score;
  const rounds = shareBtn.dataset.rounds;
  const rank   = shareBtn.dataset.rank;
  const text   = `I scored ${score} on pixelpick and survived ${rounds} rounds! 🎨\nCan you beat my ${rank} score?\npixelpick.net`;

  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const orig = shareBtn.textContent;
      shareBtn.textContent = 'Copied!';
      setTimeout(() => { shareBtn.textContent = orig; }, 2000);
    }).catch(() => {
      // Fallback if clipboard API unavailable
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

// Start logo cycle immediately on page load
startLogoCycle();

// =============================================
// Floating pixels on start screen
// =============================================

(function generateFloatingPixels() {
  const container = document.getElementById('floating-pixels');
  const colours   = ['#F4A0B8','#80D8B0','#90C8F0','#C0A0E8','#FFBB88','#A0C8A0','#F0D060','#D8A8E0'];
  const count     = 11;

  for (let i = 0; i < count; i++) {
    const el       = document.createElement('div');
    el.className   = 'floating-pixel';
    const size     = Math.floor(Math.random() * 25) + 16;          // 16–40px
    const colour   = colours[Math.floor(Math.random() * colours.length)];
    const left     = Math.floor(Math.random() * 92) + 4;           // 4–96%
    const duration = (Math.random() * 12 + 12).toFixed(1);         // 12–24s
    const delay    = -(Math.random() * 24).toFixed(1);             // already in progress

    el.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `background:${colour}`,
      `left:${left}%`,
      `animation-duration:${duration}s`,
      `animation-delay:${delay}s`,
    ].join(';');

    container.appendChild(el);
  }
}());

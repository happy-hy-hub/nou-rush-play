'use strict';
// ============================================================
//  脳トレ・ラッシュ  — 学習 × タイムアタック × 収集
// ============================================================

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rand = n => Math.floor(Math.random() * n);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };

// ---------- 調整パラメータ ----------
const START_TIME = 30, MAX_TIME = 40, GAIN_TIME = 1.5, FEVER_GAIN_TIME = 2, LOSE_TIME = 3;
const FEVER_AT = 10, SPEED_SEC = 2.0, LUCKY_RATE = 0.08, LUCKY_COINS = 15;
const GACHA_COST = 100, GACHA10_COST = 900, PITY = 50, DUP_REFUND = 10;
const RARITY_BONUS = { N: 1, R: 2, SR: 4, SSR: 8 }; // 図鑑ボーナス(XP%)

// ---------- セーブ ----------
const KEY = 'nouRush.v1';
function fresh() {
  return {
    v: SAVE_VERSION, xp: 0, level: 1, coins: 100, streak: 0, lastPlay: null, best: {}, srs: {}, mon: {}, pity: 0, daily: null,
    stats: { plays: 0, correct: 0, answered: 0, maxCombo: 0, pulls: 0 }, sound: true, seenUnlock: 1,
  };
}
// ---------- データを失わないための仕組み ----------
// ・保存形式に版番号（v）を付け、古い形式は migrate() で新しい形式へ移す（消さない）
// ・新しく増えた項目は既定値で補う（深いマージ）
// ・読めないデータは上書きせず退避し、自動バックアップから復元する
// ・1日1回スナップショットを自動で残す（最新5日分）
const SAVE_VERSION = 3, BAK = KEY + '.bak.', BAK_KEEP = 5;
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
function deepFill(dst, def) {
  for (const k in def) { if (dst[k] === undefined) dst[k] = def[k]; else if (isObj(dst[k]) && isObj(def[k])) deepFill(dst[k], def[k]); }
  return dst;
}
function migrate(s, v = s.v || 1) {
  if (v < 2) {
    // 問題（復習の記録）と証拠カードのキーを「番号」から「内容」へ。対応が取れないものも消さずに残す
    const tsrs = {};
    Object.entries(s.tsrs || {}).forEach(([k, val]) => {
      const [tid, ci, qi] = k.split('|'), t = THEMES.find(x => x.id === tid);
      const ok = t && /^\d+$/.test(ci) && t.chapters[+ci] && t.chapters[+ci].questions[+qi];
      tsrs[ok ? qKey(t, +ci, +qi) : k] = val;
    });
    s.tsrs = tsrs;
    Object.entries(s.themes || {}).forEach(([tid, st]) => {
      const t = THEMES.find(x => x.id === tid), cards = {};
      Object.keys(st.cards || {}).forEach(k => {
        const [ci, fi] = k.split('-').map(Number), ok = t && t.chapters[ci] && t.chapters[ci].facts[fi];
        cards[ok ? fKey(t, ci, fi) : k] = 1;
      });
      st.cards = cards;
    });
  }
  if (v === 2) {
    // 問題のキーを「問題文」から「問題文＋答え」へ。同じ問題文の問題には同じ記録を引き継ぐ
    const byOld = {};
    THEMES.forEach(t => t.chapters.forEach((c, ci) => c.questions.forEach((q, qi) => { (byOld[qKeyV2(t, ci, qi)] = byOld[qKeyV2(t, ci, qi)] || []).push(qKey(t, ci, qi)); })));
    const tsrs = {};
    Object.entries(s.tsrs || {}).forEach(([k, val]) => { if (byOld[k]) byOld[k].forEach(nk => { tsrs[nk] = { ...val }; }); else tsrs[k] = val; });
    s.tsrs = tsrs;
  }
  s.v = SAVE_VERSION;
  return s;
}
const backups = () => { try { return Object.keys(localStorage).filter(k => k.startsWith(BAK)).sort().reverse(); } catch (e) { return []; } };
// 版番号は既定値で補う前に読む（先に補うと「最新版」と誤認して移行が飛ばされる）
function parseSave(raw) { const s = JSON.parse(raw); if (!isObj(s)) throw new Error('bad'); const v = s.v || 1; return migrate(deepFill(s, fresh()), v); }
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { }
  if (raw) {
    try {
      const s = JSON.parse(raw);
      if ((s.v || 1) < SAVE_VERSION) try { localStorage.setItem(`${BAK}pre-v${SAVE_VERSION}`, raw); } catch (e) { } // 移行前の控え
      return parseSave(raw);
    } catch (e) { try { localStorage.setItem(`${KEY}.broken.${Date.now()}`, raw); } catch (_) { } }
  }
  for (const k of backups()) { try { return parseSave(localStorage.getItem(k)); } catch (e) { } }
  return fresh();
}
function save() {
  try {
    const json = JSON.stringify(S);
    localStorage.setItem(KEY, json);
    const today = BAK + dayStr();
    if (!localStorage.getItem(today)) {
      localStorage.setItem(today, json);
      backups().filter(k => /\d{4}-\d\d-\d\d$/.test(k)).slice(BAK_KEEP).forEach(k => localStorage.removeItem(k));
    }
  } catch (e) { }
}
let S = load();
// ブラウザに「このデータは消さないで」と頼む（iPhone のホーム画面アプリ等で有効）
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { }

// ---------- レベル・ランク ----------
const needXP = l => Math.round(60 * Math.pow(l, 1.35) + 40);
const rankOf = l => RANK_TITLES.reduce((t, [lv, name]) => l >= lv ? name : t, RANK_TITLES[0][1]);
const collectionBonus = () => Object.keys(S.mon).reduce((s, id) => {
  const c = CREATURES.find(x => x[0] === id); return s + (c ? RARITY_BONUS[c[3]] : 0);
}, 0);
const dayGap = (a, b) => { const p = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }; return Math.round((p(b) - p(a)) / 864e5); };
// 1日休んでもフリーズ🧊があれば連続記録は守られる
const streakAlive = () => S.lastPlay && (dayGap(S.lastPlay, dayStr()) <= 1 || (dayGap(S.lastPlay, dayStr()) === 2 && (S.freeze || 0) > 0));
const curStreak = () => streakAlive() ? S.streak : 0;

// ---------- デイリーミッション ----------
function seeded(seed) {
  let x = 0; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
}
function ensureDaily() {
  const t = dayStr();
  if (S.daily && S.daily.day === t) return;
  const r = seeded(t + S.level);
  const pool = MISSION_POOL.slice();
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const tier = S.level < 4 ? 0 : S.level < 10 ? 1 : 2;
  S.daily = {
    day: t, decks: [], chest: false,
    list: pool.slice(0, 3).map(m => ({
      type: m.type, goal: m.goals[Math.min(tier, m.goals.length - 1)],
      reward: Math.round(m.reward * (1 + tier * 0.5)), prog: 0, claimed: false,
    })),
  };
  save();
}
const missionText = m => MISSION_POOL.find(p => p.type === m.type).text(m.goal);

// ---------- 記憶 (簡易 Leitner) ----------
// box: undefined=未出題, 0=間違えた, 1-2=学習中, 3+=マスター
const srsOf = id => S.srs[id] || (S.srs[id] = {});
function deckStat(deck) {
  if (deck.generated) return null;
  const s = srsOf(deck.id); let m = 0, w = 0, seen = 0;
  deck.items.forEach((_, i) => { const b = s[i]; if (b !== undefined) seen++; if (b >= 3) m++; if (b === 0) w++; });
  return { mastery: m / deck.items.length, mastered: m, wrong: w, seen, total: deck.items.length };
}
function pickIndex(deck, recent) {
  const s = srsOf(deck.id), g = { wrong: [], learn: [], fresh: [], known: [] };
  deck.items.forEach((_, i) => {
    if (recent.includes(i)) return;
    const b = s[i];
    if (b === undefined) g.fresh.push(i); else if (b === 0) g.wrong.push(i); else if (b < 3) g.learn.push(i); else g.known.push(i);
  });
  const r = Math.random();
  let pick;
  if (g.wrong.length && r < 0.35) pick = g.wrong;
  else if (g.learn.length && r < 0.65) pick = g.learn;
  else if (g.fresh.length && r < 0.92) pick = g.fresh;
  else pick = [g.known, g.fresh, g.learn, g.wrong].find(x => x.length);
  if (!pick || !pick.length) pick = deck.items.map((_, i) => i).filter(i => !recent.includes(i));
  return pick[rand(pick.length)];
}

// ---------- サウンド ----------
let AC = null;
function tone(f, d = 0.12, type = 'sine', v = 0.12, delay = 0) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
  } catch (e) { }
}
const sfx = {
  ok: c => { const f = 523 * Math.pow(2, Math.min(c, 24) / 12); tone(f, .1, 'triangle', .14); tone(f * 1.5, .12, 'sine', .07, .05); },
  ng: () => { tone(160, .25, 'sawtooth', .1); tone(120, .3, 'sawtooth', .08, .08); },
  tick: () => tone(880, .05, 'square', .04),
  fever: () => [0, 4, 7, 12, 16].forEach((n, i) => tone(523 * Math.pow(2, n / 12), .15, 'square', .06, i * .06)),
  level: () => [0, 4, 7, 12, 7, 12, 16, 19].forEach((n, i) => tone(392 * Math.pow(2, n / 12), .2, 'triangle', .12, i * .08)),
  coin: () => { tone(988, .08, 'square', .06); tone(1319, .2, 'square', .06, .07); },
  gacha: r => { const n = { N: 3, R: 5, SR: 7, SSR: 10 }[r]; for (let i = 0; i < n; i++) tone(440 * Math.pow(2, i * 2 / 12), .18, 'triangle', .1, i * .07); },
};

// ---------- 演出 ----------
const fx = $('#fx');
function floatText(txt, x, y, color = '#ffcc33', size = 22) {
  if (window.SIM) return;
  const d = document.createElement('div');
  d.className = 'float'; d.textContent = txt;
  d.style.cssText = `left:${x}px;top:${y}px;color:${color};font-size:${size}px;transform:translateX(-50%)`;
  fx.appendChild(d); d.addEventListener('animationend', () => d.remove()); setTimeout(() => d.remove(), 1200);
}
function burst(x, y, n = 14, colors = ['#ffcc33', '#2ee59d', '#5ad1ff', '#ff5c7a', '#b18cff']) {
  if (window.SIM) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div'); p.className = 'particle';
    p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = colors[rand(colors.length)];
    fx.appendChild(p);
    const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 120;
    p.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v + 60}px) rotate(${rand(720)}deg)`, opacity: 0 }],
      { duration: 700 + rand(400), easing: 'cubic-bezier(.2,.8,.4,1)' }).onfinish = () => p.remove();
  }
}
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}
function modal(html, cls = '') {
  const m = document.createElement('div'); m.className = 'modal ' + cls;
  m.innerHTML = `<div class="box">${html}</div>`;
  document.body.appendChild(m); return m;
}
function closeModal(el) { const m = el || $('.modal'); if (m) m.remove(); }
function countUp(el, to, ms = 900) {
  const st = performance.now();
  const step = t => { const k = Math.max(0, Math.min(1, (t - st) / ms)); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString(); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// ============================================================
//  画面: ホーム
// ============================================================
let screen = 'home';
function hud() {
  const p = Math.round(S.xp / needXP(S.level) * 100), st = curStreak(), today = S.lastPlay === dayStr();
  return `<div class="hud">
    <div class="lvl" style="--p:${p}"><b>${S.level}</b><small>Lv</small></div>
    <div class="who"><div class="t">${S.xp} / ${needXP(S.level)} XP</div><div class="n">${esc(rankOf(S.level))}</div></div>
    <div class="pill fire ${today ? '' : 'cold'}" title="連続プレイ日数（🧊=1日休んでも守るフリーズ。7日連続ごとに獲得）">🔥 ${st}${S.freeze ? `<small>🧊${S.freeze}</small>` : ''}</div>
    <div class="pill" title="コイン">🪙 <span id="coinv">${S.coins}</span></div>
  </div>`;
}
// ホーム＝最後に開いていたタブ（タブの中身は app.js）
function renderHome() { goTab(S.tab || 'tower'); }

// ============================================================
//  画面: プレイ
// ============================================================
let R = null;
function startRound(deckId) {
  const deck = DECKS.find(d => d.id === deckId);
  S.lastDeck = deckId;
  R = {
    deck, score: 0, combo: 0, maxCombo: 0, correct: 0, wrong: 0, time: START_TIME, recent: [], missed: [],
    mastered: 0, lucky: 0, paused: true, over: false, lock: true, q: null, fever: false, last: 0, lowTick: 0,
  };
  screen = 'play';
  const best = S.best[deck.id] || 0;
  app.innerHTML = `<div id="play">
    <div class="play-top"><button class="quit" data-act="quit">✕</button>
      <div class="timebar" id="tb"><i id="tbi"></i></div><div class="tnum" id="tn">${START_TIME}</div></div>
    <div class="scoreline"><div><div class="score" id="sc">0</div><div class="ghost" id="gh">${best ? `ベスト ${best.toLocaleString()}` : '初プレイ！'}</div></div>
      <div class="combo" id="cb"></div></div>
    <div class="fever-banner">🔥 FEVER ×2 🔥</div>
    <div class="qbox" id="qb"><div class="count" id="cd" style="margin:0;font-size:80px">3</div></div>
    <div class="choices" id="chs"></div></div>`;
  drawTime();
  let n = 3; sfx.tick();
  const me = R;
  const cd = setInterval(() => {
    n--;
    if (R !== me || R.over) return clearInterval(cd);
    if (n > 0) { $('#cd').textContent = n; $('#cd').style.animation = 'none'; void $('#cd').offsetWidth; $('#cd').style.animation = ''; sfx.tick(); }
    else {
      clearInterval(cd); tone(1320, .2, 'square', .08);
      R.paused = false; R.last = performance.now(); nextQ(); requestAnimationFrame(loop);
    }
  }, 550);
}
function makeQ() {
  const deck = R.deck;
  if (deck.generated) return mathQ();
  const i = pickIndex(deck, R.recent);
  R.recent.push(i); if (R.recent.length > Math.min(6, deck.items.length - 4)) R.recent.shift();
  const it = deck.items[i], rev = deck.reversible && Math.random() < 0.4;
  const ai = rev ? 0 : 1, ans = it[ai];
  let pool = deck.items.filter((x, j) => j !== i && x[ai] !== ans).map(x => x[ai]);
  if (deck.near) { // 年号など: 近い値を紛らわしいダミーにする
    const v = parseInt(ans);
    pool = pool.sort((a, b) => Math.abs(parseInt(a) - v) - Math.abs(parseInt(b) - v)).slice(0, 6);
  }
  const opts = [...new Set(shuffle(pool))].slice(0, 3);
  const b = srsOf(deck.id)[i];
  return { idx: i, q: it[rev ? 1 : 0], ans, choices: shuffle([ans, ...opts]), ask: deck.ask(rev), isNew: b === undefined, isWrong: b === 0, lucky: Math.random() < LUCKY_RATE };
}
function mathQ() {
  const d = R.correct, t = Math.random();
  let a, b, op, ans;
  if (d < 6) { a = rand(9) + 1 + (d > 2 ? rand(10) : 0); b = rand(9) + 1; op = t < .5 ? '+' : '-'; if (op === '-' && b > a) [a, b] = [b, a]; }
  else if (d < 14) {
    if (t < .4) { a = rand(40) + 10; b = rand(40) + 10; op = '+'; }
    else if (t < .7) { a = rand(50) + 30; b = rand(29) + 1; op = '-'; }
    else { a = rand(8) + 2; b = rand(8) + 2; op = '×'; }
  } else {
    if (t < .3) { a = rand(90) + 10; b = rand(90) + 10; op = '+'; }
    else if (t < .55) { a = rand(80) + 40; b = rand(39) + 1; op = '-'; }
    else if (t < .85) { a = rand(18) + 2; b = rand(8) + 2; op = '×'; }
    else { b = rand(8) + 2; a = b * (rand(11) + 2); op = '÷'; }
  }
  ans = op === '+' ? a + b : op === '-' ? a - b : op === '×' ? a * b : a / b;
  const set = new Set([ans]);
  for (const o of shuffle([1, 2, 10, -1, -2, -10, 3, -3, 5, -5, 11, -9, 9, 20, -20])) { if (set.size >= 4) break; if (ans + o >= 0) set.add(ans + o); }
  return { idx: null, q: `${a} ${op} ${b}`, ans: String(ans), choices: shuffle([...set].map(String)), ask: '計算しよう！', lucky: Math.random() < LUCKY_RATE };
}
function nextQ() {
  if (!R || R.over) return;
  const q = R.q = makeQ();
  const long = q.q.length > 9;
  $('#qb').className = 'qbox';
  $('#qb').innerHTML = `${q.lucky ? '<div class="lucky">★ ラッキー問題 +15🪙 ★</div>' : ''}
    ${q.isNew ? '<div class="newtag">NEW</div>' : ''}${q.isWrong ? '<div class="revtag">リベンジ！</div>' : ''}
    <div class="ask">${esc(q.ask)}</div><div class="q ${long ? 'long' : ''}">${esc(q.q)}</div>`;
  $('#chs').innerHTML = q.choices.map((c, i) => `<button class="ch" data-act="ans:${i}"><span class="k">${i + 1}</span>${esc(c)}</button>`).join('');
  R.qStart = performance.now(); R.lock = false;
}
const multOf = c => 1 + Math.floor(c / 5) * 0.25;
function answer(ci) {
  if (!R || R.lock || R.over || R.paused) return;
  const q = R.q, btns = $$('.ch'), el = btns[ci];
  if (!el) return;
  R.lock = true;
  const ok = q.choices[ci] === q.ans, rc = el.getBoundingClientRect(), x = rc.left + rc.width / 2, y = rc.top;
  const s = R.deck.generated ? null : srsOf(R.deck.id);
  if (ok) {
    R.combo++; R.correct++; R.maxCombo = Math.max(R.maxCombo, R.combo);
    const speed = (performance.now() - R.qStart) / 1000 < SPEED_SEC, fever = R.combo >= FEVER_AT;
    const pts = Math.round(100 * multOf(R.combo) * (speed ? 1.5 : 1) * (fever ? 2 : 1));
    R.score += pts; R.time = Math.min(MAX_TIME, R.time + (fever ? FEVER_GAIN_TIME : GAIN_TIME));
    if (s) { const old = s[q.idx]; const nb = old === undefined ? 1 : Math.min(5, old + 1); s[q.idx] = nb; if ((old ?? 0) < 3 && nb >= 3) { R.mastered++; floatText('⭐ マスター!', x, y - 40, '#5ad1ff', 18); } }
    if (q.lucky) { R.lucky += LUCKY_COINS; floatText(`+${LUCKY_COINS}🪙`, x, y - 70, '#ffcc33', 20); sfx.coin(); }
    el.classList.add('ok'); sfx.ok(R.combo);
    floatText(`+${pts}${speed ? ' ⚡' : ''}`, x, y, fever ? '#ffcc33' : '#2ee59d', speed ? 26 : 22);
    burst(x, y + rc.height / 2, fever ? 22 : 10);
    if (R.combo === FEVER_AT) { sfx.fever(); toast('🔥 FEVER突入！ 得点2倍！'); }
    if (R.combo > 0 && R.combo % 10 === 0) burst(innerWidth / 2, innerHeight / 3, 40);
    updatePlayHud(true);
    const me = R; setTimeout(() => R === me && nextQ(), 230);
  } else {
    R.combo = 0; R.wrong++; R.time = Math.max(0, R.time - LOSE_TIME); R.paused = true;
    if (s) s[q.idx] = 0;
    if (!R.missed.some(m => m.q === q.q)) R.missed.push({ q: q.q, a: q.ans });
    el.classList.add('ng'); btns[q.choices.indexOf(q.ans)].classList.add('reveal', 'ok');
    $('#qb').classList.add('shake'); sfx.ng();
    floatText(`-${LOSE_TIME}秒`, x, y, '#ff5c7a');
    if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(80);
    updatePlayHud(false);
    const me = R;
    setTimeout(() => { if (R !== me || R.over) return; R.paused = false; R.last = performance.now(); if (R.time <= 0) return endRound(); nextQ(); }, 1100);
  }
}
function updatePlayHud(pop) {
  $('#sc').textContent = R.score.toLocaleString();
  const best = S.best[R.deck.id] || 0;
  $('#gh').textContent = !best ? '初プレイ！' : R.score > best ? '🎉 ベスト更新中！' : `ベストまで あと ${(best - R.score).toLocaleString()}`;
  const cb = $('#cb');
  cb.innerHTML = R.combo >= 2 ? `${R.combo} COMBO<small>×${multOf(R.combo).toFixed(2)}</small>` : '';
  if (pop) { cb.classList.remove('pop'); void cb.offsetWidth; cb.classList.add('pop'); }
  const fever = R.combo >= FEVER_AT;
  $('#play').classList.toggle('fever', fever); document.body.classList.toggle('fever-bg', fever);
}
function drawTime() {
  const tb = $('#tb'); if (!tb) return;
  $('#tbi').style.width = (R.time / MAX_TIME * 100) + '%';
  $('#tn').textContent = R.time.toFixed(1);
  tb.classList.toggle('low', R.time < 6);
}
function loop(t) {
  if (!R || R.over || screen !== 'play') return;
  const dt = Math.min(0.1, (t - R.last) / 1000); R.last = t;
  if (!R.paused) {
    R.time -= dt;
    if (R.time < 5 && Math.floor(R.time) !== R.lowTick) { R.lowTick = Math.floor(R.time); sfx.tick(); }
  }
  drawTime();
  if (R.time <= 0 && !R.paused) { R.time = 0; drawTime(); return endRound(); }
  requestAnimationFrame(loop);
}

// ============================================================
//  リザルト
// ============================================================
function endRound() {
  if (R.over) return;
  R.over = true; document.body.classList.remove('fever-bg');
  const deck = R.deck;
  const { prevBest, record, xpGain, coins, bonusPct, streakUp, streakBonus, newlyDone, oldLevel, oldPct } =
    applyRewards({ id: deck.id, score: R.score, correct: R.correct, wrong: R.wrong, maxCombo: R.maxCombo, mastered: R.mastered, extraCoins: R.lucky });
  renderResult(deck, { prevBest, record, xpGain, coins, bonusPct, streakUp, streakBonus, newlyDone, oldLevel, oldPct });
}
// 1ラウンド分の報酬・統計・ミッション・レベルを反映（クイズ/探検 共通）
function applyRewards({ id, score, correct, wrong, maxCombo, mastered = 0, extraCoins = 0, xpMult = 1 }) {
  const prevBest = S.best[id] || 0, record = score > prevBest && score > 0;
  if (record) S.best[id] = score;

  // 連続日数
  let streakBonus = 0, streakUp = false;
  const t = dayStr();
  if (S.lastPlay !== t) {
    const gap = S.lastPlay ? dayGap(S.lastPlay, t) : 99;
    if (gap === 1) S.streak++;
    else if (gap === 2 && (S.freeze || 0) > 0) { S.freeze--; S.streak++; toast('🧊 フリーズが連続記録を守った！'); }
    else S.streak = 1;
    if (S.streak % 7 === 0 && (S.freeze || 0) < 2) { S.freeze = (S.freeze || 0) + 1; }
    S.bestStreak = Math.max(S.bestStreak || 0, S.streak);
    S.lastPlay = t; streakUp = true;
    streakBonus = 10 * Math.min(S.streak, 10);
  }
  // 報酬
  const bonusPct = collectionBonus();
  const xpGain = Math.round((correct * 5 + score / 50) * (1 + bonusPct / 100) * xpMult);
  let coins = Math.floor(score / 150) + extraCoins + streakBonus + (record ? 30 : 0);

  // 統計
  S.stats.plays++; S.stats.correct += correct; S.stats.answered += correct + wrong;
  S.stats.maxCombo = Math.max(S.stats.maxCombo, maxCombo);

  // ミッション
  ensureDaily();
  const D = S.daily;
  if (!D.decks.includes(id)) D.decks.push(id);
  D.plays = (D.plays || 0) + 1;
  const before = D.list.map(m => m.prog >= m.goal);
  D.list.forEach(m => {
    if (m.type === 'correct') m.prog += correct;
    if (m.type === 'combo') m.prog = Math.max(m.prog, maxCombo);
    if (m.type === 'plays') m.prog += 1;
    if (m.type === 'score') m.prog = Math.max(m.prog, score);
    if (m.type === 'mastered') m.prog += mastered;
    if (m.type === 'decks') m.prog = D.decks.length;
  });
  const newlyDone = D.list.filter((m, i) => !before[i] && m.prog >= m.goal);

  // レベル
  const oldLevel = S.level, oldPct = S.xp / needXP(S.level);
  S.xp += xpGain;
  while (S.xp >= needXP(S.level)) { S.xp -= needXP(S.level); S.level++; coins += 50; }
  S.coins += coins;
  save();
  return { prevBest, record, xpGain, coins, bonusPct, streakUp, streakBonus, newlyDone, oldLevel, oldPct };
}
// XPバー・レベルアップ演出（共通）
function animateXP(oldLevel) {
  const leveled = S.level > oldLevel;
  setTimeout(() => { const b = $('#xpb'); if (b) b.style.width = (leveled ? 100 : S.xp / needXP(S.level) * 100) + '%'; }, 100);
  if (leveled) setTimeout(() => levelUpModal(oldLevel), 1300);
}
function rewardCard({ xpGain, coins, bonusPct, oldPct, streakUp, streakBonus }, extra = '') {
  return `<div class="card">
      <div class="gain"><span>+${xpGain} XP${bonusPct ? ` <small class="ghost">(図鑑+${bonusPct}%)</small>` : ''}</span><span>+${coins} 🪙</span></div>
      <div class="xpbar"><i id="xpb" style="width:${oldPct * 100}%"></i></div>
      <div class="ghost" style="margin-top:6px">${nextGoal()}</div>
      ${streakUp ? `<div class="ghost" style="margin-top:8px">🔥 ${S.streak}日連続ボーナス +${streakBonus}🪙</div>` : ''}${extra}
    </div>`;
}
const missionDoneCard = newlyDone => newlyDone.length ? `<div class="card"><h3>✅ ミッション達成！</h3>${newlyDone.map(m => `<div class="mission"><div class="mt">${esc(missionText(m))}</div><span class="done">🪙${m.reward}</span></div>`).join('')}<div class="ghost" style="margin-top:6px">ホームで受け取ろう</div></div>` : '';
function renderResult(deck, rw) {
  const { prevBest, record, oldLevel, newlyDone } = rw;
  const ds = deckStat(deck);
  const answered = R.correct + R.wrong, acc = answered ? Math.round(R.correct / answered * 100) : 0;
  screen = 'result';
  app.innerHTML = `${hud()}
    <div class="res-head"><div class="lab">${deck.icon} ${esc(deck.name)} のスコア</div>
      <div class="big" id="rs">0</div>
      ${record ? `<div class="newrec">🏆 NEW RECORD！ +30🪙</div>` : prevBest ? `<div class="near">ベストまで あと ${(prevBest - R.score).toLocaleString()}点！ もう少し！</div>` : ''}
    </div>
    <div class="stats">
      <div class="stat"><b>${R.correct}</b><span>正解</span></div>
      <div class="stat"><b>${R.maxCombo}</b><span>最大コンボ</span></div>
      <div class="stat"><b>${acc}%</b><span>正答率</span></div>
    </div>
    ${rewardCard(rw, `${R.mastered ? `<div class="ghost" style="margin-top:4px">⭐ 新たに ${R.mastered}個 マスター！</div>` : ''}
      ${ds ? `<div class="ghost" style="margin-top:4px">習得率 ${Math.round(ds.mastery * 100)}%（${ds.mastered}/${ds.total}）</div>` : ''}`)}
    ${missionDoneCard(newlyDone)}
    <div class="row" style="margin-bottom:12px"><button class="btn primary big" data-act="again">▶ もう1回<span class="sub">Enter</span></button></div>
    ${R.missed.length ? `<div class="card"><h3><span>📝 覚えよう（次で出るよ）</span><span>${R.missed.length}</span></h3>
      ${R.missed.map(m => `<div class="miss"><span>${esc(m.q)}</span><b>${esc(m.a)}</b></div>`).join('')}</div>` : ''}
    <div class="row"><button class="btn" data-act="home">🏠 ホーム</button><button class="btn" data-act="gacha">🎰 ガチャ<span class="sub">🪙${S.coins}</span></button></div>`;
  countUp($('#rs'), R.score);
  if (record) setTimeout(() => { burst(innerWidth / 2, 120, 50); sfx.level(); }, 700);
  animateXP(oldLevel);
}
function nextGoal() {
  const rest = needXP(S.level) - S.xp, nxt = DECKS.find(d => d.unlock === S.level + 1);
  const title = RANK_TITLES.find(([lv]) => lv === S.level + 1);
  return `あと <b style="color:var(--xp)">${rest}XP</b> で Lv.${S.level + 1}` +
    (nxt ? ` → ${nxt.icon} ${esc(nxt.name)} 解放！` : title ? ` → 称号「${esc(title[1])}」` : '');
}
function levelUpModal(oldLevel) {
  const unlocked = DECKS.filter(d => d.unlock > oldLevel && d.unlock <= S.level);
  const newTitle = rankOf(S.level) !== rankOf(oldLevel);
  if (unlocked.length) S.seenUnlock = Math.max(...unlocked.map(d => d.unlock));
  save();
  sfx.level(); burst(innerWidth / 2, innerHeight / 2, 60);
  modal(`<div class="bigemoji">🎉</div><h2>LEVEL UP!</h2>
    <div style="font-size:40px;font-weight:900">Lv.${oldLevel} → <span style="color:var(--accent)">${S.level}</span></div>
    ${newTitle ? `<p>新しい称号：<b style="color:#fff">${esc(rankOf(S.level))}</b></p>` : '<p>&nbsp;</p>'}
    ${unlocked.map(d => `<div class="card" style="text-align:left">🔓 <b>${d.icon} ${esc(d.name)}</b> が解放された！</div>`).join('')}
    <div class="ghost" style="margin-bottom:12px">ボーナス +${(S.level - oldLevel) * 50}🪙</div>
    <button class="btn primary" style="width:100%" data-act="close">やったー！</button>`);
}

// ============================================================
//  ガチャ・図鑑
// ============================================================
function renderGacha() {
  screen = 'gacha';
  app.innerHTML = `${hud()}
    ${typeof roleBanner === 'function' ? roleBanner() : ''}
    <div class="card gcard"><h3><span>🥚 キャラガチャ</span><span class="ghost">SSR確定まで ${PITY - S.pity}回</span></h3>
      <p class="ghost">集めたキャラの数だけ獲得XPがずっとUP（今 <b style="color:var(--xp)">XP+${collectionBonus()}%</b>）</p>
      <div class="mgrid three">
        <button class="btn primary" data-act="pull1" ${S.coins < GACHA_COST ? 'disabled' : ''}>1回<span class="sub">🪙${GACHA_COST}</span></button>
        <button class="btn primary" data-act="pull10" ${S.coins < GACHA10_COST ? 'disabled' : ''}>10連<span class="sub">🪙${GACHA10_COST}・SR確定</span></button>
        <button class="btn" data-act="dex">📖 図鑑<span class="sub">${Object.keys(S.mon).length}/${CREATURES.length}</span></button>
      </div>
      <div class="ghost" style="margin-top:6px;font-size:11px">SSR 3%・SR 10%・R 30%・N 57% ／ ダブりは🪙${DUP_REFUND}返却</div></div>`;
}
function roll(minSR) {
  S.pity++; S.stats.pulls++;
  const r = Math.random();
  let rar = S.pity >= PITY ? 'SSR' : r < .03 ? 'SSR' : r < .13 ? 'SR' : r < .43 ? 'R' : 'N';
  if (minSR && (rar === 'N' || rar === 'R')) rar = 'SR';
  if (rar === 'SSR') S.pity = 0;
  const pool = CREATURES.filter(c => c[3] === rar), c = pool[rand(pool.length)];
  const isNew = !S.mon[c[0]];
  S.mon[c[0]] = (S.mon[c[0]] || 0) + 1;
  if (!isNew) S.coins += DUP_REFUND;
  return { c, isNew };
}
function pull(n) {
  const cost = n === 10 ? GACHA10_COST : GACHA_COST;
  if (S.coins < cost) return toast('コインが足りない！');
  S.coins -= cost;
  const res = [];
  for (let i = 0; i < n; i++) res.push(roll(n === 10 && i === 9 && !res.some(x => x.c[3] === 'SR' || x.c[3] === 'SSR')));
  save();
  const order = ['N', 'R', 'SR', 'SSR'];
  const top = res.reduce((t, x) => order.indexOf(x.c[3]) > order.indexOf(t) ? x.c[3] : t, 'N');
  const m = modal(`<div class="capsule">${top === 'SSR' ? '🌟' : top === 'SR' ? '💜' : '🥚'}</div><p>ドキドキ…</p>`);
  tone(300, .6, 'triangle', .05);
  setTimeout(() => {
    closeModal(m); sfx.gacha(top);
    if (top === 'SSR' || top === 'SR') burst(innerWidth / 2, innerHeight / 2, top === 'SSR' ? 80 : 40);
    const body = n === 1
      ? (() => { const { c, isNew } = res[0]; return `<span class="rar ${c[3]}">${c[3]}</span><div class="bigemoji">${c[2]}</div><h2>${esc(c[1])}</h2>
          <p>${isNew ? '<b style="color:var(--good)">NEW！ 図鑑に登録</b>' : `ダブり → 🪙${DUP_REFUND} 返却`}</p>`; })()
      : `<h2>10連結果</h2><div class="dex" style="margin:12px 0">${res.map(({ c, isNew }) => `<div class="mon ${c[3]}">${isNew ? '<span class="cnt">NEW</span>' : ''}<div class="e">${c[2]}</div><div class="nm">${esc(c[1])}</div></div>`).join('')}</div>`;
    modal(`${body}<div class="ghost" style="margin-bottom:12px">図鑑 ${Object.keys(S.mon).length}/${CREATURES.length} ・ XPボーナス +${collectionBonus()}%</div>
      <div class="row"><button class="btn" data-act="close">OK</button>${S.coins >= cost ? `<button class="btn primary" data-act="${n === 10 ? 'pull10' : 'pull1'}">もう1回</button>` : ''}</div>`, 'glow-' + top);
    renderGacha();
  }, 1100);
}
function renderDex() {
  screen = 'dex';
  const owned = Object.keys(S.mon).length;
  app.innerHTML = `<div class="title"><button class="back" data-act="home">←</button><h2>📖 図鑑 ${owned}/${CREATURES.length}</h2><div class="pill">XP+${collectionBonus()}%</div></div>
    <div class="bar" style="margin-bottom:14px;height:10px"><i style="width:${owned / CREATURES.length * 100}%"></i></div>
    <div class="dex">${CREATURES.map(c => {
      const n = S.mon[c[0]];
      return `<div class="mon ${n ? c[3] : 'unk'}">${n > 1 ? `<span class="cnt">×${n}</span>` : ''}<div class="e">${c[2]}</div><div class="nm">${n ? esc(c[1]) : '？？？'}</div><span class="rar ${c[3]}" style="font-size:9px;padding:0 5px">${c[3]}</span></div>`;
    }).join('')}</div>`;
}

// ============================================================
//  入力
// ============================================================
app.addEventListener('click', onAct);
document.body.addEventListener('click', e => { if (e.target.closest('.modal')) onAct(e); });
function onAct(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (e.currentTarget === document.body && !b.closest('.modal')) return;
  e.stopPropagation();
  const [act, arg] = b.dataset.act.split(':');
  switch (act) {
    case 'play': startRound(arg); break;
    case 'ans': answer(+arg); break;
    case 'again': startRound(R.deck.id); break;
    case 'home': renderHome(); break;
    case 'quit': if (R) { R.over = true; } renderHome(); break;
    case 'gacha': renderGacha(); break;
    case 'dex': renderDex(); break;
    case 'pull1': closeModal(b.closest('.modal') || undefined); pull(1); break;
    case 'pull10': closeModal(b.closest('.modal') || undefined); pull(10); break;
    case 'close': closeModal(b.closest('.modal')); break;
    case 'locked': toast(`Lv.${arg} で解放！ 遊んでレベルを上げよう`); break;
    case 'claim': {
      const m = S.daily.list[+arg]; if (!m || m.claimed || m.prog < m.goal) return;
      m.claimed = true; S.coins += m.reward; save(); sfx.coin();
      const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 20); floatText(`+${m.reward}🪙`, r.left + r.width / 2, r.top);
      renderHome(); break;
    }
    case 'chest': {
      if (S.daily.chest) return;
      S.daily.chest = true; S.coins += 200; save(); sfx.level(); burst(innerWidth / 2, innerHeight / 2, 60);
      modal(`<div class="bigemoji">🎁</div><h2>+200 🪙</h2><p>今日のミッション完全制覇！</p><button class="btn primary" style="width:100%" data-act="close">受け取る</button>`);
      renderHome(); break;
    }
    case 'gotab': goTab(arg); break;
    case 'backup': backupModal(); break;
    case 'bkcopy': case 'bkfile': case 'bkpaste': case 'bkrestore': backupAct(act, b.dataset.act.slice(act.length + 1)); break;
    case 'sound': S.sound = !S.sound; save(); renderMore(); break;
    case 'share': {
      const url = location.href.split('#')[0].replace(/index\.html.*$/, '');
      const data = { title: '脳トレ・ラッシュ', text: '調べたテーマで遊ぶ学習ローグライク。ホーム画面に追加するとアプリみたいに遊べるよ', url };
      if (navigator.share) navigator.share(data).catch(() => { });
      else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('📋 URLをコピーしました'), () => toast(url));
      else toast(url);
      break;
    }
    case 'reset':
      if (confirm('全データを消去します。よろしいですか？')) { S = fresh(); save(); renderHome(); }
      break;
    default:
      if (typeof themeAct === 'function' && themeAct(act, arg, b)) return;
      if (typeof rogueAct === 'function') rogueAct(act, arg, b);
  }
}
document.addEventListener('keydown', e => {
  if (typeof QOV !== 'undefined' && QOV) return QOV.key(e);
  if ($('.modal')) { if (e.key === 'Enter' || e.key === 'Escape') { const p = $('.modal [data-act="close"]'); if (p) p.click(); } return; }
  if (screen === 'play' && /^[1-4]$/.test(e.key)) answer(+e.key - 1);
  else if (screen === 'result' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startRound(R.deck.id); }
  else if (screen[0] === 't' && typeof themeKey === 'function') themeKey(e);
  else if (screen.startsWith('rg') && typeof rogueKey === 'function') rogueKey(e);
});

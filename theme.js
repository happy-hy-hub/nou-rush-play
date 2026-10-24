'use strict';
// ============================================================
//  テーマ探検モード — 調査済みテーマパックを章ごとに攻略する
//  ・確信度ベット（超修正効果） ・事前予想（生成効果）
//  ・遺物3択（ローグライト） ・証拠カードの可変ドロップ
//  ・クリフハンガー ・間隔反復の「記憶の封印」
// ============================================================

const T_HEARTS = 3, T_MAX_HEARTS = 5, RUN_LEN = 10, RELIC_AT = [3, 7], REVIEW_LEN = 8;
const HITSTOP_MS = 80, AUTO_NEXT_MS = 2600;
const CONF = {
  1: { label: '慎重', star: '★', mult: 0.5, loss: 1, keepCombo: true, desc: 'ミスしてもコンボ維持' },
  2: { label: '普通', star: '★★', mult: 1, loss: 1, desc: '' },
  3: { label: '確信', star: '★★★', mult: 2.5, loss: 2, desc: '当たれば2.5倍・外すと❤2' },
};
const SRS_DAYS = [0, 1, 3, 7, 16];
const DROP_BASE = 0.18, DROP_PITY = 5; // 1章のカードは2〜3ランで揃うくらい
const RARITY_W = { N: 1, R: 0.6, SR: 0.3, SSR: 0.15 };
const RELICS = [
  { id: 'heal', icon: '❤️', name: '生命のアンク', desc: '❤を1つ回復（最大5）', apply: r => { r.hearts = Math.min(T_MAX_HEARTS, r.hearts + 1); } },
  { id: 'shield', icon: '🛡️', name: '守護のお守り', desc: '次のミスを1回だけ無効化', apply: r => { r.shield++; } },
  { id: 'loupe', icon: '🔍', name: '考古学者のルーペ', desc: '4択の誤答を1つ消す' },
  { id: 'survey', icon: '📐', name: '測量士の縄', desc: '数値問題の許容誤差 1.5倍' },
  { id: 'scarab', icon: '🪲', name: '黄金のスカラベ', desc: 'このランのコイン 2倍' },
  { id: 'gale', icon: '⚡', name: '疾風のサンダル', desc: '速答ボーナス 2倍' },
  { id: 'robber', icon: '🗝️', name: '墓荒らしの鍵', desc: '証拠カードのドロップ率 +20%' },
  { id: 'passion', icon: '🔥', name: '情熱の炎', desc: '★★★ の倍率 2.5 → 4' },
  { id: 'eye', icon: '👁️', name: 'ホルスの目', desc: '○✕問題の得点 2倍' },
];
const hasRelic = id => TR && TR.relics.some(r => r.id === id);
// 本日の特殊ルール（毎日変わる彩り）
const DAILY_RULES = [
  { id: 'conf3', text: '💎 確信の日：★★★ の倍率 +1' },
  { id: 'drop', text: '🃏 発掘の日：証拠ドロップ率 +15%' },
  { id: 'relic', text: '🏺 遺物の日：最初から遺物を1つ所持' },
  { id: 'heart', text: '❤️ 加護の日：❤+1 でスタート' },
  { id: 'speed', text: '⚡ 疾風の日：速答ボーナス 2倍' },
];
const todayRule = () => DAILY_RULES[Math.floor(seeded(dayStr())() * DAILY_RULES.length)];
const ruleIs = id => todayRule().id === id;

// ---------- 保存データ ----------
function tst(id) {
  S.themes = S.themes || {};
  return S.themes[id] || (S.themes[id] = { stars: [], cards: {}, finale: false, seen: [] });
}
const tsrs = () => S.tsrs || (S.tsrs = {});
// 問題キー → 問題 の索引（キーは data.js の qKey。内容から作るので並べ替えに強い）
let QIDX = null;
function lookupQ(key) {
  if (!QIDX) {
    QIDX = new Map();
    THEMES.forEach(t => t.chapters.forEach((c, ci) => c.questions.forEach((q, qi) => { const k = qKey(t, ci, qi); if (!QIDX.has(k)) QIDX.set(k, { key: k, t, ci, qi, q }); })));
  }
  return QIDX.get(key) || null;
}
function dueKeys() {
  const now = Date.now();
  return Object.entries(tsrs()).filter(([k, v]) => v.due <= now && lookupQ(k)).sort((a, b) => a[1].b - b[1].b).map(([k]) => k);
}
function srsUpdate(key, ok, conf) {
  const s = tsrs(), cur = s[key] || { b: 0 };
  if (ok) { cur.b = Math.min(SRS_DAYS.length - 1, (cur.b || 0) + 1); cur.nem = false; }
  else { cur.b = 0; if (conf === 3) cur.nem = true; }
  // 少し早めに「解けかけ」にして毎日の封印解除を作る
  cur.due = Date.now() + SRS_DAYS[cur.b] * 864e5 - (cur.b ? 4 * 3600e3 : 0);
  s[key] = cur;
}
const totalFacts = t => t.chapters.reduce((s, c) => s + c.facts.length, 0);
const ownedFacts = t => Object.keys(tst(t.id).cards).length;
function progressOf(t) {
  const st = tst(t.id), maxStars = t.chapters.length * 3;
  const stars = t.chapters.reduce((s, _, i) => s + (st.stars[i] || 0), 0);
  return Math.round(stars / maxStars * 60 + ownedFacts(t) / totalFacts(t) * 30 + (st.finale ? 10 : 0));
}
const chapterOpen = (t, ci) => ci === 0 || (tst(t.id).stars[ci - 1] || 0) > 0;
const allCleared = t => t.chapters.every((_, i) => (tst(t.id).stars[i] || 0) > 0);

// ============================================================
//  ホーム用セクション
// ============================================================
function themeSection() {
  const due = dueKeys().length;
  const review = due ? `<button class="btn seal" data-act="treview" style="width:100%;margin-bottom:10px">🔓 記憶の封印が解けかけている：${due}枚
      <span class="sub">今復習すると長期記憶に定着する（約1分）</span></button>` : '';
  if (!THEMES.length) return review;
  return `${review}<div class="card"><h3><span>🗺️ 謎の探検</span><span class="ghost">${THEMES.length}テーマ</span></h3>
    <div class="rule">本日の特殊ルール　${todayRule().text}</div>
    <div class="themes">${THEMES.map(t => {
      const p = progressOf(t), st = tst(t.id), next = t.chapters.findIndex((_, i) => !(st.stars[i] > 0));
      return `<button class="theme" style="--c:${t.color}" data-act="theme:${t.id}">
        <div class="ti">${t.icon}</div>
        <div class="tb"><div class="tt">${esc(t.title)}</div><div class="ghost tl">${esc(t.tagline)}</div>
        <div class="bar"><i style="width:${p}%"></i></div>
        <div class="meta"><span>解明度 ${p}%</span><span>🃏${ownedFacts(t)}/${totalFacts(t)}</span>
        <span>${st.finale ? '🏆解明済' : next >= 0 ? `第${next + 1}章へ` : '🔮最終解明へ'}</span></div></div></button>`;
    }).join('')}</div>
    <div class="ghost" style="margin-top:8px">💡 新しいテーマは Claude に <b>「テーマ ○○」</b> と送ると、深く調査してここに追加されます</div></div>`;
}

// ============================================================
//  テーママップ
// ============================================================
function renderTheme(id) {
  const t = THEMES.find(x => x.id === id); if (!t) return renderHome();
  screen = 'tmap'; document.body.classList.remove('fever-bg');
  const st = tst(t.id), p = progressOf(t);
  const nodes = t.chapters.map((c, i) => {
    const open = chapterOpen(t, i), s = st.stars[i] || 0;
    const facts = c.facts.filter((_, fi) => st.cards[fKey(t, i, fi)]).length;
    const cur = open && !s;
    return `<button class="node ${open ? '' : 'locked'} ${cur ? 'cur' : ''} ${i % 2 ? 'r' : 'l'}" data-act="${open ? 'chap:' + i : 'tlocked'}">
      <div class="ni">${open ? c.icon : '🔒'}</div>
      <div class="nb"><div class="ghost">第${i + 1}章</div><div class="nt">${open ? esc(c.title) : '？？？'}</div>
      <div class="st">${'★'.repeat(s)}<span>${'★'.repeat(3 - s)}</span> <small>🃏${facts}/${c.facts.length}</small></div></div></button>`;
  }).join('<div class="path"></div>');
  const fin = allCleared(t);
  app.innerHTML = `<div class="title"><button class="back" data-act="home">←</button><h2>${t.icon} ${esc(t.title)}</h2><div class="pill">🪙 ${S.coins}</div></div>
    <div class="mystery" style="--c:${t.color}"><div class="ghost">中心の謎</div><div class="mq">❓ ${esc(t.mystery)}</div>
      <div class="bar"><i style="width:${p}%"></i></div><div class="ghost" style="margin-top:4px">解明度 ${p}%</div></div>
    <button class="btn tower-btn" style="width:100%;margin-bottom:12px" data-act="rgentry:${t.id}">⚔️ ローグライク「知の塔」に挑む
      <span class="sub">${S.rgRun && S.rgRun.tid === t.id ? `挑戦中：${S.rgRun.at ? S.rgRun.at.f + 1 : 0}階` : (() => { const ms = Object.entries(S.rgMeta || {}).filter(([k]) => k === t.id || k.startsWith(t.id + ':')).map(([, v]) => v);
        const dn = (t.rogue && t.rogue.dungeons || []).length;
        return ms.some(v => v.runs) ? `最高 ${Math.max(...ms.map(v => v.best))}階 ・ 踏破 ${ms.reduce((a, v) => a + v.wins, 0)}回` : dn ? `${dn}つの塔でデッキを組んで登る` : 'デッキを組んで塔を登る。全問題から出題'; })()}</span></button>
    ${st.seen.length ? '' : `<div class="card intro">${esc(t.intro)}</div>`}
    <div class="map">${nodes}<div class="path"></div>
      <button class="node final ${fin ? 'cur' : 'locked'}" data-act="${fin ? 'finale' : 'tlocked'}">
        <div class="ni">${fin ? '🔮' : '🔒'}</div><div class="nb"><div class="ghost">最終章</div><div class="nt">${fin ? esc(t.finale.title) : '全章クリアで解放'}</div>
        <div class="st">${st.finale ? '🏆 解明済み' : ''}</div></div></button></div>
    <div class="row" style="margin-top:12px"><button class="btn" data-act="evidence">🃏 証拠ファイル<span class="sub">${ownedFacts(t)}/${totalFacts(t)}枚</span></button>
      <button class="btn" data-act="sources">📚 出典<span class="sub">${t.sources.length}件</span></button></div>`;
  TT = t;
}
let TT = null; // 表示中のテーマ

function renderEvidence() {
  const t = TT, st = tst(t.id);
  screen = 'tev';
  app.innerHTML = `<div class="title"><button class="back" data-act="theme:${t.id}">←</button><h2>🃏 証拠ファイル</h2><div class="pill">${ownedFacts(t)}/${totalFacts(t)}</div></div>
    ${t.chapters.map((c, ci) => `<div class="card"><h3><span>${c.icon} 第${ci + 1}章 ${esc(c.title)}</span></h3>
      <div class="facts">${c.facts.map((f, fi) => st.cards[fKey(t, ci, fi)]
        ? `<button class="fact ${f.rarity}" data-act="fact:${ci}-${fi}"><span class="rar ${f.rarity}">${f.rarity}</span><div>${esc(f.text)}</div></button>`
        : `<div class="fact unk"><span class="rar ${f.rarity}">${f.rarity}</span><div>？？？</div></div>`).join('')}</div></div>`).join('')}`;
}
function factModal(t, ci, fi, isNew) {
  const f = t.chapters[ci].facts[fi];
  return modal(`${isNew ? '<div class="ghost">🃏 新しい証拠を発見！</div>' : ''}<span class="rar ${f.rarity}">${f.rarity}</span>
    <h2 style="font-size:19px;line-height:1.5">${esc(f.text)}</h2><p style="text-align:left;line-height:1.7">${esc(f.detail)}</p>
    <button class="btn primary" style="width:100%" data-act="close">OK</button>`, 'glow-' + f.rarity);
}

// ============================================================
//  章の開始：事前予想 → ストーリー → ラン
// ============================================================
function startChapter(ci) {
  const t = TT, st = tst(t.id), c = t.chapters[ci];
  if (!st.seen.includes(ci)) {
    // 本文を読む前に「予想」させる（外れてもOK・生成効果）
    const qi = Math.max(0, c.questions.findIndex(q => q.type === 'number' || q.type === 'tf'));
    TR = newRun(t, ci, [{ key: qKey(t, ci, qi), q: c.questions[qi], ci, qi }], { pre: true });
    return renderQ();
  }
  beginRun(ci);
}
function renderStory(ci) {
  const t = TT, c = t.chapters[ci], st = tst(t.id);
  if (!st.seen.includes(ci)) { st.seen.push(ci); save(); }
  screen = 'tstory';
  app.innerHTML = `<div class="story" style="--c:${t.color}">
    <div class="ghost">${t.icon} ${esc(t.title)} ・ 第${ci + 1}章</div>
    <div class="si">${c.icon}</div><h2>${esc(c.title)}</h2>
    <p>${esc(c.story)}</p>
    <div class="ghost" style="margin:14px 0">この章で集められる証拠：${c.facts.length}枚 ・ 問題 ${Math.min(RUN_LEN, c.questions.length)}問</div>
    <button class="btn primary big" style="width:100%" data-act="run:${ci}">⛏️ 探検開始<span class="sub">Enter</span></button></div>`;
}
function beginRun(ci) {
  const t = TT, c = t.chapters[ci];
  let qs = shuffle(c.questions.map((q, qi) => ({ key: qKey(t, ci, qi), q: maybeHilo(q), ci, qi }))).slice(0, RUN_LEN);
  // 前の章で間違えた問題を「リベンジ」として最大2問混ぜる（交互練習）
  const rev = dueKeys().map(lookupQ).filter(x => x && x.t === t && x.ci !== ci).slice(0, 2);
  rev.forEach(x => qs.splice(2 + rand(qs.length - 2), 0, { ...x, revenge: true }));
  TR = newRun(t, ci, qs, {});
  renderQ();
}
function startReview() {
  const keys = dueKeys().slice(0, REVIEW_LEN);
  if (!keys.length) return toast('今は封印が安定している！');
  TT = null;
  TR = newRun(null, -1, shuffle(keys.map(lookupQ).map(x => ({ ...x, revenge: true }))), { review: true });
  renderQ();
}
function newRun(t, ci, qs, opt) {
  const r = {
    t, ci, qs, i: 0, hearts: T_HEARTS, combo: 0, maxCombo: 0, score: 0, correct: 0, wrong: 0, near: 0,
    conf: 2, relics: [], shield: 0, drops: [], dropMiss: 0, relicOffered: 0, lock: false, answered: 0,
    pre: !!opt.pre, review: !!opt.review, nemesisAdded: {}, timer: null, missStreak: 0,
  };
  if (!r.pre) {
    if (ruleIs('heart')) r.hearts++;
    if (ruleIs('relic')) { const x = RELICS[rand(RELICS.length)]; r.relics.push(x); if (x.apply) x.apply(r); }
  }
  return r;
}
let TR = null;

// ============================================================
//  出題
// ============================================================
function renderQ() {
  screen = 'trun';
  const it = TR.qs[TR.i], q = it.q, total = TR.qs.length;
  const confs = TR.pre ? '' : `<div class="confs">${[1, 2, 3].map(n => `<button class="conf ${TR.conf === n ? 'on' : ''} c${n}" data-act="conf:${n}">${CONF[n].star}<small>${CONF[n].label}</small></button>`).join('')}
    <div class="cdesc" id="cdesc">${confDesc()}</div></div>`;
  const tag = TR.pre ? '<div class="lucky">🤔 予想してみよう！ ハズレてもOK</div>'
    : it.nemesis ? '<div class="revtag">👹 宿敵（確信して外した問題）</div>'
      : it.revenge ? '<div class="revtag">🔁 リベンジ</div>' : '';
  app.innerHTML = `<div id="trun" class="${TR.combo >= 5 ? 'fever' : ''}">
    <div class="play-top"><button class="quit" data-act="tquit">✕</button>
      <div class="hearts">${TR.pre ? '' : '❤️'.repeat(Math.max(0, TR.hearts)) + (TR.shield ? '🛡️'.repeat(TR.shield) : '')}</div>
      <div class="dots">${TR.pre ? '' : `${TR.i + 1}/${total}`}</div></div>
    ${TR.pre ? '' : `<div class="scoreline"><div class="score" id="sc">${TR.score.toLocaleString()}</div>
      <div class="combo" id="cb">${TR.combo >= 2 ? `${TR.combo} COMBO<small>×${tMult(TR.combo).toFixed(1)}</small>` : ''}</div></div>
      <div class="relicbar">${TR.relics.map(r => `<span title="${esc(r.name)}：${esc(r.desc)}">${r.icon}</span>`).join('')}
        <em>${dropGauge()}</em></div>`}
    <div class="qbox tq" id="qb">${tag}<div class="ask">${TYPE_LABEL[q.type]}</div><div class="q ${q.q.length > 28 ? 'long' : ''}">${qText(q)}</div>
      <div class="qtimer"><i id="qt"></i></div></div>
    ${confs}
    <div id="ans"></div>
    <div id="fb"></div></div>`;
  TR.qStart = performance.now(); TR.lock = false;
  TR.qw = quizWidget($('#ans'), q, {
    loupe: hasRelic('loupe') || TR.missStreak >= 3, tolMult: hasRelic('survey') ? 1.5 : 1,
    onDone: res => resolve((q.type === 'tf' || q.type === 'hilo') && hasRelic('eye') ? { ...res, mult: 2 } : res),
  });
  const qt = $('#qt'); if (qt) { qt.style.transition = 'none'; qt.style.width = '100%'; void qt.offsetWidth; qt.style.transition = `width ${speedSec(q)}s linear`; qt.style.width = '0%'; }
}
// 目の前に吊られたごほうび：次の証拠確定までの距離を常に見せる
function dropGauge() {
  if (TR.review) return '';
  const t = TR.t, st = tst(t.id), left = t.chapters[TR.ci].facts.filter((_, fi) => !st.cards[fKey(t, TR.ci, fi)]).length;
  if (!left) return '🃏 この章の証拠はコンプリート！';
  const n = DROP_PITY + 1 - TR.dropMiss;
  return `🃏 証拠確定まで あと${n}正解 ・ 残り${left}枚`;
}
const speedSec = q => ['number', 'order', 'match', 'multi'].includes(q.type) ? 12 : 6;
const tMult = c => Math.min(3, 1 + [0, 0.2, 0.5, 1, 2][Math.min(4, Math.floor(c / 3))]);
const confMult = n => (n === 3 && hasRelic('passion') ? 4 : CONF[n].mult) + (n === 3 && ruleIs('conf3') ? 1 : 0);
const confDesc = () => { const c = CONF[TR.conf]; return `${c.label}：×${confMult(TR.conf)}${c.desc ? ' ・ ' + c.desc.replace('2.5倍', `${confMult(3)}倍`) : ''}`; };

// ---------- 判定 ----------
function resolve(res) {
  TR.lock = true; clearTimeout(TR.timer);
  const it = TR.qs[TR.i], q = it.q, conf = TR.pre ? 2 : TR.conf, C = CONF[conf];
  const dt = (performance.now() - TR.qStart) / 1000, speed = dt < speedSec(q) * 0.5;
  const qb = $('#qb'), rc = qb.getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2;
  $('#qt') && ($('#qt').style.transition = 'none');
  let label, pts = 0, cls;

  if (TR.pre) {
    label = res.ok ? '🎉 予想的中！' : res.near ? '👀 いい線いってる！' : '🤔 予想とちがった！';
    cls = res.ok ? 'good' : 'near';
    if (res.ok) sfx.ok(3); else tone(440, .15, 'triangle', .08);
  } else if (res.ok) {
    TR.combo++; TR.correct++; TR.maxCombo = Math.max(TR.maxCombo, TR.combo); TR.missStreak = 0;
    const sp = 0.3 * (hasRelic('gale') ? 2 : 1) * (ruleIs('speed') ? 2 : 1);
    pts = Math.round(100 * tMult(TR.combo) * confMult(conf) * (res.mult || 1) * (speed ? 1 + sp : 1));
    TR.score += pts;
    label = (it.nemesis ? '👹 宿敵撃破！ ' : it.revenge ? '🔁 リベンジ成功！ ' : '') + (conf === 3 ? '💎 確信的中！' : '⭕ 正解！');
    cls = 'good';
    srsUpdate(it.key, true, conf);
    if (it.nemesis) { TR.score += 200; pts += 200; }
  } else if (res.near) {
    TR.combo = 0; TR.near++;
    pts = Math.round(50 * C.mult); TR.score += pts;
    label = '😣 ' + (res.msg || '惜しい！'); cls = 'near'; res.msg = '';
    srsUpdate(it.key, false, 1);
  } else {
    TR.wrong++; TR.missStreak++;
    if (TR.missStreak === 3) setTimeout(() => toast('🤝 救済：次の4択は誤答が1つ消える'), 400);
    if (TR.shield) { TR.shield--; label = '🛡️ お守りが守った！'; cls = 'near'; }
    else { TR.hearts -= C.loss; label = conf === 3 ? '💥 確信していたのに…！' : '❌ ざんねん'; cls = 'bad'; }
    if (!C.keepCombo) TR.combo = 0;
    srsUpdate(it.key, false, conf);
    // 確信して外した問題は「宿敵」として同じラン内で再出題
    if (conf === 3 && !TR.nemesisAdded[it.key] && !TR.review) {
      TR.nemesisAdded[it.key] = true;
      TR.qs.splice(Math.min(TR.qs.length, TR.i + 3), 0, { ...it, nemesis: true, revenge: false });
    }
  }

  // ヒットストップ → 演出
  setTimeout(() => {
    if (res.ok || TR.pre && res.near) {
      qb.classList.add('punch'); burst(cx, cy, conf === 3 ? 30 : 14);
      if (!TR.pre) { sfx.ok(TR.combo); floatText(`+${pts}${speed ? ' ⚡' : ''}`, cx, rc.top, conf === 3 ? '#ffcc33' : '#2ee59d', conf === 3 ? 30 : 24); }
      if (conf === 3 && !TR.pre) { document.body.classList.add('flash'); setTimeout(() => document.body.classList.remove('flash'), 150); }
    } else if (res.near) { tone(330, .15, 'triangle', .08); floatText(`+${pts}`, cx, rc.top, '#ffcc33'); }
    else if (!TR.pre) { qb.classList.add('shake'); sfx.ng(); if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(conf === 3 ? [60, 40, 120] : 80); }
    const drop = res.ok && !TR.pre ? rollDrop(conf) : null;
    showFeedback(q, label, cls, res.msg, drop);
  }, HITSTOP_MS * (res.ok && (conf === 3 || TR.combo % 5 === 0) ? 1.6 : 1));
}
function showFeedback(q, label, cls, msg, drop) {
  const fb = $('#fb'); if (!fb) return;
  const ok = cls === 'good';
  fb.innerHTML = `<div class="feedback ${cls}">
    <div class="fl">${label}</div>${msg ? `<div class="fm">${esc(msg)}</div>` : ''}
    ${ok && q.type !== 'order' ? '' : `<div class="fa">正解：<b>${esc(correctText(q))}</b></div>`}
    <div class="fe">${esc(q.explain || '')}</div>
    ${drop ? `<div class="drop ${drop.f.rarity}">🃏 証拠カード発見！ <span class="rar ${drop.f.rarity}">${drop.f.rarity}</span></div>` : ''}
    <button class="btn ${ok ? '' : 'primary'}" style="width:100%;margin-top:10px" data-act="tnext">次へ ▶<span class="sub">Enter</span></button>
    ${ok ? '<div class="autobar"><i></i></div>' : ''}</div>`;
  const hs = $('.hearts'); if (hs) hs.innerHTML = '❤️'.repeat(Math.max(0, TR.hearts)) + (TR.shield ? '🛡️'.repeat(TR.shield) : '');
  const sc = $('#sc'); if (sc) sc.textContent = TR.score.toLocaleString();
  const cb = $('#cb'); if (cb) cb.innerHTML = TR.combo >= 2 ? `${TR.combo} COMBO<small>×${tMult(TR.combo).toFixed(1)}</small>` : '';
  if (drop) setTimeout(() => { sfx.gacha(drop.f.rarity); }, 150);
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  // 正解時はテンポ優先で自動送り（読みたければ止まる：ボタン長押し不要、タップで即送り）
  if (ok) TR.timer = setTimeout(nextStep, AUTO_NEXT_MS + (drop ? 600 : 0));
}
function rollDrop(conf) {
  const t = TR.t || lookupQ(TR.qs[TR.i].key).t, st = tst(t.id);
  const ci = TR.ci >= 0 ? TR.ci : TR.qs[TR.i].ci;
  const pool = t.chapters[ci].facts.map((f, fi) => ({ f, fi, ci })).filter(x => !st.cards[fKey(t, x.ci, x.fi)])
    .filter(x => x.f.rarity !== 'SSR' || TR.combo >= 4 || conf === 3);
  if (!pool.length) return null;
  const p = DROP_BASE + (hasRelic('robber') ? 0.2 : 0) + (conf === 3 ? 0.15 : 0) + (ruleIs('drop') ? 0.15 : 0);
  if (Math.random() >= p && TR.dropMiss < DROP_PITY) { TR.dropMiss++; return null; }
  TR.dropMiss = 0;
  const tot = pool.reduce((s, x) => s + RARITY_W[x.f.rarity], 0);
  let r = Math.random() * tot;
  const pick = pool.find(x => (r -= RARITY_W[x.f.rarity]) <= 0) || pool[0];
  st.cards[fKey(t, pick.ci, pick.fi)] = 1; save();
  const d = { t, ...pick }; TR.drops.push(d); return d;
}
function nextStep() {
  if (!TR) return;
  clearTimeout(TR.timer);
  if (TR.pre) { const ci = TR.ci; TR = null; return renderStory(ci); }
  TR.i++; if (!TR.pre) TR.answered++;
  TR.conf = 2; // ★★★ は毎問「ここぞ」で賭けるもの
  if (TR.hearts <= 0) return endRun(false);
  if (TR.i >= TR.qs.length) return endRun(true);
  if (!TR.review && TR.relicOffered < RELIC_AT.length && TR.answered === RELIC_AT[TR.relicOffered]) { TR.relicOffered++; return renderRelic(); }
  renderQ();
}

// ---------- 遺物（3択ビルド） ----------
function renderRelic() {
  screen = 'trelic';
  const opts = shuffle(RELICS.filter(r => !TR.relics.some(x => x.id === r.id) || r.id === 'heal' || r.id === 'shield')).slice(0, 3);
  TR.relicOpts = opts;
  app.innerHTML = `<div class="relic-head"><div class="bigemoji" style="font-size:60px">🏺</div><h2>遺物を発見！</h2><p class="ghost">1つ選んでこの探検を有利に進めよう</p></div>
    <div class="relics">${opts.map((r, i) => `<button class="relic" data-act="relic:${i}"><div class="ri">${r.icon}</div><div><b>${esc(r.name)}</b><div class="ghost">${esc(r.desc)}</div></div><span class="k">${i + 1}</span></button>`).join('')}</div>`;
  sfx.coin();
}
function pickRelic(i) {
  const r = TR.relicOpts[i]; if (!r) return;
  TR.relics.push(r); if (r.apply) r.apply(TR);
  sfx.fever(); toast(`${r.icon} ${r.name} を手に入れた！`);
  renderQ();
}

// ============================================================
//  ラン終了
// ============================================================
function endRun(cleared) {
  const r = TR, t = r.t, total = r.correct + r.wrong + r.near;
  let stars = 0, extra = 0;
  if (cleared && !r.review) {
    stars = 1 + (r.correct / Math.max(1, total) >= 0.8 ? 1 : 0) + (r.wrong === 0 && r.near === 0 ? 1 : 0);
    const st = tst(t.id); st.stars[r.ci] = Math.max(st.stars[r.ci] || 0, stars);
    // クリア時は最低1枚保証、★3ならSSR優先
    const left = t.chapters[r.ci].facts.map((f, fi) => ({ f, fi, ci: r.ci })).filter(x => !st.cards[fKey(t, x.ci, x.fi)]);
    if (left.length && (!r.drops.length || stars === 3)) {
      const pick = stars === 3 ? left.sort((a, b) => RARITY_W[a.f.rarity] - RARITY_W[b.f.rarity])[0] : left[rand(left.length)];
      st.cards[fKey(t, pick.ci, pick.fi)] = 1; r.drops.push({ t, ...pick, bonus: true });
    }
    extra = 30 * stars;
  }
  if (r.review && cleared) extra = 40;
  if (hasRelic('scarab')) extra = extra * 2 + Math.floor(r.score / 150);
  const rw = applyRewards({ id: r.review ? 'review' : 'theme:' + t.id, score: r.score, correct: r.correct, wrong: r.wrong + r.near, maxCombo: r.maxCombo, extraCoins: extra, xpMult: 1.3 });
  screen = 'tresult';
  const c = t && r.ci >= 0 ? t.chapters[r.ci] : null, nextCi = c && r.ci + 1 < t.chapters.length ? r.ci + 1 : -1;
  const left = r.qs.length - r.i;
  const head = r.review ? `<div class="lab">🔓 記憶の封印</div><h2 style="margin:4px 0">${cleared ? '封印を修復した！' : '封印が破られた…'}</h2>`
    : cleared ? `<div class="lab">${t.icon} 第${r.ci + 1}章</div><h2 style="margin:4px 0">${esc(c.title)} クリア！</h2>
      <div class="stars">${[0, 1, 2].map(k => `<span class="s ${k < stars ? 'on' : ''}" style="animation-delay:${.4 + k * .35}s">★</span>`).join('')}</div>`
      : `<div class="lab">${t.icon} 第${r.ci + 1}章</div><h2 style="margin:4px 0">探検失敗…</h2>
      <div class="near">${left <= 3 ? `あと${left}問でクリアだった！` : '遺物と確信度を使いこなそう'}</div>`;
  const starHint = cleared && !r.review && stars < 3 ? `<div class="ghost" style="text-align:center;margin-bottom:8px">${stars === 1 ? '★2：正答率80%以上' : '★3：ノーミス（★3クリアでSSR証拠が出やすい）'}</div>` : '';
  const finReady = t && allCleared(t) && !tst(t.id).finale;
  const mainBtn = r.review ? `<button class="btn primary big" data-act="home">🏠 ホームへ</button>`
    : !cleared ? `<button class="btn primary big" data-act="chap:${r.ci}">🔁 再挑戦<span class="sub">Enter</span></button>`
      : finReady ? `<button class="btn primary big" data-act="finale">🔮 謎の答えを見る<span class="sub">Enter</span></button>`
        : nextCi >= 0 && chapterOpen(t, nextCi) ? `<button class="btn primary big" data-act="chap:${nextCi}">▶ 第${nextCi + 1}章へ<span class="sub">Enter</span></button>`
          : `<button class="btn primary big" data-act="chap:${r.ci}">🔁 ★3を狙う<span class="sub">Enter</span></button>`;
  app.innerHTML = `${hud()}<div class="res-head">${head}<div class="big" id="rs" style="font-size:44px">0</div></div>
    ${starHint}
    ${cleared && c ? `<div class="cliff">🔮 ${esc(c.cliffhanger)}</div>` : ''}
    <div class="row" style="margin-bottom:12px">${mainBtn}</div>
    ${r.drops.length ? `<div class="card"><h3><span>🃏 手に入れた証拠</span><span>${r.drops.length}枚</span></h3><div class="facts">${r.drops.map((d, k) =>
      `<button class="fact ${d.f.rarity} flip" style="animation-delay:${.8 + k * .25}s" data-act="factx:${d.t.id}:${d.ci}-${d.fi}"><span class="rar ${d.f.rarity}">${d.f.rarity}</span><div>${esc(d.f.text)}</div></button>`).join('')}</div>
      <div class="ghost" style="margin-top:6px">タップで詳しく読める</div></div>` : ''}
    ${rewardCard(rw)}
    ${missionDoneCard(rw.newlyDone)}
    ${S.daily && S.daily.plays >= 10 ? '<div class="card ghost">🧠 今日はたくさん学んだ！ 記憶は寝ている間に定着します。続きは明日がいちばん効果的。</div>' : ''}
    <div class="row">${t ? `<button class="btn" data-act="theme:${t.id}">🗺️ マップ</button>` : ''}<button class="btn" data-act="home">🏠 ホーム</button></div>`;
  countUp($('#rs'), r.score);
  if (cleared) { setTimeout(sfx.level, 300); [0, 1, 2].forEach(k => k < stars && setTimeout(() => { tone(880 + k * 220, .2, 'triangle', .12); burst(innerWidth / 2 + (k - 1) * 50, 130, 16); }, 400 + k * 350)); }
  else sfx.ng();
  animateXP(rw.oldLevel);
  TR = null;
}

// ============================================================
//  最終章：謎の答え
// ============================================================
function renderFinale() {
  const t = TT, st = tst(t.id), first = !st.finale;
  screen = 'tfinale';
  const lines = t.finale.text.split(/(?<=。)/).filter(s => s.trim());
  app.innerHTML = `<div class="finale" style="--c:${t.color}">
    <div class="ghost">${t.icon} ${esc(t.title)} ・ 最終章</div>
    <div class="mq">❓ ${esc(t.mystery)}</div>
    <h2>🔮 ${esc(t.finale.title)}</h2>
    <div class="lines">${lines.map((l, i) => `<p style="animation-delay:${1 + i * 1.1}s">${esc(l)}</p>`).join('')}</div>
    <div class="fin-end" style="animation-delay:${1.5 + lines.length * 1.1}s">
      ${first ? `<div class="newrec">🏆 謎を解明した！ +300🪙</div>` : ''}
      <button class="btn primary big" style="width:100%;margin-top:14px" data-act="theme:${t.id}">🗺️ マップへ戻る</button>
      <button class="btn" style="width:100%;margin-top:10px" data-act="sources">📚 出典を見る</button>
    </div></div>`;
  if (first) {
    st.finale = true; S.coins += 300; save();
    setTimeout(() => { sfx.level(); burst(innerWidth / 2, innerHeight / 2, 80); }, (1.5 + lines.length * 1.1) * 1000);
  }
}
function sourcesModal() {
  const t = TT;
  modal(`<h2>📚 出典</h2><div style="text-align:left;max-height:55vh;overflow:auto">${t.sources.map(s =>
    `<div class="miss"><a href="${esc(s.url)}" target="_blank" rel="noopener" style="color:var(--xp)">${esc(s.title)}</a></div>`).join('')}</div>
    <button class="btn primary" style="width:100%;margin-top:12px" data-act="close">閉じる</button>`);
}

// ============================================================
//  入力（game.js の onAct / keydown から呼ばれる）
// ============================================================
function themeAct(act, arg, b) {
  switch (act) {
    case 'theme': renderTheme(arg); return true;
    case 'chap': if (!TT) return true; TR = null; startChapter(+arg); return true;
    case 'run': beginRun(+arg); return true;
    case 'tlocked': toast('前の章をクリアすると解放！'); return true;
    case 'treview': startReview(); return true;
    case 'tquit': if (TR) clearTimeout(TR.timer); TR = null; TT ? renderTheme(TT.id) : renderHome(); return true;
    case 'conf': if (TR && !TR.lock) { TR.conf = +arg; $$('.conf').forEach((x, i) => x.classList.toggle('on', i + 1 === TR.conf)); $('#cdesc').textContent = confDesc(); tone(500 + TR.conf * 150, .05, 'square', .04); } return true;
    case 'tnext': if (TR && TR.lock) nextStep(); return true;
    case 'relic': pickRelic(+arg); return true;
    case 'finale': renderFinale(); return true;
    case 'evidence': renderEvidence(); return true;
    case 'sources': sourcesModal(); return true;
    case 'fact': { const [ci, fi] = arg.split('-').map(Number); factModal(TT, ci, fi); return true; }
    case 'factx': { const [tid, cf] = [arg, b.dataset.act.split(':')[2]]; const [ci, fi] = cf.split('-').map(Number); factModal(THEMES.find(x => x.id === tid), ci, fi, true); return true; }
  }
  return false;
}
function themeKey(e) {
  const k = e.key;
  if (screen === 'trun' && TR) {
    if (TR.lock) { if (k === 'Enter' || k === ' ') { e.preventDefault(); nextStep(); } return; }
    if (TR.qw && TR.qw.key(e)) e.preventDefault();
    else if (!TR.pre && /^[qwe]$/i.test(k)) themeAct('conf', String('qwe'.indexOf(k.toLowerCase()) + 1));
  } else if (screen === 'trelic' && /^[1-3]$/.test(k)) pickRelic(+k - 1);
  else if ((screen === 'tstory' || screen === 'tresult') && k === 'Enter') { const p = $('.btn.primary.big'); if (p) p.click(); }
}

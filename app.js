'use strict';
// ============================================================
//  画面の骨組み（iPhone 向け）
//  ・下部タブ：🏰塔（メイン）／🗺️探検／🎰ガチャ／📋その他
//  ・各タブは1画面に収まるレイアウト
//  ・引き継ぎ（コード・ファイル）と自動バックアップからの復元
// ============================================================

const TABS = [
  { id: 'tower', e: '🏰', n: '塔' },
  { id: 'explore', e: '🗺️', n: '探検' },
  { id: 'gacha', e: '🎰', n: 'ガチャ' },
  { id: 'more', e: '📋', n: 'その他' },
];
// どの画面でどのタブを光らせるか（ここに無い画面ではタブを隠す＝戦闘やクイズに集中）
const TAB_OF = { 'rg-entry': 'tower', explore: 'explore', tmap: 'explore', tev: 'explore', gacha: 'gacha', dex: 'gacha', more: 'more' };
const tabbar = document.getElementById('tabbar');

function tabBadge(id) {
  if (id === 'gacha' && S.coins >= Math.min(GACHA_COST, typeof roleCost === 'function' ? roleCost() : GACHA_COST)) return '<i class="dot"></i>';
  if (id === 'more' && S.daily && S.daily.list.some(m => !m.claimed && m.prog >= m.goal)) return '<i class="dot"></i>';
  if (id === 'explore' && typeof dueKeys === 'function') { const n = dueKeys().length; if (n) return `<i class="num">${n > 99 ? '99+' : n}</i>`; }
  return '';
}
// 画面ごとの世界観（design.css が body[data-zone] で背景や部品の見た目を切り替える）
const zoneOf = sc => sc.startsWith('rg') ? 'tower' : /^(explore|tmap|tev|tstory|trun|tresult|tfinale|trelic)$/.test(sc) ? 'explore' : /^(gacha|dex)$/.test(sc) ? 'gacha' : 'more';
function drawTabbar() {
  document.body.dataset.zone = zoneOf(screen);
  const cur = TAB_OF[screen];
  document.body.classList.toggle('has-tabs', !!cur);
  tabbar.hidden = !cur;
  if (cur) tabbar.innerHTML = TABS.map(x => `<button class="${x.id === cur ? 'on' : ''}" data-tab="${x.id}"><span>${x.e}</span><small>${x.n}</small>${tabBadge(x.id)}</button>`).join('');
}
new MutationObserver(drawTabbar).observe(app, { childList: true });
tabbar.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { tone(520, .05, 'triangle', .06); goTab(b.dataset.tab); } });

function goTab(id) {
  if (!TABS.some(t => t.id === id)) id = 'tower';
  S.tab = id; save();
  ({ tower: () => rogueEntry(S.towerTid), explore: renderExplore, gacha: renderGacha, more: renderMore })[id]();
  app.scrollTop = 0; window.scrollTo(0, 0);
}

// ---------- 🗺️ 探検 ----------
function renderExplore() {
  screen = 'explore'; ensureDaily(); document.body.classList.remove('fever-bg');
  app.innerHTML = `${hud()}${themeSection()}`;
}

// ---------- 📋 その他（ミッション・基礎トレ・図鑑・設定） ----------
function renderMore() {
  screen = 'more'; ensureDaily(); document.body.classList.remove('fever-bg');
  const st = curStreak(), playedToday = S.lastPlay === dayStr();
  const warn = playedToday ? '' : `<div class="warn">${st > 0 ? `⚠️ 今日プレイしないと 🔥${st}日連続 が途切れる！` : '🔥 今日の1プレイで連続記録スタート！'}</div>`;
  const D = S.daily, allDone = D.list.every(m => m.claimed);
  const missions = D.list.map((m, i) => {
    const done = m.prog >= m.goal, pct = Math.min(100, m.prog / m.goal * 100);
    const right = m.claimed ? `<span class="done">✓</span>`
      : done ? `<button class="claim" data-act="claim:${i}">🪙${m.reward}</button>` : `<span class="ghost">🪙${m.reward}</span>`;
    return `<div class="mission"><div class="mt">${esc(missionText(m))} <span class="ghost">${Math.min(m.prog, m.goal).toLocaleString()}/${m.goal.toLocaleString()}</span>
      <div class="bar"><i style="width:${pct}%"></i></div></div>${right}</div>`;
  }).join('');
  const chest = D.chest ? '' : allDone ? `<button class="btn primary wide" data-act="chest">🎁 全達成ボーナス 200🪙</button>` : '';
  const decks = DECKS.map(d => {
    const locked = S.level < d.unlock, ds = deckStat(d), best = S.best[d.id] || 0;
    return `<button class="mdeck ${locked ? 'locked' : ''}" style="--c:${d.color}" data-act="${locked ? 'locked:' + d.unlock : 'play:' + d.id}">
      <span>${locked ? '🔒' : d.icon}</span><b>${esc(d.name)}</b><small>${locked ? `Lv.${d.unlock}` : ds ? `習得${Math.round(ds.mastery * 100)}%` : `🏆${best}`}</small>${!locked && ds && ds.wrong ? `<i class="dot"></i>` : ''}</button>`;
  }).join('');
  app.innerHTML = `${hud()}${warn}
    <div class="card"><h3><span>📋 今日のミッション</span><span class="ghost">${D.chest ? '🎉 制覇！' : '全部で🎁'}</span></h3>${missions}${chest}</div>
    <div class="card"><h3><span>⚡ 基礎トレ（1分タイムアタック）</span></h3><div class="mdecks">${decks}</div></div>
    <div class="mgrid">
      <button class="btn" data-act="dex">📖 図鑑<span class="sub">${Object.keys(S.mon).length}/${CREATURES.length}</span></button>
      <button class="btn" data-act="backup">💾 保存<span class="sub">引き継ぎ</span></button>
      <button class="btn" data-act="sound">${S.sound ? '🔊' : '🔇'} 音<span class="sub">${S.sound ? 'ON' : 'OFF'}</span></button>
      ${location.protocol === 'https:' ? `<button class="btn" data-act="share">📲 友達に<span class="sub">送る</span></button>` : `<button class="btn" data-act="reset">🗑️ 初期化<span class="sub">全消去</span></button>`}
    </div>
    <div class="foot">通算 ${S.stats.plays}プレイ ・ ${S.stats.correct}問正解 ・ 最大${S.stats.maxCombo}コンボ${location.protocol === 'https:' ? ' ・ <button data-act="reset">データ初期化</button>' : ''}</div>`;
}

// ---------- 💾 引き継ぎ・バックアップ ----------
// 引き継ぎコード：NR2:（gzip圧縮）/ NR1:（無圧縮）+ base64
async function exportCode() {
  let bytes = new TextEncoder().encode(JSON.stringify(S)), tag = 'NR1';
  if (window.CompressionStream) {
    try { bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()); tag = 'NR2'; } catch (e) { }
  }
  let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return `${tag}:${btoa(bin)}`;
}
async function importCode(text) {
  text = text.trim();
  if (text.startsWith('{')) return parseSave(text);
  const i = text.indexOf(':'), tag = text.slice(0, i), b64 = text.slice(i + 1).replace(/\s/g, '');
  if (tag !== 'NR1' && tag !== 'NR2') throw new Error('引き継ぎコードの形式が違います');
  let bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  if (tag === 'NR2') bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  return parseSave(new TextDecoder().decode(bytes));
}
function restoreFrom(data, label) {
  if (!confirm(`${label}で復元します。今のデータは自動で控えを取ってから置き換えます。よろしいですか？`)) return;
  try { localStorage.setItem(`${BAK}before-restore-${Date.now()}`, JSON.stringify(S)); } catch (e) { }
  S = data; RG = null; CB = null; save();
  document.querySelectorAll('.modal').forEach(m => m.remove());
  toast('✅ 復元しました'); sfx.level(); goTab('tower');
}
function backupModal() {
  const list = backups().slice(0, 8).map(k => {
    const name = k.slice(BAK.length), lbl = /^\d{4}-/.test(name) ? `${name} の自動バックアップ` : name.startsWith('pre-v') ? 'アップデート前の控え' : name.startsWith('before-restore') ? '復元前の控え' : name;
    let info = ''; try { const s = JSON.parse(localStorage.getItem(k)); info = `Lv.${s.level} ・ 🪙${s.coins}`; } catch (e) { }
    return `<div class="bk"><div><b>${esc(lbl)}</b><div class="ghost">${info}</div></div><button class="btn" data-act="bkrestore:${esc(k)}">戻す</button></div>`;
  }).join('');
  modal(`<h2>💾 引き継ぎ・バックアップ</h2>
    <p class="ghost" style="text-align:left">データはこの端末の中に保存されています。機種変更や別の端末で続けるときは、引き継ぎコードかファイルを使ってください。</p>
    <div class="mgrid two"><button class="btn primary" data-act="bkcopy">📋 コードをコピー</button><button class="btn" data-act="bkfile">💾 ファイルに保存</button></div>
    <h3 style="margin:14px 0 6px">📥 復元する</h3>
    <textarea id="bkcode" rows="3" placeholder="引き継ぎコード（NR2:…）を貼り付け"></textarea>
    <div class="mgrid two"><button class="btn" data-act="bkpaste">コードで復元</button><label class="btn">ファイルから<input type="file" id="bkfilein" accept=".txt,.json,text/plain,application/json" hidden></label></div>
    ${list ? `<h3 style="margin:14px 0 6px">🕘 自動バックアップ（最新${BAK_KEEP}日分）</h3><div class="bklist">${list}</div>` : ''}
    <button class="btn wide" style="margin-top:12px" data-act="close">閉じる</button>`);
  const fin = document.getElementById('bkfilein');
  fin.addEventListener('change', async () => {
    const f = fin.files[0]; if (!f) return;
    try { restoreFrom(await importCode(await f.text()), 'ファイル'); } catch (e) { toast('❌ 読み込めませんでした：' + e.message); }
  });
}
async function backupAct(act, arg) {
  if (act === 'bkcopy') {
    const code = await exportCode();
    try { await navigator.clipboard.writeText(code); toast(`📋 コピーしました（${code.length.toLocaleString()}文字）`); }
    catch (e) { const ta = document.getElementById('bkcode'); ta.value = code; ta.select(); toast('下の欄のコードを長押しでコピーしてください'); }
  }
  if (act === 'bkfile') {
    const code = await exportCode(), a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' }));
    a.download = `nourush-backup-${dayStr()}.txt`; document.body.appendChild(a); a.click(); a.remove();
    toast('💾 ファイルを保存しました');
  }
  if (act === 'bkpaste') {
    const code = document.getElementById('bkcode').value;
    if (!code.trim()) return toast('コードを貼り付けてください');
    try { restoreFrom(await importCode(code), '引き継ぎコード'); } catch (e) { toast('❌ ' + e.message); }
  }
  if (act === 'bkrestore') { try { restoreFrom(parseSave(localStorage.getItem(arg)), 'バックアップ'); } catch (e) { toast('❌ このバックアップは読めません'); } }
}

'use strict';
// ============================================================
//  出題ウィジェット — 全形式の描画と判定を共通化（探検・知の塔で共用）
//  choice / fill / tf / number / order / match / multi / hilo
// ============================================================

const TYPE_LABEL = { choice: '4択', fill: '穴埋め', tf: '○✕', number: '数値を推定', order: '並べ替え', match: '組み合わせ', multi: '複数選択', hilo: 'ハイ＆ロー' };
const fmt = v => Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
function niceStep(range) {
  const raw = range / 200, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
}
// 問題文（穴埋めの空欄・ハイ＆ローの基準値を強調）
function qText(q) {
  let s = esc(q.q).replace('＿＿', '<span class="blank">＿＿</span>');
  // コード付きの問題（Java など）。問題文の下に等幅で出す
  if (q.code) s += `<pre class="qcode">${esc(q.code)}</pre>`;
  if (q.type === 'hilo') s += `<div class="hiref">答えは <b>${fmt(q.ref)}${esc(q.unit || '')}</b> より…？</div>`;
  return s;
}
function correctText(q) {
  switch (q.type) {
    case 'choice': case 'fill': return q.a;
    case 'tf': return q.a ? '⭕ 正しい' : '❌ まちがい';
    case 'number': return `${fmt(q.a)}${q.unit || ''}`;
    case 'hilo': return `${fmt(q.real)}${q.unit || ''}（${fmt(q.ref)}より${q.a ? '大きい' : '小さい'}）`;
    case 'order': return q.items.map((s, i) => `${i + 1}. ${s}`).join('　');
    case 'match': return q.pairs.map(p => `${p[0]}＝${p[1]}`).join('　');
    case 'multi': return q.correct.join('・');
  }
  return '';
}
// 数値問題の一部を「ハイ＆ロー」に変えて形式に変化をつける
function deriveHilo(q) {
  const a = +q.a;
  let ref = a === 0 ? q.min + (q.max - q.min) * .3 : a * (Math.random() < .5 ? .55 + Math.random() * .3 : 1.15 + Math.random() * .45);
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(ref) || 1)) - 1);
  ref = Math.round(ref / p) * p;
  if (ref === a) ref = a + p;
  return { ...q, type: 'hilo', ref, a: a > ref, real: q.a };
}
const maybeHilo = (q, rate = .35) => q.type === 'number' && Math.random() < rate ? deriveHilo(q) : q;

// root に回答UIを描画する。onDone({ok, near, msg, mult}) で結果を返す
function quizWidget(root, q, opt = {}) {
  const st = { done: false, pos: 0, sel: new Set(), pick: null, matched: 0 };
  const n = q.pairs ? q.pairs.length : q.items ? q.items.length : 0;
  let html = '';
  switch (q.type) {
    case 'choice': case 'fill': {
      let opts = [q.a, ...q.wrong.slice(0, 3)];
      if (opt.loupe) opts = [q.a, ...shuffle(q.wrong.slice(0, 3)).slice(0, 2)];
      st.opts = shuffle(opts);
      html = `<div class="choices">${st.opts.map((o, i) => `<button class="ch" data-w="c:${i}"><span class="k">${i + 1}</span>${esc(o)}</button>`).join('')}</div>`;
      break;
    }
    case 'tf':
      html = `<div class="choices tf"><button class="ch o" data-w="tf:1"><span class="k">1</span>⭕<small>正しい</small></button><button class="ch x" data-w="tf:0"><span class="k">2</span>❌<small>まちがい</small></button></div>`;
      break;
    case 'hilo':
      html = `<div class="choices tf"><button class="ch o" data-w="tf:1"><span class="k">1</span>⬆️<small>より大きい</small></button><button class="ch x" data-w="tf:0"><span class="k">2</span>⬇️<small>より小さい</small></button></div>`;
      break;
    case 'number':
      html = `<div class="num"><div class="nv"><span class="nvv">0</span><small>${esc(q.unit || '')}</small></div>
        <div class="track"><input type="range" class="nr"><div class="mk you"></div><div class="mk ans"></div></div>
        <div class="meta"><span>${fmt(q.min)}</span><span>${fmt(q.max)}</span></div>
        <button class="btn primary nsub" style="width:100%;margin-top:8px" data-w="num">これで決定<span class="sub">Enter</span></button></div>`;
      break;
    case 'order': {
      const items = q.items.map((s, i) => ({ s, i })); do shuffle(items); while (items.every((x, k) => x.i === k));
      st.items = items;
      st.seq = [];
      html = `<div class="order">${items.map((x, k) => `<button class="oi" data-w="o:${k}"><b></b>${esc(x.s)}</button>`).join('')}<div class="ghost" style="text-align:center">問題文の順番どおり1番目からタップ（もう一度タップで取り消し）</div></div>
        <button class="btn primary osub" style="width:100%;margin-top:8px" data-w="osub" disabled>決定<span class="sub">Enter</span></button>`;
      break;
    }
    case 'match': {
      st.L = shuffle(q.pairs.map((p, i) => ({ s: p[0], i })));
      st.R = shuffle(q.pairs.map((p, i) => ({ s: p[1], i })));
      html = `<div class="match"><div class="mcol">${st.L.map((x, k) => `<button class="mi" data-w="ml:${k}">${esc(x.s)}</button>`).join('')}</div>
        <div class="mcol">${st.R.map((x, k) => `<button class="mi" data-w="mr:${k}">${esc(x.s)}</button>`).join('')}</div></div>
        <div class="ghost" style="text-align:center">左右を1つずつタップして結ぶ（結んだものをタップで解除）</div>
        <button class="btn primary xsub" style="width:100%;margin-top:8px" data-w="xsub" disabled>決定<span class="sub">Enter</span></button>`;
      st.link = {}; // 左k → 右k
      st.col = {};  // 左k → 色番号
      break;
    }
    case 'multi':
      st.mo = shuffle(q.options.slice());
      html = `<div class="multi">${st.mo.map((o, i) => `<button class="mo" data-w="mo:${i}"><span class="box"></span><span class="k">${i + 1}</span>${esc(o)}</button>`).join('')}</div>
        <button class="btn primary msub" style="width:100%;margin-top:8px" data-w="msub">決定（正解は${q.correct.length}つ）<span class="sub">Enter</span></button>`;
      break;
  }
  root.innerHTML = html;
  if (q.type === 'number') {
    const r = root.querySelector('.nr'), step = niceStep(q.max - q.min);
    r.min = q.min; r.max = q.max; r.step = step;
    // 初期位置は正解から十分離す（ヒントにならないように）
    let v, k = 0;
    do v = q.min + Math.round((q.max - q.min) * (.1 + Math.random() * .8) / step) * step; while (Math.abs(v - q.a) < (q.max - q.min) * .25 && k++ < 30);
    r.value = v;
    const upd = () => { root.querySelector('.nvv').textContent = fmt(r.value); };
    r.addEventListener('input', () => { upd(); if (Math.random() < .3) tone(600 + (r.value - q.min) / (q.max - q.min) * 600, .03, 'square', .02); });
    upd();
  }
  const finish = res => { if (st.done) return; st.done = true; opt.onDone && opt.onDone(res); };
  const drawMatch = () => {
    const cols = root.querySelectorAll('.mcol');
    [0, 1].forEach(s2 => [...cols[s2].children].forEach(b => b.className = 'mi'));
    Object.entries(st.link).forEach(([L, R]) => { cols[0].children[L].classList.add('p' + st.col[L]); cols[1].children[R].classList.add('p' + st.col[L]); });
    if (st.pick) cols[st.pick.side === 'L' ? 0 : 1].children[st.pick.k].classList.add('sel');
    root.querySelector('.xsub').disabled = Object.keys(st.link).length < n;
  };
  const btns = () => root.querySelectorAll('.ch');
  const act = key => {
    if (st.done) return;
    const [k, v] = key.split(':');
    if (k === 'c') { const ok = st.opts[+v] === q.a; btns()[+v].classList.add(ok ? 'ok' : 'ng'); if (!ok) btns()[st.opts.indexOf(q.a)].classList.add('ok', 'reveal'); finish({ ok }); }
    if (k === 'tf') { const ok = (v === '1') === !!q.a, i = v === '1' ? 0 : 1; btns()[i].classList.add(ok ? 'ok' : 'ng'); if (!ok) btns()[1 - i].classList.add('ok', 'reveal'); finish({ ok, msg: q.type === 'hilo' ? `正解は ${fmt(q.real)}${q.unit || ''}` : '' }); }
    if (k === 'num') {
      const r = root.querySelector('.nr'), val = +r.value, a = +q.a;
      const base = Math.abs(a) > 0 ? Math.abs(a) : (q.max - q.min) * .05, err = Math.abs(val - a) / base, tol = .12 * (opt.tolMult || 1);
      const pos = x => ((x - q.min) / (q.max - q.min) * 100) + '%';
      root.querySelector('.mk.you').style.left = pos(val); root.querySelector('.mk.ans').style.left = pos(a); root.querySelector('.mk.ans').classList.add('show');
      r.disabled = true; root.querySelector('.nvv').textContent = fmt(val); root.querySelector('.nsub').remove();
      const pct = Math.round(err * 100);
      if (err <= tol * .3) finish({ ok: true, mult: 1.5, msg: `🎯 PERFECT！ 誤差 ${pct}%` });
      else if (err <= tol) finish({ ok: true, msg: `誤差 ${pct}% — お見事！` });
      else if (err <= tol * 2) finish({ ok: false, near: true, msg: `惜しい！ 誤差 ${pct}%（あと${Math.max(1, pct - Math.round(tol * 100))}%）` });
      else finish({ ok: false, msg: `誤差 ${pct}%` });
    }
    if (k === 'o') {
      const at = st.seq.indexOf(+v);
      if (at >= 0) { st.seq.splice(at, 1); tone(400, .04, 'square', .03); }
      else { st.seq.push(+v); tone(560 + st.seq.length * 110, .06, 'triangle', .08); }
      root.querySelectorAll('.oi').forEach((b, i) => { const p = st.seq.indexOf(i); b.querySelector('b').textContent = p >= 0 ? p + 1 : ''; b.classList.toggle('picked', p >= 0); });
      root.querySelector('.osub').disabled = st.seq.length < n;
    }
    if (k === 'osub') {
      if (st.seq.length < n) return;
      const bs = root.querySelectorAll('.oi');
      let good = 0;
      st.seq.forEach((ki, pos) => { const ok = st.items[ki].i === pos; if (ok) good++; bs[ki].classList.add(ok ? 'ok' : 'ng'); });
      root.querySelector('.osub').remove();
      finish(good === n ? { ok: true } : good >= n - 2 && good > 0 ? { ok: false, near: true, msg: `惜しい！ ${good}/${n} が正しい位置` } : { ok: false });
    }
    if (k === 'ml' || k === 'mr') {
      const side = k === 'ml' ? 'L' : 'R', idx = +v;
      const lk = side === 'L' ? idx : Object.keys(st.link).find(x => st.link[x] === idx);
      // 結んである組をタップしたら解除
      if (lk != null && st.link[lk] != null) { delete st.link[lk]; delete st.col[lk]; st.pick = null; tone(400, .04, 'square', .03); }
      else if (!st.pick || st.pick.side === side) { st.pick = { side, k: idx }; tone(500, .04, 'square', .03); }
      else {
        const L = side === 'L' ? idx : st.pick.k, R = side === 'R' ? idx : st.pick.k;
        const used = Object.values(st.col); let c = 0; while (used.includes(c)) c++;
        st.link[L] = R; st.col[L] = c; st.pick = null; tone(660 + Object.keys(st.link).length * 110, .08, 'triangle', .1);
      }
      drawMatch();
    }
    if (k === 'xsub') {
      if (Object.keys(st.link).length < n) return;
      const cols = root.querySelectorAll('.mcol');
      let good = 0;
      Object.entries(st.link).forEach(([L, R]) => { const ok = st.L[L].i === st.R[R].i; if (ok) good++; cols[0].children[L].classList.add(ok ? 'ok' : 'ng'); cols[1].children[R].classList.add(ok ? 'ok' : 'ng'); });
      root.querySelector('.xsub').remove();
      finish(good === n ? { ok: true } : good >= n - 2 && good > 0 ? { ok: false, near: true, msg: `惜しい！ ${good}/${n}組 正解` } : { ok: false });
    }
    if (k === 'mo') { const b = root.querySelectorAll('.mo')[+v], o = st.mo[+v]; st.sel.has(o) ? st.sel.delete(o) : st.sel.add(o); b.classList.toggle('on'); tone(520, .04, 'square', .03); }
    if (k === 'msub') {
      const want = new Set(q.correct);
      root.querySelectorAll('.mo').forEach((b, i) => { const o = st.mo[i]; if (want.has(o)) b.classList.add(st.sel.has(o) ? 'ok' : 'reveal'); else if (st.sel.has(o)) b.classList.add('ng'); });
      root.querySelector('.msub').remove();
      const diff = [...want].filter(x => !st.sel.has(x)).length + [...st.sel].filter(x => !want.has(x)).length;
      finish(diff === 0 ? { ok: true } : diff === 1 ? { ok: false, near: true, msg: '惜しい！ あと1つ' } : { ok: false });
    }
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) { e.stopPropagation(); act(b.dataset.w); } });
  const key = e => {
    const k = e.key;
    if (st.done) return false;
    if (/^[1-9]$/.test(k)) {
      const i = +k - 1;
      if ((q.type === 'choice' || q.type === 'fill') && i < st.opts.length) act('c:' + i);
      else if ((q.type === 'tf' || q.type === 'hilo') && i < 2) act('tf:' + (i === 0 ? 1 : 0));
      else if (q.type === 'order' && i < n) act('o:' + i);
      else if (q.type === 'multi' && i < st.mo.length) act('mo:' + i);
      else return false;
      return true;
    }
    if (k === 'Enter' && q.type === 'number') { act('num'); return true; }
    if (k === 'Enter' && q.type === 'multi') { act('msub'); return true; }
    if (k === 'Enter' && q.type === 'order') { act('osub'); return true; }
    if (k === 'Enter' && q.type === 'match') { act('xsub'); return true; }
    return false;
  };
  // 自動テスト用：正解（または不正解）を入力する
  const solve = right => {
    if (q.type === 'choice' || q.type === 'fill') { const i = st.opts.indexOf(q.a); act('c:' + (right ? i : (i + 1) % st.opts.length)); }
    else if (q.type === 'tf' || q.type === 'hilo') act('tf:' + ((right ? q.a : !q.a) ? 1 : 0));
    else if (q.type === 'number') { root.querySelector('.nr').value = right ? q.a : q.max; act('num'); }
    else if (q.type === 'order') { const ks = [...Array(n)].map((_, p) => st.items.findIndex(x => x.i === p)); if (!right) [ks[0], ks[1]] = [ks[1], ks[0]]; ks.forEach(k => act('o:' + k)); act('osub'); }
    else if (q.type === 'match') { const rs = st.L.map(x => st.R.findIndex(y => y.i === x.i)); if (!right) [rs[0], rs[1]] = [rs[1], rs[0]]; rs.forEach((r, k) => { act('ml:' + k); act('mr:' + r); }); act('xsub'); }
    else if (q.type === 'multi') { st.mo.forEach((o, i) => { if (right ? q.correct.includes(o) : !q.correct.includes(o)) act('mo:' + i); }); act('msub'); }
  };
  return { act, key, solve, st };
}

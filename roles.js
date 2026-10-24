'use strict';
// ============================================================
//  ロールのカードプール — ロールごとにまったく違うデッキで戦う
//  🎓学徒：知識と📖（テーマ別の名前）   ⚔️剣闘士：HPを力に変える
//  🛡️守護者：ブロックを力に変える       🗡️毒使い：毒・投げナイフ・敏捷
//  🔮賢者：構え（静思／憤怒）と📖        🃏道化師：チップと運
//  報酬・商店・イベントのカードは自分のロールのプール（＋たまに無色）から出る
// ============================================================

// ---------- 共通ヘルパー ----------
function setStance(s) {
  if (!CB || CB.stance === s) return;
  if (CB.stance === 'calm') { CB.energy += 2; pfloat('🧘→ +2⚡'); }
  CB.stance = s;
  if (s === 'wrath') { pfloat('🔥 憤怒！', '#ff5c7a'); tone(200, .2, 'sawtooth', .08); }
  if (s === 'calm') { pfloat('🧘 静思', '#5ad1ff'); tone(660, .2, 'sine', .08); }
  renderCombat();
}
function gainChips(n) { n += CB.powers.highroller || 0; CB.chips += n; pfloat(`🪙+${n}`); tone(988, .06, 'square', .05); renderCombat(); }
function loseHP(n) { RG.hp = Math.max(1, RG.hp - n); if (CB.powers.rupture) CB.str += CB.powers.rupture; pfloat(`🩸-${n}${CB.powers.rupture ? ` 💪+${CB.powers.rupture}` : ''}`, '#ff5c7a'); renderCombat(); }
function giveCards(cards, free) { cards.forEach(c => { if (CB.hand.length < 10) CB.hand.push(free ? { ...c, free: true } : c); }); renderCombat(); }
const rolePool = (role, except) => Object.keys(CARDS).filter(id => CARDS[id].role === role && CARDS[id].r >= 1 && id !== except);

// ---------- 既存カードの所属 ----------
const ROLE_OF = {
  scholar: 'strike defend insight twin both refute mshield spark scholar focus curse2 curio chain finisher genius study barrage mastery library echo',
  gladiator: 'bash heavy reckless whirl execute drain sacrifice rage cleave flex demon',
  guardian: 'wall entrench barricade fortress slam thorns feint ironskin counter shieldwall press',
  assassin: 'toxin cascade catalyst quick momentum shiv blades noxious backflip acrobat',
  sage: 'oracle epiphany meditate wisdom',
  jester: 'allin dice jackpot reshuffle luck',
  any: 'dig recall shout rest2 awaken',
};
Object.entries(ROLE_OF).forEach(([role, ids]) => ids.split(' ').forEach(id => { CARDS[id].role = role; }));
CARDS.sacrifice.f = async u => { loseHP(3); CB.energy += 2; if (u) drawCards(1); renderCombat(); };
CARDS.shiv.f = async u => { await hit(4 + 2 * u + (CB.powers.accuracy || 0)); };

Object.assign(CARDS, {
  // ===== 基本カード（ロールごとの打撃・防御） =====
  g_strike: { e: '⚔️', n: '斬撃', c: 1, t: 'atk', r: 0, role: 'gladiator', d: u => `${6 + 3 * u}ダメージ`, f: async u => { await hit(6 + 3 * u); } },
  g_defend: { e: '🤺', n: '受け流し', c: 1, t: 'skl', r: 0, role: 'gladiator', d: u => `ブロック${5 + 3 * u}`, f: async u => gainBlock(5 + 3 * u) },
  k_strike: { e: '🔨', n: '突き', c: 1, t: 'atk', r: 0, role: 'guardian', d: u => `${6 + 3 * u}ダメージ`, f: async u => { await hit(6 + 3 * u); } },
  k_defend: { e: '🛡️', n: '構え', c: 1, t: 'skl', r: 0, role: 'guardian', d: u => `ブロック${6 + 3 * u}`, f: async u => gainBlock(6 + 3 * u) },
  a_strike: { e: '🗡️', n: '刺突', c: 1, t: 'atk', r: 0, role: 'assassin', d: u => `${6 + 3 * u}ダメージ`, f: async u => { await hit(6 + 3 * u); } },
  a_defend: { e: '💨', n: '回避', c: 1, t: 'skl', r: 0, role: 'assassin', d: u => `ブロック${5 + 3 * u}`, f: async u => gainBlock(5 + 3 * u) },
  s_strike: { e: '✋', n: '掌打', c: 1, t: 'atk', r: 0, role: 'sage', d: u => `${6 + 3 * u}ダメージ`, f: async u => { await hit(6 + 3 * u); } },
  s_defend: { e: '😌', n: '瞑目', c: 1, t: 'skl', r: 0, role: 'sage', d: u => `ブロック${5 + 3 * u}`, f: async u => gainBlock(5 + 3 * u) },
  j_strike: { e: '🤹', n: 'ジャグリング', c: 1, t: 'atk', r: 0, role: 'jester', d: u => `${6 + 3 * u}ダメージ`, f: async u => { await hit(6 + 3 * u); } },
  j_defend: { e: '🎭', n: '道化の盾', c: 1, t: 'skl', r: 0, role: 'jester', d: u => `ブロック${5 + 3 * u}`, f: async u => gainBlock(5 + 3 * u) },

  // ===== ⚔️ 剣闘士：HPを削って力を得る =====
  offering: { e: '🩸', n: '供物', c: 0, t: 'skl', r: 3, ex: 1, role: 'gladiator', d: u => `HP-6 +2⚡ ${3 + 2 * u}ドロー（廃棄）`, f: async u => { loseHP(6); CB.energy += 2; drawCards(3 + 2 * u); renderCombat(); } },
  inflame: { e: '🔥', n: '発火', c: 1, t: 'pow', r: 2, role: 'gladiator', d: u => `知識+${2 + u}`, f: async u => { CB.str += 2 + u; pfloat(`💪+${2 + u}`); } },
  pummel: { e: '👊', n: '連撃', c: 1, t: 'atk', r: 1, ex: 1, role: 'gladiator', d: u => `2ダメージ×${4 + u}（廃棄）`, f: async u => { for (let k = 0; k < 4 + u; k++) await hit(2); } },
  feed: { e: '🍖', n: '捕食', c: 1, t: 'atk', r: 3, ex: 1, role: 'gladiator', d: u => `${10 + 2 * u}ダメ 倒せば最大HP+${3 + u}（廃棄）`, f: async u => { await hit(10 + 2 * u); if (CB.foe.hp <= 0) { RG.maxHp += 3 + u; RG.hp += 3 + u; pfloat(`❤️最大+${3 + u}`, '#2ee59d'); } } },
  limitbreak: { e: '💥', n: '限界突破', c: 1, t: 'skl', r: 3, ex: 1, role: 'gladiator', d: u => `知識を2倍${u ? '＋2' : ''}（廃棄）`, f: async u => { CB.str = CB.str * 2 + (u ? 2 : 0); pfloat(`💪×2`); renderCombat(); } },
  ironwave: { e: '🌊', n: '鉄の波', c: 1, t: 'atk', r: 1, role: 'gladiator', d: u => `${5 + 2 * u}ダメ ブロック${5 + 2 * u}`, f: async u => { await hit(5 + 2 * u); gainBlock(5 + 2 * u); } },
  rupture: { e: '🫀', n: '破裂', c: 1, t: 'pow', r: 2, role: 'gladiator', d: u => `カードでHPを失うたび知識+${1 + u}`, f: async u => { CB.powers.rupture = (CB.powers.rupture || 0) + 1 + u; } },

  // ===== 🛡️ 守護者：ブロックを積んで殴る =====
  impervious: { e: '🏯', n: '鉄壁の守り', c: 2, t: 'skl', r: 3, ex: 1, role: 'guardian', d: u => `ブロック${30 + 10 * u}（廃棄）`, f: async u => gainBlock(30 + 10 * u) },
  spikes: { e: '🦔', n: '棘の鎧', c: 2, t: 'skl', r: 2, role: 'guardian', d: u => `ブロック${10 + 3 * u} 反撃+3`, f: async u => { gainBlock(10 + 3 * u); CB.powers.thorns = (CB.powers.thorns || 0) + 3; } },
  brace: { e: '🧍', n: '踏ん張り', c: 0, t: 'skl', r: 1, role: 'guardian', d: u => `ブロック${4 + 3 * u}`, f: async u => gainBlock(4 + 3 * u) },
  juggernaut: { e: '🦏', n: '重装突撃', c: 2, t: 'pow', r: 3, role: 'guardian', d: u => `ブロックを得るたび敵に${5 + 2 * u}ダメ`, f: async u => { CB.powers.jugg = (CB.powers.jugg || 0) + 5 + 2 * u; } },
  reinforce: { e: '🔩', n: '補強', c: 1, t: 'skl', r: 1, role: 'guardian', d: u => `ブロック${5 + 2 * u} 次ターンも${5 + 2 * u}`, f: async u => { gainBlock(5 + 2 * u); CB.nextBlock += 5 + 2 * u; } },

  // ===== 🗡️ 毒使い：毒・投げナイフ・敏捷 =====
  bouncing: { e: '🧪', n: '跳ねる毒瓶', c: 2, t: 'skl', r: 1, role: 'assassin', d: u => `毒3を${3 + u}回`, f: async u => { for (let k = 0; k < 3 + u; k++) { foeStatus('poison', 3); await sleep(120); } } },
  footwork: { e: '🦶', n: '足さばき', c: 1, t: 'pow', r: 2, role: 'assassin', d: u => `敏捷+${2 + u}（ブロック増）`, f: async u => { CB.dex += 2 + u; pfloat(`🦶+${2 + u}`); } },
  accuracy: { e: '🎯', n: '精密', c: 1, t: 'pow', r: 2, role: 'assassin', d: u => `投げナイフ+${4 + 2 * u}ダメ`, f: async u => { CB.powers.accuracy = (CB.powers.accuracy || 0) + 4 + 2 * u; } },
  cloak: { e: '🥷', n: '外套と短剣', c: 1, t: 'skl', r: 1, role: 'assassin', d: u => `ブロック6 投げナイフ${1 + u}枚`, f: async u => { gainBlock(6); giveCards(Array(1 + u).fill({ id: 'shiv', u: 0 })); } },
  flechette: { e: '🎐', n: '連続投擲', c: 1, t: 'atk', r: 2, role: 'assassin', d: u => `手札のスキル1枚につき${4 + 2 * u}ダメ`, f: async u => { const n = CB.hand.filter(c => CARDS[c.id].t === 'skl').length; for (let k = 0; k < n; k++) await hit(4 + 2 * u); if (!n) pfloat('スキルなし…'); } },
  envenom: { e: '🐍', n: '毒塗り', c: [2, 1], t: 'pow', r: 3, role: 'assassin', d: () => '攻撃が通るたび毒1', f: async () => { CB.powers.envenom = (CB.powers.envenom || 0) + 1; } },
  corpse: { e: '💀', n: '死毒爆発', c: 2, t: 'atk', r: 3, role: 'assassin', d: u => `毒${6 + 3 * u} その後 毒の量だけダメージ`, f: async u => { foeStatus('poison', 6 + 3 * u); await hit(CB.foe.poison); } },
  adrenal: { e: '💉', n: 'アドレナリン', c: 0, t: 'skl', r: 3, ex: 1, role: 'assassin', d: u => `+${1 + u}⚡ 2ドロー（廃棄）`, f: async u => { CB.energy += 1 + u; drawCards(2); renderCombat(); } },

  // ===== 🔮 賢者：構え（静思で溜め、憤怒で倍撃）と📖 =====
  eruption: { e: '🌋', n: '噴出', c: [2, 1], t: 'atk', r: 1, role: 'sage', d: () => `9ダメージ 憤怒へ`, f: async () => { await hit(9); setStance('wrath'); } },
  vigil: { e: '🕯️', n: '静観', c: 1, t: 'skl', r: 1, role: 'sage', d: u => `ブロック${8 + 4 * u} 静思へ`, f: async u => { gainBlock(8 + 4 * u); setStance('calm'); } },
  tantrum: { e: '😤', n: '激昂', c: 1, t: 'atk', r: 1, role: 'sage', d: u => `${3 + u}ダメ×3 憤怒へ`, f: async u => { for (let k = 0; k < 3; k++) await hit(3 + u); setStance('wrath'); } },
  innerpeace: { e: '☮️', n: '内なる平穏', c: 1, t: 'skl', r: 2, role: 'sage', d: u => `静思なら${3 + u}ドロー／でなければ静思へ`, f: async u => { if (CB.stance === 'calm') { drawCards(3 + u); renderCombat(); } else setStance('calm'); } },
  flurry: { e: '🌀', n: '疾風打', c: 0, t: 'atk', r: 1, role: 'sage', d: u => `${4 + 2 * u}ダメージ`, f: async u => { await hit(4 + 2 * u); } },
  mantra: { e: '📿', n: '真言', c: 1, t: 'skl', r: 1, role: 'sage', d: u => `静思:ブロック${12 + 4 * u}／憤怒:${12 + 4 * u}ダメ／なし:ブロック6`, f: async u => { if (CB.stance === 'wrath') await hit(12 + 4 * u); else gainBlock(CB.stance === 'calm' ? 12 + 4 * u : 6); } },
  koan: { e: '❓', n: '公案', c: 1, t: 'skl', r: 2, q: 1, role: 'sage', d: u => `📖正解:静思へ ${2 + u}ドロー／外:憤怒へ`, f: async u => { if (await cardQuiz()) { setStance('calm'); drawCards(2 + u); renderCombat(); } else setStance('wrath'); } },
  revelation: { e: '🌟', n: '天啓', c: 2, t: 'atk', r: 3, q: 1, ex: 1, role: 'sage', d: u => `📖3問 正解数×${10 + 4 * u}ダメ（廃棄）`, f: async u => { let ok = 0; for (let k = 0; k < 3; k++) if (await cardQuiz()) ok++; if (ok) await hit(ok * (10 + 4 * u)); else pfloat('天啓は降りなかった…'); } },
  emptymind: { e: '🫧', n: '無我', c: 1, t: 'skl', r: 2, role: 'sage', d: u => `構えを解き ${2 + u}ドロー`, f: async u => { setStance(null); drawCards(2 + u); renderCombat(); } },
  sutra: { e: '📜', n: '経典', c: 1, t: 'pow', r: 3, role: 'sage', d: u => `毎ターン最初の📖カード正解で+${1 + u}⚡`, f: async u => { CB.powers.sutra = (CB.powers.sutra || 0) + 1 + u; } },

  // ===== 🃏 道化師：チップを貯めて一気に払い出す =====
  coinflip: { e: '🪙', n: 'コイントス', c: 0, t: 'atk', r: 1, role: 'jester', d: u => `表:${10 + 4 * u}ダメ／裏:チップ+2`, f: async u => { if (Math.random() < .5) { pfloat('表！'); await hit(10 + 4 * u); } else { pfloat('裏…'); gainChips(2); } } },
  ante: { e: '🎫', n: '賭け金', c: 1, t: 'skl', r: 1, role: 'jester', d: u => `チップ+3 ブロック${4 + 3 * u}`, f: async u => { gainChips(3); gainBlock(4 + 3 * u); } },
  payout: { e: '💰', n: '配当', c: 1, t: 'atk', r: 2, role: 'jester', d: u => `チップを全て使い 1枚×${5 + 2 * u}ダメ`, f: async u => { const n = CB.chips; CB.chips = 0; if (!n) return pfloat('チップがない…'); await hit(n * (5 + 2 * u)); } },
  cardtrick: { e: '🎩', n: 'カードマジック', c: 1, t: 'skl', r: 3, role: 'jester', d: u => `ランダムな道化師カード${2 + u}枚をコスト0で手札に`, f: async u => { const pool = rolePool('jester', 'cardtrick'); giveCards(Array.from({ length: 2 + u }, () => ({ id: pool[rand(pool.length)], u: 0 })), true); } },
  roulette: { e: '🎡', n: 'ルーレット', c: 2, t: 'atk', r: 2, role: 'jester', d: u => `出目(1〜6)×${5 + 2 * u}ダメージ`, f: async u => { const n = 1 + rand(6); pfloat(`🎡 ${n}！`); await hit(n * (5 + 2 * u)); } },
  wildcard: { e: '🃏', n: 'ワイルドカード', c: 0, t: 'skl', r: 2, role: 'jester', d: u => `手札のランダムな${1 + u}枚をコスト0に`, f: async u => { shuffle(CB.hand.filter(c => !c.free && cardCost(c) > 0)).slice(0, 1 + u).forEach(c => { c.free = true; }); pfloat('✨コスト0'); renderCombat(); } },
  bluff: { e: '😏', n: 'ハッタリ', c: 1, t: 'skl', r: 1, role: 'jester', d: u => `ブロック${7 + 3 * u} チップ+1`, f: async u => { gainBlock(7 + 3 * u); gainChips(1); } },
  highroller: { e: '🎲', n: 'ハイローラー', c: [2, 1], t: 'pow', r: 3, role: 'jester', d: () => 'チップを得るたび+1枚', f: async () => { CB.powers.highroller = (CB.powers.highroller || 0) + 1; } },
  doubleup: { e: '✖️', n: 'ダブルアップ', c: 1, t: 'skl', r: 2, ex: 1, role: 'jester', d: u => `チップを2倍${u ? '+2' : ''}（廃棄）`, f: async u => { CB.chips = CB.chips * 2 + (u ? 2 : 0); pfloat(`🪙×2`); renderCombat(); } },
  confetti: { e: '🎊', n: '紙吹雪', c: 1, t: 'atk', r: 1, role: 'jester', d: u => `${3 + 2 * u}〜${9 + 2 * u}ダメージ×3`, f: async u => { for (let k = 0; k < 3; k++) await hit(3 + 2 * u + rand(7)); } },
});

// ---------- ロールの初期デッキ ----------
const fill = (id, n) => Array(n).fill(id);
Object.assign(ROLES.gladiator, { deck: [...fill('g_strike', 5), ...fill('g_defend', 4), 'bash'], desc: 'HPを削って力に変える。発火・限界突破で知識を積み、重い一撃で叩き潰す' });
Object.assign(ROLES.guardian, { deck: [...fill('k_strike', 4), ...fill('k_defend', 5), 'slam'], desc: 'ブロックを積み上げ、盾打ち・押し返し・重装突撃でそのまま攻撃に変える' });
Object.assign(ROLES.assassin, { deck: [...fill('a_strike', 5), ...fill('a_defend', 5), 'toxin', 'blades'], desc: '毒で蝕み、投げナイフの手数と敏捷で削り切る' });
Object.assign(ROLES.sage, { deck: [...fill('s_strike', 4), ...fill('s_defend', 4), 'eruption', 'vigil', 'oracle'], desc: '静思で力を溜め、憤怒で2倍撃。📖の正解が力になる（憤怒中は被ダメも2倍）' });
Object.assign(ROLES.jester, { deck: [...fill('j_strike', 4), ...fill('j_defend', 4), 'dice', 'coinflip', 'jackpot'], desc: 'チップを貯めて配当で一気に払い出す。コインとサイコロに運命を預ける' });
ROLES.scholar.desc = '知識と📖のバランス型。カードの名前がテーマごとに変わる';

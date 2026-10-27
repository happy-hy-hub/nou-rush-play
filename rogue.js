'use strict';
// ============================================================
//  知の塔 — Slay the Spire 風ローグライク
//  ・分岐マップ（戦闘/エリート/？/休憩/商店/宝箱/ボス）
//  ・デッキ構築カードバトル。毎ターン「知識チャージ」問題で
//    エネルギーと知識（攻撃力）が決まる。確信ベットあり
//  ・敵は「誤解」。倒すと真実が明かされる（論破）
// ============================================================

// 1層 = 12階 + ボス。2層構成（1層目のボスを倒すとボス遺物を選んで2層目へ）
const RG_FLOORS = 13, RG_ACTS = 2, RG_HAND = 5, RG_HP = 60, RG_MAX_ASC = 10;
// window.SIM = true で演出の待ち時間を0にする（バランス調整の自動プレイ用）
const sleep = ms => window.SIM ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
const actOf = () => (RG && RG.act) || 0;
const lastAct = () => actOf() >= RG_ACTS - 1;
const gFloor = f => actOf() * RG_FLOORS + f + 1; // 通算の階（1始まり）

// ---------- カード ----------
// t: atk / skl / pow / curse,  r: 0=初期 1=コモン 2=アンコモン 3=レア,  q: 出題あり,  ex: 廃棄
const CARDS = {
  strike: { n: '打撃', c: 1, t: 'atk', r: 0, d: u => `${6 + 3 * u}ダメージ`, f: async u => { await hit(6 + 3 * u); } },
  defend: { n: '防御', c: 1, t: 'skl', r: 0, d: u => `ブロック${5 + 3 * u}`, f: async u => gainBlock(5 + 3 * u) },
  insight: { n: '閃き', c: 1, t: 'atk', r: 0, q: 1, d: u => `📖正解:${12 + 4 * u}ダメ+1ドロー／外:3ダメ`, f: async u => { if (await cardQuiz()) { await hit(12 + 4 * u); drawCards(1); } else await hit(3); } },
  bash: { n: '重撃', c: 2, t: 'atk', r: 1, d: u => `${13 + 4 * u}ダメージ 脆弱${1 + u}`, f: async u => { await hit(13 + 4 * u); foeStatus('vuln', 1 + u); } },
  twin: { n: '連打', c: 1, t: 'atk', r: 1, d: u => `${4 + 2 * u}ダメージ×2`, f: async u => { await hit(4 + 2 * u); await hit(4 + 2 * u); } },
  wall: { n: '鉄壁', c: 2, t: 'skl', r: 1, d: u => `ブロック${12 + 4 * u}`, f: async u => gainBlock(12 + 4 * u) },
  both: { n: '攻防一体', c: 1, t: 'atk', r: 1, d: u => `${5 + 2 * u}ダメ ブロック${5 + 2 * u}`, f: async u => { await hit(5 + 2 * u); gainBlock(5 + 2 * u); } },
  dig: { n: '発掘', c: 1, t: 'skl', r: 1, d: u => `${2 + u}枚ドロー`, f: async u => drawCards(2 + u) },
  refute: { n: '論破', c: 1, t: 'atk', r: 1, q: 1, d: u => `📖正解:${11 + 4 * u}ダメ 弱体2／外:なし`, f: async u => { if (await cardQuiz()) { await hit(11 + 4 * u); foeStatus('weak', 2); } } },
  mshield: { n: '記憶の盾', c: 1, t: 'skl', r: 1, q: 1, d: u => `📖正解:ブロック${13 + 4 * u}／外:4`, f: async u => gainBlock(await cardQuiz() ? 13 + 4 * u : 4) },
  quick: { n: '速攻', c: 0, t: 'atk', r: 1, d: u => `${4 + 3 * u}ダメージ`, f: async u => { await hit(4 + 3 * u); } },
  spark: { n: 'ひらめき', c: 0, t: 'skl', r: 2, q: 1, d: u => `📖正解:+1⚡ ${1 + u}ドロー`, f: async u => { if (await cardQuiz()) { CB.energy++; drawCards(1 + u); } } },
  scholar: { n: '博識', c: 1, t: 'atk', r: 2, d: u => `知識×${3 + u}ダメージ`, f: async u => { await hit(Math.max(0, CB.str) * (3 + u) - CB.str); } },
  focus: { n: '集中', c: 1, t: 'skl', r: 2, ex: 1, d: u => `知識+${2 + u}（廃棄）`, f: async u => { CB.str += 2 + u; pfloat(`💪+${2 + u}`); } },
  slam: { n: '盾打ち', c: [1, 0], t: 'atk', r: 2, d: () => `ブロック分のダメージ`, f: async () => { await hit(CB.block - CB.str); } },
  curse2: { n: '呪言', c: 1, t: 'skl', r: 2, d: u => `敵に弱体${2 + u} 脆弱${1 + u}`, f: async u => { foeStatus('weak', 2 + u); foeStatus('vuln', 1 + u); } },
  curio: { n: '探究心', c: 1, t: 'pow', r: 2, d: u => `毎ターン正解時ブロック${4 + 2 * u}`, f: async u => { CB.powers.curio = (CB.powers.curio || 0) + 4 + 2 * u; } },
  chain: { n: '連鎖', c: 1, t: 'atk', r: 2, d: u => `${7 + 3 * u}ダメ 直前の問題が正解なら2回`, f: async u => { await hit(7 + 3 * u); if (CB.lastOk) await hit(7 + 3 * u); } },
  rest2: { n: '再起', c: 1, t: 'skl', r: 2, ex: 1, d: u => `HP${6 + 3 * u}回復（廃棄）`, f: async u => healP(6 + 3 * u) },
  finisher: { n: '一撃必殺', c: 3, t: 'atk', r: 3, q: 1, d: u => `📖正解:${34 + 10 * u}ダメ／外:10`, f: async u => { await hit(await cardQuiz() ? 34 + 10 * u : 10); } },
  genius: { n: '天才', c: [2, 1], t: 'pow', r: 3, d: () => `毎ターン知識+1`, f: async () => { CB.powers.genius = (CB.powers.genius || 0) + 1; } },
  awaken: { n: '覚醒', c: 0, t: 'skl', r: 3, ex: 1, d: u => `+2⚡ ${1 + u}ドロー（廃棄）`, f: async u => { CB.energy += 2; drawCards(1 + u); } },
  fortress: { n: '要塞', c: 2, t: 'pow', r: 3, d: u => `ターン終了時ブロック${5 + 2 * u}`, f: async u => { CB.powers.fort = (CB.powers.fort || 0) + 5 + 2 * u; } },
  // --- 毒・持続系 ---
  toxin: { n: '毒針', c: 1, t: 'skl', r: 1, d: u => `毒${5 + 2 * u}を付与`, f: async u => foeStatus('poison', 5 + 2 * u) },
  cascade: { n: '侵食', c: 1, t: 'atk', r: 1, d: u => `${4 + 2 * u}ダメ 毒${3 + u}`, f: async u => { await hit(4 + 2 * u); foeStatus('poison', 3 + u); } },
  catalyst: { n: '触媒', c: 1, t: 'skl', r: 2, ex: 1, d: u => `敵の毒を${2 + u}倍（廃棄）`, f: async u => { CB.foe.poison *= 2 + u; renderCombat(); pfloat('☠️×' + (2 + u), '#b18cff'); } },
  thorns: { n: '反撃の構え', c: 1, t: 'pow', r: 2, d: u => `攻撃を受けるたび${3 + 2 * u}反撃`, f: async u => { CB.powers.thorns = (CB.powers.thorns || 0) + 3 + 2 * u; } },
  // --- 連携・スケール系 ---
  whirl: { n: '旋風', c: 'X', t: 'atk', r: 2, d: u => `⚡を全消費 ${5 + 3 * u}ダメ×消費⚡`, f: async (u, x) => { for (let k = 0; k < x; k++) await hit(5 + 3 * u); } },
  momentum: { n: '勢い', c: 1, t: 'atk', r: 1, d: u => `${4 + u}ダメ＋このターン使ったカード毎に+${2 + u}`, f: async u => { await hit(4 + u + (2 + u) * CB.played); } },
  heavy: { n: '重量級', c: 2, t: 'atk', r: 1, d: u => `${12 + 2 * u}ダメ 知識の効果${3 + 2 * u}倍`, f: async u => { await hit(12 + 2 * u + CB.str * (2 + 2 * u)); } },
  execute: { n: 'とどめ', c: 1, t: 'atk', r: 2, d: u => `${8 + 3 * u}ダメ 敵HP30%以下なら3倍`, f: async u => { const f = CB.foe; await hit((8 + 3 * u) * (f.hp <= f.maxHp * .3 ? 3 : 1)); } },
  drain: { n: '吸収', c: 1, t: 'atk', r: 2, d: u => `${7 + 3 * u}ダメ HP${3 + u}回復`, f: async u => { await hit(7 + 3 * u); healP(3 + u); } },
  reckless: { n: '無謀な一撃', c: 0, t: 'atk', r: 1, d: u => `${10 + 4 * u}ダメ 捨札に混乱1枚`, f: async u => { await hit(10 + 4 * u); CB.discard.push({ id: 'confuse', u: 0 }); } },
  // --- 防御系 ---
  entrench: { n: '塹壕', c: [2, 1], t: 'skl', r: 2, d: () => 'ブロックを2倍にする', f: async () => gainBlock(CB.block) },
  barricade: { n: 'バリケード', c: [3, 2], t: 'pow', r: 3, d: () => 'ブロックがターン開始時に消えない', f: async () => { CB.powers.barricade = 1; } },
  feint: { n: '牽制', c: 1, t: 'skl', r: 1, d: u => `ブロック${5 + 2 * u} 敵に弱体2`, f: async u => { gainBlock(5 + 2 * u); foeStatus('weak', 2); } },
  shout: { n: '一喝', c: 0, t: 'skl', r: 1, d: u => `敵に弱体${1 + u} ブロック3`, f: async u => { foeStatus('weak', 1 + u); gainBlock(3); } },
  // --- リソース系 ---
  sacrifice: { n: '捨て身', c: 0, t: 'skl', r: 2, d: u => `HP-3 +2⚡${u ? ' 1ドロー' : ''}`, f: async u => { RG.hp = Math.max(1, RG.hp - 3); CB.energy += 2; if (u) drawCards(1); renderCombat(); } },
  recall: { n: '想起', c: 1, t: 'skl', r: 1, d: u => `捨札からランダムに${1 + u}枚手札へ`, f: async u => { for (let k = 0; k < 1 + u && CB.discard.length; k++) CB.hand.push(CB.discard.splice(rand(CB.discard.length), 1)[0]); renderCombat(); } },
  library: { n: '書庫', c: [2, 1], t: 'pow', r: 3, d: () => '毎ターン+1ドロー', f: async () => { CB.powers.library = (CB.powers.library || 0) + 1; } },
  echo: { n: '反響', c: [3, 2], t: 'pow', r: 3, d: () => '毎ターン最初のカードを2回発動', f: async () => { CB.powers.echo = 1; } },
  // --- 出題系（リスクとリターン） ---
  study: { n: '猛勉強', c: 1, t: 'skl', r: 1, q: 1, d: u => `📖正解:知識+${2 + u}／外:なし`, f: async u => { if (await cardQuiz()) { CB.str += 2 + u; pfloat(`💪+${2 + u}`); renderCombat(); } } },
  barrage: { n: '連続論証', c: 2, t: 'atk', r: 2, q: 1, d: u => `📖正解:${8 + 2 * u}×3／外:${8 + 2 * u}`, f: async u => { const ok = await cardQuiz(); for (let k = 0; k < (ok ? 3 : 1); k++) await hit(8 + 2 * u); } },
  allin: { n: '一か八か', c: 0, t: 'skl', r: 2, q: 1, d: u => `📖正解:+${3 + u}⚡／外:手札を全て捨てる`, f: async u => { if (await cardQuiz()) { CB.energy += 3 + u; } else { CB.discard.push(...CB.hand); CB.hand = []; } renderCombat(); } },
  mastery: { n: '学びの喜び', c: 1, t: 'pow', r: 2, d: u => `📖正解するたび知識+1${u ? ' ブロック3' : ''}`, f: async u => { CB.powers.mastery = (CB.powers.mastery || 0) + 1; if (u) CB.powers.masteryBlk = (CB.powers.masteryBlk || 0) + 3; } },
  // ===== ロール専用カード（role が一致するときだけ報酬・商店に出る） =====
  // ⚔️ 剣闘士
  rage: { e: '😡', n: '怒り', c: 0, t: 'skl', r: 1, role: 'gladiator', d: u => `このターン攻撃するたびブロック${3 + 2 * u}`, f: async u => { CB.tmp.rage += 3 + 2 * u; pfloat('😡 怒り'); } },
  cleave: { e: '🪓', n: '薙ぎ払い', c: 1, t: 'atk', r: 1, role: 'gladiator', d: u => `${9 + 3 * u}ダメージ`, f: async u => { await hit(9 + 3 * u); } },
  flex: { e: '💪', n: '気合', c: 0, t: 'skl', r: 1, role: 'gladiator', d: u => `このターンのみ知識+${2 + 2 * u}`, f: async u => { CB.str += 2 + 2 * u; CB.tmp.flex += 2 + 2 * u; pfloat(`💪+${2 + 2 * u}`); renderCombat(); } },
  demon: { e: '😈', n: '悪魔化', c: 3, t: 'pow', r: 3, role: 'gladiator', d: u => `毎ターン知識+${2 + u}`, f: async u => { CB.powers.genius = (CB.powers.genius || 0) + 2 + u; } },
  // 🗡️ 毒使い
  shiv: { e: '🔪', n: '投げナイフ', c: 0, t: 'atk', r: -2, ex: 1, role: 'assassin', d: u => `${4 + 2 * u}ダメージ（廃棄）`, f: async u => { await hit(4 + 2 * u); } },
  blades: { e: '🗡️', n: '刃の雨', c: 1, t: 'skl', r: 1, role: 'assassin', d: u => `投げナイフを${3 + u}枚手札に`, f: async u => { for (let k = 0; k < 3 + u && CB.hand.length < 10; k++) CB.hand.push({ id: 'shiv', u: 0 }); renderCombat(); } },
  noxious: { e: '☁️', n: '毒霧', c: 1, t: 'pow', r: 2, role: 'assassin', d: u => `毎ターン敵に毒${2 + u}`, f: async u => { CB.powers.noxious = (CB.powers.noxious || 0) + 2 + u; } },
  backflip: { e: '🤸', n: '宙返り', c: 1, t: 'skl', r: 1, role: 'assassin', d: u => `ブロック${5 + 3 * u} 2ドロー`, f: async u => { gainBlock(5 + 3 * u); drawCards(2); renderCombat(); } },
  acrobat: { e: '🎪', n: '曲芸', c: 0, t: 'skl', r: 2, role: 'assassin', d: u => `${3 + u}ドロー 手札1枚を捨てる`, f: async u => { drawCards(3 + u); if (CB.hand.length) CB.discard.push(CB.hand.splice(rand(CB.hand.length), 1)[0]); renderCombat(); } },
  // 🔮 賢者
  oracle: { e: '🔮', n: '神託', c: 1, t: 'skl', r: 1, q: 1, role: 'sage', d: u => `📖正解:知識+1 ブロック${6 + 3 * u} 1ドロー`, f: async u => { if (await cardQuiz()) { CB.str++; gainBlock(6 + 3 * u); drawCards(1); renderCombat(); } } },
  epiphany: { e: '💡', n: '悟り', c: 2, t: 'pow', r: 2, role: 'sage', d: u => `📖正解するたび敵に${5 + 3 * u}ダメージ`, f: async u => { CB.powers.epiphany = (CB.powers.epiphany || 0) + 5 + 3 * u; } },
  meditate: { e: '🧘', n: '瞑想', c: 1, t: 'skl', r: 2, ex: 1, role: 'sage', d: u => `捨札の📖カードを全て手札へ${u ? ' +1⚡' : ''}（廃棄）`, f: async u => { const qs = CB.discard.filter(c => CARDS[c.id].q); CB.discard = CB.discard.filter(c => !CARDS[c.id].q); CB.hand.push(...qs.slice(0, 10 - CB.hand.length)); if (u) CB.energy++; renderCombat(); } },
  wisdom: { e: '📚', n: '叡智の一撃', c: 2, t: 'atk', r: 3, role: 'sage', d: u => `この戦闘の正解数×${3 + u}ダメージ`, f: async u => { await hit(CB.correctCount * (3 + u)); } },
  // 🛡️ 守護者
  ironskin: { e: '🦾', n: '鋼の肌', c: 1, t: 'pow', r: 2, role: 'guardian', d: u => `毎ターン開始時ブロック${4 + 2 * u}`, f: async u => { CB.powers.ironskin = (CB.powers.ironskin || 0) + 4 + 2 * u; } },
  counter: { e: '🛡️', n: '反撃の盾', c: 1, t: 'skl', r: 1, role: 'guardian', d: u => `ブロック${8 + 3 * u} 反撃+2`, f: async u => { gainBlock(8 + 3 * u); CB.powers.thorns = (CB.powers.thorns || 0) + 2; } },
  shieldwall: { e: '🧱', n: '盾の壁', c: 2, t: 'skl', r: 1, role: 'guardian', d: u => `ブロック${16 + 5 * u}`, f: async u => gainBlock(16 + 5 * u) },
  press: { e: '🫸', n: '押し返し', c: 1, t: 'atk', r: 2, role: 'guardian', d: u => `${4 + 2 * u}ダメ＋ブロックの半分`, f: async u => { await hit(4 + 2 * u + Math.floor(CB.block / 2)); } },
  // 🃏 道化師
  dice: { e: '🎲', n: 'サイコロ', c: 1, t: 'atk', r: 1, role: 'jester', d: u => `1〜${12 + 4 * u}ダメージ×2`, f: async u => { for (let k = 0; k < 2; k++) await hit(1 + rand(12 + 4 * u)); } },
  jackpot: { e: '🎰', n: '大当たり', c: 1, t: 'atk', r: 1, q: 1, role: 'jester', d: u => `📖正解:${28 + 10 * u}ダメ／外:自分に5ダメ`, f: async u => { if (await cardQuiz()) await hit(28 + 10 * u); else { RG.hp = Math.max(1, RG.hp - 5); pfloat('💥-5', '#ff5c7a'); renderCombat(); } } },
  reshuffle: { e: '🔀', n: 'シャッフル', c: 0, t: 'skl', r: 1, role: 'jester', d: u => `手札を全て捨て同じ枚数${u ? '+1枚' : ''}引く`, f: async u => { const n = CB.hand.length + u; CB.discard.push(...CB.hand); CB.hand = []; drawCards(n); renderCombat(); } },
  luck: { e: '🍀', n: '強運', c: 1, t: 'pow', r: 2, role: 'jester', d: u => `★★★を外しても${3 + u}⚡`, f: async u => { CB.powers.luck = Math.max(CB.powers.luck || 0, 3 + u); } },
  // --- 呪い ---
  confuse: { n: '混乱', c: -1, t: 'curse', r: -1, d: () => '使用不可。邪魔なだけ', f: async () => { } },
  doubt: { n: '迷い', c: -1, t: 'curse', r: -1, d: () => '使用不可。手札にあるとターン終了時HP-2', f: async () => { } },
};
const cardCost = c => { if (c.free) return 0; const x = CARDS[c.id].c; return x === 'X' ? (CB ? CB.energy : 0) : Array.isArray(x) ? x[c.u] : x; };
const STARTER = [...Array(5).fill('strike'), ...Array(4).fill('defend'), 'insight'];
const basic = (s, d) => [...Array(s).fill('strike'), ...Array(d).fill('defend')];
// ロール（キャラクター）。学徒以外はロール召喚（ガチャ）で入手。重複するとランクUP（最大HP+3／ランク）
const ROLES = {
  scholar: { n: '学徒', e: '🎓', rar: 'N', hp: 60, relic: 'notebook', deck: STARTER, desc: 'バランス型。知識チャージで着実に強くなる' },
  gladiator: { n: '剣闘士', e: '⚔️', rar: 'R', hp: 75, relic: 'blood', deck: [...basic(5, 4), 'bash'], desc: '高HPと重い一撃。戦闘後に回復し、力押しで登る' },
  guardian: { n: '守護者', e: '🛡️', rar: 'R', hp: 70, relic: 'bulwark', deck: [...basic(4, 5), 'slam'], desc: '鉄壁の防御。積み上げたブロックを攻撃に変える' },
  assassin: { n: '毒使い', e: '🗡️', rar: 'SR', hp: 62, relic: 'ring', deck: [...basic(4, 4), 'toxin', 'blades'], desc: '毒と投げナイフ。手数で削り切る' },
  sage: { n: '賢者', e: '🔮', rar: 'SR', hp: 62, relic: 'tablet', deck: [...basic(4, 4), 'insight', 'oracle'], desc: '📖出題カードの達人。正解するほど手が付けられなくなる' },
  jester: { n: '道化師', e: '🃏', rar: 'SSR', hp: 60, relic: 'coin', deck: [...basic(4, 4), 'dice', 'jackpot'], desc: '運と度胸。一か八かの大勝負で戦う' },
};
const ROLE_COST = 300, ROLE_PITY = 10, ROLE_MAX_RANK = 5;
const myRoles = () => S.roles || (S.roles = { scholar: 0 });

// ---------- 遺物 ----------
const RRELICS = {
  pot: { e: '🏺', n: '古代の壺', d: '戦闘開始時ブロック8' },
  scroll: { e: '📜', n: '古文書', d: '知識チャージに正解すると1ドロー' },
  scarab: { e: '🪲', n: 'スカラベ', d: '戦闘終了時HP5回復' },
  flame: { e: '🔥', n: '情熱の炎', d: '★★★正解時さらに+1⚡' },
  scale: { e: '⚖️', n: '真理の天秤', d: '戦闘開始時 知識+1' },
  eye: { e: '👁️', n: 'ホルスの目', d: '戦闘開始時 敵に脆弱2' },
  compass: { e: '🧭', n: '羅針盤', d: 'ショップ価格25%オフ' },
  stone: { e: '💎', n: '賢者の石', d: '最大HP+12', on: () => { RG.maxHp += 12; RG.hp += 12; } },
  lamp: { e: '🪔', n: '知恵のランプ', d: '1ターン目+1⚡' },
  feather: { e: '🪶', n: 'マアトの羽', d: '不正解でも最低2⚡' },
  idol: { e: '🏆', n: '黄金の像', d: '戦闘のゴールド+50%' },
  book: { e: '📕', n: '百科事典', d: 'カード報酬の選択肢+1' },
  hourglass: { e: '⏳', n: '砂時計', d: '3ターン目から毎ターン開始時ブロック4' },
  // ボス遺物（1層目のボス撃破時に3択。ランダム入手しない）
  crown: { e: '👑', n: '知恵の王冠', d: '毎ターン+1⚡ ／ カード報酬の選択肢-1', boss: 1 },
  sozu: { e: '⚱️', n: '封印の壺', d: '毎ターン+1⚡ ／ 休憩所で回復できない', boss: 1 },
  velvet: { e: '📿', n: '天鵞絨の首飾り', d: '毎ターン+1⚡ ／ 1ターンに6枚までしか使えない', boss: 1 },
  mark: { e: '🩻', n: '痛みの刻印', d: '毎ターン+1⚡ ／ 戦闘開始時、山札に混乱2枚', boss: 1 },
  astrolabe: { e: '🔭', n: '星見の器', d: '毎ターン+1ドロー', boss: 1 },
  runic: { e: '🔺', n: 'ルーンの角錐', d: 'ターン終了時に手札を捨てない', boss: 1 },
  ginseng: { e: '🌿', n: '生命の霊薬', d: '最大HP+20・全回復', boss: 1, on: () => { RG.maxHp += 20; RG.hp = RG.maxHp; } },
  // ロールの初期遺物（ランダム入手しない）
  notebook: { e: '📓', n: '学徒の手帳', d: '1ターン目+1ドロー', starter: 1 },
  blood: { e: '🩸', n: '闘士の血', d: '戦闘終了時HP6回復', starter: 1 },
  bulwark: { e: '🏰', n: '守護の紋章', d: '戦闘開始時ブロック8', starter: 1 },
  ring: { e: '💍', n: '毒蛇の指輪', d: '戦闘開始時 敵に毒4・1ターン目+2ドロー', starter: 1 },
  tablet: { e: '🪧', n: '賢者の石板', d: '★★★正解で知識+2 ／ 📖カード正解で1ドロー', starter: 1 },
  coin: { e: '🪙', n: '幸運のコイン', d: '★★★を外しても2⚡ ／ 戦闘のゴールド+20%', starter: 1 },
};
const hasR = id => RG && RG.relics.includes(id);

// ---------- 敵 ----------
// move: atk/times/block/str/weak/vuln（weak/vuln はプレイヤーへ）
const FOES = {
  fog: { n: '忘却の霧', e: '👻', hp: 24, moves: [{ atk: 6 }, { atk: 5, weak: 1 }, { block: 6, atk: 4 }] },
  scorp: { n: '誤解のサソリ', e: '🦂', hp: 22, moves: [{ atk: 4, times: 2 }, { atk: 9 }, { str: 2 }] },
  snake: { n: '迷信の蛇', e: '🐍', hp: 30, moves: [{ atk: 7 }, { block: 8, atk: 3 }, { str: 2 }, { atk: 11 }] },
  spider: { n: '偏見の蜘蛛', e: '🕷️', hp: 26, moves: [{ vuln: 2 }, { atk: 10 }, { atk: 6, weak: 1 }] },
  bat: { n: '噂のコウモリ', e: '🦇', hp: 18, moves: [{ atk: 3, times: 3 }, { atk: 5 }] },
  golem: { n: '頑固な岩人形', e: '🪨', hp: 36, moves: [{ block: 10 }, { atk: 12 }, { atk: 8, block: 5 }] },
};
const ELITES = {
  oni: { n: '詭弁の鬼', e: '👺', hp: 58, moves: [{ atk: 14 }, { str: 3, block: 6 }, { atk: 6, times: 2 }] },
  dragon: { n: '混沌の竜', e: '🐲', hp: 66, moves: [{ atk: 16 }, { block: 14, weak: 2 }, { atk: 5, times: 3, vuln: 1 }] },
  mummy: { n: '俗説のミイラ', e: '🧟', hp: 54, moves: [{ atk: 9, weak: 2 }, { atk: 16 }, { str: 2, block: 10 }] },
};
// 1層目のボス（門番）
const HP_PER_FLOOR = .04, ATK_PER_FLOOR = .02;
const GATE = { e: '🚪', hp: 105, cycle: true, moves: [{ atk: 7, times: 2 }, { block: 12, str: 1 }, { atk: 17 }, { weak: 1, vuln: 1, atk: 5 }] };
const BOSS = { e: '🗿', hp: 140, cycle: true, moves: [{ atk: 8, times: 2 }, { block: 16, str: 2 }, { atk: 22 }, { weak: 2, vuln: 2, atk: 6 }] };

// ---------- イベント ----------
const NODE_ICON = { fight: '⚔️', elite: '👺', event: '❓', rest: '🔥', shop: '🛒', chest: '💰', boss: '🗿' };
const NODE_NAME = { fight: '戦闘', elite: 'エリート', event: '？', rest: '休憩', shop: '商店', chest: '宝箱', boss: 'ボス' };

// ---------- 状態 ----------
let RG = null, CB = null;
// 難易度（アセンションとは別に選べる）
const DIFFS = {
  normal: { n: 'ふつう', e: '🙂', hpMul: 1, atkMul: 1, eliteBoost: 0, missE: 2, qTime: 0, restHeal: .3, startHp: 0, curse: 0, boss2: false, score: 1, desc: '標準の難易度' },
  // betLoss：★★★を外したときに知識（攻撃力）がこの戦闘中だけ下がる量。★★の外しも1⚡になる難易度で、賭けのリスクを残すため
  hard: { n: 'むずかしい', e: '😤', hpMul: 1.25, atkMul: 1.15, eliteBoost: .04, missE: 1, betLoss: 1, qTime: 0, restHeal: .3, startHp: 0, curse: 0, boss2: false, score: 1.5, desc: '敵HP+25%・攻撃+15%（上の階ほど） ／ ★★を外すと1⚡・★★★を外すと知識-1 ／ エリート少し増' },
  oni: { n: '鬼', e: '👹', hpMul: 1.35, atkMul: 1.18, eliteBoost: .05, missE: 1, betLoss: 1, qTime: 0, restHeal: .25, startHp: 0, curse: 1, boss2: true, score: 2.5, desc: '敵HP+35%・攻撃+18%（上の階ほど） ／ ★★★を外すと知識-1 ／ 呪い入りデッキ ／ 休憩の回復減 ／ 最後のボスに第2形態' },
};
const DIFF = () => DIFFS[(RG && RG.diff) || 'normal'];
// テーマごとの世界観（名前と絵文字だけ差し替える。効果は共通）
const SK = () => { const t = RG ? THEMES.find(x => x.id === RG.tid) : TT; return (t && t.rogue) || {}; };
const cName = id => (SK().cards && SK().cards[id] && SK().cards[id].n) || CARDS[id].n;
const cEmoji = id => (SK().cards && SK().cards[id] && SK().cards[id].e) || CARDS[id].e || '';
const rlc = id => { const o = SK().relics && SK().relics[id]; return { ...RRELICS[id], ...(o ? { n: o.n, e: o.e || RRELICS[id].e } : {}) }; };
const poisonSt = () => (SK().status && SK().status.poison) || { n: '毒', e: '☠️' };
// ダンジョン（テーマに rogue.dungeons があれば、分野ごとの塔を選べる）
let RGD = null; // 入口で選択中のダンジョン
const dungeons = () => SK().dungeons || [];
const DG = () => { const id = RG ? RG.dg : RGD; return dungeons().find(d => d.id === id) || null; };
const dgChapters = t => (DG() && DG().chapters) || t.chapters.map((_, i) => i);
const metaKey = (tid, dg) => dg ? `${tid}:${dg}` : tid;
const towerName = () => (DG() && DG().n) || SK().tower || '知の塔';
const heroE = () => (DG() && DG().e) || SK().hero || '🏛️';
const bossName = t => (DG() && DG().boss && DG().boss.n) || (SK().boss && SK().boss.n) || `${t.title}の番人`;
const bossE = () => (DG() && DG().boss && DG().boss.e) || (SK().boss && SK().boss.e) || BOSS.e;
const rTheme = () => THEMES.find(t => t.id === RG.tid);
const rMeta = tid => { S.rgMeta = S.rgMeta || {}; const m = S.rgMeta[tid] || (S.rgMeta[tid] = { best: 0, wins: 0, asc: 0, runs: 0 }); m.wins_ = m.wins_ || {}; return m; };
function saveRun() { S.rgRun = RG; save(); }

// ============================================================
//  入口
// ============================================================
let RGE = null; // 入口画面で選択中のテーマ
function rogueEntry(tid) {
  const t = THEMES.find(x => x.id === tid) || THEMES[0];
  tid = t.id; RGE = tid; TT = t; RG = null; S.towerTid = tid; S.tab = 'tower';
  const ds = dungeons();
  const winsOf = d => rMeta(metaKey(tid, d.id)).wins || 0;
  const cleared = ds.filter(d => winsOf(d) > 0).length;
  const locked = d => d.unlock && cleared < d.unlock && !winsOf(d);
  S.rgDgSel = S.rgDgSel || {};
  RGD = ds.length ? (ds.find(d => d.id === S.rgDgSel[tid] && !locked(d)) || ds[0]).id : null;
  const m = rMeta(metaKey(tid, RGD));
  const cont = S.rgRun && S.rgRun.tid === tid;
  const dgRun = cont && S.rgRun.dg && ds.find(d => d.id === S.rgRun.dg);
  const runElsewhere = S.rgRun && S.rgRun.tid !== tid && THEMES.find(x => x.id === S.rgRun.tid);
  const asc = Math.min(m.asc, RG_MAX_ASC), ascSel = S.rgAscSel ?? asc;
  const chs = dgChapters(t), qn = chs.reduce((s, i) => s + t.chapters[i].questions.length, 0);
  screen = 'rg-entry';
  // テーマ切り替え（横に並ぶチップ）
  const themes = `<div class="tchips">${THEMES.map(x => `<button class="tchip ${x.id === tid ? 'on' : ''}" style="--c:${x.color}" data-act="rgtheme:${x.id}">
    <span>${x.icon}</span>${esc(x.title.replace(/の謎$/, ''))}${S.rgRun && S.rgRun.tid === x.id ? '<i>●</i>' : ''}</button>`).join('')}</div>`;
  const picker = ds.length && !cont ? `<div class="dgs">${ds.map(d => {
    const mm = rMeta(metaKey(tid, d.id)), lk = locked(d);
    return `<button class="dg ${RGD === d.id ? 'on' : ''} ${lk ? 'locked' : ''}" data-act="${lk ? 'rgdglock:' + d.unlock : 'rgdg:' + d.id}">
      <span class="dge">${lk ? '🔒' : d.e}</span><span class="dgn">${esc(d.n.replace(/の塔$/, ''))}</span>${mm.wins ? '<i>👑</i>' : ''}</button>`;
  }).join('')}</div>` : '';
  const hero = `<div class="tower-hero" style="--c:${t.color}">
    <div class="th-e">${heroE()}</div>
    <div class="th-b"><div class="th-n">${esc(towerName())}</div>
      <div class="th-d">${DG() && DG().desc ? esc(DG().desc) : `${chs.length < t.chapters.length ? '' : '全'}${qn}問から出題`}</div>
      <div class="th-boss">頂上：<b>${esc(bossName(t))}</b></div>
      <div class="tstats"><span>最高 <b>${m.best}</b>階</span><span>踏破 <b>${m.wins}</b></span><span>挑戦 <b>${m.runs}</b></span></div></div>
    <button class="howbtn" data-act="rghow">❓</button></div>`;
  const body = cont
    ? `<div class="contbox"><div class="ghost">挑戦中</div><div class="cont-l">${ROLES[S.rgRun.role || 'scholar'].e} ${dgRun ? dgRun.e + ' ' + esc(dgRun.n) + ' ・ ' : ''}${S.rgRun.at ? S.rgRun.at.f + 1 : 0}階 ・ ❤${S.rgRun.hp}/${S.rgRun.maxHp}</div></div>
      <button class="btn primary big wide" data-act="rgcont">▶ 続きから</button>
      <button class="btn wide" data-act="rgabandon">🏳️ 放棄して新しく始める</button>`
    : `${rolePicker()}
      <div class="diffrow"><div class="diffs">${Object.entries(DIFFS).map(([k, d]) => `<button class="diff ${(S.rgDiffSel || 'normal') === k ? 'on' : ''}" data-act="rgdiff:${k}">${d.e} ${d.n}${m.wins_[k] ? '<i>👑</i>' : ''}</button>`).join('')}</div>
        <div class="asc"><button data-act="rgasc:-1">◀</button><b>A${ascSel}</b><button data-act="rgasc:1">▶</button></div></div>
      <div class="ghost diffdesc">${DIFFS[S.rgDiffSel || 'normal'].desc}${ascSel ? ` ／ アセンション${ascSel}：敵+${ascSel * 8}%` : ''}</div>
      ${runElsewhere ? `<div class="ghost diffdesc">⚠️ ${runElsewhere.icon}${esc(runElsewhere.title)} で挑戦中のランは、新しく始めると放棄されます</div>` : ''}
      <button class="btn primary big wide" data-act="rgnew">⚔️ 挑戦開始</button>`;
  app.innerHTML = `${hud()}${themes}${picker}${hero}${body}`;
}
function rgNewRun(tid) {
  const m = rMeta(metaKey(tid, RGD));
  const asc = Math.min(S.rgAscSel ?? m.asc, m.asc);
  RG = {
    tid, dg: RGD, asc, diff: S.rgDiffSel || 'normal', hp: RG_HP, maxHp: RG_HP, gold: 99, deck: [], relics: [],
    map: genMap(DIFFS[S.rgDiffSel || 'normal'].eliteBoost), at: null, cur: null, path: [], recentQ: [], claimsUsed: [],
    stats: { correct: 0, wrong: 0, kills: 0, streak: 0, best: 0, cards: 0 }, blessed: false,
  };
  const rid = myRoles()[S.rgRoleSel] != null ? S.rgRoleSel : 'scholar', role = ROLES[rid];
  RG.role = rid; RG.deck = role.deck.map(id => ({ id, u: 0 })); RG.relics = [role.relic];
  RG.hp = RG.maxHp = role.hp + 3 * (myRoles()[rid] || 0) + DIFF().startHp - (asc >= 5 ? 5 : 0);
  for (let k = 0; k < DIFF().curse; k++) RG.deck.push({ id: 'confuse', u: 0 });
  m.runs++; saveRun();
  renderBlessing();
}
const MID_F = Math.floor((RG_FLOORS - 1) / 2), REST_F = RG_FLOORS - 2;
function genMap(boost = 0) {
  const map = [];
  for (let f = 0; f < RG_FLOORS - 1; f++) {
    const row = [];
    for (let c = 0; c < 3; c++) row.push({ t: nodeType(f, boost), n: [] });
    // 同じ階で全部同じ種類にならないように
    if (f > 0 && f !== MID_F && f !== REST_F && row.every(x => x.t === row[0].t)) row[1].t = 'fight';
    map.push(row);
  }
  for (let f = 0; f < RG_FLOORS - 2; f++) {
    for (let c = 0; c < 3; c++) {
      const opts = [c]; if (c > 0 && Math.random() < .5) opts.push(c - 1); if (c < 2 && Math.random() < .5) opts.push(c + 1);
      map[f][c].n = [...new Set(opts)].sort();
    }
    for (let c = 0; c < 3; c++) if (!map[f].some(x => x.n.includes(c))) map[f][c].n.push(c);
  }
  return map;
}
function nodeType(f, boost = 0) {
  if (f === 0) return 'fight';
  if (f === MID_F) return 'chest';
  if (f === REST_F) return 'rest';
  const r = Math.random();
  if (f >= 3 && r < .14 + boost) return 'elite';
  if (r < .38) return 'event';
  if (r < .50 && f >= 2) return 'rest';
  if (r < .60) return 'shop';
  return 'fight';
}

// ---------- 開始の祝福（Neow風） ----------
function renderBlessing() {
  screen = 'rg-bless';
  const all = [
    { id: 'hp', t: '❤️ 最大HP +10' },
    { id: 'rare', t: '🃏 ランダムなレアカードを1枚' },
    { id: 'relic', t: '🏺 ランダムな遺物を1つ' },
    { id: 'gold', t: '💰 150ゴールド' },
    { id: 'remove', t: '✂️ 初期カードを1枚削除' },
    { id: 'upgrade', t: '⬆️ ランダムなカード2枚を強化' },
  ];
  RG.blessOpts = shuffle(all).slice(0, 3);
  app.innerHTML = `<div class="relic-head"><div class="bigemoji">${heroE()}</div><h2>${esc(towerName())}の入口</h2><p class="ghost">古の声が告げる。「学ぶ者よ、ひとつ授けよう」</p></div>
    <div class="relics">${RG.blessOpts.map((b, i) => `<button class="relic" data-act="rgbless:${i}"><div><b>${b.t}</b></div><span class="k">${i + 1}</span></button>`).join('')}</div>`;
}
function takeBlessing(i) {
  const b = RG.blessOpts[i]; if (!b) return;
  delete RG.blessOpts;
  if (b.id === 'hp') { RG.maxHp += 10; RG.hp += 10; }
  if (b.id === 'rare') addCard(randCard(3));
  if (b.id === 'relic') gainRelic();
  if (b.id === 'gold') RG.gold += 150;
  if (b.id === 'upgrade') shuffle(RG.deck.filter(c => !c.u && CARDS[c.id].t !== 'curse')).slice(0, 2).forEach(c => c.u = 1);
  saveRun(); sfx.coin();
  if (b.id === 'remove') return pickCard('削除するカードを選ぶ', c => CARDS[c.id].r === 0, c => { RG.deck.splice(RG.deck.indexOf(c), 1); saveRun(); renderMap(); });
  renderMap();
}

// ============================================================
//  マップ
// ============================================================
function availNodes() {
  if (RG.cur) return [RG.cur];
  if (!RG.at) return [0, 1, 2].map(c => ({ f: 0, c }));
  if (RG.at.f === RG_FLOORS - 2) return [{ f: RG_FLOORS - 1, c: 1 }];
  return RG.map[RG.at.f][RG.at.c].n.map(c => ({ f: RG.at.f + 1, c }));
}
const nodeAt = (f, c) => f === RG_FLOORS - 1 ? { t: 'boss', n: [] } : RG.map[f][c];
function rgHeader() {
  return `<div class="rghud"><span title="${esc(ROLES[RG.role || 'scholar'].n)}">${ROLES[RG.role || 'scholar'].e}</span><span class="hpp">❤️ ${RG.hp}/${RG.maxHp}</span><span>💰 ${RG.gold}</span>
    <button class="pill" data-act="rgdeck">🃏 ${RG.deck.length}</button>
    <span class="rel">${RG.relics.map(r => `<i title="${esc(rlc(r).n)}：${esc(rlc(r).d)}" data-act="rgrelic:${r}">${rlc(r).e}</i>`).join('')}</span>
    <span class="ghost">${DIFF().e}${RG.asc ? ` A${RG.asc}` : ''}</span></div>`;
}
function renderMap() {
  screen = 'rg-map'; document.body.classList.remove('fever-bg');
  // 画面の高さに合わせて階の間隔を詰める（スクロールせずに塔全体が見える）
  const t = rTheme(), av = availNodes(), H = Math.max(40, Math.min(74, Math.floor((innerHeight - 250) / RG_FLOORS))), top = 34, height = RG_FLOORS * H + top;
  const X = c => [18, 50, 82][c], Y = f => (RG_FLOORS - 1 - f) * H + top;
  const isAv = (f, c) => av.some(a => a.f === f && a.c === c);
  const visited = (f, c) => RG.path.some(p => p.f === f && p.c === c);
  let lines = '';
  for (let f = 0; f < RG_FLOORS - 1; f++) for (let c = 0; c < 3; c++) {
    const nx = f === RG_FLOORS - 2 ? [1] : RG.map[f][c].n;
    nx.forEach(c2 => {
      const on = visited(f, c) && (visited(f + 1, c2) || (RG.at && RG.at.f === f && RG.at.c === c && isAv(f + 1, c2)));
      lines += `<line x1="${X(c)}" y1="${Y(f)}" x2="${f === RG_FLOORS - 2 ? 50 : X(c2)}" y2="${Y(f + 1)}" class="${on ? 'on' : ''}"/>`;
    });
  }
  let nodes = '';
  for (let f = 0; f < RG_FLOORS; f++) for (let c = 0; c < 3; c++) {
    if (f === RG_FLOORS - 1 && c !== 1) continue;
    const n = nodeAt(f, c), a = isAv(f, c), v = visited(f, c);
    nodes += `<button class="mnode ${n.t} ${a ? 'av' : ''} ${v ? 'vis' : ''}" style="left:${X(c)}%;top:${Y(f)}px" data-act="${a ? `rgnode:${f}-${c}` : 'rgnoop'}" title="${NODE_NAME[n.t]}">${NODE_ICON[n.t]}</button>`;
  }
  app.innerHTML = `<div class="title"><button class="back" data-act="rgback">←</button><h2>${heroE()} ${esc(towerName())} <small class="actl">第${actOf() + 1}層</small> ${RG.at ? gFloor(RG.at.f) : actOf() * RG_FLOORS}階</h2></div>
    ${rgHeader()}
    <div class="tmap" style="height:${height}px;--nd:${Math.min(48, H - 4)}px"><svg viewBox="0 0 100 ${height}" preserveAspectRatio="none">${lines}</svg>${nodes}
      <div class="boss-label" style="top:${Y(RG_FLOORS - 1) - 36}px">${t.icon} ${esc(bossName(t))}</div></div>
    <div class="legend">${Object.keys(NODE_ICON).map(k => `<span>${NODE_ICON[k]}${NODE_NAME[k]}</span>`).join('')}</div>`;
  const first = $('.mnode.av');
  if (first) setTimeout(() => first.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
}
function enterNode(f, c) {
  if (!availNodes().some(a => a.f === f && a.c === c)) return;
  RG.cur = { f, c }; saveRun();
  const t = nodeAt(f, c).t;
  tone(520, .08, 'triangle', .1);
  if (t === 'fight' || t === 'elite' || t === 'boss') return startCombat(t);
  if (t === 'event') return renderEvent();
  if (t === 'rest') return renderRest();
  if (t === 'shop') return renderShop();
  if (t === 'chest') return renderChest();
}
function completeNode() {
  RG.path.push(RG.cur); RG.at = RG.cur; RG.cur = null;
  const m = rMeta(metaKey(RG.tid, RG.dg)); m.best = Math.max(m.best, gFloor(RG.at.f));
  saveRun(); renderMap();
}

// ============================================================
//  出題（オーバーレイ）
// ============================================================
function pickQ() {
  const t = rTheme(), s = tsrs(), all = [];
  dgChapters(t).forEach(ci => t.chapters[ci].questions.forEach((q, qi) => all.push({ key: qKey(t, ci, qi), q })));
  const pool = all.filter(x => !RG.recentQ.includes(x.key));
  const wrong = pool.filter(x => s[x.key] && s[x.key].b === 0), fresh = pool.filter(x => !s[x.key]);
  const r = Math.random();
  const g = wrong.length && r < .3 ? wrong : fresh.length && r < .8 ? fresh : pool.length ? pool : all;
  const it0 = g[rand(g.length)], it = { ...it0, q: maybeHilo(it0.q, .3) };
  RG.recentQ.push(it.key); if (RG.recentQ.length > 25) RG.recentQ.shift();
  return it;
}
let QOV = null;
function ask(item, opt = {}) {
  return new Promise(resolve => {
    const q = item.q, ov = document.createElement('div');
    ov.className = 'qov';
    const st = { conf: 2, done: false };
    const bet = opt.bet ? `<div class="confs two">${[2, 3].map(n => `<button class="conf c${n} ${n === 2 ? 'on' : ''}" data-q="cf:${n}">${n === 2 ? `★★ 普通<small>正解3⚡ ／ 外${DIFF().missE}⚡</small>` : `★★★ 確信<small>正解4⚡+知識1 ／ 外1⚡${DIFF().betLoss ? `・知識-${DIFF().betLoss}` : ''}</small>`}</button>`).join('')}</div>` : '';
    const lim = DIFF().qTime;
    ov.innerHTML = `<div class="qin"><div class="qtitle">${esc(opt.title || '📖 出題')}</div>
      <div class="qbox tq"><div class="ask">${TYPE_LABEL[q.type]}</div><div class="q ${q.code || q.q.length > 28 ? 'long' : ''}">${qText(q)}</div>
      ${lim ? `<div class="qtimer"><i class="qlim"></i></div>` : ''}</div>
      ${bet}<div class="qans"></div><div class="qfb"></div></div>`;
    document.body.appendChild(ov);
    const finish = res => {
      if (st.done) return; st.done = true; clearTimeout(st.limT);
      const ok = !!res.ok;
      srsUpdate(item.key, ok, st.conf);
      if (CB) {
        CB.lastOk = ok;
        if (ok) CB.correctCount++;
        if (ok && CB.powers.epiphany) { CB.foe.hp = Math.max(0, CB.foe.hp - CB.powers.epiphany); const fe = $('#foe'); if (fe) { const rc = fe.getBoundingClientRect(); floatText(`✨悟り-${CB.powers.epiphany}`, rc.left + rc.width / 2, rc.top + 80, '#b18cff', 24); } }
        if (ok && CB.powers.mastery) { CB.str += CB.powers.mastery; CB.block += CB.powers.masteryBlk || 0; }
      }
      if (ok) { RG.stats.correct++; RG.stats.streak++; RG.stats.best = Math.max(RG.stats.best, RG.stats.streak); } else { RG.stats.wrong++; RG.stats.streak = 0; }
      const label = res.timeout ? '⏰ 時間切れ！' : ok ? (st.conf === 3 ? '💎 確信的中！' : '⭕ 正解！') : res.near ? '😣 ' + res.msg : (st.conf === 3 ? '💥 確信が外れた…' : '❌ ざんねん');
      if (ok) { sfx.ok(RG.stats.streak); burst(innerWidth / 2, innerHeight / 3, st.conf === 3 ? 26 : 12); if (st.conf === 3) { document.body.classList.add('flash'); setTimeout(() => document.body.classList.remove('flash'), 150); } }
      else { sfx.ng(); ov.querySelector('.qbox').classList.add('shake'); }
      const tb = ov.querySelector('.qlim'); if (tb) tb.style.animationPlayState = 'paused';
      ov.querySelectorAll('.conf').forEach(b => b.disabled = true);
      ov.querySelector('.qfb').innerHTML = `<div class="feedback ${ok ? 'good' : res.near ? 'near' : 'bad'}"><div class="fl">${label}</div>
        ${res.msg && ok ? `<div class="fm">${esc(res.msg)}</div>` : ''}
        ${ok && q.type !== 'order' && q.type !== 'match' ? '' : `<div class="fa">正解：<b>${esc(correctText(q))}</b></div>`}
        <div class="fe">${esc(q.explain || '')}</div>
        <button class="btn ${ok ? '' : 'primary'}" style="width:100%;margin-top:10px" data-q="go">続ける ▶<span class="sub">Enter</span></button>
        ${ok ? '<div class="autobar"><i style="animation-duration:2.2s"></i></div>' : ''}</div>`;
      ov.querySelector('.qfb').scrollIntoView({ block: 'nearest' });
      st.res = { ok, near: !!res.near, conf: st.conf };
      if (ok) st.timer = setTimeout(close, 2200);
    };
    const w = quizWidget(ov.querySelector('.qans'), q, { onDone: finish });
    // 難易度による制限時間（時間切れ＝不正解）
    if (lim) {
      const tb = ov.querySelector('.qlim'); tb.style.animation = `shrink ${lim}s linear forwards`;
      st.limT = setTimeout(() => { if (!st.done && ov.isConnected && RG) { w.st.done = true; finish({ ok: false, timeout: true }); } }, lim * 1000);
    }
    const close = () => { clearTimeout(st.timer); if (!ov.isConnected) return; ov.remove(); QOV = null; resolve(st.res); };
    const act = key => {
      const [k, v] = key.split(':');
      if (k === 'go') return st.done && close();
      if (st.done) return;
      if (k === 'cf') { st.conf = +v; ov.querySelectorAll('.conf').forEach(b => b.classList.toggle('on', b.classList.contains('c' + v))); tone(500 + st.conf * 150, .05, 'square', .04); }
    };
    ov.addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) { e.stopPropagation(); act(b.dataset.q); } });
    QOV = { q, st, w, act, key: e => {
      const k = e.key;
      if (st.done) { if (k === 'Enter' || k === ' ') { e.preventDefault(); close(); } return; }
      if (w.key(e)) { e.preventDefault(); return; }
      if (opt.bet && (k === 'q' || k === 'w')) act('cf:' + (k === 'q' ? 2 : 3));
    } };
  });
}
async function cardQuiz() { const r = await ask(pickQ(), { title: '📖 カードの力を引き出せ' }); if (r.ok && CB && hasR('tablet')) drawCards(1); if (r.ok && CB && CB.powers.sutra && !CB.tmp.sutra) { CB.tmp.sutra = true; CB.energy += CB.powers.sutra; pfloat(`📜+${CB.powers.sutra}⚡`); } return r.ok; }

// ============================================================
//  戦闘
// ============================================================
function falseClaim() {
  const t = rTheme(), list = [];
  dgChapters(t).forEach(ci => t.chapters[ci].questions.forEach(q => { if (q.type === 'tf' && q.a === false) list.push(q); }));
  const fresh = list.filter(q => !RG.claimsUsed.includes(q.q));
  const pick = (fresh.length ? fresh : list)[rand((fresh.length ? fresh : list).length)];
  if (pick) RG.claimsUsed.push(pick.q);
  return pick || null;
}
function startCombat(kind) {
  const t = rTheme(), f = RG.cur.f;
  let base, claim = null;
  const sk = SK();
  if (kind === 'boss') base = lastAct() ? { ...BOSS, n: bossName(t), e: bossE() } : { ...GATE, n: `${towerName()}の門番` };
  else {
    const pool = kind === 'elite' ? ELITES : FOES, skin = kind === 'elite' ? sk.elites : sk.foes;
    if (skin && skin.length) { const x = skin[rand(skin.length)]; base = { ...(pool[x.base] || pool[Object.keys(pool)[0]]), n: x.n, e: x.e }; }
    else { const ids = Object.keys(pool); base = pool[ids[rand(ids.length)]]; }
    claim = falseClaim();
  }
  // ボスは階層補正なし（基礎値そのもの）。通常敵は上の階ほど強い
  const fl = kind === 'boss' ? 0 : gFloor(f) - 1, asc = 1 + 0.08 * RG.asc, D = DIFF();
  // 難易度の上乗せは序盤は控えめ（4割）→ 2層目に入るころ満額。1層目の門番は7割、最後のボスも7割（鬼は第2形態があるため）
  const ramp = kind === 'boss' ? (lastAct() ? .7 : .7) : .4 + .6 * Math.min(1, fl / RG_FLOORS), dHp = 1 + (D.hpMul - 1) * ramp, dAtk = 1 + (D.atkMul - 1) * ramp;
  const hp = Math.round(base.hp * (1 + HP_PER_FLOOR * fl) * asc * dHp * (0.95 + Math.random() * 0.1));
  CB = {
    kind, foe: { ...base, hp, maxHp: hp, block: 0, str: 0, weak: 0, vuln: 0, poison: 0, mi: -1, claim, atkMul: (1 + ATK_PER_FLOOR * fl) * asc * dAtk },
    draw: shuffle([...RG.deck, ...(hasR('mark') ? [{ id: 'confuse', u: 0 }, { id: 'confuse', u: 0 }] : [])].map((c, i) => ({ ...c, uid: i }))), hand: [], discard: [], exhaust: [],
    energy: 0, block: 0, str: 0, weak: 0, vuln: 0, powers: {}, turn: 0, busy: true, lastOk: false, played: 0, correctCount: 0, tmp: { rage: 0, flex: 0 }, dex: 0, chips: 0, stance: null, nextBlock: 0,
  };
  if (hasR('scale')) CB.str++;
  if (hasR('eye')) CB.foe.vuln = 2;
  nextIntent();
  screen = 'rg-combat';
  renderCombat();
  if (kind !== 'fight') { sfx.fever(); toast(kind === 'boss' ? `🗿 ${base.n} が立ちはだかる！` : `👺 エリート：${base.n}`); }
  if (window.SIM) Promise.resolve().then(startTurn); else setTimeout(startTurn, 500);
}
function nextIntent() {
  const f = CB.foe, n = f.moves.length;
  if (f.cycle) f.mi = (f.mi + 1) % n;
  else { let i; do i = rand(n); while (n > 1 && i === f.mi); f.mi = i; }
}
const foeDmg = a => Math.floor((a * CB.foe.atkMul + CB.foe.str) * (CB.foe.weak ? .75 : 1) * (CB.vuln ? 1.5 : 1) * (CB.stance === 'wrath' ? 2 : 1));
function intentHTML() {
  const m = CB.foe.moves[CB.foe.mi], p = [];
  if (m.atk) p.push(`<b class="ia">⚔️${foeDmg(m.atk)}${m.times > 1 ? '×' + m.times : ''}</b>`);
  if (m.block) p.push('🛡️');
  if (m.str) p.push('💪');
  if (m.weak || m.vuln) p.push('🌀');
  return p.join(' ');
}
const statusHTML = o => `${o.poison ? `<span title="${poisonSt().n}：毎ターンダメージ">${poisonSt().e}${o.poison}</span>` : ''}${o.str ? `<span title="知識（攻撃力）">💪${o.str}</span>` : ''}${o.weak ? `<span title="弱体：与ダメ-25%">🥀${o.weak}</span>` : ''}${o.vuln ? `<span title="脆弱：被ダメ+50%">💔${o.vuln}</span>` : ''}`;
function cardHTML(c, i, playable) {
  const d = CARDS[c.id], cost = cardCost(c);
  return `<button class="rcard ${d.t} r${d.r} ${playable === false ? 'dim' : ''}" ${i != null ? `data-act="rgplay:${i}"` : ''}>
    <span class="cc">${d.c === 'X' ? 'X' : cost < 0 ? '－' : cost}</span><div class="ce">${cEmoji(c.id)}</div><div class="cn">${esc(cName(c.id))}${c.u ? '+' : ''}</div><div class="cd">${esc(d.d(c.u))}</div>
    ${d.ex ? '<span class="cx">廃棄</span>' : ''}${d.q ? '<span class="cq">📖</span>' : ''}</button>`;
}
function renderCombat() {
  if (!CB || window.SIM) return;
  const f = CB.foe;
  app.innerHTML = `${rgHeader()}
    <div class="arena">
      <div class="foe" id="foe">
        <div class="intent">${intentHTML()}</div>
        <div class="fe-e">${f.e}</div>
        <div class="fe-n">${esc(f.n)}</div>
        ${f.claim ? `<div class="fclaim">「${esc(f.claim.q)}」</div>` : ''}
        <div class="hpbar"><i style="width:${f.hp / f.maxHp * 100}%"></i><span>${f.hp}/${f.maxHp}${f.block ? ` 🛡️${f.block}` : ''}</span></div>
        <div class="sts">${statusHTML(f)}</div>
      </div>
      <div class="me" id="me">
        <div class="energy"><b>${CB.energy}</b><small>⚡</small></div>
        <div style="flex:1"><div class="hpbar me-hp"><i style="width:${RG.hp / RG.maxHp * 100}%"></i><span>❤️ ${RG.hp}/${RG.maxHp}${CB.block ? ` 🛡️${CB.block}` : ''}</span></div>
          <div class="sts">${CB.stance ? `<span class="stance ${CB.stance}" title="${CB.stance === 'wrath' ? '憤怒：与ダメ・被ダメ2倍' : '静思：構えを変えると+2⚡'}">${CB.stance === 'wrath' ? '🔥憤怒' : '🧘静思'}</span>` : ''}${CB.chips ? `<span title="チップ">🪙${CB.chips}</span>` : ''}${CB.dex ? `<span title="敏捷：ブロック+${CB.dex}">🦶${CB.dex}</span>` : ''}${statusHTML(CB)}${CB.powers.curio ? `<span title="探究心">🔎</span>` : ''}${CB.powers.genius ? `<span title="天才">🧠</span>` : ''}${CB.powers.fort ? `<span title="要塞">🏯</span>` : ''}</div></div>
      </div>
    </div>
    <div class="hand">${CB.hand.map((c, i) => cardHTML(c, i, CARDS[c.id].t !== 'curse' && cardCost(c) <= CB.energy)).join('')}</div>
    <div class="cbar"><span class="ghost">山札 ${CB.draw.length} ・ 捨札 ${CB.discard.length}${CB.exhaust.length ? ` ・ 廃棄 ${CB.exhaust.length}` : ''}</span>
      <button class="btn primary" data-act="rgend" ${CB.busy ? 'disabled' : ''}>ターン終了<span class="sub">E</span></button></div>`;
}
function drawCards(n) {
  for (let i = 0; i < n; i++) {
    if (!CB.draw.length) { if (!CB.discard.length) break; CB.draw = shuffle(CB.discard); CB.discard = []; }
    if (CB.hand.length >= 10) break;
    CB.hand.push(CB.draw.pop());
  }
}
async function startTurn() {
  if (!CB || screen !== 'rg-combat') return;
  CB.turn++; if (!CB.powers.barricade) CB.block = 0; CB.busy = true; CB.played = 0;
  CB.tmp = { rage: 0, flex: 0, sutra: false };
  if (CB.nextBlock) { CB.block += CB.nextBlock; CB.nextBlock = 0; }
  if (CB.turn === 1 && hasR('pot')) CB.block += 8;
  if (CB.turn === 1 && hasR('bulwark')) CB.block += 8;
  if (CB.turn === 1 && hasR('notebook')) drawCards(1);
  if (CB.turn === 1 && hasR('ring')) { CB.foe.poison += 4; drawCards(2); }
  if (CB.powers.ironskin) CB.block += CB.powers.ironskin;
  if (CB.powers.noxious) CB.foe.poison += CB.powers.noxious;
  if (CB.turn >= 3 && hasR('hourglass')) CB.block += 4;
  drawCards(RG_HAND + (CB.powers.library || 0) + (hasR('astrolabe') ? 1 : 0)); CB.energy = 0; renderCombat();
  const r = await ask(pickQ(), { bet: true, title: `⚡ ターン${CB.turn}：知識チャージ` });
  if (!CB) return;
  if (CB.foe.hp <= 0) { CB.busy = false; return winCombat(); }
  let e = r.ok ? (r.conf === 3 ? 4 : 3) : r.near ? 3 : (r.conf === 3 ? 1 : DIFF().missE);
  if (!r.ok && hasR('feather')) e = Math.max(e, 2);
  if (!r.ok && r.conf === 3) { if (hasR('coin')) e = Math.max(e, 2); if (CB.powers.luck) e = Math.max(e, CB.powers.luck); }
  // むずかしい・鬼：★★★を外すと知識が下がる（惜しいは対象外）
  const betLoss = !r.ok && !r.near && r.conf === 3 ? DIFF().betLoss || 0 : 0;
  if (betLoss) CB.str -= betLoss;
  if (r.ok && r.conf === 3) { CB.str += hasR('tablet') ? 2 : 1; if (hasR('flame')) e++; }
  if (CB.turn === 1 && hasR('lamp')) e++;
  if (r.ok) { if (hasR('scroll')) drawCards(1); if (CB.powers.curio) CB.block += CB.powers.curio; }
  if (CB.powers.genius) CB.str += CB.powers.genius;
  e += ['crown', 'sozu', 'velvet', 'mark'].filter(hasR).length;
  CB.energy = e; CB.busy = false;
  renderCombat();
  const en = $('.energy'); if (en) { en.classList.add('charge'); const rc = en.getBoundingClientRect(); floatText(`+${e}⚡${r.ok && r.conf === 3 ? ` 💪+${hasR('tablet') ? 2 : 1}` : betLoss ? ` 💪-${betLoss}` : ''}`, rc.left + rc.width / 2, rc.top, betLoss ? '#ff5c7a' : '#ffcc33', 24); }
}
async function playCard(i) {
  if (!CB || CB.busy) return;
  const c = CB.hand[i]; if (!c) return;
  const d = CARDS[c.id], cost = cardCost(c);
  if (d.t === 'curse') return toast('このカードは使えない');
  if (cost > CB.energy) { const en = $('.energy'); if (en) { en.classList.remove('shake'); void en.offsetWidth; en.classList.add('shake'); } return toast('⚡エネルギーが足りない'); }
  if (hasR('velvet') && CB.played >= 6) return toast('📿 このターンはもう使えない');
  CB.busy = true; const x = CB.energy; CB.energy -= cost; CB.hand.splice(i, 1);
  const el = $$('.hand .rcard')[i]; if (el) el.classList.add('played');
  await sleep(120);
  renderCombat();
  const twice = CB.powers.echo && CB.played === 0 && d.t !== 'pow';
  await d.f(c.u, x);
  if (twice && CB && CB.foe.hp > 0) { pfloat('🔁 反響！'); await d.f(c.u, x); }
  if (!CB) return;
  CB.played++;
  if (d.t === 'atk' && CB.tmp.rage) gainBlock(CB.tmp.rage);
  (d.ex || d.t === 'pow' ? CB.exhaust : CB.discard).push(c);
  if (d.t === 'pow') { pfloat(`✨ ${cName(c.id)}`); tone(700, .2, 'triangle', .1); }
  CB.busy = false;
  if (CB.foe.hp <= 0) return winCombat();
  renderCombat();
}
async function hit(n) {
  if (!CB) return;
  const f = CB.foe;
  let d = n + CB.str; if (CB.weak) d *= .75; if (f.vuln) d *= 1.5; if (CB.stance === 'wrath') d *= 2; d = Math.max(0, Math.floor(d));
  const ab = Math.min(f.block, d); f.block -= ab; const dmg = d - ab; f.hp = Math.max(0, f.hp - dmg);
  if (dmg > 0 && CB.powers.envenom) f.poison += CB.powers.envenom;
  renderCombat();
  const el = $('#foe'); if (!el) return dmg;
  const rc = el.getBoundingClientRect(), x = rc.left + rc.width / 2, y = rc.top + 70;
  // ヒットストップ：大ダメージほど長く止める
  if (dmg >= 20) { await sleep(90); document.body.classList.add('flash'); setTimeout(() => document.body.classList.remove('flash'), 120); }
  el.classList.add('hurt'); floatText(dmg ? `-${dmg}` : '🛡️', x, y, dmg >= 20 ? '#ffcc33' : '#ff5c7a', dmg >= 20 ? 40 : 30);
  burst(x, y, Math.min(30, 6 + dmg)); tone(180 + Math.min(dmg, 40) * 8, .1, 'square', .1); tone(90, .12, 'sawtooth', .08);
  await sleep(dmg >= 20 ? 260 : 160);
  return dmg;
}
function gainBlock(n) {
  n += CB.dex || 0;
  if (CB.powers.jugg && CB.foe.hp > 0) { CB.foe.hp = Math.max(0, CB.foe.hp - CB.powers.jugg); const fe = $('#foe'); if (fe) { const rc = fe.getBoundingClientRect(); floatText(`💥-${CB.powers.jugg}`, rc.left + rc.width / 2, rc.top + 60, '#ffcc33', 22); } }
  CB.block += n; renderCombat(); pfloat(`🛡️+${n}`, '#5ad1ff'); tone(330, .1, 'triangle', .1); }
function healP(n) { RG.hp = Math.min(RG.maxHp, RG.hp + n); renderCombat(); pfloat(`❤️+${n}`, '#2ee59d'); }
function foeStatus(k, n) { CB.foe[k] += n; renderCombat(); const el = $('#foe'); if (el) { const rc = el.getBoundingClientRect(); floatText(k === 'weak' ? `🥀弱体${n}` : k === 'poison' ? `${poisonSt().e}${poisonSt().n}${n}` : `💔脆弱${n}`, rc.left + rc.width / 2, rc.top + 40, '#b18cff', 20); } }
function pfloat(txt, color = '#ffcc33') { const el = $('#me'); if (!el) return; const rc = el.getBoundingClientRect(); floatText(txt, rc.left + rc.width / 2, rc.top, color, 22); }
async function endTurn() {
  if (!CB || CB.busy) return;
  CB.busy = true;
  if (CB.powers.fort) CB.block += CB.powers.fort;
  const doubts = CB.hand.filter(c => c.id === 'doubt').length;
  if (!hasR('runic')) { CB.discard.push(...CB.hand.filter(c => c.id !== 'shiv')); CB.hand = []; }
  CB.str -= CB.tmp.flex; CB.tmp.flex = 0;
  renderCombat();
  if (doubts) { RG.hp = Math.max(0, RG.hp - 2 * doubts); pfloat(`😵 迷い -${2 * doubts}`, '#ff5c7a'); if (RG.hp <= 0) return loseRun(); }
  const f = CB.foe, m = f.moves[f.mi];
  f.block = 0;
  await sleep(300);
  if (f.poison > 0) {
    f.hp = Math.max(0, f.hp - f.poison); const el = $('#foe');
    if (el) { const rc = el.getBoundingClientRect(); floatText(`${poisonSt().e}-${f.poison}`, rc.left + rc.width / 2, rc.top + 60, '#b18cff', 28); }
    f.poison--; renderCombat(); await sleep(350);
    if (f.hp <= 0) { CB.busy = false; return winCombat(); }
  }
  if (m.block) { f.block += Math.round(m.block * f.atkMul); tone(300, .1, 'triangle', .08); }
  if (m.str) f.str += m.str;
  if (m.atk) for (let k = 0; k < (m.times || 1); k++) { await foeHit(m.atk); if (RG.hp <= 0) break; }
  if (RG.hp <= 0) return loseRun();
  if (f.hp <= 0) { CB.busy = false; return winCombat(); }
  // 状態異常は「ラウンド終了」で1減る。今回付与された分はその後に付ける
  ['weak', 'vuln'].forEach(k => { if (CB[k]) CB[k]--; if (f[k]) f[k]--; });
  if (m.weak) CB.weak += m.weak; if (m.vuln) CB.vuln += m.vuln;
  nextIntent();
  renderCombat();
  await sleep(200);
  startTurn();
}
async function foeHit(a) {
  const d = foeDmg(a), ab = Math.min(CB.block, d), dmg = d - ab;
  CB.block -= ab; RG.hp = Math.max(0, RG.hp - dmg);
  if (CB.powers.thorns && RG.hp > 0) { CB.foe.hp = Math.max(0, CB.foe.hp - CB.powers.thorns); const fe = $('#foe'); if (fe) { const rc = fe.getBoundingClientRect(); floatText(`⚔️反撃-${CB.powers.thorns}`, rc.left + rc.width / 2, rc.top + 80, '#ffcc33', 22); } }
  const foe = $('#foe'); if (foe) { foe.classList.add('lunge'); }
  await sleep(120);
  renderCombat();
  const el = $('#me');
  if (el) { const rc = el.getBoundingClientRect(); floatText(dmg ? `-${dmg}` : '🛡️ブロック', rc.left + rc.width / 2, rc.top, dmg ? '#ff5c7a' : '#5ad1ff', 30); }
  if (dmg) { document.body.classList.add('hit-shake'); setTimeout(() => document.body.classList.remove('hit-shake'), 300); sfx.ng(); if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) try { navigator.vibrate(60); } catch (e) { } }
  else tone(500, .08, 'triangle', .1);
  await sleep(280);
}

// ---------- 勝利・報酬 ----------
function randCard(minR = 1, boost = 0) {
  const rid = (RG && RG.role) || 'scholar', any = Math.random() < .12;
  let pool = Object.keys(CARDS).filter(id => CARDS[id].r >= minR && CARDS[id].role === (any ? 'any' : rid));
  if (!pool.length) pool = Object.keys(CARDS).filter(id => CARDS[id].r >= minR && CARDS[id].role === rid);
  const roll = () => { const r = Math.random(); return r < .06 + boost ? 3 : r < .40 + boost ? 2 : 1; };
  const want = Math.max(minR, roll());
  let ok = pool.filter(id => CARDS[id].r === want);
  if (!ok.length) ok = pool;
  return { id: ok[rand(ok.length)], u: Math.random() < .1 ? 1 : 0 };
}
function addCard(c) { RG.deck.push(c); RG.stats.cards++; }
function gainRelic() {
  const left = Object.keys(RRELICS).filter(r => !RG.relics.includes(r) && !RRELICS[r].starter && !RRELICS[r].boss);
  if (!left.length) { RG.gold += 50; return null; }
  const r = left[rand(left.length)]; RG.relics.push(r); if (RRELICS[r].on) RRELICS[r].on();
  toast(`${rlc(r).e} ${rlc(r).n}：${rlc(r).d}`); return r;
}
function dropEvidence() {
  const t = rTheme(), st = tst(t.id), left = [];
  dgChapters(t).forEach(ci => t.chapters[ci].facts.forEach((f, fi) => { if (!st.cards[fKey(t, ci, fi)]) left.push({ ci, fi, f }); }));
  if (!left.length) return null;
  const p = left[rand(left.length)]; st.cards[fKey(t, p.ci, p.fi)] = 1; return p;
}
async function winCombat() {
  const kind = CB.kind, f = CB.foe;
  // 鬼：ボスは倒れても第2形態で蘇る
  if (kind === 'boss' && lastAct() && DIFF().boss2 && !f.phase2) {
    CB.busy = true; f.phase2 = true;
    const el = $('#foe'); if (el) el.classList.add('dead');
    sfx.fever(); burst(innerWidth / 2, 160, 60); await sleep(900);
    f.maxHp = Math.round(f.maxHp * .45); f.hp = f.maxHp; f.str += 2; f.block = 0; f.weak = 0; f.vuln = 0; f.poison = 0;
    f.n = '真・' + f.n; f.e = '👹'; f.mi = -1;
    f.moves = [{ atk: 9, times: 2 }, { atk: 25 }, { block: 18, weak: 2, vuln: 1 }, { atk: 5, times: 4 }];
    nextIntent(); toast('👹 第2形態！ 真の姿を現した！');
    CB.busy = false; renderCombat(); return;
  }
  CB.busy = true; RG.stats.kills++;
  const el = $('#foe'); if (el) el.classList.add('dead');
  burst(innerWidth / 2, 160, 50); sfx.level();
  await sleep(700);
  if (hasR('scarab')) RG.hp = Math.min(RG.maxHp, RG.hp + 5);
  if (hasR('blood')) RG.hp = Math.min(RG.maxHp, RG.hp + 6);
  if (kind === 'boss') { CB = null; return lastAct() ? rgEndRun(true) : renderBossRelic(); }
  let gold = kind === 'elite' ? 30 + rand(15) : 12 + rand(10); if (hasR('idol')) gold = Math.round(gold * 1.5); if (hasR('coin')) gold = Math.round(gold * 1.2);
  RG.gold += gold;
  const relic = kind === 'elite' ? gainRelic() : null;
  const ev = kind === 'elite' || Math.random() < .35 ? dropEvidence() : null;
  const n = 3 + (hasR('book') ? 1 : 0) - (hasR('crown') ? 1 : 0);
  RG.reward = { cards: Array.from({ length: n }, () => randCard(1, kind === 'elite' ? .1 : 0)), gold, relic, ev, claim: f.claim, foe: f.n, e: f.e };
  CB = null; saveRun();
  renderReward();
}
function renderReward() {
  screen = 'rg-reward';
  const w = RG.reward;
  app.innerHTML = `${rgHeader()}
    <div class="res-head"><div class="bigemoji" style="font-size:56px">${w.e}</div><h2 style="margin:4px 0">${esc(w.foe)} を倒した！</h2></div>
    ${w.claim ? `<div class="refute"><div class="rf-h">💥 論破！</div><div class="rf-c">「${esc(w.claim.q)}」</div><div class="rf-t">→ <b>まちがい。</b>${esc(w.claim.explain || '')}</div></div>` : ''}
    <div class="card"><div class="gain"><span>💰 +${w.gold}</span>${w.relic ? `<span>${rlc(w.relic).e} ${esc(rlc(w.relic).n)}</span>` : ''}</div>
      ${w.ev ? `<button class="fact ${w.ev.f.rarity} flip" style="width:100%;margin-top:8px" data-act="factx:${RG.tid}:${w.ev.ci}-${w.ev.fi}"><span class="rar ${w.ev.f.rarity}">${w.ev.f.rarity}</span> 🃏 証拠カード発見！<div>${esc(w.ev.f.text)}</div></button>` : ''}</div>
    <h3 style="text-align:center;margin:14px 0 8px">カードを1枚選んでデッキに加える</h3>
    <div class="pickrow">${w.cards.map((c, i) => `<div data-act="rgpick:${i}">${cardHTML(c)}</div>`).join('')}</div>
    <button class="btn" style="width:100%;margin-top:12px" data-act="rgskip">スキップ</button>`;
}
function takeReward(i) {
  const c = RG.reward.cards[i]; if (c) { addCard(c); sfx.coin(); toast(`🃏 ${cName(c.id)}${c.u ? '+' : ''} を加えた`); }
  RG.reward = null; completeNode();
}

// ============================================================
//  ？イベント・休憩・商店・宝箱
// ============================================================
const EVENTS = [
  { id: 'stele', e: '🪨', title: '古代の碑文', text: '壁に刻まれた問いが青く光っている。答えれば宝が、外せば呪いの棘が待つ。',
    ch: [{ l: '📖 挑む', go: async () => { const r = await ask(pickQ(), { title: '🪨 碑文の問い' }); if (r.ok) { const x = gainRelic(); return x ? `${rlc(x).e} ${rlc(x).n} を手に入れた！` : '💰 50ゴールドを得た'; } RG.hp = Math.max(1, RG.hp - 8); return '棘が刺さった… ❤️-8'; } },
      { l: '立ち去る', go: async () => '何も起きなかった。' }] },
  { id: 'spring', e: '⛲', title: '知識の泉', text: '泉の水面に問いが浮かぶ。答えるたびに傷が癒える。3問すべて正解なら、カードが1枚強化される。',
    ch: [{ l: '📖 3問に挑む', go: async () => { let ok = 0; for (let k = 0; k < 3; k++) { const r = await ask(pickQ(), { title: `⛲ 泉の問い ${k + 1}/3` }); if (r.ok) { ok++; RG.hp = Math.min(RG.maxHp, RG.hp + 6); } } let msg = `${ok}問正解 ❤️+${ok * 6}`; if (ok === 3) { const up = shuffle(RG.deck.filter(c => !c.u && CARDS[c.id].t !== 'curse'))[0]; if (up) { up.u = 1; msg += ` ・ ${cName(up.id)} を強化！`; } } return msg; } },
      { l: '立ち去る', go: async () => '泉は静かに揺れていた。' }] },
  { id: 'lost', e: '📦', title: '失われた証拠', text: '崩れた棚の奥に、古い記録が眠っている。',
    ch: [{ l: '🔍 調べる', go: async () => { RG.gold += 25; const ev = dropEvidence(); if (ev) { save(); setTimeout(() => factModal(rTheme(), ev.ci, ev.fi, true), 100); return `💰+25 ・ 🃏証拠「${ev.f.text}」`; } return '💰+25'; } }] },
  { id: 'merchant', e: '🧙', title: '謎の賢者', text: '「血を少し分けてくれれば、珍しい知恵を授けよう」',
    ch: [{ l: '❤️-7 で受け取る', go: async () => { RG.hp = Math.max(1, RG.hp - 7); const c = randCard(3); addCard(c); return `🃏 ${cName(c.id)} を授かった`; } },
      { l: '断る', go: async () => '賢者は霧に消えた。' }] },
  { id: 'whisper', e: '🌫️', title: '誤解の囁き', text: '霧の中から声がする。「本当にそう思うのか…？」 正しく答えればデッキが研ぎ澄まされ、外せば混乱が紛れ込む。',
    ch: [{ l: '📖 向き合う', go: async () => { const r = await ask(pickQ(), { title: '🌫️ 囁きの問い' }); if (r.ok) { RG.pendingRemove = true; return '心が澄み渡った。カードを1枚削除できる'; } addCard({ id: 'confuse', u: 0 }); return '😵 呪い「混乱」がデッキに入った…'; } },
      { l: '耳をふさぐ', go: async () => '声は遠ざかった。' }] },
  { id: 'library', e: '📚', title: '崩れた書庫', text: '散らばった書物の中から、1冊だけ持ち帰れそうだ。',
    ch: [{ l: '📖 選ぶ', go: async () => { RG.pendingPick = Array.from({ length: 3 }, () => randCard(1, .1)); return '書物を手に取った…'; } }] },
];
function renderEvent() {
  screen = 'rg-event';
  const ev0 = EVENTS[rand(EVENTS.length)], o = SK().events && SK().events[ev0.id], ev = { ...ev0, ...(o ? { title: o.title, text: o.text } : {}) }; RG.ev = ev.id;
  app.innerHTML = `${rgHeader()}<div class="story"><div class="si">${ev.e}</div><h2>${esc(ev.title)}</h2><p>${esc(ev.text)}</p>
    <div class="relics" id="evc">${ev.ch.map((c, i) => `<button class="relic" data-act="rgev:${i}"><b>${esc(c.l)}</b><span class="k">${i + 1}</span></button>`).join('')}</div></div>`;
}
async function eventChoice(i) {
  const ev0 = EVENTS.find(e => e.id === RG.ev), o = ev0 && SK().events && SK().events[ev0.id], ev = ev0 && { ...ev0, ...(o ? { title: o.title } : {}) }, c = ev && ev.ch[i]; if (!c || RG.evBusy) return;
  RG.evBusy = true;
  const msg = await c.go();
  RG.evBusy = false; saveRun();
  if (RG.pendingPick) { const cards = RG.pendingPick; RG.pendingPick = null; RG.reward = { cards, gold: 0, foe: ev.title, e: ev.e }; return renderReward(); }
  $('#evc').innerHTML = `<div class="card" style="text-align:center;font-weight:700">${esc(msg)}</div>
    <button class="btn primary big" style="width:100%" data-act="${RG.pendingRemove ? 'rgremove' : 'rgdone'}">${RG.pendingRemove ? '✂️ 削除するカードを選ぶ' : '進む ▶'}</button>`;
  const h = $('.rghud'); if (h) h.outerHTML = rgHeader();
}
function renderRest() {
  screen = 'rg-rest';
  const heal = Math.round(RG.maxHp * DIFF().restHeal);
  app.innerHTML = `${rgHeader()}<div class="story"><div class="si">🔥</div><h2>休憩所</h2><p>焚き火が静かに燃えている。体を休めるか、知識を磨くか。</p>
    <div class="relics"><button class="relic" data-act="rgrest:heal"><div class="ri">😴</div><div><b>休む</b><div class="ghost">❤️ ${heal} 回復</div></div></button>
    <button class="relic" data-act="rgrest:up"><div class="ri">📚</div><div><b>研究する</b><div class="ghost">📖 1問正解でカードを1枚強化（外すと強化なし）</div></div></button></div></div>`;
}
async function restChoice(k) {
  if (k === 'heal' && hasR('sozu')) { toast('⚱️ 封印の壺のせいで休めない…'); return; }
  if (k === 'heal') { RG.hp = Math.min(RG.maxHp, RG.hp + Math.round(RG.maxHp * DIFF().restHeal)); sfx.coin(); return completeNode(); }
  const r = await ask(pickQ(), { title: '📚 研究：正解でカード強化' });
  if (!r.ok) { toast('研究は実らなかった…'); return completeNode(); }
  pickCard('強化するカードを選ぶ', c => !c.u && CARDS[c.id].t !== 'curse', c => { c.u = 1; sfx.level(); completeNode(); });
}
function renderShop() {
  screen = 'rg-shop';
  if (!RG.shop || RG.shop.at !== RG.cur.f) {
    const disc = hasR('compass') ? .75 : 1, price = c => Math.round(({ 1: 50, 2: 75, 3: 140 }[CARDS[c.id].r] + rand(15)) * disc);
    const cards = Array.from({ length: 5 }, () => randCard(1, .05)).map(c => ({ c, p: price(c) }));
    const left = Object.keys(RRELICS).filter(r => !RG.relics.includes(r) && !RRELICS[r].starter && !RRELICS[r].boss);
    const relics = shuffle(left).slice(0, 2).map(r => ({ r, p: Math.round((140 + rand(40)) * disc) }));
    RG.shop = { at: RG.cur.f, cards, relics, rm: Math.round(75 * disc), rmUsed: false };
  }
  const s = RG.shop;
  app.innerHTML = `${rgHeader()}<div class="title"><h2>🛒 商店</h2><div class="pill">💰 ${RG.gold}</div></div>
    <div class="pickrow shop">${s.cards.map((x, i) => x ? `<div data-act="rgbuy:c${i}">${cardHTML(x.c)}<div class="price ${RG.gold < x.p ? 'no' : ''}">💰${x.p}</div></div>` : '<div class="sold">売切</div>').join('')}</div>
    <div class="relics" style="margin-top:12px">${s.relics.map((x, i) => x ? `<button class="relic" data-act="rgbuy:r${i}"><div class="ri">${rlc(x.r).e}</div><div><b>${esc(rlc(x.r).n)}</b><div class="ghost">${esc(rlc(x.r).d)}</div></div><span class="price ${RG.gold < x.p ? 'no' : ''}">💰${x.p}</span></button>` : '').join('')}
      ${s.rmUsed ? '' : `<button class="relic" data-act="rgbuy:rm"><div class="ri">✂️</div><div><b>カード削除</b><div class="ghost">デッキから1枚取り除く</div></div><span class="price ${RG.gold < s.rm ? 'no' : ''}">💰${s.rm}</span></button>`}</div>
    <button class="btn primary big" style="width:100%;margin-top:14px" data-act="rgdone">店を出る ▶</button>`;
}
function buy(k) {
  const s = RG.shop;
  if (k === 'rm') { if (RG.gold < s.rm) return toast('ゴールドが足りない'); return pickCard('削除するカードを選ぶ', () => true, c => { RG.gold -= s.rm; s.rmUsed = true; RG.deck.splice(RG.deck.indexOf(c), 1); saveRun(); sfx.coin(); renderShop(); }, renderShop); }
  const i = +k.slice(1), list = k[0] === 'c' ? s.cards : s.relics, x = list[i];
  if (!x) return; if (RG.gold < x.p) return toast('ゴールドが足りない');
  RG.gold -= x.p; list[i] = null;
  if (k[0] === 'c') addCard(x.c); else { RG.relics.push(x.r); if (RRELICS[x.r].on) RRELICS[x.r].on(); }
  sfx.coin(); saveRun(); renderShop();
}
function renderChest() {
  screen = 'rg-chest';
  const gold = 25 + rand(20); RG.gold += gold; const r = gainRelic(); saveRun();
  sfx.gacha('SR'); burst(innerWidth / 2, innerHeight / 3, 40);
  app.innerHTML = `${rgHeader()}<div class="story"><div class="si">💰</div><h2>宝箱</h2>
    <div class="card" style="text-align:center"><div style="font-size:50px">${r ? rlc(r).e : '💰'}</div><b>${r ? esc(rlc(r).n) : ''}</b><div class="ghost">${r ? esc(rlc(r).d) : ''}</div><div style="margin-top:8px">💰 +${gold}</div></div>
    <button class="btn primary big" style="width:100%" data-act="rgdone">進む ▶</button></div>`;
}
// カード選択（削除・強化など）
let PICK = null;
function pickCard(title, filter, cb, back) {
  screen = 'rg-pick';
  const list = RG.deck.map((c, i) => ({ c, i })).filter(x => filter(x.c));
  if (!list.length) { toast('対象のカードがない'); return back ? back() : completeNode(); }
  PICK = { cb, list };
  app.innerHTML = `${rgHeader()}<h2 style="text-align:center">${esc(title)}</h2>
    <div class="pickrow wrap">${list.map((x, k) => `<div data-act="rgpk:${k}">${cardHTML(x.c)}</div>`).join('')}</div>
    ${back ? `<button class="btn" style="width:100%;margin-top:12px" data-act="rgpkback">やめる</button>` : ''}`;
  PICK.back = back;
}
function deckModal() {

  modal(`<h2>🃏 デッキ（${RG.deck.length}枚）</h2><div class="pickrow wrap" style="max-height:60vh;overflow:auto">${RG.deck.slice().sort((a, b) => a.id.localeCompare(b.id)).map(c => cardHTML(c)).join('')}</div>
    <button class="btn primary" style="width:100%;margin-top:12px" data-act="close">閉じる</button>`);
}

// ============================================================
//  ラン終了
// ============================================================
function loseRun() { CB = null; rgEndRun(false); }
function rgEndRun(win) {
  const t = rTheme(), m = rMeta(metaKey(RG.tid, RG.dg)), floor = RG.cur ? gFloor(RG.cur.f) : RG.at ? gFloor(RG.at.f) : actOf() * RG_FLOORS;
  m.best = Math.max(m.best, floor);
  let unlocked = false;
  if (win) { m.wins++; m.wins_[RG.diff] = (m.wins_[RG.diff] || 0) + 1; if (RG.asc >= m.asc && m.asc < RG_MAX_ASC) { m.asc++; unlocked = true; } }
  const score = Math.round((floor * 150 + RG.stats.kills * 60 + (win ? 2500 : 0)) * DIFF().score);
  const rw = applyRewards({ id: 'rogue:' + RG.tid, score, correct: RG.stats.correct, wrong: RG.stats.wrong, maxCombo: RG.stats.best, extraCoins: win ? 200 : 0, xpMult: 1.5 });
  const st = RG.stats, acc = st.correct + st.wrong ? Math.round(st.correct / (st.correct + st.wrong) * 100) : 0;
  const run = RG; S.rgRun = null; S.rgAscSel = null; save();
  screen = 'rg-end';
  app.innerHTML = `${hud()}<div class="res-head">${win
    ? `<div class="bigemoji">🏆</div><h2 style="margin:4px 0">${esc(towerName())} 踏破！</h2><div class="newrec">${DIFF().e} ${DIFF().n} で ${esc(bossName(t))}を倒した！</div>${unlocked ? `<div class="near">🔓 アセンション ${m.asc} が解放された！</div>` : ''}`
    : `<div class="bigemoji">💀</div><h2 style="margin:4px 0">${floor}階で力尽きた…</h2><div class="near">${floor >= m.best && floor > 1 ? '🎉 最高到達を更新！' : `最高到達まで あと${m.best - floor}階`}</div>`}
    <div class="big" id="rs" style="font-size:44px">0</div></div>
    <div class="stats"><div class="stat"><b>${floor}</b><span>到達階</span></div><div class="stat"><b>${st.kills}</b><span>撃破</span></div><div class="stat"><b>${acc}%</b><span>正答率</span></div></div>
    ${win ? `<div class="cliff">🔮 ${esc(t.finale.text.split('。')[0])}。<br><span class="ghost">（続きはマップの最終章で）</span></div>` : ''}
    <div class="row" style="margin-bottom:12px"><button class="btn primary big" data-act="rgentry:${run.tid}">⚔️ もう一度挑む<span class="sub">Enter</span></button></div>
    ${rewardCard(rw, `<div class="ghost" style="margin-top:6px">📖 ${st.correct + st.wrong}問に挑戦 ・ 最大${st.best}連続正解 ・ デッキ${run.deck.length}枚</div>`)}
    ${missionDoneCard(rw.newlyDone)}
    <div class="row"><button class="btn" data-act="theme:${run.tid}">🗺️ テーマへ</button><button class="btn" data-act="home">🏠 ホーム</button></div>`;
  countUp($('#rs'), score);
  if (win) { sfx.level(); burst(innerWidth / 2, 150, 80); } else sfx.ng();
  animateXP(rw.oldLevel);
  RG = null;
}

// ============================================================
//  入力
// ============================================================
function rogueAct(act, arg, b) {
  switch (act) {
    case 'rgentry': rogueEntry(arg); return true;
    case 'rgnew': rgNewRun(RGE); return true;
    case 'rgcont': RG = S.rgRun;
      // 塔の階数が変わった更新の前から続いているランは、デッキ・遺物・HPはそのままで地図だけ作り直す
      if (!RG.map || RG.map.length !== RG_FLOORS - 1) { RG.map = genMap(DIFF().eliteBoost); RG.at = null; RG.cur = null; RG.path = []; saveRun(); toast('🏗️ 塔が改装されたので、この層の地図を新しくしました'); }
      if (RG.bossOpts) renderBossRelic(); else if (RG.blessOpts) renderBlessing(); else if (RG.reward) renderReward(); else renderMap(); return true;
    case 'rgabandon': if (confirm('今の挑戦を放棄しますか？')) { const tid = S.rgRun.tid; S.rgRun = null; save(); rogueEntry(tid); } return true;
    case 'rgasc': { const m = rMeta(metaKey(RGE, RGD)); S.rgAscSel = Math.max(0, Math.min(m.asc, (S.rgAscSel ?? m.asc) + +arg)); rogueEntry(RGE); return true; }
    case 'rgdg': S.rgDgSel = S.rgDgSel || {}; S.rgDgSel[RGE] = arg; S.rgAscSel = null; save(); rogueEntry(RGE); return true;
    case 'rgdglock': toast(`🔒 他の塔を${arg}つ踏破すると解放！`); return true;
    case 'rgrole': S.rgRoleSel = arg; save(); rogueEntry(RGE); return true;
    case 'rgrolelock': toast('🎰 ガチャの「ロール召喚」で手に入る！'); return true;
    case 'rpull': pullRole(); return true;
    case 'rpullagain': closeModal(b.closest('.modal')); pullRole(); return true;
    case 'rgtheme': S.rgAscSel = null; save(); rogueEntry(arg); return true;
    case 'rghow': howModal(); return true;
    case 'rgdiff': S.rgDiffSel = arg; save(); rogueEntry(RGE); return true;
    case 'rgbless': takeBlessing(+arg); return true;
    case 'rgnode': { const [f, c] = arg.split('-').map(Number); enterNode(f, c); return true; }
    case 'rgnoop': return true;
    case 'rgback': { const tid = RG.tid; RG = null; rogueEntry(tid); return true; }
    case 'rgdeck': if (RG) deckModal(); return true;
    case 'rgrelic': toast(`${rlc(arg).e} ${rlc(arg).n}：${rlc(arg).d}`); return true;
    case 'rgplay': playCard(+arg); return true;
    case 'rgend': endTurn(); return true;
    case 'rgpick': takeReward(+arg); return true;
    case 'rgskip': RG.reward = null; completeNode(); return true;
    case 'rgev': eventChoice(+arg); return true;
    case 'rgdone': RG.shop = null; completeNode(); return true;
    case 'rgremove': RG.pendingRemove = false; pickCard('削除するカードを選ぶ', () => true, c => { RG.deck.splice(RG.deck.indexOf(c), 1); saveRun(); completeNode(); }); return true;
    case 'rgrest': restChoice(arg); return true;
    case 'rgbuy': buy(arg); return true;
    case 'rgbossrelic': nextAct(+arg); return true;
    case 'rgpk': { const x = PICK && PICK.list[+arg]; if (x) { const cb = PICK.cb; PICK = null; cb(x.c); } return true; }
    case 'rgpkback': { const bk = PICK && PICK.back; PICK = null; if (bk) bk(); return true; }
  }
  return false;
}
function rogueKey(e) {
  if (QOV) return QOV.key(e);
  const k = e.key;
  if (screen === 'rg-combat' && CB && !CB.busy) {
    if (/^[1-9]$/.test(k)) playCard(+k - 1);
    else if (k === 'e' || k === 'E') endTurn();
  } else if ((screen === 'rg-bless' || screen === 'rg-event' || screen === 'rg-boss') && /^[1-3]$/.test(k)) { const b = $$('.relic')[+k - 1]; if (b) b.click(); }
  else if ((screen === 'rg-end' || screen === 'rg-chest') && k === 'Enter') { const p = $('.btn.primary.big'); if (p) p.click(); }
}

// ============================================================
//  ロール選択・ロール召喚（ガチャ）
// ============================================================
function rolePicker() {
  const own = myRoles(), sel = own[S.rgRoleSel] != null ? S.rgRoleSel : 'scholar', R = ROLES[sel], rl = RRELICS[R.relic];
  const missing = Object.keys(ROLES).some(id => own[id] == null);
  return `<div class="roles">${Object.entries(ROLES).map(([id, r]) => {
    const has = own[id] != null;
    return `<button class="role ${sel === id ? 'on' : ''} ${has ? '' : 'locked'}" data-act="${has ? 'rgrole:' + id : 'rgrolelock'}">
      <span class="re">${has ? r.e : '❔'}</span><span class="rn">${has ? esc(r.n) : r.rar}</span>${has && own[id] ? `<i>${'★'.repeat(own[id])}</i>` : ''}</button>`;
  }).join('')}</div>
    <div class="roledesc"><b>${R.e} ${esc(R.n)}</b> ❤️${R.hp + 3 * (own[sel] || 0)} ・ ${rl.e}${esc(rl.n)}：${esc(rl.d)}<br><span class="ghost">${esc(R.desc)}</span>${missing ? ` <button class="linkbtn" data-act="gotab:gacha">🎰仲間を増やす</button>` : ''}</div>`;
}
function howModal() {
  modal(`<h2>⚔️ 知の塔の遊び方</h2><div class="howto" style="text-align:left">
    <p>🗺️ 分岐マップを1階ずつ登る。⚔️戦闘 👺エリート ❓イベント 🔥休憩 🛒商店 💰宝箱</p>
    <p>⚡ 毎ターン最初に<b>知識チャージ</b>（1問）。正解で3⚡、<b>★★★確信</b>で正解なら4⚡＋知識1（攻撃力UP）、外すと1⚡</p>
    <p>👻 敵は「誤解」。倒すと<b>真実が明かされる</b></p>
    <p>📖 のカードは使うと出題。正解で大きな効果</p>
    <p>🎭 ロールごとにカードがまったく違う。ガチャで仲間を増やそう</p>
    <p>🏆 踏破するとアセンション（高難度）が解放</p></div>
    <button class="btn primary wide" data-act="close">OK</button>`);
}
const roleCost = () => Object.keys(myRoles()).length <= 1 ? ROLE_COST / 2 : ROLE_COST;
function roleBanner() {
  const own = myRoles(), cost = roleCost();
  return `<div class="card rbanner"><h3><span>⚔️ ロール召喚</span><span class="ghost">SSR確定まで あと${ROLE_PITY - (S.rolePity || 0)}回</span></h3>
    <div class="rlist">${Object.entries(ROLES).filter(([id]) => id !== 'scholar').map(([id, r]) => `<div class="ri ${own[id] != null ? '' : 'unk'}"><div>${own[id] != null ? r.e : '❔'}</div><span class="rar ${r.rar}">${r.rar}</span>${own[id] ? `<small>★${own[id]}</small>` : ''}</div>`).join('')}</div>
    <p class="ghost" style="margin:8px 0">知の塔で使えるキャラクター。専用デッキ・初期遺物・専用カードを持つ。<br>重複するとランクUP（最大HP+3、最大★${ROLE_MAX_RANK}）。R 60% ／ SR 32% ／ SSR 8%</p>
    <button class="btn primary" style="width:100%" data-act="rpull" ${S.coins < cost ? 'disabled' : ''}>召喚する<span class="sub">🪙${cost}${cost < ROLE_COST ? '（初回半額！）' : ''}</span></button></div>`;
}
function pullRole() {
  const cost = roleCost();
  if (S.coins < cost) return toast('コインが足りない！');
  S.coins -= cost; S.rolePity = (S.rolePity || 0) + 1;
  const r = Math.random(), rar = S.rolePity >= ROLE_PITY ? 'SSR' : r < .08 ? 'SSR' : r < .40 ? 'SR' : 'R';
  if (rar === 'SSR') S.rolePity = 0;
  const pool = Object.keys(ROLES).filter(id => ROLES[id].rar === rar), id = pool[rand(pool.length)], R = ROLES[id], own = myRoles();
  const isNew = own[id] == null;
  let note;
  if (isNew) { own[id] = 0; note = '<b style="color:var(--good)">NEW！ 知の塔で使えるようになった</b>'; }
  else if (own[id] < ROLE_MAX_RANK) { own[id]++; note = `ランクUP！ ${'★'.repeat(own[id])}（最大HP+3）`; }
  else { S.coins += 100; note = '最大ランク → 🪙100 返却'; }
  save();
  const m = modal(`<div class="capsule">${rar === 'SSR' ? '🌟' : rar === 'SR' ? '💜' : '⚔️'}</div><p>召喚中…</p>`);
  tone(300, .6, 'triangle', .05);
  setTimeout(() => {
    closeModal(m); sfx.gacha(rar);
    if (rar !== 'R') burst(innerWidth / 2, innerHeight / 2, rar === 'SSR' ? 80 : 40);
    const rl = RRELICS[R.relic];
    modal(`<span class="rar ${rar}">${rar}</span><div class="bigemoji">${R.e}</div><h2>${esc(R.n)}</h2><p>${note}</p>
      <div class="card" style="text-align:left;font-size:13px">❤️ HP ${R.hp}　${rl.e} ${esc(rl.n)}：${esc(rl.d)}<br><span class="ghost">${esc(R.desc)}</span></div>
      <div class="row"><button class="btn" data-act="close">OK</button>${S.coins >= roleCost() ? `<button class="btn primary" data-act="rpullagain">もう1回</button>` : ''}</div>`, 'glow-' + rar);
    renderGacha();
  }, 1100);
}

// ============================================================
//  層の切り替え：ボス遺物を選んで次の層へ
// ============================================================
function renderBossRelic() {
  screen = 'rg-boss';
  const left = Object.keys(RRELICS).filter(r => RRELICS[r].boss && !RG.relics.includes(r));
  RG.bossOpts = RG.bossOpts || shuffle(left).slice(0, 3);
  saveRun();
  sfx.level(); burst(innerWidth / 2, 160, 60);
  app.innerHTML = `${rgHeader()}<div class="relic-head"><div class="bigemoji">👑</div><h2>第${actOf() + 1}層 踏破！</h2>
    <p class="ghost">ボス遺物を1つ選ぶ。強力だが代償がある</p></div>
    <div class="relics">${RG.bossOpts.map((r, i) => `<button class="relic boss" data-act="rgbossrelic:${i}"><div class="ri">${rlc(r).e}</div><div><b>${esc(rlc(r).n)}</b><div class="ghost">${esc(rlc(r).d)}</div></div><span class="k">${i + 1}</span></button>`).join('')}</div>
    <p class="ghost" style="text-align:center;margin-top:10px">次の層に進むとHPが減った分の75%回復する</p>`;
}
function nextAct(i) {
  const r = RG.bossOpts && RG.bossOpts[i]; if (!r) return;
  RG.relics.push(r); if (RRELICS[r].on) RRELICS[r].on();
  RG.bossOpts = null;
  RG.act = actOf() + 1;
  RG.hp = Math.min(RG.maxHp, RG.hp + Math.round((RG.maxHp - RG.hp) * .75));
  RG.map = genMap(DIFF().eliteBoost); RG.at = null; RG.cur = null; RG.path = []; RG.shop = null;
  const m = rMeta(metaKey(RG.tid, RG.dg)); m.best = Math.max(m.best, actOf() * RG_FLOORS);
  saveRun(); sfx.fever(); toast(`${rlc(r).e} ${rlc(r).n} ／ 第${RG.act + 1}層へ！`);
  renderMap();
}

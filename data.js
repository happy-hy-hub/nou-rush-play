// 調査済みテーマパック（themes/*.js が registerTheme で登録する）
const THEMES = [];
function registerTheme(t) { if (!THEMES.some(x => x.id === t.id)) THEMES.push(t); }
// 進捗のキーは「何番目か」ではなく「内容」から作る（問題の追加・並べ替えをしても記録がずれない）
const chash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };
// 問題文だけでなく答え・組・選択肢も含める（「漢字と読みを結べ」のような同じ問題文の別問題を区別する）
const qSig = q => `${q.type}\n${q.q}\n${JSON.stringify(q.a !== undefined ? q.a : q.pairs || q.items || q.correct || '')}`;
const qKey = (t, ci, qi) => `${t.id}|k${chash(qSig(t.chapters[ci].questions[qi]))}`;
const qKeyV2 = (t, ci, qi) => `${t.id}|q${chash(t.chapters[ci].questions[qi].q)}`; // 保存形式 v2 のキー（移行用）
const fKey = (t, ci, fi) => `f${chash(t.chapters[ci].facts[fi].text)}`;

// 学習データ。各デッキの items は [表, 裏] のペア。
// 選択肢のダミーは同じデッキの別アイテムから自動生成する。
const DECKS = [
  {
    id: 'eng1', name: '英単語 基礎', icon: '🔤', color: '#4f8cff', unlock: 1, reversible: true,
    ask: rev => rev ? 'この意味の英単語は？' : 'この英単語の意味は？',
    items: [
      ['abandon','見捨てる'],['accurate','正確な'],['achieve','達成する'],['acquire','習得する'],
      ['adapt','適応する'],['adequate','十分な'],['advantage','利点'],['afford','余裕がある'],
      ['ancient','古代の'],['anxious','心配して'],['apparent','明らかな'],['appropriate','適切な'],
      ['approve','承認する'],['argue','議論する'],['arrange','手配する'],['assume','仮定する'],
      ['attempt','試みる'],['attitude','態度'],['available','利用できる'],['avoid','避ける'],
      ['aware','気づいて'],['benefit','利益'],['brief','短い'],['budget','予算'],
      ['capable','能力がある'],['cancel','取り消す'],['challenge','挑戦'],['claim','主張する'],
      ['colleague','同僚'],['compare','比較する'],['complain','不平を言う'],['concentrate','集中する'],
      ['confirm','確認する'],['consider','よく考える'],['contain','含む'],['convenient','便利な'],
      ['crucial','極めて重要な'],['curious','好奇心の強い'],['decline','減少する'],['decrease','減らす'],
      ['define','定義する'],['delay','遅らせる'],['deliver','配達する'],['demand','要求'],
      ['deny','否定する'],['depend','頼る'],['describe','説明する'],['deserve','値する'],
      ['determine','決定する'],['efficient','効率的な'],['eliminate','取り除く'],['emphasize','強調する'],
      ['encourage','励ます'],['enormous','巨大な'],['estimate','見積もる'],['evidence','証拠'],
      ['expand','拡大する'],['expense','費用'],['familiar','よく知っている'],['frequent','頻繁な'],
      ['generous','気前のよい'],['ignore','無視する'],['improve','改善する'],['include','含める'],
      ['increase','増加する'],['inevitable','避けられない'],['influence','影響'],['inform','知らせる'],
      ['maintain','維持する'],['obvious','明白な'],['opportunity','機会'],['particular','特定の'],
      ['permit','許可する'],['prefer','より好む'],['prevent','防ぐ'],['previous','以前の'],
      ['purpose','目的'],['reduce','減らす'],['refuse','断る'],['reliable','信頼できる'],
      ['require','必要とする'],['sufficient','十分な量の'],['suggest','提案する'],['temporary','一時的な'],
    ]
  },
  {
    id: 'math', name: '暗算ラッシュ', icon: '🧮', color: '#ff9f43', unlock: 1, generated: true,
    ask: () => '計算しよう！',
  },
  {
    id: 'capital', name: '世界の首都', icon: '🌏', color: '#2ecc71', unlock: 2, reversible: false,
    ask: () => 'この国の首都は？',
    items: [
      ['アメリカ','ワシントンD.C.'],['イギリス','ロンドン'],['フランス','パリ'],['ドイツ','ベルリン'],
      ['イタリア','ローマ'],['スペイン','マドリード'],['ポルトガル','リスボン'],['オランダ','アムステルダム'],
      ['ベルギー','ブリュッセル'],['スイス','ベルン'],['オーストリア','ウィーン'],['スウェーデン','ストックホルム'],
      ['ノルウェー','オスロ'],['フィンランド','ヘルシンキ'],['デンマーク','コペンハーゲン'],['ポーランド','ワルシャワ'],
      ['ロシア','モスクワ'],['ギリシャ','アテネ'],['トルコ','アンカラ'],['エジプト','カイロ'],
      ['ケニア','ナイロビ'],['南アフリカ','プレトリア'],['ナイジェリア','アブジャ'],['中国','北京'],
      ['韓国','ソウル'],['タイ','バンコク'],['ベトナム','ハノイ'],['フィリピン','マニラ'],
      ['インドネシア','ジャカルタ'],['マレーシア','クアラルンプール'],['インド','ニューデリー'],['パキスタン','イスラマバード'],
      ['サウジアラビア','リヤド'],['イラン','テヘラン'],['オーストラリア','キャンベラ'],['ニュージーランド','ウェリントン'],
      ['カナダ','オタワ'],['メキシコ','メキシコシティ'],['ブラジル','ブラジリア'],['アルゼンチン','ブエノスアイレス'],
      ['チリ','サンティアゴ'],['ペルー','リマ'],['コロンビア','ボゴタ'],['モンゴル','ウランバートル'],
    ]
  },
  {
    id: 'element', name: '元素記号', icon: '⚗️', color: '#a55eea', unlock: 3, reversible: true,
    ask: rev => rev ? 'この元素の記号は？' : 'この元素記号の名前は？',
    items: [
      ['H','水素'],['He','ヘリウム'],['Li','リチウム'],['Be','ベリリウム'],['B','ホウ素'],
      ['C','炭素'],['N','窒素'],['O','酸素'],['F','フッ素'],['Ne','ネオン'],
      ['Na','ナトリウム'],['Mg','マグネシウム'],['Al','アルミニウム'],['Si','ケイ素'],['P','リン'],
      ['S','硫黄'],['Cl','塩素'],['Ar','アルゴン'],['K','カリウム'],['Ca','カルシウム'],
      ['Fe','鉄'],['Cu','銅'],['Zn','亜鉛'],['Ag','銀'],['Au','金'],
      ['Hg','水銀'],['Pb','鉛'],['Sn','スズ'],['Ni','ニッケル'],['U','ウラン'],
      ['Mn','マンガン'],['Co','コバルト'],['Pt','白金'],['I','ヨウ素'],['Ti','チタン'],
    ]
  },
  {
    id: 'history', name: '日本史 年号', icon: '🏯', color: '#e74c3c', unlock: 4, reversible: false, near: true,
    ask: () => 'この出来事は何年？',
    items: [
      ['聖徳太子が冠位十二階を制定','603年'],['大化の改新','645年'],['大宝律令の制定','701年'],
      ['平城京に遷都','710年'],['平安京に遷都','794年'],['遣唐使の廃止','894年'],
      ['壇ノ浦の戦い','1185年'],['御成敗式目の制定','1232年'],['文永の役（元寇）','1274年'],
      ['建武の新政','1334年'],['室町幕府の成立（足利尊氏）','1338年'],['応仁の乱が始まる','1467年'],
      ['鉄砲伝来','1543年'],['キリスト教伝来（ザビエル）','1549年'],['桶狭間の戦い','1560年'],
      ['室町幕府の滅亡','1573年'],['本能寺の変','1582年'],['関ヶ原の戦い','1600年'],
      ['江戸幕府の成立','1603年'],['島原・天草一揆','1637年'],['享保の改革','1716年'],
      ['ペリー来航','1853年'],['日米和親条約','1854年'],['大政奉還','1867年'],
      ['大日本帝国憲法の発布','1889年'],['日清戦争','1894年'],['日露戦争','1904年'],
      ['関東大震災','1923年'],['太平洋戦争の終結','1945年'],['日本国憲法の施行','1947年'],
      ['サンフランシスコ平和条約','1951年'],['東京オリンピック（1回目）','1964年'],
    ]
  },
  {
    id: 'eng2', name: '英熟語', icon: '💬', color: '#00cec9', unlock: 6, reversible: true,
    ask: rev => rev ? 'この意味の熟語は？' : 'この熟語の意味は？',
    items: [
      ['look forward to','〜を楽しみに待つ'],['put off','延期する'],['give up','あきらめる'],
      ['carry out','実行する'],['figure out','理解する・解決する'],['come up with','思いつく'],
      ['get rid of','取り除く'],['take part in','参加する'],['make up for','埋め合わせる'],
      ['run out of','使い果たす'],['look up to','尊敬する'],['look down on','見下す'],
      ['put up with','我慢する'],['keep up with','遅れずについていく'],['turn down','断る'],
      ['call off','中止する'],['bring up','育てる'],['deal with','対処する'],
      ['depend on','頼る'],['take after','似ている（親に）'],['get along with','仲良くやる'],
      ['point out','指摘する'],['set up','設立する'],['show up','現れる'],
      ['break down','故障する'],['catch up with','追いつく'],['account for','説明する・占める'],
      ['in spite of','〜にもかかわらず'],['on behalf of','〜を代表して'],['by means of','〜によって'],
    ]
  },
];

// ガチャで集めるキャラ。rarity: N / R / SR / SSR
const CREATURES = [
  // N
  ['slime','スライム','🟢','N'],['mouse','ネズミ','🐭','N'],['frog','カエル','🐸','N'],
  ['chick','ひよこ','🐥','N'],['snail','カタツムリ','🐌','N'],['fish','さかな','🐟','N'],
  ['bug','てんとう虫','🐞','N'],['bee','ミツバチ','🐝','N'],['crab','カニ','🦀','N'],
  ['hamster','ハムスター','🐹','N'],['turtle','カメ','🐢','N'],['rabbit','ウサギ','🐰','N'],
  // R
  ['fox','キツネ','🦊','R'],['panda','パンダ','🐼','R'],['koala','コアラ','🐨','R'],
  ['owl','フクロウ','🦉','R'],['octopus','タコ','🐙','R'],['penguin','ペンギン','🐧','R'],
  ['tiger','トラ','🐯','R'],['wolf','オオカミ','🐺','R'],['dolphin','イルカ','🐬','R'],
  // SR
  ['lion','ライオン','🦁','SR'],['eagle','ワシ','🦅','SR'],['shark','サメ','🦈','SR'],
  ['robot','ロボット','🤖','SR'],['alien','エイリアン','👽','SR'],['ghost','おばけ','👻','SR'],
  ['wizard','まほうつかい','🧙','SR'],
  // SSR
  ['dragon','ドラゴン','🐉','SSR'],['unicorn','ユニコーン','🦄','SSR'],['phoenix','フェニックス','🔥','SSR'],
  ['genius','ひらめき神','🧠','SSR'],
];

const RANK_TITLES = [
  [1,'見習い学徒'],[3,'学びの旅人'],[5,'知識ハンター'],[8,'記憶の騎士'],
  [12,'博識の魔導士'],[16,'叡智の賢者'],[20,'知の覇王'],[30,'伝説の天才'],
];

const MISSION_POOL = [
  {type:'correct', goals:[20,40,60], text:n=>`${n}問 正解する`, reward:40},
  {type:'combo',   goals:[10,15,25], text:n=>`${n}コンボ 達成`, reward:50},
  {type:'plays',   goals:[2,3,5],    text:n=>`${n}回 プレイ`, reward:30},
  {type:'score',   goals:[2000,4000,8000], text:n=>`1回で ${n.toLocaleString()}点`, reward:60},
  {type:'mastered',goals:[3,5,10],   text:n=>`${n}個 新たにマスター`, reward:60},
  {type:'decks',   goals:[2,3],      text:n=>`${n}種類のデッキで遊ぶ`, reward:40},
];

import { RealmInfo, InventoryItem } from '../types/cultivation';

export const REALMS: RealmInfo[] = [
  {
    stage: '煉氣初期',
    level: 1,
    maxExp: 100,
    title: '引氣入體',
    bonusMultiplier: 1.0,
    color: 'from-emerald-400 to-teal-500',
    description: '初窺仙門，感應周天靈氣，洗滌周身凡胎經脈。',
  },
  {
    stage: '煉氣中期',
    level: 2,
    maxExp: 250,
    title: '靈氣聚海',
    bonusMultiplier: 1.2,
    color: 'from-teal-400 to-cyan-500',
    description: '丹田之內靈霧化液，靈氣收發自如，可禦微風。',
  },
  {
    stage: '煉氣圓滿',
    level: 3,
    maxExp: 500,
    title: '脈通周天',
    bonusMultiplier: 1.5,
    color: 'from-cyan-400 to-sky-500',
    description: '十二正經盡通，只待煉化築基丹，破凡成道！',
  },
  {
    stage: '築基初期',
    level: 4,
    maxExp: 1200,
    title: '踏入仙階',
    bonusMultiplier: 2.0,
    color: 'from-blue-400 to-indigo-500',
    description: '道基鑄就，壽元延至二百，靈識外放數十丈，神妙無窮。',
  },
  {
    stage: '築基中期',
    level: 5,
    maxExp: 2500,
    title: '道基凝光',
    bonusMultiplier: 2.8,
    color: 'from-indigo-400 to-purple-500',
    description: '道基璀璨，可禦使中階法寶，施展百步飛劍之術。',
  },
  {
    stage: '築基圓滿',
    level: 6,
    maxExp: 5000,
    title: '九轉凝丹',
    bonusMultiplier: 4.0,
    color: 'from-purple-400 to-fuchsia-500',
    description: '道基圓滿如一，周身隱現五色霞光，即將迎來金丹雷劫。',
  },
  {
    stage: '金丹初期',
    level: 7,
    maxExp: 12000,
    title: '一顆金丹吞入腹',
    bonusMultiplier: 6.5,
    color: 'from-amber-400 to-orange-500',
    description: '我命由我不由天！凝結上品金丹，壽延五百載，遨遊青冥。',
  },
  {
    stage: '金丹中期',
    level: 8,
    maxExp: 25000,
    title: '丹火化靈',
    bonusMultiplier: 10.0,
    color: 'from-orange-400 to-rose-500',
    description: '金丹生火，淬煉本命法寶，能翻江倒海，威懾一方。',
  },
  {
    stage: '元嬰老祖',
    level: 9,
    maxExp: 60000,
    title: '元神破體出',
    bonusMultiplier: 18.0,
    color: 'from-rose-400 to-pink-500',
    description: '碎丹成嬰！哪怕肉身泯滅，元嬰亦可神遊太虛，重塑生機。',
  },
  {
    stage: '化神天尊',
    level: 10,
    maxExp: 150000,
    title: '同參天地造化',
    bonusMultiplier: 35.0,
    color: 'from-yellow-300 via-amber-400 to-emerald-400',
    description: '感悟天地大道法則，言出法隨，俯瞰凡塵滄海桑田。',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'pill-1',
    name: '凝氣丹',
    type: 'pill',
    grade: '一品',
    count: 3,
    icon: '💊',
    description: '煉氣期必備靈丹，服用可瞬間增長 30 點靈氣修為。',
  },
  {
    id: 'herb-1',
    name: '玄冰靈草',
    type: 'herb',
    grade: '一品',
    count: 5,
    icon: '🌿',
    description: '生長於極寒山澗，葉泛微霜，是煉製築基丹的主藥之一。',
  },
  {
    id: 'talisman-1',
    name: '清心辟邪符',
    type: 'talisman',
    grade: '一品',
    count: 2,
    icon: '📜',
    description: '以硃砂畫就的安神符，冥想時可防止心魔擾亂。',
  },
  {
    id: 'stone-1',
    name: '下品靈石',
    type: 'material',
    grade: '靈材',
    count: 120,
    icon: '💎',
    description: '修仙界通用貨幣，蘊含精純天地靈氣。',
  },
];

// Dialogue lines from Xiaoxue in her chamber
export const XIAOXUE_DIALOGUES = [
  {
    text: '道友，你來啦？小雪方才正在運轉《太玄冰心訣》，感覺洞府外的靈氣越發充沛了呢。',
    emotion: 'gentle',
  },
  {
    text: '修仙之道，貴在持之以恆。今日可有去靈田澆灌靈藥，或是去野外降妖歷練？',
    emotion: 'caring',
  },
  {
    text: '聽聞九幽深處近日有萬年靈鰲現世，若道友去河邊垂釣，說不定能撞大運呢！',
    emotion: 'curious',
  },
  {
    text: '這本上古真言玉簡（英文咒語）好生奇妙，每參悟一個真言，靈力運轉便迅捷一分！',
    emotion: 'excited',
  },
  {
    text: '若感到心緒煩亂，不妨坐下來與小雪一起靜心冥想片刻，吐納天地初曦。',
    emotion: 'serene',
  },
];

// English incantations data for English learning module
export interface EnglishSpell {
  id: string;
  word: string;
  phonetic: string;
  chinese: string;
  spellName: string;
  missingIndex: number[];
  hint: string;
  spiritReward: number;
}

export const ENGLISH_SPELLS: EnglishSpell[] = [
  {
    id: 'spell-1',
    word: 'SPIRIT',
    phonetic: '/ˈspɪrɪt/',
    chinese: '靈魂、神識、精靈',
    spellName: '太初聚靈訣',
    missingIndex: [2, 4], // S P [I] R [I] T
    hint: '修煉之根本，感應天地純淨之氣',
    spiritReward: 35,
  },
  {
    id: 'spell-2',
    word: 'SHIELD',
    phonetic: '/ʃiːld/',
    chinese: '護盾、庇護',
    spellName: '玄光金鐘罡氣',
    missingIndex: [1, 3], // S [H] I [E] L D
    hint: '抵擋妖獸猛烈撞擊之防護術法',
    spiritReward: 40,
  },
  {
    id: 'spell-3',
    word: 'FLAME',
    phonetic: '/fleɪm/',
    chinese: '火焰、烈焰',
    spellName: '三昧三真天火',
    missingIndex: [2, 4], // F L [A] M [E]
    hint: '煉丹與焚魔所驅使之灼熱法印',
    spiritReward: 30,
  },
  {
    id: 'spell-4',
    word: 'WISDOM',
    phonetic: '/ˈwɪzdəm/',
    chinese: '智慧、悟性',
    spellName: '大通靈感慧心訣',
    missingIndex: [1, 4], // W [I] S D [O] M
    hint: '破除心魔，參悟上古天機大道',
    spiritReward: 50,
  },
  {
    id: 'spell-5',
    word: 'BREATHE',
    phonetic: '/briːð/',
    chinese: '呼吸、吐納',
    spellName: '太虛引氣吐納法',
    missingIndex: [2, 5], // B R [E] A T [H] E
    hint: '打坐時調勻氣息，與天地共振',
    spiritReward: 45,
  },
  {
    id: 'spell-6',
    word: 'THUNDER',
    phonetic: '/ˈθʌndər/',
    chinese: '雷霆、天雷',
    spellName: '九天應元九霄神雷',
    missingIndex: [2, 4], // T H [U] N [D] E R
    hint: '度劫渡虛空之至高天威法術',
    spiritReward: 60,
  },
];

// Alchemy recipes
export interface AlchemyRecipe {
  id: string;
  name: string;
  targetItemName: string;
  grade: string;
  expReward: number;
  ingredients: { name: string; count: number }[];
  description: string;
  successRate: number;
}

export const ALCHEMY_RECIPES: AlchemyRecipe[] = [
  {
    id: 'recipe-1',
    name: '聚氣益神丹',
    targetItemName: '凝氣丹',
    grade: '一品靈丹',
    expReward: 40,
    ingredients: [
      { name: '玄冰靈草', count: 2 },
      { name: '靈泉清露', count: 1 },
    ],
    description: '最基礎的固本培元之丹，服下後可增進靈氣 35 點。',
    successRate: 90,
  },
  {
    id: 'recipe-2',
    name: '九轉金靈散',
    targetItemName: '金靈散',
    grade: '二品靈丹',
    expReward: 90,
    ingredients: [
      { name: '玄冰靈草', count: 3 },
      { name: '赤陽朱果', count: 2 },
    ],
    description: '服之百脈俱暢，可大幅增強飛劍威力與體魄防禦。',
    successRate: 75,
  },
  {
    id: 'recipe-3',
    name: '九陽築基天丹',
    targetItemName: '築基天丹',
    grade: '三品寶丹',
    expReward: 260,
    ingredients: [
      { name: '紫霄龍芝', count: 2 },
      { name: '赤陽朱果', count: 3 },
      { name: '妖獸內丹', count: 1 },
    ],
    description: '突破煉氣巔峰、邁入築基仙階的不世神丹，能洗伐骨髓！',
    successRate: 60,
  },
];

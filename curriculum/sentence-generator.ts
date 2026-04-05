/**
 * Template-Based Japanese Sentence Generator
 *
 * Produces thousands of unique, grammatically correct Japanese sentences
 * per JLPT level with automatic word-by-word breakdowns.
 * No API calls required — pure combinatorial generation.
 *
 * Architecture:
 * - Vocabulary pools: categorized word banks per level
 * - Grammar templates: sentence patterns with fillable slots
 * - Generator: picks template + vocab, builds sentence + breakdown
 */

import type { ListeningSentence, JLPTLevel } from './listening-bank';

// ─── Types ───────────────────────────────────────────────────

interface VocabEntry {
  word: string;
  reading?: string;
  meaning: string;
}

type VocabPool = Record<string, VocabEntry[]>;

interface BreakdownEntry {
  word: string;
  reading?: string;
  meaning: string;
}

interface SentenceTemplate {
  /** Pattern with {slotName} placeholders, e.g. "{time}に{place}へ行きます。" */
  pattern: string;
  /** English with {slotName} placeholders, e.g. "I go to {place} at {time}." */
  english: string;
  /** Which vocab pool fills each slot */
  slots: { key: string; pool: string }[];
  /** Fixed grammar parts in order of appearance (particles, verb endings, etc.) */
  fixed: BreakdownEntry[];
}

// ─── Core Engine ─────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickDistinct<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildSentence(
  template: SentenceTemplate,
  vocab: VocabPool
): ListeningSentence {
  // Pick vocab for each slot
  const picks: Record<string, VocabEntry> = {};
  const usedPerPool: Record<string, Set<string>> = {};

  for (const slot of template.slots) {
    const pool = vocab[slot.pool];
    if (!pool || pool.length === 0) continue;

    // Avoid picking the same word twice from same pool
    if (!usedPerPool[slot.pool]) usedPerPool[slot.pool] = new Set();
    const available = pool.filter((v) => !usedPerPool[slot.pool].has(v.word));
    const entry = pickRandom(available.length > 0 ? available : pool);
    picks[slot.key] = entry;
    usedPerPool[slot.pool].add(entry.word);
  }

  // Build japanese and english by replacing placeholders
  let japanese = template.pattern;
  let english = template.english;
  for (const [key, entry] of Object.entries(picks)) {
    japanese = japanese.replaceAll(`{${key}}`, entry.word);
    english = english.replaceAll(`{${key}}`, entry.meaning);
  }

  // Build breakdown by walking the pattern left-to-right
  const breakdown: BreakdownEntry[] = [];
  const segments = template.pattern.split(/(\{[^}]+\})/);
  let fixedIdx = 0;

  for (const seg of segments) {
    if (!seg) continue;
    const slotMatch = seg.match(/^\{(.+)\}$/);
    if (slotMatch) {
      const entry = picks[slotMatch[1]];
      if (entry) {
        breakdown.push({
          word: entry.word,
          reading: entry.reading,
          meaning: entry.meaning,
        });
      }
    } else {
      // Match fixed breakdown entries that belong to this segment
      while (fixedIdx < template.fixed.length) {
        const fb = template.fixed[fixedIdx];
        if (seg.includes(fb.word)) {
          breakdown.push(fb);
          fixedIdx++;
        } else {
          break;
        }
      }
    }
  }

  return { japanese, english, breakdown };
}

// ─── N5 Vocabulary ───────────────────────────────────────────

const N5_VOCAB: VocabPool = {
  person: [
    { word: '友達', reading: 'ともだち', meaning: 'friend' },
    { word: '先生', reading: 'せんせい', meaning: 'teacher' },
    { word: '学生', reading: 'がくせい', meaning: 'student' },
    { word: '子供', reading: 'こども', meaning: 'child' },
    { word: '母', reading: 'はは', meaning: 'mother' },
    { word: '父', reading: 'ちち', meaning: 'father' },
    { word: '兄', reading: 'あに', meaning: 'older brother' },
    { word: '姉', reading: 'あね', meaning: 'older sister' },
    { word: '弟', reading: 'おとうと', meaning: 'younger brother' },
    { word: '妹', reading: 'いもうと', meaning: 'younger sister' },
    { word: '彼', reading: 'かれ', meaning: 'he' },
    { word: '彼女', reading: 'かのじょ', meaning: 'she' },
    { word: '田中さん', reading: 'たなかさん', meaning: 'Mr. Tanaka' },
    { word: '山田さん', reading: 'やまださん', meaning: 'Mr. Yamada' },
    { word: '鈴木さん', reading: 'すずきさん', meaning: 'Ms. Suzuki' },
  ],
  place: [
    { word: '学校', reading: 'がっこう', meaning: 'school' },
    { word: '駅', reading: 'えき', meaning: 'station' },
    { word: '病院', reading: 'びょういん', meaning: 'hospital' },
    { word: '図書館', reading: 'としょかん', meaning: 'library' },
    { word: 'スーパー', meaning: 'supermarket' },
    { word: 'レストラン', meaning: 'restaurant' },
    { word: '公園', reading: 'こうえん', meaning: 'park' },
    { word: '銀行', reading: 'ぎんこう', meaning: 'bank' },
    { word: '郵便局', reading: 'ゆうびんきょく', meaning: 'post office' },
    { word: 'ホテル', meaning: 'hotel' },
    { word: 'コンビニ', meaning: 'convenience store' },
    { word: 'デパート', meaning: 'department store' },
    { word: '空港', reading: 'くうこう', meaning: 'airport' },
    { word: '会社', reading: 'かいしゃ', meaning: 'company' },
    { word: 'うち', meaning: 'home' },
  ],
  food: [
    { word: 'ご飯', reading: 'ごはん', meaning: 'rice / meal' },
    { word: 'パン', meaning: 'bread' },
    { word: '魚', reading: 'さかな', meaning: 'fish' },
    { word: '肉', reading: 'にく', meaning: 'meat' },
    { word: '卵', reading: 'たまご', meaning: 'egg' },
    { word: '野菜', reading: 'やさい', meaning: 'vegetables' },
    { word: 'りんご', meaning: 'apple' },
    { word: 'ラーメン', meaning: 'ramen' },
    { word: 'おにぎり', meaning: 'rice ball' },
    { word: 'カレー', meaning: 'curry' },
    { word: '寿司', reading: 'すし', meaning: 'sushi' },
    { word: 'そば', meaning: 'soba noodles' },
    { word: 'サラダ', meaning: 'salad' },
    { word: 'ケーキ', meaning: 'cake' },
    { word: 'みかん', meaning: 'mandarin orange' },
  ],
  drink: [
    { word: '水', reading: 'みず', meaning: 'water' },
    { word: 'お茶', reading: 'おちゃ', meaning: 'tea' },
    { word: 'コーヒー', meaning: 'coffee' },
    { word: 'ジュース', meaning: 'juice' },
    { word: '牛乳', reading: 'ぎゅうにゅう', meaning: 'milk' },
    { word: 'ビール', meaning: 'beer' },
  ],
  time: [
    { word: '朝', reading: 'あさ', meaning: 'morning' },
    { word: '昼', reading: 'ひる', meaning: 'noon' },
    { word: '夜', reading: 'よる', meaning: 'night' },
    { word: '今日', reading: 'きょう', meaning: 'today' },
    { word: '明日', reading: 'あした', meaning: 'tomorrow' },
    { word: '昨日', reading: 'きのう', meaning: 'yesterday' },
    { word: '毎日', reading: 'まいにち', meaning: 'every day' },
    { word: '毎朝', reading: 'まいあさ', meaning: 'every morning' },
    { word: '週末', reading: 'しゅうまつ', meaning: 'weekend' },
    { word: '月曜日', reading: 'げつようび', meaning: 'Monday' },
    { word: '来週', reading: 'らいしゅう', meaning: 'next week' },
    { word: '先週', reading: 'せんしゅう', meaning: 'last week' },
  ],
  adjI: [
    { word: '大きい', reading: 'おおきい', meaning: 'big' },
    { word: '小さい', reading: 'ちいさい', meaning: 'small' },
    { word: '新しい', reading: 'あたらしい', meaning: 'new' },
    { word: '古い', reading: 'ふるい', meaning: 'old' },
    { word: '高い', reading: 'たかい', meaning: 'expensive' },
    { word: '安い', reading: 'やすい', meaning: 'cheap' },
    { word: '美味しい', reading: 'おいしい', meaning: 'delicious' },
    { word: '楽しい', reading: 'たのしい', meaning: 'fun' },
    { word: '難しい', reading: 'むずかしい', meaning: 'difficult' },
    { word: '近い', reading: 'ちかい', meaning: 'near' },
    { word: '遠い', reading: 'とおい', meaning: 'far' },
    { word: '暑い', reading: 'あつい', meaning: 'hot' },
    { word: '寒い', reading: 'さむい', meaning: 'cold' },
    { word: '忙しい', reading: 'いそがしい', meaning: 'busy' },
    { word: '面白い', reading: 'おもしろい', meaning: 'interesting' },
  ],
  adjNa: [
    { word: '元気', reading: 'げんき', meaning: 'energetic' },
    { word: '静か', reading: 'しずか', meaning: 'quiet' },
    { word: '好き', reading: 'すき', meaning: 'liked' },
    { word: '嫌い', reading: 'きらい', meaning: 'disliked' },
    { word: '有名', reading: 'ゆうめい', meaning: 'famous' },
    { word: '便利', reading: 'べんり', meaning: 'convenient' },
    { word: '大変', reading: 'たいへん', meaning: 'tough' },
    { word: '大切', reading: 'たいせつ', meaning: 'important' },
    { word: '簡単', reading: 'かんたん', meaning: 'easy' },
    { word: '綺麗', reading: 'きれい', meaning: 'beautiful' },
  ],
  thing: [
    { word: '本', reading: 'ほん', meaning: 'book' },
    { word: '映画', reading: 'えいが', meaning: 'movie' },
    { word: '音楽', reading: 'おんがく', meaning: 'music' },
    { word: '写真', reading: 'しゃしん', meaning: 'photo' },
    { word: '電話', reading: 'でんわ', meaning: 'phone' },
    { word: '手紙', reading: 'てがみ', meaning: 'letter' },
    { word: '鍵', reading: 'かぎ', meaning: 'key' },
    { word: '傘', reading: 'かさ', meaning: 'umbrella' },
    { word: '財布', reading: 'さいふ', meaning: 'wallet' },
    { word: '時計', reading: 'とけい', meaning: 'watch / clock' },
    { word: '新聞', reading: 'しんぶん', meaning: 'newspaper' },
    { word: 'かばん', meaning: 'bag' },
  ],
  transport: [
    { word: '電車', reading: 'でんしゃ', meaning: 'train' },
    { word: 'バス', meaning: 'bus' },
    { word: 'タクシー', meaning: 'taxi' },
    { word: '自転車', reading: 'じてんしゃ', meaning: 'bicycle' },
    { word: '車', reading: 'くるま', meaning: 'car' },
    { word: '飛行機', reading: 'ひこうき', meaning: 'airplane' },
  ],
};

// ─── N5 Templates ────────────────────────────────────────────

const N5_TEMPLATES: SentenceTemplate[] = [
  // {person} は {place} に行きます。
  {
    pattern: '{person}は{place}に行きます。',
    english: '{person} goes to {place}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'place', pool: 'place' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'に', meaning: 'to (direction)' },
      { word: '行きます', reading: 'いきます', meaning: 'go' },
    ],
  },
  // {time} {food} を食べます。
  {
    pattern: '{time}に{food}を食べます。',
    english: 'I eat {food} in the {time}.',
    slots: [
      { key: 'time', pool: 'time' },
      { key: 'food', pool: 'food' },
    ],
    fixed: [
      { word: 'に', meaning: 'at (time)' },
      { word: 'を', meaning: 'object marker' },
      { word: '食べます', reading: 'たべます', meaning: 'eat' },
    ],
  },
  // {drink} をください。
  {
    pattern: '{drink}をください。',
    english: 'Please give me {drink}.',
    slots: [{ key: 'drink', pool: 'drink' }],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: 'ください', meaning: 'please give me' },
    ],
  },
  // {place} は {adjI} です。
  {
    pattern: '{place}は{adjI}です。',
    english: '{place} is {adjI}.',
    slots: [
      { key: 'place', pool: 'place' },
      { key: 'adjI', pool: 'adjI' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {person} は {adjNa} です。
  {
    pattern: '{person}は{adjNa}です。',
    english: '{person} is {adjNa}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'adjNa', pool: 'adjNa' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {person} は {food} が好きです。
  {
    pattern: '{person}は{food}が好きです。',
    english: '{person} likes {food}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'food', pool: 'food' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'が', meaning: 'subject marker' },
      { word: '好き', reading: 'すき', meaning: 'like' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {transport} で {place} に行きます。
  {
    pattern: '{transport}で{place}に行きます。',
    english: 'I go to {place} by {transport}.',
    slots: [
      { key: 'transport', pool: 'transport' },
      { key: 'place', pool: 'place' },
    ],
    fixed: [
      { word: 'で', meaning: 'by (means)' },
      { word: 'に', meaning: 'to (direction)' },
      { word: '行きます', reading: 'いきます', meaning: 'go' },
    ],
  },
  // {thing} はどこですか。
  {
    pattern: '{thing}はどこですか。',
    english: 'Where is the {thing}?',
    slots: [{ key: 'thing', pool: 'thing' }],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'どこ', meaning: 'where' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  // {person} に {thing} をあげます。
  {
    pattern: '{person}に{thing}をあげます。',
    english: 'I give {thing} to {person}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'thing', pool: 'thing' },
    ],
    fixed: [
      { word: 'に', meaning: 'to (recipient)' },
      { word: 'を', meaning: 'object marker' },
      { word: 'あげます', meaning: 'give' },
    ],
  },
  // {person} と {place} に行きました。
  {
    pattern: '{person}と{place}に行きました。',
    english: 'I went to {place} with {person}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'place', pool: 'place' },
    ],
    fixed: [
      { word: 'と', meaning: 'with / and' },
      { word: 'に', meaning: 'to (direction)' },
      { word: '行きました', reading: 'いきました', meaning: 'went' },
    ],
  },
  // {time} {drink} を飲みます。
  {
    pattern: '{time}に{drink}を飲みます。',
    english: 'I drink {drink} in the {time}.',
    slots: [
      { key: 'time', pool: 'time' },
      { key: 'drink', pool: 'drink' },
    ],
    fixed: [
      { word: 'に', meaning: 'at (time)' },
      { word: 'を', meaning: 'object marker' },
      { word: '飲みます', reading: 'のみます', meaning: 'drink' },
    ],
  },
  // {place} で {food} を食べました。
  {
    pattern: '{place}で{food}を食べました。',
    english: 'I ate {food} at {place}.',
    slots: [
      { key: 'place', pool: 'place' },
      { key: 'food', pool: 'food' },
    ],
    fixed: [
      { word: 'で', meaning: 'at (location)' },
      { word: 'を', meaning: 'object marker' },
      { word: '食べました', reading: 'たべました', meaning: 'ate' },
    ],
  },
  // {thing} を買いました。
  {
    pattern: '{place}で{thing}を買いました。',
    english: 'I bought {thing} at {place}.',
    slots: [
      { key: 'place', pool: 'place' },
      { key: 'thing', pool: 'thing' },
    ],
    fixed: [
      { word: 'で', meaning: 'at (location)' },
      { word: 'を', meaning: 'object marker' },
      { word: '買いました', reading: 'かいました', meaning: 'bought' },
    ],
  },
  // {person} は {thing} を持っています。
  {
    pattern: '{person}は{thing}を持っています。',
    english: '{person} has {thing}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'thing', pool: 'thing' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'を', meaning: 'object marker' },
      { word: '持っています', reading: 'もっています', meaning: 'has / is holding' },
    ],
  },
  // この {thing} は {adjI} です。
  {
    pattern: 'この{thing}は{adjI}です。',
    english: 'This {thing} is {adjI}.',
    slots: [
      { key: 'thing', pool: 'thing' },
      { key: 'adjI', pool: 'adjI' },
    ],
    fixed: [
      { word: 'この', meaning: 'this' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {person} は {place} で働いています。
  {
    pattern: '{person}は{place}で働いています。',
    english: '{person} works at {place}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'place', pool: 'place' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'で', meaning: 'at (location)' },
      { word: '働いています', reading: 'はたらいています', meaning: 'is working' },
    ],
  },
  // {place} まで何分かかりますか。
  {
    pattern: '{place}まで何分かかりますか。',
    english: 'How many minutes does it take to {place}?',
    slots: [{ key: 'place', pool: 'place' }],
    fixed: [
      { word: 'まで', meaning: 'until / to' },
      { word: '何分', reading: 'なんぷん', meaning: 'how many minutes' },
      { word: 'かかります', meaning: 'it takes' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  // {person} は {time} に起きます。
  {
    pattern: '{person}は{time}に起きます。',
    english: '{person} wakes up in the {time}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'time', pool: 'time' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'に', meaning: 'at (time)' },
      { word: '起きます', reading: 'おきます', meaning: 'wake up' },
    ],
  },
  // {thing} を忘れました。
  {
    pattern: '{thing}を忘れました。',
    english: 'I forgot my {thing}.',
    slots: [{ key: 'thing', pool: 'thing' }],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: '忘れました', reading: 'わすれました', meaning: 'forgot' },
    ],
  },
  // {person} に会いたいです。
  {
    pattern: '{person}に会いたいです。',
    english: 'I want to meet {person}.',
    slots: [{ key: 'person', pool: 'person' }],
    fixed: [
      { word: 'に', meaning: 'target marker' },
      { word: '会いたい', reading: 'あいたい', meaning: 'want to meet' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {food} は {adjI} です。
  {
    pattern: '{food}は{adjI}です。',
    english: '{food} is {adjI}.',
    slots: [
      { key: 'food', pool: 'food' },
      { key: 'adjI', pool: 'adjI' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {person} から {thing} をもらいました。
  {
    pattern: '{person}から{thing}をもらいました。',
    english: 'I received {thing} from {person}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'thing', pool: 'thing' },
    ],
    fixed: [
      { word: 'から', meaning: 'from' },
      { word: 'を', meaning: 'object marker' },
      { word: 'もらいました', meaning: 'received' },
    ],
  },
  // {time} {place} に行きたいです。
  {
    pattern: '{time}{place}に行きたいです。',
    english: 'I want to go to {place} {time}.',
    slots: [
      { key: 'time', pool: 'time' },
      { key: 'place', pool: 'place' },
    ],
    fixed: [
      { word: 'に', meaning: 'to (direction)' },
      { word: '行きたい', reading: 'いきたい', meaning: 'want to go' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {person} は {thing} を読んでいます。
  {
    pattern: '{person}は{thing}を読んでいます。',
    english: '{person} is reading {thing}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'thing', pool: 'thing' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'を', meaning: 'object marker' },
      { word: '読んでいます', reading: 'よんでいます', meaning: 'is reading' },
    ],
  },
  // {place} の {food} は有名です。
  {
    pattern: '{place}の{food}は有名です。',
    english: 'The {food} at {place} is famous.',
    slots: [
      { key: 'place', pool: 'place' },
      { key: 'food', pool: 'food' },
    ],
    fixed: [
      { word: 'の', meaning: 'possessive marker' },
      { word: 'は', meaning: 'topic marker' },
      { word: '有名', reading: 'ゆうめい', meaning: 'famous' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
];

// ─── N4 Vocabulary (inherits N5 + additions) ─────────────────

const N4_VOCAB: VocabPool = {
  ...N5_VOCAB,
  hobby: [
    { word: '料理', reading: 'りょうり', meaning: 'cooking' },
    { word: '旅行', reading: 'りょこう', meaning: 'traveling' },
    { word: '買い物', reading: 'かいもの', meaning: 'shopping' },
    { word: '散歩', reading: 'さんぽ', meaning: 'a walk' },
    { word: 'スポーツ', meaning: 'sports' },
    { word: '読書', reading: 'どくしょ', meaning: 'reading' },
    { word: '写真撮影', reading: 'しゃしんさつえい', meaning: 'photography' },
    { word: '釣り', reading: 'つり', meaning: 'fishing' },
    { word: 'ゲーム', meaning: 'games' },
    { word: '絵を描くこと', reading: 'えをかくこと', meaning: 'drawing' },
  ],
  reason: [
    { word: '仕事', reading: 'しごと', meaning: 'work' },
    { word: '勉強', reading: 'べんきょう', meaning: 'studying' },
    { word: '約束', reading: 'やくそく', meaning: 'a promise' },
    { word: '用事', reading: 'ようじ', meaning: 'errands' },
    { word: '病気', reading: 'びょうき', meaning: 'illness' },
    { word: '天気', reading: 'てんき', meaning: 'weather' },
    { word: '試験', reading: 'しけん', meaning: 'an exam' },
    { word: '会議', reading: 'かいぎ', meaning: 'a meeting' },
  ],
  emotion: [
    { word: '嬉しい', reading: 'うれしい', meaning: 'happy' },
    { word: '悲しい', reading: 'かなしい', meaning: 'sad' },
    { word: '怒っている', reading: 'おこっている', meaning: 'angry' },
    { word: '心配', reading: 'しんぱい', meaning: 'worried' },
    { word: '疲れている', reading: 'つかれている', meaning: 'tired' },
    { word: '驚いている', reading: 'おどろいている', meaning: 'surprised' },
    { word: '困っている', reading: 'こまっている', meaning: 'troubled' },
    { word: '緊張している', reading: 'きんちょうしている', meaning: 'nervous' },
  ],
};

const N4_TEMPLATES: SentenceTemplate[] = [
  // {place} に行ったことがあります。
  {
    pattern: '{place}に行ったことがあります。',
    english: 'I have been to {place} before.',
    slots: [{ key: 'place', pool: 'place' }],
    fixed: [
      { word: 'に', meaning: 'to (direction)' },
      { word: '行った', reading: 'いった', meaning: 'went' },
      { word: 'こと', meaning: 'experience (nominalizer)' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'あります', meaning: 'there is / have' },
    ],
  },
  // {food} を食べてみたいです。
  {
    pattern: '{food}を食べてみたいです。',
    english: 'I want to try eating {food}.',
    slots: [{ key: 'food', pool: 'food' }],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: '食べてみたい', reading: 'たべてみたい', meaning: 'want to try eating' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {reason} があるので、{place} に行けません。
  {
    pattern: '{reason}があるので、{place}に行けません。',
    english: 'I have {reason}, so I cannot go to {place}.',
    slots: [
      { key: 'reason', pool: 'reason' },
      { key: 'place', pool: 'place' },
    ],
    fixed: [
      { word: 'が', meaning: 'subject marker' },
      { word: 'ある', meaning: 'there is' },
      { word: 'ので', meaning: 'because' },
      { word: 'に', meaning: 'to (direction)' },
      { word: '行けません', reading: 'いけません', meaning: 'cannot go' },
    ],
  },
  // 趣味は {hobby} です。
  {
    pattern: '趣味は{hobby}です。',
    english: 'My hobby is {hobby}.',
    slots: [{ key: 'hobby', pool: 'hobby' }],
    fixed: [
      { word: '趣味', reading: 'しゅみ', meaning: 'hobby' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {person} は {emotion} そうです。
  {
    pattern: '{person}は{emotion}そうです。',
    english: '{person} looks {emotion}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'emotion', pool: 'emotion' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'そうです', meaning: 'looks like / seems' },
    ],
  },
  // {food} を作ることができます。
  {
    pattern: '{food}を作ることができます。',
    english: 'I can make {food}.',
    slots: [{ key: 'food', pool: 'food' }],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: '作る', reading: 'つくる', meaning: 'to make' },
      { word: 'こと', meaning: 'thing (nominalizer)' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'できます', meaning: 'can do' },
    ],
  },
  // {time} までに {reason} を終わらせなければなりません。
  {
    pattern: '{time}までに{reason}を終わらせなければなりません。',
    english: 'I must finish {reason} by {time}.',
    slots: [
      { key: 'time', pool: 'time' },
      { key: 'reason', pool: 'reason' },
    ],
    fixed: [
      { word: 'までに', meaning: 'by (deadline)' },
      { word: 'を', meaning: 'object marker' },
      { word: '終わらせなければなりません', reading: 'おわらせなければなりません', meaning: 'must finish' },
    ],
  },
  // {place} に行く前に、{food} を食べましょう。
  {
    pattern: '{place}に行く前に、{food}を食べましょう。',
    english: 'Before going to {place}, let\'s eat {food}.',
    slots: [
      { key: 'place', pool: 'place' },
      { key: 'food', pool: 'food' },
    ],
    fixed: [
      { word: 'に', meaning: 'to (direction)' },
      { word: '行く', reading: 'いく', meaning: 'to go' },
      { word: '前に', reading: 'まえに', meaning: 'before' },
      { word: 'を', meaning: 'object marker' },
      { word: '食べましょう', reading: 'たべましょう', meaning: 'let\'s eat' },
    ],
  },
  // {person} が来たら、{food} を出してください。
  {
    pattern: '{person}が来たら、{food}を出してください。',
    english: 'When {person} comes, please serve {food}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'food', pool: 'food' },
    ],
    fixed: [
      { word: 'が', meaning: 'subject marker' },
      { word: '来たら', reading: 'きたら', meaning: 'when comes' },
      { word: 'を', meaning: 'object marker' },
      { word: '出してください', reading: 'だしてください', meaning: 'please serve / bring out' },
    ],
  },
  // {person} は {place} に住んでいます。
  {
    pattern: '{person}は{place}に住んでいます。',
    english: '{person} lives in {place}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'place', pool: 'place' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'に', meaning: 'in (location)' },
      { word: '住んでいます', reading: 'すんでいます', meaning: 'is living' },
    ],
  },
  // {thing} をなくしてしまいました。
  {
    pattern: '{thing}をなくしてしまいました。',
    english: 'I ended up losing my {thing}.',
    slots: [{ key: 'thing', pool: 'thing' }],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: 'なくしてしまいました', meaning: 'ended up losing' },
    ],
  },
  // {person} に {hobby} を教えてもらいました。
  {
    pattern: '{person}に{hobby}を教えてもらいました。',
    english: '{person} taught me {hobby}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'hobby', pool: 'hobby' },
    ],
    fixed: [
      { word: 'に', meaning: 'by (person)' },
      { word: 'を', meaning: 'object marker' },
      { word: '教えてもらいました', reading: 'おしえてもらいました', meaning: 'was taught (received teaching)' },
    ],
  },
  // {place} は {adjI}くて、{adjNa} です。
  {
    pattern: '{place}は{adjI}くて、{adjNa}です。',
    english: '{place} is {adjI} and {adjNa}.',
    slots: [
      { key: 'place', pool: 'place' },
      { key: 'adjI', pool: 'adjI' },
      { key: 'adjNa', pool: 'adjNa' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'くて', meaning: 'and (i-adj connector)' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {time} から {time2} まで {reason} をしていました。
  {
    pattern: '{time}から{time2}まで{reason}をしていました。',
    english: 'I was doing {reason} from {time} to {time2}.',
    slots: [
      { key: 'time', pool: 'time' },
      { key: 'time2', pool: 'time' },
      { key: 'reason', pool: 'reason' },
    ],
    fixed: [
      { word: 'から', meaning: 'from' },
      { word: 'まで', meaning: 'until' },
      { word: 'を', meaning: 'object marker' },
      { word: 'していました', meaning: 'was doing' },
    ],
  },
  // {person} は {food} を食べながら、{thing} を見ています。
  {
    pattern: '{person}は{food}を食べながら、{thing}を見ています。',
    english: '{person} is watching {thing} while eating {food}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'food', pool: 'food' },
      { key: 'thing', pool: 'thing' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'を', meaning: 'object marker' },
      { word: '食べながら', reading: 'たべながら', meaning: 'while eating' },
      { word: 'を', meaning: 'object marker' },
      { word: '見ています', reading: 'みています', meaning: 'is watching' },
    ],
  },
];

// ─── N3 Vocabulary ───────────────────────────────────────────

const N3_VOCAB: VocabPool = {
  ...N4_VOCAB,
  abstract: [
    { word: '経験', reading: 'けいけん', meaning: 'experience' },
    { word: '関係', reading: 'かんけい', meaning: 'relationship' },
    { word: '機会', reading: 'きかい', meaning: 'opportunity' },
    { word: '結果', reading: 'けっか', meaning: 'result' },
    { word: '問題', reading: 'もんだい', meaning: 'problem' },
    { word: '意見', reading: 'いけん', meaning: 'opinion' },
    { word: '習慣', reading: 'しゅうかん', meaning: 'habit' },
    { word: '目標', reading: 'もくひょう', meaning: 'goal' },
    { word: '影響', reading: 'えいきょう', meaning: 'influence' },
    { word: '理由', reading: 'りゆう', meaning: 'reason' },
    { word: '変化', reading: 'へんか', meaning: 'change' },
    { word: '努力', reading: 'どりょく', meaning: 'effort' },
  ],
  opinion: [
    { word: '大切だ', reading: 'たいせつだ', meaning: 'important' },
    { word: '必要だ', reading: 'ひつようだ', meaning: 'necessary' },
    { word: '難しい', reading: 'むずかしい', meaning: 'difficult' },
    { word: '面白い', reading: 'おもしろい', meaning: 'interesting' },
    { word: '素晴らしい', reading: 'すばらしい', meaning: 'wonderful' },
    { word: '残念だ', reading: 'ざんねんだ', meaning: 'unfortunate' },
    { word: '当然だ', reading: 'とうぜんだ', meaning: 'natural / obvious' },
    { word: '不思議だ', reading: 'ふしぎだ', meaning: 'mysterious' },
  ],
  action: [
    { word: '参加する', reading: 'さんかする', meaning: 'to participate' },
    { word: '準備する', reading: 'じゅんびする', meaning: 'to prepare' },
    { word: '説明する', reading: 'せつめいする', meaning: 'to explain' },
    { word: '連絡する', reading: 'れんらくする', meaning: 'to contact' },
    { word: '相談する', reading: 'そうだんする', meaning: 'to consult' },
    { word: '注意する', reading: 'ちゅういする', meaning: 'to be careful' },
    { word: '紹介する', reading: 'しょうかいする', meaning: 'to introduce' },
    { word: '経験する', reading: 'けいけんする', meaning: 'to experience' },
  ],
};

const N3_TEMPLATES: SentenceTemplate[] = [
  // {abstract} について考えています。
  {
    pattern: '{abstract}について考えています。',
    english: 'I am thinking about {abstract}.',
    slots: [{ key: 'abstract', pool: 'abstract' }],
    fixed: [
      { word: 'について', meaning: 'about / regarding' },
      { word: '考えています', reading: 'かんがえています', meaning: 'am thinking' },
    ],
  },
  // {person} によると、{place} は {adjI} そうです。
  {
    pattern: '{person}によると、{place}は{adjI}そうです。',
    english: 'According to {person}, {place} is apparently {adjI}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'place', pool: 'place' },
      { key: 'adjI', pool: 'adjI' },
    ],
    fixed: [
      { word: 'によると', meaning: 'according to' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'そうです', meaning: 'apparently / I heard' },
    ],
  },
  // {abstract} のおかげで、{action} ことができました。
  {
    pattern: '{abstract}のおかげで、{action}ことができました。',
    english: 'Thanks to {abstract}, I was able to {action}.',
    slots: [
      { key: 'abstract', pool: 'abstract' },
      { key: 'action', pool: 'action' },
    ],
    fixed: [
      { word: 'のおかげで', meaning: 'thanks to' },
      { word: 'こと', meaning: 'thing (nominalizer)' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'できました', meaning: 'was able to' },
    ],
  },
  // {abstract} は {opinion} と思います。
  {
    pattern: '{abstract}は{opinion}と思います。',
    english: 'I think {abstract} is {opinion}.',
    slots: [
      { key: 'abstract', pool: 'abstract' },
      { key: 'opinion', pool: 'opinion' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'と', meaning: 'quotation marker' },
      { word: '思います', reading: 'おもいます', meaning: 'think' },
    ],
  },
  // {place} に行くかどうか迷っています。
  {
    pattern: '{place}に行くかどうか迷っています。',
    english: 'I am wondering whether to go to {place}.',
    slots: [{ key: 'place', pool: 'place' }],
    fixed: [
      { word: 'に', meaning: 'to (direction)' },
      { word: '行く', reading: 'いく', meaning: 'to go' },
      { word: 'かどうか', meaning: 'whether or not' },
      { word: '迷っています', reading: 'まよっています', meaning: 'am wondering / hesitating' },
    ],
  },
  // {person} が {action} ように頼みました。
  {
    pattern: '{person}に{action}ように頼みました。',
    english: 'I asked {person} to {action}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'action', pool: 'action' },
    ],
    fixed: [
      { word: 'に', meaning: 'to (person)' },
      { word: 'ように', meaning: 'so that' },
      { word: '頼みました', reading: 'たのみました', meaning: 'asked / requested' },
    ],
  },
  // {abstract} が増えるにつれて、{abstract2} も変わっていきます。
  {
    pattern: '{abstract}が増えるにつれて、{abstract2}も変わっていきます。',
    english: 'As {abstract} increases, {abstract2} also changes.',
    slots: [
      { key: 'abstract', pool: 'abstract' },
      { key: 'abstract2', pool: 'abstract' },
    ],
    fixed: [
      { word: 'が', meaning: 'subject marker' },
      { word: '増える', reading: 'ふえる', meaning: 'to increase' },
      { word: 'につれて', meaning: 'as / along with' },
      { word: 'も', meaning: 'also' },
      { word: '変わっていきます', reading: 'かわっていきます', meaning: 'gradually changes' },
    ],
  },
  // {adjI} かどうかは別として、{action} べきです。
  {
    pattern: '{adjI}かどうかは別として、{action}べきです。',
    english: 'Regardless of whether it is {adjI} or not, you should {action}.',
    slots: [
      { key: 'adjI', pool: 'adjI' },
      { key: 'action', pool: 'action' },
    ],
    fixed: [
      { word: 'かどうか', meaning: 'whether or not' },
      { word: 'は', meaning: 'topic marker' },
      { word: '別として', reading: 'べつとして', meaning: 'aside from / regardless' },
      { word: 'べき', meaning: 'should' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {person} は {abstract} について {action} つもりです。
  {
    pattern: '{person}は{abstract}について{action}つもりです。',
    english: '{person} intends to {action} about {abstract}.',
    slots: [
      { key: 'person', pool: 'person' },
      { key: 'abstract', pool: 'abstract' },
      { key: 'action', pool: 'action' },
    ],
    fixed: [
      { word: 'は', meaning: 'topic marker' },
      { word: 'について', meaning: 'about / regarding' },
      { word: 'つもり', meaning: 'intention / plan' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {time} までに {action} なければなりません。
  {
    pattern: '{time}までに{action}なければなりません。',
    english: 'I must {action} by {time}.',
    slots: [
      { key: 'time', pool: 'time' },
      { key: 'action', pool: 'action' },
    ],
    fixed: [
      { word: 'までに', meaning: 'by (deadline)' },
      { word: 'なければなりません', meaning: 'must' },
    ],
  },
  // {place} で {abstract} に関するイベントがあるらしいです。
  {
    pattern: '{place}で{abstract}に関するイベントがあるらしいです。',
    english: 'There seems to be an event about {abstract} at {place}.',
    slots: [
      { key: 'place', pool: 'place' },
      { key: 'abstract', pool: 'abstract' },
    ],
    fixed: [
      { word: 'で', meaning: 'at (location)' },
      { word: 'に関する', reading: 'にかんする', meaning: 'related to / about' },
      { word: 'イベント', meaning: 'event' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'ある', meaning: 'there is' },
      { word: 'らしいです', meaning: 'it seems / apparently' },
    ],
  },
  // いくら {adjI} くても、{action} ほうがいいです。
  {
    pattern: 'いくら{adjI}くても、{action}ほうがいいです。',
    english: 'No matter how {adjI} it is, it is better to {action}.',
    slots: [
      { key: 'adjI', pool: 'adjI' },
      { key: 'action', pool: 'action' },
    ],
    fixed: [
      { word: 'いくら', meaning: 'no matter how' },
      { word: 'くても', meaning: 'even if (i-adj)' },
      { word: 'ほうがいい', meaning: 'it is better to' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
];

// ─── N2 Vocabulary ───────────────────────────────────────────

const N2_VOCAB: VocabPool = {
  ...N3_VOCAB,
  formal: [
    { word: '状況', reading: 'じょうきょう', meaning: 'situation' },
    { word: '制度', reading: 'せいど', meaning: 'system / institution' },
    { word: '方針', reading: 'ほうしん', meaning: 'policy / direction' },
    { word: '効果', reading: 'こうか', meaning: 'effect' },
    { word: '対策', reading: 'たいさく', meaning: 'countermeasure' },
    { word: '責任', reading: 'せきにん', meaning: 'responsibility' },
    { word: '条件', reading: 'じょうけん', meaning: 'condition / terms' },
    { word: '基準', reading: 'きじゅん', meaning: 'standard / criteria' },
    { word: '可能性', reading: 'かのうせい', meaning: 'possibility' },
    { word: '傾向', reading: 'けいこう', meaning: 'tendency' },
  ],
  society: [
    { word: '環境', reading: 'かんきょう', meaning: 'environment' },
    { word: '経済', reading: 'けいざい', meaning: 'economy' },
    { word: '教育', reading: 'きょういく', meaning: 'education' },
    { word: '文化', reading: 'ぶんか', meaning: 'culture' },
    { word: '技術', reading: 'ぎじゅつ', meaning: 'technology' },
    { word: '政治', reading: 'せいじ', meaning: 'politics' },
    { word: '人口', reading: 'じんこう', meaning: 'population' },
    { word: '社会', reading: 'しゃかい', meaning: 'society' },
    { word: '医療', reading: 'いりょう', meaning: 'medical care' },
    { word: '産業', reading: 'さんぎょう', meaning: 'industry' },
  ],
  formalAdj: [
    { word: '重要な', reading: 'じゅうような', meaning: 'important' },
    { word: '適切な', reading: 'てきせつな', meaning: 'appropriate' },
    { word: '十分な', reading: 'じゅうぶんな', meaning: 'sufficient' },
    { word: '深刻な', reading: 'しんこくな', meaning: 'serious / grave' },
    { word: '明確な', reading: 'めいかくな', meaning: 'clear / definite' },
    { word: '具体的な', reading: 'ぐたいてきな', meaning: 'concrete / specific' },
    { word: '複雑な', reading: 'ふくざつな', meaning: 'complex' },
    { word: '急速な', reading: 'きゅうそくな', meaning: 'rapid' },
  ],
};

const N2_TEMPLATES: SentenceTemplate[] = [
  // {society} に関して、{formal} を検討する必要があります。
  {
    pattern: '{society}に関して、{formal}を検討する必要があります。',
    english: 'Regarding {society}, there is a need to consider {formal}.',
    slots: [
      { key: 'society', pool: 'society' },
      { key: 'formal', pool: 'formal' },
    ],
    fixed: [
      { word: 'に関して', reading: 'にかんして', meaning: 'regarding' },
      { word: 'を', meaning: 'object marker' },
      { word: '検討する', reading: 'けんとうする', meaning: 'to consider / examine' },
      { word: '必要', reading: 'ひつよう', meaning: 'need / necessity' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'あります', meaning: 'there is' },
    ],
  },
  // {formal} の有無にかかわらず、{action} べきです。
  {
    pattern: '{formal}の有無にかかわらず、{action}べきです。',
    english: 'Regardless of {formal}, one should {action}.',
    slots: [
      { key: 'formal', pool: 'formal' },
      { key: 'action', pool: 'action' },
    ],
    fixed: [
      { word: 'の', meaning: 'possessive marker' },
      { word: '有無', reading: 'うむ', meaning: 'presence or absence' },
      { word: 'にかかわらず', meaning: 'regardless of' },
      { word: 'べき', meaning: 'should' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  // {society} が {formalAdj} 問題を抱えている一方で...
  {
    pattern: '{society}が{formalAdj}問題を抱えている一方で、{formal}も注目されています。',
    english: 'While {society} faces {formalAdj} problems, {formal} is also attracting attention.',
    slots: [
      { key: 'society', pool: 'society' },
      { key: 'formalAdj', pool: 'formalAdj' },
      { key: 'formal', pool: 'formal' },
    ],
    fixed: [
      { word: 'が', meaning: 'subject marker' },
      { word: '問題', reading: 'もんだい', meaning: 'problem' },
      { word: 'を', meaning: 'object marker' },
      { word: '抱えている', reading: 'かかえている', meaning: 'is facing / holding' },
      { word: '一方で', reading: 'いっぽうで', meaning: 'while / on the other hand' },
      { word: 'も', meaning: 'also' },
      { word: '注目されています', reading: 'ちゅうもくされています', meaning: 'is attracting attention' },
    ],
  },
  // {society} の発展に伴い、{formal} が変化しています。
  {
    pattern: '{society}の発展に伴い、{formal}が変化しています。',
    english: 'Along with the development of {society}, {formal} is changing.',
    slots: [
      { key: 'society', pool: 'society' },
      { key: 'formal', pool: 'formal' },
    ],
    fixed: [
      { word: 'の', meaning: 'possessive marker' },
      { word: '発展', reading: 'はってん', meaning: 'development' },
      { word: 'に伴い', reading: 'にともない', meaning: 'along with' },
      { word: 'が', meaning: 'subject marker' },
      { word: '変化しています', reading: 'へんかしています', meaning: 'is changing' },
    ],
  },
  // いくら {action} ても、{formal} は改善しない。
  {
    pattern: 'いくら{action}ても、{formal}は改善しない。',
    english: 'No matter how much one {action}, {formal} does not improve.',
    slots: [
      { key: 'action', pool: 'action' },
      { key: 'formal', pool: 'formal' },
    ],
    fixed: [
      { word: 'いくら', meaning: 'no matter how much' },
      { word: 'ても', meaning: 'even if' },
      { word: 'は', meaning: 'topic marker' },
      { word: '改善しない', reading: 'かいぜんしない', meaning: 'does not improve' },
    ],
  },
  // {formal} を踏まえた上で、{formalAdj} 判断が求められています。
  {
    pattern: '{formal}を踏まえた上で、{formalAdj}判断が求められています。',
    english: 'Based on {formal}, {formalAdj} judgment is required.',
    slots: [
      { key: 'formal', pool: 'formal' },
      { key: 'formalAdj', pool: 'formalAdj' },
    ],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: '踏まえた上で', reading: 'ふまえたうえで', meaning: 'based on / considering' },
      { word: '判断', reading: 'はんだん', meaning: 'judgment' },
      { word: 'が', meaning: 'subject marker' },
      { word: '求められています', reading: 'もとめられています', meaning: 'is being required' },
    ],
  },
  // {society} の {formal} については、さまざまな意見がある。
  {
    pattern: '{society}の{formal}については、さまざまな意見がある。',
    english: 'There are various opinions about {formal} in {society}.',
    slots: [
      { key: 'society', pool: 'society' },
      { key: 'formal', pool: 'formal' },
    ],
    fixed: [
      { word: 'の', meaning: 'possessive marker' },
      { word: 'については', meaning: 'regarding / as for' },
      { word: 'さまざまな', meaning: 'various' },
      { word: '意見', reading: 'いけん', meaning: 'opinion' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'ある', meaning: 'there are' },
    ],
  },
  // {formal} にもかかわらず、{society} は {formalAdj} 状態が続いている。
  {
    pattern: '{formal}にもかかわらず、{society}は{formalAdj}状態が続いている。',
    english: 'Despite {formal}, {society} continues in a {formalAdj} state.',
    slots: [
      { key: 'formal', pool: 'formal' },
      { key: 'society', pool: 'society' },
      { key: 'formalAdj', pool: 'formalAdj' },
    ],
    fixed: [
      { word: 'にもかかわらず', meaning: 'despite' },
      { word: 'は', meaning: 'topic marker' },
      { word: '状態', reading: 'じょうたい', meaning: 'state / condition' },
      { word: 'が', meaning: 'subject marker' },
      { word: '続いている', reading: 'つづいている', meaning: 'is continuing' },
    ],
  },
];

// ─── N1 Vocabulary ───────────────────────────────────────────

const N1_VOCAB: VocabPool = {
  ...N2_VOCAB,
  literary: [
    { word: '概念', reading: 'がいねん', meaning: 'concept' },
    { word: '本質', reading: 'ほんしつ', meaning: 'essence' },
    { word: '矛盾', reading: 'むじゅん', meaning: 'contradiction' },
    { word: '偏見', reading: 'へんけん', meaning: 'prejudice' },
    { word: '革新', reading: 'かくしん', meaning: 'innovation' },
    { word: '倫理', reading: 'りんり', meaning: 'ethics' },
    { word: '理念', reading: 'りねん', meaning: 'principle / philosophy' },
    { word: '尊厳', reading: 'そんげん', meaning: 'dignity' },
    { word: '多様性', reading: 'たようせい', meaning: 'diversity' },
    { word: '持続可能性', reading: 'じぞくかのうせい', meaning: 'sustainability' },
  ],
  literaryAdj: [
    { word: '画期的な', reading: 'かっきてきな', meaning: 'groundbreaking' },
    { word: '根本的な', reading: 'こんぽんてきな', meaning: 'fundamental' },
    { word: '不可欠な', reading: 'ふかけつな', meaning: 'indispensable' },
    { word: '顕著な', reading: 'けんちょな', meaning: 'remarkable' },
    { word: '多大な', reading: 'ただいな', meaning: 'enormous / great' },
    { word: '抜本的な', reading: 'ばっぽんてきな', meaning: 'drastic / radical' },
  ],
  literaryVerb: [
    { word: '追求する', reading: 'ついきゅうする', meaning: 'to pursue' },
    { word: '見直す', reading: 'みなおす', meaning: 'to reconsider' },
    { word: '克服する', reading: 'こくふくする', meaning: 'to overcome' },
    { word: '促進する', reading: 'そくしんする', meaning: 'to promote' },
    { word: '維持する', reading: 'いじする', meaning: 'to maintain' },
    { word: '実現する', reading: 'じつげんする', meaning: 'to realize / achieve' },
    { word: '構築する', reading: 'こうちくする', meaning: 'to construct / build' },
    { word: '提唱する', reading: 'ていしょうする', meaning: 'to advocate' },
  ],
};

const N1_TEMPLATES: SentenceTemplate[] = [
  // {literary} なくしては、{literaryVerb} ことはできない。
  {
    pattern: '{literary}なくしては、{literaryVerb}ことはできない。',
    english: 'Without {literary}, one cannot {literaryVerb}.',
    slots: [
      { key: 'literary', pool: 'literary' },
      { key: 'literaryVerb', pool: 'literaryVerb' },
    ],
    fixed: [
      { word: 'なくしては', meaning: 'without' },
      { word: 'こと', meaning: 'thing (nominalizer)' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'できない', meaning: 'cannot' },
    ],
  },
  // {literary} であるがゆえに、{literaryAdj} 議論を巻き起こした。
  {
    pattern: '{literary}であるがゆえに、{literaryAdj}議論を巻き起こした。',
    english: 'Precisely because of {literary}, it stirred {literaryAdj} debate.',
    slots: [
      { key: 'literary', pool: 'literary' },
      { key: 'literaryAdj', pool: 'literaryAdj' },
    ],
    fixed: [
      { word: 'である', meaning: 'is (formal copula)' },
      { word: 'がゆえに', meaning: 'precisely because' },
      { word: '議論', reading: 'ぎろん', meaning: 'debate / discussion' },
      { word: 'を', meaning: 'object marker' },
      { word: '巻き起こした', reading: 'まきおこした', meaning: 'stirred up' },
    ],
  },
  // {society} を {literaryVerb} べく、{literaryAdj} 改革が進められている。
  {
    pattern: '{society}を{literaryVerb}べく、{literaryAdj}改革が進められている。',
    english: 'In order to {literaryVerb} {society}, {literaryAdj} reform is underway.',
    slots: [
      { key: 'society', pool: 'society' },
      { key: 'literaryVerb', pool: 'literaryVerb' },
      { key: 'literaryAdj', pool: 'literaryAdj' },
    ],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: 'べく', meaning: 'in order to' },
      { word: '改革', reading: 'かいかく', meaning: 'reform' },
      { word: 'が', meaning: 'subject marker' },
      { word: '進められている', reading: 'すすめられている', meaning: 'is being advanced' },
    ],
  },
  // {literary} を踏まえつつも、{literaryAdj} 視点が求められる。
  {
    pattern: '{literary}を踏まえつつも、{literaryAdj}視点が求められる。',
    english: 'While considering {literary}, a {literaryAdj} perspective is required.',
    slots: [
      { key: 'literary', pool: 'literary' },
      { key: 'literaryAdj', pool: 'literaryAdj' },
    ],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: '踏まえつつも', reading: 'ふまえつつも', meaning: 'while considering' },
      { word: '視点', reading: 'してん', meaning: 'perspective / viewpoint' },
      { word: 'が', meaning: 'subject marker' },
      { word: '求められる', reading: 'もとめられる', meaning: 'is required' },
    ],
  },
  // {literary} をもたらす反面、{literary2} も {literaryVerb} 必要がある。
  {
    pattern: '{literary}をもたらす反面、{literary2}も{literaryVerb}必要がある。',
    english: 'While bringing about {literary}, there is also a need to {literaryVerb} {literary2}.',
    slots: [
      { key: 'literary', pool: 'literary' },
      { key: 'literary2', pool: 'literary' },
      { key: 'literaryVerb', pool: 'literaryVerb' },
    ],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: 'もたらす', meaning: 'to bring about' },
      { word: '反面', reading: 'はんめん', meaning: 'on the other hand' },
      { word: 'も', meaning: 'also' },
      { word: '必要', reading: 'ひつよう', meaning: 'need / necessity' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'ある', meaning: 'there is' },
    ],
  },
  // {literary} を恐れるあまり、何も {literaryVerb} ないのでは本末転倒だ。
  {
    pattern: '{literary}を恐れるあまり、何も{literaryVerb}ないのでは本末転倒だ。',
    english: 'Being so afraid of {literary} that one does not {literaryVerb} at all defeats the purpose.',
    slots: [
      { key: 'literary', pool: 'literary' },
      { key: 'literaryVerb', pool: 'literaryVerb' },
    ],
    fixed: [
      { word: 'を', meaning: 'object marker' },
      { word: '恐れる', reading: 'おそれる', meaning: 'to fear' },
      { word: 'あまり', meaning: 'so much that' },
      { word: '何も', reading: 'なにも', meaning: 'nothing' },
      { word: 'ない', meaning: 'not' },
      { word: 'のでは', meaning: 'if it is that' },
      { word: '本末転倒', reading: 'ほんまつてんとう', meaning: 'putting the cart before the horse' },
      { word: 'だ', meaning: 'is (casual)' },
    ],
  },
  // 今こそ {literary} を {literaryVerb} 時だ。
  {
    pattern: '今こそ{literary}を{literaryVerb}時だ。',
    english: 'Now is the time to {literaryVerb} {literary}.',
    slots: [
      { key: 'literary', pool: 'literary' },
      { key: 'literaryVerb', pool: 'literaryVerb' },
    ],
    fixed: [
      { word: '今こそ', reading: 'いまこそ', meaning: 'now more than ever' },
      { word: 'を', meaning: 'object marker' },
      { word: '時', reading: 'とき', meaning: 'time' },
      { word: 'だ', meaning: 'is (casual)' },
    ],
  },
];

// ─── Level Config Map ────────────────────────────────────────

const LEVEL_CONFIGS: Record<JLPTLevel, { vocab: VocabPool; templates: SentenceTemplate[] }> = {
  N5: { vocab: N5_VOCAB, templates: N5_TEMPLATES },
  N4: { vocab: N4_VOCAB, templates: N4_TEMPLATES },
  N3: { vocab: N3_VOCAB, templates: N3_TEMPLATES },
  N2: { vocab: N2_VOCAB, templates: N2_TEMPLATES },
  N1: { vocab: N1_VOCAB, templates: N1_TEMPLATES },
};

// ─── Public API ──────────────────────────────────────────────

/**
 * Generate a unique sentence for a given JLPT level.
 * Uses template + vocabulary combinatorics — no API calls.
 */
export function generateSentence(level: JLPTLevel): ListeningSentence {
  const config = LEVEL_CONFIGS[level];
  const template = pickRandom(config.templates);
  return buildSentence(template, config.vocab);
}

/**
 * Get the approximate number of unique sentences possible for a level.
 */
export function getPoolSize(level: JLPTLevel): number {
  const config = LEVEL_CONFIGS[level];
  let total = 0;
  for (const template of config.templates) {
    let combos = 1;
    for (const slot of template.slots) {
      const pool = config.vocab[slot.pool];
      combos *= pool ? pool.length : 1;
    }
    total += combos;
  }
  return total;
}

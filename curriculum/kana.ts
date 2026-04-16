/**
 * Japanese Kana — hiragana and katakana syllabaries.
 *
 * Grouped into traditional rows (gojūon / 五十音).
 */

export type KanaScript = 'hiragana' | 'katakana';

export interface KanaChar {
  hiragana: string;
  katakana: string;
  romaji: string;
}

export interface KanaRow {
  id: string;
  label: string;
  kanji: string; // the "header" kanji for the row
  chars: KanaChar[];
}

// ─── Basic gojūon (46 base kana) ────────────────────────────

export const KANA_ROWS: KanaRow[] = [
  {
    id: 'a',
    label: 'a-row',
    kanji: 'あ',
    chars: [
      { hiragana: 'あ', katakana: 'ア', romaji: 'a' },
      { hiragana: 'い', katakana: 'イ', romaji: 'i' },
      { hiragana: 'う', katakana: 'ウ', romaji: 'u' },
      { hiragana: 'え', katakana: 'エ', romaji: 'e' },
      { hiragana: 'お', katakana: 'オ', romaji: 'o' },
    ],
  },
  {
    id: 'ka',
    label: 'ka-row',
    kanji: 'か',
    chars: [
      { hiragana: 'か', katakana: 'カ', romaji: 'ka' },
      { hiragana: 'き', katakana: 'キ', romaji: 'ki' },
      { hiragana: 'く', katakana: 'ク', romaji: 'ku' },
      { hiragana: 'け', katakana: 'ケ', romaji: 'ke' },
      { hiragana: 'こ', katakana: 'コ', romaji: 'ko' },
    ],
  },
  {
    id: 'sa',
    label: 'sa-row',
    kanji: 'さ',
    chars: [
      { hiragana: 'さ', katakana: 'サ', romaji: 'sa' },
      { hiragana: 'し', katakana: 'シ', romaji: 'shi' },
      { hiragana: 'す', katakana: 'ス', romaji: 'su' },
      { hiragana: 'せ', katakana: 'セ', romaji: 'se' },
      { hiragana: 'そ', katakana: 'ソ', romaji: 'so' },
    ],
  },
  {
    id: 'ta',
    label: 'ta-row',
    kanji: 'た',
    chars: [
      { hiragana: 'た', katakana: 'タ', romaji: 'ta' },
      { hiragana: 'ち', katakana: 'チ', romaji: 'chi' },
      { hiragana: 'つ', katakana: 'ツ', romaji: 'tsu' },
      { hiragana: 'て', katakana: 'テ', romaji: 'te' },
      { hiragana: 'と', katakana: 'ト', romaji: 'to' },
    ],
  },
  {
    id: 'na',
    label: 'na-row',
    kanji: 'な',
    chars: [
      { hiragana: 'な', katakana: 'ナ', romaji: 'na' },
      { hiragana: 'に', katakana: 'ニ', romaji: 'ni' },
      { hiragana: 'ぬ', katakana: 'ヌ', romaji: 'nu' },
      { hiragana: 'ね', katakana: 'ネ', romaji: 'ne' },
      { hiragana: 'の', katakana: 'ノ', romaji: 'no' },
    ],
  },
  {
    id: 'ha',
    label: 'ha-row',
    kanji: 'は',
    chars: [
      { hiragana: 'は', katakana: 'ハ', romaji: 'ha' },
      { hiragana: 'ひ', katakana: 'ヒ', romaji: 'hi' },
      { hiragana: 'ふ', katakana: 'フ', romaji: 'fu' },
      { hiragana: 'へ', katakana: 'ヘ', romaji: 'he' },
      { hiragana: 'ほ', katakana: 'ホ', romaji: 'ho' },
    ],
  },
  {
    id: 'ma',
    label: 'ma-row',
    kanji: 'ま',
    chars: [
      { hiragana: 'ま', katakana: 'マ', romaji: 'ma' },
      { hiragana: 'み', katakana: 'ミ', romaji: 'mi' },
      { hiragana: 'む', katakana: 'ム', romaji: 'mu' },
      { hiragana: 'め', katakana: 'メ', romaji: 'me' },
      { hiragana: 'も', katakana: 'モ', romaji: 'mo' },
    ],
  },
  {
    id: 'ya',
    label: 'ya-row',
    kanji: 'や',
    chars: [
      { hiragana: 'や', katakana: 'ヤ', romaji: 'ya' },
      { hiragana: 'ゆ', katakana: 'ユ', romaji: 'yu' },
      { hiragana: 'よ', katakana: 'ヨ', romaji: 'yo' },
    ],
  },
  {
    id: 'ra',
    label: 'ra-row',
    kanji: 'ら',
    chars: [
      { hiragana: 'ら', katakana: 'ラ', romaji: 'ra' },
      { hiragana: 'り', katakana: 'リ', romaji: 'ri' },
      { hiragana: 'る', katakana: 'ル', romaji: 'ru' },
      { hiragana: 'れ', katakana: 'レ', romaji: 're' },
      { hiragana: 'ろ', katakana: 'ロ', romaji: 'ro' },
    ],
  },
  {
    id: 'wa',
    label: 'wa-row',
    kanji: 'わ',
    chars: [
      { hiragana: 'わ', katakana: 'ワ', romaji: 'wa' },
      { hiragana: 'を', katakana: 'ヲ', romaji: 'wo' },
      { hiragana: 'ん', katakana: 'ン', romaji: 'n' },
    ],
  },
];

/** Flat list of all base kana chars. */
export const ALL_KANA: KanaChar[] = KANA_ROWS.flatMap((r) => r.chars);

/** Total count — 46 for classical gojūon (42 syllables + ya/yu/yo + wa/wo/n). */
export const KANA_COUNT = ALL_KANA.length;

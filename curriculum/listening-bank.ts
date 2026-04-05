/**
 * Listening Practice Sentence Bank
 *
 * Curated Japanese sentences organized by JLPT level.
 * Each sentence includes full breakdown for word-by-word practice.
 * No API key required — all content is built-in.
 */

export interface ListeningSentence {
  japanese: string;
  english: string;
  breakdown: {
    word: string;
    reading?: string;
    meaning: string;
  }[];
}

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

const N5_SENTENCES: ListeningSentence[] = [
  {
    japanese: 'これは何ですか。',
    english: 'What is this?',
    breakdown: [
      { word: 'これ', meaning: 'this' },
      { word: 'は', meaning: 'topic marker' },
      { word: '何', reading: 'なん', meaning: 'what' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: 'お名前は何ですか。',
    english: 'What is your name?',
    breakdown: [
      { word: 'お名前', reading: 'おなまえ', meaning: 'name (polite)' },
      { word: 'は', meaning: 'topic marker' },
      { word: '何', reading: 'なん', meaning: 'what' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: '今日はいい天気ですね。',
    english: 'It is nice weather today, isn\'t it?',
    breakdown: [
      { word: '今日', reading: 'きょう', meaning: 'today' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'いい', meaning: 'good / nice' },
      { word: '天気', reading: 'てんき', meaning: 'weather' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'ね', meaning: 'isn\'t it (seeking agreement)' },
    ],
  },
  {
    japanese: 'トイレはどこですか。',
    english: 'Where is the bathroom?',
    breakdown: [
      { word: 'トイレ', meaning: 'bathroom / toilet' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'どこ', meaning: 'where' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: '水をください。',
    english: 'Please give me water.',
    breakdown: [
      { word: '水', reading: 'みず', meaning: 'water' },
      { word: 'を', meaning: 'object marker' },
      { word: 'ください', meaning: 'please give me' },
    ],
  },
  {
    japanese: '私は学生です。',
    english: 'I am a student.',
    breakdown: [
      { word: '私', reading: 'わたし', meaning: 'I / me' },
      { word: 'は', meaning: 'topic marker' },
      { word: '学生', reading: 'がくせい', meaning: 'student' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: '毎日日本語を勉強します。',
    english: 'I study Japanese every day.',
    breakdown: [
      { word: '毎日', reading: 'まいにち', meaning: 'every day' },
      { word: '日本語', reading: 'にほんご', meaning: 'Japanese language' },
      { word: 'を', meaning: 'object marker' },
      { word: '勉強します', reading: 'べんきょうします', meaning: 'study' },
    ],
  },
  {
    japanese: 'すみません、もう一度お願いします。',
    english: 'Excuse me, one more time please.',
    breakdown: [
      { word: 'すみません', meaning: 'excuse me / sorry' },
      { word: 'もう', meaning: 'more / again' },
      { word: '一度', reading: 'いちど', meaning: 'one time' },
      { word: 'お願いします', reading: 'おねがいします', meaning: 'please' },
    ],
  },
  {
    japanese: '何時ですか。',
    english: 'What time is it?',
    breakdown: [
      { word: '何時', reading: 'なんじ', meaning: 'what time' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: 'この本はいくらですか。',
    english: 'How much is this book?',
    breakdown: [
      { word: 'この', meaning: 'this' },
      { word: '本', reading: 'ほん', meaning: 'book' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'いくら', meaning: 'how much' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: '朝ごはんを食べましたか。',
    english: 'Did you eat breakfast?',
    breakdown: [
      { word: '朝ごはん', reading: 'あさごはん', meaning: 'breakfast' },
      { word: 'を', meaning: 'object marker' },
      { word: '食べました', reading: 'たべました', meaning: 'ate (past tense)' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: '駅はここから近いです。',
    english: 'The station is close from here.',
    breakdown: [
      { word: '駅', reading: 'えき', meaning: 'station' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'ここ', meaning: 'here' },
      { word: 'から', meaning: 'from' },
      { word: '近い', reading: 'ちかい', meaning: 'close / near' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: '明日友達に会います。',
    english: 'I will meet a friend tomorrow.',
    breakdown: [
      { word: '明日', reading: 'あした', meaning: 'tomorrow' },
      { word: '友達', reading: 'ともだち', meaning: 'friend' },
      { word: 'に', meaning: 'target marker' },
      { word: '会います', reading: 'あいます', meaning: 'meet' },
    ],
  },
  {
    japanese: '日本の食べ物が好きです。',
    english: 'I like Japanese food.',
    breakdown: [
      { word: '日本', reading: 'にほん', meaning: 'Japan' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '食べ物', reading: 'たべもの', meaning: 'food' },
      { word: 'が', meaning: 'subject marker' },
      { word: '好き', reading: 'すき', meaning: 'like / fond of' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: '電車で学校に行きます。',
    english: 'I go to school by train.',
    breakdown: [
      { word: '電車', reading: 'でんしゃ', meaning: 'train' },
      { word: 'で', meaning: 'by (means of transport)' },
      { word: '学校', reading: 'がっこう', meaning: 'school' },
      { word: 'に', meaning: 'to (direction)' },
      { word: '行きます', reading: 'いきます', meaning: 'go' },
    ],
  },
];

const N4_SENTENCES: ListeningSentence[] = [
  {
    japanese: '昨日映画を見に行きました。',
    english: 'I went to see a movie yesterday.',
    breakdown: [
      { word: '昨日', reading: 'きのう', meaning: 'yesterday' },
      { word: '映画', reading: 'えいが', meaning: 'movie' },
      { word: 'を', meaning: 'object marker' },
      { word: '見に', reading: 'みに', meaning: 'to see (purpose)' },
      { word: '行きました', reading: 'いきました', meaning: 'went' },
    ],
  },
  {
    japanese: '日本語を話すことができますか。',
    english: 'Can you speak Japanese?',
    breakdown: [
      { word: '日本語', reading: 'にほんご', meaning: 'Japanese language' },
      { word: 'を', meaning: 'object marker' },
      { word: '話す', reading: 'はなす', meaning: 'to speak' },
      { word: 'こと', meaning: 'thing (nominalizer)' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'できます', meaning: 'can do / is possible' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: '窓を開けてもいいですか。',
    english: 'May I open the window?',
    breakdown: [
      { word: '窓', reading: 'まど', meaning: 'window' },
      { word: 'を', meaning: 'object marker' },
      { word: '開けて', reading: 'あけて', meaning: 'open (te-form)' },
      { word: 'も', meaning: 'also / even' },
      { word: 'いい', meaning: 'good / okay' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: '雨が降っているので、傘を持って行きます。',
    english: 'It is raining, so I will take an umbrella.',
    breakdown: [
      { word: '雨', reading: 'あめ', meaning: 'rain' },
      { word: 'が', meaning: 'subject marker' },
      { word: '降っている', reading: 'ふっている', meaning: 'is falling (ongoing)' },
      { word: 'ので', meaning: 'because / so' },
      { word: '傘', reading: 'かさ', meaning: 'umbrella' },
      { word: 'を', meaning: 'object marker' },
      { word: '持って行きます', reading: 'もっていきます', meaning: 'take along' },
    ],
  },
  {
    japanese: '先生に質問したいことがあります。',
    english: 'I have something I want to ask the teacher.',
    breakdown: [
      { word: '先生', reading: 'せんせい', meaning: 'teacher' },
      { word: 'に', meaning: 'to (target)' },
      { word: '質問したい', reading: 'しつもんしたい', meaning: 'want to ask' },
      { word: 'こと', meaning: 'thing' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'あります', meaning: 'there is / have' },
    ],
  },
  {
    japanese: '来週の月曜日までにレポートを出してください。',
    english: 'Please submit the report by next Monday.',
    breakdown: [
      { word: '来週', reading: 'らいしゅう', meaning: 'next week' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '月曜日', reading: 'げつようび', meaning: 'Monday' },
      { word: 'まで', meaning: 'until / by' },
      { word: 'に', meaning: 'by (deadline)' },
      { word: 'レポート', meaning: 'report' },
      { word: 'を', meaning: 'object marker' },
      { word: '出してください', reading: 'だしてください', meaning: 'please submit' },
    ],
  },
  {
    japanese: '趣味は音楽を聞くことです。',
    english: 'My hobby is listening to music.',
    breakdown: [
      { word: '趣味', reading: 'しゅみ', meaning: 'hobby' },
      { word: 'は', meaning: 'topic marker' },
      { word: '音楽', reading: 'おんがく', meaning: 'music' },
      { word: 'を', meaning: 'object marker' },
      { word: '聞く', reading: 'きく', meaning: 'to listen' },
      { word: 'こと', meaning: 'thing (nominalizer)' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: '東京に住んでいたことがあります。',
    english: 'I have lived in Tokyo before.',
    breakdown: [
      { word: '東京', reading: 'とうきょう', meaning: 'Tokyo' },
      { word: 'に', meaning: 'in (location)' },
      { word: '住んでいた', reading: 'すんでいた', meaning: 'was living' },
      { word: 'こと', meaning: 'experience (nominalizer)' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'あります', meaning: 'there is / have' },
    ],
  },
  {
    japanese: 'もう少し安いのはありますか。',
    english: 'Do you have something a little cheaper?',
    breakdown: [
      { word: 'もう少し', reading: 'もうすこし', meaning: 'a little more' },
      { word: '安い', reading: 'やすい', meaning: 'cheap' },
      { word: 'の', meaning: 'one (pronoun)' },
      { word: 'は', meaning: 'topic marker' },
      { word: 'あります', meaning: 'there is / have' },
      { word: 'か', meaning: 'question marker' },
    ],
  },
  {
    japanese: '食べる前に手を洗ってください。',
    english: 'Please wash your hands before eating.',
    breakdown: [
      { word: '食べる', reading: 'たべる', meaning: 'to eat' },
      { word: '前に', reading: 'まえに', meaning: 'before' },
      { word: '手', reading: 'て', meaning: 'hand' },
      { word: 'を', meaning: 'object marker' },
      { word: '洗って', reading: 'あらって', meaning: 'wash (te-form)' },
      { word: 'ください', meaning: 'please' },
    ],
  },
  {
    japanese: '彼女は絵を描くのが上手です。',
    english: 'She is good at drawing pictures.',
    breakdown: [
      { word: '彼女', reading: 'かのじょ', meaning: 'she' },
      { word: 'は', meaning: 'topic marker' },
      { word: '絵', reading: 'え', meaning: 'picture / drawing' },
      { word: 'を', meaning: 'object marker' },
      { word: '描く', reading: 'かく', meaning: 'to draw' },
      { word: 'の', meaning: 'nominalizer' },
      { word: 'が', meaning: 'subject marker' },
      { word: '上手', reading: 'じょうず', meaning: 'skillful / good at' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: '道に迷ったので遅れてしまいました。',
    english: 'I got lost so I ended up being late.',
    breakdown: [
      { word: '道', reading: 'みち', meaning: 'road / way' },
      { word: 'に', meaning: 'in / on' },
      { word: '迷った', reading: 'まよった', meaning: 'got lost' },
      { word: 'ので', meaning: 'because / so' },
      { word: '遅れて', reading: 'おくれて', meaning: 'being late' },
      { word: 'しまいました', meaning: 'ended up (regret)' },
    ],
  },
];

const N3_SENTENCES: ListeningSentence[] = [
  {
    japanese: '最近忙しくて、なかなか本を読む時間がありません。',
    english: 'I have been busy lately and can hardly find time to read books.',
    breakdown: [
      { word: '最近', reading: 'さいきん', meaning: 'recently / lately' },
      { word: '忙しくて', reading: 'いそがしくて', meaning: 'busy (and / because)' },
      { word: 'なかなか', meaning: 'hardly / not easily' },
      { word: '本', reading: 'ほん', meaning: 'book' },
      { word: 'を', meaning: 'object marker' },
      { word: '読む', reading: 'よむ', meaning: 'to read' },
      { word: '時間', reading: 'じかん', meaning: 'time' },
      { word: 'が', meaning: 'subject marker' },
      { word: 'ありません', meaning: 'there is not / do not have' },
    ],
  },
  {
    japanese: '彼の説明を聞いても、よく分かりませんでした。',
    english: 'Even after hearing his explanation, I did not understand well.',
    breakdown: [
      { word: '彼', reading: 'かれ', meaning: 'he / him' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '説明', reading: 'せつめい', meaning: 'explanation' },
      { word: 'を', meaning: 'object marker' },
      { word: '聞いても', reading: 'きいても', meaning: 'even if hearing' },
      { word: 'よく', meaning: 'well' },
      { word: '分かりませんでした', reading: 'わかりませんでした', meaning: 'did not understand' },
    ],
  },
  {
    japanese: '大学を卒業したら、日本で働きたいと思っています。',
    english: 'After graduating from university, I am thinking of working in Japan.',
    breakdown: [
      { word: '大学', reading: 'だいがく', meaning: 'university' },
      { word: 'を', meaning: 'object marker' },
      { word: '卒業したら', reading: 'そつぎょうしたら', meaning: 'after graduating' },
      { word: '日本', reading: 'にほん', meaning: 'Japan' },
      { word: 'で', meaning: 'in / at (location)' },
      { word: '働きたい', reading: 'はたらきたい', meaning: 'want to work' },
      { word: 'と', meaning: 'quotation marker' },
      { word: '思っています', reading: 'おもっています', meaning: 'am thinking' },
    ],
  },
  {
    japanese: 'この料理は見た目ほど辛くないですよ。',
    english: 'This dish is not as spicy as it looks.',
    breakdown: [
      { word: 'この', meaning: 'this' },
      { word: '料理', reading: 'りょうり', meaning: 'dish / cooking' },
      { word: 'は', meaning: 'topic marker' },
      { word: '見た目', reading: 'みため', meaning: 'appearance / looks' },
      { word: 'ほど', meaning: 'as much as' },
      { word: '辛くない', reading: 'からくない', meaning: 'not spicy' },
      { word: 'です', meaning: 'is / to be' },
      { word: 'よ', meaning: 'emphasis / assertion' },
    ],
  },
  {
    japanese: '天気予報によると、明日は雪が降るそうです。',
    english: 'According to the weather forecast, it will snow tomorrow.',
    breakdown: [
      { word: '天気予報', reading: 'てんきよほう', meaning: 'weather forecast' },
      { word: 'によると', meaning: 'according to' },
      { word: '明日', reading: 'あした', meaning: 'tomorrow' },
      { word: 'は', meaning: 'topic marker' },
      { word: '雪', reading: 'ゆき', meaning: 'snow' },
      { word: 'が', meaning: 'subject marker' },
      { word: '降る', reading: 'ふる', meaning: 'to fall (rain/snow)' },
      { word: 'そうです', meaning: 'I heard that / apparently' },
    ],
  },
  {
    japanese: '日本に来てから、もう三年になります。',
    english: 'It has already been three years since I came to Japan.',
    breakdown: [
      { word: '日本', reading: 'にほん', meaning: 'Japan' },
      { word: 'に', meaning: 'to (direction)' },
      { word: '来てから', reading: 'きてから', meaning: 'since coming' },
      { word: 'もう', meaning: 'already' },
      { word: '三年', reading: 'さんねん', meaning: 'three years' },
      { word: 'に', meaning: 'to (result)' },
      { word: 'なります', meaning: 'become' },
    ],
  },
  {
    japanese: '約束の時間に遅れないように、早めに出発しましょう。',
    english: 'Let\'s leave early so we won\'t be late for our appointment.',
    breakdown: [
      { word: '約束', reading: 'やくそく', meaning: 'appointment / promise' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '時間', reading: 'じかん', meaning: 'time' },
      { word: 'に', meaning: 'for' },
      { word: '遅れない', reading: 'おくれない', meaning: 'not be late' },
      { word: 'ように', meaning: 'so that' },
      { word: '早めに', reading: 'はやめに', meaning: 'early / ahead of time' },
      { word: '出発しましょう', reading: 'しゅっぱつしましょう', meaning: 'let\'s depart' },
    ],
  },
  {
    japanese: '電車の中で電話をかけるのは迷惑です。',
    english: 'Making phone calls on the train is a nuisance.',
    breakdown: [
      { word: '電車', reading: 'でんしゃ', meaning: 'train' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '中', reading: 'なか', meaning: 'inside' },
      { word: 'で', meaning: 'at / in (location)' },
      { word: '電話', reading: 'でんわ', meaning: 'phone call' },
      { word: 'を', meaning: 'object marker' },
      { word: 'かける', meaning: 'to make (a call)' },
      { word: 'の', meaning: 'nominalizer' },
      { word: 'は', meaning: 'topic marker' },
      { word: '迷惑', reading: 'めいわく', meaning: 'nuisance / bother' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: '息子は医者になりたがっていますが、私は反対です。',
    english: 'My son wants to become a doctor, but I am against it.',
    breakdown: [
      { word: '息子', reading: 'むすこ', meaning: 'son' },
      { word: 'は', meaning: 'topic marker' },
      { word: '医者', reading: 'いしゃ', meaning: 'doctor' },
      { word: 'に', meaning: 'to (direction)' },
      { word: 'なりたがっています', meaning: 'wants to become (3rd person)' },
      { word: 'が', meaning: 'but' },
      { word: '私', reading: 'わたし', meaning: 'I / me' },
      { word: 'は', meaning: 'topic marker' },
      { word: '反対', reading: 'はんたい', meaning: 'against / opposed' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: 'このアプリのおかげで、漢字が読めるようになりました。',
    english: 'Thanks to this app, I became able to read kanji.',
    breakdown: [
      { word: 'この', meaning: 'this' },
      { word: 'アプリ', meaning: 'app' },
      { word: 'のおかげで', meaning: 'thanks to' },
      { word: '漢字', reading: 'かんじ', meaning: 'kanji / Chinese characters' },
      { word: 'が', meaning: 'subject marker' },
      { word: '読める', reading: 'よめる', meaning: 'can read' },
      { word: 'ようになりました', meaning: 'became able to' },
    ],
  },
];

const N2_SENTENCES: ListeningSentence[] = [
  {
    japanese: '彼は努力家で、どんな困難にも負けない人です。',
    english: 'He is a hard worker who does not give in to any difficulty.',
    breakdown: [
      { word: '彼', reading: 'かれ', meaning: 'he' },
      { word: 'は', meaning: 'topic marker' },
      { word: '努力家', reading: 'どりょくか', meaning: 'hard worker' },
      { word: 'で', meaning: 'and (te-form of copula)' },
      { word: 'どんな', meaning: 'any kind of' },
      { word: '困難', reading: 'こんなん', meaning: 'difficulty' },
      { word: 'にも', meaning: 'even to' },
      { word: '負けない', reading: 'まけない', meaning: 'does not lose / give in' },
      { word: '人', reading: 'ひと', meaning: 'person' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: '景気が悪化する一方で、物価は上がり続けている。',
    english: 'While the economy continues to worsen, prices keep rising.',
    breakdown: [
      { word: '景気', reading: 'けいき', meaning: 'economy / business conditions' },
      { word: 'が', meaning: 'subject marker' },
      { word: '悪化する', reading: 'あっかする', meaning: 'to worsen' },
      { word: '一方で', reading: 'いっぽうで', meaning: 'while / on the other hand' },
      { word: '物価', reading: 'ぶっか', meaning: 'prices (of goods)' },
      { word: 'は', meaning: 'topic marker' },
      { word: '上がり続けている', reading: 'あがりつづけている', meaning: 'keep rising' },
    ],
  },
  {
    japanese: 'いくら謝っても、彼女は許してくれなかった。',
    english: 'No matter how much I apologized, she would not forgive me.',
    breakdown: [
      { word: 'いくら', meaning: 'no matter how much' },
      { word: '謝っても', reading: 'あやまっても', meaning: 'even if apologizing' },
      { word: '彼女', reading: 'かのじょ', meaning: 'she' },
      { word: 'は', meaning: 'topic marker' },
      { word: '許して', reading: 'ゆるして', meaning: 'forgive' },
      { word: 'くれなかった', meaning: 'did not do for me' },
    ],
  },
  {
    japanese: '環境問題に関して、私たちは一人一人が意識を持つべきです。',
    english: 'Regarding environmental issues, each of us should be aware.',
    breakdown: [
      { word: '環境問題', reading: 'かんきょうもんだい', meaning: 'environmental issues' },
      { word: 'に関して', reading: 'にかんして', meaning: 'regarding' },
      { word: '私たち', reading: 'わたしたち', meaning: 'we' },
      { word: 'は', meaning: 'topic marker' },
      { word: '一人一人', reading: 'ひとりひとり', meaning: 'each person' },
      { word: 'が', meaning: 'subject marker' },
      { word: '意識', reading: 'いしき', meaning: 'awareness / consciousness' },
      { word: 'を', meaning: 'object marker' },
      { word: '持つ', reading: 'もつ', meaning: 'to hold / to have' },
      { word: 'べき', meaning: 'should' },
      { word: 'です', meaning: 'is / to be' },
    ],
  },
  {
    japanese: '彼の話を聞く限り、問題は解決に向かっているようだ。',
    english: 'As far as I can tell from what he says, the problem seems to be heading toward resolution.',
    breakdown: [
      { word: '彼', reading: 'かれ', meaning: 'he' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '話', reading: 'はなし', meaning: 'story / what one says' },
      { word: 'を', meaning: 'object marker' },
      { word: '聞く限り', reading: 'きくかぎり', meaning: 'as far as hearing' },
      { word: '問題', reading: 'もんだい', meaning: 'problem' },
      { word: 'は', meaning: 'topic marker' },
      { word: '解決', reading: 'かいけつ', meaning: 'resolution / solution' },
      { word: 'に', meaning: 'toward' },
      { word: '向かっている', reading: 'むかっている', meaning: 'heading toward' },
      { word: 'ようだ', meaning: 'it seems / it appears' },
    ],
  },
  {
    japanese: 'この仕事は経験の有無にかかわらず応募できます。',
    english: 'You can apply for this job regardless of experience.',
    breakdown: [
      { word: 'この', meaning: 'this' },
      { word: '仕事', reading: 'しごと', meaning: 'job / work' },
      { word: 'は', meaning: 'topic marker' },
      { word: '経験', reading: 'けいけん', meaning: 'experience' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '有無', reading: 'うむ', meaning: 'presence or absence' },
      { word: 'にかかわらず', meaning: 'regardless of' },
      { word: '応募', reading: 'おうぼ', meaning: 'application' },
      { word: 'できます', meaning: 'can do' },
    ],
  },
  {
    japanese: '技術の進歩に伴い、私たちの生活は大きく変わった。',
    english: 'Along with technological progress, our lives have greatly changed.',
    breakdown: [
      { word: '技術', reading: 'ぎじゅつ', meaning: 'technology' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '進歩', reading: 'しんぽ', meaning: 'progress / advancement' },
      { word: 'に伴い', reading: 'にともない', meaning: 'along with' },
      { word: '私たち', reading: 'わたしたち', meaning: 'we / our' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '生活', reading: 'せいかつ', meaning: 'life / living' },
      { word: 'は', meaning: 'topic marker' },
      { word: '大きく', reading: 'おおきく', meaning: 'greatly' },
      { word: '変わった', reading: 'かわった', meaning: 'changed' },
    ],
  },
  {
    japanese: '締め切りが迫っているにもかかわらず、まだ半分しか終わっていない。',
    english: 'Despite the deadline approaching, only half is finished.',
    breakdown: [
      { word: '締め切り', reading: 'しめきり', meaning: 'deadline' },
      { word: 'が', meaning: 'subject marker' },
      { word: '迫っている', reading: 'せまっている', meaning: 'is approaching' },
      { word: 'にもかかわらず', meaning: 'despite / in spite of' },
      { word: 'まだ', meaning: 'still / yet' },
      { word: '半分', reading: 'はんぶん', meaning: 'half' },
      { word: 'しか', meaning: 'only (with negative)' },
      { word: '終わっていない', reading: 'おわっていない', meaning: 'not finished' },
    ],
  },
];

const N1_SENTENCES: ListeningSentence[] = [
  {
    japanese: '彼女の発言は、一見もっともらしいが、よく考えると矛盾だらけだ。',
    english: 'Her statement seems plausible at first glance, but when you think about it, it is full of contradictions.',
    breakdown: [
      { word: '彼女', reading: 'かのじょ', meaning: 'she / her' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '発言', reading: 'はつげん', meaning: 'statement / remark' },
      { word: 'は', meaning: 'topic marker' },
      { word: '一見', reading: 'いっけん', meaning: 'at first glance' },
      { word: 'もっともらしい', meaning: 'plausible / seemingly reasonable' },
      { word: 'が', meaning: 'but' },
      { word: 'よく', meaning: 'well / carefully' },
      { word: '考えると', reading: 'かんがえると', meaning: 'when you think about' },
      { word: '矛盾', reading: 'むじゅん', meaning: 'contradiction' },
      { word: 'だらけ', meaning: 'full of (negative)' },
      { word: 'だ', meaning: 'is (casual)' },
    ],
  },
  {
    japanese: '社会の変革なくしては、真の平等は実現しえない。',
    english: 'Without societal reform, true equality cannot be realized.',
    breakdown: [
      { word: '社会', reading: 'しゃかい', meaning: 'society' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '変革', reading: 'へんかく', meaning: 'reform / revolution' },
      { word: 'なくしては', meaning: 'without' },
      { word: '真の', reading: 'しんの', meaning: 'true / genuine' },
      { word: '平等', reading: 'びょうどう', meaning: 'equality' },
      { word: 'は', meaning: 'topic marker' },
      { word: '実現しえない', reading: 'じつげんしえない', meaning: 'cannot be realized' },
    ],
  },
  {
    japanese: 'その研究は画期的であるがゆえに、賛否両論を巻き起こした。',
    english: 'Precisely because the research was groundbreaking, it stirred up both support and opposition.',
    breakdown: [
      { word: 'その', meaning: 'that' },
      { word: '研究', reading: 'けんきゅう', meaning: 'research' },
      { word: 'は', meaning: 'topic marker' },
      { word: '画期的', reading: 'かっきてき', meaning: 'groundbreaking / epoch-making' },
      { word: 'である', meaning: 'is (formal)' },
      { word: 'がゆえに', meaning: 'precisely because' },
      { word: '賛否両論', reading: 'さんぴりょうろん', meaning: 'pros and cons / controversy' },
      { word: 'を', meaning: 'object marker' },
      { word: '巻き起こした', reading: 'まきおこした', meaning: 'stirred up / caused' },
    ],
  },
  {
    japanese: '国際情勢が不安定な今こそ、対話を通じた解決が求められている。',
    english: 'Now, when the international situation is unstable, resolution through dialogue is called for.',
    breakdown: [
      { word: '国際情勢', reading: 'こくさいじょうせい', meaning: 'international situation' },
      { word: 'が', meaning: 'subject marker' },
      { word: '不安定な', reading: 'ふあんていな', meaning: 'unstable' },
      { word: '今こそ', reading: 'いまこそ', meaning: 'now more than ever' },
      { word: '対話', reading: 'たいわ', meaning: 'dialogue' },
      { word: 'を通じた', reading: 'をつうじた', meaning: 'through' },
      { word: '解決', reading: 'かいけつ', meaning: 'resolution' },
      { word: 'が', meaning: 'subject marker' },
      { word: '求められている', reading: 'もとめられている', meaning: 'is being called for' },
    ],
  },
  {
    japanese: '人工知能の発展は、便利さをもたらす反面、倫理的な問題も提起している。',
    english: 'The development of AI brings convenience, but on the other hand raises ethical issues.',
    breakdown: [
      { word: '人工知能', reading: 'じんこうちのう', meaning: 'artificial intelligence' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '発展', reading: 'はってん', meaning: 'development' },
      { word: 'は', meaning: 'topic marker' },
      { word: '便利さ', reading: 'べんりさ', meaning: 'convenience' },
      { word: 'をもたらす', meaning: 'to bring about' },
      { word: '反面', reading: 'はんめん', meaning: 'on the other hand' },
      { word: '倫理的な', reading: 'りんりてきな', meaning: 'ethical' },
      { word: '問題', reading: 'もんだい', meaning: 'problem / issue' },
      { word: 'も', meaning: 'also' },
      { word: '提起している', reading: 'ていきしている', meaning: 'is raising / proposing' },
    ],
  },
  {
    japanese: '彼の作品は伝統を踏まえつつも、斬新な表現を追求している。',
    english: 'His works pursue novel expression while being grounded in tradition.',
    breakdown: [
      { word: '彼', reading: 'かれ', meaning: 'he / his' },
      { word: 'の', meaning: 'possessive marker' },
      { word: '作品', reading: 'さくひん', meaning: 'works / creations' },
      { word: 'は', meaning: 'topic marker' },
      { word: '伝統', reading: 'でんとう', meaning: 'tradition' },
      { word: 'を踏まえつつも', reading: 'をふまえつつも', meaning: 'while being based on' },
      { word: '斬新な', reading: 'ざんしんな', meaning: 'novel / innovative' },
      { word: '表現', reading: 'ひょうげん', meaning: 'expression' },
      { word: 'を', meaning: 'object marker' },
      { word: '追求している', reading: 'ついきゅうしている', meaning: 'is pursuing' },
    ],
  },
  {
    japanese: '失敗を恐れるあまり、何も行動しないのでは本末転倒だ。',
    english: 'Being so afraid of failure that you take no action defeats the purpose.',
    breakdown: [
      { word: '失敗', reading: 'しっぱい', meaning: 'failure' },
      { word: 'を', meaning: 'object marker' },
      { word: '恐れる', reading: 'おそれる', meaning: 'to fear' },
      { word: 'あまり', meaning: 'so much that' },
      { word: '何も', reading: 'なにも', meaning: 'nothing / not anything' },
      { word: '行動しない', reading: 'こうどうしない', meaning: 'not take action' },
      { word: 'のでは', meaning: 'if it is the case that' },
      { word: '本末転倒', reading: 'ほんまつてんとう', meaning: 'putting the cart before the horse' },
      { word: 'だ', meaning: 'is (casual)' },
    ],
  },
];

export const LISTENING_BANK: Record<JLPTLevel, ListeningSentence[]> = {
  N5: N5_SENTENCES,
  N4: N4_SENTENCES,
  N3: N3_SENTENCES,
  N2: N2_SENTENCES,
  N1: N1_SENTENCES,
};

import { generateSentence } from './sentence-generator';

/**
 * Get a random sentence for a given JLPT level.
 *
 * Uses a mix of curated static sentences (30%) and generated
 * template-based sentences (70%) for virtually unlimited variety.
 * No API calls required.
 */
export function getRandomSentence(
  level: JLPTLevel,
  excludeIndices: number[] = []
): { sentence: ListeningSentence; index: number } {
  const sentences = LISTENING_BANK[level];
  const available = sentences
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => !excludeIndices.includes(i));

  // 30% chance to use a curated static sentence (if available)
  if (available.length > 0 && Math.random() < 0.3) {
    const pick = available[Math.floor(Math.random() * available.length)];
    return { sentence: pick.s, index: pick.i };
  }

  // 70% — generate a fresh sentence from templates (never repeats index)
  return { sentence: generateSentence(level), index: -1 };
}

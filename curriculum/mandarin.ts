/**
 * Mandarin Chinese Curriculum
 *
 * HSK-aligned curriculum from HSK 1 to HSK 6.
 */

import { Curriculum, Unit, Lesson } from './types';

// Unit 1: Pinyin & Basics (HSK 1)
const unit1Lessons: Lesson[] = [
  {
    id: 'zh-1-1',
    title: 'Pinyin Initials',
    titleNative: '声母',
    description: 'Learn the consonant sounds (initials) of Mandarin Chinese.',
    objectives: [
      'Recognize and pronounce all 21 initials',
      'Distinguish between similar sounds',
      'Combine initials with finals',
    ],
    estimatedMinutes: 30,
    vocabulary: [
      { term: 'b', reading: 'bo', meaning: 'initial b', example: '爸爸 (bàba)', exampleTranslation: 'father' },
      { term: 'p', reading: 'po', meaning: 'initial p', example: '朋友 (péngyou)', exampleTranslation: 'friend' },
      { term: 'm', reading: 'mo', meaning: 'initial m', example: '妈妈 (māma)', exampleTranslation: 'mother' },
      { term: 'f', reading: 'fo', meaning: 'initial f', example: '饭 (fàn)', exampleTranslation: 'rice/meal' },
      { term: 'd', reading: 'de', meaning: 'initial d', example: '大 (dà)', exampleTranslation: 'big' },
      { term: 't', reading: 'te', meaning: 'initial t', example: '他 (tā)', exampleTranslation: 'he' },
    ],
    grammarPoints: [],
    exercises: [
      {
        id: 'zh-1-1-ex1',
        type: 'listening',
        instruction: 'Listen and identify which initial you hear',
        content: { pairs: [['b', 'p'], ['d', 't'], ['g', 'k']] },
        difficulty: 1,
      },
    ],
    culturalNote: 'Pinyin was developed in the 1950s to help standardize pronunciation. While Chinese has thousands of characters, Pinyin uses the Roman alphabet.',
    conversationPrompts: ['Practice pronouncing initial sounds'],
  },
  {
    id: 'zh-1-2',
    title: 'The Four Tones',
    titleNative: '四声',
    description: 'Master the four tones of Mandarin Chinese.',
    objectives: [
      'Recognize all four tones',
      'Pronounce tones correctly',
      'Understand how tones change meaning',
    ],
    estimatedMinutes: 35,
    vocabulary: [
      { term: '妈', reading: 'mā', meaning: 'mother (1st tone)', example: '这是我妈妈。', exampleTranslation: 'This is my mother.' },
      { term: '麻', reading: 'má', meaning: 'hemp/numb (2nd tone)', example: '我的腿麻了。', exampleTranslation: 'My leg went numb.' },
      { term: '马', reading: 'mǎ', meaning: 'horse (3rd tone)', example: '那是一匹马。', exampleTranslation: 'That is a horse.' },
      { term: '骂', reading: 'mà', meaning: 'to scold (4th tone)', example: '别骂人。', exampleTranslation: 'Don\'t scold people.' },
    ],
    grammarPoints: [
      {
        pattern: 'Tone sandhi (3rd tone rule)',
        meaning: 'When two 3rd tones are together, the first becomes 2nd tone',
        formation: '3rd + 3rd → 2nd + 3rd',
        examples: [
          { sentence: '你好 (nǐhǎo → níhǎo)', translation: 'Hello (the first ni becomes 2nd tone)' },
          { sentence: '很好 (hěnhǎo → hénhǎo)', translation: 'Very good' },
        ],
        notes: 'This is automatic in natural speech and helps with fluency.',
      },
    ],
    exercises: [
      {
        id: 'zh-1-2-ex1',
        type: 'listening',
        instruction: 'Identify the tone of the word you hear',
        content: { words: ['mā', 'má', 'mǎ', 'mà'] },
        difficulty: 2,
      },
    ],
    culturalNote: 'Tones are crucial in Chinese. The same syllable with different tones can have completely different meanings. Practice with a native speaker is essential.',
    conversationPrompts: ['Practice saying 你好 with correct tones', 'Practice the four tones with "ma"'],
  },
  {
    id: 'zh-1-3',
    title: 'Basic Greetings',
    titleNative: '基本问候',
    description: 'Learn essential Mandarin greetings.',
    objectives: [
      'Greet people in various situations',
      'Introduce yourself',
      'Use polite expressions',
    ],
    estimatedMinutes: 25,
    vocabulary: [
      { term: '你好', reading: 'nǐ hǎo', meaning: 'hello', example: '你好，我叫小明。', exampleTranslation: 'Hello, my name is Xiaoming.' },
      { term: '您好', reading: 'nín hǎo', meaning: 'hello (formal)', example: '老师，您好！', exampleTranslation: 'Hello, teacher!' },
      { term: '早上好', reading: 'zǎoshang hǎo', meaning: 'good morning', example: '早上好，今天天气很好。', exampleTranslation: 'Good morning, the weather is nice today.' },
      { term: '再见', reading: 'zàijiàn', meaning: 'goodbye', example: '再见，明天见！', exampleTranslation: 'Goodbye, see you tomorrow!' },
      { term: '谢谢', reading: 'xièxie', meaning: 'thank you', example: '谢谢你的帮助。', exampleTranslation: 'Thank you for your help.' },
      { term: '不客气', reading: 'bù kèqi', meaning: 'you\'re welcome', example: '不客气，应该的。', exampleTranslation: 'You\'re welcome, it\'s what I should do.' },
      { term: '对不起', reading: 'duìbuqǐ', meaning: 'sorry', example: '对不起，我来晚了。', exampleTranslation: 'Sorry, I\'m late.' },
      { term: '没关系', reading: 'méi guānxi', meaning: 'it\'s okay', example: '没关系，别担心。', exampleTranslation: 'It\'s okay, don\'t worry.' },
    ],
    grammarPoints: [
      {
        pattern: '我叫...',
        meaning: 'My name is...',
        formation: '我叫 + Name',
        examples: [
          { sentence: '我叫王小明。', translation: 'My name is Wang Xiaoming.' },
          { sentence: '我叫 Michael。', translation: 'My name is Michael.' },
        ],
      },
      {
        pattern: '你呢？',
        meaning: 'And you? / What about you?',
        formation: 'Statement + 你呢？',
        examples: [
          { sentence: '我很好，你呢？', translation: 'I\'m fine, and you?' },
          { sentence: '我是美国人，你呢？', translation: 'I\'m American, and you?' },
        ],
      },
    ],
    exercises: [
      {
        id: 'zh-1-3-ex1',
        type: 'conversation',
        instruction: 'Practice a greeting dialogue',
        content: {
          dialogue: [
            { speaker: 'A', text: '你好！' },
            { speaker: 'B', text: '你好！你叫什么名字？' },
            { speaker: 'A', text: '我叫___。你呢？' },
          ],
        },
        difficulty: 1,
      },
    ],
    culturalNote: 'Chinese people often greet each other with "你吃了吗？" (Have you eaten?). This doesn\'t mean they\'re inviting you to eat—it\'s just a common greeting showing care.',
    conversationPrompts: [
      'Greet your Chinese teacher',
      'Introduce yourself to a new friend',
      'Thank someone for helping you',
    ],
  },
];

// Unit 2: Numbers & Basic Sentences (HSK 1)
const unit2Lessons: Lesson[] = [
  {
    id: 'zh-2-1',
    title: 'Numbers 1-100',
    titleNative: '数字 1-100',
    description: 'Learn Chinese numbers and basic counting.',
    objectives: [
      'Count from 1 to 100',
      'Use numbers in conversation',
      'Understand Chinese hand gestures for numbers',
    ],
    estimatedMinutes: 25,
    vocabulary: [
      { term: '一', reading: 'yī', meaning: 'one' },
      { term: '二', reading: 'èr', meaning: 'two' },
      { term: '三', reading: 'sān', meaning: 'three' },
      { term: '四', reading: 'sì', meaning: 'four' },
      { term: '五', reading: 'wǔ', meaning: 'five' },
      { term: '六', reading: 'liù', meaning: 'six' },
      { term: '七', reading: 'qī', meaning: 'seven' },
      { term: '八', reading: 'bā', meaning: 'eight' },
      { term: '九', reading: 'jiǔ', meaning: 'nine' },
      { term: '十', reading: 'shí', meaning: 'ten' },
      { term: '百', reading: 'bǎi', meaning: 'hundred' },
    ],
    grammarPoints: [
      {
        pattern: 'Number + 个',
        meaning: 'General measure word for counting',
        formation: 'Number + 个 + Noun',
        examples: [
          { sentence: '三个人', translation: 'three people' },
          { sentence: '五个苹果', translation: 'five apples' },
        ],
        notes: '个 is the most common measure word and can be used when you don\'t know the specific measure word.',
      },
      {
        pattern: '两 vs 二',
        meaning: 'Both mean "two" but used differently',
        formation: '两 + measure word, 二 alone or in larger numbers',
        examples: [
          { sentence: '两个人', translation: 'two people (use 两 with measure words)' },
          { sentence: '二十', translation: 'twenty (use 二 in larger numbers)' },
        ],
      },
    ],
    exercises: [],
    culturalNote: 'The number 8 (八 bā) is considered very lucky in Chinese culture because it sounds like "发" (fā, prosperity). 4 (四 sì) is unlucky as it sounds like "死" (sǐ, death).',
    conversationPrompts: [
      'Ask for the price of something',
      'Tell someone your age',
      'Count objects around you',
    ],
  },
  {
    id: 'zh-2-2',
    title: 'Basic Questions',
    titleNative: '基本问句',
    description: 'Learn to ask and answer simple questions.',
    objectives: [
      'Ask yes/no questions',
      'Use question words (who, what, where, when)',
      'Respond to common questions',
    ],
    estimatedMinutes: 30,
    vocabulary: [
      { term: '什么', reading: 'shénme', meaning: 'what', example: '这是什么？', exampleTranslation: 'What is this?' },
      { term: '谁', reading: 'shéi/shuí', meaning: 'who', example: '他是谁？', exampleTranslation: 'Who is he?' },
      { term: '哪里', reading: 'nǎlǐ', meaning: 'where', example: '你住在哪里？', exampleTranslation: 'Where do you live?' },
      { term: '什么时候', reading: 'shénme shíhou', meaning: 'when', example: '你什么时候来？', exampleTranslation: 'When are you coming?' },
      { term: '为什么', reading: 'wèishénme', meaning: 'why', example: '为什么你学中文？', exampleTranslation: 'Why are you learning Chinese?' },
      { term: '怎么', reading: 'zěnme', meaning: 'how', example: '这个字怎么写？', exampleTranslation: 'How do you write this character?' },
    ],
    grammarPoints: [
      {
        pattern: '...吗？',
        meaning: 'Yes/no question particle',
        formation: 'Statement + 吗？',
        examples: [
          { sentence: '你是学生吗？', translation: 'Are you a student?' },
          { sentence: '你会说中文吗？', translation: 'Can you speak Chinese?' },
        ],
      },
      {
        pattern: 'A 不 A question',
        meaning: 'Alternative way to ask yes/no questions',
        formation: 'Verb/Adj + 不 + Verb/Adj',
        examples: [
          { sentence: '你去不去？', translation: 'Are you going (or not)?' },
          { sentence: '好不好？', translation: 'Is it good (or not)? / Okay?' },
        ],
      },
    ],
    exercises: [],
    culturalNote: 'In Chinese, question words stay in the same position as the answer would be. "你叫什么？" (What\'s your name?) - the answer goes where 什么 is.',
    conversationPrompts: [
      'Ask someone their name',
      'Ask where someone is from',
      'Ask what time it is',
    ],
  },
];

// HSK 1 Units
const hsk1Units: Unit[] = [
  {
    id: 'zh-hsk1-1',
    number: 1,
    title: 'Pinyin & Greetings',
    titleNative: '拼音与问候',
    description: 'Master Pinyin pronunciation and basic expressions.',
    level: 'A1',
    lessons: unit1Lessons,
    certification: 'HSK 1',
  },
  {
    id: 'zh-hsk1-2',
    number: 2,
    title: 'Numbers & Questions',
    titleNative: '数字与问题',
    description: 'Learn numbers and how to ask simple questions.',
    level: 'A1',
    lessons: unit2Lessons,
    certification: 'HSK 1',
  },
];

// HSK 2 Units
const hsk2Units: Unit[] = [
  {
    id: 'zh-hsk2-1',
    number: 3,
    title: 'Daily Activities',
    titleNative: '日常活动',
    description: 'Talk about your daily routines and activities.',
    level: 'A2',
    lessons: [
      {
        id: 'zh-3-1',
        title: 'Time & Schedule',
        titleNative: '时间与日程',
        description: 'Learn to tell time and discuss schedules.',
        objectives: ['Tell the time', 'Discuss daily schedule', 'Make appointments'],
        estimatedMinutes: 30,
        vocabulary: [
          { term: '点', reading: 'diǎn', meaning: 'o\'clock', example: '现在几点？三点。', exampleTranslation: 'What time is it? 3 o\'clock.' },
          { term: '分', reading: 'fēn', meaning: 'minute', example: '三点十五分', exampleTranslation: '3:15' },
          { term: '半', reading: 'bàn', meaning: 'half', example: '两点半', exampleTranslation: '2:30' },
          { term: '早上', reading: 'zǎoshang', meaning: 'morning', example: '我早上六点起床。', exampleTranslation: 'I wake up at 6 in the morning.' },
          { term: '下午', reading: 'xiàwǔ', meaning: 'afternoon', example: '下午我去上班。', exampleTranslation: 'I go to work in the afternoon.' },
          { term: '晚上', reading: 'wǎnshang', meaning: 'evening', example: '晚上我看电视。', exampleTranslation: 'I watch TV in the evening.' },
        ],
        grammarPoints: [
          {
            pattern: '几点',
            meaning: 'What time',
            formation: '几点 + Verb?',
            examples: [
              { sentence: '你几点起床？', translation: 'What time do you wake up?' },
              { sentence: '电影几点开始？', translation: 'What time does the movie start?' },
            ],
          },
        ],
        exercises: [],
        culturalNote: 'China uses a 24-hour clock in formal contexts but 12-hour in daily conversation. Morning is specified with 早上, afternoon with 下午.',
        conversationPrompts: ['Ask what time it is', 'Describe your daily routine'],
      },
    ],
    certification: 'HSK 2',
  },
];

export const mandarinCurriculum: Curriculum = {
  language: 'mandarin',
  name: 'Mandarin Chinese Course',
  description: 'Comprehensive Mandarin course aligned with HSK levels 1 to 6.',
  units: [...hsk1Units, ...hsk2Units],
};

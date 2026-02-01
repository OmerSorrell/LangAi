/**
 * Japanese Curriculum
 *
 * JLPT-aligned curriculum from N5 to N1.
 */

import { Curriculum, Unit, Lesson } from './types';

// Unit 1: Introduction & Greetings (JLPT N5)
const unit1Lessons: Lesson[] = [
  {
    id: 'jp-1-1',
    title: 'Basic Greetings',
    titleNative: '基本のあいさつ',
    description: 'Learn essential Japanese greetings for daily life.',
    objectives: [
      'Greet people at different times of day',
      'Introduce yourself politely',
      'Use basic farewell expressions',
    ],
    estimatedMinutes: 20,
    vocabulary: [
      { term: 'こんにちは', reading: 'konnichiwa', meaning: 'Hello (daytime)', example: 'こんにちは、田中さん。', exampleTranslation: 'Hello, Mr. Tanaka.' },
      { term: 'おはようございます', reading: 'ohayou gozaimasu', meaning: 'Good morning (polite)', example: 'おはようございます、先生。', exampleTranslation: 'Good morning, teacher.' },
      { term: 'こんばんは', reading: 'konbanwa', meaning: 'Good evening', example: 'こんばんは、お元気ですか。', exampleTranslation: 'Good evening, how are you?' },
      { term: 'さようなら', reading: 'sayounara', meaning: 'Goodbye', example: 'さようなら、また明日。', exampleTranslation: 'Goodbye, see you tomorrow.' },
      { term: 'ありがとうございます', reading: 'arigatou gozaimasu', meaning: 'Thank you (polite)', example: 'ありがとうございます、助かりました。', exampleTranslation: 'Thank you, that helped a lot.' },
      { term: 'すみません', reading: 'sumimasen', meaning: 'Excuse me / Sorry', example: 'すみません、駅はどこですか。', exampleTranslation: 'Excuse me, where is the station?' },
    ],
    grammarPoints: [
      {
        pattern: '〜です',
        meaning: 'Polite copula (is/am/are)',
        formation: 'Noun + です',
        examples: [
          { sentence: '私は学生です。', translation: 'I am a student.' },
          { sentence: 'これは本です。', translation: 'This is a book.' },
        ],
      },
      {
        pattern: '〜は〜です',
        meaning: 'Topic marker + copula',
        formation: 'Topic は Description です',
        examples: [
          { sentence: '私の名前は田中です。', translation: 'My name is Tanaka.' },
          { sentence: '今日は月曜日です。', translation: 'Today is Monday.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'jp-1-1-ex1',
        type: 'vocabulary',
        instruction: 'Match the greeting to the correct time of day',
        content: {
          pairs: [
            { term: 'おはようございます', match: 'Morning' },
            { term: 'こんにちは', match: 'Afternoon' },
            { term: 'こんばんは', match: 'Evening' },
          ],
        },
        difficulty: 1,
      },
      {
        id: 'jp-1-1-ex2',
        type: 'speaking',
        instruction: 'Practice introducing yourself using: 私は[name]です。よろしくお願いします。',
        content: {
          prompt: 'Introduce yourself in Japanese',
          sampleAnswer: '私は[あなたの名前]です。よろしくお願いします。',
        },
        difficulty: 1,
      },
    ],
    culturalNote: 'Bowing is an important part of Japanese greetings. The depth of the bow indicates the level of respect. A casual nod (15°) is for friends, while a deeper bow (30-45°) shows more respect.',
    conversationPrompts: [
      'Practice greeting your teacher in the morning',
      'Introduce yourself to a new classmate',
      'Thank someone for helping you',
    ],
  },
  {
    id: 'jp-1-2',
    title: 'Self Introduction',
    titleNative: '自己紹介',
    description: 'Learn to introduce yourself and ask about others.',
    objectives: [
      'State your name, nationality, and occupation',
      'Ask basic questions about others',
      'Use polite question forms',
    ],
    estimatedMinutes: 25,
    vocabulary: [
      { term: '名前', reading: 'なまえ', meaning: 'name', example: 'お名前は何ですか。', exampleTranslation: 'What is your name?' },
      { term: '学生', reading: 'がくせい', meaning: 'student', example: '私は大学生です。', exampleTranslation: 'I am a university student.' },
      { term: '会社員', reading: 'かいしゃいん', meaning: 'office worker', example: '父は会社員です。', exampleTranslation: 'My father is an office worker.' },
      { term: '先生', reading: 'せんせい', meaning: 'teacher', example: '山田先生は日本語の先生です。', exampleTranslation: 'Mr. Yamada is a Japanese teacher.' },
      { term: '国', reading: 'くに', meaning: 'country', example: 'どの国から来ましたか。', exampleTranslation: 'Which country are you from?' },
      { term: 'アメリカ', reading: 'amerika', meaning: 'America', example: '私はアメリカ人です。', exampleTranslation: 'I am American.' },
    ],
    grammarPoints: [
      {
        pattern: '〜は何ですか',
        meaning: 'What is ~?',
        formation: 'Topic は 何 ですか',
        examples: [
          { sentence: 'お名前は何ですか。', translation: 'What is your name?' },
          { sentence: 'お仕事は何ですか。', translation: 'What is your job?' },
        ],
      },
      {
        pattern: '〜から来ました',
        meaning: 'Came from ~',
        formation: 'Place から 来ました',
        examples: [
          { sentence: 'アメリカから来ました。', translation: 'I came from America.' },
          { sentence: '東京から来ました。', translation: 'I came from Tokyo.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'jp-1-2-ex1',
        type: 'grammar',
        instruction: 'Fill in the blank with the correct particle',
        content: {
          sentences: [
            { text: '私___学生です。', answer: 'は', translation: 'I am a student.' },
            { text: 'アメリカ___来ました。', answer: 'から', translation: 'I came from America.' },
          ],
        },
        difficulty: 1,
      },
    ],
    culturalNote: 'When introducing yourself in Japan, it\'s common to mention your company or school affiliation. Business cards (名刺) are exchanged with both hands and treated respectfully.',
    conversationPrompts: [
      'Introduce yourself to a Japanese colleague',
      'Ask someone where they are from',
      'Tell someone about your occupation',
    ],
  },
  {
    id: 'jp-1-3',
    title: 'Numbers 1-100',
    titleNative: '数字 1-100',
    description: 'Master Japanese numbers and counting.',
    objectives: [
      'Count from 1 to 100',
      'Use numbers in daily contexts',
      'Understand Japanese number irregularities',
    ],
    estimatedMinutes: 30,
    vocabulary: [
      { term: '一', reading: 'いち', meaning: 'one' },
      { term: '二', reading: 'に', meaning: 'two' },
      { term: '三', reading: 'さん', meaning: 'three' },
      { term: '四', reading: 'よん/し', meaning: 'four' },
      { term: '五', reading: 'ご', meaning: 'five' },
      { term: '六', reading: 'ろく', meaning: 'six' },
      { term: '七', reading: 'なな/しち', meaning: 'seven' },
      { term: '八', reading: 'はち', meaning: 'eight' },
      { term: '九', reading: 'きゅう/く', meaning: 'nine' },
      { term: '十', reading: 'じゅう', meaning: 'ten' },
      { term: '百', reading: 'ひゃく', meaning: 'hundred' },
    ],
    grammarPoints: [
      {
        pattern: '〜つ (counter)',
        meaning: 'General counter for objects',
        formation: 'Number + つ (1-9)',
        examples: [
          { sentence: 'りんごを三つください。', translation: 'Please give me three apples.' },
          { sentence: '本を五つ買いました。', translation: 'I bought five books.' },
        ],
        notes: 'The つ counter is irregular: ひとつ、ふたつ、みっつ、よっつ、いつつ、むっつ、ななつ、やっつ、ここのつ、とお',
      },
    ],
    exercises: [
      {
        id: 'jp-1-3-ex1',
        type: 'listening',
        instruction: 'Write the number you hear',
        content: {
          numbers: [15, 42, 78, 100],
        },
        difficulty: 2,
      },
    ],
    culturalNote: 'The numbers 4 (shi) and 9 (ku) are considered unlucky in Japan as they sound like "death" (死) and "suffering" (苦). Many buildings skip the 4th floor.',
    conversationPrompts: [
      'Ask for the price of an item',
      'Tell someone your age',
      'Give your phone number',
    ],
  },
];

// Unit 2: Daily Life (JLPT N5)
const unit2Lessons: Lesson[] = [
  {
    id: 'jp-2-1',
    title: 'Time & Schedule',
    titleNative: '時間とスケジュール',
    description: 'Learn to tell time and discuss daily schedules.',
    objectives: [
      'Tell and ask the time',
      'Describe daily routines',
      'Use time-related vocabulary',
    ],
    estimatedMinutes: 25,
    vocabulary: [
      { term: '時', reading: 'じ', meaning: 'o\'clock', example: '今、三時です。', exampleTranslation: 'It\'s 3 o\'clock now.' },
      { term: '分', reading: 'ふん/ぷん', meaning: 'minute', example: '十五分です。', exampleTranslation: 'It\'s 15 minutes.' },
      { term: '朝', reading: 'あさ', meaning: 'morning', example: '朝ごはんを食べます。', exampleTranslation: 'I eat breakfast.' },
      { term: '昼', reading: 'ひる', meaning: 'noon/daytime', example: '昼休みは十二時からです。', exampleTranslation: 'Lunch break starts at 12.' },
      { term: '夜', reading: 'よる', meaning: 'night', example: '夜、本を読みます。', exampleTranslation: 'I read books at night.' },
      { term: '今', reading: 'いま', meaning: 'now', example: '今、何時ですか。', exampleTranslation: 'What time is it now?' },
    ],
    grammarPoints: [
      {
        pattern: '〜時〜分',
        meaning: 'Telling time',
        formation: 'Number 時 Number 分',
        examples: [
          { sentence: '今、九時三十分です。', translation: 'It\'s 9:30 now.' },
          { sentence: '会議は二時十五分からです。', translation: 'The meeting starts at 2:15.' },
        ],
      },
      {
        pattern: '〜から〜まで',
        meaning: 'From ~ to ~',
        formation: 'Time/Place から Time/Place まで',
        examples: [
          { sentence: '九時から五時まで働きます。', translation: 'I work from 9 to 5.' },
          { sentence: '東京から大阪まで三時間です。', translation: 'It\'s 3 hours from Tokyo to Osaka.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'jp-2-1-ex1',
        type: 'speaking',
        instruction: 'Describe your daily schedule',
        content: {
          prompts: [
            'What time do you wake up?',
            'What time do you eat lunch?',
            'What time do you go to sleep?',
          ],
        },
        difficulty: 2,
      },
    ],
    culturalNote: 'Japanese trains are famous for their punctuality. Being even a few minutes late is considered rude in professional settings.',
    conversationPrompts: [
      'Ask what time the store opens',
      'Describe your morning routine',
      'Make an appointment for a specific time',
    ],
  },
];

// JLPT N5 Units
const n5Units: Unit[] = [
  {
    id: 'jp-n5-1',
    number: 1,
    title: 'Introduction & Greetings',
    titleNative: '紹介とあいさつ',
    description: 'Master basic greetings, self-introduction, and essential politeness.',
    level: 'A1',
    lessons: unit1Lessons,
    certification: 'JLPT N5',
  },
  {
    id: 'jp-n5-2',
    number: 2,
    title: 'Daily Life',
    titleNative: '日常生活',
    description: 'Learn vocabulary and expressions for everyday activities.',
    level: 'A1',
    lessons: unit2Lessons,
    certification: 'JLPT N5',
  },
];

// JLPT N4 Units (Intermediate beginner)
const n4Units: Unit[] = [
  {
    id: 'jp-n4-1',
    number: 3,
    title: 'Verb Conjugations',
    titleNative: '動詞の活用',
    description: 'Master て-form, た-form, and conditional forms.',
    level: 'A2',
    lessons: [
      {
        id: 'jp-3-1',
        title: 'て-form Introduction',
        titleNative: 'て形の紹介',
        description: 'Learn the versatile て-form and its uses.',
        objectives: ['Conjugate verbs to て-form', 'Make requests with てください', 'Connect actions'],
        estimatedMinutes: 35,
        vocabulary: [
          { term: '食べて', reading: 'たべて', meaning: 'eat (て-form)', example: '食べてください。', exampleTranslation: 'Please eat.' },
          { term: '飲んで', reading: 'のんで', meaning: 'drink (て-form)', example: '水を飲んでいます。', exampleTranslation: 'I am drinking water.' },
          { term: '見て', reading: 'みて', meaning: 'see/look (て-form)', example: 'これを見てください。', exampleTranslation: 'Please look at this.' },
        ],
        grammarPoints: [
          {
            pattern: 'て-form + ください',
            meaning: 'Please do ~',
            formation: 'Verb (て-form) + ください',
            examples: [
              { sentence: '待ってください。', translation: 'Please wait.' },
              { sentence: 'ゆっくり話してください。', translation: 'Please speak slowly.' },
            ],
          },
          {
            pattern: 'て-form + います',
            meaning: 'Progressive/continuous action',
            formation: 'Verb (て-form) + います',
            examples: [
              { sentence: '今、勉強しています。', translation: 'I am studying now.' },
              { sentence: '雨が降っています。', translation: 'It is raining.' },
            ],
          },
        ],
        exercises: [],
        conversationPrompts: ['Ask someone to speak more slowly', 'Describe what you are doing now'],
      },
    ],
    certification: 'JLPT N4',
  },
];

// JLPT N3 Units (Intermediate)
const n3Units: Unit[] = [
  {
    id: 'jp-n3-1',
    number: 5,
    title: 'Complex Expressions',
    titleNative: '複雑な表現',
    description: 'Learn nuanced expressions and formal language.',
    level: 'B1',
    lessons: [
      {
        id: 'jp-5-1',
        title: 'Giving & Receiving',
        titleNative: '授受表現',
        description: 'Master あげる/もらう/くれる expressions.',
        objectives: ['Use giving/receiving verbs correctly', 'Understand social dynamics in Japanese'],
        estimatedMinutes: 40,
        vocabulary: [
          { term: 'あげる', meaning: 'to give (to someone)', example: '友達にプレゼントをあげました。', exampleTranslation: 'I gave a present to my friend.' },
          { term: 'もらう', meaning: 'to receive', example: '母から手紙をもらいました。', exampleTranslation: 'I received a letter from my mother.' },
          { term: 'くれる', meaning: 'to give (to me/us)', example: '先生が本をくれました。', exampleTranslation: 'The teacher gave me a book.' },
        ],
        grammarPoints: [
          {
            pattern: 'てあげる/てもらう/てくれる',
            meaning: 'Doing something for someone / Having someone do something',
            formation: 'Verb (て-form) + あげる/もらう/くれる',
            examples: [
              { sentence: '友達に日本語を教えてあげました。', translation: 'I taught Japanese to my friend (for their benefit).' },
              { sentence: '先生に説明してもらいました。', translation: 'I had the teacher explain it to me.' },
            ],
          },
        ],
        exercises: [],
        conversationPrompts: ['Describe a gift you gave someone', 'Talk about help you received'],
      },
    ],
    certification: 'JLPT N3',
  },
];

export const japaneseCurriculum: Curriculum = {
  language: 'japanese',
  name: 'Japanese Language Course',
  description: 'Comprehensive Japanese course aligned with JLPT levels N5 to N1.',
  units: [...n5Units, ...n4Units, ...n3Units],
};

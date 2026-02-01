/**
 * Korean Curriculum
 *
 * TOPIK-aligned curriculum from Level 1 to Level 6.
 */

import { Curriculum, Unit, Lesson } from './types';

// Unit 1: Hangul & Basics (TOPIK I - Level 1)
const unit1Lessons: Lesson[] = [
  {
    id: 'kr-1-1',
    title: 'Hangul Vowels',
    titleNative: '한글 모음',
    description: 'Learn the basic vowels of the Korean alphabet.',
    objectives: [
      'Recognize and write basic vowels',
      'Pronounce vowels correctly',
      'Combine vowels with consonants',
    ],
    estimatedMinutes: 25,
    vocabulary: [
      { term: 'ㅏ', reading: 'a', meaning: 'vowel "a"', example: '아이', exampleTranslation: 'child' },
      { term: 'ㅓ', reading: 'eo', meaning: 'vowel "eo"', example: '어머니', exampleTranslation: 'mother' },
      { term: 'ㅗ', reading: 'o', meaning: 'vowel "o"', example: '오리', exampleTranslation: 'duck' },
      { term: 'ㅜ', reading: 'u', meaning: 'vowel "u"', example: '우유', exampleTranslation: 'milk' },
      { term: 'ㅡ', reading: 'eu', meaning: 'vowel "eu"', example: '으악', exampleTranslation: 'ahh (exclamation)' },
      { term: 'ㅣ', reading: 'i', meaning: 'vowel "i"', example: '이름', exampleTranslation: 'name' },
    ],
    grammarPoints: [],
    exercises: [
      {
        id: 'kr-1-1-ex1',
        type: 'writing',
        instruction: 'Practice writing each vowel 5 times',
        content: { vowels: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'] },
        difficulty: 1,
      },
    ],
    culturalNote: 'Hangul was created by King Sejong in 1443. It was designed to be easy to learn so that common people could read and write.',
    conversationPrompts: ['Practice pronouncing each vowel sound'],
  },
  {
    id: 'kr-1-2',
    title: 'Basic Greetings',
    titleNative: '기본 인사',
    description: 'Learn essential Korean greetings and expressions.',
    objectives: [
      'Greet people formally and informally',
      'Use appropriate speech levels',
      'Express thanks and apologies',
    ],
    estimatedMinutes: 20,
    vocabulary: [
      { term: '안녕하세요', reading: 'annyeonghaseyo', meaning: 'Hello (formal)', example: '안녕하세요, 처음 뵙겠습니다.', exampleTranslation: 'Hello, nice to meet you.' },
      { term: '안녕', reading: 'annyeong', meaning: 'Hi/Bye (informal)', example: '안녕, 잘 지냈어?', exampleTranslation: 'Hi, how have you been?' },
      { term: '감사합니다', reading: 'gamsahamnida', meaning: 'Thank you (formal)', example: '도와주셔서 감사합니다.', exampleTranslation: 'Thank you for helping me.' },
      { term: '고마워', reading: 'gomawo', meaning: 'Thanks (informal)', example: '선물 고마워!', exampleTranslation: 'Thanks for the gift!' },
      { term: '죄송합니다', reading: 'joesonghamnida', meaning: 'I\'m sorry (formal)', example: '늦어서 죄송합니다.', exampleTranslation: 'I\'m sorry for being late.' },
      { term: '미안해', reading: 'mianhae', meaning: 'Sorry (informal)', example: '미안해, 내 잘못이야.', exampleTranslation: 'Sorry, it\'s my fault.' },
    ],
    grammarPoints: [
      {
        pattern: '-습니다 / -ㅂ니다',
        meaning: 'Formal polite sentence ending',
        formation: 'Verb stem + 습니다/ㅂ니다',
        examples: [
          { sentence: '저는 학생입니다.', translation: 'I am a student.' },
          { sentence: '한국어를 공부합니다.', translation: 'I study Korean.' },
        ],
      },
      {
        pattern: '-아요 / -어요',
        meaning: 'Informal polite sentence ending',
        formation: 'Verb stem + 아요/어요',
        examples: [
          { sentence: '뭐 해요?', translation: 'What are you doing?' },
          { sentence: '저도 가요.', translation: 'I\'m going too.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'kr-1-2-ex1',
        type: 'speaking',
        instruction: 'Practice formal greetings with a teacher scenario',
        content: { scenario: 'Meeting your Korean teacher for the first time' },
        difficulty: 1,
      },
    ],
    culturalNote: 'Korean has multiple speech levels. Using the wrong level can be considered rude. When in doubt, use formal speech with people you\'ve just met or who are older.',
    conversationPrompts: [
      'Greet your Korean teacher',
      'Thank someone for a gift',
      'Apologize for being late',
    ],
  },
  {
    id: 'kr-1-3',
    title: 'Self Introduction',
    titleNative: '자기소개',
    description: 'Learn to introduce yourself in Korean.',
    objectives: [
      'State your name and nationality',
      'Tell your occupation or student status',
      'Ask others about themselves',
    ],
    estimatedMinutes: 25,
    vocabulary: [
      { term: '이름', reading: 'ireum', meaning: 'name', example: '이름이 뭐예요?', exampleTranslation: 'What is your name?' },
      { term: '저', reading: 'jeo', meaning: 'I (formal)', example: '저는 미국 사람이에요.', exampleTranslation: 'I am American.' },
      { term: '나', reading: 'na', meaning: 'I (informal)', example: '나는 학생이야.', exampleTranslation: 'I\'m a student.' },
      { term: '학생', reading: 'haksaeng', meaning: 'student', example: '대학생이에요.', exampleTranslation: 'I\'m a university student.' },
      { term: '회사원', reading: 'hoesawon', meaning: 'office worker', example: '저는 회사원입니다.', exampleTranslation: 'I am an office worker.' },
      { term: '나라', reading: 'nara', meaning: 'country', example: '어느 나라에서 왔어요?', exampleTranslation: 'Which country are you from?' },
    ],
    grammarPoints: [
      {
        pattern: '저는 [name]입니다/이에요',
        meaning: 'I am [name]',
        formation: '저는 + Name + 입니다/이에요',
        examples: [
          { sentence: '저는 김민수입니다.', translation: 'I am Kim Minsu.' },
          { sentence: '저는 마이클이에요.', translation: 'I am Michael.' },
        ],
      },
      {
        pattern: '-에서 왔어요',
        meaning: 'I came from ~',
        formation: 'Place + 에서 왔어요',
        examples: [
          { sentence: '미국에서 왔어요.', translation: 'I came from America.' },
          { sentence: '서울에서 왔어요.', translation: 'I came from Seoul.' },
        ],
      },
    ],
    exercises: [],
    culturalNote: 'In Korean culture, age is very important. It\'s common to ask someone\'s age early in a conversation to determine the appropriate speech level.',
    conversationPrompts: [
      'Introduce yourself to a new Korean friend',
      'Ask someone where they are from',
      'Tell someone what you do for work',
    ],
  },
];

// Unit 2: Numbers & Time (TOPIK I - Level 1)
const unit2Lessons: Lesson[] = [
  {
    id: 'kr-2-1',
    title: 'Sino-Korean Numbers',
    titleNative: '한자어 숫자',
    description: 'Learn Chinese-origin numbers used for dates, money, and phone numbers.',
    objectives: [
      'Count using Sino-Korean numbers',
      'Use numbers for dates and money',
      'Say phone numbers',
    ],
    estimatedMinutes: 25,
    vocabulary: [
      { term: '일', reading: 'il', meaning: 'one' },
      { term: '이', reading: 'i', meaning: 'two' },
      { term: '삼', reading: 'sam', meaning: 'three' },
      { term: '사', reading: 'sa', meaning: 'four' },
      { term: '오', reading: 'o', meaning: 'five' },
      { term: '육', reading: 'yuk', meaning: 'six' },
      { term: '칠', reading: 'chil', meaning: 'seven' },
      { term: '팔', reading: 'pal', meaning: 'eight' },
      { term: '구', reading: 'gu', meaning: 'nine' },
      { term: '십', reading: 'sip', meaning: 'ten' },
      { term: '백', reading: 'baek', meaning: 'hundred' },
      { term: '천', reading: 'cheon', meaning: 'thousand' },
    ],
    grammarPoints: [
      {
        pattern: '~원',
        meaning: 'Korean Won (currency)',
        formation: 'Number + 원',
        examples: [
          { sentence: '이거 얼마예요? 오천 원이에요.', translation: 'How much is this? It\'s 5,000 won.' },
          { sentence: '만 원 주세요.', translation: 'Please give me 10,000 won.' },
        ],
      },
    ],
    exercises: [],
    culturalNote: 'Korea uses two number systems: Sino-Korean (Chinese-origin) and Native Korean. Sino-Korean is used for dates, money, phone numbers, and addresses.',
    conversationPrompts: [
      'Ask for the price of something',
      'Give your phone number',
      'Say today\'s date',
    ],
  },
];

// TOPIK I Units
const topik1Units: Unit[] = [
  {
    id: 'kr-topik1-1',
    number: 1,
    title: 'Hangul & Greetings',
    titleNative: '한글과 인사',
    description: 'Master the Korean alphabet and basic expressions.',
    level: 'A1',
    lessons: unit1Lessons,
    certification: 'TOPIK I (Level 1)',
  },
  {
    id: 'kr-topik1-2',
    number: 2,
    title: 'Numbers & Time',
    titleNative: '숫자와 시간',
    description: 'Learn Korean number systems and time expressions.',
    level: 'A1',
    lessons: unit2Lessons,
    certification: 'TOPIK I (Level 1)',
  },
];

// TOPIK I Level 2
const topik2Units: Unit[] = [
  {
    id: 'kr-topik1-3',
    number: 3,
    title: 'Daily Conversations',
    titleNative: '일상 대화',
    description: 'Handle everyday situations in Korean.',
    level: 'A2',
    lessons: [
      {
        id: 'kr-3-1',
        title: 'Shopping',
        titleNative: '쇼핑',
        description: 'Learn to shop and negotiate in Korean.',
        objectives: ['Ask for prices', 'Negotiate politely', 'Describe what you want'],
        estimatedMinutes: 30,
        vocabulary: [
          { term: '얼마예요?', meaning: 'How much is it?', example: '이 가방 얼마예요?', exampleTranslation: 'How much is this bag?' },
          { term: '깎아 주세요', meaning: 'Please give me a discount', example: '조금만 깎아 주세요.', exampleTranslation: 'Please give me a small discount.' },
          { term: '이거 주세요', meaning: 'Please give me this', example: '이거 두 개 주세요.', exampleTranslation: 'Please give me two of these.' },
        ],
        grammarPoints: [
          {
            pattern: '-아/어 주세요',
            meaning: 'Please do ~ (for me)',
            formation: 'Verb stem + 아/어 주세요',
            examples: [
              { sentence: '싸게 해 주세요.', translation: 'Please make it cheaper.' },
              { sentence: '포장해 주세요.', translation: 'Please wrap it up.' },
            ],
          },
        ],
        exercises: [],
        culturalNote: 'Bargaining is common in traditional markets (시장) but not in department stores or convenience stores.',
        conversationPrompts: ['Buy something at a market', 'Ask for a discount'],
      },
    ],
    certification: 'TOPIK I (Level 2)',
  },
];

export const koreanCurriculum: Curriculum = {
  language: 'korean',
  name: 'Korean Language Course',
  description: 'Comprehensive Korean course aligned with TOPIK levels 1 to 6.',
  units: [...topik1Units, ...topik2Units],
};

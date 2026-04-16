/**
 * Japanese Particle Explanations
 *
 * Rich explanations of Japanese grammatical particles (助詞).
 * Typing "object marker" doesn't teach anything — these explain
 * what the particle *does* in a sentence and why it's there.
 */

export interface ParticleInfo {
  /** The particle itself */
  particle: string;
  /** Short grammatical label — "Direct Object", "Topic", etc. */
  role: string;
  /** One-sentence plain-English description of its function */
  function: string;
  /** How to think about it: "marks the X in 'X does Y'" */
  rule: string;
  /** A concrete mini-example — the particle shown in context */
  example: {
    japanese: string;
    english: string;
    /** Optional annotation showing what the particle marks */
    highlight?: string;
  };
  /** The color family this particle reads as (for UI) */
  family: 'subject' | 'topic' | 'object' | 'direction' | 'means' | 'possessive' | 'location' | 'connector';
}

export const PARTICLES: Record<string, ParticleInfo> = {
  は: {
    particle: 'は',
    role: 'Topic Marker',
    function: 'Marks what the sentence is about — "as for…" or "speaking of…"',
    rule: 'Noun before は = the topic. The rest of the sentence comments on that topic.',
    example: {
      japanese: '私は学生です',
      english: 'I am a student',
      highlight: '私は → "as for me…"',
    },
    family: 'topic',
  },

  が: {
    particle: 'が',
    role: 'Subject Marker',
    function: 'Marks who or what is performing the action, or the thing being described.',
    rule: 'Noun before が = the grammatical subject. Often introduces new information.',
    example: {
      japanese: '猫がいます',
      english: 'There is a cat',
      highlight: '猫が → "a cat" (specifically, this thing)',
    },
    family: 'subject',
  },

  を: {
    particle: 'を',
    role: 'Direct Object',
    function: 'Marks the thing being acted upon by the verb.',
    rule: 'Noun before を = what gets verbed. Points at the target of the action.',
    example: {
      japanese: '本を読みます',
      english: 'I read a book',
      highlight: '本を → "book" is what gets read',
    },
    family: 'object',
  },

  に: {
    particle: 'に',
    role: 'Target / Destination',
    function: 'Marks where something goes, when it happens, or who receives something.',
    rule: 'Points inward at a target: destination, time, recipient, or location of existence.',
    example: {
      japanese: '東京に行きます',
      english: 'I go to Tokyo',
      highlight: '東京に → "to Tokyo" (destination)',
    },
    family: 'direction',
  },

  へ: {
    particle: 'へ',
    role: 'Direction',
    function: 'Marks the direction toward which something moves (similar to に, but emphasizes the vector).',
    rule: 'Use for movement toward a place. Softer, more general than に.',
    example: {
      japanese: '駅へ歩きます',
      english: 'I walk toward the station',
      highlight: '駅へ → "toward the station"',
    },
    family: 'direction',
  },

  で: {
    particle: 'で',
    role: 'Means / Location of Action',
    function: 'Marks the tool, method, or place where an action happens.',
    rule: 'Answers "by what means?" or "where does the action take place?"',
    example: {
      japanese: '電車で行きます',
      english: 'I go by train',
      highlight: '電車で → "by train" (the means)',
    },
    family: 'means',
  },

  の: {
    particle: 'の',
    role: 'Possessive / Modifier',
    function: 'Links two nouns — ownership, belonging, or description.',
    rule: 'A の B = "B of A" or "A\'s B". The left noun modifies the right one.',
    example: {
      japanese: '私の本',
      english: 'my book',
      highlight: '私の本 → "book belonging to me"',
    },
    family: 'possessive',
  },

  と: {
    particle: 'と',
    role: 'And / With',
    function: 'Lists things together, or marks the person you do something with.',
    rule: 'Use between nouns for "A and B", or after a person for "with (that person)".',
    example: {
      japanese: '友達と行きます',
      english: 'I go with a friend',
      highlight: '友達と → "with a friend"',
    },
    family: 'connector',
  },

  も: {
    particle: 'も',
    role: 'Also / Too',
    function: 'Adds a noun to what was already mentioned — "X also", "X too".',
    rule: 'Replaces は or が to mean "this one, as well".',
    example: {
      japanese: '私も学生です',
      english: 'I am also a student',
      highlight: '私も → "me too"',
    },
    family: 'topic',
  },

  か: {
    particle: 'か',
    role: 'Question Marker',
    function: 'Turns a statement into a question.',
    rule: 'Attaches to the end of a sentence. Like a spoken question mark.',
    example: {
      japanese: '学生ですか',
      english: 'Are you a student?',
      highlight: 'ですか → makes it a question',
    },
    family: 'connector',
  },

  や: {
    particle: 'や',
    role: 'Non-exhaustive List',
    function: 'Lists examples — "things like A and B (among others)".',
    rule: 'Use between nouns when the list is not complete.',
    example: {
      japanese: 'りんごやバナナ',
      english: 'apples, bananas (and such)',
      highlight: 'りんごや → "apples and (other things)"',
    },
    family: 'connector',
  },

  から: {
    particle: 'から',
    role: 'From / Because',
    function: 'Marks a starting point in space, time, or reasoning.',
    rule: 'After a noun: "from X". After a clause: "because X".',
    example: {
      japanese: '九時から始まります',
      english: 'It starts from 9:00',
      highlight: '九時から → "from nine"',
    },
    family: 'direction',
  },

  まで: {
    particle: 'まで',
    role: 'Until / Up to',
    function: 'Marks an end point in space or time — the limit of something.',
    rule: 'Use with から ("from X until Y") or alone ("until X").',
    example: {
      japanese: '五時まで働きます',
      english: 'I work until 5:00',
      highlight: '五時まで → "until five"',
    },
    family: 'direction',
  },

  ね: {
    particle: 'ね',
    role: 'Agreement Tag',
    function: 'Seeks agreement or confirmation — "isn\'t it?", "right?"',
    rule: 'Sentence-final. Softens the statement and invites confirmation.',
    example: {
      japanese: 'いい天気ですね',
      english: 'Nice weather, isn\'t it?',
      highlight: 'ですね → looking for agreement',
    },
    family: 'connector',
  },

  よ: {
    particle: 'よ',
    role: 'Assertion',
    function: 'Adds emphasis — "I\'m telling you", "you know".',
    rule: 'Sentence-final. Used to assert new information or push a point.',
    example: {
      japanese: '行きますよ',
      english: 'I\'m going, you know!',
      highlight: 'ますよ → asserting',
    },
    family: 'connector',
  },
};

/**
 * Check if a word is a known Japanese particle.
 */
export function isParticle(word: string): boolean {
  return word in PARTICLES;
}

/**
 * Get rich info for a particle, or null if not found.
 */
export function getParticleInfo(word: string): ParticleInfo | null {
  return PARTICLES[word] || null;
}

/**
 * Check if a meaning string looks like a particle label
 * (e.g. "object marker", "topic marker"). This catches cases
 * where the particle itself isn't an exact key match.
 */
export function looksLikeParticleLabel(meaning: string): boolean {
  const m = meaning.toLowerCase();
  return (
    m.includes('marker') ||
    m === 'particle' ||
    m.endsWith(' particle')
  );
}

/*
 * emojis.js
 * -----------------------------------------------------------------------
 * Emoji symbols used by Exercise 1 (Memòria) and Exercise 2 (Seqüències).
 *
 * MEMORY_BOARD_SETS: 3 sets of 8 emojis each, used as the 8 pairs of a
 * 4x4 memory board. Set assignment is participant-specific (same logic as
 * words/associations) so a participant always plays with the same symbol
 * set, while the card LAYOUT is reshuffled every session.
 *
 * SEQUENCE_EMOJI_POOL: a shared pool used by Exercise 2. Difficulty there
 * comes from sequence length, not symbol content, so all participants
 * draw from the same pool.
 */

const MEMORY_BOARD_SETS = [
  ["🍎", "🚗", "🐶", "🌙", "⭐", "🎈", "🎸", "🐱"],
  ["🍌", "🚲", "🐰", "☀️", "❄️", "🎨", "🎺", "🐭"],
  ["🍇", "🚂", "🐻", "🌵", "☂️", "🎻", "🥁", "🐷"]
];

const SEQUENCE_EMOJI_POOL = [
  "🍎", "🚗", "🐶", "🌙", "⭐", "🍌", "🚲", "🐰", "☀️", "❄️",
  "🎈", "🎸", "🐱", "🌈", "⚽", "🎁", "🍕", "🚀", "🦋", "🌻"
];

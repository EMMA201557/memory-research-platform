/*
 * emojis.js
 * -----------------------------------------------------------------------
 * Emoji symbols used by Exercise 1 (Memòria) and Exercise 2 (Seqüències).
 *
 * MEMORY_BOARD_SETS[track][sessionIndex] is a fixed list of 8 symbols for
 * one participant track on one planned session day (18 planned sessions -
 * see PROGRAM_TOTAL_SESSIONS in app.js), same day-indexed idea as
 * WORD_SETS/ASSOCIATION_SETS (see data/words.js). Unlike those, this pool
 * ISN'T fully unique across all 18 sessions: there aren't 18*8 = 144
 * simple, mutually-unambiguous, universally-rendered emoji per track to
 * draw on without resorting to near-duplicate symbols (multiple similar
 * fruits, several near-identical hearts, skin-tone variants, ...) that
 * would make the matching game confusing rather than harder. Instead each
 * track has a pool of 48 symbols split into 6 groups of 8, and the 18
 * sessions cycle through those 6 groups (session % 6) - so a given set of
 * 8 symbols reappears every 6th session instead of literally every single
 * session like the old fixed-per-track design. The board LAYOUT (which
 * card is where) is still freshly shuffled every session regardless (see
 * exercises/memory.js) - the actual memory task is spatial, so content
 * repetition here matters less than for the recall-based exercises.
 *
 * SEQUENCE_EMOJI_POOL: a shared pool used by Exercise 2. Difficulty there
 * comes from sequence length, not symbol content, so all participants
 * draw from the same pool every round already - no repetition problem to
 * fix here.
 */

const MEMORY_BOARD_SETS = [
  // Track 0
  [
    ["🦢", "🎨", "🪀", "🎂", "🐮", "🌈", "🌲", "🥨"], // session 0
    ["🕹️", "🐊", "🍭", "🐼", "🐞", "🦑", "🍞", "🦄"], // session 1
    ["🦏", "🌭", "🦡", "🐻", "🌽", "🌴", "🐐", "🍌"], // session 2
    ["🎺", "🎀", "🏈", "🐹", "🦚", "🦔", "🎰", "🍪"], // session 3
    ["🦙", "🎈", "🎧", "🐱", "🎊", "🦊", "🍆", "🐙"], // session 4
    ["🦒", "🐫", "🐑", "🐖", "🐗", "🐠", "🌼", "🦈"], // session 5
    ["🦢", "🎨", "🪀", "🎂", "🐮", "🌈", "🌲", "🥨"], // session 6
    ["🕹️", "🐊", "🍭", "🐼", "🐞", "🦑", "🍞", "🦄"], // session 7
    ["🦏", "🌭", "🦡", "🐻", "🌽", "🌴", "🐐", "🍌"], // session 8
    ["🎺", "🎀", "🏈", "🐹", "🦚", "🦔", "🎰", "🍪"], // session 9
    ["🦙", "🎈", "🎧", "🐱", "🎊", "🦊", "🍆", "🐙"], // session 10
    ["🦒", "🐫", "🐑", "🐖", "🐗", "🐠", "🌼", "🦈"], // session 11
    ["🦢", "🎨", "🪀", "🎂", "🐮", "🌈", "🌲", "🥨"], // session 12
    ["🕹️", "🐊", "🍭", "🐼", "🐞", "🦑", "🍞", "🦄"], // session 13
    ["🦏", "🌭", "🦡", "🐻", "🌽", "🌴", "🐐", "🍌"], // session 14
    ["🎺", "🎀", "🏈", "🐹", "🦚", "🦔", "🎰", "🍪"], // session 15
    ["🦙", "🎈", "🎧", "🐱", "🎊", "🦊", "🍆", "🐙"], // session 16
    ["🦒", "🐫", "🐑", "🐖", "🐗", "🐠", "🌼", "🦈"], // session 17
  ],
  // Track 1
  [
    ["🎻", "🦌", "🥝", "🎼", "🐺", "🌻", "⚡", "🌵"], // session 0
    ["🐦", "🍋", "🍓", "🏀", "🐶", "🐵", "🐕", "🌊"], // session 1
    ["⭐", "🎮", "🐭", "🎉", "🎃", "🍉", "⚾", "🧩"], // session 2
    ["☁️", "🍔", "🐷", "🦉", "🎯", "🐯", "🍕", "🎬"], // session 3
    ["🥊", "🎱", "🐝", "🎭", "🥐", "🍇", "🥑", "🍒"], // session 4
    ["🌺", "🦃", "🔥", "🍀", "🐄", "🐌", "🍟", "🥁"], // session 5
    ["🎻", "🦌", "🥝", "🎼", "🐺", "🌻", "⚡", "🌵"], // session 6
    ["🐦", "🍋", "🍓", "🏀", "🐶", "🐵", "🐕", "🌊"], // session 7
    ["⭐", "🎮", "🐭", "🎉", "🎃", "🍉", "⚾", "🧩"], // session 8
    ["☁️", "🍔", "🐷", "🦉", "🎯", "🐯", "🍕", "🎬"], // session 9
    ["🥊", "🎱", "🐝", "🎭", "🥐", "🍇", "🥑", "🍒"], // session 10
    ["🌺", "🦃", "🔥", "🍀", "🐄", "🐌", "🍟", "🥁"], // session 11
    ["🎻", "🦌", "🥝", "🎼", "🐺", "🌻", "⚡", "🌵"], // session 12
    ["🐦", "🍋", "🍓", "🏀", "🐶", "🐵", "🐕", "🌊"], // session 13
    ["⭐", "🎮", "🐭", "🎉", "🎃", "🍉", "⚾", "🧩"], // session 14
    ["☁️", "🍔", "🐷", "🦉", "🎯", "🐯", "🍕", "🎬"], // session 15
    ["🥊", "🎱", "🐝", "🎭", "🥐", "🍇", "🥑", "🍒"], // session 16
    ["🌺", "🦃", "🔥", "🍀", "🐄", "🐌", "🍟", "🥁"], // session 17
  ],
  // Track 2
  [
    ["🍬", "🧀", "🌸", "🍍", "🏐", "🐎", "🍦", "🐟"], // session 0
    ["🐢", "🎷", "🐳", "🐧", "🍫", "🌹", "🍎", "🦓"], // session 1
    ["❄️", "🍑", "🍁", "🦁", "🐍", "🥕", "🌷", "🦜"], // session 2
    ["🐬", "🎁", "🎹", "🍅", "🐸", "🐘", "🏸", "☀️"], // session 3
    ["🎤", "🐨", "🐛", "⚽", "🎆", "🦋", "🏓", "🌙"], // session 4
    ["🎸", "💧", "🍄", "🌳", "🧨", "🐡", "🍩", "🐰"], // session 5
    ["🍬", "🧀", "🌸", "🍍", "🏐", "🐎", "🍦", "🐟"], // session 6
    ["🐢", "🎷", "🐳", "🐧", "🍫", "🌹", "🍎", "🦓"], // session 7
    ["❄️", "🍑", "🍁", "🦁", "🐍", "🥕", "🌷", "🦜"], // session 8
    ["🐬", "🎁", "🎹", "🍅", "🐸", "🐘", "🏸", "☀️"], // session 9
    ["🎤", "🐨", "🐛", "⚽", "🎆", "🦋", "🏓", "🌙"], // session 10
    ["🎸", "💧", "🍄", "🌳", "🧨", "🐡", "🍩", "🐰"], // session 11
    ["🍬", "🧀", "🌸", "🍍", "🏐", "🐎", "🍦", "🐟"], // session 12
    ["🐢", "🎷", "🐳", "🐧", "🍫", "🌹", "🍎", "🦓"], // session 13
    ["❄️", "🍑", "🍁", "🦁", "🐍", "🥕", "🌷", "🦜"], // session 14
    ["🐬", "🎁", "🎹", "🍅", "🐸", "🐘", "🏸", "☀️"], // session 15
    ["🎤", "🐨", "🐛", "⚽", "🎆", "🦋", "🏓", "🌙"], // session 16
    ["🎸", "💧", "🍄", "🌳", "🧨", "🐡", "🍩", "🐰"], // session 17
  ]
];

const SEQUENCE_EMOJI_POOL = [
  "🍎", "🚗", "🐶", "🌙", "⭐", "🍌", "🚲", "🐰", "☀️", "❄️",
  "🎈", "🎸", "🐱", "🌈", "⚽", "🎁", "🍕", "🚀", "🦋", "🌻"
];

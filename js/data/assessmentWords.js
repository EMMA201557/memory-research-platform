/*
 * assessmentWords.js
 * -----------------------------------------------------------------------
 * Word lists for the pre/post research assessment (NOT the daily
 * "Paraules" training exercise - see words.js for that).
 *
 * Rationale: the training program is meant to improve memory in general,
 * not just performance on a specific memorized list. So:
 * - The baseline (before any training) and final (after the whole
 *   program) assessments use TWO DIFFERENT but equated word lists,
 *   rather than the same list twice, to avoid the "improvement" being
 *   partly just item-specific recall of a list seen 6 weeks earlier.
 * - Both lists are disjoint from WORD_SETS (words.js) too, so daily
 *   training never rehearses the exact words used in the assessment.
 *
 * Both lists share the same design constraints:
 * - exactly 15 common, concrete Catalan words
 * - similar difficulty and similar average word length (~6 letters)
 * - no repeated words (within or across the two lists)
 * - no obvious semantic category (categories are deliberately spread
 *   thin - at most 2 words per category, never adjacent - so the list
 *   doesn't read as "the animals list" or "the food list")
 */

const ASSESSMENT_WORD_SET_BASELINE = [
  "nevera", "cabra", "bunyol", "cascada", "museu",
  "jersei", "patinet", "ràdio", "poema", "balena",
  "catifa", "torró", "gimnàs", "tisores", "dansa"
];

const ASSESSMENT_WORD_SET_FINAL = [
  "aixeta", "granota", "iogurt", "estany", "teatre",
  "pijama", "tramvia", "agulla", "cançó", "tortuga",
  "endoll", "mantega", "presó", "quadre", "boira"
];

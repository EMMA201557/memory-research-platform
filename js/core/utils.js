/*
 * utils.js
 * -----------------------------------------------------------------------
 * Small, generic helper functions shared by every exercise and by the
 * main app controller. Nothing in here knows about screens or DOM ids.
 */

/**
 * Fisher-Yates shuffle. Returns a NEW array; does not mutate the input.
 */
function shuffleArray(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks `count` random, unique items from an array (no repeats).
 */
function sampleUnique(array, count) {
  return shuffleArray(array).slice(0, count);
}

/**
 * Normalizes text for comparison purposes:
 * - lower-cased
 * - accents/diacritics removed (à -> a, é -> e, ï -> i, ...)
 * - "ç" treated as "c" and "l·l" punt volat removed
 * - surrounding whitespace trimmed
 * This lets us accept answers where the participant typed the right word
 * but forgot an accent, as requested in the exercise spec.
 */
function normalizeText(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accent marks
    .replace(/ç/gi, "c")
    .replace(/·/g, "")
    .replace(/['’]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Formats a duration in seconds as "m:ss" (or "h:mm:ss" if >= 1 hour).
 */
function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Returns today's date as a stable "YYYY-MM-DD" string in local time
 * (used for the "one session per day" restriction and daily stats).
 */
function todayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Deterministically maps a participant code to an index in [0, modulo)
 * so the same participant always gets the same difficulty-balanced set
 * (of words / associations / memory-board symbols) across all sessions.
 */
function codeToSetIndex(code, modulo) {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    sum += code.charCodeAt(i);
  }
  return sum % modulo;
}

/** Clamps a number between min and max. */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

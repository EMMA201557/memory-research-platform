/*
 * storage.js
 * -----------------------------------------------------------------------
 * All persistence for the app. Since this is a static page with no
 * server (it must run by just opening index.html), the durable "database"
 * is the browser's localStorage. Every completed session is ALSO sent to
 * Google Sheets (see sheets.js) as the researcher's copy of record, but
 * localStorage is what the app itself reads to enforce "one session per
 * day" and to render each participant's personal statistics.
 *
 * localStorage is per-browser/device, so on its own a participant logging
 * in from a second device would look brand new - no baseline, no session
 * history. mergeRemoteSummary() (below) closes that gap on login/register
 * by reading a lightweight summary back from the Sheet for that ONE
 * participant's code (see sheets.js#fetchRemoteParticipantByCode - scoped
 * so the Apps Script never hands back more than one participant's data at
 * a time) and filling in only what's missing locally; entries it adds are
 * flagged with `syncedFromOtherDevice: true` and are sparser than a
 * locally-recorded entry (see that function's doc comment for exactly
 * what's included).
 *
 * Data shape stored under STORAGE_KEY:
 * {
 *   "A014": {
 *     name: "Emma",
 *     code: "A014",
 *     demographics: null | {         // only collected at self-registration, see app.js
 *       age, gender, educationLevel, occupation
 *     },
 *     baselineAssessment: null | {   // 15-word test, done once before ever training
 *       date, correct, total, score, forgottenWords, timeSeconds
 *     },
 *     finalAssessment: null | { ... same shape ... }, // done once, unlocked after the program
 *     sessions: [
 *       {
 *         date: "2026-07-22",           // YYYY-MM-DD, local time
 *         totalTimeSeconds: 612,
 *         scores: { memory, sequences, words, associations, positions }, // 0-100 each
 *         details: {                    // raw per-exercise data behind each score,
 *                                        // straight from each exercise module's
 *                                        // onComplete({ details }) - see js/exercises/*.js
 *           memory: { timeSeconds, moves },
 *           sequences: { correctRounds, totalRounds },
 *           words: { correct, total, forgottenWords },
 *           associations: { successes, errors, total },
 *           positions: { correctRounds, totalRounds }
 *         },
 *         totalScore: 78,               // average of the 5 scores, 0-100
 *         percentCorrect: 78            // same scale, see app.js for rationale
 *       },
 *       ...
 *     ]
 *   },
 *   ...
 * }
 */

const STORAGE_KEY = "memoryTraining_participants";
const SELF_REGISTERED_KEY = "memoryTraining_selfRegistered";
const NUM_SETS = 3; // how many balanced word/association/board sets exist

/** Reads the whole participants store from localStorage (or {} if empty/corrupt). */
function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Could not read local storage, starting fresh.", err);
    return {};
  }
}

/** Persists the whole participants store back to localStorage. */
function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/*
 * Self-registered participants: people who typed a name/code combo that
 * wasn't in the researcher-provided PARTICIPANTS_CSV (see
 * data/participants.js) and chose to create an account on the spot. Kept
 * as a separate localStorage list - rather than merged into
 * PARTICIPANTS_CSV, which is a static file the browser can't write to -
 * and combined with the CSV list at runtime for login matching (see
 * app.js#init). Each entry is { name, code }, same shape as a parsed CSV
 * row.
 */

/** Returns the list of self-registered { name, code } participants. */
function loadSelfRegisteredParticipants() {
  try {
    const raw = localStorage.getItem(SELF_REGISTERED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read self-registered participants, starting fresh.", err);
    return [];
  }
}

/** Adds a new self-registered participant and persists the list. */
function registerNewParticipant(name, code) {
  const list = loadSelfRegisteredParticipants();
  list.push({ name, code });
  localStorage.setItem(SELF_REGISTERED_KEY, JSON.stringify(list));
}

/** Returns the stored record for a participant code, creating one if needed. */
function getOrCreateParticipantRecord(name, code) {
  const store = readStore();
  if (!store[code]) {
    store[code] = { name, code, demographics: null, baselineAssessment: null, finalAssessment: null, sessions: [] };
    writeStore(store);
  }
  return store[code];
}

/**
 * Saves the one-time demographic info collected at self-registration
 * (see app.js#initRegisterDemographicsScreen). `demographics` is
 * { age, gender, educationLevel, occupation }. Assumes the record already
 * exists (getOrCreateParticipantRecord is always called first).
 */
function saveDemographics(code, demographics) {
  const store = readStore();
  if (!store[code]) return;
  store[code].demographics = demographics;
  writeStore(store);
}

/**
 * Folds a remote participant summary (from the Apps Script's doGet, one
 * code at a time - see sheets.js#fetchRemoteParticipantByCode) into this
 * device's local record, so completing the baseline, the final
 * assessment, or a day's
 * training on one device is recognized on another instead of silently
 * resetting per device. `remote` is { baselineDone, finalDone,
 * baselineScore, finalScore, trainedDates, totalScores }.
 *
 * Only ever ADDS what's missing locally - never overwrites or removes
 * anything already here - so this is safe to call on every login/register
 * attempt regardless of how much local data already exists (e.g. more
 * recent local sessions that haven't synced to the Sheet yet are left
 * untouched).
 *
 * The synced-in placeholders are intentionally sparse: a remote "baseline
 * done" only carries its score, not the exact date, forgotten words, or
 * recall time (the Sheet summary doesn't include those, to keep doGet's
 * response small) - `syncedFromOtherDevice: true` marks them as such in
 * case that distinction ever matters. Placeholder sessions likewise only
 * carry the date and total score (needed for the one-per-day gate and the
 * progress dashboard's day/streak/average/best-score maths, none of which
 * read the per-exercise `scores`/`details` breakdown - see
 * computeParticipantStats), not full session detail.
 */
function mergeRemoteSummary(name, code, remote) {
  const store = readStore();
  if (!store[code]) {
    store[code] = { name, code, demographics: null, baselineAssessment: null, finalAssessment: null, sessions: [] };
  }
  const record = store[code];
  let changed = false;

  if (remote.baselineDone && !record.baselineAssessment) {
    record.baselineAssessment = {
      date: null,
      correct: null,
      total: null,
      score: remote.baselineScore != null ? remote.baselineScore : null,
      forgottenWords: [],
      timeSeconds: null,
      syncedFromOtherDevice: true
    };
    changed = true;
  }

  if (remote.finalDone && !record.finalAssessment) {
    record.finalAssessment = {
      date: null,
      correct: null,
      total: null,
      score: remote.finalScore != null ? remote.finalScore : null,
      forgottenWords: [],
      timeSeconds: null,
      syncedFromOtherDevice: true
    };
    changed = true;
  }

  const knownDates = new Set(record.sessions.map((s) => s.date));
  (remote.trainedDates || []).forEach((date, i) => {
    if (!date || knownDates.has(date)) return;
    knownDates.add(date);
    const totalScore = (remote.totalScores && remote.totalScores[i]) || 0;
    record.sessions.push({
      date,
      totalTimeSeconds: 0,
      scores: null,
      details: null,
      totalScore,
      percentCorrect: totalScore,
      syncedFromOtherDevice: true
    });
    changed = true;
  });

  if (changed) writeStore(store);
  return record;
}

/** True if this participant already has a completed session today. */
function hasTrainedToday(code) {
  const store = readStore();
  const record = store[code];
  if (!record) return false;
  return record.sessions.some((s) => s.date === todayDateString());
}

/**
 * Number of sessions this participant has already completed - i.e. the
 * 0-based index of the session they're about to start today. Used to pick
 * that day's exercise content (see data/words.js, data/associations.js,
 * data/emojis.js - each participant's balanced-set track holds one fixed
 * content list per planned session, so content advances day to day
 * instead of being randomly re-sampled from the same small pool every
 * time).
 */
function getParticipantSessionCount(code) {
  const store = readStore();
  const record = store[code];
  return record ? record.sessions.length : 0;
}

/**
 * Saves a completed session for a participant and returns the updated
 * record. `scores` is an object with memory/sequences/words/associations/
 * positions keys, each 0-100. `details` holds the raw per-exercise data
 * behind those scores (time, moves, forgotten words, ...) - same keys as
 * `scores`, values straight from each exercise module's onComplete
 * callback - kept alongside the score rather than instead of it, so the
 * score stays available for the daily-summary/progress-dashboard maths
 * without re-deriving it from raw data.
 */
function saveSession(name, code, totalTimeSeconds, scores, details) {
  const store = readStore();
  if (!store[code]) {
    store[code] = { name, code, demographics: null, baselineAssessment: null, finalAssessment: null, sessions: [] };
  }

  const scoreValues = Object.values(scores);
  const totalScore = Math.round(
    scoreValues.reduce((sum, v) => sum + v, 0) / scoreValues.length
  );

  const session = {
    date: todayDateString(),
    totalTimeSeconds: Math.round(totalTimeSeconds),
    scores,
    details,
    totalScore,
    // Percentage of correct answers, averaged across the 5 exercises
    // (each exercise score is already expressed as a 0-100 percentage).
    percentCorrect: totalScore
  };

  store[code].sessions.push(session);
  writeStore(store);
  return { record: store[code], session };
}

/**
 * Computes the participant-tracking dashboard numbers for one participant.
 * `programTotalSessions` is the target total (6 weeks x 3 sessions/week = 18).
 */
function computeParticipantStats(code, programTotalSessions) {
  const store = readStore();
  const record = store[code];
  if (!record || record.sessions.length === 0) {
    return {
      daysTrained: 0,
      totalSessions: 0,
      averageScore: 0,
      bestScore: 0,
      currentStreak: 0,
      programTotalSessions,
      percentProgramComplete: 0
    };
  }

  const sessions = record.sessions;
  const totalSessions = sessions.length;
  const uniqueDays = new Set(sessions.map((s) => s.date));
  const scores = sessions.map((s) => s.totalScore);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);

  const currentStreak = computeCurrentStreak(sessions);

  const percentProgramComplete = clamp(
    Math.round((totalSessions / programTotalSessions) * 100),
    0,
    100
  );

  return {
    daysTrained: uniqueDays.size,
    totalSessions,
    averageScore,
    bestScore,
    currentStreak,
    programTotalSessions,
    percentProgramComplete
  };
}

/**
 * "Current streak" = number of consecutive training DAYS up to and
 * including the most recent session day (a training program of 3
 * sessions/week is not meant to be daily, but the streak still counts
 * consecutive calendar days when a session happened back-to-back).
 */
function computeCurrentStreak(sessions) {
  const days = Array.from(new Set(sessions.map((s) => s.date))).sort();
  if (days.length === 0) return 0;

  let streak = 1;
  for (let i = days.length - 1; i > 0; i--) {
    const current = new Date(days[i]);
    const previous = new Date(days[i - 1]);
    const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Returns the participant-specific set index [0, NUM_SETS) used to pick
 * their word set, association set and memory-board symbol set. Fixed for
 * the lifetime of the participant's code so difficulty never drifts.
 */
function getAssignedSetIndex(code) {
  return codeToSetIndex(code, NUM_SETS);
}

/* --------------------------------------------------- baseline / final assessment */

function hasCompletedBaseline(code) {
  const store = readStore();
  return Boolean(store[code] && store[code].baselineAssessment);
}

function hasCompletedFinalAssessment(code) {
  const store = readStore();
  return Boolean(store[code] && store[code].finalAssessment);
}

/**
 * True once the participant has finished the whole program (enough
 * completed sessions), which is what unlocks the final assessment.
 */
function isProgramComplete(code, programTotalSessions) {
  const store = readStore();
  const record = store[code];
  if (!record) return false;
  return record.sessions.length >= programTotalSessions;
}

/** Builds the { date, correct, total, score, forgottenWords, timeSeconds } shape saved for both assessments. */
function buildAssessmentRecord(result) {
  return {
    date: todayDateString(),
    correct: result.details.correct,
    total: result.details.total,
    score: result.score,
    forgottenWords: result.details.forgottenWords,
    timeSeconds: result.details.timeSeconds
  };
}

function saveBaselineAssessment(name, code, result) {
  const store = readStore();
  if (!store[code]) {
    store[code] = { name, code, demographics: null, baselineAssessment: null, finalAssessment: null, sessions: [] };
  }
  const record = buildAssessmentRecord(result);
  store[code].baselineAssessment = record;
  writeStore(store);
  return record;
}

function saveFinalAssessment(name, code, result) {
  const store = readStore();
  if (!store[code]) {
    store[code] = { name, code, demographics: null, baselineAssessment: null, finalAssessment: null, sessions: [] };
  }
  const record = buildAssessmentRecord(result);
  store[code].finalAssessment = record;
  writeStore(store);
  return record;
}

/** Returns { baselineAssessment, finalAssessment } (each null if not done) for the progress dashboard. */
function getAssessmentResults(code) {
  const store = readStore();
  const record = store[code];
  return {
    baselineAssessment: record ? record.baselineAssessment : null,
    finalAssessment: record ? record.finalAssessment : null
  };
}

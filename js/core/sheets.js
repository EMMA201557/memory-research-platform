/*
 * sheets.js
 * -----------------------------------------------------------------------
 * Sends a completed session automatically to a Google Sheet via a Google
 * Apps Script "Web App". See README.md for the Apps Script source code
 * and step-by-step deployment instructions.
 *
 * IMPORTANT: fill in GOOGLE_SCRIPT_URL below once you have deployed the
 * Apps Script. Until then this stays empty and the app will simply show
 * the "could not save" message (harmless while developing).
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcSX0Lz2mLd5mkpZ-rlfAmFHHLnxHMYEdp041LY1iTUMKFkaWbWyWVLegUlErIwrCK/exec";

/**
 * Sends one finished session OR assessment result to the Google Sheet.
 * Returns a Promise that resolves to true on (assumed) success, false if
 * it could not be sent (no connection, or no URL configured yet).
 *
 * Note on reliability: Apps Script web apps don't return CORS headers for
 * cross-origin requests, so we send the request in "no-cors" mode. That
 * means we cannot read back whether the script itself succeeded - only
 * whether the network request could be sent at all. A thrown/rejected
 * fetch (offline, unreachable, DNS failure, ...) is treated as failure;
 * anything that leaves the browser is treated as success, matching the
 * "no internet connection" failure case described in the spec.
 */
async function sendToGoogleSheets(payload) {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn("GOOGLE_SCRIPT_URL is not configured; skipping remote save.");
    return false;
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.error("Failed to send session to Google Sheets.", err);
    return false;
  }
}

/**
 * Builds the exact payload shape the Apps Script (see README.md) expects
 * for a completed daily training session. Includes both each exercise's
 * 0-100 score AND the raw data behind it (time, moves, forgotten words,
 * ...) from session.details - see storage.js#saveSession - so the Sheet
 * has the underlying data for analysis, not just the derived score.
 */
function buildSheetPayload(name, code, session) {
  const d = session.details || {};
  return {
    name,
    code,
    type: "training",
    date: session.date,
    time: new Date().toTimeString().slice(0, 8), // HH:MM:SS, local
    totalTime: formatDuration(session.totalTimeSeconds),

    memoryScore: session.scores.memory,
    memoryTimeSeconds: d.memory ? d.memory.timeSeconds : "",
    memoryMoves: d.memory ? d.memory.moves : "",

    sequenceScore: session.scores.sequences,
    sequenceCorrectRounds: d.sequences ? d.sequences.correctRounds : "",
    sequenceTotalRounds: d.sequences ? d.sequences.totalRounds : "",

    wordHits: session.scores.words,
    wordsCorrect: d.words ? d.words.correct : "",
    wordsTotal: d.words ? d.words.total : "",
    wordsForgotten: d.words ? d.words.forgottenWords.join(", ") : "",

    associationHits: session.scores.associations,
    associationSuccesses: d.associations ? d.associations.successes : "",
    associationErrors: d.associations ? d.associations.errors : "",
    associationTotal: d.associations ? d.associations.total : "",

    positionScore: session.scores.positions,
    positionCorrectRounds: d.positions ? d.positions.correctRounds : "",
    positionTotalRounds: d.positions ? d.positions.totalRounds : "",

    totalScore: session.totalScore,
    percentCorrect: session.percentCorrect
  };
}

/**
 * Builds the payload for a baseline/final assessment result. `kind` is
 * "baseline" or "final". Includes the raw recall time and the exact list
 * of forgotten words alongside the correct/total/score summary.
 */
function buildAssessmentSheetPayload(name, code, kind, assessmentRecord) {
  return {
    name,
    code,
    type: kind,
    date: assessmentRecord.date,
    time: new Date().toTimeString().slice(0, 8),
    assessmentCorrect: assessmentRecord.correct,
    assessmentTotal: assessmentRecord.total,
    assessmentScore: assessmentRecord.score,
    assessmentTimeSeconds: assessmentRecord.timeSeconds,
    assessmentForgottenWords: assessmentRecord.forgottenWords.join(", ")
  };
}

/**
 * Builds the payload logged when someone self-registers (see
 * initRegisterDemographicsScreen's account-creation step in app.js).
 * Self-registered accounts only otherwise exist in that browser's
 * localStorage, so this is what gives the researcher a central, durable
 * record of who signed themselves up, when, and their demographics.
 * `demographics` is { age, gender, educationLevel, occupation }, collected
 * once at account creation (see storage.js#saveDemographics).
 */
function buildRegistrationSheetPayload(name, code, demographics) {
  return {
    name,
    code,
    type: "registration",
    date: todayDateString(),
    time: new Date().toTimeString().slice(0, 8),
    age: demographics.age,
    gender: demographics.gender,
    educationLevel: demographics.educationLevel,
    occupation: demographics.occupation
  };
}

/**
 * Fetches the list of self-registered { name, code } participants back
 * from the Apps Script's doGet endpoint (see README.md), so a participant
 * who registered on one device is also recognized on another.
 *
 * Why JSONP instead of fetch(): Apps Script responses don't include
 * Access-Control-Allow-Origin, so a cross-origin fetch() can't read the
 * body even though the request itself succeeds - the browser blocks JS
 * from seeing the response. A <script> tag isn't subject to CORS at all
 * (that's true of script loading in general, not an Apps Script quirk),
 * so the endpoint instead returns the data as a JS snippet that invokes a
 * callback we define - the classic pre-CORS JSONP pattern, still the
 * standard way to read data back from an Apps Script web app on a static
 * page with no server of its own.
 *
 * Always resolves (never rejects), with [] on any failure - offline, no
 * URL configured, timeout, or an older deployed Apps Script that doesn't
 * have doGet yet - so callers can treat "nothing to add" and "couldn't
 * check" the same way rather than needing their own try/catch.
 */
function fetchRemoteRegisteredParticipants(timeoutMs = 6000) {
  return new Promise((resolve) => {
    if (!GOOGLE_SCRIPT_URL) {
      resolve([]);
      return;
    }

    const callbackName = `__memoryTrainingParticipantsCallback_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    let settled = false;

    const script = document.createElement("script");

    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      resolve(result);
    }

    window[callbackName] = (data) => {
      finish(Array.isArray(data) ? data : []);
    };

    script.src = `${GOOGLE_SCRIPT_URL}?callback=${callbackName}`;
    script.onerror = () => finish([]);
    const timer = setTimeout(() => finish([]), timeoutMs);

    document.head.appendChild(script);
  });
}

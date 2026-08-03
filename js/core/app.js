/*
 * app.js
 * -----------------------------------------------------------------------
 * Main application controller. Wires together the data files, the
 * storage/sheets helpers and the 5 exercise modules, and drives screen
 * navigation. Loaded last in index.html so every dependency already
 * exists on the page.
 */

// How long the research program runs, used for the "X of Y sessions" stat.
const PROGRAM_WEEKS = 6;
const SESSIONS_PER_WEEK = 3;
const PROGRAM_TOTAL_SESSIONS = PROGRAM_WEEKS * SESSIONS_PER_WEEK; // 18

// Metadata for the 5 exercises, in menu display order.
const EXERCISES = [
  { key: "memory", title: "Memòria", icon: "🧩", module: ExerciseMemory },
  { key: "sequences", title: "Seqüències", icon: "🔢", module: ExerciseSequences },
  { key: "words", title: "Paraules", icon: "📝", module: ExerciseWords },
  { key: "associations", title: "Associacions", icon: "🔗", module: ExerciseAssociations },
  { key: "positions", title: "Posicions", icon: "📍", module: ExercisePositions }
];

// Copy + word list for the two one-off pre/post research assessments.
const ASSESSMENT_COPY = {
  baseline: {
    title: "Avaluació inicial",
    intro:
      "Abans de començar l'entrenament, fes aquesta petita prova de memòria. " +
      "Serveix per mesurar el teu punt de partida i només es fa una vegada.",
    startButton: "Començar l'avaluació inicial"
  },
  final: {
    title: "Avaluació final",
    intro:
      "Has completat tot el programa d'entrenament! Fes aquesta última prova de " +
      "memòria per veure com ha evolucionat el teu rendiment. Només es fa una vegada.",
    startButton: "Començar l'avaluació final"
  }
};

// ------------------------------------------------------------------ state
let participants = [];      // [{ name, code }] parsed from participants.js
let currentParticipant = null; // { name, code, setIndex }
let sessionResults = {};    // { [exerciseKey]: { score, details } }
let sessionStartTime = null;
let currentSessionIndex = 0; // which day of the program today is, 0-based (see startNewSession)
let currentExerciseStop = null;   // cleanup fn for the exercise in progress
let currentAssessmentKind = null; // "baseline" | "final"
let currentAssessmentStop = null; // cleanup fn for the assessment in progress
// { name, code } of a just-created account while its code is on screen, so
// "Ja l'he guardat, continuar" (screen-register-code) doesn't need to
// re-derive it.
let pendingLogin = null;
// The chosen (and already uniqueness-checked) name while the demographics
// step is on screen, carried over from screen-register.
let pendingRegistrationName = null;

// ------------------------------------------------------------- CSV parsing

/**
 * Parses the CSV-formatted PARTICIPANTS_CSV string (see data/participants.js)
 * into an array of { name, code } objects. Blank lines, comment lines
 * (starting with #) and the header row are ignored.
 */
function parseParticipants(csvText) {
  return csvText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .filter((line) => line.toLowerCase() !== "name,code")
    .map((line) => {
      const [name, code] = line.split(",").map((part) => part.trim());
      return { name, code };
    })
    .filter((p) => p.name && p.code);
}

// ------------------------------------------------------------ navigation

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/** Leaves the current exercise (if any) without marking it complete. */
function goToMenu() {
  if (currentExerciseStop) {
    currentExerciseStop();
    currentExerciseStop = null;
  }
  renderMenu();
  showScreen("screen-menu");
}

// --------------------------------------------------------------- login

function initLoginScreen() {
  const form = document.getElementById("login-form");
  const submitBtn = form.querySelector("button[type=submit]");
  const errorEl = document.getElementById("login-error");
  const showRegisterLink = document.getElementById("btn-show-register");

  let isChecking = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isChecking) return;
    isChecking = true;
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Comprovant...";

    try {
      const name = document.getElementById("login-name").value.trim();
      const code = document.getElementById("login-code").value.trim();
      errorEl.hidden = true;

      if (!name || !code) {
        errorEl.textContent = "Escriu el teu nom i codi de participant.";
        errorEl.hidden = false;
        return;
      }

      // What this device already knows - CSV + this device's own past
      // registrations/logins - checked first so login never depends on
      // the network for an account already established here.
      const localMatch = participants.find((p) => p.name === name && p.code === code);

      // Either way, ask about just this ONE code (see
      // sheets.js#fetchRemoteParticipantByCode) - a scoped lookup that
      // never exposes any other participant's data - so an account
      // created or trained on another device is recognized here too, and
      // a known-locally account picks up anything that happened
      // elsewhere since last time (a newly-passed baseline, today's
      // session, ...). Resolves quickly, or on its own timeout even
      // offline - never hangs, and a lookup failure just means no new
      // info this time, not a login failure.
      const remote = await fetchRemoteParticipantByCode(code);
      if (remote) mergeRemoteSummary(remote.name, remote.code, remote);

      if (localMatch) {
        form.reset();
        logIn(localMatch.name, localMatch.code);
        return;
      }

      if (remote && remote.name === name) {
        if (!participants.some((p) => p.code === code)) {
          participants.push({ name: remote.name, code: remote.code });
        }
        form.reset();
        logIn(remote.name, remote.code);
        return;
      }

      errorEl.textContent = "Nom o codi incorrectes.";
      errorEl.hidden = false;
    } finally {
      isChecking = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  showRegisterLink.addEventListener("click", () => {
    // Courtesy prefill: carry over whatever they'd already typed as their
    // name, since a failed login here is often someone who doesn't have an
    // account yet trying their name with a made-up or forgotten code.
    showRegisterScreen(document.getElementById("login-name").value.trim());
  });
}

// ---------------------------------------------------- create account (register)

/**
 * Generates a candidate participant code not already used by anyone this
 * device knows about locally (`participants` - the CSV list plus this
 * device's own past registrations/logins) - letter "P" (for
 * "self-registered participant", so it reads as visibly different from
 * researcher-assigned codes like "A014") plus 3 zero-padded digits, e.g.
 * "P042".
 *
 * This is only a local pre-check, not a global uniqueness guarantee: this
 * device has no way to know every code ever used on every other device
 * without fetching everyone's data, which is exactly what doGet is
 * deliberately scoped to never do (see sheets.js#fetchRemoteParticipantByCode).
 * The caller (initRegisterDemographicsScreen) confirms the candidate is
 * free remotely too, one code at a time, before committing to it.
 */
function generateUniqueParticipantCode() {
  const existingCodes = new Set(participants.map((p) => p.code));
  let code;
  do {
    const num = Math.floor(Math.random() * 1000); // 0-999
    code = `P${String(num).padStart(3, "0")}`;
  } while (existingCodes.has(code));
  return code;
}

function showRegisterScreen(prefillName) {
  const nameInput = document.getElementById("register-name");
  nameInput.value = prefillName || "";
  document.getElementById("register-error").hidden = true;
  showScreen("screen-register");
  nameInput.focus();
}

function initRegisterScreen() {
  const form = document.getElementById("register-form");
  const submitBtn = form.querySelector("button[type=submit]");
  const errorEl = document.getElementById("register-error");
  const backLink = document.getElementById("btn-register-back");

  let isChecking = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isChecking) return;
    isChecking = true;
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Comprovant...";

    try {
      const name = document.getElementById("register-name").value.trim();
      errorEl.hidden = true;

      if (!name) {
        errorEl.textContent = "Escriu un nom.";
        errorEl.hidden = false;
        return;
      }

      const nameTakenLocally = participants.some(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      // Scoped check (see sheets.js#checkRemoteNameTaken): only ever
      // answers "is this name taken?" - never who by, or anyone else's
      // data. Skipped once a local match already settles the question.
      const nameTakenRemotely = nameTakenLocally ? false : await checkRemoteNameTaken(name);
      if (nameTakenLocally || nameTakenRemotely) {
        errorEl.textContent = "Aquest nom ja està en ús. Tria'n un altre.";
        errorEl.hidden = false;
        return;
      }

      pendingRegistrationName = name;
      document.getElementById("register-demographics-form").reset();
      document.getElementById("register-demographics-error").hidden = true;
      showScreen("screen-register-demographics");
    } finally {
      isChecking = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  backLink.addEventListener("click", () => {
    document.getElementById("register-error").hidden = true;
    showScreen("screen-login");
  });
}

function initRegisterDemographicsScreen() {
  const form = document.getElementById("register-demographics-form");
  const submitBtn = form.querySelector("button[type=submit]");
  const errorEl = document.getElementById("register-demographics-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!pendingRegistrationName) {
      // Shouldn't happen (this screen is only reachable via the name step),
      // but bail somewhere sane rather than register a nameless account.
      showScreen("screen-register");
      return;
    }

    const age = document.getElementById("register-age").value.trim();
    const gender = document.getElementById("register-gender").value;
    const educationLevel = document.getElementById("register-education").value;
    const occupation = document.getElementById("register-occupation").value;

    if (!age || !gender || !educationLevel || !occupation) {
      errorEl.textContent = "Completa totes les preguntes.";
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Creant compte...";

    try {
      const name = pendingRegistrationName;
      let code = generateUniqueParticipantCode();
      // generateUniqueParticipantCode() only checks against codes this
      // device already knows about locally. Confirm the candidate isn't
      // already used by someone on another device via a scoped, one-code
      // lookup (see sheets.js#fetchRemoteParticipantByCode) before
      // committing to it - regenerating and re-checking on the rare
      // collision rather than fetching the full code list to check
      // against up front.
      for (let attempt = 0; attempt < 5; attempt++) {
        const remote = await fetchRemoteParticipantByCode(code);
        if (!remote) break;
        code = generateUniqueParticipantCode();
      }

      const demographics = { age: Number(age), gender, educationLevel, occupation };

      getOrCreateParticipantRecord(name, code);
      saveDemographics(code, demographics);
      registerNewParticipant(name, code);
      participants.push({ name, code });
      // Fire-and-forget: this is a bookkeeping event for the researcher, not
      // data the participant is waiting on, so it shouldn't hold up onboarding.
      sendToGoogleSheets(buildRegistrationSheetPayload(name, code, demographics));

      pendingRegistrationName = null;
      form.reset();
      document.getElementById("register-code-display").textContent = code;
      showScreen("screen-register-code");
      pendingLogin = { name, code };
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}

function initRegisterCodeScreen() {
  document.getElementById("btn-register-code-continue").addEventListener("click", () => {
    if (!pendingLogin) return;
    const { name, code } = pendingLogin;
    pendingLogin = null;
    logIn(name, code);
  });
}

function logIn(name, code) {
  currentParticipant = { name, code, setIndex: getAssignedSetIndex(code) };
  getOrCreateParticipantRecord(name, code);

  if (!hasCompletedBaseline(code)) {
    // Mandatory one-time gate: no welcome/training screen until this is done.
    showAssessmentIntro("baseline");
    return;
  }

  renderWelcomeScreen();
  showScreen("screen-welcome");
}

function logOut() {
  currentParticipant = null;
  sessionResults = {};
  currentAssessmentKind = null;
  pendingLogin = null;
  pendingRegistrationName = null;
  document.getElementById("login-name").value = "";
  document.getElementById("login-code").value = "";
  document.getElementById("login-error").hidden = true;
  showScreen("screen-login");
}

// -------------------------------------------------------------- welcome

function renderWelcomeScreen() {
  const heading = document.getElementById("welcome-heading");
  heading.textContent = `Benvingut/da, ${currentParticipant.name}!`;

  const alreadyDone = hasTrainedToday(currentParticipant.code);
  document.getElementById("welcome-already-done").hidden = !alreadyDone;
  document.getElementById("btn-start-training").hidden = alreadyDone;

  const programDone = isProgramComplete(currentParticipant.code, PROGRAM_TOTAL_SESSIONS);
  const finalDone = hasCompletedFinalAssessment(currentParticipant.code);
  document.getElementById("btn-final-assessment").hidden = !(programDone && !finalDone);
  document.getElementById("welcome-final-done-notice").hidden = !(programDone && finalDone);
}

function initWelcomeScreen() {
  document.getElementById("btn-start-training").addEventListener("click", () => {
    startNewSession();
  });
  document.getElementById("btn-final-assessment").addEventListener("click", () => {
    showAssessmentIntro("final");
  });
  document.getElementById("btn-view-progress").addEventListener("click", () => {
    renderProgressScreen();
    showScreen("screen-progress");
  });
  document.getElementById("btn-logout").addEventListener("click", logOut);
}

// ------------------------------------------------ baseline / final assessment

function showAssessmentIntro(kind) {
  currentAssessmentKind = kind;
  const copy = ASSESSMENT_COPY[kind];
  document.getElementById("assessment-intro-title").textContent = copy.title;
  document.getElementById("assessment-intro-text").textContent = copy.intro;
  document.getElementById("btn-assessment-start").textContent = copy.startButton;
  showScreen("screen-assessment-intro");
}

function startAssessment() {
  const copy = ASSESSMENT_COPY[currentAssessmentKind];
  const words = currentAssessmentKind === "baseline" ? ASSESSMENT_WORD_SET_BASELINE : ASSESSMENT_WORD_SET_FINAL;

  document.getElementById("assessment-title").textContent = copy.title;
  const content = document.getElementById("assessment-content");
  content.innerHTML = "";
  showScreen("screen-assessment");

  currentAssessmentStop = AssessmentTest.start(content, words, (result) => {
    currentAssessmentStop = null;
    finishAssessment(result);
  });
}

/**
 * Persists the assessment result, sends it to Google Sheets, shows a brief
 * sync-status confirmation under the exercise's own results card (mirrors
 * the daily summary screen's sync feedback), then returns to Welcome.
 */
async function finishAssessment(result) {
  const kind = currentAssessmentKind;
  const record =
    kind === "baseline"
      ? saveBaselineAssessment(currentParticipant.name, currentParticipant.code, result)
      : saveFinalAssessment(currentParticipant.name, currentParticipant.code, result);

  const content = document.getElementById("assessment-content");
  const statusEl = document.createElement("p");
  statusEl.className = "sync-status";
  statusEl.textContent = "Desant les dades...";
  content.appendChild(statusEl);

  const payload = buildAssessmentSheetPayload(currentParticipant.name, currentParticipant.code, kind, record);
  const ok = await sendToGoogleSheets(payload);
  statusEl.textContent = ok
    ? "Dades desades correctament."
    : "No s'ha pogut desar les dades. Comprova la connexió a internet.";
  statusEl.className = "sync-status " + (ok ? "success" : "error");

  setTimeout(() => {
    renderWelcomeScreen();
    showScreen("screen-welcome");
  }, 1500);
}

/** Leaves the assessment in progress (if any) without saving a result. */
function goBackFromAssessment() {
  if (currentAssessmentStop) {
    currentAssessmentStop();
    currentAssessmentStop = null;
  }
  if (currentAssessmentKind === "baseline") {
    // Baseline is mandatory before anything else - just return to its intro.
    showScreen("screen-assessment-intro");
  } else {
    showScreen("screen-welcome");
  }
}

function initAssessmentScreens() {
  document.getElementById("btn-assessment-start").addEventListener("click", startAssessment);
  document.getElementById("btn-assessment-back").addEventListener("click", goBackFromAssessment);
}

// ---------------------------------------------------------------- menu

function startNewSession() {
  if (hasTrainedToday(currentParticipant.code)) {
    // Defensive: the UI already hides the button in this case, but a
    // participant could have trained today in another tab.
    renderWelcomeScreen();
    showScreen("screen-welcome");
    return;
  }
  sessionResults = {};
  sessionStartTime = performance.now();
  // 0-based index of today's session within the planned program, e.g. 0 on
  // day 1, 1 on day 2, ... - fixed for the whole session so every exercise
  // opened today (in any order) uses the same day's content. Wraps past
  // PROGRAM_TOTAL_SESSIONS if someone keeps training beyond the planned
  // program, cycling content rather than going out of bounds.
  currentSessionIndex = getParticipantSessionCount(currentParticipant.code) % PROGRAM_TOTAL_SESSIONS;
  renderMenu();
  showScreen("screen-menu");
}

function renderMenu() {
  const grid = document.getElementById("menu-exercise-grid");
  grid.innerHTML = "";

  EXERCISES.forEach((exercise) => {
    const done = Boolean(sessionResults[exercise.key]);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "exercise-card" + (done ? " done" : "");
    card.disabled = done;
    card.innerHTML = `
      <span class="exercise-card-icon">${exercise.icon}</span>
      <span class="exercise-card-title">${exercise.title}</span>
      ${done ? '<span class="exercise-card-check">✔️</span>' : ""}
    `;
    card.addEventListener("click", () => openExercise(exercise));
    grid.appendChild(card);
  });

  const completedCount = Object.keys(sessionResults).length;
  const total = EXERCISES.length;
  document.getElementById("menu-progress-bar").style.width = `${(completedCount / total) * 100}%`;
  document.getElementById("menu-progress-label").textContent = `${completedCount} de ${total} exercicis completats`;
  document.getElementById("menu-all-done").hidden = completedCount < total;
}

function openExercise(exercise) {
  // Defensive: normal UI navigation can't reach openExercise a second time
  // without going through goToMenu or a completion first (there's no way
  // to click a different exercise card while already inside one), but
  // stop any still-running exercise's timers first regardless - leaving
  // a previous exercise's setTimeout armed would let it fire later and
  // overwrite whatever's rendered into the shared #exercise-content div.
  if (currentExerciseStop) {
    currentExerciseStop();
    currentExerciseStop = null;
  }

  document.getElementById("exercise-title").textContent = exercise.title;
  const content = document.getElementById("exercise-content");
  content.innerHTML = "";

  showScreen("screen-exercise");

  currentExerciseStop = exercise.module.start(content, currentParticipant.setIndex, currentSessionIndex, (result) => {
    currentExerciseStop = null;
    sessionResults[exercise.key] = result;
    renderMenu();
    if (Object.keys(sessionResults).length === EXERCISES.length) {
      finishSession();
    } else {
      showScreen("screen-menu");
    }
  });
}

// ------------------------------------------------------------- summary

function finishSession() {
  const totalTimeSeconds = (performance.now() - sessionStartTime) / 1000;

  const scores = {
    memory: sessionResults.memory.score,
    sequences: sessionResults.sequences.score,
    words: sessionResults.words.score,
    associations: sessionResults.associations.score,
    positions: sessionResults.positions.score
  };
  const details = {
    memory: sessionResults.memory.details,
    sequences: sessionResults.sequences.details,
    words: sessionResults.words.details,
    associations: sessionResults.associations.details,
    positions: sessionResults.positions.details
  };

  const { session } = saveSession(
    currentParticipant.name,
    currentParticipant.code,
    totalTimeSeconds,
    scores,
    details
  );

  renderSummary(session);
  showScreen("screen-summary");

  const payload = buildSheetPayload(currentParticipant.name, currentParticipant.code, session);
  const statusEl = document.getElementById("summary-sync-status");
  sendToGoogleSheets(payload).then((ok) => {
    statusEl.textContent = ok
      ? "Dades desades correctament."
      : "No s'ha pogut desar les dades. Comprova la connexió a internet.";
    statusEl.className = "sync-status " + (ok ? "success" : "error");
  });
}

function renderSummary(session) {
  const statsEl = document.getElementById("summary-stats");
  statsEl.innerHTML = `
    <div class="stat"><span class="stat-value">${formatDuration(session.totalTimeSeconds)}</span><span class="stat-label">Temps total</span></div>
    <div class="stat"><span class="stat-value">${EXERCISES.length}/${EXERCISES.length}</span><span class="stat-label">Exercicis completats</span></div>
    <div class="stat"><span class="stat-value">${session.totalScore}</span><span class="stat-label">Puntuació total</span></div>
    <div class="stat"><span class="stat-value">${session.percentCorrect}%</span><span class="stat-label">Percentatge d'encerts</span></div>
  `;

  const listEl = document.getElementById("summary-per-exercise");
  listEl.innerHTML = EXERCISES.map(
    (ex) => `
      <div class="summary-exercise-row">
        <span>${ex.icon} ${ex.title}</span>
        <span class="summary-exercise-score">${session.scores[ex.key]}</span>
      </div>`
  ).join("");

  document.getElementById("summary-sync-status").textContent = "Desant les dades...";
  document.getElementById("summary-sync-status").className = "sync-status";
}

function initSummaryScreen() {
  document.getElementById("btn-summary-continue").addEventListener("click", () => {
    renderWelcomeScreen();
    showScreen("screen-welcome");
  });
}

// ------------------------------------------------------------ progress

function renderProgressScreen() {
  const stats = computeParticipantStats(currentParticipant.code, PROGRAM_TOTAL_SESSIONS);
  const statsEl = document.getElementById("progress-stats");
  statsEl.innerHTML = `
    <div class="stat"><span class="stat-value">${stats.daysTrained}</span><span class="stat-label">Dies entrenats</span></div>
    <div class="stat"><span class="stat-value">${stats.totalSessions}</span><span class="stat-label">Sessions totals</span></div>
    <div class="stat"><span class="stat-value">${stats.averageScore}</span><span class="stat-label">Puntuació mitjana</span></div>
    <div class="stat"><span class="stat-value">${stats.bestScore}</span><span class="stat-label">Millor puntuació</span></div>
    <div class="stat"><span class="stat-value">${stats.currentStreak}</span><span class="stat-label">Ratxa actual</span></div>
    <div class="stat"><span class="stat-value">${stats.totalSessions} de ${stats.programTotalSessions}</span><span class="stat-label">Programa completat (${stats.percentProgramComplete}%)</span></div>
  `;

  const { baselineAssessment, finalAssessment } = getAssessmentResults(currentParticipant.code);
  const assessmentSection = document.getElementById("progress-assessment-section");
  const assessmentEl = document.getElementById("progress-assessment");

  if (baselineAssessment) {
    assessmentSection.hidden = false;
    assessmentEl.innerHTML = `
      <div class="stat"><span class="stat-value">${baselineAssessment.score}</span><span class="stat-label">Avaluació inicial</span></div>
      ${
        finalAssessment
          ? `<div class="stat"><span class="stat-value">${finalAssessment.score}</span><span class="stat-label">Avaluació final</span></div>`
          : ""
      }
    `;
  } else {
    assessmentSection.hidden = true;
  }
}

function initProgressScreen() {
  document.getElementById("btn-progress-back").addEventListener("click", () => {
    showScreen("screen-welcome");
  });
}

// ------------------------------------------------------------- exercise

function initExerciseScreen() {
  document.getElementById("btn-back-to-menu").addEventListener("click", goToMenu);
}

// ----------------------------------------------------------- dark mode

function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const stored = localStorage.getItem("memoryTraining_theme");

  if (stored) {
    document.documentElement.setAttribute("data-theme", stored);
    toggle.textContent = stored === "dark" ? "☀️" : "🌙";
  }

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("memoryTraining_theme", next);
    toggle.textContent = next === "dark" ? "☀️" : "🌙";
  });
}

// ------------------------------------------------------------------ init

function init() {
  // Researcher-authorized list + anyone who self-registered on this device.
  // Anyone known only remotely (registered/trained on a different device)
  // is looked up on demand, one code/name at a time, during login/register
  // (see sheets.js#fetchRemoteParticipantByCode / checkRemoteNameTaken) -
  // not fetched in bulk here, so the app never holds (or asks the Apps
  // Script for) more than one other participant's data at a time.
  participants = parseParticipants(PARTICIPANTS_CSV).concat(loadSelfRegisteredParticipants());
  initThemeToggle();
  initLoginScreen();
  initRegisterScreen();
  initRegisterDemographicsScreen();
  initRegisterCodeScreen();
  initWelcomeScreen();
  initAssessmentScreens();
  initExerciseScreen();
  initSummaryScreen();
  initProgressScreen();
}

document.addEventListener("DOMContentLoaded", init);

/*
 * exercises/assessment.js
 * -----------------------------------------------------------------------
 * The pre/post research assessment: a 15-word memory test used exactly
 * once as a BASELINE (before the participant's very first training
 * session) and once as a FINAL assessment (unlocked once the whole
 * program - see PROGRAM_TOTAL_SESSIONS in app.js - is complete).
 *
 * This is deliberately a separate module from exercises/words.js: it
 * always shows the full fixed word list handed to it (no random 12-of-N
 * sampling), and it is not one of the 5 daily exercises, so it doesn't
 * participate in the daily menu/progress-bar/one-per-day logic at all.
 *
 *   const stop = AssessmentTest.start(containerEl, words, onComplete);
 *
 * - words: the fixed array of exactly 15 words to test (see
 *   data/assessmentWords.js).
 * - onComplete({ score, details }): called once the participant presses
 *   "Continuar" on the results screen. `score` is 0-100.
 * - stop(): cancels pending timers if the participant navigates away
 *   before finishing.
 */

const AssessmentTest = {
  start(container, words, onComplete) {
    const STUDY_SECONDS = 35;
    const timeoutIds = [];
    const startTime = performance.now();

    renderStudyPhase();

    function renderStudyPhase() {
      container.innerHTML = `
        <p class="exercise-instructions">Memoritza aquestes ${words.length} paraules.</p>
        <div class="word-grid">
          ${words.map((w) => `<span class="word-chip">${w}</span>`).join("")}
        </div>
        <p class="countdown" id="assessment-countdown">Amaga en ${STUDY_SECONDS}s</p>
      `;

      let remaining = STUDY_SECONDS;
      const countdownEl = container.querySelector("#assessment-countdown");
      const tickId = setInterval(() => {
        remaining--;
        if (countdownEl) countdownEl.textContent = `Amaga en ${remaining}s`;
        if (remaining <= 0) clearInterval(tickId);
      }, 1000);
      timeoutIds.push(tickId);

      const hideId = setTimeout(() => {
        clearInterval(tickId);
        renderRecallPhase();
      }, STUDY_SECONDS * 1000);
      timeoutIds.push(hideId);
    }

    function renderRecallPhase() {
      container.innerHTML = `
        <p class="exercise-instructions">
          Escriu totes les paraules que recordis, una per línia.
        </p>
        <textarea id="assessment-input" class="text-answer" rows="8" placeholder="paraula 1
paraula 2
..."></textarea>
        <div class="button-row">
          <button type="button" class="btn btn-primary" id="assessment-submit">Comprovar</button>
        </div>
      `;

      container.querySelector("#assessment-submit").addEventListener("click", () => {
        const raw = container.querySelector("#assessment-input").value;
        evaluate(raw);
      });
    }

    function evaluate(rawInput) {
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      const normalizedTargets = words.map(normalizeText);
      const enteredRaw = rawInput
        .split(/[\n,]/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0);
      const enteredNormalized = new Set(enteredRaw.map(normalizeText));

      const correctWords = words.filter((w) => enteredNormalized.has(normalizeText(w)));
      const forgottenWords = words.filter((w) => !enteredNormalized.has(normalizeText(w)));
      const score = Math.round((correctWords.length / words.length) * 100);

      container.innerHTML = `
        <div class="results-card">
          <h2>Resultats</h2>
          <div class="results-stats">
            <div class="stat"><span class="stat-value">${correctWords.length}/${words.length}</span><span class="stat-label">Encerts</span></div>
            <div class="stat"><span class="stat-value">${score}</span><span class="stat-label">Puntuació</span></div>
          </div>
          <button type="button" class="btn btn-primary" id="assessment-continue">Continuar</button>
        </div>
      `;

      container.querySelector("#assessment-continue").addEventListener("click", () => {
        onComplete({
          score,
          details: {
            correct: correctWords.length,
            total: words.length,
            forgottenWords,
            timeSeconds: Math.round(elapsedSeconds)
          }
        });
      });
    }

    return function stop() {
      timeoutIds.forEach((id) => {
        clearTimeout(id);
        clearInterval(id);
      });
    };
  }
};

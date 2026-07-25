/*
 * exercises/words.js
 * -----------------------------------------------------------------------
 * Exercise 3 - Paraules: 12 words (drawn from the participant's assigned
 * set, see data/words.js) are shown for 30 seconds, then the participant
 * writes down as many as they remember, one per line. Matching ignores
 * accents and letter case (see utils.normalizeText).
 */

const ExerciseWords = {
  start(container, setIndex, onComplete) {
    const STUDY_SECONDS = 30;
    const WORD_COUNT = 12;
    const words = sampleUnique(WORD_SETS[setIndex % WORD_SETS.length], WORD_COUNT);
    const timeoutIds = [];

    renderStudyPhase();

    function renderStudyPhase() {
      container.innerHTML = `
        <p class="exercise-instructions">Memoritza aquestes ${WORD_COUNT} paraules.</p>
        <div class="word-grid">
          ${words.map((w) => `<span class="word-chip">${w}</span>`).join("")}
        </div>
        <p class="countdown" id="words-countdown">Amaga en ${STUDY_SECONDS}s</p>
      `;

      let remaining = STUDY_SECONDS;
      const countdownEl = container.querySelector("#words-countdown");
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
        <textarea id="words-input" class="text-answer" rows="8" placeholder="paraula 1
paraula 2
..."></textarea>
        <div class="button-row">
          <button type="button" class="btn btn-primary" id="words-submit">Comprovar</button>
        </div>
      `;

      container.querySelector("#words-submit").addEventListener("click", () => {
        const raw = container.querySelector("#words-input").value;
        evaluate(raw);
      });
    }

    function evaluate(rawInput) {
      const normalizedTargets = words.map(normalizeText);
      const enteredRaw = rawInput
        .split(/[\n,]/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0);
      const enteredNormalized = new Set(enteredRaw.map(normalizeText));

      const correctWords = words.filter((w) => enteredNormalized.has(normalizeText(w)));
      const forgottenWords = words.filter((w) => !enteredNormalized.has(normalizeText(w)));
      const score = Math.round((correctWords.length / WORD_COUNT) * 100);

      container.innerHTML = `
        <div class="results-card">
          <h2>Resultats</h2>
          <div class="results-stats">
            <div class="stat"><span class="stat-value">${correctWords.length}/${WORD_COUNT}</span><span class="stat-label">Encerts</span></div>
            <div class="stat"><span class="stat-value">${score}</span><span class="stat-label">Puntuació</span></div>
          </div>
          ${
            forgottenWords.length > 0
              ? `<p class="results-detail-title">Paraules oblidades:</p>
                 <div class="word-grid">${forgottenWords.map((w) => `<span class="word-chip muted">${w}</span>`).join("")}</div>`
              : `<p class="results-detail-title">Les has recordat totes! 🎉</p>`
          }
          <button type="button" class="btn btn-primary" id="words-continue">Tornar al menú</button>
        </div>
      `;

      container.querySelector("#words-continue").addEventListener("click", () => {
        onComplete({
          score,
          details: { correct: correctWords.length, total: WORD_COUNT, forgottenWords }
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

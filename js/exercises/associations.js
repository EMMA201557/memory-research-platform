/*
 * exercises/associations.js
 * -----------------------------------------------------------------------
 * Exercise 4 - Associacions: 10 word pairs are shown for 30 seconds, e.g.
 * "Metge -> Hospital". Then only the first word of each pair is shown,
 * in a shuffled order, and the participant writes the matching second
 * word for each one. Matching ignores accents and case.
 *
 * The 10 pairs come from data/associations.js:
 * ASSOCIATION_SETS[track][sessionIndex] - a fixed list for that
 * participant's balanced-difficulty track AND that day's session, so the
 * pairs advance every session instead of being randomly re-drawn from the
 * same small pool each time (see PROGRAM_TOTAL_SESSIONS / currentSessionIndex
 * in app.js).
 */

const ExerciseAssociations = {
  start(container, setIndex, sessionIndex, onComplete) {
    const STUDY_SECONDS = 30;
    const PAIR_COUNT = 10;
    const track = ASSOCIATION_SETS[setIndex % ASSOCIATION_SETS.length];
    const pairs = track[sessionIndex % track.length];
    const timeoutIds = [];

    renderStudyPhase();

    function renderStudyPhase() {
      container.innerHTML = `
        <p class="exercise-instructions">Memoritza aquestes ${PAIR_COUNT} parelles de paraules.</p>
        <div class="pair-grid">
          ${pairs.map(([a, b]) => `<div class="pair-chip"><span>${a}</span><span class="pair-arrow">→</span><span>${b}</span></div>`).join("")}
        </div>
        <p class="countdown" id="assoc-countdown">Amaga en ${STUDY_SECONDS}s</p>
      `;

      let remaining = STUDY_SECONDS;
      const countdownEl = container.querySelector("#assoc-countdown");
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
      const shuffledPairs = shuffleArray(pairs);

      container.innerHTML = `
        <p class="exercise-instructions">Escriu la paraula que anava amb cadascuna.</p>
        <div class="assoc-form" id="assoc-form">
          ${shuffledPairs
            .map(
              ([a], i) => `
              <div class="assoc-row">
                <label for="assoc-input-${i}">${a} →</label>
                <input type="text" id="assoc-input-${i}" class="text-answer-inline" autocomplete="off" />
              </div>`
            )
            .join("")}
        </div>
        <div class="button-row">
          <button type="button" class="btn btn-primary" id="assoc-submit">Comprovar</button>
        </div>
      `;

      container.querySelector("#assoc-submit").addEventListener("click", () => {
        const answers = shuffledPairs.map(([a, b], i) => {
          const input = container.querySelector(`#assoc-input-${i}`);
          return { a, b, given: input ? input.value : "" };
        });
        evaluate(answers);
      });
    }

    function evaluate(answers) {
      let successes = 0;
      const rows = answers.map(({ a, b, given }) => {
        const isCorrect = normalizeText(given) === normalizeText(b);
        if (isCorrect) successes++;
        return { a, b, given, isCorrect };
      });
      const errors = PAIR_COUNT - successes;
      const score = Math.round((successes / PAIR_COUNT) * 100);

      container.innerHTML = `
        <div class="results-card">
          <h2>Resultats</h2>
          <div class="results-stats">
            <div class="stat"><span class="stat-value">${successes}/${PAIR_COUNT}</span><span class="stat-label">Encerts</span></div>
            <div class="stat"><span class="stat-value">${errors}</span><span class="stat-label">Errors</span></div>
            <div class="stat"><span class="stat-value">${score}</span><span class="stat-label">Puntuació</span></div>
          </div>
          <div class="assoc-review">
            ${rows
              .map(
                (r) => `
                <div class="assoc-review-row ${r.isCorrect ? "correct" : "incorrect"}">
                  <span>${r.a} → ${r.b}</span>
                  ${!r.isCorrect ? `<span class="assoc-given">Has escrit: "${r.given || "—"}"</span>` : "<span>✔️</span>"}
                </div>`
              )
              .join("")}
          </div>
          <button type="button" class="btn btn-primary" id="assoc-continue">Guardar</button>
        </div>
      `;

      container.querySelector("#assoc-continue").addEventListener("click", () => {
        onComplete({ score, details: { successes, errors, total: PAIR_COUNT } });
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

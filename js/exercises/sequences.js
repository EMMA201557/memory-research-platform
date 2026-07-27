/*
 * exercises/sequences.js
 * -----------------------------------------------------------------------
 * Exercise 2 - Seqüències: an emoji sequence is shown for
 * (length * 3) seconds, then hidden. The participant reproduces it by
 * tapping emojis, in order, from an on-screen palette (typing emoji
 * characters on a keyboard is unreliable, especially on mobile, so a
 * tap palette is used instead - functionally identical to "writing" the
 * sequence).
 *
 * 5 rounds, starting at 4 emojis and growing by 1 each round.
 *
 * Unlike Memòria/Paraules/Associacions, this exercise draws fresh random
 * emojis from a shared pool every round already (see SEQUENCE_EMOJI_POOL
 * in data/emojis.js), so it has no "same content every day" problem to
 * fix - `sessionIndex` is accepted only so app.js can call all 5 exercise
 * modules the same way, and is otherwise unused here.
 */

const ExerciseSequences = {
  start(container, setIndex, sessionIndex, onComplete) {
    const TOTAL_ROUNDS = 5;
    const START_LENGTH = 4;
    let round = 1;
    let correctRounds = 0;
    const timeoutIds = [];

    renderRound();

    function renderRound() {
      const length = START_LENGTH + (round - 1);
      const sequence = sampleUnique(SEQUENCE_EMOJI_POOL, length);
      const displaySeconds = length * 3;

      container.innerHTML = `
        <p class="exercise-instructions">Ronda ${round} de ${TOTAL_ROUNDS} — Memoritza la seqüència de ${length} emojis.</p>
        <div class="sequence-display" id="sequence-display">
          ${sequence.map((e) => `<span class="sequence-emoji">${e}</span>`).join("")}
        </div>
        <p class="countdown" id="sequence-countdown">Amaga en ${displaySeconds}s</p>
      `;

      let remaining = displaySeconds;
      const countdownEl = container.querySelector("#sequence-countdown");
      const tickId = setInterval(() => {
        remaining--;
        if (countdownEl) countdownEl.textContent = `Amaga en ${remaining}s`;
        if (remaining <= 0) clearInterval(tickId);
      }, 1000);
      timeoutIds.push(tickId);

      const hideId = setTimeout(() => {
        clearInterval(tickId);
        renderAnswerInput(sequence);
      }, displaySeconds * 1000);
      timeoutIds.push(hideId);
    }

    function renderAnswerInput(sequence) {
      const palette = shuffleArray(SEQUENCE_EMOJI_POOL);
      const answer = [];

      container.innerHTML = `
        <p class="exercise-instructions">Reprodueix la seqüència en el mateix ordre (${sequence.length} emojis).</p>
        <div class="sequence-answer" id="sequence-answer" aria-live="polite"></div>
        <div class="emoji-palette" id="emoji-palette"></div>
        <div class="button-row">
          <button type="button" class="btn btn-secondary" id="sequence-clear">Netejar</button>
        </div>
      `;

      const answerEl = container.querySelector("#sequence-answer");
      const paletteEl = container.querySelector("#emoji-palette");

      function renderAnswer() {
        answerEl.innerHTML = sequence
          .map((_, i) => `<span class="sequence-slot ${answer[i] ? "filled" : ""}">${answer[i] || ""}</span>`)
          .join("");
      }
      renderAnswer();

      palette.forEach((emoji) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "palette-emoji";
        btn.textContent = emoji;
        btn.addEventListener("click", () => {
          if (answer.length >= sequence.length) return;
          answer.push(emoji);
          renderAnswer();
          if (answer.length === sequence.length) {
            evaluateRound(sequence, answer);
          }
        });
        paletteEl.appendChild(btn);
      });

      container.querySelector("#sequence-clear").addEventListener("click", () => {
        answer.length = 0;
        renderAnswer();
      });
    }

    function evaluateRound(sequence, answer) {
      const isCorrect = sequence.every((emoji, i) => emoji === answer[i]);
      if (isCorrect) correctRounds++;

      container.innerHTML = `
        <div class="round-feedback ${isCorrect ? "correct" : "incorrect"}">
          <p>${isCorrect ? "Correcte! ✔️" : "Incorrecte"}</p>
          <p class="sequence-correct-answer">${sequence.join(" ")}</p>
        </div>
      `;

      const nextId = setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          round++;
          renderRound();
        } else {
          finish();
        }
      }, 1600);
      timeoutIds.push(nextId);
    }

    function finish() {
      const score = Math.round((correctRounds / TOTAL_ROUNDS) * 100);
      container.innerHTML = `
        <div class="results-card">
          <h2>Exercici completat! 🎉</h2>
          <div class="results-stats">
            <div class="stat"><span class="stat-value">${correctRounds}/${TOTAL_ROUNDS}</span><span class="stat-label">Rondes correctes</span></div>
            <div class="stat"><span class="stat-value">${score}</span><span class="stat-label">Puntuació</span></div>
          </div>
          <button type="button" class="btn btn-primary" id="sequences-continue">Tornar al menú</button>
        </div>
      `;
      container.querySelector("#sequences-continue").addEventListener("click", () => {
        onComplete({ score, details: { correctRounds, totalRounds: TOTAL_ROUNDS } });
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

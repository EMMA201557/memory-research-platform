/*
 * exercises/memory.js
 * -----------------------------------------------------------------------
 * Exercise 1 - Memoria (Memòria): classic 4x4 card-matching game (8
 * pairs) - kept small so a round is quick to finish. Every exercise
 * module follows the same shape so app.js can
 * drive them all the same way:
 *
 *   const stop = ExerciseMemory.start(containerEl, setIndex, sessionIndex, onComplete);
 *
 * - containerEl: empty <div> to render the exercise UI into.
 * - setIndex: which balanced content track (0..NUM_SETS-1) this
 *   participant is assigned to.
 * - sessionIndex: 0-based index of today's session within the planned
 *   program (see PROGRAM_TOTAL_SESSIONS in app.js) - picks that day's
 *   fixed symbol set within the track, so the board's content advances
 *   session to session instead of being the same every time.
 * - onComplete({ score, details }): called once, when the participant
 *   finishes the exercise and presses "Tornar al menú" on the results
 *   screen. `score` is 0-100.
 * - stop(): returned function that cancels any pending timers; app.js
 *   calls it if the participant leaves early via the persistent
 *   "Tornar al menú" button (exercise counts as NOT completed).
 */

const ExerciseMemory = {
  start(container, setIndex, sessionIndex, onComplete) {
    const track = MEMORY_BOARD_SETS[setIndex % MEMORY_BOARD_SETS.length];
    const symbols = track[sessionIndex % track.length];
    const deck = shuffleArray([...symbols, ...symbols]); // e.g. 8 pairs = 16 cards

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let matchedPairs = 0;
    const totalPairs = symbols.length;
    const startTime = performance.now();
    let resolveTimeoutId = null;

    container.innerHTML = `
      <p class="exercise-instructions">
        Troba totes les parelles de cartes iguals. Toca dues cartes per girar-les.
      </p>
      <div class="memory-board" id="memory-board"></div>
    `;

    const board = container.querySelector("#memory-board");

    deck.forEach((symbol, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "memory-card";
      card.setAttribute("aria-label", "Carta tapada");
      card.dataset.symbol = symbol;
      card.dataset.index = index;
      card.innerHTML = `
        <span class="memory-card-inner">
          <span class="memory-card-face memory-card-back"></span>
          <span class="memory-card-face memory-card-front">${symbol}</span>
        </span>
      `;
      card.addEventListener("click", () => onCardClick(card));
      board.appendChild(card);
    });

    function onCardClick(card) {
      if (lockBoard) return;
      if (card === firstCard) return;
      if (card.classList.contains("matched")) return;

      card.classList.add("flipped");

      if (!firstCard) {
        firstCard = card;
        return;
      }

      secondCard = card;
      lockBoard = true;
      moves++;

      const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

      if (isMatch) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        matchedPairs++;
        resetTurn();
        if (matchedPairs === totalPairs) {
          finish();
        }
      } else {
        resolveTimeoutId = setTimeout(() => {
          firstCard.classList.remove("flipped");
          secondCard.classList.remove("flipped");
          resetTurn();
        }, 900);
      }
    }

    function resetTurn() {
      [firstCard, secondCard] = [null, null];
      lockBoard = false;
    }

    function finish() {
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      // Minimum possible moves = number of pairs (perfect memory).
      const score = clamp(Math.round((totalPairs / moves) * 100), 0, 100);

      container.innerHTML = `
        <div class="results-card">
          <h2>Molt bé! 🎉</h2>
          <p>Has trobat totes les parelles.</p>
          <div class="results-stats">
            <div class="stat"><span class="stat-value">${formatDuration(elapsedSeconds)}</span><span class="stat-label">Temps</span></div>
            <div class="stat"><span class="stat-value">${moves}</span><span class="stat-label">Moviments</span></div>
            <div class="stat"><span class="stat-value">${score}</span><span class="stat-label">Puntuació</span></div>
          </div>
          <button type="button" class="btn btn-primary" id="memory-continue">Tornar al menú</button>
        </div>
      `;

      container.querySelector("#memory-continue").addEventListener("click", () => {
        onComplete({
          score,
          details: { timeSeconds: Math.round(elapsedSeconds), moves }
        });
      });
    }

    return function stop() {
      if (resolveTimeoutId) clearTimeout(resolveTimeoutId);
    };
  }
};

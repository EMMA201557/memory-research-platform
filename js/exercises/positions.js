/*
 * exercises/positions.js
 * -----------------------------------------------------------------------
 * Exercise 5 - Posicions: a 4x4 grid briefly highlights n squares in
 * blue, then resets. The participant taps the same n squares (order
 * doesn't matter, but the SET of squares must match exactly). 6 rounds,
 * n grows by one each round.
 *
 * The highlighted positions are freshly randomized every round already,
 * so - like Seqüències - there's no "same content every day" problem to
 * fix here. `sessionIndex` is accepted only for a consistent call
 * signature across all 5 exercise modules, and is otherwise unused.
 */

const ExercisePositions = {
  start(container, setIndex, sessionIndex, onComplete) {
    const TOTAL_ROUNDS = 6;
    const GRID_SIZE = 16; // 4x4
    const START_N = 3;
    const DISPLAY_SECONDS = 3;
    let round = 1;
    let correctRounds = 0;
    const timeoutIds = [];

    renderRound();

    function renderRound() {
      const n = START_N + (round - 1);
      const targetPositions = new Set(sampleUnique([...Array(GRID_SIZE).keys()], n));

      container.innerHTML = `
        <p class="exercise-instructions">Ronda ${round} de ${TOTAL_ROUNDS} — Memoritza les caselles blaves (${n}).</p>
        <div class="position-grid" id="position-grid"></div>
      `;

      const grid = container.querySelector("#position-grid");
      for (let i = 0; i < GRID_SIZE; i++) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "position-cell";
        cell.dataset.index = i;
        cell.disabled = true;
        if (targetPositions.has(i)) cell.classList.add("highlighted");
        grid.appendChild(cell);
      }

      const hideId = setTimeout(() => {
        grid.querySelectorAll(".position-cell").forEach((cell) => {
          cell.classList.remove("highlighted");
          cell.disabled = false;
        });
        enableSelection(grid, targetPositions, n);
      }, DISPLAY_SECONDS * 1000);
      timeoutIds.push(hideId);
    }

    function enableSelection(grid, targetPositions, n) {
      const selected = new Set();
      const instructions = container.querySelector(".exercise-instructions");
      if (instructions) instructions.textContent = `Toca les ${n} caselles que estaven blaves i confirma.`;

      grid.querySelectorAll(".position-cell").forEach((cell) => {
        cell.addEventListener("click", () => {
          const index = Number(cell.dataset.index);
          if (selected.has(index)) {
            selected.delete(index);
            cell.classList.remove("selected");
          } else {
            selected.add(index);
            cell.classList.add("selected");
          }
        });
      });

      const confirmRow = document.createElement("div");
      confirmRow.className = "button-row";
      confirmRow.innerHTML = `<button type="button" class="btn btn-primary" id="position-confirm">Confirmar</button>`;
      container.appendChild(confirmRow);

      confirmRow.querySelector("#position-confirm").addEventListener("click", () => {
        evaluateRound(selected, targetPositions);
      });
    }

    function evaluateRound(selected, targetPositions) {
      const isCorrect =
        selected.size === targetPositions.size &&
        [...selected].every((i) => targetPositions.has(i));
      if (isCorrect) correctRounds++;

      container.innerHTML = `
        <div class="round-feedback ${isCorrect ? "correct" : "incorrect"}">
          <p>${isCorrect ? "Correcte! ✔️" : "Incorrecte"}</p>
        </div>
      `;

      const nextId = setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          round++;
          renderRound();
        } else {
          finish();
        }
      }, 1200);
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
          <button type="button" class="btn btn-primary" id="positions-continue">Guardar</button>
        </div>
      `;
      container.querySelector("#positions-continue").addEventListener("click", () => {
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

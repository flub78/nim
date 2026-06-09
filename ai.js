// ai.js — table d'évaluation, stratégie IA, self-play

// table[tokensBeforeMove][taken] → score (entier, init 0)
// Indexé de 1 à maxTokens pour les tokens, 1 à 3 pour taken
let table = {};

function initTable(maxTokens) {
  table = {};
  for (let t = 1; t <= maxTokens; t++) {
    table[t] = { 1: 0, 2: 0, 3: 0 };
  }
}

function isValidMove(tokens, taken) {
  return taken >= 1 && taken <= 3 && taken <= tokens;
}

function getScore(tokens, taken) {
  if (!isValidMove(tokens, taken)) return null;
  return table[tokens][taken];
}

function chooseMove(tokens) {
  const legal = getLegalMoves(tokens);
  let best = -Infinity;
  for (const t of legal) {
    const s = table[tokens][t];
    if (s > best) best = s;
  }
  const candidates = legal.filter(t => table[tokens][t] === best);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function updateTable(history, winner) {
  for (const move of history) {
    const delta = move.player === winner ? 1 : -1;
    table[move.tokensBeforeMove][move.taken] += delta;
  }
}

// Joue une partie complète IA vs IA et retourne { history, winner }
function playSelfPlayGame(maxTokens) {
  const savedState = JSON.parse(JSON.stringify(state));

  initGame(maxTokens, 'ai-ai', 'ai1');
  while (!state.gameOver) {
    const move = chooseMove(state.tokens);
    applyMove(state.currentPlayer, move);
  }
  const winner = getWinner();
  const history = state.history.slice();

  // Restaurer l'état de la vraie partie
  Object.assign(state, savedState);
  return { history, winner };
}

function runTraining(n, maxTokens, onProgress) {
  let i = 0;
  function step() {
    if (i >= n) {
      onProgress(n, true); // terminé
      return;
    }
    const { history, winner } = playSelfPlayGame(maxTokens);
    updateTable(history, winner);
    i++;
    onProgress(i, false);
    // requestAnimationFrame pour ne pas bloquer le navigateur
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ui.js — rendu DOM, gestion des événements

// ─── Couleurs des participants ────────────────────────────────────────────────
const COLORS = {
  human:  '#3b82f6', // bleu
  human1: '#3b82f6',
  human2: '#f97316', // orange
  ai:     '#ef4444', // rouge
  ai1:    '#ef4444',
  ai2:    '#a855f7', // violet
};

const COLORS_PALE = {
  human:  '#bfdbfe',
  human1: '#bfdbfe',
  human2: '#fed7aa',
  ai:     '#fecaca',
  ai1:    '#fecaca',
  ai2:    '#e9d5ff',
};

// ─── Compteurs globaux ────────────────────────────────────────────────────────
let totalGames = 0;
let humanAiGames = 0;
let humanAiWins = 0;  // victoires IA en mode human-ai

// ─── Rendu de la pile ─────────────────────────────────────────────────────────
function renderPile() {
  const container = document.getElementById('pile');
  container.innerHTML = '';
  for (let i = state.maxTokens; i >= 1; i--) {
    const token = document.createElement('div');
    token.className = 'token';
    // Chercher si ce jeton a été retiré (jetons retirés = les plus bas numéros)
    const takenCount = state.maxTokens - state.tokens;
    const moveIdx = state.maxTokens - i; // 0-based index du jeton depuis le bas

    if (moveIdx < takenCount) {
      // Jeton retiré : trouver par quel joueur
      let cumul = 0;
      let taker = null;
      for (const move of state.history) {
        cumul += move.taken;
        if (moveIdx < cumul) { taker = move.player; break; }
      }
      token.style.backgroundColor = taker ? COLORS_PALE[taker] : '#e5e7eb';
      token.style.border = `2px solid ${taker ? COLORS[taker] : '#d1d5db'}`;
    } else {
      token.style.backgroundColor = '#6b7280';
      token.style.border = '2px solid #4b5563';
    }
    container.appendChild(token);
  }
}

// ─── Rendu des boutons d'action ───────────────────────────────────────────────
function renderButtons() {
  const legal = getLegalMoves(state.tokens);
  const isHumanTurn = ['human', 'human1', 'human2'].includes(state.currentPlayer);
  const active = !state.gameOver && isHumanTurn;

  for (let n = 1; n <= 3; n++) {
    const btn = document.getElementById(`btn-take-${n}`);
    btn.disabled = !active || !legal.includes(n);
  }
}

// ─── Rendu du statut ─────────────────────────────────────────────────────────
function renderStatus(message) {
  document.getElementById('status').textContent = message || defaultStatus();
}

function defaultStatus() {
  if (state.gameOver) return '';
  const p = state.currentPlayer;
  if (state.gameMode === 'human-ai')    return p === 'human' ? 'À votre tour' : 'L\'IA réfléchit…';
  if (state.gameMode === 'human-human') return p === 'human1' ? 'Tour du Joueur 1' : 'Tour du Joueur 2';
  return '';
}

// ─── Rendu du score ───────────────────────────────────────────────────────────
function renderScore() {
  const scoreSection = document.getElementById('score-section');
  const p1Label = document.getElementById('score-p1-label');
  const p2Label = document.getElementById('score-p2-label');
  const p1Val   = document.getElementById('score-p1-value');
  const p2Val   = document.getElementById('score-p2-value');

  if (state.gameMode === 'ai-ai') {
    scoreSection.style.display = 'none';
    return;
  }
  scoreSection.style.display = '';

  if (state.gameMode === 'human-ai') {
    p1Label.textContent = 'Joueur';
    p2Label.textContent = 'IA';
  } else {
    p1Label.textContent = 'Joueur 1';
    p2Label.textContent = 'Joueur 2';
  }
  p1Val.textContent = scores.p1;
  p2Val.textContent = scores.p2;
}

// ─── Rendu des indicateurs pédagogiques ──────────────────────────────────────
function renderIndicators() {
  document.getElementById('total-games').textContent = totalGames;
  const rateEl = document.getElementById('ai-win-rate');
  if (humanAiGames === 0) {
    rateEl.textContent = '—';
  } else {
    rateEl.textContent = Math.round((humanAiWins / humanAiGames) * 100) + '%';
  }
}

// ─── Rendu de la table d'évaluation ──────────────────────────────────────────
function renderEvalTable() {
  const container = document.getElementById('eval-table');
  container.innerHTML = '';

  const tbl = document.createElement('table');
  tbl.className = 'eval-table';

  // En-tête
  const thead = tbl.createTHead();
  const hrow = thead.insertRow();
  ['Jetons', 'Retirer 1', 'Retirer 2', 'Retirer 3'].forEach(txt => {
    const th = document.createElement('th');
    th.textContent = txt;
    hrow.appendChild(th);
  });

  // Lignes (du max vers 1 pour que la pile la plus grande soit en haut)
  const tbody = tbl.createTBody();
  for (let t = state.maxTokens; t >= 1; t--) {
    const row = tbody.insertRow();
    if (t === state.tokens && !state.gameOver) row.classList.add('current-row');

    const th = document.createElement('td');
    th.textContent = t;
    th.className = 'row-header';
    row.appendChild(th);

    for (let taken = 1; taken <= 3; taken++) {
      const td = document.createElement('td');
      if (!isValidMove(t, taken)) {
        td.className = 'cell-invalid';
        td.textContent = '';
      } else {
        const score = getScore(t, taken);
        td.textContent = score;
        if (score > 0)      td.className = 'cell-positive';
        else if (score < 0) td.className = 'cell-negative';
        else                td.className = 'cell-zero';
      }
      row.appendChild(td);
    }
  }

  container.appendChild(tbl);
}

// ─── Scores en mémoire ────────────────────────────────────────────────────────
const scores = { p1: 0, p2: 0 };

function recordResult(winner) {
  totalGames++;
  if (state.gameMode === 'human-ai') {
    humanAiGames++;
    if (winner === 'ai') { humanAiWins++; scores.p2++; }
    else                 { scores.p1++; }
  } else if (state.gameMode === 'human-human') {
    if (winner === 'human1') scores.p1++;
    else                     scores.p2++;
  }
}

// ─── Fin de partie ────────────────────────────────────────────────────────────
function handleGameOver() {
  const winner = getWinner();
  updateTable(state.history, winner);
  recordResult(winner);

  let msg = '';
  if (state.gameMode === 'human-ai') {
    msg = winner === 'human' ? 'Vous avez gagné !' : 'L\'IA a gagné !';
  } else {
    msg = winner === 'human1' ? 'Joueur 1 a gagné !' : 'Joueur 2 a gagné !';
  }
  renderStatus(msg);
  renderPile();
  renderButtons();
  renderEvalTable();
  renderScore();
  renderIndicators();
  document.getElementById('btn-new-game').focus();
}

// ─── Tour de l'IA ─────────────────────────────────────────────────────────────
function triggerAiTurn() {
  renderStatus('L\'IA réfléchit…');
  setTimeout(() => {
    if (state.gameOver) return;
    const move = chooseMove(state.tokens);
    applyMove(state.currentPlayer, move);
    renderPile();

    if (state.gameOver) {
      handleGameOver();
    } else {
      renderButtons();
      renderStatus();
      renderEvalTable();
    }
  }, 500);
}

// ─── Mise à jour du sélecteur "Qui commence" selon le mode ───────────────────
function updateFirstPlayerOptions() {
  const mode = document.getElementById('select-mode').value;
  const sel = document.getElementById('select-first');
  sel.innerHTML = '';

  if (mode === 'human-ai') {
    sel.add(new Option('Joueur', 'human'));
    sel.add(new Option('IA', 'ai'));
    document.getElementById('training-section').style.display = 'none';
  } else if (mode === 'human-human') {
    sel.add(new Option('Joueur 1', 'human1'));
    sel.add(new Option('Joueur 2', 'human2'));
    document.getElementById('training-section').style.display = 'none';
  } else {
    // ai-ai : sélecteur non pertinent
    sel.add(new Option('IA (auto)', 'ai1'));
    document.getElementById('training-section').style.display = 'flex';
  }
}

// ─── Démarrer une nouvelle partie ────────────────────────────────────────────
function startNewGame() {
  const mode      = document.getElementById('select-mode').value;
  const maxTokens = parseInt(document.getElementById('input-tokens').value, 10);
  const first     = document.getElementById('select-first').value;

  initGame(maxTokens, mode, first);
  renderPile();
  renderButtons();
  renderStatus();
  renderEvalTable();
  renderScore();
  renderIndicators();

  if (mode === 'ai-ai') return; // entraînement manuel via le bouton dédié

  // Si l'IA commence en mode human-ai
  if (mode === 'human-ai' && first === 'ai') {
    triggerAiTurn();
  }
}

// ─── Initialisation au chargement ────────────────────────────────────────────
function init() {
  const maxTokens = parseInt(document.getElementById('input-tokens').value, 10);
  initTable(maxTokens);

  // Sélecteur de mode
  document.getElementById('select-mode').addEventListener('change', () => {
    updateFirstPlayerOptions();
    startNewGame();
  });

  // Changement de taille de pile : étendre la table sans effacer les valeurs
  document.getElementById('input-tokens').addEventListener('change', e => {
    const val = Math.min(30, Math.max(5, parseInt(e.target.value, 10)));
    e.target.value = val;
    extendTable(val);
    startNewGame();
  });

  // Changement de qui commence
  document.getElementById('select-first').addEventListener('change', () => startNewGame());

  // Boutons Retirer N
  for (let n = 1; n <= 3; n++) {
    document.getElementById(`btn-take-${n}`).addEventListener('click', () => {
      if (state.gameOver) return;
      applyMove(state.currentPlayer, n);
      renderPile();

      if (state.gameOver) {
        handleGameOver();
      } else {
        renderButtons();
        renderStatus();
        renderEvalTable();
        // En mode human-ai, déclencher l'IA
        if (state.gameMode === 'human-ai') triggerAiTurn();
      }
    });
  }

  // Bouton Nouvelle partie
  document.getElementById('btn-new-game').addEventListener('click', startNewGame);

  // Bouton Réinitialiser l'apprentissage
  document.getElementById('btn-reset-table').addEventListener('click', () => {
    const maxTokens = parseInt(document.getElementById('input-tokens').value, 10);
    initTable(maxTokens);
    totalGames = 0;
    humanAiGames = 0;
    humanAiWins = 0;
    scores.p1 = 0;
    scores.p2 = 0;
    document.getElementById('train-progress').textContent = '';
    renderEvalTable();
    renderScore();
    renderIndicators();
  });

  // Bouton Entraînement
  document.getElementById('btn-train').addEventListener('click', () => {
    const n = parseInt(document.getElementById('input-train-n').value, 10);
    if (isNaN(n) || n < 1) return;

    const maxTokens = parseInt(document.getElementById('input-tokens').value, 10);
    const progressEl = document.getElementById('train-progress');
    document.getElementById('btn-train').disabled = true;
    document.getElementById('btn-new-game').disabled = true;
    document.getElementById('btn-reset-table').disabled = true;

    runTraining(n, maxTokens, (i, done) => {
      if (!done) totalGames++;
      progressEl.textContent = done ? `Entraînement terminé (${n} parties).` : `Partie ${i} / ${n}…`;
      // Throttle : ne re-rendre la table que toutes les 10 parties (ou à la fin)
      if (done || i % 10 === 0) renderEvalTable();
      renderIndicators();
      if (done) {
        document.getElementById('btn-train').disabled = false;
        document.getElementById('btn-new-game').disabled = false;
        document.getElementById('btn-reset-table').disabled = false;
      }
    });
  });

  updateFirstPlayerOptions();
  startNewGame();
}

document.addEventListener('DOMContentLoaded', init);

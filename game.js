// game.js — état du jeu, règles, déroulement des tours

const state = {
  tokens: 0,
  maxTokens: 10,
  gameMode: 'human-ai',   // 'human-ai' | 'human-human' | 'ai-ai'
  currentPlayer: 'human', // 'human' | 'human1' | 'human2' | 'ai' | 'ai1' | 'ai2'
  gameOver: false,
  loser: null,
  history: [],             // [{ player, tokensBeforeMove, taken }]
};

function getLegalMoves(tokens) {
  if (tokens >= 3) return [1, 2, 3];
  if (tokens === 2) return [1, 2];
  return [1];
}

function getNextPlayer(currentPlayer, gameMode) {
  if (gameMode === 'human-ai') return currentPlayer === 'human' ? 'ai' : 'human';
  if (gameMode === 'human-human') return currentPlayer === 'human1' ? 'human2' : 'human1';
  return currentPlayer === 'ai1' ? 'ai2' : 'ai1';
}

function initGame(maxTokens, gameMode, firstPlayer) {
  state.tokens = maxTokens;
  state.maxTokens = maxTokens;
  state.gameMode = gameMode;
  state.currentPlayer = firstPlayer;
  state.gameOver = false;
  state.loser = null;
  state.history = [];
}

function applyMove(player, taken) {
  const legal = getLegalMoves(state.tokens);
  if (!legal.includes(taken)) return false;

  state.history.push({ player, tokensBeforeMove: state.tokens, taken });
  state.tokens -= taken;

  if (state.tokens === 0) {
    state.gameOver = true;
    state.loser = player;
  } else {
    state.currentPlayer = getNextPlayer(player, state.gameMode);
  }
  return true;
}

function getWinner() {
  if (!state.gameOver) return null;
  const loser = state.loser;
  if (state.gameMode === 'human-ai') return loser === 'human' ? 'ai' : 'human';
  if (state.gameMode === 'human-human') return loser === 'human1' ? 'human2' : 'human1';
  return loser === 'ai1' ? 'ai2' : 'ai1';
}

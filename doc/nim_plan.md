# Nim - Plan d'implémentation

## Structure des fichiers cibles

```
nim/
├── index.html       # Structure HTML de l'application
├── style.css        # Styles et responsive
├── game.js          # Logique du jeu (état, règles, tour)
├── ai.js            # Table d'évaluation, stratégie IA, self-play
└── ui.js            # Rendu DOM, mise à jour de l'interface
```

---

## Phase 1 — Squelette du projet

### Étape 1.1 — Créer les fichiers vides

- [ ] Créer `index.html` avec la structure HTML de base (doctype, charset, viewport, liens vers `style.css`, `game.js`, `ai.js`, `ui.js`)
- [ ] Créer `style.css` vide
- [ ] Créer `game.js` vide
- [ ] Créer `ai.js` vide
- [ ] Créer `ui.js` vide

**Validation :** Ouvrir `index.html` dans un navigateur, la page s'affiche sans erreur console.

### Étape 1.2 — Structure HTML statique

- [ ] Ajouter la section **Configuration** :
  - Sélecteur de mode : "Joueur vs IA" / "Joueur vs Joueur" / "Entraînement IA"
  - Slider/input pour la taille de la pile (défaut 10, min 5, max 30)
  - Sélecteur "Qui commence" (options adaptées au mode)
  - Input nombre de parties (mode Entraînement IA uniquement)
- [ ] Ajouter la section **Pile** : conteneur `#pile` pour les jetons
- [ ] Ajouter la section **Actions joueur** : trois boutons "Retirer 1", "Retirer 2", "Retirer 3"
- [ ] Ajouter la section **Score et statut** : affichage des victoires (adapté au mode), message de statut
- [ ] Ajouter la section **Entraînement** : bouton "Lancer l'entraînement", barre de progression
- [ ] Ajouter la section **Indicateurs pédagogiques** : total parties jouées, taux de victoire IA
- [ ] Ajouter la section **Table d'évaluation** : conteneur `#eval-table`
- [ ] Ajouter un bouton "Nouvelle partie"

**Validation :** Tous les éléments sont visibles dans le navigateur. Aucune fonctionnalité encore attendue.

---

## Phase 2 — Logique du jeu (`game.js`)

### Étape 2.1 — État du jeu

- [ ] Définir l'objet `state` :
  ```js
  {
    tokens,          // jetons restants
    maxTokens,       // taille initiale
    gameMode,        // 'human-ai' | 'human-human' | 'ai-ai'
    currentPlayer,   // 'human' | 'human1' | 'human2' | 'ai'
    gameOver,        // booléen
    history          // [{ player, tokensBeforeMove, taken }]
  }
  ```
- [ ] Implémenter `initGame(maxTokens, gameMode, firstPlayer)` : initialise l'état, vide l'historique
- [ ] Implémenter `getLegalMoves(tokens)` : retourne `[1]`, `[1,2]` ou `[1,2,3]` selon les jetons restants
- [ ] Implémenter `getNextPlayer(currentPlayer, gameMode)` : retourne le joueur suivant
  - `'human-ai'` : alterne entre `'human'` et `'ai'`
  - `'human-human'` : alterne entre `'human1'` et `'human2'`
  - `'ai-ai'` : alterne entre `'ai1'` et `'ai2'`

**Validation unitaire :**
- `getLegalMoves(1)` → `[1]`
- `getLegalMoves(2)` → `[1, 2]`
- `getLegalMoves(3)` → `[1, 2, 3]`
- `getLegalMoves(10)` → `[1, 2, 3]`
- `getNextPlayer('human1', 'human-human')` → `'human2'`
- `getNextPlayer('human2', 'human-human')` → `'human1'`

### Étape 2.2 — Déroulement d'un tour

- [ ] Implémenter `applyMove(player, taken)` :
  - Vérifier que le coup est légal (sinon ignorer)
  - Enregistrer le coup dans `history`
  - Décrémenter `tokens`
  - Si `tokens === 0` : `gameOver = true`, le joueur qui vient de prendre est le **perdant**
  - Sinon : basculer `currentPlayer` via `getNextPlayer`
- [ ] Implémenter `getWinner()` : retourne le gagnant quand `gameOver === true` (l'adversaire du joueur qui a pris le dernier jeton)

**Validation unitaire :**
- Simuler une partie complète en mode `'human-human'` en console : vérifier que le joueur qui prend le dernier jeton perd
- Vérifier que `history` contient bien tous les coups joués avec le bon `player`

---

## Phase 3 — Intelligence artificielle (`ai.js`)

### Étape 3.1 — Table d'évaluation

- [ ] Implémenter `initTable(maxTokens)` : crée `table[tokens][taken]` avec toutes les valeurs à `0`, pour `tokens` de 1 à `maxTokens` et `taken` de 1 à 3
- [ ] Implémenter `getScore(tokens, taken)` : retourne la valeur ou `null` si coup invalide
- [ ] Implémenter `isValidMove(tokens, taken)` : `taken <= tokens`

**Validation :**
- Après `initTable(10)`, toutes les valeurs accessibles sont à 0
- `isValidMove(2, 3)` → `false`
- `isValidMove(2, 2)` → `true`

### Étape 3.2 — Stratégie de l'IA

- [ ] Implémenter `chooseMove(tokens)` :
  - Récupérer les coups légaux (`getLegalMoves`)
  - Trouver la valeur maximale parmi les coups légaux dans la table
  - Parmi les coups à valeur maximale, en choisir un au hasard
  - Retourner le nombre de jetons à retirer

**Validation :**
- Si tous les coups valent 0, `chooseMove` retourne 1, 2 ou 3 (aléatoire parmi les légaux)
- Si `table[5][2] = 5` et les autres valent 0, `chooseMove(5)` retourne toujours `2`
- Si `table[5][1] = 3` et `table[5][3] = 3` et `table[5][2] = 0`, `chooseMove(5)` retourne `1` ou `3` avec équiprobabilité

### Étape 3.3 — Mise à jour de la table après une partie

- [ ] Implémenter `updateTable(history, winner)` :
  - Parcourir tous les coups de `history`
  - Pour chaque coup : si `coup.player === winner` → `table[tokensBeforeMove][taken] += 1`, sinon `−= 1`
  - Fonctionne identiquement pour tous les modes (le champ `player` identifie toujours qui a joué)

**Validation :**
- Simuler une partie gagnée par l'IA avec 3 coups joués : vérifier +1 pour les coups IA, -1 pour les coups joueur
- Simuler une partie `'human-human'` : vérifier +1 pour les coups de `'human1'` (gagnant) et -1 pour `'human2'`

---

## Phase 4 — Interface utilisateur (`ui.js`)

### Étape 4.1 — Affichage de la pile

- [ ] Implémenter `renderPile(state)` : génère un jeton (div ou cercle CSS) par jeton
  - Jetons encore en jeu : couleur neutre
  - Jetons retirés : couleur du participant qui les a pris, très pâle
  - Couleurs : Joueur → bleu, Joueur 1 → bleu, Joueur 2 → orange, IA → rouge

**Validation visuelle :**
- Avec 10 jetons initiaux, 10 cercles s'affichent
- Après que Joueur 1 retire 2 jetons, 2 cercles passent en bleu pâle

### Étape 4.2 — Boutons d'action

- [ ] Implémenter `renderButtons(state)` : active/désactive les boutons selon `getLegalMoves(state.tokens)`
- [ ] Désactiver tous les boutons si `state.gameOver === true`
- [ ] Désactiver tous les boutons si le joueur courant est l'IA (`'ai'`, `'ai1'`, `'ai2'`)
- [ ] En mode `'human-human'`, les boutons restent actifs pour les deux joueurs humains à tour de rôle

**Validation :**
- Avec 2 jetons restants : bouton "Retirer 3" désactivé, les deux autres actifs
- En mode `'human-human'` au tour de Joueur 2 : les boutons sont actifs

### Étape 4.3 — Affichage du statut et du score

- [ ] Afficher le joueur courant selon le mode :
  - `'human-ai'` : "À votre tour" / "L'IA réfléchit..."
  - `'human-human'` : "Tour du Joueur 1" / "Tour du Joueur 2"
- [ ] Afficher le message de fin de partie adapté au mode et au gagnant
- [ ] Afficher le score adapté au mode :
  - `'human-ai'` : victoires Joueur / victoires IA
  - `'human-human'` : victoires Joueur 1 / victoires Joueur 2
  - `'ai-ai'` : masquer le score, afficher la progression de l'entraînement

**Validation :**
- En mode `'human-human'`, le statut bascule bien entre "Joueur 1" et "Joueur 2"
- Le score s'incrémente pour le bon participant après chaque partie

### Étape 4.4 — Table d'évaluation

- [ ] Implémenter `renderEvalTable(table, maxTokens, currentTokens)` :
  - Générer un tableau HTML avec `maxTokens` lignes et 3 colonnes
  - Mettre en évidence la ligne correspondant à `currentTokens`
  - Codage couleur : vert (>0), rouge (<0), gris (=0), noir (coup invalide)
  - Afficher la valeur numérique dans chaque case

**Validation visuelle :**
- Toutes les cases sont grises au démarrage
- Cases noires : ligne "1 jeton", colonnes "2" et "3"
- Après une partie en mode `'human-human'`, des valeurs apparaissent dans la table

---

## Phase 5 — Intégration : mode Joueur vs IA

### Étape 5.1 — Boucle de jeu Joueur vs IA

- [ ] Au clic sur "Nouvelle partie" (mode `'human-ai'`) : `initGame`, `renderPile`, `renderButtons`, `renderEvalTable`
- [ ] Au clic sur "Retirer N" :
  1. `applyMove('human', N)`
  2. `renderPile`, `renderButtons`, statut
  3. Si `gameOver` : `updateTable`, `renderEvalTable`, résultat, score
  4. Sinon : déclencher le tour IA (~500ms de délai visuel)
- [ ] Tour de l'IA :
  1. `chooseMove(state.tokens)`
  2. `applyMove('ai', move)`
  3. `renderPile`, `renderButtons`, statut
  4. Si `gameOver` : `updateTable`, `renderEvalTable`, résultat, score

**Validation fonctionnelle :**
- [ ] Jouer une partie complète, vérifier le bon déroulement visuel
- [ ] Vérifier que le gagnant affiché est correct (variante misère)
- [ ] Vérifier que la table est mise à jour après la partie
- [ ] Vérifier que "Nouvelle partie" relance correctement sans réinitialiser la table

### Étape 5.2 — Configuration (mode Joueur vs IA)

- [ ] Lier le slider de taille de pile à `state.maxTokens`
- [ ] Lier le sélecteur "Qui commence" (Joueur / IA) : si IA, déclencher son tour au lancement
- [ ] Vérifier que changer la configuration démarre une nouvelle partie proprement

**Validation :**
- [ ] IA en premier : elle joue immédiatement, tour passe au joueur
- [ ] Pile de 15 : la table s'affiche avec 15 lignes

---

## Phase 6 — Intégration : mode Joueur vs Joueur

### Étape 6.1 — Boucle de jeu Joueur vs Joueur

- [ ] Au clic sur "Nouvelle partie" (mode `'human-human'`) : `initGame` avec `firstPlayer = 'human1'` ou `'human2'` selon la configuration
- [ ] Au clic sur "Retirer N" :
  1. Identifier le joueur courant (`'human1'` ou `'human2'`) depuis `state.currentPlayer`
  2. `applyMove(state.currentPlayer, N)`
  3. `renderPile`, `renderButtons`, statut (afficher le prochain joueur)
  4. Si `gameOver` : `updateTable`, `renderEvalTable`, résultat, score Joueur 1 / Joueur 2

**Validation fonctionnelle :**
- [ ] Jouer une partie complète à deux : les couleurs de jetons alternent correctement
- [ ] Le statut indique le bon joueur à chaque tour
- [ ] La table est mise à jour après la partie (même mécanisme que Joueur vs IA)
- [ ] Le score du bon joueur s'incrémente

### Étape 6.2 — Configuration (mode Joueur vs Joueur)

- [ ] Le sélecteur "Qui commence" propose "Joueur 1" et "Joueur 2"
- [ ] L'option IA est masquée/désactivée dans ce mode

**Validation :**
- [ ] Choisir "Joueur 2 commence" : le statut affiche "Tour du Joueur 2" au démarrage

---

## Phase 7 — Mode entraînement IA contre IA

### Étape 7.1 — Logique de self-play

- [ ] Implémenter `playSelfPlayGame(table, maxTokens)` :
  - Joue une partie complète IA (`'ai1'`) vs IA (`'ai2'`) en utilisant `chooseMove`
  - Retourne `{ history, winner }`
- [ ] Implémenter `runTraining(n, maxTokens, onProgress)` :
  - Lance `n` parties en self-play
  - Après chaque partie : `updateTable(history, winner)`, puis `onProgress(i)` pour mise à jour UI
  - Utiliser `setTimeout` ou `requestAnimationFrame` pour ne pas bloquer le navigateur

**Validation :**
- Lancer 10 parties, vérifier que la table contient des valeurs non nulles
- Lancer 10 parties supplémentaires, vérifier que les valeurs s'accumulent

### Étape 7.2 — Interface d'entraînement

- [ ] Lier le bouton "Lancer l'entraînement" à `runTraining(n)`
- [ ] Désactiver les boutons joueur et la configuration pendant l'entraînement
- [ ] Afficher un compteur de progression "Partie X / N"
- [ ] Mettre à jour `renderEvalTable` en temps réel pendant l'entraînement
- [ ] Réactiver l'interface à la fin, permettre un nouveau lancement ou une partie

**Validation fonctionnelle :**
- [ ] Lancer 10 parties : la table se colore progressivement
- [ ] Lancer 20 parties supplémentaires : les valeurs s'accumulent sur les existantes
- [ ] Jouer en mode Joueur vs IA après l'entraînement : l'IA utilise la table enrichie
- [ ] Après 200 parties self-play, l'IA gagne plus souvent contre le joueur humain

---

## Phase 8 — Indicateurs pédagogiques

- [ ] Maintenir `totalGames` : incrémenté après chaque partie (tous modes), remis à zéro au rechargement
- [ ] Maintenir le taux de victoire IA : calculé uniquement sur les parties `'human-ai'`
- [ ] Afficher `totalGames` mis à jour en temps réel (y compris pendant l'entraînement)
- [ ] Afficher le taux de victoire IA uniquement si au moins une partie `'human-ai'` a été jouée

**Validation :**
- [ ] Lancer 50 parties self-play : `totalGames` affiche 50
- [ ] Jouer 5 parties Joueur vs IA dont 3 gagnées par l'IA : taux = 60%
- [ ] Jouer 3 parties Joueur vs Joueur : `totalGames` passe à 58, taux IA inchangé
- [ ] Recharger : tout à zéro

---

## Phase 9 — Styles et responsive (`style.css`)

### Étape 9.1 — Mise en page desktop

- [ ] Mettre en page en deux colonnes : jeu à gauche, table d'évaluation à droite
- [ ] Styliser les jetons (cercles) avec les couleurs : Joueur/Joueur 1 → bleu, Joueur 2 → orange, IA → rouge ; version pâle pour les jetons retirés
- [ ] Styliser la table d'évaluation (vert, rouge, gris, noir + valeur centrée)
- [ ] Styliser les boutons d'action (actif / désactivé visuellement distincts)
- [ ] Mettre en évidence la ligne active dans la table
- [ ] Adapter visuellement le panneau de score selon le mode actif

**Validation visuelle desktop :**
- [ ] L'interface est lisible et agréable sur écran ≥ 1024px
- [ ] La ligne courante est clairement identifiable dans la table

### Étape 9.2 — Responsive mobile

- [ ] Passer en une seule colonne en dessous de 768px
- [ ] Agrandir les boutons d'action (min 44px de hauteur) pour les écrans tactiles
- [ ] Adapter la table d'évaluation (scroll horizontal si nécessaire)
- [ ] Vérifier que la configuration est utilisable sur mobile

**Validation responsive :**
- [ ] Vue mobile 375px (iPhone SE) : tous les éléments accessibles sans zoom
- [ ] En mode Joueur vs Joueur sur mobile : le passage de tour est clair malgré l'écran réduit

---

## Phase 10 — Tests de non-régression et validation finale

### Tests fonctionnels — Mode Joueur vs IA

- [ ] **Règle misère** : prendre le dernier jeton → vérifier qu'on perd
- [ ] **Coups invalides** : avec 1 jeton, seul "Retirer 1" est actif
- [ ] **IA commence** : l'IA joue immédiatement sans action du joueur
- [ ] **Pile taille 5** : la table affiche 5 lignes
- [ ] **Pile taille 30** : la table affiche 30 lignes, la page reste utilisable
- [ ] **Table conservée** : "Nouvelle partie" ne réinitialise pas la table

### Tests fonctionnels — Mode Joueur vs Joueur

- [ ] **Alternance correcte** : le statut bascule bien entre Joueur 1 et Joueur 2 à chaque tour
- [ ] **Couleurs de jetons** : les jetons retirés par Joueur 1 sont bleu pâle, ceux de Joueur 2 orange pâle
- [ ] **Mise à jour de la table** : après une partie Joueur vs Joueur, la table est mise à jour (+1 gagnant, -1 perdant)
- [ ] **Score correct** : le bon joueur voit son score s'incrémenter
- [ ] **Joueur 2 commence** : le statut affiche "Tour du Joueur 2" au démarrage

### Tests fonctionnels — Mode Entraînement IA

- [ ] **Self-play cumulatif** : lancer 10 parties, puis 20 → valeurs accumulées dans la table
- [ ] **Blocage UI** : les boutons joueur sont désactivés pendant l'entraînement
- [ ] **Reprise** : après l'entraînement, le joueur peut jouer dans n'importe quel mode
- [ ] **Cohérence table** : après 100 parties self-play (pile 10), l'IA favorise les positions multiples de 4

### Tests transversaux

- [ ] **Rechargement** : table à zéro, scores à zéro, configuration par défaut (10 jetons, Joueur vs IA, joueur commence)
- [ ] **Changement de mode en cours de partie** : une nouvelle partie démarre proprement dans le nouveau mode
- [ ] **Indicateurs** : `totalGames` s'incrémente dans tous les modes ; taux de victoire IA uniquement sur Joueur vs IA
- [ ] **Aucune erreur console** : Chrome et Firefox

### Tests visuels

- [ ] Couleurs de jetons correctes dans les trois modes
- [ ] La table se met à jour en temps réel pendant le self-play
- [ ] La ligne courante dans la table est mise en évidence pendant la partie

---

## Ordre de développement recommandé

1. Phase 1 (squelette)
2. Phase 2 (logique jeu) + tests console
3. Phase 3 (IA) + tests console
4. Phase 4 (UI de base)
5. Phase 5 (intégration Joueur vs IA)
6. Phase 6 (intégration Joueur vs Joueur)
7. Phase 7 (entraînement self-play)
8. Phase 8 (indicateurs pédagogiques)
9. Phase 9 (styles + responsive)
10. Phase 10 (validation finale)

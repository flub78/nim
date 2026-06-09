# Jeu de Nim — Apprentissage automatique

Implémentation du jeu de Nim en HTML/CSS/JavaScript, conçue pour illustrer les principes de l'apprentissage par renforcement.

## Principe du jeu

**Variante misère** : le joueur qui prend le **dernier jeton perd**. À chaque tour, un joueur retire 1, 2 ou 3 jetons d'une pile commune. Quand la pile est épuisée, le joueur qui vient de prendre le dernier jeton a perdu.

## Principe de l'apprentissage automatique

L'IA maintient une **table d'évaluation** : pour chaque état possible (nombre de jetons restants), elle associe un score à chacun des coups jouables (retirer 1, 2 ou 3 jetons).

- Au début, tous les scores valent **0** (l'IA ne sait rien).
- À la fin de chaque partie, les coups du **gagnant** reçoivent **+1** et les coups du **perdant** reçoivent **−1**.
- Pour choisir son coup, l'IA sélectionne le coup avec le **score le plus élevé** (à égalité, elle choisit au hasard).

Au fil des parties, les bons coups accumulent des scores positifs (vert) et les mauvais des scores négatifs (rouge). La table d'évaluation est affichée en temps réel et permet d'observer l'IA apprendre.

## Modes de jeu

| Mode | Description |
|------|-------------|
| **Joueur vs IA** | Un joueur humain affronte l'IA entraînée |
| **Joueur vs Joueur** | Deux humains jouent à tour de rôle ; leurs coups alimentent aussi la table |
| **Entraînement IA** | L'IA joue contre elle-même N parties pour apprendre rapidement |

L'entraînement est **cumulatif** : on peut lancer 10 parties, observer la table, puis en lancer 50 de plus sans perdre les valeurs acquises.

## Lancer l'application

L'application ne nécessite aucune installation. Il suffit d'un serveur HTTP local pour contourner les restrictions de sécurité des navigateurs.

**Avec Python (recommandé) :**

```bash
cd /chemin/vers/nim
python3 -m http.server 8080
```

Puis ouvrir dans un navigateur : [http://localhost:8080](http://localhost:8080)

**Avec Node.js :**

```bash
npx serve .
```

**Ouverture directe :** double-cliquer sur `index.html` fonctionne aussi dans la plupart des navigateurs modernes.

Pour arrêter le serveur : `Ctrl+C` dans le terminal.

## Structure des fichiers

```
nim/
├── index.html   — interface utilisateur
├── style.css    — styles et responsive
├── game.js      — logique du jeu (règles, état, tours)
├── ai.js        — table d'évaluation, stratégie IA, self-play
├── ui.js        — rendu DOM et gestion des événements
└── doc/
    ├── nim_prd.md    — cahier des charges
    └── nim_plan.md   — plan d'implémentation
```

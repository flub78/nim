# Nim Product Requirements Document

## Introduction

Ce projet est un jeu de Nim pour illustrer l'apprentissage automatique.

**Variante jouée (misère)** : le joueur qui prend le dernier jeton perd. À chaque tour, un joueur peut retirer 1, 2 ou 3 jetons. Si le nombre de jetons restants est inférieur à 3, seuls les coups légaux sont proposés (ex. : s'il reste 2 jetons, le joueur peut en retirer 1 ou 2 ; s'il en reste 1, il est contraint d'en retirer 1 et perd).

Le jeu sera implémenté en HTML/CSS/JavaScript et utilisera une IA pour jouer contre l'utilisateur. L'IA apprendra à jouer en utilisant un algorithme de renforcement.

La table d'évaluation est réinitialisée à chaque rechargement de la page (pas de persistance entre sessions).

## Modes de jeu

L'application propose trois modes de jeu, sélectionnables avant chaque partie :

1. **Joueur vs IA** : un joueur humain affronte l'IA
2. **Joueur vs Joueur** : deux joueurs humains s'affrontent à tour de rôle sur le même écran
3. **Entraînement IA** : l'IA joue contre elle-même un nombre paramétrable de parties

Dans tous les modes, chaque partie terminée met à jour la table d'évaluation selon le même mécanisme de renforcement.

## Fonctionnalités

- Trois modes de jeu : Joueur vs IA, Joueur vs Joueur, Entraînement IA
- L'IA apprend à jouer en utilisant un algorithme de renforcement (table d'évaluation)
- Affichage de la pile de jetons en cours de partie
- Affichage du score (nombre de victoires) adapté au mode actif
- Option pour réinitialiser le jeu (nouvelle partie, table d'évaluation conservée)
- Option pour choisir le nombre de jetons dans la pile au début du jeu (défaut : 10, min : 5, max : 30)
- Option pour choisir qui commence (selon le mode)
- Lancement de parties IA contre IA pour accélérer l'apprentissage
- Affichage du nombre total de parties jouées (tous modes confondus)
- Interface responsive (desktop et mobile)

## Technologies utilisées

- HTML/CSS pour l'interface utilisateur
- JavaScript pour la logique du jeu et l'IA

## Interface utilisateur

### Pile de jetons

Le GUI affichera la pile de jetons en cours. Chaque participant (Joueur, Joueur 1, Joueur 2, IA) a une couleur propre. Quand un jeton est retiré de la pile, il reste affiché dans la couleur du participant qui l'a retiré, mais de façon très pâle, pour visualiser l'historique de la partie.

### Actions du joueur

Trois boutons permettent au joueur actif de retirer 1, 2 ou 3 jetons. Les boutons correspondant à des coups invalides (quantité supérieure au nombre de jetons restants) sont désactivés automatiquement.

En mode **Joueur vs Joueur**, les boutons servent alternativement aux deux joueurs. Le statut affiché indique clairement de quel joueur c'est le tour ("Tour du Joueur 1" / "Tour du Joueur 2").

En mode **Entraînement IA**, les boutons joueur sont désactivés pendant toute la durée de l'entraînement.

### Résultat de la partie

Le GUI affiche le gagnant à la fin de chaque partie, avec le nom adapté au mode (ex. : "Joueur 1 a gagné !", "L'IA a gagné !").

### Table d'évaluation

Le GUI affiche une table d'évaluation représentant la connaissance accumulée par l'IA. C'est un tableau dont :

- les colonnes représentent le nombre de jetons retirés (1, 2, 3)
- les lignes représentent le nombre de jetons restants dans la pile (de 1 à la taille maximale choisie)

Chaque case contient la valeur associée au coup par l'algorithme de renforcement. Les valeurs initiales sont toutes à 0.

**Codage couleur des cases :**

- Valeur positive → vert
- Valeur négative → rouge
- Valeur nulle → gris
- Coup invalide (impossible dans cet état) → noir

La table est mise à jour en temps réel après chaque partie, quel que soit le mode de jeu.

### Mise à jour de la table après chaque partie

À la fin d'une partie, pour **tous les coups joués** pendant cette partie :

- Les coups du gagnant reçoivent +1
- Les coups du perdant reçoivent -1

Ce mécanisme s'applique identiquement en mode Joueur vs IA, Joueur vs Joueur et Entraînement IA. En mode Joueur vs Joueur, les coups des deux joueurs humains alimentent la même table d'évaluation que l'IA utilise.

### Stratégie de l'IA

Quand c'est au tour de l'IA de jouer, elle choisit le coup avec la valeur la plus élevée dans la table d'évaluation pour l'état courant. Si plusieurs coups ont la même valeur maximale, l'IA en choisit un au hasard parmi eux.

### Mode entraînement IA contre IA

L'utilisateur peut lancer un nombre paramétrable de parties IA contre IA pour accélérer l'apprentissage. Ce mode peut être utilisé plusieurs fois de suite : par exemple, lancer 10 parties, observer la table, puis en lancer 20 de plus. La table d'évaluation se met à jour en temps réel pendant l'entraînement. Une fois l'entraînement terminé, l'utilisateur peut reprendre une partie dans n'importe quel mode.

### Indicateurs pédagogiques

Pour illustrer la progression de l'apprentissage automatique, le GUI affiche :

- Le nombre total de parties jouées (tous modes confondus), réinitialisé au rechargement
- Le taux de victoire de l'IA calculé uniquement sur les parties Joueur vs IA

### Configuration

Un panneau de configuration permet à l'utilisateur de régler :

- Le mode de jeu : Joueur vs IA / Joueur vs Joueur / Entraînement IA
- Le nombre de jetons initial (défaut : 10, min : 5, max : 30)
- Qui commence la partie :
  - En mode Joueur vs IA : Joueur ou IA
  - En mode Joueur vs Joueur : Joueur 1 ou Joueur 2
  - En mode Entraînement IA : non applicable (l'IA commence toujours)
- En mode Entraînement IA : le nombre de parties à simuler

### Score

Le panneau de score s'adapte au mode actif :

- **Joueur vs IA** : victoires du Joueur / victoires de l'IA
- **Joueur vs Joueur** : victoires du Joueur 1 / victoires du Joueur 2
- **Entraînement IA** : non affiché (remplacé par la progression de l'entraînement)

Les scores sont remis à zéro au rechargement de la page.

### Responsive

L'interface est responsive et utilisable sur desktop et mobile.

/* state.js — l'état de la partie, en un seul objet.
   Tout est ici et nulle part ailleurs : aucune donnée de jeu ne vit dans le DOM.
   Pour ajouter une sauvegarde, il suffit de sérialiser S.

   year/idx  année courante et son rang dans YEARS
   phase     écran affiché : intro, budget, event, resolve, chronicle, end
   tresor    réserve, en millions de maravédis (ordre de grandeur d'époque)
   g         les cinq jauges politiques, 0–100, affichées en mots jamais en chiffres
   budget    cran de dotation de chaque portefeuille, 0–4
   lastBudget budget de l'année précédente, pour détecter les coupes brutales
   divergence écart cumulé avec l'histoire réelle
   fortune   relances restantes, trois pour tout le règne
   flags     acquis durables du règne
   queue     événements semés, en attente
   seen      événements de tirage déjà sortis
   pending   la décision en cours : option, manière, jet, relance */

const S = {
  year:1474, idx:0, phase:"intro",
  tresor:5, revenu:0,
  g:{autorite:34, cortes:42, rome:55, prosperite:30, noblesse:26},
  budget:{justice:1,guerre:2,foi:1,diplomatie:1,cour:2,admin:1},
  lastBudget:null,
  divergence:0, fortune:3,
  flags:{}, queue:[], seen:{},
  chronicle:[], year_events:[], ev_i:0,
  pending:null
};

const YEARS = [1474,1475,1476,1477,1478,1479,1480,1481,1482];

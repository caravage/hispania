/* state.js — l'état de la partie, en un seul objet.
   Tout est ici et nulle part ailleurs : aucune donnée de jeu ne vit dans le DOM.

   L'acte s'ouvre en 1479. Alcáçovas met fin à la guerre de Succession et
   Ferdinand hérite de l'Aragon la même année : c'est le moment où les deux
   souverains sont définitivement en place et où le règne commence vraiment.
   Ce qui précède est acquis et n'est plus rejoué. */

const S = {
  year:1479, idx:0, phase:"intro",
  pro_i:0,             // avancement dans le prologue (1474-1478)

  tresor:6, revenu:0, solde:0, detteAnnee:false,

  /* L'état de 1474, à la mort d'Henri IV. Les cinq décisions du prologue le
     transforment en état de 1479 : ce n'est pas un point de départ fixe, c'est
     le résultat de la manière dont on est sorti de la guerre de Succession. */
  g:{autorite:34, noblesse:26, prosperite:30, cortes:42, france:34},

  gDebut:null,         // les jauges au 1er janvier, pour le bilan de fin d'année

  budget:{justice:1,guerre:2,foi:1,diplomatie:1,cour:2,admin:1},
  lastBudget:null,

  flags:{}, exploits:{}, perdus:{},
  guerres:{}, paix:{},
  queue:[], seen:{},

  chronicle:[],        // { y, txt } — ce que le chroniqueur retient
  archives:[],         // { y, ev, opt, bande, txt } — l'historique consultable
  year_events:[], ev_i:0, yearNote:"",
  pending:null
};

const YEARS = [1479,1480,1481,1482,1483,1484,1485,1486,1487];

/* Ce qui est vrai quoi qu'il arrive en 1479. Le reste — l'Hermandad, le crédit
   génois, la dette envers l'Église — dépend des cinq décisions du prologue. */
S.flags.paix_portugal = true;  // Alcáçovas, septembre 1479
S.paix.portugal = {debut:1475, fin:1479};

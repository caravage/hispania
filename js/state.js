/* state.js — l'état de la partie, en un seul objet.
   Tout est ici et nulle part ailleurs : aucune donnée de jeu ne vit dans le DOM.

   L'acte s'ouvre en 1479. Alcáçovas met fin à la guerre de Succession et
   Ferdinand hérite de l'Aragon la même année : c'est le moment où les deux
   souverains sont définitivement en place et où le règne commence vraiment.
   Ce qui précède est acquis et n'est plus rejoué. */

const S = {
  year:1479, idx:0, phase:"intro",

  tresor:14, revenu:0, solde:0, detteAnnee:false,

  /* Sortie de la guerre de Succession : l'autorité est reconnue mais neuve,
     les villes ont payé et attendent, la noblesse a été achetée plus que
     soumise, le pays sort de cinq ans de campagnes, et la France n'a pas
     désarmé — elle tient toujours le Roussillon. */
  g:{autorite:48, noblesse:38, prosperite:36, cortes:52, france:32},

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

/* Ce qui est déjà vrai en 1479 et n'a pas à être rejoué. Ces marqueurs
   conditionnent des situations à venir sans valoir de point : ce sont des
   acquis du règne précédent, pas des exploits de celui-ci. */
S.flags.hermandad = true;      // instituée aux Cortès de Madrigal, 1476
S.flags.paix_portugal = true;  // Alcáçovas, septembre 1479
S.paix.portugal = {debut:1475, fin:1479};

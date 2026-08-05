/* config.js — les tables de réglage.
   Portefeuilles, crans de dotation, jauges, manières de décider.
   Tout l'équilibrage du jeu tient dans ce fichier ; le contenu narratif
   est dans data/nodes.js, data/pool.js et data/injected.js. */

const STEPS = ["Abandonné","Famélique","Suffisant","Généreux","Fastueux"];
const STEP_COST = [0,1,2,4,7];
/* Amplitude 27, contre 20 pour la jauge associée. La dotation reste le levier
   le plus fort — c'est juste — mais elle ne noie plus les jauges : à -20…+18
   la bonne stratégie était de deviner le portefeuille utile et de le pousser à
   Fastueux, et l'état du royaume ne comptait plus. */
const STEP_MOD  = [-14,-7,0,7,13];

const PF = [
  {k:"justice",   n:"Justice & Ordre",      d:"Hermandad, corregidores, audiences. Tout ce qui touche à l'obéissance intérieure."},
  {k:"guerre",    n:"Guerre & Frontière",   d:"Hueste, artillerie, places fortes, soldes."},
  {k:"foi",       n:"Foi & Église",         d:"Clergé, fondations, tribunaux du Saint-Office, rapports avec Rome."},
  {k:"diplomatie",n:"Diplomatie & Maison",  d:"Ambassades, dots, cérémonial, médecins de la maison royale."},
  {k:"cour",      n:"Cour & Grâce",         d:"Offices, pensions, commanderies. Ce qui achète la fidélité des grands."},
  {k:"admin",     n:"Administration",       d:"Secrétaires, lettrés, archives. Réduit l'incertitude partout ailleurs."}
];

/* Les cinq jauges. `w` donne les cinq mots, par paliers de vingt : le joueur
   ne verra jamais le chiffre. `d` dit au joueur à quoi la jauge lui sert —
   affiché en légende sur l'écran d'ouverture et au survol du bandeau.
   Chaque jauge sauf le Royaume commande le seuil d'un ou plusieurs
   portefeuilles ; le Royaume, lui, ne facilite rien et remplit la bourse. */
const GAUGES = {
  autorite:  {n:"Autorité",   w:["contestée","fragile","établie","forte","incontestée"],
    d:"Ce que vos ordres pèsent là où vous n'êtes pas. Elle facilite la justice, la guerre et la diplomatie — trois affaires sur six — et grossit un peu les rentrées."},
  cortes:    {n:"Cortès",     w:["hostiles","réticentes","attentives","favorables","acquises"],
    d:"Les villes réunies, qui votent l'impôt. Elles fournissent une bonne part des rentrées et commandent votre administration."},
  rome:      {n:"Rome",       w:["rompue","froide","correcte","bonne","excellente"],
    d:"Le pape et sa cour. Ne joue que sur les affaires d'Église, mais là, elle joue seule."},
  prosperite:{n:"Royaume",    w:["ruiné","exsangue","modeste","prospère","florissant"],
    d:"L'état matériel du pays : récoltes, chemins, foires. Il ne rend aucune entreprise plus facile — il remplit la bourse, et c'est lui qui la remplit le plus."},
  noblesse:  {n:"Les grands", w:["en armes","hostiles","méfiants","ralliés","dévoués"],
    d:"La haute noblesse. Elle ne s'obtient qu'à la Cour, par les offices et les pensions. Une dotation coupée brutalement l'indispose pour longtemps."},
  /* La France n'est pas une jauge d'amitié : c'est une mesure de menace.
     Louis XI tient le Roussillon, revendique la Navarre et arme le Portugal
     contre vous. L'échelle est volontairement asymétrique — le meilleur état
     possible est « apaisée », jamais alliée. Sous SEUIL_GUERRE_FRANCE, elle
     entre en Castille (voir menaceFrance dans rules.js). */
  france:    {n:"France",     w:["en guerre","menaçante","hostile","froide","apaisée"],
    d:"Louis XI, qui tient le Roussillon et convoite la Navarre. Elle commande vos affaires de diplomatie. Laissez-la descendre trop bas et elle entrera en Castille sans vous demander l'année."}
};
const word = (k,v) => GAUGES[k].w[Math.max(0,Math.min(4,Math.floor(v/20)))];


/* Les trois manières. C'est ici qu'on règle l'équilibre du jeu :
   `seuil` déplace le seuil de réussite, `coutx` multiplie le coût de l'option.
   Prudent paie plus cher et supprime les deux bandes extrêmes ;
   audacieux paie moins et les élargit. Voir bands() dans rules.js. */
const RISK = {
  prudent:  {n:"Prudent",   seuil:+8, coutx:1.25},
  equilibre:{n:"Équilibré", seuil: 0, coutx:1.0},
  audacieux:{n:"Audacieux", seuil:-5, coutx:0.6}
};

const BAND_NAMES = ["Échec grave","Échec","Demi-succès","Succès","Triomphe"];
const BAND_KEYS  = ["crit","fail","part","succ","tri"];

/* Ce que chaque issue vaut au bilan du règne, quelle que soit la voie.
   Une réussite inouïe compte exactement autant qu'une réussite historique :
   c'est l'entreprise qui est jugée, pas sa conformité aux chroniques.
   Le gros du score vient des exploits (data/exploits.js) ; ceci n'est que le
   fond de tableau, pour qu'aucune décision ne soit sans conséquence au bilan. */
const BAND_VP = [-3,-1,0,2,5];

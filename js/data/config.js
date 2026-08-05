/* config.js — les tables de réglage.
   Portefeuilles, crans de dotation, jauges, manières de décider.
   Tout l'équilibrage du jeu tient dans ce fichier ; le contenu narratif
   est dans data/nodes.js, data/pool.js et data/injected.js. */

const STEPS = ["Abandonné","Famélique","Suffisant","Généreux","Fastueux"];
const STEP_COST = [0,1,2,4,7];
const STEP_MOD  = [-20,-10,0,10,18];

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
    d:"La haute noblesse. Elle ne s'obtient qu'à la Cour, par les offices et les pensions. Une dotation coupée brutalement l'indispose pour longtemps."}
};
const word = (k,v) => GAUGES[k].w[Math.max(0,Math.min(4,Math.floor(v/20)))];


/* Les trois manières. C'est ici qu'on règle l'équilibre du jeu :
   `seuil` déplace le seuil de réussite, `coutx` multiplie le coût de l'option.
   Prudent paie plus cher et supprime les deux bandes extrêmes ;
   audacieux paie moins et les élargit. Voir bands() dans rules.js. */
const RISK = {
  prudent:  {n:"Prudent",   seuil:+8, coutx:1.6},
  equilibre:{n:"Équilibré", seuil: 0, coutx:1.0},
  audacieux:{n:"Audacieux", seuil:-5, coutx:0.6}
};

const BAND_NAMES = ["Échec grave","Échec","Demi-succès","Succès","Triomphe"];
const BAND_KEYS  = ["crit","fail","part","succ","tri"];

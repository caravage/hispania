/* config.js — les tables de réglage.
   Portefeuilles, crans de dotation, jauges. Tout l'équilibrage tient ici ;
   le contenu narratif est dans nodes.js, pool.js et injected.js. */

const STEPS = ["Abandonné","Famélique","Suffisant","Généreux","Fastueux"];

/* Tenir les six portefeuilles à « Suffisant » coûte 24, à « Fastueux » 66.
   Les rentrées d'une bonne année tournent autour de 30 : il faut choisir
   trois portefeuilles à soutenir, pas six à arroser. */
const STEP_COST = [0,2,4,7,11];
const STEP_MOD  = [-14,-7,0,7,13];

const PF = [
  {k:"justice",   n:"Justice & Ordre",      d:"Hermandad, corregidores, audiences. Tout ce qui touche à l'obéissance intérieure."},
  {k:"guerre",    n:"Guerre & Frontière",   d:"Hueste, artillerie, places fortes, soldes."},
  {k:"foi",       n:"Foi & Église",         d:"Clergé, fondations, tribunaux du Saint-Office."},
  {k:"diplomatie",n:"Diplomatie & Maison",  d:"Ambassades, dots, cérémonial, médecins de la maison royale."},
  {k:"cour",      n:"Cour & Grâce",         d:"Offices, pensions, commanderies. Ce qui achète la fidélité des grands."},
  {k:"admin",     n:"Administration",       d:"Secrétaires, lettrés, archives. Réduit l'incertitude partout ailleurs."}
];

/* Les jauges, groupées par ce qu'elles gouvernent. Le trésor n'en fait pas
   partie : c'est la seule chose que le joueur voit en chiffres, et il se suit
   à part. Chaque jauge commande le seuil d'un ou deux portefeuilles — aucune
   n'est décorative. */
const GROUPES = [
  {k:"pouvoir", n:"Le pouvoir"},
  {k:"pays",    n:"Le pays"},
  {k:"dehors",  n:"Au-dehors"}
];

const GAUGES = {
  autorite:  {n:"Autorité", gr:"pouvoir",
    w:["contestée","fragile","établie","forte","incontestée"],
    d:"Ce que vos ordres pèsent là où vous n'êtes pas. Elle commande la justice et les affaires d'Église, et grossit les rentes du domaine."},
  noblesse:  {n:"Les grands", gr:"pouvoir",
    w:["en armes","hostiles","méfiants","ralliés","dévoués"],
    d:"La haute noblesse. Elle ne s'obtient qu'à la Cour, par les offices et les pensions. Une dotation coupée brutalement l'indispose pour longtemps."},
  prosperite:{n:"Royaume", gr:"pays",
    w:["ruiné","exsangue","modeste","prospère","florissant"],
    d:"Récoltes, chemins, foires. C'est lui qui remplit l'alcabala, et c'est lui qui décide si le pays peut porter une guerre."},
  cortes:    {n:"Cortès", gr:"pays",
    w:["hostiles","réticentes","attentives","favorables","acquises"],
    d:"Les villes réunies, qui votent le service. Elles commandent votre administration et une bonne part des rentrées."},
  france:    {n:"France", gr:"dehors",
    w:["en guerre","menaçante","hostile","froide","apaisée"],
    d:"Louis XI puis sa fille, qui tiennent le Roussillon et convoitent la Navarre. Elle commande vos ambassades. Laissez-la tomber trop bas et elle entrera en Castille."}
};

const palier = v => Math.max(0,Math.min(4,Math.floor(v/20)));
const word = (k,v) => GAUGES[k].w[palier(v)];

/* Le portefeuille et la jauge qui répondent l'un de l'autre. Affiché au joueur
   sous chaque réponse : il doit voir de quoi dépend sa chance avant de choisir. */
const PORT_JAUGE = {
  justice:"autorite", foi:"autorite", guerre:"prosperite",
  admin:"cortes", cour:"noblesse", diplomatie:"france"
};

/* Les rentrées, poste par poste. Nommées, parce que le joueur doit comprendre
   d'où vient son argent et donc ce qu'il abîme quand il abîme une jauge.
   `part` est la fraction de la jauge qui rentre au trésor. */
const RENTES = [
  {k:"alcabala", n:"Alcabalas",      d:"Le dixième sur toute vente. Suit l'état du royaume.",        g:"prosperite", part:0.15},
  {k:"servicio", n:"Service des Cortès", d:"Ce que les villes consentent à voter.",                  g:"cortes",     part:0.12},
  {k:"domaine",  n:"Rentes du domaine", d:"Douanes, salines, maîtrises. Rentre si l'on est obéi.",   g:"autorite",   part:0.09},
  {k:"tercias",  n:"Tercias reales",  d:"Le tiers royal sur la dîme. Ne dépend que du temps.",       g:null,         part:0}
];

const BAND_NAMES = ["Échec grave","Échec","Demi-succès","Succès","Triomphe"];
const BAND_KEYS  = ["crit","fail","part","succ","tri"];

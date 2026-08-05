/* config.js — les tables de réglage.
   Portefeuilles, crans de dotation, jauges, rentes. Tout l'équilibrage tient
   ici ; le contenu narratif est dans nodes.js, pool.js, petits.js, injected.js. */

const STEPS = ["Abandonné","Famélique","Suffisant","Généreux","Fastueux"];

/* Échelle resserrée. Tenir les six portefeuilles à « Suffisant » coûte 12,
   à « Fastueux » 30. Les rentrées vont de 9 en 1479 à 18 pour un règne bien
   mené : on ne tient jamais les six, même modestement. */
const STEP_COST = [0,1,2,3,5];
const STEP_MOD  = [-14,-7,0,7,13];

const PF = [
  {k:"justice",   n:"Justice & Ordre",      d:"Hermandad, corregidores, audiences. Tout ce qui touche à l'obéissance intérieure."},
  {k:"guerre",    n:"Guerre & Frontière",   d:"Hueste, artillerie, places fortes, soldes."},
  {k:"foi",       n:"Foi & Église",         d:"Clergé, fondations, tribunaux du Saint-Office."},
  {k:"diplomatie",n:"Diplomatie & Maison",  d:"Ambassades, dots, cérémonial, médecins de la maison royale."},
  {k:"cour",      n:"Cour & Grâce",         d:"Offices, pensions, commanderies. Ce qui achète la fidélité des grands."},
  {k:"admin",     n:"Administration",       d:"Secrétaires, lettrés, archives. Réduit l'incertitude partout ailleurs."}
];

/* Deux groupes permanents, plus un troisième qui n'existe que s'il y a quelque
   chose dedans. Le trésor se suit à part : c'est un chiffre, pas un état. */
const GROUPES = [
  {k:"couronne", n:"La couronne"},
  {k:"ordres",   n:"Les ordres"},
  {k:"dehors",   n:"Crises et menaces"}
];

/* Les clés internes (autorite, cortes) sont restées : elles sont écrites dans
   les 95 options du contenu. Seuls les noms affichés ont changé. */
const GAUGES = {
  prosperite:{n:"Royaume", gr:"couronne",
    w:["ruiné","exsangue","modeste","prospère","florissant"],
    d:"Récoltes, chemins, foires. Il remplit l'alcabala et décide si le pays peut porter une guerre."},
  autorite:  {n:"Pouvoir", gr:"couronne",
    w:["contesté","fragile","établi","fort","incontesté"],
    d:"Ce que vos ordres pèsent là où vous n'êtes pas. Il commande la justice, et fait rentrer les maestrazgos et les salines."},
  noblesse:  {n:"Noblesse", gr:"ordres",
    w:["en armes","hostile","méfiante","ralliée","dévouée"],
    d:"Les grands. Ils ne s'obtiennent qu'à la Cour, par les offices et les pensions. Une dotation coupée brutalement les indispose pour longtemps."},
  clerge:    {n:"Clergé", gr:"ordres",
    w:["en rupture","défiant","correct","acquis","dévoué"],
    d:"Évêchés, chapitres, ordres mendiants et le Saint-Office. Il commande les affaires d'Église, il tient les tercias et la bulle de croisade, et c'est lui qui décide si un tribunal de la foi vous obéit ou obéit à Rome."},
  cortes:    {n:"Bourgeoisie", gr:"ordres",
    w:["hostile","réticente","attentive","favorable","acquise"],
    d:"Les villes et leurs procureurs aux Cortès. Elles votent le service, commandent votre administration et fournissent une bonne part des rentrées."},
  /* Troisième groupe : n'apparaît au bandeau que tant que la crise dure.
     La France y figure toujours — c'est la menace permanente du règne. */
  france:    {n:"France", gr:"dehors", toujours:true,
    w:["en guerre","menaçante","hostile","froide","apaisée"],
    d:"Louis XI puis sa fille, qui tiennent le Roussillon et convoitent la Navarre. Elle commande vos ambassades. Laissez-la tomber trop bas et elle entrera en Castille."}
};

const palier = v => Math.max(0,Math.min(4,Math.floor(v/20)));
const word = (k,v) => GAUGES[k].w[palier(v)];
const permanentes = () => Object.keys(GAUGES).filter(k=>GAUGES[k].gr!=="dehors");

/* Le portefeuille et la jauge qui répondent l'un de l'autre. Chacun des six a
   la sienne : aucune jauge n'est décorative, aucun portefeuille n'est orphelin. */
const PORT_JAUGE = {
  justice:"autorite", foi:"clerge", guerre:"prosperite",
  admin:"cortes", cour:"noblesse", diplomatie:"france"
};

/* Les rentrées, poste par poste, sous leur nom d'époque et avec la jauge qui
   les nourrit. C'est là que le joueur comprend d'où vient l'argent, et donc ce
   qu'il casse quand il laisse une jauge tomber. */
const RENTES = [
  {n:"Alcabala",          g:"prosperite", part:0.075,
   d:"Le dixième perçu sur toute vente dans le royaume."},
  {n:"Servicio y montazgo", g:"prosperite", part:0.020,
   d:"Le péage sur les troupeaux de la Mesta aux passages de rivière."},
  {n:"Servicio de Cortes", g:"cortes", part:0.055,
   d:"L'aide extraordinaire que les procureurs des villes votent, ou refusent."},
  {n:"Almojarifazgo",     g:"cortes", part:0.020,
   d:"Les droits de douane de Séville et des ports d'Andalousie."},
  {n:"Rentas del maestrazgo", g:"autorite", part:0.025,
   d:"Le revenu des ordres militaires, qui ne rentre que si le roi les tient."},
  {n:"Salinas y almadenes", g:"autorite", part:0.020,
   d:"Le monopole royal du sel et du mercure d'Almadén."},
  {n:"Tercias reales",    g:"clerge", part:0.030,
   d:"Les deux neuvièmes de la dîme que Rome laisse à la couronne — encore faut-il que le clergé les verse."}
];

const BAND_NAMES = ["Échec grave","Échec","Demi-succès","Succès","Triomphe"];
const BAND_KEYS  = ["crit","fail","part","succ","tri"];

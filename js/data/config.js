/* config.js — les tables de réglage.
   Portefeuilles, crans de dotation, jauges, rentes. Tout l'équilibrage tient
   ici ; le contenu narratif est dans nodes.js, pool.js, petits.js, injected.js. */

const STEPS = ["Abandonné","Famélique","Suffisant","Généreux","Fastueux"];

/* Tenir les six lignes à « Suffisant » coûte 24 quand l'année 1479 rapporte 9
   et une bonne année de 1487 dix-huit. On n'en tient jamais plus de deux ou
   trois : la répartition est le vrai arbitrage du jeu, et abandonner une ligne
   doit être un choix qu'on assume, pas un défaut de calcul.
   L'entretien des ordres suit ces coûts (voir ENTRETIEN_PAR_MARAVEDI) : une
   ligne plus chère entretient d'autant plus. */
const STEP_COST = [0,2,4,6,9];
const STEP_MOD  = [-14,-7,0,7,13];

/* Trois lignes portent le nom de l'ordre qu'elles entretiennent — c'est la
   même chose et il n'y a aucune raison de faire retenir deux mots au joueur.
   Les trois autres sont des moyens et non des ordres : on n'investit pas dans
   la noblesse comme on investit dans l'artillerie. */
const PF = [
  {k:"cour",      n:"La Noblesse",    d:"Offices, pensions, commanderies. Ce qui achète la fidélité des grands."},
  {k:"foi",       n:"Le Clergé",      d:"Fondations, évêchés, tribunaux du Saint-Office."},
  {k:"admin",     n:"La Bourgeoisie", d:"Chartes urbaines, secrétaires, lettrés, archives."},
  {k:"justice",   n:"Justice & Ordre",d:"Hermandad, corregidores, audiences. Tout ce qui touche à l'obéissance intérieure."},
  {k:"guerre",    n:"Guerre & Frontière", d:"Hueste, artillerie, places fortes, soldes."},
  {k:"diplomatie",n:"Ambassades",     d:"Envoyés, dots, cérémonial. Ce qui tient la France à distance."}
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
/* Une seule échelle pour les trois ordres : ils répondent tous à la même
   question — jusqu'où suivent-ils la couronne. La forme féminine est donnée à
   côté, sinon « la noblesse est rallié ». Modifier ici les modifie tous. */
const ECHELLE_ORDRE = [
  ["en rupture","en rupture"],
  ["hostile",   "hostile"],
  ["réservé",   "réservée"],
  ["rallié",    "ralliée"],
  ["dévoué",    "dévouée"]
];
const motsOrdre = genre => ECHELLE_ORDRE.map(p => genre==="f" ? p[1] : p[0]);

const GAUGES = {
  prosperite:{n:"Royaume", gr:"couronne",
    w:["ruiné","exsangue","modeste","prospère","florissant"],
    d:"Récoltes, chemins, foires. Il remplit l'alcabala et décide si le pays peut porter une guerre."},
  autorite:  {n:"Pouvoir", gr:"couronne",
    w:["contesté","fragile","établi","fort","incontesté"],
    d:"Ce que vos ordres pèsent là où vous n'êtes pas. Il commande la justice, et fait rentrer les maestrazgos et les salines."},
  noblesse:  {n:"Noblesse", gr:"ordres", genre:"f", w:motsOrdre("f"),
    d:"Les grands. Ils ne s'obtiennent qu'à la Cour, par les offices et les pensions. Une dotation coupée brutalement les indispose pour longtemps."},
  clerge:    {n:"Clergé", gr:"ordres", genre:"m", w:motsOrdre("m"),
    d:"Évêchés, chapitres, ordres mendiants et le Saint-Office. Il commande les affaires d'Église, il tient les tercias et la bulle de croisade, et c'est lui qui décide si un tribunal de la foi vous obéit ou obéit à Rome."},
  cortes:    {n:"Bourgeoisie", gr:"ordres", genre:"f", w:motsOrdre("f"),
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

/* Ce dont dépend la réussite d'un portefeuille — et ce n'est jamais l'ordre
   qu'il achète. Chaque portefeuille était auparavant conditionné par la jauge
   que ses propres réussites alimentaient : payer la Cour servait à gagner la
   Noblesse, mais il fallait déjà la Noblesse pour que payer la Cour marche.
   Cinq boucles de rétroaction positive, dont la spirale qui laissait les
   grands « en armes » dans toutes les parties.

   Le couplage est maintenant croisé : ce qui conditionne une dépense est ce
   qui la rend crédible, pas ce qu'elle achète. Une noblesse effondrée
   redevient récupérable tant que le Pouvoir tient. */
const PORT_JAUGE = {
  cour:      "autorite",    // on ne distribue des offices que si l'on est obéi
  foi:       "clerge",      // les affaires d'Église passent par ceux qui la tiennent
  justice:   "cortes",      // c'est l'Hermandad des villes qui tient les chemins
  admin:     "prosperite",  // un pays prospère peut payer des lettrés
  guerre:    "prosperite",  // le pays porte la guerre — la seule dépendance déjà juste
  diplomatie:"france"
};

/* Ce que chaque ordre rend, et qui n'est pas la même chose :
     Noblesse    — la hueste sert à ses frais : elle allège la solde de guerre.
     Bourgeoisie — le servicio et les douanes : de l'argent ordinaire.
     Clergé      — les tercias, et la bulle de croisade, qui ne rentre que
                   tant qu'on fait la guerre. De l'argent de guerre.
   Et les trois ensemble font la stabilité du royaume. */
const ALLEGEMENT_HUESTE = 250;   // solde de guerre réduite de noblesse/250

/* L'entretien des ordres. Une dotation ne doit pas seulement faciliter une
   entreprise : « Cour & Grâce » est littéralement ce qui achète la fidélité
   des grands, et l'abandonner doit se payer année après année. Chaque ordre
   dérive donc vers ce que sa dotation entretient — c'est le seul mouvement
   continu du jeu, et c'est ce qui permet de relever un ordre effondré.

   Sans cela, le contenu seul laissait la noblesse à zéro dans toutes les
   parties : elle n'avait aucune source de remontée régulière. */
const PF_ENTRETIEN = { cour:"noblesse", foi:"clerge", admin:"cortes" };

/* La dérive suit l'argent, pas le rang de la case : deux points de jauge par
   maravédi dépensé sur la ligne. Il faut que ce soit assez fort pour compenser
   ce que les situations retirent — sinon un ordre qu'on paie généreusement
   s'effondre quand même, ce qui est ce qui arrivait à la noblesse.
   Abandonner une ligne coûte, même sans rien dépenser. */
const ENTRETIEN_PAR_MARAVEDI = 2;
const ABANDON = -4;
const derive = lvl => lvl===0 ? ABANDON : STEP_COST[lvl]*ENTRETIEN_PAR_MARAVEDI;
const DERIVE = STEPS.map((_,i)=>derive(i));   // [-4, +2, +4, +6, +10]

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
  {n:"Bula de cruzada",   g:"clerge", part:0.055, guerre:true,
   d:"L'impôt de croisade que Rome autorise à lever — tant que la guerre se fait contre l'infidèle."},
  {n:"Tercias reales",    g:"clerge", part:0.030,
   d:"Les deux neuvièmes de la dîme que Rome laisse à la couronne — encore faut-il que le clergé les verse."}
];

const BAND_NAMES = ["Échec grave","Échec","Demi-succès","Succès","Triomphe"];
const BAND_KEYS  = ["crit","fail","part","succ","tri"];

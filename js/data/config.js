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
/* `bloc` range les lignes en deux ensembles à l'écran : d'abord l'appareil de
   la couronne, puis les trois ordres côte à côte, avec leur total. */
const PF = [
  {k:"justice",   bloc:"couronne", n:"Justice & Ordre", d:"Hermandad, corregidores, audiences. Tout ce qui touche à l'obéissance intérieure."},
  {k:"guerre",    bloc:"couronne", n:"Guerre & Frontière", d:"Hueste, artillerie, places fortes, soldes."},
  {k:"diplomatie",bloc:"couronne", n:"Ambassades", d:"Envoyés, dots, cérémonial. Ce qui tient la France à distance."},
  {k:"cour",      bloc:"ordres",   n:"La Noblesse", d:"Offices, pensions, commanderies."},
  {k:"foi",       bloc:"ordres",   n:"Le Clergé", d:"Fondations, évêchés, tribunaux du Saint-Office."},
  {k:"admin",     bloc:"ordres",   n:"La Bourgeoisie", d:"Chartes urbaines, secrétaires, lettrés, archives."}
];
const BLOCS = [
  {k:"couronne", n:"L'appareil de la couronne", d:"Ce que la couronne se donne à elle-même. Le bâtir centralise le pouvoir."},
  {k:"ordres",   n:"Les trois ordres", d:"Ce qu'on donne aux grands, à l'Église et aux villes. Le donner achète leur fidélité et disperse le pouvoir."}
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

/* D'où vient l'argent, et c'est tout : chaque jauge verse une part d'elle-même
   au trésor, une fois l'an. Les noms d'époque (alcabala, almojarifazgo…)
   étaient décoratifs et n'apparaissaient nulle part ailleurs dans le jeu ; ce
   qui compte est de voir que laisser tomber la Bourgeoisie coûte cinq par an. */
const RENTES = [
  {g:"prosperite", part:0.095},
  {g:"cortes",     part:0.075},
  {g:"autorite",   part:0.045},
  {g:"clerge",     part:0.030}
];
/* La croisade : le clergé verse davantage tant qu'on fait la guerre. */
const RENTE_CROISADE = 0.055;
/* Ce qui rentre sans dépendre de personne, et qui croît lentement. */
const renteFixe = idx => 2 + idx*0.35;

/* ---------- centralisation ----------
   Ce qu'on donne à ses propres organes — justice, armée, ambassades — bâtit
   l'appareil royal. Ce qu'on donne aux ordres achète leur fidélité mais laisse
   le pouvoir chez eux. La différence des deux fait monter ou descendre le
   Pouvoir chaque année : c'est le seul endroit du jeu où la forme du budget
   compte autant que son montant. */
const LIGNES_COURONNE = ["justice","guerre","diplomatie"];
const LIGNES_ORDRES   = ["cour","foi","admin"];
const CENTRALISATION_DIVISEUR = 3;
const CENTRALISATION_MAX = 5;

const BAND_NAMES = ["Échec grave","Échec","Demi-succès","Succès","Triomphe"];
const BAND_KEYS  = ["crit","fail","part","succ","tri"];

/* config.js — les tables de réglage.
   Portefeuilles, crans de dotation, jauges, rentes. Tout l'équilibrage tient
   ici ; le contenu narratif est dans nodes.js, pool.js, petits.js, injected.js. */

const STEPS = ["Abandonné","Famélique","Suffisant","Généreux","Fastueux"];

/* Tenir les six lignes à « Suffisant » coûte 24 quand l'année 1479 rapporte 9
   et une bonne année de 1487 dix-huit. On n'en tient jamais plus de deux ou
   trois : la répartition est le vrai arbitrage du jeu, et abandonner une ligne
   doit être un choix qu'on assume, pas un défaut de calcul.
   L'entretien suit ces coûts (voir ENTRETIEN_PAR_MARAVEDI) : une ligne plus
   chère entretient d'autant plus. */
const STEP_COST = [0,2,4,6,9];
const STEP_MOD  = [-14,-7,0,7,13];

/* Les lignes de budget portent le nom des jauges : financer une ligne, c'est
   entretenir la jauge du même nom, et rien d'autre à retenir. Le Royaume n'a
   pas de ligne — il n'est pas quelque chose qu'on achète, il résulte de tout
   le reste et des situations.

   `bloc` les range à l'écran : la couronne d'un côté, les trois ordres de
   l'autre, avec leurs totaux. */
const PF = [
  {k:"autorite", bloc:"couronne", n:"Pouvoir",
   d:"Justice, corregidores, armée, chancellerie. L'appareil qui obéit directement."},
  {k:"france",   bloc:"couronne", n:"France",
   d:"Envoyés, dots, cérémonial. Ce qui tient la France à distance."},
  {k:"noblesse", bloc:"ordres",   n:"Noblesse",
   d:"Offices, pensions, commanderies."},
  {k:"clerge",   bloc:"ordres",   n:"Clergé",
   d:"Fondations, évêchés, tribunaux du Saint-Office."},
  {k:"cortes",   bloc:"ordres",   n:"Bourgeoisie",
   d:"Chartes urbaines, secrétaires, lettrés, archives."}
];
const BLOCS = [
  {k:"couronne", n:"La couronne", d:"Ce que la couronne se donne à elle-même."},
  {k:"ordres",   n:"Les trois ordres", d:"Ce qu'on donne aux grands, à l'Église et aux villes. Trop leur donner disperse le pouvoir."}
];

/* La monnaie, pour que les chiffres se lisent comme des sommes. Un cuento vaut
   un million de maravédis : c'est l'unité dans laquelle la chancellerie compte
   réellement les recettes du royaume. */
const MONNAIE = "cuentos";
const MONNAIE_LONG = "cuentos de maravédis";

/* Deux groupes permanents, plus un troisième qui n'existe que s'il y a quelque
   chose dedans. Le trésor se suit à part : c'est un chiffre, pas un état. */
const GROUPES = [
  {k:"couronne", n:"La couronne"},
  {k:"ordres",   n:"Les ordres"},
  {k:"dehors",   n:"Crises et menaces"}
];

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

/* Chaque ligne consulte sa propre jauge : le Pouvoir décide des affaires de
   pouvoir, le Clergé des affaires d'Église. Il n'y a plus rien à traduire.
   Ce qui empêche la spirale n'est plus un croisement mais l'entretien : une
   ligne financée fait monter sa jauge quoi qu'il arrive, même au plus bas. */
const PORT_JAUGE = Object.fromEntries(PF.map(p=>[p.k,p.k]));

/* Ce que chaque ordre rend, et qui n'est pas la même chose :
     Noblesse    — la hueste sert à ses frais : elle allège la solde de guerre.
     Bourgeoisie — le servicio et les douanes : de l'argent ordinaire.
     Clergé      — les tercias, et la bulle de croisade, qui ne rentre que
                   tant qu'on fait la guerre. De l'argent de guerre.
   Et les trois ensemble font la stabilité du royaume. */
const ALLEGEMENT_HUESTE = 250;   // solde de guerre réduite de noblesse/250

/* L'entretien. Les situations font monter et descendre les jauges ; le budget
   est ce qui compense et pilote. Financer une ligne fait monter sa jauge quoi
   qu'il arrive, même quand tout échoue — c'est la seule garantie de pouvoir
   redresser, et c'est ce qui rend vivable le fait qu'une ligne consulte sa
   propre jauge. */
const PF_ENTRETIEN = Object.fromEntries(PF.map(p=>[p.k,p.k]));

/* Un demi-point par cuento. Le budget doit pouvoir corriger la dérive des
   situations sur la durée d'un règne — une quarantaine de points en neuf ans à
   pleine dotation — sans la dominer : à deux points par cuento, les jauges
   plafonnaient à cent en cinq ans et il n'y avait plus rien à piloter. */
const ENTRETIEN_PAR_MARAVEDI = 0.5;
const ABANDON = -3;
const derive = lvl => lvl===0 ? ABANDON : Math.max(1,Math.round(STEP_COST[lvl]*ENTRETIEN_PAR_MARAVEDI));
const DERIVE = STEPS.map((_,i)=>derive(i));   // [-3, +1, +2, +3, +5]

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
const LIGNES_COURONNE = ["autorite","france"];
const LIGNES_ORDRES   = ["noblesse","clerge","cortes"];
const CENTRALISATION_DIVISEUR = 3;
const CENTRALISATION_MAX = 5;

const BAND_NAMES = ["Échec grave","Échec","Demi-succès","Succès","Triomphe"];
const BAND_KEYS  = ["crit","fail","part","succ","tri"];

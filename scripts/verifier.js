/* verifier.js — contrôle d'intégrité du contenu, hors navigateur.

     node scripts/verifier.js

   Le jeu n'a ni compilation ni tests unitaires : c'est ce script qui tient
   lieu de filet. Il charge les données et le moteur dans un contexte isolé et
   vérifie ce qu'un oubli d'écriture casse silencieusement — une issue
   manquante, un exploit orphelin, un `inject` qui ne pointe nulle part.

   Sort en code 1 s'il trouve une erreur, 0 sinon. */

const fs = require("fs"), vm = require("vm"), path = require("path");
const R = path.join(__dirname, "..");

const FICHIERS = ["js/data/config.js","js/data/art.js","js/data/exploits.js","js/data/nodes.js",
                  "js/data/prologue.js","js/data/petits.js","js/data/pool.js","js/data/injected.js","js/state.js","js/rules.js","js/turn.js"];

// `const` en tête de script ne s'attache pas à globalThis : on concatène et on
// exporte explicitement, comme le fait le navigateur avec des scripts classiques.
const ctx = vm.createContext({Math, JSON, console, Object, Array, String, Number});
const src = FICHIERS.map(f => fs.readFileSync(path.join(R, f), "utf8")).join("\n;\n");
const X = vm.runInContext(src +
  "\n;({NODES,POOL,INJECTED,ART,EXPLOITS,GUERRES,PF,YEARS,BAND_KEYS,PORT_JAUGE,PROLOGUE,PETITS,GAUGES,JAUGE_CLE,PF_ENTRETIEN,ORDRES_ASSISE,ASSISE_DEPART,partCouronne,stabilite,S,bands,score})",
  ctx, {filename: "bundle.js"});

const err = [], warn = [];
const EFFETS = ["t","au","co","cl","pr","no","fr","flag","flag2","flag3",
                "inject","ch","perte","guerre","paix"];
const VOIES = ["historique","divergente","inouïe"];
const FORMES = [undefined,"normale","sure","extreme"];
const ports = new Set(X.PF.map(p => p.k));

const tous = [
  ...Object.entries(X.NODES).map(([y, e]) => [`nœud ${y}`, e]),
  ...X.POOL.map(e => [`tirage ${e.id}`, e]),
  ...Object.entries(X.INJECTED).map(([k, e]) => [`semé ${k}`, e]),
];

const ids = new Map(), marqueurs = new Set(), semes = new Set(), guerresCitees = new Set();

for (const [ou, e] of tous) {
  if (!e.id) err.push(`${ou} : pas d'id`);
  if (ids.has(e.id)) err.push(`${ou} : id « ${e.id} » déjà pris par ${ids.get(e.id)}`);
  ids.set(e.id, ou);
  if (!Array.isArray(e.body) || !e.body.length) err.push(`${ou} : body vide`);
  if (e.art && !X.ART[e.art]) err.push(`${ou} : œuvre inconnue « ${e.art} »`);
  if (!Array.isArray(e.opts) || e.opts.length < 2) err.push(`${ou} : moins de deux options`);

  (e.opts || []).forEach((o, i) => {
    const w = `${ou} opt[${i}]`;
    if (!o.label) err.push(`${w} : pas de label`);
    if (!VOIES.includes(o.voie)) err.push(`${w} : voie invalide « ${o.voie} »`);
    if (!ports.has(o.port)) err.push(`${w} : portefeuille inconnu « ${o.port} »`);
    if (typeof o.base !== "number") err.push(`${w} : base absente`);
    if (typeof o.cost !== "number") err.push(`${w} : cost absent`);
    if (!FORMES.includes(o.forme)) err.push(`${w} : forme inconnue « ${o.forme} »`);
    if (!X.PORT_JAUGE[o.port]) err.push(`${w} : portefeuille « ${o.port} » sans jauge associée`);
    if (!o.out) return err.push(`${w} : pas d'issues`);

    X.BAND_KEYS.forEach(k => {
      const r = o.out[k];
      if (!r) return err.push(`${w} : issue « ${k} » manquante — la bande casserait le tour`);
      if (!r.t) err.push(`${w}.${k} : pas de récit`);
      const eff = r.e || {};
      Object.keys(eff).forEach(key => {
        if (!EFFETS.includes(key)) err.push(`${w}.${k} : effet inconnu « ${key} »`);
      });
      [eff.flag, eff.flag2, eff.flag3].forEach(f => f && marqueurs.add(f));
      (eff.inject || []).forEach(id => { semes.add(id);
        if (!X.INJECTED[id]) err.push(`${w}.${k} : inject « ${id} » absent de injected.js`); });
      if (eff.perte && !X.EXPLOITS[eff.perte]) err.push(`${w}.${k} : perte « ${eff.perte} » n'est pas un exploit`);
      [eff.guerre, eff.paix].forEach(g => { if (g) { guerresCitees.add(g);
        if (!X.GUERRES[g]) err.push(`${w}.${k} : guerre « ${g} » absente de GUERRES`); } });
    });
  });
}

/* L'assise : une seule tarte. La somme des trois ordres ne peut pas dépasser
   cent, sinon la couronne ne tient plus rien. */
{
  const somme = X.ORDRES_ASSISE.reduce((a,g)=>a+X.ASSISE_DEPART[g],0);
  if (somme >= 100) err.push(`ASSISE_DEPART totalise ${somme} : il ne reste rien à la couronne`);
  X.ORDRES_ASSISE.forEach(g => {
    if (!X.GAUGES[g]) err.push(`ORDRES_ASSISE cite la jauge inconnue « ${g} »`);
    if (X.ASSISE_DEPART[g] === undefined) err.push(`« ${g} » n'a pas d'assise de départ`);
  });
  // Un exploit qui déplace de l'assise doit nommer des ordres réels.
  Object.entries(X.EXPLOITS).forEach(([k, e]) => {
    if (!e.as) return;
    Object.keys(e.as).forEach(c => {
      if (c !== "couronne" && !X.ORDRES_ASSISE.includes(c))
        err.push(`exploit « ${k} » déplace l'assise de « ${c} », qui n'est pas un ordre`);
    });
  });
  const sansAssise = Object.keys(X.EXPLOITS).filter(k => !X.EXPLOITS[k].as);
  if (sansAssise.length)
    warn.push(`${sansAssise.length} exploit(s) ne déplacent aucun pouvoir : ${sansAssise.slice(0,6).join(", ")}${sansAssise.length>6?"…":""}`);
}

// Chaque portefeuille doit avoir sa jauge, et chaque jauge servir à quelque chose.
Object.values(X.PORT_JAUGE).forEach(g => { if (!X.GAUGES[g]) err.push(`PORT_JAUGE pointe vers la jauge inconnue « ${g} »`); });
Object.keys(X.GAUGES).forEach(g => {
  if (X.GAUGES[g].gr === "dehors") return;
  /* Une jauge doit servir à quelque chose, mais pas forcément à conditionner
     un portefeuille : la noblesse allège la solde de guerre, le clergé lève la
     croisade, et les trois ordres font la stabilité. */
  const commande = Object.values(X.PORT_JAUGE).includes(g);
  const rapporte = X.ORDRES_ASSISE.includes(g) || ["prosperite"].includes(g);
  const ordre = X.GAUGES[g].gr === "ordres";
  if (!commande && !rapporte && !ordre) warn.push(`la jauge « ${g} » ne sert à rien : ni seuil, ni rente, ni stabilité`);
  if (!X.GAUGES[g].w || X.GAUGES[g].w.length !== 5) err.push(`la jauge « ${g} » n'a pas cinq mots`);
});

/* L'invariant du couplage. Une ligne de budget consulte sa propre jauge, et
   ses réussites la font monter : c'est une boucle de rétroaction, assumée
   depuis que les lignes portent le nom des jauges. Ce qui la rend vivable est
   l'entretien — une ligne financée fait monter sa jauge quoi qu'il arrive,
   même quand tout échoue. Une boucle SANS entretien est en revanche une
   spirale sans sortie : c'est elle qu'on refuse. */
X.PF.forEach(p => {
  const gate = X.PORT_JAUGE[p.k];
  const mouv = {};
  tous.forEach(([, e]) => (e.opts || []).filter(o => o.port === p.k).forEach(o =>
    X.BAND_KEYS.forEach(k => {
      const eff = (o.out[k] || {}).e || {};
      Object.keys(X.JAUGE_CLE).forEach(c => { if (eff[c]) mouv[X.JAUGE_CLE[c]] = (mouv[X.JAUGE_CLE[c]] || 0) + eff[c]; });
    })));
  const classe = Object.entries(mouv).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const boucle = classe.length && classe[0][0] === gate;
  if (boucle && X.PF_ENTRETIEN[p.k] !== gate)
    err.push(`« ${p.n} » consulte ${gate}, ses issues nourrissent ${gate}, et aucun entretien ne permet d'en sortir — spirale sans issue`);
});

// Toute ligne de budget doit entretenir une jauge, sinon la dépense ne
// construit rien de durable.
X.PF.forEach(p => {
  if (!X.PF_ENTRETIEN[p.k]) warn.push(`la ligne « ${p.n} » n'entretient aucune jauge`);
});

// Les petits événements : résolus sans dé, effets minces.
X.PETITS.forEach((e, i) => {
  const w = `petit ${e.id || i}`;
  if (!e.id || !e.t || !e.place || !e.body) err.push(`${w} : champ manquant`);
  if (!Array.isArray(e.years) || !e.years.length) err.push(`${w} : years manquant`);
  (e.years || []).forEach(y => { if (!X.YEARS.includes(y)) err.push(`${w} : année ${y} hors acte`); });
  if (!Array.isArray(e.opts) || e.opts.length < 2 || e.opts.length > 3)
    err.push(`${w} : il faut deux ou trois réponses, pas ${(e.opts||[]).length}`);
  (e.opts || []).forEach((o, j) => {
    if (!o.label || !o.txt) err.push(`${w} opt[${j}] : label ou résultat manquant`);
    Object.keys(o.e || {}).forEach(k => {
      if (!EFFETS.includes(k)) err.push(`${w} opt[${j}] : effet inconnu « ${k} »`);
      if (typeof (o.e||{})[k] === "number" && Math.abs(o.e[k]) > 3)
        err.push(`${w} opt[${j}] : effet « ${k} » de ${o.e[k]} — les petits événements doivent rester négligeables`);
    });
  });
});
X.YEARS.forEach(y => {
  const n = X.PETITS.filter(e => e.years.includes(y)).length;
  if (n < 5) warn.push(`${y} : seulement ${n} petit(s) événement(s) — il en faut 3 à 5 par année`);
});

// Prologue : trois décisions sèches, avant 1479.
X.PROLOGUE.forEach((p, i) => {
  const w = `prologue[${i}] ${p.y}`;
  if (!p.t || !p.body || !p.place) err.push(`${w} : titre, lieu ou corps manquant`);
  if (!Array.isArray(p.opts) || p.opts.length < 2) err.push(`${w} : moins de deux décisions`);
  (p.opts || []).forEach((o, j) => {
    if (!o.label || !o.note) err.push(`${w} opt[${j}] : label ou glose manquant`);
    const eff = o.e || {};
    if (!Object.keys(eff).length) err.push(`${w} opt[${j}] : décision sans effet`);
    Object.keys(eff).forEach(k => {
      if (!EFFETS.includes(k)) err.push(`${w} opt[${j}] : effet inconnu « ${k} »`);
    });
    [eff.flag, eff.flag2, eff.flag3].forEach(f => f && marqueurs.add(f));
  });
});
const anneesPro = X.PROLOGUE.map(p => p.y);
if (X.PROLOGUE.length !== 3) warn.push(`le prologue compte ${X.PROLOGUE.length} décisions au lieu de trois`);
anneesPro.forEach(y => { if (X.YEARS.includes(y)) err.push(`prologue ${y} : cette année est aussi jouée`); });

// Années
X.POOL.forEach(e => {
  if (!Array.isArray(e.years) || !e.years.length) return err.push(`tirage ${e.id} : years manquant`);
  e.years.forEach(y => { if (!X.YEARS.includes(y)) err.push(`tirage ${e.id} : année ${y} hors acte I`); });
});
X.YEARS.forEach(y => {
  const n = X.POOL.filter(e => e.years.includes(y)).length;
  if (!X.NODES[y]) warn.push(`aucun nœud historique pour ${y}`);
  if (n < 3) warn.push(`${y} : seulement ${n} tirage(s) disponible(s) — les années chargées manqueront de matière`);
});

// Exploits ↔ marqueurs
Object.keys(X.EXPLOITS).forEach(k => {
  if (!marqueurs.has(k)) err.push(`exploit « ${k} » n'est posé par aucune issue — il est inatteignable`);
  const e = X.EXPLOITS[k];
  if (!e.n || !e.d) err.push(`exploit « ${k} » : nom ou glose manquant`);
  if (typeof e.vp !== "number") err.push(`exploit « ${k} » : vp absent`);
  if (e.perte && typeof e.perte.vp !== "number") err.push(`exploit « ${k} » : perte sans vp`);
});
// Un marqueur sans entrée dans EXPLOITS est normal : tout ce qui réussit ne
// mérite pas d'être un exploit. On ne vérifie que l'inverse.
Object.keys(X.INJECTED).forEach(k => {
  if (!semes.has(k) && k !== "invasion_francaise") warn.push(`semé « ${k} » n'est déclenché par aucune issue`);
});
Object.keys(X.GUERRES).forEach(k => {
  if (!guerresCitees.has(k)) warn.push(`guerre « ${k} » déclarée mais jamais déclenchée`);
});

// Les cinq largeurs doivent toujours totaliser 100, sinon une bande est perdue.
["normale","sure","extreme"].forEach(f => {
  for (let T = 3; T <= 97; T++) {
    const s = X.bands(T, f).reduce((a, b) => a + b, 0);
    if (Math.abs(s - 100) > 1e-9) { err.push(`bands(${T}, ${f}) totalise ${s} au lieu de 100`); break; }
  }
});

// req() doit s'exécuter sans lever sur un état de départ.
tous.forEach(([ou, e]) => {
  if (e.req) { try { e.req(X.S); } catch (x) { err.push(`${ou} : req() lève « ${x.message} »`); } }
});

const n = tous.length, nOpts = tous.reduce((s, e) => s + e[1].opts.length, 0);
const nPro = X.PROLOGUE.reduce((s, p) => s + p.opts.length, 0);
console.log(`${n} situations · ${nOpts} options · ${X.PROLOGUE.length} décisions de prologue (${nPro} choix) · ${Object.keys(X.EXPLOITS).length} exploits · ${marqueurs.size} marqueurs`);
console.log(`\nERREURS (${err.length})`); err.forEach(e => console.log("  ✗ " + e));
console.log(`\nAVERTISSEMENTS (${warn.length})`); warn.forEach(w => console.log("  · " + w));
process.exit(err.length ? 1 : 0);

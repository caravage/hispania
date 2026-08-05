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
                  "js/data/pool.js","js/data/injected.js","js/state.js","js/rules.js","js/turn.js"];

// `const` en tête de script ne s'attache pas à globalThis : on concatène et on
// exporte explicitement, comme le fait le navigateur avec des scripts classiques.
const ctx = vm.createContext({Math, JSON, console, Object, Array, String, Number});
const src = FICHIERS.map(f => fs.readFileSync(path.join(R, f), "utf8")).join("\n;\n");
const X = vm.runInContext(src +
  "\n;({NODES,POOL,INJECTED,ART,EXPLOITS,GUERRES,PF,YEARS,BAND_KEYS,PORT_JAUGE,S,bands,score})",
  ctx, {filename: "bundle.js"});

const err = [], warn = [];
const EFFETS = ["t","au","co","pr","no","fr","flag","flag2","flag3",
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
console.log(`${n} situations · ${nOpts} options · ${Object.keys(X.EXPLOITS).length} exploits · ${marqueurs.size} marqueurs`);
console.log(`\nERREURS (${err.length})`); err.forEach(e => console.log("  ✗ " + e));
console.log(`\nAVERTISSEMENTS (${warn.length})`); warn.forEach(w => console.log("  · " + w));
process.exit(err.length ? 1 : 0);

/* rules.js — le moteur. Aucun DOM ici.

   La manière (prudent / équilibré / audacieux) a été retirée : l'arbitrage
   entre sûreté et audace se fait à la répartition, et le choix de la réponse
   est déjà un choix de manière. Une seconde décision sur l'intensité ne
   faisait que doubler les clics.

   La divergence a été retirée aussi. Elle abaissait tous les seuils jusqu'à
   −12 en plus d'être un compteur : une pénalité générale, invisible dans ses
   effets et lisible comme un score. Les voies non historiques ne coûtent plus
   que par leur difficulté propre. */

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));


/* La bande de résolution. Cinq largeurs qui totalisent 100.
   `forme` appartient à l'option, pas au joueur : certaines entreprises sont
   par nature sans surprise, d'autres jouent les extrêmes. La forme par défaut
   couvre l'immense majorité des cas. */
function bands(T,forme){
  const S=clamp(T,3,97), F=100-S;
  if(forme==="sure")    return [0, F*.55, F*.45+S*.35, S*.65, 0];
  if(forme==="extreme") return [F*.55, F*.30, F*.15+S*.20, S*.35, S*.45];
  return [F*.25, F*.55, F*.20+S*.25, S*.60, S*.15];
}
const reussite = w => w[3]+w[4];


/* Le seuil, et sa justification ligne à ligne. */
function computeThreshold(opt){
  const rows=[];
  let T=opt.base;
  rows.push(["Difficulté de l'entreprise",opt.base]);

  const lvl=S.budget[opt.port];
  const m=STEP_MOD[lvl];
  rows.push([PF.find(p=>p.k===opt.port).n+" — "+STEPS[lvl], m]); T+=m;

  const adm=Math.round((S.budget.admin-2)*4);
  if(adm!==0 && opt.port!=="admin"){ rows.push(["Secrétaires et archives",adm]); T+=adm; }

  const key=PORT_JAUGE[opt.port];
  const gm=Math.round((S.g[key]-50)/5);
  if(gm!==0){ rows.push([GAUGES[key].n+" — "+word(key,S.g[key]),gm]); T+=gm; }

  // Une entreprise qu'on ne peut pas financer se mène quand même, mal.
  const mq=manque(opt);
  if(mq>0){ const p=-Math.min(20,mq*4); rows.push(["Engagée sans les moyens",p]); T+=p; }

  return {T:clamp(Math.round(T),3,97), rows};
}


/* ---------- l'argent ----------
   Le trésor ne peut jamais fermer un tour : on paie ce qu'on a, et ce qui
   manque devient une pénalité de seuil (voir computeThreshold). Être à sec ne
   rend donc plus les décisions gratuites — c'est l'inverse. */
const coutBrut = o => o.cost;
function costOf(o){ return Math.max(0,Math.min(o.cost, S.tresor)); }
function manque(o){ return Math.max(0, o.cost - Math.max(0,S.tresor)); }

function budgetCost(b){ return PF.reduce((s,p)=>s+STEP_COST[b[p.k]],0); }

/* On peut engager la couronne au-delà de la caisse, une fois. Si la dette
   n'est pas résorbée à la fin de l'année, elle se paie en autorité et en
   crédit — les prêteurs et les capitaines s'en aperçoivent. */
const DETTE_MAX = 12;
function detteAutorisee(){ return S.detteAnnee ? 0 : DETTE_MAX; }

function soldeDette(){
  if(S.tresor>=0) return null;
  const d=-S.tresor;
  const eff=[];
  S.g.autorite=clamp(S.g.autorite-Math.min(10,3+Math.round(d/3)),0,100);
  S.g.noblesse=clamp(S.g.noblesse-Math.min(8,2+Math.round(d/4)),0,100);
  eff.push(d);
  S.detteAnnee=true;
  return d;
}


/* Les rentrées, poste par poste. Rend le détail pour que l'écran puisse le
   montrer : le joueur doit savoir d'où vient son argent, donc ce qu'il abîme
   quand il abîme une jauge. */
function rentes(){
  const lignes=[];
  const tercias = 4 + S.idx*0.4;
  RENTES.forEach(r=>{
    const v = r.g ? S.g[r.g]*r.part : tercias;
    lignes.push({n:r.n, d:r.d, v:Math.round(v)});
  });
  let total=lignes.reduce((s,l)=>s+l.v,0);

  const reformes=[];
  // Volontairement modestes : une réforme doit se sentir, pas dispenser de
  // gouverner. Six réformes acquises valent moins qu'une jauge bien tenue.
  const bonus={declaratoire:3, impot_laines:2, contrat_cortes:2,
               monnaie_saine:2, consulat_burgos:2, bulle_croisade:2,
               ordres_couronne:3, greniers_royaux:1};
  Object.keys(bonus).forEach(f=>{ if(S.flags[f]){
    total+=bonus[f]; reformes.push({n:EXPLOITS[f]?EXPLOITS[f].n:f, v:bonus[f]}); }});

  const alea = .9 + Math.random()*.2;
  total = Math.max(4, Math.round(total*alea));
  return {total, lignes, reformes};
}

function rentrees(){
  const finies=guerresEchues();
  const r=rentes();
  S.revenu=r.total; S.detailRentes=r;
  S.solde=soldeGuerres();
  S.tresor=S.tresor+S.revenu-S.solde;
  /* La dette effacée rend le crédit. Sans cela, un seul emprunt interdisait
     d'emprunter pour le reste du règne, ce qui n'est ni juste ni jouable. */
  if(S.tresor>=0) S.detteAnnee=false;
  return finies;
}


/* ---------- les guerres ----------
   Un état qui dure : solde annuelle, situation imposée chaque année, fin datée. */
const GUERRES = {
  grenade:{n:"la guerre de Grenade", solde:8, evts:1,
    d:"La frontière du sud est ouverte et ne se refermera pas seule."},
  france:{n:"la guerre de France", solde:9, evts:1,
    d:"La France a passé les Pyrénées."}
};
const nomGuerre = k => GUERRES[k] ? GUERRES[k].n : k;
const enGuerre = () => Object.keys(S.guerres);
function soldeGuerres(){
  return enGuerre().reduce((s,k)=>s+(GUERRES[k]?GUERRES[k].solde:0),0);
}
function guerresEchues(){
  const finies=[];
  enGuerre().forEach(k=>{
    const g=GUERRES[k];
    if(g && g.finAuPlusTard && S.year>=g.finAuPlusTard){
      S.paix[k]={debut:S.guerres[k], fin:S.year}; delete S.guerres[k]; finies.push(k);
    }
  });
  return finies;
}

const SEUIL_GUERRE_FRANCE = 12;
function menaceFrance(){
  return !S.guerres.france && !S.paix.france && S.g.france<=SEUIL_GUERRE_FRANCE;
}


/* ---------- effets ----------
   apply() rend une liste d'objets décrivant ce qui a bougé, pas des chaînes :
   l'écran de résolution a besoin de savoir si une jauge a seulement glissé
   (une flèche suffit) ou si elle a changé de palier (il faut le dire). */
const JAUGE_CLE = {au:"autorite", no:"noblesse", pr:"prosperite", co:"cortes", fr:"france"};

function apply(e){
  const out=[];
  if(e.t){ S.tresor+=e.t; out.push({type:"tresor", n:"Trésor", v:e.t}); }

  Object.keys(JAUGE_CLE).forEach(k=>{
    if(!e[k]) return;
    const g=JAUGE_CLE[k], av=S.g[g];
    S.g[g]=clamp(av+e[k],0,100);
    out.push({type:"jauge", g, n:GAUGES[g].n, av, ap:S.g[g],
      palAv:palier(av), palAp:palier(S.g[g]),
      motAv:word(g,av), motAp:word(g,S.g[g]), sens:Math.sign(e[k])});
  });

  [e.flag,e.flag2,e.flag3].forEach(f=>{
    if(!f) return;
    S.flags[f]=true;
    if(EXPLOITS[f] && !S.exploits[f] && !S.perdus[f]){
      S.exploits[f]=S.year;
      out.push({type:"exploit", n:EXPLOITS[f].n, mauvais:EXPLOITS[f].vp<0});
    }
  });

  if(e.perte && S.exploits[e.perte]){
    delete S.exploits[e.perte]; delete S.flags[e.perte];
    S.perdus[e.perte]=S.year;
    out.push({type:"perte", n:EXPLOITS[e.perte].n});
  }

  if(e.guerre && !S.guerres[e.guerre] && !S.paix[e.guerre]){
    S.guerres[e.guerre]=S.year; out.push({type:"guerre", n:nomGuerre(e.guerre)});
  }
  if(e.paix && S.guerres[e.paix]){
    S.paix[e.paix]={debut:S.guerres[e.paix], fin:S.year};
    delete S.guerres[e.paix]; out.push({type:"paix", n:nomGuerre(e.paix)});
  }

  if(e.inject)e.inject.forEach(i=>S.queue.push(i));
  if(e.ch)S.chronicle.push({y:S.year,txt:e.ch});
  return out;
}

function undo(eff,e){
  if(e.t)S.tresor-=e.t;
  Object.keys(JAUGE_CLE).forEach(k=>{
    if(e[k])S.g[JAUGE_CLE[k]]=clamp(S.g[JAUGE_CLE[k]]-e[k],0,100);
  });
  [e.flag,e.flag2,e.flag3].forEach(f=>{if(f){delete S.flags[f]; delete S.exploits[f];}});
  if(e.perte && S.perdus[e.perte]){
    delete S.perdus[e.perte];
    S.exploits[e.perte]=S.year; S.flags[e.perte]=true;
  }
  if(e.guerre && S.guerres[e.guerre]===S.year) delete S.guerres[e.guerre];
  if(e.paix && S.paix[e.paix]){ S.guerres[e.paix]=S.paix[e.paix].debut; delete S.paix[e.paix]; }
  if(e.ch)S.chronicle=S.chronicle.filter(c=>c.txt!==e.ch);
  if(e.inject)e.inject.forEach(i=>{const k=S.queue.lastIndexOf(i); if(k>-1)S.queue.splice(k,1)});
}


/* Ce que vaut le règne. Uniquement les exploits : il n'y a plus de points de
   conduite courante, qui récompensaient le fait de jouer plutôt que le fait
   de réussir quelque chose de notable. */
function score(){
  const lignes=[];
  let total=0;
  Object.keys(S.exploits).forEach(k=>{
    lignes.push({n:EXPLOITS[k].n, d:EXPLOITS[k].d, vp:EXPLOITS[k].vp, y:S.exploits[k]});
    total+=EXPLOITS[k].vp;
  });
  Object.keys(S.perdus).forEach(k=>{
    const p=EXPLOITS[k].perte||{vp:0,d:""};
    lignes.push({n:EXPLOITS[k].n, d:p.d, vp:p.vp, y:S.perdus[k], perdu:true});
    total+=p.vp;
  });
  lignes.sort((a,b)=>b.vp-a.vp);
  return {total, lignes};
}

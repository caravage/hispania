/* rules.js — le moteur. Aucun DOM ici.
   bands()            forme du risque selon le seuil et la manière
   computeThreshold() le seuil et le détail de son calcul
   apply() / undo()   effets d'une issue, et leur annulation pour la relance
   revenue()          rentrées de l'année
   budgetCost()       coût d'une répartition */

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* La bande de résolution.
   Rend cinq largeurs qui totalisent 100 : échec grave, échec, demi-succès,
   succès, triomphe. Le seuil T répartit l'espace entre échec (F) et réussite (S) ;
   la manière décide de la forme. Prudent annule les extrêmes, audacieux les
   élargit au détriment du milieu. L'audace n'est pas meilleure — elle est
   plus variable, et c'est tout l'intérêt du choix. */
function bands(T,risk){
  const S=clamp(T,3,97), F=100-S;   // S masque volontairement l'état global : calcul pur
  if(risk==="prudent")   return [0, F*.65, F*.35+S*.45, S*.55, 0];
  if(risk==="audacieux") return [F*.55, F*.30, F*.15+S*.20, S*.35, S*.45];
  return [F*.25, F*.55, F*.20+S*.25, S*.60, S*.15];
}


/* Le seuil, et sa justification ligne à ligne.
   Rend {T, rows} : rows est affiché tel quel dans le dépliant « détail du seuil ».
   Le joueur doit pouvoir vérifier chaque point. */
function computeThreshold(opt,risk){
  const rows=[];
  let T=opt.base;
  rows.push(["Difficulté de l'entreprise",opt.base]);

  const lvl=S.budget[opt.port];
  const m=STEP_MOD[lvl];
  rows.push([PF.find(p=>p.k===opt.port).n+" — "+STEPS[lvl], m]); T+=m;

  const adm=Math.round((S.budget.admin-2)*4);
  if(adm!==0 && opt.port!=="admin"){ rows.push(["Secrétaires et archives",adm]); T+=adm; }

  const key = opt.port==="justice"?"autorite": opt.port==="foi"?"rome":
              opt.port==="cour"?"noblesse": opt.port==="admin"?"cortes":"autorite";
  const gm=Math.round((S.g[key]-50)/5);
  if(gm!==0){ rows.push([GAUGES[key].n+" — "+word(key,S.g[key]),gm]); T+=gm; }

  if(opt.voie==="hérétique"){ rows.push(["Sans précédent connu",-6]); T-=6; }
  // Plafonnée : l'inconnu doit gêner, pas rendre tout impossible en fin d'acte.
  const dm=-Math.min(12,Math.round(S.divergence*.4));
  if(dm!==0){ rows.push(["Le royaume ne sait plus ce qui est normal",dm]); T+=dm; }

  const rm=RISK[risk].seuil;
  if(rm!==0){ rows.push(["Manière — "+RISK[risk].n,rm]); T+=rm; }

  return {T:clamp(Math.round(T),3,97), rows};
}

/* Applique les effets d'une issue et rend la liste lisible à afficher.
   Les jauges sont rendues en mots (« méfiants → ralliés »), jamais en chiffres :
   l'incertitude sur son propre pouvoir est historiquement juste. */
function apply(e){
  const out=[];
  const map={t:["Trésor",v=>{S.tresor=Math.max(0,S.tresor+v)}],
             au:["Autorité","autorite"],co:["Cortès","cortes"],ro:["Rome","rome"],
             pr:["Royaume","prosperite"],no:["Les grands","noblesse"]};
  if(e.t){S.tresor=Math.max(0,S.tresor+e.t); out.push(["Trésor",(e.t>0?"+":"")+e.t]);}
  ["au","co","ro","pr","no"].forEach(k=>{
    if(e[k]){const g=map[k][1]; const before=S.g[g]; S.g[g]=clamp(S.g[g]+e[k],0,100);
      out.push([map[k][0], word(g,before)+" → "+word(g,S.g[g])]);}
  });
  if(e.dv){S.divergence+=e.dv; out.push(["Divergence","+"+e.dv]);}
  [e.flag,e.flag2,e.flag3].forEach(f=>{if(f)S.flags[f]=true});
  if(e.inject)e.inject.forEach(i=>S.queue.push(i));
  if(e.ch)S.chronicle.push({y:S.year,txt:e.ch});
  return out;
}

/* Rentrées ordinaires de l'année. Base croissante, corrigée par l'état du
   royaume, le consentement des Cortès et l'autorité, plus un aléa de ±15 %.
   Les réformes fiscales acquises s'y ajoutent en dur. */
function revenue(){
  // Calibré pour qu'en 1474 on tienne à peine six portefeuilles à « Suffisant »
  // (12 du trésor) et qu'en 1482 un règne bien mené en tienne trois à « Généreux ».
  const base = 6 + S.idx*1.6;
  const p = S.g.prosperite/9;
  const c = S.g.cortes/16;
  const a = S.g.autorite/18;
  const noise = .85 + Math.random()*.3;
  let r = Math.round((base+p+c+a)*noise);
  if(S.flags.declaratoire) r+=6;
  if(S.flags.impot_laines) r+=5;
  if(S.flags.contrat_cortes) r+=5;
  if(S.flags.precedent_fiscal) r+=4;
  if(S.flags.inquisition) r+=3;
  if(S.flags.bulle_croisade) r+=5;
  return Math.max(4,r);
}

function budgetCost(b){ return PF.reduce((s,p)=>s+STEP_COST[b[p.k]],0); }


/* Le trésor ne doit jamais pouvoir fermer un tour.
   Une répartition qui vide la bourse est un choix légitime — c'est même la
   tentation de la première année. Mais si plus aucune option n'est payable,
   l'écran de situation n'a plus un seul bouton vivant et la partie se fige.
   minCost() rend la dépense la plus basse que la situation admette, toutes
   manières confondues ; quand même celle-là dépasse la réserve, costOf()
   ramène le prix à ce qui reste. La couronne racle ses fonds : elle décide
   toujours, elle décide sans rien. Hors de ce cas, le prix est inchangé. */
function minCost(ev){
  let m=Infinity;
  ev.opts.forEach(o=>Object.keys(RISK).forEach(r=>{m=Math.min(m,Math.round(o.cost*RISK[r].coutx))}));
  return m;
}
function ruined(ev){ return minCost(ev)>S.tresor; }
function costOf(o,risk,ev){
  const c=Math.round(o.cost*RISK[risk].coutx);
  return ruined(ev)?Math.min(c,S.tresor):c;
}


/* Annule exactement ce qu'a posé apply(). Sert à la Fortune : la relance
   doit remettre le monde dans l'état d'avant le jet, flags et chronique compris. */
function undo(eff,e){
  if(e.t)S.tresor-=e.t;
  const g={au:"autorite",co:"cortes",ro:"rome",pr:"prosperite",no:"noblesse"};
  Object.keys(g).forEach(k=>{if(e[k])S.g[g[k]]=clamp(S.g[g[k]]-e[k],0,100)});
  if(e.dv)S.divergence-=e.dv;
  [e.flag,e.flag2,e.flag3].forEach(f=>{if(f)delete S.flags[f]});
  if(e.ch)S.chronicle=S.chronicle.filter(c=>c.txt!==e.ch);
  if(e.inject)e.inject.forEach(i=>{const k=S.queue.lastIndexOf(i); if(k>-1)S.queue.splice(k,1)});
}

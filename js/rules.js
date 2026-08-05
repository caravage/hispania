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
  // Prudent était dominé : il réussissait moins souvent qu'Équilibré à tous les
  // seuils ET coûtait 1,6×. Il n'achetait rien. Redressé, il rend maintenant à
  // peu près la même réussite, meilleure sur les entreprises difficiles et un
  // peu moindre sur les faciles, sans jamais de désastre ni de triomphe.
  if(risk==="prudent")   return [0, F*.55, F*.45+S*.35, S*.65, 0];
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

  // Chaque portefeuille est adossé à la jauge qui commande réellement ses
  // affaires. Guerre reste sur l'autorité — on obéit ou non à l'ordre de lever.
  const key = opt.port==="justice"?"autorite": opt.port==="foi"?"rome":
              opt.port==="cour"?"noblesse": opt.port==="admin"?"cortes":
              opt.port==="diplomatie"?"france":"autorite";
  const gm=Math.round((S.g[key]-50)/5);
  if(gm!==0){ rows.push([GAUGES[key].n+" — "+word(key,S.g[key]),gm]); T+=gm; }

  if(opt.voie==="inouïe"){ rows.push(["Sans précédent connu",-6]); T-=6; }
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
  if(e.fr){const b=S.g.france; S.g.france=clamp(S.g.france+e.fr,0,100);
    out.push(["France", word("france",b)+" → "+word("france",S.g.france)]);}
  if(e.dv){S.divergence+=e.dv; out.push(["Divergence","+"+e.dv]);}

  /* Un marqueur qui a son entrée dans EXPLOITS devient un acquis du règne.
     C'est ce branchement — et lui seul — qui donne un poids aux marqueurs :
     les issues n'ont pas eu à être réécrites. */
  [e.flag,e.flag2,e.flag3].forEach(f=>{
    if(!f) return;
    S.flags[f]=true;
    if(EXPLOITS[f] && !S.exploits[f] && !S.perdus[f]){
      S.exploits[f]=S.year;
      out.push([EXPLOITS[f].vp<0?"Échec durable":"Exploit", EXPLOITS[f].n]);
    }
  });

  /* Une reprise. Ne fait rien si l'acquis n'a jamais été obtenu — on ne perd
     que ce qu'on a tenu, et c'est ce qui rend la perte coûteuse. */
  if(e.perte && S.exploits[e.perte]){
    delete S.exploits[e.perte]; delete S.flags[e.perte];
    S.perdus[e.perte]=S.year;
    out.push(["Perdu", EXPLOITS[e.perte].n]);
  }

  if(e.guerre && !S.guerres[e.guerre]){ S.guerres[e.guerre]=S.year;
    out.push(["Entrée en guerre", nomGuerre(e.guerre)]); }
  /* La paix ne supprime pas la guerre, elle la conclut : on garde l'année
     d'entrée et l'année de sortie. Le bilan les cite, et undo() peut rendre
     exactement l'état d'avant. */
  if(e.paix && S.guerres[e.paix]){
    S.paix[e.paix]={debut:S.guerres[e.paix], fin:S.year};
    delete S.guerres[e.paix];
    out.push(["Paix", nomGuerre(e.paix)]);
  }

  if(e.inject)e.inject.forEach(i=>S.queue.push(i));
  if(e.ch)S.chronicle.push({y:S.year,txt:e.ch});
  return out;
}

/* Ce que vaut le règne. Les exploits tenus rapportent, les exploits repris
   retirent leurs points ET appliquent leur malus, le fond de tableau vient des
   issues elles-mêmes (BAND_VP). Rend le total et le détail, pour que le bilan
   puisse montrer ligne à ligne d'où viennent les points. */
function score(){
  const lignes=[];
  let total=S.vp;
  if(S.vp) lignes.push({n:"Conduite des affaires", d:"Ce que les entreprises du règne ont valu, issue par issue.", vp:S.vp});
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


/* ---------- les guerres ----------
   Une guerre n'est pas un marqueur : c'est un état qui dure, qui coûte tous
   les ans et qui charge le calendrier tant qu'il n'est pas conclu. C'est la
   première donnée du jeu qui ait un début et une fin, et pas seulement une
   existence. `solde` est le prélèvement annuel, `evts` ce qu'elle ajoute de
   situations à l'année. */
const GUERRES = {
  /* finAuPlusTard : la guerre de Succession se conclut à Alcáçovas quoi qu'il
     arrive. Sans cette borne, un joueur qui rate Toro traînerait la solde et la
     situation supplémentaire jusqu'en 1482 — une spirale dont il ne pourrait
     plus sortir. La victoire à Toro reste très payante : elle avance la paix
     de quatre ans. */
  portugal:{n:"la guerre de Succession", solde:5, evts:1, finAuPlusTard:1480,
    d:"Alphonse V est entré en Castille au nom de sa nièce."},
  france:{n:"la guerre de France", solde:7, evts:1,
    d:"Louis XI a passé les Pyrénées."},
  grenade:{n:"la guerre de Grenade", solde:6, evts:1,
    d:"La frontière du sud est ouverte et ne se refermera pas seule."}
};
const nomGuerre = k => GUERRES[k] ? GUERRES[k].n : k;
const enGuerre = () => Object.keys(S.guerres);

/* Prélevé au moment des rentrées, avant la répartition : le joueur voit ce
   que la guerre lui prend avant de répartir ce qui reste. */
function soldeGuerres(){
  return enGuerre().reduce((s,k)=>s+(GUERRES[k]?GUERRES[k].solde:0),0);
}

/* Les rentrées de l'année, guerres déduites. Appelé au passage d'une année à
   la suivante : le joueur voit ce que la guerre lui prend avant de répartir ce
   qui reste. Rend les guerres conclues d'elles-mêmes, pour la chronique. */
function rentrees(){
  const finies=guerresEchues();
  S.revenu=revenue();
  S.solde=soldeGuerres();
  S.tresor=Math.max(0,S.tresor+S.revenu-S.solde);
  return finies;
}

/* Les guerres qui ont une échéance historique se concluent d'elles-mêmes.
   Appelé au passage à l'année suivante. Rend la liste des paix signées, pour
   que la chronique puisse les mentionner. */
function guerresEchues(){
  const finies=[];
  enGuerre().forEach(k=>{
    const g=GUERRES[k];
    if(g && g.finAuPlusTard && S.year>=g.finAuPlusTard){
      S.paix[k]={debut:S.guerres[k], fin:S.year}; delete S.guerres[k];
      finies.push(k);
    }
  });
  return finies;
}

/* La France entre en Castille quand la relation tombe assez bas. Elle ne
   prévient pas et elle n'attend pas l'année suivante : c'est le prix de
   l'avoir contrariée sans la surveiller. */
const SEUIL_GUERRE_FRANCE = 12;
function menaceFrance(){
  return !S.guerres.france && !S.paix.france && S.g.france<=SEUIL_GUERRE_FRANCE;
}


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
  const g={au:"autorite",co:"cortes",ro:"rome",pr:"prosperite",no:"noblesse",fr:"france"};
  Object.keys(g).forEach(k=>{if(e[k])S.g[g[k]]=clamp(S.g[g[k]]-e[k],0,100)});
  if(e.dv)S.divergence-=e.dv;
  [e.flag,e.flag2,e.flag3].forEach(f=>{if(f){delete S.flags[f]; delete S.exploits[f];}});
  /* Une perte annulée doit rendre l'acquis, sinon la Fortune détruirait
     définitivement ce qu'elle est censée sauver. */
  if(e.perte && S.perdus[e.perte]){
    delete S.perdus[e.perte];
    S.exploits[e.perte]=S.year; S.flags[e.perte]=true;
  }
  if(e.guerre && S.guerres[e.guerre]===S.year) delete S.guerres[e.guerre];
  if(e.paix && S.paix[e.paix]){ S.guerres[e.paix]=S.paix[e.paix].debut; delete S.paix[e.paix]; }
  if(e.ch)S.chronicle=S.chronicle.filter(c=>c.txt!==e.ch);
  if(e.inject)e.inject.forEach(i=>{const k=S.queue.lastIndexOf(i); if(k>-1)S.queue.splice(k,1)});
}

/* Ce que l'issue elle-même vaut au bilan, avant tout exploit. Séparé de
   apply() parce que la bande n'est pas un effet écrit dans les données :
   c'est le résultat du jet. Les deux sens existent, pour la Fortune. */
function scoreBand(bi){ S.vp += BAND_VP[bi]; return BAND_VP[bi]; }
function unscoreBand(bi){ S.vp -= BAND_VP[bi]; }

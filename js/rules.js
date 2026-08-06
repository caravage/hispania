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

/* ---------- l'assise ----------
   La part de la couronne est ce qui reste quand les trois ordres ont pris la
   leur. C'est la seule mesure du jeu qui monte vraiment sur neuf ans, et c'est
   la montée en puissance : d'un quart du royaume en 1479 à la moitié pour un
   règne qui a repris ce qu'Henri IV avait donné. */
function partCouronne(){
  return clamp(100 - ORDRES_ASSISE.reduce((a,g)=>a+S.assise[g],0), 0, 100);
}
const MOTS_COURONNE = ["royaume disputé","royaume partagé","royaume affermi",
                       "puissance de la péninsule","puissance d'Occident"];
const motCouronne = () => MOTS_COURONNE[Math.min(4,Math.floor(partCouronne()/13))];

/* Déplace de l'assise. Deux façons de l'écrire :
     as:{noblesse:-5}   la noblesse perd 5, la couronne les récupère
     as:{couronne:+4}   la couronne gagne 4, pris aux ordres au prorata —
                        c'est la conquête, qui dilue le poids relatif de tous.
   Rend le détail, pour que l'écran puisse le montrer. */
function deplacerAssise(as){
  const out=[];
  if(!as) return out;
  ORDRES_ASSISE.forEach(g=>{
    if(!as[g]) return;
    const av=S.assise[g];
    S.assise[g]=clamp(av+as[g],0,100);
    if(S.assise[g]!==av) out.push({g, n:GAUGES[g].n, av, ap:S.assise[g]});
  });
  if(as.couronne){
    const total=ORDRES_ASSISE.reduce((a,g)=>a+S.assise[g],0);
    if(total>0){
      ORDRES_ASSISE.forEach(g=>{
        const part=Math.round(as.couronne*S.assise[g]/total);
        const av=S.assise[g];
        S.assise[g]=clamp(av-part,0,100);
        if(S.assise[g]!==av) out.push({g, n:GAUGES[g].n, av, ap:S.assise[g]});
      });
    }
  }
  return out;
}
function rendreAssise(as){
  if(!as) return;
  ORDRES_ASSISE.forEach(g=>{ if(as[g]) S.assise[g]=clamp(S.assise[g]-as[g],0,100); });
  if(as.couronne){
    const total=ORDRES_ASSISE.reduce((a,g)=>a+S.assise[g],0)||1;
    ORDRES_ASSISE.forEach(g=>{
      S.assise[g]=clamp(S.assise[g]+Math.round(as.couronne*S.assise[g]/total),0,100);
    });
  }
}

/* Un ordre puissant et hostile a les moyens de se retourner et la raison de le
   faire. Un ordre faible peut vous détester sans conséquence. */
const ordresMenacants = () =>
  ORDRES_ASSISE.filter(g=>S.assise[g]>=ASSISE_MENACANTE && palier(S.g[g])===0);

/* La stabilité : ce que valent ensemble les trois ordres du royaume. Aucun
   d'eux ne gouverne seul, mais leur moyenne dit si le pays tient. Elle pèse
   sur toutes les entreprises et, quand elle tombe assez bas, elle produit
   elle-même les troubles qu'il faudra traiter. */
function stabilite(){
  return Math.round((S.g.noblesse + S.g.clerge + S.g.cortes)/3);
}
// Même échelle que les trois ordres, au féminin : la stabilité est ce qu'ils
// valent ensemble, pas une mesure d'une autre nature.
const MOTS_STABILITE = motsOrdre("f");
const motStabilite = () => MOTS_STABILITE[palier(stabilite())];
const SEUIL_TROUBLES = 30;

/* La rupture. Ce n'est pas « les trois ordres vous détestent » — un ordre
   faible peut vous détester sans conséquence. C'est un ordre qui tient assez du
   royaume pour se retourner, et qui a la raison de le faire. Le règne ne tombe
   pas l'année même : on laisse un an, l'avertissement est partout, et redresser
   la relation OU réduire l'assise suffit à l'écarter. */
const ORDRES = ORDRES_ASSISE;
const ruptureGenerale = () => ordresMenacants().length>0;
const ordresEnRupture = () => ORDRES.filter(g=>palier(S.g[g])===0);


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
const reussite = w => w[3]+w[4];        // succès et triomphe
const aboutit  = w => w[2]+w[3]+w[4];   // + demi-succès : l'entreprise aboutit

/* Ce que le joueur lit : une chance d'aboutir, pas un seuil. Le demi-succès y
   est compté — une affaire à moitié réussie n'est pas une affaire ratée — mais
   la part pleinement réussie est donnée à part, parce que ce n'est pas pareil. */
function chance(opt){
  const {T,rows}=computeThreshold(opt);
  const w=bands(T,opt.forme);
  return {pct:Math.round(aboutit(w)), plein:Math.round(reussite(w)),
          demi:Math.round(w[2]), w, T, rows};
}


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
  /* ±10. La jauge et la stabilité se cumulaient à ±22 sur chaque jet depuis que
     chaque ligne consulte sa propre jauge : un royaume bien tenu triomphait
     presque à volonté. On garde l'influence sensible sans la rendre décisive. */
  const gm=Math.round((S.g[key]-50)/5);
  if(gm!==0){ rows.push([GAUGES[key].n+" — "+word(key,S.g[key]),gm]); T+=gm; }

  const st=Math.round((stabilite()-50)/10);
  if(st!==0){ rows.push(["Le royaume — "+motStabilite(),st]); T+=st; }

  // Une entreprise qu'on ne peut pas financer se mène quand même, mal.
  const mq=manque(opt);
  if(mq>0){ const p=-Math.min(20,mq*7); rows.push(["Engagée sans les moyens",p]); T+=p; }

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
const DETTE_MAX = 6;
function detteAutorisee(){ return S.detteAnnee ? 0 : DETTE_MAX; }

function soldeDette(){
  if(S.tresor>=0) return null;
  const d=-S.tresor;
  const eff=[];
  S.g.autorite=clamp(S.g.autorite-Math.min(10,3+d),0,100);
  S.g.noblesse=clamp(S.g.noblesse-Math.min(8,2+d),0,100);
  eff.push(d);
  S.detteAnnee=true;
  return d;
}


/* L'entretien annuel des ordres : chacun dérive vers ce que sa dotation lui
   consacre. Appliqué au passage d'une année à l'autre, après la répartition
   de l'année écoulée — on récolte ce qu'on a payé. Rend le détail pour le
   bilan de fin d'année. */
/* Le Royaume n'a pas de ligne de budget : il n'est pas quelque chose qu'on
   achète. Il dérive vers l'état général du royaume — la moyenne de ce que
   valent le Pouvoir et les trois ordres — et s'use un peu chaque année.
   Sans ce frein il ne pouvait que monter : rien ne le tirait vers le bas, et
   il plafonnait à cent dans toutes les parties. */
const USURE_ROYAUME = 2;
const USURE = 1;   // ce que perd chaque jauge par an, faute d'entretien
function deriveRoyaume(){
  const autres=["autorite","noblesse","clerge","cortes"];
  const moy=autres.reduce((a,g)=>a+S.g[g],0)/autres.length;
  return Math.round((moy-S.g.prosperite)/5) - USURE_ROYAUME;
}

/* Ce qu'une dotation obtient réellement. Deux freins s'y ajoutent au barème.

   Le premier est l'essoufflement : entretenir une relation déjà excellente ne
   l'améliore presque plus, alors que la laisser tomber coûte toujours autant.

   Le second est le poids. Un ordre qui tient la moitié du royaume a plus de
   monde à satisfaire : la même somme y achète moins, et l'abandon s'y paie
   plus cher. Un ordre réduit à peu de chose se contente de peu. C'est ce qui
   relie les deux axes : reprendre son assise à la noblesse n'est pas
   seulement lui prendre ses rentes, c'est rendre sa faveur abordable. La
   couronne obéit à la même règle, mesurée sur sa propre part : plus le
   domaine s'étend, plus il coûte à gouverner. */
const POIDS_REF = 25;
function poidsEntretien(pk){
  if(pk==="france") return 1;
  const part = pk==="autorite" ? partCouronne() : S.assise[pk];
  return clamp(part,8,60)/POIDS_REF;
}
function effetDotation(pk, lv){
  const g=PF_ENTRETIEN[pk], p=poidsEntretien(pk);
  const d=derive(lv===undefined?S.budget[pk]:lv);
  return d>0 ? Math.round(d*(100-S.g[g])/100/p) : Math.round(d*p);
}

function entretenirOrdres(){
  const out=[];

  // L'usure ordinaire : une relation qu'on ne travaille pas se défait seule.
  Object.keys(PF_ENTRETIEN).forEach(pk=>{
    const g=PF_ENTRETIEN[pk];
    S.g[g]=clamp(S.g[g]-USURE,0,100);
  });

  // Le Royaume n'a pas de ligne de budget : il suit l'état général et s'use.
  {
    const d=deriveRoyaume();
    if(d!==0){
      const av=S.g.prosperite;
      S.g.prosperite=clamp(av+d,0,100);
      if(S.g.prosperite!==av) out.push({g:"prosperite", n:GAUGES.prosperite.n,
        pf: d>0?"Le royaume suit l'état général":"Usure des chemins, des greniers et des foires",
        cran:"sans dotation", d, av, ap:S.g.prosperite});
    }
  }

  Object.keys(PF_ENTRETIEN).forEach(pk=>{
    const g=PF_ENTRETIEN[pk];
    const d=effetDotation(pk);
    if(!d) return;
    const av=S.g[g];
    S.g[g]=clamp(av+d,0,100);
    if(S.g[g]!==av) out.push({g, n:GAUGES[g].n, pf:PF.find(p=>p.k===pk).n,
      cran:STEPS[S.budget[pk]], d, av, ap:S.g[g]});
  });
  return out;
}

/* Les rentrées, poste par poste, sous leur nom d'époque et avec la jauge qui
   les nourrit. Le joueur doit pouvoir lire d'où vient son argent, donc ce qu'il
   casse quand il laisse une jauge tomber. */
function rentes(){
  const lignes=[];
  const couronne=partCouronne();

  lignes.push({k:"couronne", n:"Domaine de la couronne", detail:`${couronne} % du royaume`,
    v:Math.round(couronne*RENDEMENT_COURONNE)});
  lignes.push({k:"pays", n:"Alcabala", detail:word("prosperite",S.g.prosperite),
    v:Math.round(S.g.prosperite*RENDEMENT_PAYS)});

  /* Chaque ordre verse en proportion de ce qu'il tient et de ce qu'il pense de
     vous. Lui reprendre son assise réduit donc ce qu'il donne : la Déclaratoire
     est un pari, pas une évidence. */
  ORDRES_ASSISE.forEach(g=>{
    let taux=RENDEMENT_ORDRE;
    if(g==="clerge" && enGuerre().length) taux+=0.10;   // la bulle de croisade
    lignes.push({k:g, n:GAUGES[g].n,
      detail:`${S.assise[g]} % du royaume · ${word(g,S.g[g])}`,
      croisade: g==="clerge" && enGuerre().length>0,
      v:Math.round(S.g[g]/100*S.assise[g]*taux)});
  });

  let total=lignes.reduce((s,l)=>s+l.v,0);

  const reformes=[];
  const bonus={declaratoire:2, impot_laines:1, contrat_cortes:1,
               monnaie_saine:1, consulat_burgos:1, bulle_croisade:1,
               ordres_couronne:2, greniers_royaux:1};
  Object.keys(bonus).forEach(f=>{ if(S.flags[f]){
    total+=bonus[f]; reformes.push({n:EXPLOITS[f]?EXPLOITS[f].n:f, v:bonus[f]}); }});

  const alea = .9 + Math.random()*.2;
  total = Math.max(3, Math.round(total*alea));
  return {total, lignes, reformes};
}

/* Les mercedes. On ne gouverne pas seulement avec de l'argent : un ordre qu'on
   ménage finit par obtenir des terres, des offices, des évêchés, et s'agrandit
   d'autant. La faveur a donc un prix qui n'est pas seulement fiscal, et la
   couronne ne peut pas à la fois tout tenir et avoir tout le monde pour elle —
   sans quoi elle absorbait le royaume entier avant 1487.

   Rien ne descend ici. Un ordre hostile garde ce qu'il tient : lui reprendre
   son assise doit rester une décision, prise dans une situation et payée. Le
   faire tomber tout seul revenait à désarmer la menace de rupture au moment
   même où elle se formait, et plus aucun règne ne tombait. */
const MERCEDES = 1;
const RESERVE_COURONNE = 10;   // ce que la couronne ne cède jamais
function mercedes(){
  const mv={};
  let libre=Math.max(0, partCouronne()-RESERVE_COURONNE);
  ORDRES_ASSISE.forEach(g=>{
    if(palier(S.g[g])>=3 && libre>=MERCEDES){ mv[g]=MERCEDES; libre-=MERCEDES; }
  });
  return deplacerAssise(mv);
}

function rentrees(){
  const finies=guerresEchues();
  S.entretien=entretenirOrdres();
  S.mercedes=mercedes();
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
  grenade:{n:"la guerre de Grenade", solde:4, evts:1,
    d:"La frontière du sud est ouverte et ne se refermera pas seule."},
  france:{n:"la guerre de France", solde:5, evts:1,
    d:"La France a passé les Pyrénées."},
  /* Déjà conclue au premier janvier 1479, par Alcáçovas. Elle ne figure ici
     que pour porter son nom au bilan du règne, où elle est comptée parmi les
     paix. Rien ne la déclenche : voilà pourquoi elle est dite passée. */
  portugal:{n:"la guerre de Succession", solde:0, evts:0, passee:true,
    d:"La couronne de Castille disputée les armes à la main, et gagnée."}
};
const nomGuerre = k => GUERRES[k] ? GUERRES[k].n : k;
const enGuerre = () => Object.keys(S.guerres);
/* La hueste sert à ses frais quand la noblesse est acquise : jusqu'à deux
   cinquièmes de la solde en moins. C'est le seul rendement direct de la Cour,
   et il tombe précisément quand la guerre coûte. */
function soldeGuerres(){
  const brut=enGuerre().reduce((s,k)=>s+(GUERRES[k]?GUERRES[k].solde:0),0);
  return Math.max(0, Math.round(brut*(1 - S.g.noblesse/ALLEGEMENT_HUESTE)));
}
function allegementHueste(){
  const brut=enGuerre().reduce((s,k)=>s+(GUERRES[k]?GUERRES[k].solde:0),0);
  return brut - soldeGuerres();
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

/* Le troisième groupe du bandeau n'existe que tant qu'il a un contenu.
   La France y figure toujours ; les guerres s'y ajoutent et s'en retirent. */
function crises(){
  // Voir plus bas : la rupture générale s'affiche avant de frapper.
  const out=Object.keys(GAUGES).filter(k=>GAUGES[k].gr==="dehors" && GAUGES[k].toujours)
    .map(k=>({type:"jauge", k, n:GAUGES[k].n, mot:word(k,S.g[k]), pal:palier(S.g[k])}));
  enGuerre().forEach(k=>out.push({type:"guerre", k, n:nomGuerre(k),
    mot:"depuis "+S.guerres[k], pal:0}));
  if(S.tresor<0) out.push({type:"dette", n:"Dette", mot:(-S.tresor)+" à rendre", pal:0});
  if(ruptureGenerale()) out.push({type:"rupture", n:"Rupture générale",
    mot:S.sursis?"dernière année":"les trois ordres", pal:0});
  else if(ordresEnRupture().length===2) out.push({type:"alerte", n:"Deux ordres en rupture",
    mot:ordresEnRupture().map(g=>GAUGES[g].n).join(" et "), pal:0});
  return out;
}

const SEUIL_GUERRE_FRANCE = 12;
function menaceFrance(){
  return !S.guerres.france && !S.paix.france && S.g.france<=SEUIL_GUERRE_FRANCE;
}


/* ---------- effets ----------
   apply() rend une liste d'objets décrivant ce qui a bougé, pas des chaînes :
   l'écran de résolution a besoin de savoir si une jauge a seulement glissé
   (une flèche suffit) ou si elle a changé de palier (il faut le dire). */
const JAUGE_CLE = {au:"autorite", no:"noblesse", cl:"clerge",
                   pr:"prosperite", co:"cortes", fr:"france"};

/* L'amortissement. Une jauge haute résiste au progrès et cède au revers ; une
   jauge basse se relève plus vite qu'elle ne tombe. Sans ce ressort, une jauge
   qui monte tire de meilleures bandes, donc l'emporte plus souvent, donc monte
   encore : le Pouvoir gagnait quatre-vingts points par règne et la partie se
   décidait dans ses trois premières années. Le point neutre est cinquante, où
   l'effet écrit s'applique tel quel. */
const NEUTRE = 50;
function amortir(g, v){
  const f = v>0 ? (100-S.g[g])/NEUTRE : S.g[g]/NEUTRE;
  const a = Math.round(v*f);
  return a || Math.sign(v);   // un effet écrit ne s'annule jamais tout à fait
}

function apply(e){
  const out=[];
  if(e.t){ S.tresor+=e.t; out.push({type:"tresor", n:"Trésor", v:e.t}); }

  Object.keys(JAUGE_CLE).forEach(k=>{
    if(!e[k]) return;
    const g=JAUGE_CLE[k], av=S.g[g];
    S.g[g]=clamp(av+amortir(g,e[k]),0,100);
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
      /* Un exploit n'est pas qu'un souvenir : c'est un déplacement durable de
         pouvoir. C'est ici que la Déclaratoire reprend aux grands et qu'un
         privilège concédé sort de la main du roi. */
      deplacerAssise(EXPLOITS[f].as).forEach(a=>out.push({type:"assise", ...a}));
    }
  });

  if(e.perte && S.exploits[e.perte]){
    delete S.exploits[e.perte]; delete S.flags[e.perte];
    S.perdus[e.perte]=S.year;
    out.push({type:"perte", n:EXPLOITS[e.perte].n});
    rendreAssise(EXPLOITS[e.perte].as);   // ce qu'on avait pris repart
  }

  if(e.guerre && !S.guerres[e.guerre] && !S.paix[e.guerre]){
    S.guerres[e.guerre]=S.year; out.push({type:"guerre", n:nomGuerre(e.guerre)});
  }
  if(e.paix && S.guerres[e.paix]){
    S.paix[e.paix]={debut:S.guerres[e.paix], fin:S.year};
    delete S.guerres[e.paix]; out.push({type:"paix", n:nomGuerre(e.paix)});
  }

  // Une issue peut aussi déplacer de l'assise directement.
  if(e.as) deplacerAssise(e.as).forEach(a=>out.push({type:"assise", ...a}));

  if(e.inject)e.inject.forEach(i=>S.queue.push(i));
  if(e.ch)S.chronicle.push({y:S.year,txt:e.ch});
  return out;
}

function undo(eff,e){
  if(e.t)S.tresor-=e.t;
  Object.keys(JAUGE_CLE).forEach(k=>{
    if(e[k])S.g[JAUGE_CLE[k]]=clamp(S.g[JAUGE_CLE[k]]-e[k],0,100);
  });
  [e.flag,e.flag2,e.flag3].forEach(f=>{
    if(!f) return;
    if(S.exploits[f] && EXPLOITS[f]) rendreAssise(EXPLOITS[f].as);
    delete S.flags[f]; delete S.exploits[f];
  });
  if(e.as) rendreAssise(e.as);
  if(e.perte && S.perdus[e.perte]){
    delete S.perdus[e.perte];
    S.exploits[e.perte]=S.year; S.flags[e.perte]=true;
    deplacerAssise(EXPLOITS[e.perte].as);
  }
  if(e.guerre && S.guerres[e.guerre]===S.year) delete S.guerres[e.guerre];
  if(e.paix && S.paix[e.paix]){ S.guerres[e.paix]=S.paix[e.paix].debut; delete S.paix[e.paix]; }
  if(e.ch)S.chronicle=S.chronicle.filter(c=>c.txt!==e.ch);
  if(e.inject)e.inject.forEach(i=>{const k=S.queue.lastIndexOf(i); if(k>-1)S.queue.splice(k,1)});
}


/* Ce que vaut le règne. Uniquement les exploits : il n'y a plus de points de
   conduite courante, qui récompensaient le fait de jouer plutôt que le fait
   de réussir quelque chose de notable. */
/* Ce que vaut le royaume légué. Les exploits disent ce qu'on a fait ; ceci dit
   dans quel état on le laisse. Sans cette part, on avait intérêt à dépouiller
   les ordres et à s'en aller : la couronne ramassait toute la tarte et rien ne
   comptait ce qu'elle laissait derrière elle. Les deux lignes tirent en sens
   contraire — la part se prend aux ordres, et les ordres dépouillés vous
   haïssent — ce qui est exactement l'arbitrage du règne. */
function scoreRegne(){
  const l=[];
  const d=partCouronne()-COURONNE_DEPART;
  if(d) l.push({n:"La part de la couronne",
    d:`${partCouronne()} % du royaume, contre ${COURONNE_DEPART} % en 1479`, vp:d});
  ORDRES_ASSISE.forEach(g=>{
    const vp=[-12,-6,0,6,12][palier(S.g[g])];
    if(vp) l.push({n:GAUGES[g].n, d:`${word(g,S.g[g])} au terme du règne`, vp});
  });
  return l;
}

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
  const regne=scoreRegne();
  regne.forEach(l=>total+=l.vp);
  return {total, lignes, regne};
}

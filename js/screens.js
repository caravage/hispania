/* screens.js — le rendu. Une fonction par écran, toutes reconstruisent
   entièrement #app à partir de S. Pas d'état dans le DOM.

   ledger()   le bandeau permanent, avec sa légende dépliable
   sIntro, sBudget, sEvent, sResolve, sChron, sArchives, sEnd */

/* ---------- sauvegarde ----------
   Le jeu s'ouvrant en file://, plusieurs navigateurs refusent localStorage sur
   ce protocole : tout passe par un try/catch et l'absence de sauvegarde ne
   casse rien. */
const SAVE="hispania.acte1";
function sauver(){ try{ localStorage.setItem(SAVE, JSON.stringify(S)); }catch(e){} }
function sauvegarde(){
  try{ const j=localStorage.getItem(SAVE); if(!j) return null;
    const o=JSON.parse(j); return (o && o.year && o.phase!=="intro") ? o : null;
  }catch(e){ return null; }
}
function charger(){ const o=sauvegarde(); if(!o) return false;
  Object.keys(o).forEach(k=>{ S[k]=o[k]; }); return true; }
function effacerSauvegarde(){ try{ localStorage.removeItem(SAVE); }catch(e){} }


/* ---------- bandeau ----------
   Le trésor est séparé des jauges : c'est la seule chose qui se lise en
   chiffres. Les jauges sont groupées par ce qu'elles gouvernent et colorées du
   rouge au vert selon leur palier. La légende est dans le bandeau, dépliable,
   consultable à tout moment. */
let legendeOuverte=false;

function ledger(){
  const annee = S.phase==="prologue" && PROLOGUE[S.pro_i] ? PROLOGUE[S.pro_i].y : S.year;

  const groupes=GROUPES.filter(gr=>gr.k!=="dehors").map(gr=>{
    const js=Object.keys(GAUGES).filter(k=>GAUGES[k].gr===gr.k);
    // La stabilité n'est pas une sixième jauge : c'est la moyenne des ordres,
    // affichée là où on la lit — au bout de la ligne des ordres.
    const st=stabilite();
    const stab = gr.k==="ordres"
      ? `<span class="lg-j stab" title="La moyenne des trois ordres. Elle pèse sur toutes vos entreprises, et si elle tombe trop bas le royaume produit lui-même les troubles qu'il faudra traiter."><span class="lg-jn">Stabilité</span><span class="jauge"><span class="jauge-fill p${palier(st)}" style="width:${st}%"></span></span><b class="p${palier(st)}">${motStabilite()}</b></span>` : "";
    return `<div class="lg-grp"><span class="lg-gn">${gr.n}</span>${js.map(k=>
      jaugeHTML(k)).join("")}${stab}</div>`;
  }).join("");

  // Le troisième groupe n'apparaît que s'il a un contenu.
  const cr=crises();
  const bloc=cr.length?`<div class="lg-grp crise"><span class="lg-gn">${GROUPES.find(g=>g.k==="dehors").n}</span>${
    cr.map(c=>c.type==="jauge"
      ? `<span class="lg-j" title="${GAUGES[c.k].d.replace(/"/g,"&quot;")}"><span class="lg-jn">${c.n}</span> <b class="p${c.pal}">${c.mot}</b></span>`
      : `<span class="lg-j alerte"><span class="lg-jn">${c.n}</span> <b>${c.mot}</b></span>`).join("")}</div>`:"";

  document.getElementById("ledger").innerHTML=`
    <div class="lg-top">
      <span class="yr">${annee}</span>
      <span class="lg-tresor ${S.tresor<0?"dette":""}">Trésor <b>${S.tresor}</b></span>
      <span class="lg-couronne" title="La part du royaume que la couronne tient en propre. Les trois ordres se partagent le reste. C'est la seule mesure qui monte vraiment sur neuf ans : reprendre ce qui a été donné, voilà le règne.">
        Couronne <b>${partCouronne()} %</b> <span class="lg-cm">${motCouronne()}</span></span>
      <span class="lg-boutons">
        ${S.archives.length?`<button class="lg-ico" id="arch" title="Les archives du règne" aria-label="Les archives du règne">▤</button>`:""}
        <button class="lg-ico" id="aide" title="Que veut dire tout ceci ?" aria-label="Légende" aria-expanded="${legendeOuverte}">?</button>
      </span>
    </div>
    <div class="lg-jauges">${groupes}${bloc}</div>
    ${legendeOuverte?legendeHTML():""}`;

  const a=document.getElementById("aide");
  if(a) a.onclick=()=>{ legendeOuverte=!legendeOuverte; ledger(); };
  const ar=document.getElementById("arch");
  if(ar) ar.onclick=()=>{ if(S.phase!=="archives"){S.retour=S.phase;S.phase="archives";render();} };
}

/* Une jauge se lit à deux niveaux : le mot pour la nuance, la barre pour le
   coup d'œil. La barre porte la couleur du palier. */
function jaugeHTML(k){
  const v=S.g[k], p=palier(v);
  /* Deux choses par ordre, et il faut les distinguer : la relation — est-ce
     qu'il vous suit — et l'assise — ce qu'il tient du royaume. Un ordre faible
     peut vous détester sans conséquence ; un ordre puissant, non. */
  const a=S.assise[k];
  const menace=a!==undefined && a>=ASSISE_MENACANTE && p===0;
  const titre=`${GAUGES[k].n} — ${GAUGES[k].d.replace(/"/g,"&quot;")}`+
    (a!==undefined?` · Tient ${a} % du royaume.`:"");
  return `<span class="lg-j ${menace?"menace":""}" title="${titre}">
    <span class="lg-jn">${GAUGES[k].n}</span>
    <span class="jauge"><span class="jauge-fill p${p}" style="width:${v}%"></span></span>
    <b class="p${p}">${word(k,v)}</b>${a!==undefined?`<span class="lg-as">${a} %</span>`:""}</span>`;
}

function legendeHTML(){
  return `<div class="lg-legende">
    <div class="gl"><div class="gl-n">Stabilité</div><div class="gl-d">La moyenne de la Noblesse, du Clergé et de la Bourgeoisie. Aucun des trois ne gouverne seul, mais ensemble ils disent si le pays tient. Elle pèse sur toutes vos entreprises ; sous « instable », le royaume produit chaque année une affaire de plus qu'il faudra traiter.</div>
      <div class="gl-w">${MOTS_STABILITE.map((m,i)=>`<span class="p${i}">${m}</span>`).join(" · ")}</div></div>
    <div class="gl"><div class="gl-n">Trésor</div><div class="gl-d">Le seul chiffre du jeu. Il rentre une fois l'an, avant la répartition. On peut l'engager au-delà de la caisse une fois : la dette non résorbée à la fin de l'année se paie en autorité et en crédit.</div></div>
    ${Object.keys(GAUGES).map(k=>`<div class="gl"><div class="gl-n">${GAUGES[k].n}</div>
      <div class="gl-d">${GAUGES[k].d}</div>
      <div class="gl-w">${GAUGES[k].w.map((m,i)=>`<span class="p${i}">${m}</span>`).join(" · ")}</div></div>`).join("")}
  </div>`;
}

/* Repère les noms propres connus dans un texte affiché et leur pose une
   infobulle. Une seule fois par nom et par paragraphe : un paragraphe qui
   répète « Grenade » quatre fois deviendrait illisible. Les clés les plus
   longues passent d'abord, pour que « Medina del Campo » l'emporte sur
   « Medina ». */
const CLES_LIEUX = Object.keys(LIEUX).sort((a,b)=>b.length-a.length);
const ECHAPPE = t => t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
/* Une seule alternation, un seul passage : indispensable, car un remplacement
   séquentiel finit par retrouver un nom à l'intérieur du title qu'il vient
   d'écrire, et le balisage éclate. */
const RE_LIEUX = new RegExp("(?<![\\p{L}\\p{M}])("+CLES_LIEUX.map(ECHAPPE).join("|")+")(?![\\p{L}\\p{M}])","gu");

function glose(txt){
  if(!txt) return txt;
  const vus={};
  return String(txt).replace(RE_LIEUX,(m)=>{
    if(vus[m]) return m;          // une fois par nom et par paragraphe
    vus[m]=true;
    return `<span class="lieu" title="${LIEUX[m].replace(/"/g,"&quot;")}">${m}</span>`;
  });
}

function figHTML(k){
  if(!k||!ART[k])return "";
  return `<figure><img src="${ART[k].src}" alt="" loading="lazy"
    onerror="this.closest('figure').classList.add('broken')"><figcaption>${ART[k].cap}</figcaption></figure>`;
}

/* Mélange stable : l'ordre des réponses est tiré une fois par situation et
   retenu, pour que le joueur ne voie pas les options sauter à chaque render.
   Il change d'une partie à l'autre, et rien dans la présentation ne dit plus
   laquelle est la voie historique. */
function ordreOptions(ev){
  if(!S.pending.ordre){
    const idx=ev.opts.map((_,i)=>i);
    for(let i=idx.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]];}
    S.pending.ordre=idx;
  }
  return S.pending.ordre;
}


/* ---------- écrans ---------- */
const app=()=>document.getElementById("app");
const ECRANS={intro:sIntro,prologue:sPrologue,budget:sBudget,event:sEvent,
              resolve:sResolve,chronicle:sChron,archives:sArchives,end:sEnd};
let dernierEcran="";
function render(){
  ledger();
  ECRANS[S.phase]();
  /* On ne remonte qu'en changeant d'écran. Chaque choix reconstruit #app, et
     remonter à chaque fois renvoyait le joueur en haut de page au moment
     précis où il venait de cliquer en bas. */
  const ecran=[S.phase,S.year,S.ev_i,S.pro_i].join("/");
  if(ecran!==dernierEcran){ window.scrollTo(0,0); dernierEcran=ecran; }
}

function sIntro(){
  app().innerHTML=`
  <div style="padding-top:56px"></div>
  <div class="eyebrow">Acte premier · 1479–1487</div>
  <h1>Le royaume est à vous.<br>Reste à savoir ce qu'il devient</h1>
  <div class="place">Castille et Aragon, au lendemain d'Alcáçovas</div>
  ${figHTML("vierge")}
  <div class="body">
    <p class="dropcap">La guerre de Succession est finie. Juana entrera au couvent, le Portugal garde la Guinée, et Ferdinand vient d'hériter de l'Aragon : les deux souverains sont enfin en place et personne ne conteste plus leur titre. Ce qui reste à faire est tout le reste.</p>
    <p>Le trésor rapporte moins de la moitié de ce qu'il rapportait il y a trente ans. La moitié du revenu royal est aux mains des grands. La frontière de Grenade est ouverte depuis cent cinquante ans. La France tient le Roussillon et attend son heure.</p>
    <p>Neuf années. Chacune commence par la répartition de l'argent entre six portefeuilles — vous n'aurez jamais de quoi les tenir tous — et se poursuit par les situations que l'année impose. Chaque réponse se joue aux dés, et vous voyez avant de choisir de quoi dépend votre chance.</p>
    <p>Avant cela, cinq décisions rapides pour les cinq années qui précèdent. Elles ne se jouent pas aux dés : elles disent seulement comment vous êtes sorti de la guerre de Succession, et c'est de cette sortie que dépend le royaume de 1479.</p>
  </div>
  <div class="act">
    <button class="btn" id="go">Commencer — les cinq années d'avant</button>
    ${sauvegarde()?`<button class="btn ghost" id="reprendre">Reprendre le règne en ${sauvegarde().year}</button>`:""}
  </div>`;
  document.getElementById("go").onclick=()=>{effacerSauvegarde();S.phase="prologue";S.pro_i=0;render()};
  const rep=document.getElementById("reprendre");
  if(rep) rep.onclick=()=>{ if(charger()) render(); };
}


/* Le prologue : cinq décisions sans dé, sans coût et sans retour. Elles ne
   composent pas une partie mais un point de départ — d'où la mise en page
   plus sèche que le reste, et l'état du royaume montré après chaque choix. */
function sPrologue(){
  const p=PROLOGUE[S.pro_i];
  if(!p){ S.phase="budget"; S.gDebut={...S.g}; rentrees(); sauver(); render(); return; }

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">Les années d'avant · ${S.pro_i+1} sur ${PROLOGUE.length}</div>
  <h2>${glose(p.t)}</h2>
  <div class="place">${glose(p.place)}</div>
  <div class="body"><p class="dropcap">${glose(p.body)}</p></div>
  <div class="opts pro">${p.opts.map((o,i)=>`
    <button class="opt" data-i="${i}">
      <span class="opt-label">${o.label}</span>
      <span class="opt-note">${o.note}</span>
      <span class="pro-eff">${effetsPrevus(o.e)}</span>
    </button>`).join("")}</div>`;

  app().querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    apply(p.opts[+b.dataset.i].e);
    S.pro_i++; render();
  });
}

/* Le prologue annonce ses effets : il n'y a pas de dé, donc rien à cacher. */
function effetsPrevus(e){
  const out=[];
  if(e.t) out.push(`<span class="pe ${e.t<0?"neg":"pos"}">Trésor ${e.t>0?"+":""}${e.t}</span>`);
  Object.keys(JAUGE_CLE).forEach(k=>{
    if(!e[k]) return;
    const g=JAUGE_CLE[k];
    out.push(`<span class="pe ${e[k]<0?"neg":"pos"}">${GAUGES[g].n} ${e[k]>0?"▲":"▼"}</span>`);
  });
  if(e.flag && EXPLOITS[e.flag]) out.push(`<span class="pe marque">${EXPLOITS[e.flag].n}</span>`);
  return out.join("");
}

function sBudget(){
  const spent=budgetCost(S.budget), reste=S.tresor-spent;
  /* Ce qu'on interdit, c'est de DÉPENSER au-delà du crédit, pas d'avoir une
     caisse négative. Comparer le solde à un plancher figeait l'écran quand les
     soldes de guerre avaient déjà creusé le trésor : même les six portefeuilles
     à zéro laissaient un reste négatif, et le bouton ne se rallumait jamais.
     Une répartition à zéro doit toujours être validable. */
  const dispo=Math.max(0,S.tresor)+detteAutorisee();
  const trop=spent>dispo;

  const ligneHTML=p=>{
    const lv=S.budget[p.k];
    let warn="";
    if(S.lastBudget && S.lastBudget[p.k]-lv>=2) warn=`<div class="warn">Coupe brutale : soldes impayées, clientèles déçues.</div>`;
    return `<div class="pf">
      <div class="pf-head">
        <span class="pf-name">${p.n} <b class="p${palier(S.g[p.k])}">${word(p.k,S.g[p.k])}</b></span>
        <span class="pf-cost">${STEP_COST[lv]} ${MONNAIE}</span></div>
      <div class="pf-desc">${p.d}</div>
      <div class="steps">${STEPS.map((st,i)=>{
        const g=derive(i);
        return `<button class="step" data-k="${p.k}" data-i="${i}" aria-pressed="${i===lv}">
          <span class="st-n">${st}</span>
          <span class="st-c">${STEP_COST[i]}</span>
          <span class="st-g ${g>0?"pos":g<0?"neg":""}">${g>0?"+":""}${g}</span></button>`;}).join("")}</div>
      ${warn}</div>`;
  };

  const rows=BLOCS.map(b=>{
    const tot=PF.filter(p=>p.bloc===b.k).reduce((a,p)=>a+STEP_COST[S.budget[p.k]],0);
    return `<div class="bloc ${b.k}">
      <div class="bloc-head"><span class="bloc-n">${b.n}</span><span class="bloc-t">${tot}</span></div>
      <div class="bloc-d">${b.d}</div>
      ${PF.filter(p=>p.bloc===b.k).map(ligneHTML).join("")}
    </div>`;
  }).join("") + `
    <div class="partage">
      <span>Le partage du royaume</span>
      <span class="pt-barre">
        <span class="pt-seg couronne" style="flex:${partCouronne()}">${partCouronne()} %</span>
        ${ORDRES_ASSISE.map(g=>`<span class="pt-seg ${g}" style="flex:${S.assise[g]}" title="${GAUGES[g].n} : ${S.assise[g]} % du royaume">${S.assise[g]>=9?GAUGES[g].n.slice(0,4):""}</span>`).join("")}
      </span>
      <span class="pt-note">La couronne tient ${partCouronne()} % — ${motCouronne()}. Le reste appartient aux ordres, et ne se reprend qu'en le leur retirant.</span>
    </div>`;

  const d=S.detailRentes||{lignes:[],reformes:[]};
  /* Le compte de l'année, en entier : d'où vient chaque maravédi, ce que la
     guerre prélève, ce que chaque portefeuille coûte, et ce qui reste. Le
     joueur doit pouvoir suivre la colonne du haut jusqu'en bas. */
  const prov = g => g ? GAUGES[g].n : "—";
  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">Année ${S.year} · Répartition</div>
  <h2>La bourse de l'année</h2>

  <details class="rentes" open><summary>Le compte de l'année, en ${MONNAIE_LONG}</summary>
    <table>
      <tr class="sec"><td>Ce que la couronne tient en propre</td><td></td></tr>
      ${d.lignes.filter(l=>["couronne","pays"].includes(l.k)).map(l=>
        `<tr><td>${l.n} <span class="prov">${l.detail}</span></td><td>+${l.v}</td></tr>`).join("")}
      <tr class="sec"><td>Ce que les ordres consentent</td><td></td></tr>
      ${d.lignes.filter(l=>ORDRES_ASSISE.includes(l.k)).map(l=>
        `<tr><td>${l.n} <span class="prov">${l.detail}${l.croisade?" · croisade":""}</span></td><td>+${l.v}</td></tr>`).join("")}
      ${allegementHueste()?`<tr><td>La hueste sert à ses frais <span class="prov">Noblesse</span></td><td>+${allegementHueste()}</td></tr>`:""}
      ${d.reformes.length?`<tr class="sec"><td>Réformes acquises</td><td></td></tr>
      ${d.reformes.map(r=>`<tr><td>${r.n} <span class="prov">acquis durable du règne</span></td><td>+${r.v}</td></tr>`).join("")}`:""}
      <tr class="sec"><td>Total des rentrées</td><td>${S.revenu}</td></tr>
      ${enGuerre().length?`
      <tr class="sec neg"><td>Guerres</td><td>−${S.solde}</td></tr>
      ${enGuerre().map(k=>`<tr class="neg"><td>${nomGuerre(k).replace(/^la /,"")}</td><td>−${GUERRES[k].solde}</td></tr>`).join("")}`:""}
      <tr class="sec"><td>En caisse</td><td>${S.tresor}</td></tr>
      <tr class="sec neg"><td>Dotations</td><td>−${spent}</td></tr>
      <tr class="tot"><td>Reste pour les affaires de l'année</td><td>${reste} ${MONNAIE}</td></tr>
    </table></details>

  <div class="purse">
    <span>À répartir</span>
    <span class="big ${reste<0?"dette":""}">${reste}</span>
  </div>
  ${reste<0 ? `<div class="warn">La couronne emprunte ${-reste}. Si la dette n'est pas résorbée à la fin de l'année, elle se paiera en autorité et en crédit.</div>` : ""}
  ${reste>=0 && reste<6 ? `<div class="warn">Il reste peu pour les affaires de l'année. Les situations se paient sur cette réserve.</div>` : ""}
  ${trop ? `<div class="warn">La couronne ne trouvera pas ce crédit. ${S.detteAnnee?"Elle est déjà endettée et ne peut plus emprunter.":"On ne peut engager plus de "+DETTE_MAX+" au-delà de la caisse."}</div>` : ""}
  ${rows}
  <div class="act">
    <button class="btn" id="ok" ${trop?"disabled":""}>Arrêter le budget</button>
  </div>`;

  app().querySelectorAll(".step").forEach(b=>b.onclick=()=>{
    S.budget[b.dataset.k]=+b.dataset.i; render();
  });
  const ok=document.getElementById("ok");
  if(ok) ok.onclick=()=>{
    S.tresor-=budgetCost(S.budget);
    if(S.lastBudget){
      PF.forEach(p=>{ if(S.lastBudget[p.k]-S.budget[p.k]>=2){
        S.g.noblesse=clamp(S.g.noblesse-4,0,100); S.g.autorite=clamp(S.g.autorite-3,0,100);}});
    }
    S.lastBudget={...S.budget};
    buildYear(); S.phase="event"; S.ev_i=0; sauver(); render();
  };
}


/* Ce qui donne au joueur son idée de la chance, sans lui donner un pourcentage
   nu : la jauge dont dépend l'option, son état, et une barre pleine à hauteur
   de la réussite. Le détail chiffré reste dépliable pour qui veut vérifier. */
function chanceHTML(o,choisie){
  const {pct,plein,demi,rows}=chance(o);
  const j=PORT_JAUGE[o.port];
  const mq=manque(o);
  const cran=pct<15?0:pct<30?1:pct<48?2:pct<66?3:4;
  return `
    <div class="chance">
      <div class="ch-tags">
        <span class="ch-tag">${PF.find(p=>p.k===o.port).n} <b>${STEPS[S.budget[o.port]]}</b></span>
        <span class="ch-tag">${GAUGES[j].n} <b class="p${palier(S.g[j])}">${word(j,S.g[j])}</b></span>
        ${o.cost?`<span class="ch-tag ${mq?"manque":""}">${o.cost} du trésor${mq?` · il en manque ${mq}`:""}</span>`:`<span class="ch-tag">sans frais</span>`}
      </div>
      <div class="ch-bar">
        <div class="ch-fill p${cran}" style="width:${plein}%"></div>
        <div class="ch-fill demi p${cran}" style="width:${demi}%"></div>
      </div>
      <div class="ch-mot"><b class="p${cran}">${pct} %</b> de réussite
        ${choisie?`<span class="ch-detail" data-d="1">le détail</span>`:""}</div>
      <div class="ch-rows" hidden><table>${rows.map(x=>
        `<tr><td>${x[0]}</td><td>${x[1]>0?"+":""}${x[1]}</td></tr>`).join("")}
        <tr><td><b>Chance de réussite</b></td><td><b>${pct} %</b></td></tr></table></div>
    </div>`;
}

function sEvent(){
  const ev=S.year_events[S.ev_i];
  if(!ev){ S.phase="chronicle"; render(); return; }
  if(ev.petit) return sPetit(ev);
  if(!S.pending) S.pending={opt:null, rolled:null, ordre:null};

  /* La glose en italique est passée à l'écran de résolution : ici, sous chaque
     réponse, on montre directement ce dont elle dépend et ce qu'elle vaut. */
  const ordre=ordreOptions(ev);
  const opts=ordre.map(i=>{
    const o=ev.opts[i];
    const choisie=S.pending.opt===i;
    return `<button class="opt ${choisie?"on":""}" data-i="${i}" aria-pressed="${choisie}">
      <span class="opt-label">${o.label}</span>
      ${chanceHTML(o,choisie)}
    </button>`;
  }).join("");

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">${S.year} · Situation ${S.ev_i+1} sur ${S.year_events.length}</div>
  ${S.ev_i===0&&S.yearNote?`<div class="yearnote">${S.yearNote}</div>`:""}
  <h2>${glose(ev.t)}</h2>
  <div class="place">${glose(ev.place)}</div>
  ${figHTML(ev.art)}
  <div class="body">${ev.body.map((p,i)=>`<p${i===0?' class="dropcap"':''}>${glose(p)}</p>`).join("")}</div>
  <div class="opts">${opts}</div>
  <div class="act">
    <button class="btn" id="cast" ${S.pending.opt===null?"disabled":""}>${S.pending.opt===null?"Choisir une réponse":"Décider"}</button>
  </div>`;

  app().querySelectorAll(".opt").forEach(b=>b.onclick=e=>{
    if(e.target.classList.contains("ch-detail")) return;
    S.pending.opt=+b.dataset.i; render();
  });
  app().querySelectorAll(".ch-detail").forEach(d=>d.onclick=e=>{
    e.stopPropagation();
    const r=d.closest(".chance").querySelector(".ch-rows");
    r.hidden=!r.hidden; d.textContent=r.hidden?"le détail":"masquer";
  });
  const c=document.getElementById("cast");
  if(c) c.onclick=()=>{
    const o=ev.opts[S.pending.opt];
    S.tresor-=costOf(o);
    S.pending.rolled=1+Math.floor(Math.random()*100);
    S.phase="resolve"; render();
  };
}


/* Une affaire courante : on tranche, c'est réglé, on passe. Pas de bande, pas
   de seuil, pas de coût. Le résultat s'affiche sous la réponse retenue. */
function sPetit(ev){
  if(!S.pending) S.pending={opt:null};
  const choisi=S.pending.opt;

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">${S.year} · Affaire courante</div>
  <h2>${glose(ev.t)}</h2>
  <div class="place">${glose(ev.place)}</div>
  <div class="body"><p>${glose(ev.body)}</p></div>
  ${choisi===null?`
    <div class="opts">${ev.opts.map((o,i)=>`
      <button class="opt" data-i="${i}"><span class="opt-label">${o.label}</span></button>`).join("")}</div>`
  :`
    <div class="res-opt">${ev.opts[choisi].label}</div>
    <div class="body"><p>${glose(ev.opts[choisi].txt)}</p></div>
    ${S.pending.eff && S.pending.eff.length?`<div class="effects">${S.pending.eff.map(effetHTML).join("")}</div>`:`<div class="rien">Rien n'en est resté au registre.</div>`}
    <div class="act"><button class="btn" id="next">Poursuivre</button></div>`}`;

  app().querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;
    S.pending.opt=i;
    S.pending.eff=apply(ev.opts[i].e||{});
    S.archives.push({y:S.year, ev:ev.t, place:ev.place, opt:ev.opts[i].label,
      bande:"Affaire courante", bi:2, txt:ev.opts[i].txt, petit:true});
    render(); animerChiffres();
  });
  const n=document.getElementById("next");
  if(n) n.onclick=()=>{
    S.pending=null; S.ev_i++; sauver();
    S.phase = S.ev_i<S.year_events.length ? "event" : "chronicle";
    render();
  };
}

/* Une jauge qui bouge sans changer de mot ne mérite qu'une flèche : dire
   « établie → établie » n'apprend rien. Si elle change de palier, on le dit. */
function effetHTML(e){
  if(e.type==="tresor") return `<div class="ef"><span>Trésor</span><span class="${e.v<0?"neg":"pos"}">${e.v>0?"+":""}${e.v}</span></div>`;
  if(e.type==="jauge"){
    /* Le mouvement seul. Le total de la jauge est au bandeau, en permanence :
       le répéter ici noyait la seule chose qu'on veut savoir, qui est ce que
       la décision vient de coûter ou de rapporter. Le changement de palier est
       dit, parce que c'est lui qui change quelque chose. */
    const d=e.ap-e.av, monte=d>0;
    const seuil = e.palAv!==e.palAp
      ? `<span class="ef-seuil">${e.motAv} → <b class="p${e.palAp}">${e.motAp}</b></span>` : "";
    return `<div class="ef"><span>${e.n}</span><span>${seuil}
      <b class="ef-d ${monte?"pos":"neg"}">${monte?"+":""}${d}</b></span></div>`;
  }
  if(e.type==="assise"){
    const d=e.ap-e.av, pris=d<0;
    return `<div class="ef assise"><span>${e.n} <span class="prov">part du royaume</span></span>
      <span><b class="ef-d ${pris?"pos":"neg"}">${d>0?"+":""}${d} %</b>
      <span class="ef-seuil">${pris?"repris par la couronne":"concédé"}</span></span></div>`;
  }
  if(e.type==="exploit") return `<div class="ef marque ${e.mauvais?"neg":""}"><span>${e.mauvais?"Échec durable":"Ce que le règne retiendra"}</span><span>${e.n}</span></div>`;
  if(e.type==="perte")   return `<div class="ef marque neg"><span>Repris</span><span>${e.n}</span></div>`;
  if(e.type==="guerre")  return `<div class="ef marque neg"><span>Entrée en guerre</span><span>${e.n}</span></div>`;
  if(e.type==="paix")    return `<div class="ef marque"><span>Paix</span><span>${e.n}</span></div>`;
  return "";
}

/* Le décompte. Le seul mouvement du jeu avec le jet de dé, et pour la même
   raison : c'est le moment où l'on apprend quelque chose. Respecte
   prefers-reduced-motion en posant directement la valeur d'arrivée. */
function animerChiffres(){
  const sec=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".ef-nb").forEach(el=>{
    const de=+el.dataset.de, a=+el.dataset.a;
    if(sec || de===a){ el.textContent=a; return; }
    const t0=performance.now(), duree=520+Math.min(480,Math.abs(a-de)*28);
    const pas=now=>{
      const k=Math.min(1,(now-t0)/duree);
      const doux=1-Math.pow(1-k,3);
      el.textContent=Math.round(de+(a-de)*doux);
      if(k<1) requestAnimationFrame(pas); else el.textContent=a;
    };
    requestAnimationFrame(pas);
  });
}

function sResolve(){
  const ev=S.year_events[S.ev_i], o=ev.opts[S.pending.opt];
  const {T}=computeThreshold(o);
  const w=bands(T,o.forme);
  const roll=S.pending.rolled;
  let cum=0,bi=4;
  for(let i=0;i<5;i++){cum+=w[i]; if(roll<=cum){bi=i;break}}
  const res=o.out[BAND_KEYS[bi]];
  const eff=S.pending.applied || (S.pending.applied=apply(res.e||{}));
  if(!S.pending.archive){
    S.archives.push({y:S.year, ev:ev.t, place:ev.place, opt:o.label,
      bande:BAND_NAMES[bi], bi, txt:res.t});
    S.pending.archive=true;
  }

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">${S.year} · ${ev.t}</div>
  <div class="res-opt">${o.label}${o.note?`<span class="res-note">${o.note}</span>`:""}</div>
  <div class="bandwrap" style="margin-top:22px">
    <div class="band">${w.map((x,i)=>`<div class="seg b${i}" style="flex:${x.toFixed(2)} 0 0"></div>`).join("")}
      <div class="needle" style="left:${roll}%"></div></div>
  </div>
  <div class="roll">${roll}</div>
  <div class="verdict b${bi}">${BAND_NAMES[bi]} · seuil ${T}</div>
  <div class="body"><p>${glose(res.t)}</p></div>
  ${eff.length?`<div class="effects">${eff.map(effetHTML).join("")}</div>`:""}
  <div class="act"><button class="btn" id="next">Poursuivre</button></div>`;

  document.getElementById("next").onclick=()=>{
    S.pending=null; S.ev_i++; sauver();
    S.phase = S.ev_i<S.year_events.length ? "event" : "chronicle";
    render();
  };
}


/* Ce que l'année a fait aux jauges. Comparé au 1er janvier, pas au coup par
   coup : le joueur voit la somme, qui est ce qui compte. Un mouvement qui ne
   change pas de palier n'a qu'une flèche, comme à la résolution. */
function bilanAnneeHTML(){
  if(!S.gDebut) return "";
  const lignes=Object.keys(GAUGES).map(k=>{
    const av=S.gDebut[k], ap=S.g[k], d=ap-av;
    const pAv=palier(av), pAp=palier(ap);
    const fl = d===0 ? `<span class="fleche nul">—</span>`
      : `<span class="fleche ${d>0?"up":"down"}">${d>0?"▲":"▼"}</span>`;
    const mot = pAv===pAp
      ? `<span class="ef-mot p${pAp}">${word(k,ap)}</span>`
      : `<span class="ef-mot chg">${word(k,av)} → <b class="p${pAp}">${word(k,ap)}</b></span>`;
    return `<div class="ef"><span>${GAUGES[k].n}</span><span>${fl}${mot}
      <b class="ef-d ${d>0?"pos":d<0?"neg":""}">${d>0?"+":""}${d||"—"}</b>
      <b class="ef-nb" data-de="${av}" data-a="${ap}">${av}</b></span></div>`;
  }).join("");
  return `
    <div class="rule"></div>
    <div class="eyebrow">Le royaume au 31 décembre</div>
    <div class="effects">${lignes}
      <div class="ef stab-ligne"><span>Stabilité</span><span><b class="p${palier(stabilite())}">${motStabilite()}</b>
        <b class="ef-nb" data-de="${stabilite()}" data-a="${stabilite()}">${stabilite()}</b></span></div></div>`;
}

function sChron(){
  const yr=S.chronicle.filter(c=>c.y===S.year);
  const last = S.idx>=YEARS.length-1;
  const acquisAnnee=Object.keys(S.exploits).filter(k=>S.exploits[k]===S.year);
  const perdusAnnee=Object.keys(S.perdus).filter(k=>S.perdus[k]===S.year);

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">Chronique · année ${S.year}</div>
  <h2>Ce que l'on retiendra</h2>
  ${ruptureGenerale()?`<div class="rupture">
    <b>${S.sursis?"Dernière année.":"Un ordre a les moyens de se retourner."}</b>
    ${(()=>{const m=ordresMenacants().map(g=>`${GAUGES[g].n} tient ${S.assise[g]} % du royaume et vous est ${word(g,S.g[g])}`).join(" ; ");
      return S.sursis
        ? `${m}. Cela dure depuis deux ans. Si rien ne change, le règne s'arrête là.`
        : `${m}. Deux moyens de l'écarter : regagner sa relation, ou lui reprendre son assise. Vous avez un an.`;})()}
    </div>`:""}
  <div class="rule"></div>
  <div class="chron">${yr.length?yr.map((c,i)=>
    `<div class="entry"><p${i===0?' class="dropcap"':''}>${c.txt}</p></div>`).join("")
    :`<div class="entry"><p class="dropcap">Il ne se passa rien cette année-là que l'on jugeât digne d'être écrit, ce qui, dans ce royaume, était déjà quelque chose.</p></div>`}</div>
  ${acquisAnnee.length||perdusAnnee.length?`
    <div class="rule"></div>
    <div class="eyebrow">Ce que l'année laisse au règne</div>
    <div class="acquis">
      ${acquisAnnee.map(k=>`<div class="aq${EXPLOITS[k].vp<0?" bad":""}">
        <div class="aq-n">${EXPLOITS[k].n}</div><div class="aq-d">${EXPLOITS[k].d}</div></div>`).join("")}
      ${perdusAnnee.map(k=>`<div class="aq lost">
        <div class="aq-n">${EXPLOITS[k].n}<span class="aq-y">repris</span></div>
        <div class="aq-d">${(EXPLOITS[k].perte||{}).d||""}</div></div>`).join("")}
    </div>`:""}
  ${bilanAnneeHTML()}
  <div class="rule-strong"></div>
  <div class="act">
    <button class="btn" id="n">${last?"Clore l'acte premier":"Passer à "+(S.year+1)}</button>
  </div>`;
  animerChiffres();
  document.getElementById("n").onclick=()=>{
    const d=soldeDette();
    /* La rupture générale : constatée une fois, elle laisse un an. Si elle
       tient encore à la fin de l'année suivante, le règne tombe. */
    if(ruptureGenerale()){
      if(S.sursis){ S.fin="rupture"; S.phase="end"; sauver(); render(); return; }
      S.sursis=true;
      S.chronicle.push({y:S.year,txt:"Les grands, les villes et l'Église rompirent la même année. On dit à la cour que si cela durait, il ne resterait personne pour gouverner avec."});
    } else S.sursis=false;
    if(last){S.phase="end";render();return}
    S.idx++; S.year=YEARS[S.idx];
    rentrees().forEach(k=>S.chronicle.push({y:S.year,txt:"La paix fut signée avec "+nomGuerre(k)+"."}));
    S.gDebut={...S.g};
    if(d) S.chronicle.push({y:S.year,txt:"On entra dans l'année en devant "+d+", et les prêteurs le firent savoir."});
    S.phase="budget"; sauver(); render();
  };
}


/* Les archives : tout ce qui a été décidé, avec son contexte et sa date.
   La chronique ne montre que l'année en cours ; ce qu'on veut retrouver est ici. */
function sArchives(){
  const parAnnee={};
  S.archives.forEach(a=>{ (parAnnee[a.y]=parAnnee[a.y]||[]).push(a); });
  const annees=Object.keys(parAnnee).sort((a,b)=>b-a);

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">Archives du règne</div>
  <h2>Ce qui a été décidé</h2>
  ${annees.length?annees.map(y=>`
    <div class="arch-an">
      <div class="arch-y">${y}</div>
      ${parAnnee[y].map(a=>`<div class="arch-e b${a.bi}">
        <div class="arch-t">${a.ev}<span class="arch-p">${a.place||""}</span></div>
        <div class="arch-o">${a.opt}</div>
        <div class="arch-b b${a.bi}">${a.bande}</div>
        <div class="arch-x">${a.txt}</div>
      </div>`).join("")}
    </div>`).join(""):`<div class="body"><p>Rien encore.</p></div>`}
  <div class="act"><button class="btn" id="retour">Revenir</button></div>`;
  document.getElementById("retour").onclick=()=>{S.phase=S.retour||"chronicle";render()};
}


function sEnd(){
  const etat=k=>word(k,S.g[k]);
  const {total,lignes}=score();
  const chute = S.fin==="rupture";   // déclaré avant le jugement, qui s'en sert
  /* Seuils calibrés sur la distribution mesurée : dix parties jouées au hasard
     donnent 95 à 195 points, médiane 148. Un joueur qui choisit vaut mieux que
     le hasard, d'où des paliers un peu au-dessus. */
  const jugement =
      chute      ?"Ce qui avait été fait ne comptera pas : personne ne resta pour le tenir."
    : total>=230?"Un règne dont on parlera tant qu'il y aura des chroniques."
    : total>=180?"Un grand règne. Le royaume légué ne ressemble pas à celui qu'on a reçu."
    : total>=130?"Un règne solide. Ce qui a été fait tiendra."
    : total>=80 ?"Un règne qui aura tenu, ce qui n'était pas acquis en 1479."
    : total>=0  ?"Un règne qui aura duré. C'est tout ce qu'on en dira."
    :            "Un règne dont l'héritier devra réparer les décisions.";

  app().innerHTML=`
  <div style="padding-top:48px"></div>
  <div class="eyebrow">${chute?`Fin du règne · ${S.year}`:"Fin de l'acte premier · décembre 1487"}</div>
  <h1>${chute?"Il ne restait personne<br>pour gouverner avec":"Le royaume au bout<br>de neuf années"}</h1>
  <div class="place">${chute?"Les trois ordres ayant rompu, la couronne cessa d'être obéie":"Bilan tenu par la chancellerie"}</div>
  ${chute?`<div class="body"><p class="dropcap">La noblesse en armes, les villes fermées, l'Église en rupture : aucun des trois corps du royaume ne reconnaissait plus la couronne. Ce ne fut pas une déposition — il n'y eut ni bataille ni sentence. Simplement, les ordres cessèrent d'arriver quelque part, puis partout. Ce qui avait été entrepris resta inachevé.</p></div>`:""}
  <table class="tally">
    ${Object.keys(GAUGES).map(k=>`<tr><td>${GAUGES[k].n}</td><td class="p${palier(S.g[k])}">${etat(k)}</td></tr>`).join("")}
    <tr><td>Trésor en réserve</td><td>${S.tresor}</td></tr>
    ${Object.keys(S.paix).map(k=>`<tr><td>${nomGuerre(k).replace(/^la /,"La ")}</td><td>${S.paix[k].debut}–${S.paix[k].fin}, conclue</td></tr>`).join("")}
    ${enGuerre().map(k=>`<tr><td>${nomGuerre(k).replace(/^la /,"La ")}</td><td>depuis ${S.guerres[k]}, en cours</td></tr>`).join("")}
  </table>
  <div class="rule-strong"></div>
  <div class="eyebrow">Le compte du règne</div>
  <div class="vp-total"><span>Points de victoire</span><span class="vp-big">${total}</span></div>
  <div class="body"><p class="dropcap">${jugement}</p></div>
  ${lignes.length?`<div class="tally-vp">${lignes.map(l=>`
    <div class="vp-row${l.perdu?" lost":""}${l.vp<0?" bad":""}">
      <div><div class="vp-n">${l.n}<span class="aq-y">${l.perdu?"perdu en ":""}${l.y}</span></div>
        <div class="vp-d">${l.d}</div></div>
      <div class="vp-p">${l.vp>0?"+":""}${l.vp}</div>
    </div>`).join("")}</div>`:`<div class="body"><p>Le règne n'a rien fixé de durable.</p></div>`}
  <div class="rule"></div>
  <div class="eyebrow">La chronique du règne</div>
  <div class="chron">${S.chronicle.map(c=>
    `<div class="entry"><div class="y">${c.y}</div><p>${c.txt}</p></div>`).join("")}</div>
  <div class="act">
    <button class="btn" id="again">Reprendre en 1479</button>
  </div>`;
  document.getElementById("again").onclick=()=>{effacerSauvegarde();location.reload()};
}

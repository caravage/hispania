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
  const groupes=GROUPES.map(gr=>{
    const js=Object.keys(GAUGES).filter(k=>GAUGES[k].gr===gr.k);
    return `<div class="lg-grp"><span class="lg-gn">${gr.n}</span>${js.map(k=>
      `<span class="lg-j"><span class="lg-jn">${GAUGES[k].n}</span> <b class="p${palier(S.g[k])}">${word(k,S.g[k])}</b></span>`).join("")}</div>`;
  }).join("");

  const guerres=enGuerre().map(k=>`<span class="war">${nomGuerre(k)}</span>`).join("");

  // Pendant le prologue, l'année affichée est celle qu'on décide, pas 1479.
  const annee = S.phase==="prologue" && PROLOGUE[S.pro_i] ? PROLOGUE[S.pro_i].y : S.year;

  document.getElementById("ledger").innerHTML=`
    <div class="lg-top">
      <span class="yr">${annee}</span>
      <span class="lg-tresor ${S.tresor<0?"dette":""}">Trésor <b>${S.tresor}</b></span>
      ${guerres}
      <button class="lg-aide" id="aide" aria-expanded="${legendeOuverte}">${legendeOuverte?"Masquer la légende":"Que veut dire tout ceci ?"}</button>
    </div>
    <div class="lg-jauges">${groupes}</div>
    ${legendeOuverte?legendeHTML():""}`;
  const a=document.getElementById("aide");
  if(a) a.onclick=()=>{ legendeOuverte=!legendeOuverte; ledger(); };
}

function legendeHTML(){
  return `<div class="lg-legende">
    <div class="gl"><div class="gl-n">Trésor</div><div class="gl-d">Le seul chiffre du jeu. Il rentre une fois l'an, avant la répartition. On peut l'engager au-delà de la caisse une fois : la dette non résorbée à la fin de l'année se paie en autorité et en crédit.</div></div>
    ${Object.keys(GAUGES).map(k=>`<div class="gl"><div class="gl-n">${GAUGES[k].n}</div>
      <div class="gl-d">${GAUGES[k].d}</div>
      <div class="gl-w">${GAUGES[k].w.map((m,i)=>`<span class="p${i}">${m}</span>`).join(" · ")}</div></div>`).join("")}
  </div>`;
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
function render(){ ledger(); ECRANS[S.phase](); window.scrollTo(0,0); }

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
  <h2>${p.t}</h2>
  <div class="place">${p.place}</div>
  <div class="body"><p class="dropcap">${p.body}</p></div>
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

  const rows=PF.map(p=>{
    const lv=S.budget[p.k];
    const j=PORT_JAUGE[p.k];
    let warn="";
    if(S.lastBudget && S.lastBudget[p.k]-lv>=2) warn=`<div class="warn">Coupe brutale : soldes impayées, clientèles déçues.</div>`;
    return `<div class="pf">
      <div class="pf-head"><span class="pf-name">${p.n}</span><span class="pf-cost">${STEP_COST[lv]}</span></div>
      <div class="pf-desc">${p.d} <span class="pf-j">Dépend de <b class="p${palier(S.g[j])}">${GAUGES[j].n}</b></span></div>
      <div class="steps">${STEPS.map((s,i)=>
        `<button class="step" data-k="${p.k}" data-i="${i}" aria-pressed="${i===lv}">${s}</button>`).join("")}</div>
      ${warn}</div>`;
  }).join("");

  const d=S.detailRentes||{lignes:[],reformes:[]};
  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">Année ${S.year} · Répartition</div>
  <h2>La bourse de l'année</h2>

  <details class="rentes"><summary>Rentrées de l'année : ${S.revenu}${S.solde?` · solde des guerres : −${S.solde}`:""}</summary>
    <table>${d.lignes.map(l=>`<tr><td>${l.n}</td><td>${l.v}</td></tr>`).join("")}
    ${d.reformes.map(r=>`<tr><td>${r.n}</td><td>+${r.v}</td></tr>`).join("")}
    ${enGuerre().map(k=>`<tr class="neg"><td>${nomGuerre(k).replace(/^la /,"")}</td><td>−${GUERRES[k].solde}</td></tr>`).join("")}
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
  const {T,rows}=computeThreshold(o);
  const w=bands(T,o.forme);
  const r=Math.round(reussite(w));
  const j=PORT_JAUGE[o.port];
  const mq=manque(o);
  const mots=["très douteuse","douteuse","incertaine","favorable","très favorable"];
  const cran=r<15?0:r<30?1:r<48?2:r<66?3:4;
  return `
    <div class="chance">
      <div class="ch-tags">
        <span class="ch-tag">${PF.find(p=>p.k===o.port).n} <b>${STEPS[S.budget[o.port]]}</b></span>
        <span class="ch-tag">${GAUGES[j].n} <b class="p${palier(S.g[j])}">${word(j,S.g[j])}</b></span>
        ${o.cost?`<span class="ch-tag ${mq?"manque":""}">${o.cost} du trésor${mq?` · il en manque ${mq}`:""}</span>`:`<span class="ch-tag">sans frais</span>`}
      </div>
      <div class="ch-bar"><div class="ch-fill p${cran}" style="width:${r}%"></div></div>
      <div class="ch-mot">Issue <b class="p${cran}">${mots[cran]}</b>
        ${choisie?`<span class="ch-detail" data-d="1">le détail</span>`:""}</div>
      <div class="ch-rows" hidden><table>${rows.map(x=>
        `<tr><td>${x[0]}</td><td>${x[1]>0?"+":""}${x[1]}</td></tr>`).join("")}
        <tr><td><b>Seuil</b></td><td><b>${T}</b></td></tr></table></div>
    </div>`;
}

function sEvent(){
  const ev=S.year_events[S.ev_i];
  if(!ev){ S.phase="chronicle"; render(); return; }
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
  <h2>${ev.t}</h2>
  <div class="place">${ev.place}</div>
  ${figHTML(ev.art)}
  <div class="body">${ev.body.map((p,i)=>`<p${i===0?' class="dropcap"':''}>${p}</p>`).join("")}</div>
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


/* Une jauge qui bouge sans changer de mot ne mérite qu'une flèche : dire
   « établie → établie » n'apprend rien. Si elle change de palier, on le dit. */
function effetHTML(e){
  if(e.type==="tresor") return `<div class="ef"><span>Trésor</span><span class="${e.v<0?"neg":"pos"}">${e.v>0?"+":""}${e.v}</span></div>`;
  if(e.type==="jauge"){
    const monte=e.sens>0;
    const fl=`<span class="fleche ${monte?"up":"down"}">${monte?"▲":"▼"}</span>`;
    const txt = e.palAv===e.palAp
      ? `${fl}<span class="ef-mot p${e.palAp}">${e.motAp}</span>`
      : `${fl}<span class="ef-mot"><s>${e.motAv}</s> <b class="p${e.palAp}">${e.motAp}</b></span>`;
    return `<div class="ef"><span>${e.n}</span><span>${txt}</span></div>`;
  }
  if(e.type==="exploit") return `<div class="ef marque ${e.mauvais?"neg":""}"><span>${e.mauvais?"Échec durable":"Ce que le règne retiendra"}</span><span>${e.n}</span></div>`;
  if(e.type==="perte")   return `<div class="ef marque neg"><span>Perdu</span><span>${e.n}</span></div>`;
  if(e.type==="guerre")  return `<div class="ef marque neg"><span>Entrée en guerre</span><span>${e.n}</span></div>`;
  if(e.type==="paix")    return `<div class="ef marque"><span>Paix</span><span>${e.n}</span></div>`;
  return "";
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
  <div class="body"><p>${res.t}</p></div>
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
      : `<span class="ef-mot"><s>${word(k,av)}</s> <b class="p${pAp}">${word(k,ap)}</b></span>`;
    return `<div class="ef"><span>${GAUGES[k].n}</span><span>${fl}${mot}</span></div>`;
  }).join("");
  return `
    <div class="rule"></div>
    <div class="eyebrow">Le royaume au 31 décembre</div>
    <div class="effects">${lignes}</div>`;
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
  <div class="rule"></div>
  <div class="chron">${yr.length?yr.map((c,i)=>
    `<div class="entry"><p${i===0?' class="dropcap"':''}>${c.txt}</p></div>`).join("")
    :`<div class="entry"><p class="dropcap">Il ne se passa rien cette année-là que l'on jugeât digne d'être écrit, ce qui, dans ce royaume, était déjà quelque chose.</p></div>`}</div>
  ${acquisAnnee.length||perdusAnnee.length?`
    <div class="rule"></div>
    <div class="eyebrow">Fixé cette année</div>
    <div class="acquis">
      ${acquisAnnee.map(k=>`<div class="aq${EXPLOITS[k].vp<0?" bad":""}">
        <div class="aq-n">${EXPLOITS[k].n}</div><div class="aq-d">${EXPLOITS[k].d}</div></div>`).join("")}
      ${perdusAnnee.map(k=>`<div class="aq lost">
        <div class="aq-n">${EXPLOITS[k].n}</div><div class="aq-d">${(EXPLOITS[k].perte||{}).d||""}</div></div>`).join("")}
    </div>`:""}
  ${bilanAnneeHTML()}
  <div class="rule-strong"></div>
  <div class="act">
    <button class="btn" id="n">${last?"Clore l'acte premier":"Passer à "+(S.year+1)}</button>
    <button class="btn ghost" id="arch">Les archives du règne</button>
  </div>`;

  document.getElementById("arch").onclick=()=>{S.retour="chronicle";S.phase="archives";render()};
  document.getElementById("n").onclick=()=>{
    const d=soldeDette();
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
  const jugement =
      total>=110?"Un règne dont on parlera tant qu'il y aura des chroniques."
    : total>=80 ?"Un grand règne. Le royaume légué ne ressemble pas à celui qu'on a reçu."
    : total>=50 ?"Un règne solide. Ce qui a été fait tiendra."
    : total>=25 ?"Un règne qui aura tenu, ce qui n'était pas acquis en 1479."
    : total>=0  ?"Un règne qui aura duré. C'est tout ce qu'on en dira."
    :            "Un règne dont l'héritier devra réparer les décisions.";

  app().innerHTML=`
  <div style="padding-top:48px"></div>
  <div class="eyebrow">Fin de l'acte premier · décembre 1487</div>
  <h1>Le royaume au bout<br>de neuf années</h1>
  <div class="place">Bilan tenu par la chancellerie</div>
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
    <button class="btn ghost" id="arch">Les archives du règne</button>
  </div>`;
  document.getElementById("arch").onclick=()=>{S.retour="end";S.phase="archives";render()};
  document.getElementById("again").onclick=()=>{effacerSauvegarde();location.reload()};
}

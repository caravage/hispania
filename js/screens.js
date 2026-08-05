/* screens.js — le rendu. Une fonction par écran, toutes reconstruisent
   entièrement #app à partir de S. Pas d'état dans le DOM, donc pas de
   désynchronisation possible : render() est toujours sûr à rappeler.

   ledger()   le bandeau permanent
   figHTML()  l'œuvre, avec effacement silencieux si l'image ne charge pas
   describe() traduit la forme du risque en une phrase — jamais un pourcentage nu
   sIntro, sBudget, sEvent, sResolve, sChron, sEnd — les six écrans */

/* ---------- sauvegarde ----------
   S est sérialisable tel quel : il n'y a qu'à l'écrire. Le jeu s'ouvrant en
   file://, plusieurs navigateurs refusent localStorage sur ce protocole — tout
   passe donc par un try/catch et l'absence de sauvegarde ne casse rien. Le
   joueur qui ne peut pas sauvegarder joue exactement comme avant. */
const SAVE="hispania.acte1";
function sauver(){
  try{ localStorage.setItem(SAVE, JSON.stringify(S)); }catch(e){}
}
function sauvegarde(){
  try{ const j=localStorage.getItem(SAVE); if(!j) return null;
    const o=JSON.parse(j); return (o && o.year && o.phase!=="intro") ? o : null;
  }catch(e){ return null; }
}
function charger(){
  const o=sauvegarde(); if(!o) return false;
  Object.keys(o).forEach(k=>{ S[k]=o[k]; });
  return true;
}
function effacerSauvegarde(){ try{ localStorage.removeItem(SAVE); }catch(e){} }

/* ---------- rendu bandeau ---------- */
function ledger(){
  const g=S.g;
  const parts=[
    `<span class="yr">${S.year}</span>`,
    `<span>Trésor <b class="coin">${S.tresor}</b></span>`,
    // title : le rappel à portée de survol, pour ne pas avoir à remonter à l'ouverture.
    ...Object.keys(GAUGES).map(k=>
      `<span title="${GAUGES[k].n} — ${GAUGES[k].d}">${GAUGES[k].n} <b>${word(k,g[k])}</b></span>`),
    `<span class="fortune">Fortune ${"◆".repeat(S.fortune)}${"◇".repeat(3-S.fortune)}</span>`
  ];
  // Une guerre en cours doit se voir en permanence : elle prélève tous les ans
  // et charge le calendrier tant qu'elle dure.
  enGuerre().forEach(k=>parts.push(`<span class="war">En guerre — ${nomGuerre(k)}</span>`));
  document.getElementById("ledger").innerHTML=parts.join("");
}

function figHTML(k){
  if(!k||!ART[k])return "";
  return `<figure><img src="${ART[k].src}" alt="" loading="lazy"
    onerror="this.closest('figure').classList.add('broken')"><figcaption>${ART[k].cap}</figcaption></figure>`;
}


/* ---------- écrans ---------- */
const app=()=>document.getElementById("app");

function render(){ ledger(); ({intro:sIntro,budget:sBudget,event:sEvent,resolve:sResolve,chronicle:sChron,end:sEnd})[S.phase](); window.scrollTo(0,0); }

function sIntro(){
  app().innerHTML=`
  <div style="padding-top:56px"></div>
  <div class="eyebrow">Acte premier · 1474–1482</div>
  <h1>Vous héritez d'un royaume<br>que personne ne gouverne</h1>
  <div class="place">Castille et Aragon, à la mort d'Henri IV</div>
  ${figHTML("vierge")}
  <div class="body">
    <p class="dropcap">Le trésor royal rapporte moins de la moitié de ce qu'il rapportait il y a trente ans. Les grands seigneurs battent monnaie, rendent la justice et se font la guerre. Les chemins ne sont pas sûrs entre deux villes. Le Portugal soutient une autre prétendante et l'archevêque de Tolède, qui a fait votre mariage, s'apprête à changer de camp.</p>
    <p>Neuf années. Chacune commence par la répartition de l'argent entre six portefeuilles — vous n'aurez jamais de quoi les tenir tous — et se poursuit par deux ou trois situations auxquelles il faut répondre. Chaque réponse se joue aux dés, mais vous choisissez la manière : prudente, équilibrée ou audacieuse. Vous voyez la forme du risque avant de vous décider.</p>
    <p>La voie que l'histoire a réellement suivie est toujours disponible. Elle n'est pas la meilleure. Elle est seulement la plus stable.</p>
  </div>
  <div class="rule"></div>
  <div class="eyebrow">Ce que le bandeau vous dit</div>
  <div class="glossary">${Object.keys(GAUGES).map(k=>`
    <div class="gl"><div class="gl-n">${GAUGES[k].n}</div>
      <div class="gl-d">${GAUGES[k].d}</div>
      <div class="gl-w">${GAUGES[k].w.join(" · ")}</div></div>`).join("")}
    <div class="gl"><div class="gl-n">Trésor</div>
      <div class="gl-d">Le seul chiffre exact du jeu. Il rentre une fois l'an, avant la répartition ; ce qui n'est pas dépensé reste pour les années suivantes.</div></div>
    <div class="gl"><div class="gl-n">Fortune</div>
      <div class="gl-d">Trois jetons pour tout le règne. Un jeton relance un jet manqué — seulement un échec, jamais un demi-succès qui déçoit. Ils ne se renouvellent pas.</div></div>
  </div>
  <div class="act">
    <button class="btn" id="go">Commencer — décembre 1474</button>
    ${sauvegarde()?`<button class="btn ghost" id="reprendre">Reprendre le règne en ${sauvegarde().year}</button>`:""}
  </div>`;
  document.getElementById("go").onclick=()=>{effacerSauvegarde();S.phase="budget";rentrees();sauver();render()};
  const rep=document.getElementById("reprendre");
  if(rep) rep.onclick=()=>{ if(charger()) render(); };
}

function sBudget(){
  const spent=budgetCost(S.budget), over=spent>S.tresor;
  const rows=PF.map(p=>{
    const lv=S.budget[p.k];
    let warn="";
    if(S.lastBudget && S.lastBudget[p.k]-lv>=2) warn=`<div class="warn">Coupe brutale : soldes impayées, clientèles déçues. Il y aura des suites.</div>`;
    return `<div class="pf">
      <div class="pf-head"><span class="pf-name">${p.n}</span><span class="pf-cost">${STEP_COST[lv]} · seuil ${STEP_MOD[lv]>0?"+":""}${STEP_MOD[lv]}</span></div>
      <div class="pf-desc">${p.d}</div>
      <div class="steps">${STEPS.map((s,i)=>
        `<button class="step" data-k="${p.k}" data-i="${i}" aria-pressed="${i===lv}">${s}</button>`).join("")}</div>
      ${warn}</div>`;
  }).join("");

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">Année ${S.year} · Répartition</div>
  <h2>La bourse de l'année</h2>
  <div class="place">Rentrées ordinaires : ${S.revenu}.${S.solde?` Solde des guerres prélevée : ${S.solde}.`:""} Report des années précédentes inclus.</div>
  ${enGuerre().length?`<div class="warn">${enGuerre().map(k=>GUERRES[k].d).join(" ")} Chaque guerre prélève tous les ans et ajoute une situation à l'année.</div>`:""}
  <div class="purse"><span>Disponible</span><span class="big ${over?"over":""}">${S.tresor - spent}</span></div>
  <div style="font-size:16.5px;color:var(--ink-soft);font-style:italic;margin-top:10px">
    Ce qui n'est pas dépensé reste en réserve pour les années suivantes. Ce qui est abandonné se paiera d'une autre manière.</div>
  ${!over && S.tresor-spent<3 ? `<div class="warn">Il ne reste presque rien pour les affaires de l'année. Les situations se paient sur cette réserve.</div>` : ""}
  ${rows}
  <div class="act">
    <button class="btn" id="ok" ${over?"disabled":""}>${over?"Somme dépassée":"Arrêter le budget"}</button>
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
    buildYear(); S.phase="event"; S.ev_i=0; render();
  };
}


function sEvent(){
  const ev=S.year_events[S.ev_i];
  if(!ev){ S.phase="chronicle"; render(); return; }
  if(!S.pending) S.pending={opt:null, risk:"equilibre", rolled:null, rerolled:false};

  const opts=(ev.opts).map((o,i)=>`
    <button class="opt" data-i="${i}" aria-pressed="${S.pending.opt===i}">
      <span class="opt-label">${o.label}</span>
      <span class="opt-tag">${o.voie}</span>
      ${o.note?`<span class="opt-note">${o.note}</span>`:""}
    </button>`).join("");

  let panel="";
  if(S.pending.opt!==null){
    const o=ev.opts[S.pending.opt];
    const {T,rows}=computeThreshold(o,S.pending.risk);
    const w=bands(T,S.pending.risk);
    const cost=costOf(o,S.pending.risk,ev);
    const afford=cost<=S.tresor;
    const scrape=ruined(ev);   // le trésor est à sec : on décide quand même
    panel=`
    <div class="panel">
      <div class="lbl">Manière</div>
      <div class="modes">${Object.keys(RISK).map(k=>
        `<button class="mode" data-r="${k}" aria-pressed="${S.pending.risk===k}">${RISK[k].n}</button>`).join("")}</div>
      <div class="bandwrap">
        <div class="band">${w.map((x,i)=>`<div class="seg b${i}" style="flex:${x.toFixed(2)} 0 0"></div>`).join("")}</div>
        <div class="band-keys"><span>Échec grave</span><span>Demi-succès</span><span>Triomphe</span></div>
      </div>
      <div class="oddsline">${describe(w)}</div>
      <details class="mods"><summary>Le détail du seuil</summary>
        <table>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]>0?"+":""}${r[1]}</td></tr>`).join("")}
        <tr><td><b>Seuil</b></td><td><b>${T}</b></td></tr></table></details>
      ${scrape?`<div class="warn">Le trésor ne suit plus. Ce qui sera entrepris cette année le sera avec ce qui reste, c'est-à-dire presque rien.</div>`:""}
      <div class="act">
        <button class="btn" id="cast" ${afford?"":"disabled"}>${afford?`Décider — ${cost} du trésor`:`Trésor insuffisant (${cost})`}</button>
      </div>
    </div>`;
  }

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">${S.year} · Situation ${S.ev_i+1} sur ${S.year_events.length}</div>
  ${S.ev_i===0&&S.yearNote?`<div class="yearnote">${S.yearNote}</div>`:""}
  <h2>${ev.t}</h2>
  <div class="place">${ev.place}</div>
  ${figHTML(ev.art)}
  <div class="body">${ev.body.map((p,i)=>`<p${i===0?' class="dropcap"':''}>${p}</p>`).join("")}</div>
  <div class="opts">${opts}</div>
  ${panel}`;

  app().querySelectorAll(".opt").forEach(b=>b.onclick=()=>{S.pending.opt=+b.dataset.i;render()});
  app().querySelectorAll(".mode").forEach(b=>b.onclick=()=>{S.pending.risk=b.dataset.r;render()});
  const c=document.getElementById("cast");
  if(c) c.onclick=()=>{
    const o=ev.opts[S.pending.opt];
    S.tresor=Math.max(0,S.tresor-costOf(o,S.pending.risk,ev));
    S.pending.rolled=1+Math.floor(Math.random()*100);
    S.phase="resolve"; render();
  };
}

function describe(w){
  const bad=w[0]+w[1], mid=w[2], good=w[3]+w[4];
  const q=v=> v<8?"très peu probable": v<22?"peu probable": v<40?"possible": v<58?"probable":"très probable";
  let s=`Le Conseil juge le succès ${q(good)}, l'échec ${q(bad)}.`;
  if(w[0]>18) s+=" Le désastre est une issue réelle, pas une hypothèse.";
  else if(w[0]===0) s+=" Rien d'irréparable ne peut arriver — rien d'extraordinaire non plus.";
  if(w[4]>22) s+=" Mais si cela réussit, cela réussira au-delà.";
  return s;
}

function sResolve(){
  const ev=S.year_events[S.ev_i], o=ev.opts[S.pending.opt];
  const {T}=computeThreshold(o,S.pending.risk);
  const w=bands(T,S.pending.risk);
  const roll=S.pending.rolled;
  let cum=0,bi=4;
  for(let i=0;i<5;i++){cum+=w[i]; if(roll<=cum){bi=i;break}}
  const res=o.out[BAND_KEYS[bi]];
  const eff=S.pending.applied || (S.pending.applied=apply(res.e||{}));
  // Le fond de tableau du score : chaque issue pèse, avant tout exploit.
  if(S.pending.scored===undefined) S.pending.scored=scoreBand(bi);

  /* La Fortune couvre désormais le demi-succès. Un joueur chanceux finissait
     le règne avec ses trois jetons intacts : ils n'étaient pas une décision.
     Relancer un demi-succès, c'est risquer un échec pour viser mieux. */
  const canReroll=S.fortune>0 && !S.pending.rerolled && bi<=2;

  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">${S.year} · ${ev.t}</div>
  <div class="bandwrap" style="margin-top:22px">
    <div class="band">${w.map((x,i)=>`<div class="seg b${i}" style="flex:${x.toFixed(2)} 0 0"></div>`).join("")}
      <div class="needle" style="left:${roll}%"></div></div>
  </div>
  <div class="roll">${roll}</div>
  <div class="verdict">${BAND_NAMES[bi]} · seuil ${T}</div>
  <div class="body"><p>${res.t}</p></div>
  ${eff.length?`<div class="effects">${eff.map(e=>`<div><span>${e[0]}</span><span>${e[1]}</span></div>`).join("")}</div>`:""}
  <div class="act">
    ${canReroll?`<button class="btn ghost" id="fort">Invoquer la Fortune${bi===2?" et risquer l'échec":""} — il en reste ${S.fortune}</button>`:""}
    <button class="btn" id="next">Poursuivre</button>
  </div>`;

  const f=document.getElementById("fort");
  if(f) f.onclick=()=>{
    S.fortune--; S.pending.rerolled=true;
    undo(eff, res.e||{});
    unscoreBand(bi);
    S.pending.applied=null; S.pending.scored=undefined;
    S.pending.rolled=1+Math.floor(Math.random()*100);
    render();
  };
  document.getElementById("next").onclick=()=>{
    S.pending=null; S.ev_i++; sauver();
    S.phase = S.ev_i<S.year_events.length ? "event" : "chronicle";
    render();
  };
}


function sChron(){
  const yr=S.chronicle.filter(c=>c.y===S.year);
  const last = S.idx>=YEARS.length-1;
  app().innerHTML=`
  <div style="padding-top:40px"></div>
  <div class="eyebrow">Chronique · année ${S.year}</div>
  <h2>Ce que l'on retiendra</h2>
  <div class="rule"></div>
  <div class="chron">${yr.length?yr.map((c,i)=>
    `<div class="entry"><p${i===0?' class="dropcap"':''}>${c.txt}</p></div>`).join("")
    :`<div class="entry"><p class="dropcap">Il ne se passa rien cette année-là que l'on jugeât digne d'être écrit, ce qui, dans ce royaume, était déjà quelque chose.</p></div>`}</div>
  <div class="rule-strong"></div>
  ${acquisHTML()}
  <div class="act"><button class="btn" id="n">${last?"Clore l'acte premier":"Passer à "+(S.year+1)}</button></div>`;
  document.getElementById("n").onclick=()=>{
    if(last){S.phase="end";render();return}
    S.idx++; S.year=YEARS[S.idx];
    rentrees().forEach(k=>S.chronicle.push({y:S.year,txt:"La paix fut signée avec "+nomGuerre(k)+", et l'on cessa d'en payer la solde."}));
    S.phase="budget"; sauver(); render();
  };
}

/* Ce que le règne aura laissé, montré pendant la partie.
   Volontairement sans chiffres : le joueur doit voir sa trace grandir, pas
   optimiser un total. Le compte n'apparaît qu'au bilan, une fois qu'il n'y a
   plus rien à en faire. */
function acquisHTML(){
  const tenus=Object.keys(S.exploits), perdus=Object.keys(S.perdus);
  if(!tenus.length && !perdus.length) return "";
  return `
  <div class="eyebrow">Ce que le règne aura laissé</div>
  <div class="acquis">
    ${tenus.map(k=>`<div class="aq${EXPLOITS[k].vp<0?" bad":""}">
      <div class="aq-n">${EXPLOITS[k].n}<span class="aq-y">${S.exploits[k]}</span></div>
      <div class="aq-d">${EXPLOITS[k].d}</div></div>`).join("")}
    ${perdus.map(k=>`<div class="aq lost">
      <div class="aq-n">${EXPLOITS[k].n}<span class="aq-y">perdu en ${S.perdus[k]}</span></div>
      <div class="aq-d">${(EXPLOITS[k].perte||{}).d||""}</div></div>`).join("")}
  </div>`;
}

function sEnd(){
  const g=S.g;
  const etat=k=>word(k,g[k]);   // ne pas nommer `score` : le moteur en a une
  const div = S.divergence<15?"Le règne a suivi, pour l'essentiel, le chemin que l'histoire a réellement pris."
    : S.divergence<35?"Le règne s'est écarté de l'histoire connue sur plusieurs points sérieux."
    : S.divergence<65?"Le règne a bifurqué. La Castille de 1482 ne ressemble plus à celle des chroniques."
    : "Le règne est méconnaissable. Ce royaume n'a jamais existé.";

  // Le compte du règne. Il n'apparaît qu'ici : pendant la partie, les acquis
  // sont montrés en phrases, jamais en points.
  const {total,lignes}=score();
  const jugement =
      total>=110?"Un règne dont on parlera tant qu'il y aura des chroniques."
    : total>=80 ?"Un grand règne. Le royaume légué ne ressemble pas à celui qu'on a reçu."
    : total>=50 ?"Un règne solide. Ce qui a été fait tiendra."
    : total>=25 ?"Un règne qui aura tenu, ce qui n'était pas acquis en 1474."
    : total>=0  ?"Un règne qui aura duré. C'est tout ce qu'on en dira."
    :            "Un règne dont l'héritier devra réparer les décisions.";

  app().innerHTML=`
  <div style="padding-top:48px"></div>
  <div class="eyebrow">Fin de l'acte premier · décembre 1482</div>
  <h1>Le royaume au bout<br>de neuf années</h1>
  <div class="place">Bilan tenu par la chancellerie</div>
  <table class="tally">
    <tr><td>Autorité royale</td><td>${etat("autorite")}</td></tr>
    <tr><td>Cortès</td><td>${etat("cortes")}</td></tr>
    <tr><td>Rome</td><td>${etat("rome")}</td></tr>
    <tr><td>État du royaume</td><td>${etat("prosperite")}</td></tr>
    <tr><td>Les grands</td><td>${etat("noblesse")}</td></tr>
    <tr><td>France</td><td>${etat("france")}</td></tr>
    <tr><td>Trésor en réserve</td><td>${S.tresor}</td></tr>
    <tr><td>Écart avec l'histoire</td><td>${S.divergence}</td></tr>
    ${Object.keys(S.paix).map(k=>`<tr><td>${nomGuerre(k).replace(/^la /,"La ")}</td><td>${S.paix[k].debut}–${S.paix[k].fin}, conclue</td></tr>`).join("")}
    ${enGuerre().map(k=>`<tr><td>${nomGuerre(k).replace(/^la /,"La ")}</td><td>depuis ${S.guerres[k]}, en cours</td></tr>`).join("")}
  </table>
  <div class="rule"></div>
  <div class="body"><p class="dropcap">${div}</p></div>
  <div class="rule-strong"></div>
  <div class="eyebrow">Le compte du règne</div>
  <div class="vp-total"><span>Points de victoire</span><span class="vp-big">${total}</span></div>
  <div class="body"><p>${jugement}</p></div>
  ${lignes.length?`<div class="tally-vp">${lignes.map(l=>`
    <div class="vp-row${l.perdu?" lost":""}${l.vp<0?" bad":""}">
      <div><div class="vp-n">${l.n}${l.y?`<span class="aq-y">${l.perdu?"perdu en ":""}${l.y}</span>`:""}</div>
        <div class="vp-d">${l.d}</div></div>
      <div class="vp-p">${l.vp>0?"+":""}${l.vp}</div>
    </div>`).join("")}</div>`:`<div class="body"><p>Le règne n'a rien fixé de durable.</p></div>`}
  <div class="rule-strong"></div>
  <div class="eyebrow">La chronique du règne</div>
  <div class="chron">${S.chronicle.map(c=>
    `<div class="entry"><div class="y">${c.y}</div><p>${c.txt}</p></div>`).join("")}</div>
  <div class="rule"></div>
  <div class="body aside"><p>Dans l'histoire réelle, décembre 1482 trouve la Castille engagée dans la guerre de Grenade, l'Inquisition installée depuis un an, la Déclaratoire votée, l'Hermandad en place et le trésor royal presque triplé depuis 1474. Il reste dix ans avant Grenade, l'expulsion et le premier voyage de Colomb.</p></div>
  <div class="act"><button class="btn" id="again">Reprendre en 1474</button></div>`;
  document.getElementById("again").onclick=()=>{effacerSauvegarde();location.reload()};
}


/* turn.js — la boucle de l'année.
   Ordre d'un tour : rentrées → répartition → situations → chronique.
   buildYear() compose le deck de l'année :
     1. le nœud historique, s'il en existe un pour cette année-là ;
     2. les conséquences semées les années précédentes (S.queue) ;
     3. un ou deux événements de tirage, si la place le permet.
   Le plafond de deux situations quand une conséquence remonte est délibéré :
   une année où le passé vous rattrape ne doit pas aussi être une année chargée. */

function buildYear(){
  const list=[];
  if(NODES[S.year]) list.push(NODES[S.year]);
  while(S.queue.length && list.length<2){ const id=S.queue.shift(); if(INJECTED[id]) list.push(INJECTED[id]); }
  const cands=POOL.filter(e=>!S.seen[e.id] && e.years.includes(S.year) && (!e.req||e.req(S)));
  const n = list.length>=2?0:(Math.random()<.45?2:1);
  for(let i=0;i<n && cands.length;i++){
    const e=cands.splice(Math.floor(Math.random()*cands.length),1)[0];
    S.seen[e.id]=true; list.push(e);
  }
  S.year_events=list;
}

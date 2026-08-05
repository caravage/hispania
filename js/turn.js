/* turn.js — la boucle de l'année.
   Ordre d'un tour : rentrées → répartition → situations → chronique.

   buildYear() compose le deck de l'année. Le nombre de situations n'est plus
   un tirage nu : il est dicté par l'état du royaume, et le joueur doit pouvoir
   dire pourquoi son année est chargée. Dans l'ordre de priorité :

     1. le nœud historique de l'année — il tombe toujours ;
     2. la guerre : chaque guerre en cours impose une situation de plus ;
     3. les conséquences semées les années précédentes (S.queue) ;
     4. l'ordinaire du royaume, tiré dans POOL pour compléter ;
     5. trois à cinq affaires courantes de data/petits.js, tranchées sans dé.

   Le plancher est de deux situations, le plafond de cinq — au-delà l'année
   cesse d'être lisible. yearNote dit au joueur ce qui a chargé son calendrier. */

function buildYear(){
  const list=[], causes=[];

  if(NODES[S.year]) list.push(NODES[S.year]);

  /* La France entre sans prévenir : la menace est évaluée à la composition du
     deck, donc l'invasion tombe l'année même où la relation s'effondre. */
  if(menaceFrance()) S.queue.unshift("invasion_francaise");

  const guerres=enGuerre();
  let cible = 2 + guerres.length;
  if(guerres.length) causes.push(guerres.length>1
    ? "Le royaume est engagé sur "+guerres.length+" fronts."
    : "Le royaume est engagé dans "+nomGuerre(guerres[0])+".");
  cible=Math.min(5,cible);

  // Les conséquences semées passent avant le tirage : le passé a la priorité
  // sur l'ordinaire.
  let dettes=0;
  while(S.queue.length && list.length<cible){
    const id=S.queue.shift();
    if(INJECTED[id]){ list.push(INJECTED[id]); dettes++; }
  }
  if(dettes) causes.push(dettes>1
    ? "Plusieurs affaires laissées en suspens remontent."
    : "Une affaire laissée en suspens remonte.");

  const cands=POOL.filter(e=>!S.seen[e.id] && e.years.includes(S.year) && (!e.req||e.req(S)));
  while(list.length<cible && cands.length){
    const e=cands.splice(Math.floor(Math.random()*cands.length),1)[0];
    S.seen[e.id]=true; list.push(e);
  }

  /* `etat` : ce que la situation impose par sa seule survenue, avant tout
     choix. La guerre de Succession n'est pas la conséquence d'une décision —
     Afonso a passé la frontière. Appliqué à l'entrée dans le deck, donc jamais
     défait par la Fortune, qui ne rejoue que des jets. */
  list.forEach(e=>{
    if(!e.etat) return;
    if(e.etat.guerre && !S.guerres[e.etat.guerre] && !S.paix[e.etat.guerre])
      S.guerres[e.etat.guerre]=S.year;
  });

  /* L'ordinaire de la cour, par-dessus. Trois à cinq affaires courantes qui se
     tranchent sans dé : c'est ce qui empêche une année d'être une suite de
     crises et donne au règne son bruit de fond. */
  const petits=PETITS.filter(e=>!S.seen[e.id] && e.years.includes(S.year) && (!e.req||e.req(S)));
  const nPetits=Math.min(petits.length, 3+Math.floor(Math.random()*3));
  for(let i=0;i<nPetits;i++){
    const e=petits.splice(Math.floor(Math.random()*petits.length),1)[0];
    S.seen[e.id]=true; list.push({...e, petit:true});
  }

  S.year_events=list;
  S.yearNote=causes.join(" ");
}

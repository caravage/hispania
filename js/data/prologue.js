/* prologue.js — les cinq années d'avant.

   1474-1478 ne se jouent pas comme le reste : ce sont des décisions rapides,
   sans dé et sans coût, qui composent l'état de départ de 1479. On ne rejoue
   pas la guerre de Succession, on décide seulement comment on en est sorti.

   Chaque effet est appliqué tel quel, immédiatement. Pas de bandes, pas de
   seuil : le joueur ne gouverne pas encore, il hérite de ses propres choix.

   Structure
   ─────────
   { y, t, place, body, opts:[{ label, note, e:{…} }] }

   `e` accepte les mêmes effets que partout ailleurs (voir rules.js), à ceci
   près qu'ils ne sont jamais annulés : le prologue ne se rejoue pas. */

const PROLOGUE = [

{y:1474, t:"La proclamation de Ségovie", place:"Ségovie, décembre 1474",
 body:"Henri IV est mort le 11 décembre. Trois jours plus tard, sans attendre son mari retenu en Aragon, Isabelle se fait proclamer reine sur la place de Ségovie, l'épée de justice portée devant elle la pointe levée. Ferdinand rentre furieux : ses juristes soutiennent que la couronne de Castille lui revient.",
 opts:[
  {label:"Signer la Concorde : gouverner ensemble, la Castille demeure à Isabelle.",
   note:"Les documents porteront les deux noms. La justice et le patronage restent castillans.",
   e:{au:8, no:3, co:4}},
  {label:"Céder la primauté à Ferdinand pour avoir sans délai l'armée aragonaise.",
   note:"La guerre approche et l'Aragon a des hommes. Le prix se paiera plus tard.",
   e:{au:5, no:-2, co:-6, t:4, flag:"primaute_aragon"}},
  {label:"Faire déclarer la succession par les Cortès elles-mêmes.",
   note:"Fonder le titre sur le consentement plutôt que sur l'hérédité. Personne n'a fait cela.",
   e:{co:12, au:2, no:-5, flag:"titre_consenti"}}
 ]},

{y:1475, t:"L'argent de la guerre", place:"Plasencia, mai 1475",
 body:"Afonso V a franchi la frontière avec quinze mille hommes au nom de Juana. Les Pacheco, les Stúñiga et l'archevêque de Tolède passent de son côté. Le trésor ne peut pas payer trois mois de campagne.",
 opts:[
  {label:"Lever un service sur l'argenterie des églises, à charge de remboursement.",
   note:"Trente millions de maravédis dorment dans les sacristies. On jurera de refaire les calices.",
   e:{t:11, au:4, flag:"dette_eglise"}},
  {label:"S'appuyer sur les milices urbaines et leur laisser la charge des impôts de guerre.",
   note:"Armer les conseils municipaux contre la noblesse. Efficace, et difficile à défaire.",
   e:{t:7, co:10, no:-8, au:3, flag:"villes_armees"}},
  {label:"Emprunter aux maisons génoises sur les revenus à venir.",
   note:"L'argent vient vite. Il repartira cher et pendant longtemps.",
   e:{t:14, pr:-5, co:-3, flag:"credit_genois"}}
 ]},

{y:1476, t:"Toro, et ce qu'on en fait", place:"Toro puis Madrigal, mars 1476",
 body:"La bataille de Toro n'a pas de vainqueur clair, mais Afonso se retire et l'on chante le Te Deum comme d'une victoire. Les Cortès sont convoquées à Madrigal. Le royaume est sans police depuis vingt ans : les chemins ne sont pas sûrs entre deux villes.",
 opts:[
  {label:"Créer la Sainte Hermandad : une police rurale permanente, payée par les villes.",
   note:"Une force armée qui ne doit rien aux seigneurs. Ils le comprendront très vite.",
   e:{au:10, pr:8, co:5, no:-7, flag:"hermandad"}},
  {label:"Confier la pacification aux grands seigneurs, contre confirmation de leurs domaines.",
   note:"On achète la paix au prix du patrimoine royal. Elle sera immédiate.",
   e:{no:14, au:4, pr:3, t:-3, flag:"grands_confirmes"}},
  {label:"Abolir la juridiction seigneuriale sur les chemins royaux.",
   note:"Substituer des juges nommés aux tribunaux des maisons. Trente ans avant l'heure.",
   e:{au:12, pr:6, co:7, no:-12, flag:"chemins_royaux"}}
 ]},

{y:1477, t:"Les places qu'on ne rend pas", place:"Extrémadure et Galice",
 body:"La guerre finit mal partout : des maisons qui ont tenu pour le Portugal gardent leurs forteresses et attendent de voir. Une dizaine de places, quelques milliers d'hommes, et l'exemple qu'elles donnent.",
 opts:[
  {label:"Reprendre les places par les armes, quel qu'en soit le prix.",
   note:"Faire un exemple. L'artillerie coûte plus cher que le pardon.",
   e:{au:11, no:-9, t:-6, pr:-3}},
  {label:"Pardon général : titres conservés, places rendues, rien d'exigé.",
   note:"La réconciliation achète des fidélités qu'on ne saura pas mesurer.",
   e:{no:12, au:-4, pr:4}},
  {label:"Racheter les places une à une, au prix qu'elles demandent.",
   note:"Ni siège ni pardon : un contrat. La cour trouvera cela indigne.",
   e:{au:5, no:4, t:-9, pr:2, flag:"alcaides_achetes"}}
 ]},

{y:1478, t:"Ce qui se prépare à Alcáçovas", place:"La frontière portugaise",
 body:"Le Portugal veut sortir de la guerre. On négocie le renoncement de Juana, et avec lui le partage de tout ce qui se navigue : la Guinée et ses ors d'un côté, les Canaries de l'autre. Le même hiver, un infant naît à Séville, et les prédicateurs andalous réclament un tribunal de la foi.",
 opts:[
  {label:"Céder la Guinée pour obtenir le renoncement et la paix tout de suite.",
   note:"C'est ce qui fut signé. L'or africain restera portugais quarante ans.",
   e:{au:7, pr:5, co:4, fr:4}},
  {label:"Disputer la Guinée et faire durer la négociation.",
   note:"Chaque mois de guerre coûte, et le Portugal tient la côte depuis trente ans.",
   e:{t:-7, pr:-4, au:3, fr:-3, flag:"guinee_disputee"}},
  {label:"Céder la Guinée mais exiger les Canaries entières et la route de l'ouest.",
   note:"Prendre l'océan vide plutôt que la côte qui rapporte. Personne ne comprend.",
   e:{pr:3, co:-3, au:4, flag:"route_ouest_reservee"}}
 ]}

];

/* prologue.js — les années d'avant.

   1474-1476 ne se jouent pas comme le reste : ce sont des décisions rapides,
   sans dé et sans coût, qui composent l'état de départ de 1479. On ne rejoue
   pas la guerre de Succession, on décide seulement comment on en est sorti.

   Trois décisions, pas davantage : au-delà, le prologue cesse d'être un
   prologue. Chaque effet est appliqué tel quel, immédiatement. Pas de bandes,
   pas de seuil : on ne gouverne pas encore, on hérite de ses propres choix.

   Structure
   ─────────
   { y, t, place, body, opts:[{ label, note, e:{…} }] }

   `e` accepte les mêmes effets que partout ailleurs (voir rules.js), à ceci
   près qu'ils ne sont jamais annulés : le prologue ne se rejoue pas. */

const PROLOGUE = [

{y:1474, t:"La proclamation de Ségovie", place:"Ségovie, décembre 1474",
 body:"Henri IV est mort le 11 décembre. Trois jours plus tard la proclamation se fait sur la place de Ségovie, l'épée de justice portée devant vous la pointe levée — et Ferdinand est encore en Aragon quand elle a lieu. Ses juristes soutiennent maintenant que la couronne de Castille lui revient par la loi salique ; les vôtres répondent que la Castille n'a jamais connu cette loi. La cour attend de savoir qui règne.",
 opts:[
  {label:"Signer la Concorde : gouverner ensemble, la Castille demeure à la reine.",
   note:"Les documents porteront les deux noms. La justice et le patronage restent castillans.",
   e:{au:8, no:3, co:4}},
  {label:"Reconnaître la primauté du roi pour avoir sans délai l'armée aragonaise.",
   note:"La guerre approche et l'Aragon a des hommes. Le prix se paiera plus tard.",
   e:{au:5, no:-2, co:-6, t:2, flag:"primaute_aragon"}},
  {label:"Faire déclarer la succession par les Cortès elles-mêmes.",
   note:"Fonder le titre sur le consentement plutôt que sur l'hérédité. Personne n'a fait cela.",
   e:{co:12, au:2, no:-5, flag:"titre_consenti"}}
 ]},

{y:1475, t:"L'argent de la guerre", place:"Plasencia, mai 1475",
 body:"Afonso V a franchi la frontière avec quinze mille hommes au nom de Juana. Les Pacheco, les Stúñiga et l'archevêque de Tolède passent de son côté. Le trésor ne peut pas payer trois mois de campagne.",
 opts:[
  {label:"Lever un service sur l'argenterie des églises, à charge de remboursement.",
   note:"Trente millions de maravédis dorment dans les sacristies. On jurera de refaire les calices.",
   e:{t:6, au:4, flag:"dette_eglise"}},
  {label:"S'appuyer sur les milices urbaines et leur laisser la charge des impôts de guerre.",
   note:"Armer les conseils municipaux contre la noblesse. Efficace, et difficile à défaire.",
   e:{t:4, co:10, no:-8, au:3, flag:"villes_armees"}},
  {label:"Emprunter aux maisons génoises sur les revenus à venir.",
   note:"L'argent vient vite. Il repartira cher et pendant longtemps.",
   e:{t:7, pr:-5, co:-3, flag:"credit_genois"}}
 ]},

{y:1476, t:"Toro, et ce qu'on en fait", place:"Toro puis Madrigal, mars 1476",
 body:"La bataille de Toro n'a pas de vainqueur clair, mais Afonso se retire et l'on chante le Te Deum comme d'une victoire. Les Cortès sont convoquées à Madrigal. Le royaume est sans police depuis vingt ans : les chemins ne sont pas sûrs entre deux villes.",
 opts:[
  {label:"Créer la Sainte Hermandad : une police rurale permanente, payée par les villes.",
   note:"Une force armée qui ne doit rien aux seigneurs. Ils le comprendront très vite.",
   e:{au:10, pr:8, co:5, no:-7, flag:"hermandad"}},
  {label:"Confier la pacification aux grands seigneurs, contre confirmation de leurs domaines.",
   note:"On achète la paix au prix du patrimoine royal. Elle sera immédiate.",
   e:{no:14, au:4, pr:3, t:-2, flag:"grands_confirmes"}},
  {label:"Abolir la juridiction seigneuriale sur les chemins royaux.",
   note:"Substituer des juges nommés aux tribunaux des maisons. Trente ans avant l'heure.",
   e:{au:12, pr:6, co:7, no:-12, flag:"chemins_royaux"}}
 ]}

];

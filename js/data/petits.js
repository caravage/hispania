/* petits.js — l'ordinaire d'une cour.

   Ces affaires-là ne se jouent pas aux dés : on tranche, et c'est réglé. Une
   requête de couvent, un ours en cadeau, un pont emporté — cela n'appelle pas
   une bande de résolution, cela appelle une décision et une ligne de registre.

   Trois à cinq par année, en plus du nœud historique et des situations
   graves. C'est ce qui empêche une année d'être une suite de crises, et ce
   qui donne au règne son bruit de fond.

   Structure
   ─────────
   { id, t, place, years:[…], req:s=>…,     (req facultatif)
     body:"un paragraphe",
     opts:[{ label, txt:"ce qui arrive", e:{…} }] }

   Les effets sont volontairement minces — un ou deux points, parfois rien
   qu'une ligne de chronique. Ils ne décident pas d'un règne, ils le peuplent. */

const PETITS = [

{id:"ours", t:"Un ours pour la ménagerie", place:"Valladolid", years:[1479,1481,1484,1486],
 body:"Le seigneur de Biscaye envoie un ours vivant, deux faucons et une lettre où il rappelle longuement ses services. L'ours a déjà mangé un mâtin pendant le voyage.",
 opts:[
  {label:"Accepter avec effusion et loger la bête.", txt:"L'ours s'installe dans les fossés de l'alcázar et devient une curiosité. Son entretien coûte le salaire de deux secrétaires.", e:{no:2,t:-1}},
  {label:"Accepter l'ours, refuser d'entendre la lettre.", txt:"On garde la bête et l'on renvoie la requête sans réponse. Le seigneur comprend.", e:{no:-1,au:1}},
  {label:"Renvoyer le tout en remerciant.", txt:"Le présent repart avec des compliments. En Biscaye, on trouve la cour bien sèche.", e:{no:-2}}
 ]},

{id:"eclipse", t:"L'éclipse de juillet", place:"Partout", years:[1480,1483,1486],
 body:"Le soleil s'obscurcit en plein midi pendant le temps d'un Miserere. Les troupeaux rentrent seuls, les cloches sonnent d'elles-mêmes dans deux villages, et l'on attend une explication.",
 opts:[
  {label:"Faire prêcher que c'est un phénomène naturel et connu.", txt:"Les astronomes de Salamanque publient une note. Elle est lue par ceux qui savent lire.", e:{pr:1}},
  {label:"Ordonner trois jours de processions.", txt:"Le royaume prie et se rassure. Le clergé apprécie qu'on l'ait consulté.", e:{au:2,pr:-1}},
  {label:"Ne rien dire du tout.", txt:"Le silence royal est diversement interprété. Deux prédicateurs y voient un aveu.", e:{au:-1}}
 ]},

{id:"pont", t:"Le pont d'Almaraz", place:"Le Tage", years:[1479,1482,1485,1487],
 body:"La crue a emporté deux arches du pont d'Almaraz, sur la route de l'Estrémadure. Le passage se fait au bac, quand le bac veut bien.",
 opts:[
  {label:"Payer la réparation sur le trésor.", txt:"Les arches sont refaites en une saison. Les muletiers s'en souviennent.", e:{t:-1,pr:2}},
  {label:"Laisser la charge aux villes riveraines.", txt:"Elles réparent, lentement, en se disputant la répartition.", e:{co:-1,pr:1}},
  {label:"Autoriser un péage au profit de qui reconstruira.", txt:"Un marchand de Plasencia rebâtit le pont en dix-huit mois et percevra le péage vingt ans.", e:{pr:1,co:1}}
 ]},

{id:"fou", t:"Le fou de la reine", place:"À la cour", years:[1480,1482,1485],
 body:"Le fou de cour a imité devant l'ambassadeur de Bourgogne la démarche du grand amiral, qui était présent. L'ambassadeur a ri le premier.",
 opts:[
  {label:"Rire aussi.", txt:"L'amiral rit de mauvaise grâce. L'ambassadeur écrira que la cour de Castille est vivante.", e:{no:-1,fr:1}},
  {label:"Faire fouetter le fou.", txt:"L'amiral est satisfait. La cour trouve la sanction lourde pour une grimace.", e:{no:2,au:-1}},
  {label:"L'éloigner sans bruit à la fin du mois.", txt:"Personne n'y voit une punition, et l'amiral note qu'on l'a entendu.", e:{no:1}}
 ]},

{id:"reliques", t:"Deux villages, une relique", place:"Vieille-Castille", years:[1479,1481,1484,1487],
 body:"Deux villages se disputent un bras de saint Ildefonse. Chacun produit un titre, l'un de 1391, l'autre sans date. On en est venu aux bâtons deux fois.",
 opts:[
  {label:"Trancher pour le titre le plus ancien.", txt:"Le village perdant refuse la sentence puis s'y plie. Le principe compte plus que le bras.", e:{au:2}},
  {label:"Faire porter la relique alternativement, six mois chacun.", txt:"La solution paraît sage et déplaît aux deux. Elle tiendra.", e:{au:1,pr:1}},
  {label:"Renvoyer l'affaire à l'évêque.", txt:"L'évêque met quatre ans. On ne saura jamais ce qu'il a décidé.", e:{au:-1}}
 ]},

{id:"chevaux", t:"Les haras de Cordoue", place:"Cordoue", years:[1480,1483,1486],
 body:"Les éleveurs andalous demandent l'interdiction d'exporter les juments vers le Portugal. Ils la demandent chaque année. Cette année ils ont apporté des chiffres.",
 opts:[
  {label:"Interdire l'export des juments.", txt:"La race se conserve. Les éleveurs perdent leur meilleur client et le disent.", e:{pr:-1,au:1}},
  {label:"Taxer l'export plutôt que l'interdire.", txt:"Le trésor y gagne un peu et personne n'est content, ce qui est souvent le signe d'une bonne mesure.", e:{t:1}},
  {label:"Ne rien changer.", txt:"Les juments continuent de passer la frontière.", e:{pr:1,no:-1}}
 ]},

{id:"comete", t:"La comète", place:"Partout", years:[1481,1484,1487],
 body:"Une étoile à queue traverse le ciel du nord pendant onze nuits. Les almanachs annoncent la mort d'un prince, ce qu'ils annoncent toujours.",
 opts:[
  {label:"Faire consulter les astrologues de la maison.", txt:"Ils délibèrent trois semaines et concluent que le présage est favorable au royaume, ce qui est leur métier.", e:{au:1,t:-1}},
  {label:"Interdire d'en parler dans les sermons.", txt:"L'interdiction est mal reçue et mal suivie.", e:{au:-1}},
  {label:"L'ignorer publiquement.", txt:"La comète s'en va. Rien ne se passe, ce dont personne ne tire de conclusion.", e:{}}
 ]},

{id:"bains", t:"Les bains de la juderie", place:"Ségovie", years:[1480,1482,1485],
 body:"Le conseil de Ségovie veut fermer les bains publics de la juderie, au motif qu'on y entend de la musique le vendredi. Les bains appartiennent à la couronne et rapportent un loyer.",
 opts:[
  {label:"Confirmer le bail et rappeler que le lieu est royal.", txt:"Les bains restent ouverts. Le conseil s'incline, en notant le précédent.", e:{au:2,t:1,co:-1}},
  {label:"Fermer les bains.", txt:"Le loyer est perdu et le conseil satisfait. Deux cents personnes vont se laver ailleurs.", e:{co:2,t:-1,pr:-1}},
  {label:"Interdire la musique et laisser les bains ouverts.", txt:"Le compromis ne satisfait personne et dure vingt ans.", e:{au:1}}
 ]},

{id:"poisson", t:"Le prix du poisson salé", place:"Burgos", years:[1479,1483,1486],
 body:"Le carême approche et la morue de Terre-Neuve a doublé. Les revendeurs de Burgos disent que c'est la mer ; les acheteurs disent que c'est les revendeurs.",
 opts:[
  {label:"Taxer le prix pendant le carême.", txt:"Le poisson disparaît des étals la première semaine, puis reparaît au prix taxé, en moindre quantité.", e:{co:1,pr:-1}},
  {label:"Ouvrir le marché aux marchands bretons.", txt:"Les prix retombent. Les revendeurs de Burgos écrivent une longue plainte.", e:{pr:2,co:-1}},
  {label:"Laisser faire.", txt:"On mange moins de poisson. Le carême se passe.", e:{}}
 ]},

{id:"secretaire", t:"Un secrétaire trop zélé", place:"La chancellerie", years:[1481,1484,1487],
 body:"Un secrétaire de la chancellerie a antidaté trois provisions pour rendre service à un ami. Les provisions étaient justes ; la date ne l'était pas.",
 opts:[
  {label:"Le renvoyer et publier le motif.", txt:"La chancellerie se tient droite pendant dix ans. On perd un homme habile.", e:{au:2,co:1}},
  {label:"Le garder et lui faire refaire les actes.", txt:"L'affaire s'éteint. Deux confrères en tirent une leçon qui n'est pas celle qu'on voulait.", e:{au:-1}},
  {label:"Le muter en Galice.", txt:"Il y sert bien, loin des registres qui comptent.", e:{}}
 ]},

{id:"tournoi", t:"Le tournoi d'Ávila", place:"Ávila", years:[1479,1482,1485],
 body:"Les jeunes des grandes maisons réclament un tournoi. Le dernier a fait deux morts et une brouille qui dure encore.",
 opts:[
  {label:"L'accorder, avec lances courtoises seulement.", txt:"On rompt beaucoup de bois et personne ne meurt. Les jeunes gens trouvent cela fade et y reviennent.", e:{no:2,t:-1}},
  {label:"L'accorder sans restriction.", txt:"Un fils cadet y perd un œil. Sa maison en fait grief à celle de l'adversaire.", e:{no:3,au:-1,t:-1}},
  {label:"Le refuser et proposer une campagne de frontière à la place.", txt:"La moitié part pour l'Andalousie. L'autre moitié boude.", e:{no:-1,pr:1}}
 ]},

{id:"cloche", t:"La cloche de Cuenca", place:"Cuenca", years:[1480,1483,1486],
 body:"Le chapitre de Cuenca veut fondre une cloche de douze quintaux et demande le bronze du roi. Il s'engage à faire sonner le nom royal à chaque volée.",
 opts:[
  {label:"Donner le bronze.", txt:"La cloche est fondue et porte les armes royales. On l'entend à trois lieues.", e:{au:2,t:-1}},
  {label:"Refuser : le bronze va à l'artillerie.", txt:"Le chapitre fond sa cloche en cuivre de récupération. Elle sonne mal et l'on sait pourquoi.", e:{au:-1,pr:1}},
  {label:"Vendre le bronze au chapitre au prix coûtant.", txt:"L'affaire est honnête et sans gloire. La cloche porte les armes du chapitre.", e:{t:1}}
 ]},

{id:"guadalupe", t:"Le pèlerinage de Guadalupe", place:"Estrémadure", years:[1481,1484,1487],
 body:"Le monastère de Guadalupe demande la confirmation de ses privilèges de sanctuaire. Les fugitifs y trouvent asile, y compris ceux que la justice royale poursuit.",
 opts:[
  {label:"Confirmer l'asile en toutes matières.", txt:"Les Hiéronymites sont reconnaissants. Trois faux-monnayeurs recherchés s'y installent.", e:{au:-1,pr:1}},
  {label:"Confirmer, sauf pour les crimes de sang et de monnaie.", txt:"Le monastère proteste pour la forme et accepte. Le principe d'une limite est posé.", e:{au:2}},
  {label:"Ne rien confirmer et laisser l'usage en l'état.", txt:"L'ambiguïté profite à qui est sur place.", e:{}}
 ]},

{id:"anglais", t:"Une ambassade d'Angleterre", place:"Medina del Campo", years:[1482,1485,1487],
 body:"Édouard IV propose un traité de commerce pour les laines et, en passant, évoque un mariage entre les maisons. L'Angleterre est loin et se bat contre elle-même.",
 opts:[
  {label:"Signer le traité de commerce, éluder le mariage.", txt:"Les laines castillanes trouvent un débouché de plus. Londres n'insiste pas.", e:{pr:2,t:1,fr:-1}},
  {label:"Signer les deux et se lier.", txt:"L'alliance flatte. Paris la remarque et s'en irrite.", e:{pr:1,fr:-3,au:1}},
  {label:"Recevoir aimablement et ne rien signer.", txt:"L'ambassade repart avec du vin de Toro et rien d'autre.", e:{}}
 ]},

{id:"loup", t:"Les loups de la sierra", place:"Sierra de Gredos", years:[1479,1481,1483,1486],
 body:"L'hiver est dur et les loups descendent jusqu'aux faubourgs d'Ávila. Trois enfants ont été pris. Les villages demandent une battue royale.",
 opts:[
  {label:"Ordonner une battue payée par le trésor.", txt:"Quatre-vingts loups tués en six semaines. On en parle longtemps.", e:{t:-1,pr:2,au:1}},
  {label:"Mettre une prime par tête de loup.", txt:"Les primes coûtent moins qu'une battue et rapportent davantage de loups, dont certains viennent du Portugal.", e:{pr:2}},
  {label:"Renvoyer les villages à leur seigneur.", txt:"Le seigneur ne fait rien. Les villages retiennent lequel des deux ne fait rien.", e:{au:-2,no:1}}
 ]},

{id:"chapelle", t:"Le maître de chapelle", place:"À la cour", years:[1480,1483,1486],
 body:"Le maître de la chapelle royale meurt. Deux candidats : un Flamand renommé qui coûte cher, un Castillan honnête qui coûte le tiers.",
 opts:[
  {label:"Prendre le Flamand.", txt:"La chapelle royale devient une des meilleures d'Europe. On vient l'entendre.", e:{au:2,t:-1}},
  {label:"Prendre le Castillan.", txt:"La chapelle chante correctement et forme des enfants du pays.", e:{pr:1}},
  {label:"Prendre le Castillan et envoyer deux enfants étudier en Flandre.", txt:"Dans quinze ans, la Castille aura ses propres maîtres. En attendant on chante correctement.", e:{pr:1,au:1,t:-1}}
 ]},

{id:"sorcellerie", t:"Une affaire de sortilège", place:"La Manche", years:[1482,1484,1487],
 body:"Un village accuse une veuve d'avoir fait tourner le lait et mourir deux veaux. Le corregidor demande s'il doit instruire ou faire taire.",
 opts:[
  {label:"Instruire selon le droit commun, avec preuves.", txt:"Faute de preuve, la veuve est renvoyée. Le village est mécontent et le corregidor tranquille.", e:{au:2,pr:-1}},
  {label:"Renvoyer l'affaire au tribunal ecclésiastique.", txt:"L'Église s'en saisit. Ce qui s'y passe n'est plus de votre ressort, ce qui est parfois commode.", e:{au:-1}},
  {label:"Ordonner au corregidor d'apaiser sans juger.", txt:"La veuve part chez sa sœur. Le lait continue de tourner.", e:{pr:1}}
 ]},

{id:"sceau", t:"Le sceau perdu", place:"En chemin", years:[1481,1485,1487],
 body:"Le sceau secret a disparu entre Tolède et Ségovie. Le porteur jure qu'on le lui a volé ; sa bourse, elle, est intacte.",
 opts:[
  {label:"Faire refondre un sceau et publier l'annulation de l'ancien.", txt:"Toute pièce scellée de l'ancien sceau est nulle. Trois faussaires perdent leur travail.", e:{au:2,t:-1}},
  {label:"Étouffer l'affaire et refondre discrètement.", txt:"Personne n'apprend rien. Deux actes douteux circuleront pendant des années.", e:{au:-1}},
  {label:"Faire juger le porteur.", txt:"Il est pendu sans qu'on sache s'il était coupable. Les porteurs suivants sont très attentifs.", e:{au:1,pr:-1}}
 ]},

{id:"orfevres", t:"Les orfèvres de Tolède", place:"Tolède", years:[1479,1482,1486],
 body:"La corporation des orfèvres demande le droit de poinçonner elle-même les ouvrages d'argent, à la place de l'officier royal, qu'elle accuse de lenteur et d'exigences.",
 opts:[
  {label:"Refuser : le poinçon reste royal.", txt:"La lenteur demeure, la garantie aussi. Les orfèvres murmurent.", e:{au:1,co:-1}},
  {label:"Accorder le poinçon à la corporation, sous contrôle annuel.", txt:"Les délais tombent. Le contrôle annuel se fait deux fois en dix ans.", e:{co:2,pr:1,au:-1}},
  {label:"Doubler le nombre d'officiers royaux.", txt:"Le problème disparaît. La dépense reste.", e:{t:-1,co:1,au:1}}
 ]},

{id:"vin", t:"Le vin de Toro", place:"Toro", years:[1480,1484,1487],
 body:"La ville de Toro demande l'interdiction de vendre du vin étranger dans ses murs avant que le sien soit écoulé. C'est un privilège que douze autres villes réclameront aussitôt.",
 opts:[
  {label:"Accorder le privilège à Toro seule.", txt:"Toro est satisfaite. Onze requêtes identiques arrivent avant la fin de l'année.", e:{co:1,pr:-1}},
  {label:"Refuser, au nom de la liberté des foires.", txt:"Toro le prend mal et le rappellera aux prochaines Cortès.", e:{co:-1,pr:2}},
  {label:"Accorder à toutes les villes qui le demandent.", txt:"Le royaume se couvre de petits monopoles locaux. Chacun y trouve son compte et le commerce y perd.", e:{co:3,pr:-2}}
 ]},

{id:"medecin", t:"Le médecin de la maison", place:"À la cour", years:[1481,1483,1486],
 body:"Le premier médecin de la maison royale est juif, comme la plupart des bons. Un mémoire anonyme circule à la cour pour s'en émouvoir.",
 opts:[
  {label:"Le confirmer publiquement dans sa charge.", txt:"Le mémoire cesse de circuler. On note qui l'avait fait circuler.", e:{au:2,pr:1}},
  {label:"Le garder sans rien dire.", txt:"Il reste, discrètement. Le mémoire circule encore un peu.", e:{}},
  {label:"Lui adjoindre un second médecin chrétien.", txt:"Les deux hommes s'entendent bien et se partagent le travail. Personne n'a perdu la face.", e:{au:1,t:-1}}
 ]}

];

/* nodes.js — les nœuds historiques, un par année de l'acte I.
   Ils tombent toujours : ce sont les questions que l'époque pose de toute
   façon. Ce qui est libre, c'est la réponse.

   Structure d'un nœud
   ───────────────────
   { id, t: titre, place: lieu et date, art: clé dans data/art.js,
     body: [paragraphes],
     opts: [ option, … ] }

   Structure d'une option
   ──────────────────────
   { label  : le texte du bouton
     voie   : "historique" | "divergente" | "inouïe" — jamais affichée au joueur,
              sert au bilan et à l ordre de présentation
     port   : portefeuille dont la dotation modifie le seuil
     base   : difficulté nue, avant tout modificateur
     cost   : coût en trésor, multiplié ensuite par la manière choisie
     note   : une ligne d'avertissement affichée sous l'option
     req    : (facultatif) fonction d'état → booléen, conditionne l'apparition
     out    : { crit, fail, part, succ, tri } — une issue par bande }

   Structure d'une issue
   ─────────────────────
   { t: le récit, e: les effets }

   Effets disponibles
   ──────────────────
   t   trésor            au  autorité          co  Cortès
   ro  Rome              pr  état du royaume   no  les grands
   flag, flag2, flag3    marqueurs durables, lisibles par req() et par le bilan
   inject: ["id", …]     ajoute des événements de data/injected.js au deck
   ch: "…"               la ligne que le chroniqueur retiendra de l'année */

const NODES = {

1479:{
  id:"n1479", t:"Deux couronnes, une maison", place:"Barcelone, janvier 1479", art:"ferdinand",
  body:[
   "Jean II d'Aragon est mort. La couronne d'Aragon vous revient avec la Catalogne, Valence, la Sicile, les Baléares et leurs dettes. La double monarchie n'est plus un projet de mariage : c'est un fait, et un problème.",
   "L'Aragon ne se gouverne pas comme la Castille. Rien ne s'y lève sans le vote des Corts, rien ne s'y décide sans les fueros, et le Justicia d'Aragon peut annuler un ordre royal. Au même moment, le traité d'Alcáçovas se négocie avec le Portugal : Juana renoncera, et l'on partagera l'Atlantique.",
   "La question n'est pas de savoir si vous héritez, mais ce que vous en faites : deux couronnes sur une même tête, et deux royaumes qui n'ont pas les mêmes lois."
  ],
  opts:[
   {label:"Union personnelle stricte : chaque royaume garde ses lois, ses Cortès et son trésor.",
    voie:"historique", port:"admin", base:60, cost:1,
    note:"La solution réelle. Simple à obtenir, coûteuse à gouverner pendant quarante ans.",
    out:{
      crit:{t:"Les Catalans exigent des garanties si étendues que le roi y perd une partie de ce que son père détenait.", e:{au:-8,t:-3,ch:"On jura les fueros, et l'on jura plus qu'on ne voulait."}},
      fail:{t:"Le serment est prêté sans enthousiasme des deux côtés. Chaque royaume soupçonne l'autre de le financer.", e:{co:-5,ch:"Chacun crut payer pour le voisin."}},
      part:{t:"L'union tient. Elle exigera désormais deux voyages, deux chancelleries et deux budgets.", e:{au:5,flag:"union_personnelle",ch:"Deux royaumes, un roi, et deux fois plus de chemin à faire."}},
      succ:{t:"Le serment de Barcelone se passe bien. La flotte aragonaise et les juristes catalans entrent au service de la couronne commune.", e:{au:10,t:5,co:5,flag:"union_personnelle",ch:"L'Aragon apporta ses galères, ses juristes et ses querelles."}},
      tri:{t:"L'union est présentée comme une restauration plutôt qu'une conquête. Valence vote un service, ce qu'elle ne faisait plus depuis vingt ans.", e:{au:13,t:9,co:9,flag:"union_personnelle",ch:"On fit d'un héritage une réconciliation."}}
    }},
   {label:"Créer un Conseil des Deux Couronnes, compétent pour la guerre, la diplomatie et les levées communes.",
    voie:"divergente", port:"admin", base:32, cost:3,
    note:"Un organe commun là où l'histoire n'en a jamais créé. Les fueros s'y opposent frontalement.",
    out:{
      crit:{t:"Le Justicia d'Aragon déclare le Conseil contraire aux fueros. La Catalogne parle de reprendre la guerre civile qu'elle vient à peine de finir.", e:{au:-18,co:-16,inject:["crise_catalane"],ch:"On voulut un conseil commun et l'on réveilla une guerre éteinte."}},
      fail:{t:"Le Conseil est créé, siège deux fois, et se dissout faute de compétence reconnue nulle part.", e:{au:-7,t:-4,ch:"Le conseil commun n'eut de commun que le nom."}},
      part:{t:"Le Conseil obtient la seule compétence diplomatique. C'est peu, et c'est plus qu'aucun souverain n'obtiendra avant Philippe V.", e:{au:8,flag:"conseil_deux",ch:"On unit d'abord les ambassades, faute de pouvoir unir les impôts."}},
      succ:{t:"Guerre et diplomatie passent au Conseil commun. Les levées restent séparées, mais l'architecture existe.", e:{au:15,t:5,flag:"conseil_deux",ch:"Pour la première fois, une décision fut prise au nom des deux royaumes ensemble."}},
      tri:{t:"Le Conseil obtient jusqu'à une compétence fiscale limitée. Ce qui naît là ne ressemble plus à une union personnelle mais à un État.", e:{au:20,t:10,co:8,flag:"conseil_deux",flag2:"etat_commun",ch:"Ce ne fut plus un roi portant deux couronnes, mais un royaume en portant deux noms."}}
    }},
   {label:"Faire financer l'effort commun par l'Aragon en invoquant l'héritage, avant que les Corts ne s'organisent.",
    voie:"inouïe", port:"diplomatie", base:30, cost:1,
    note:"Un précédent fiscal vaudrait plus que dix victoires. S'il échoue, la Catalogne s'embrase.",
    out:{
      crit:{t:"Les Corts de Barcelone dénoncent une violation des fueros. Le roi est contraint de jurer publiquement qu'il ne recommencera pas.", e:{au:-20,co:-14,inject:["crise_catalane"],ch:"On demanda de l'argent avant d'avoir juré les libertés, et l'on jura deux fois plus fort ensuite."}},
      fail:{t:"Refus poli et unanime. On a montré son intention sans obtenir la somme.", e:{co:-8,au:-6,ch:"L'Aragon refusa avec une courtoisie qui valait un affront."}},
      part:{t:"Valence consent un service ; la Catalogne et l'Aragon refusent. Le précédent existe, à moitié.", e:{t:6,co:-5,ch:"Un royaume paya, deux refusèrent, et l'on retint le premier."}},
      succ:{t:"Un service extraordinaire est voté. Le principe qu'un effort castillan peut être financé par l'Aragon vient d'être admis une fois.", e:{t:12,au:9,flag:"precedent_fiscal",ch:"On obtint un précédent, ce qui vaut mieux qu'un trésor."}},
      tri:{t:"Non seulement le service est voté, mais il est renouvelable. Le principal obstacle structurel de la double monarchie vient d'être entamé.", e:{t:17,au:13,co:5,flag:"precedent_fiscal",flag2:"fiscalite_commune",ch:"L'Aragon paya pour la Castille, ce qui n'était jamais arrivé et devint une habitude."}}
    }}
  ]
},

1480:{
  id:"n1480", t:"Les Cortès de Tolède", place:"Tolède, printemps 1480",
  body:[
   "La guerre est finie. Alcáçovas est signé, Juana entrera au couvent, et le Portugal garde la Guinée pendant que la Castille garde les Canaries. Il reste à payer tout cela.",
   "Les procureurs des dix-sept villes sont réunis à Tolède. Le sujet que personne n'ose nommer est la Déclaratoire : sous Henri IV, la couronne a distribué aux grands des rentes et des domaines pour un montant qui dépasse aujourd'hui la moitié du revenu royal. Les reprendre, c'est se faire un ennemi de chaque maison du royaume. Ne pas les reprendre, c'est gouverner sans argent.",
   "Le trésorier Alonso de Quintanilla a préparé les chiffres. Ils sont pires que prévu."
  ],
  opts:[
   {label:"Voter la Déclaratoire : reprise partielle et graduée des rentes concédées, selon l'ancienneté du service.",
    voie:"historique", port:"admin", base:48, cost:2,
    note:"Trente millions de maravédis par an. Chaque grand y perdra quelque chose, aucun ne perdra tout.",
    out:{
      crit:{t:"La gradation est jugée arbitraire. Trois maisons se coalisent, et l'on doit suspendre la mesure sans avoir rien encaissé.", e:{au:-14,no:-12,t:-2,ch:"On voulut ne fâcher personne et l'on fâcha tout le monde."}},
      fail:{t:"Les reprises sont contestées cas par cas. Le rendement réel est le tiers de ce qu'on attendait.", e:{t:5,no:-8,ch:"Chaque rente reprise coûta un procès."}},
      part:{t:"La mesure passe. Le revenu royal remonte nettement ; la rancune s'installe pour une génération.", e:{t:14,au:8,no:-11,co:6,flag:"declaratoire",ch:"La couronne reprit ce qu'elle avait donné, et l'on ne le lui pardonna pas."}},
      succ:{t:"La gradation par ancienneté de service désarme les protestations : les plus anciens fidèles perdent le moins. Le trésor double presque.", e:{t:20,au:13,no:-7,co:9,flag:"declaratoire",ch:"On reprit beaucoup en donnant l'impression de ménager chacun."}},
      tri:{t:"L'opération est menée avec une telle maîtrise comptable que plusieurs seigneurs restituent volontairement pour ne pas être mis en cause. Le revenu royal est refondé.", e:{t:26,au:17,no:-4,co:12,flag:"declaratoire",flag2:"finances_refondees",ch:"Il se trouva des grands pour rendre d'eux-mêmes, ce qui valut mieux que la contrainte."}}
    }},
   {label:"Renoncer à la reprise et négocier à la place un impôt permanent sur le commerce des laines.",
    voie:"divergente", port:"cour", base:44, cost:1,
    note:"Épargner la noblesse et taxer la Mesta et les marchands. Les villes paieront.",
    out:{
      crit:{t:"Les marchands de Burgos et la Mesta font front. L'impôt est voté puis rendu inapplicable par une nuée d'exemptions.", e:{co:-14,pr:-8,t:-2,ch:"On vota un impôt que personne ne paya."}},
      fail:{t:"L'impôt rentre mal et détourne une part du commerce vers les ports portugais.", e:{t:4,pr:-7,co:-7,ch:"La laine trouva d'autres chemins que ceux du fisc."}},
      part:{t:"L'impôt rapporte, moins que la Déclaratoire, et la noblesse reste intacte — puissante, propriétaire, et reconnaissante.", e:{t:9,no:12,co:-8,pr:-4,ch:"On préféra la gratitude des grands au revenu des rentes."}},
      succ:{t:"Le prélèvement sur les laines devient la ressource stable que la Castille n'avait pas. Les grands, épargnés, servent loyalement.", e:{t:15,no:15,co:-5,flag:"impot_laines",ch:"La laine paya ce que les seigneurs ne payèrent pas."}},
      tri:{t:"L'impôt est accepté, indexé et administré par des officiers royaux. La couronne gagne un revenu régulier sans avoir créé un seul ennemi de rang.", e:{t:21,no:18,au:9,flag:"impot_laines",flag2:"fisc_commercial",ch:"On trouva le moyen rare d'enrichir la couronne sans blesser personne d'important."}}
    }},
   {label:"Proposer aux Cortès un contrat : impôt régulier consenti chaque décennie, contre droit de regard sur la dépense.",
    voie:"inouïe", port:"justice", base:28, cost:2,
    note:"Un budget contrôlé. Aucune monarchie ibérique n'acceptera cela avant très longtemps.",
    out:{
      crit:{t:"Les procureurs, encouragés, réclament aussi le contrôle des nominations. Ce qui devait renforcer la couronne devient une machine à la limiter.", e:{au:-20,co:14,inject:["cortes_exigeantes"],ch:"On ouvrit une porte, et l'on ne put plus la refermer."}},
      fail:{t:"Ni les Cortès ni le Conseil royal ne comprennent la proposition. Elle meurt de son étrangeté.", e:{au:-8,t:-3,ch:"On proposa une chose que personne ne sut nommer."}},
      part:{t:"Un accord limité est trouvé : les Cortès voteront décennalement et vérifieront les comptes de guerre seulement.", e:{co:16,t:8,flag:"contrat_cortes",ch:"Les villes obtinrent de voir les comptes de la guerre, ce qui les rendit étonnamment généreuses."}},
      succ:{t:"Le contrat est signé. Le revenu devient prévisible pour la première fois depuis un siècle, et les Cortès deviennent une alliée plutôt qu'un obstacle.", e:{co:22,t:15,au:8,flag:"contrat_cortes",ch:"On échangea du secret contre de l'argent, et l'échange fut bon."}},
      tri:{t:"L'institution née à Tolède ne ressemble à rien de connu : une couronne forte qui rend des comptes. Les procureurs votent au-delà de ce qu'on demandait.", e:{co:26,t:22,au:14,flag:"contrat_cortes",flag2:"budget_consenti",ch:"Il naquit à Tolède une manière de gouverner dont aucun royaume n'avait l'exemple."}}
    }}
  ]
},

1481:{
  id:"n1481", t:"Zahara, et le premier bûcher", place:"Séville et la frontière, février 1481", art:"autodafe",
  body:[
   "Deux nouvelles arrivent la même saison. À Séville, six personnes sont brûlées : c'est le premier autodafé du royaume, et la ville se vide un peu plus. Sur la frontière, Abu al-Hasan de Grenade a pris Zahara par surprise, de nuit, et emmené toute la population en captivité.",
   "Grenade a rompu la trêve. Le royaume a payé ses dettes de guerre, l'Hermandad tient les chemins, l'armée existe encore. La frontière attend une réponse.",
   "Rodrigo Ponce de León, marquis de Cadix, envoie dire qu'il connaît un chemin vers Alhama."
  ],
  opts:[
   {label:"Riposter sur la frontière sans déclarer la guerre : razzias, tours, contre-raids.",
    voie:"historique", port:"guerre", base:56, cost:2,
    note:"Ce que font tous les rois de Castille depuis deux siècles. Prudent, et sans issue.",
    out:{
      crit:{t:"Les contre-raids échouent et Grenade prend deux places de plus. La frontière est plus mauvaise qu'avant Zahara.", e:{au:-12,pr:-6,t:-3,ch:"On répondit à un coup de main par trois, et l'on en reçut cinq."}},
      fail:{t:"Les razzias rapportent du bétail et rien d'autre. Zahara reste perdue.", e:{au:-5,ch:"On ramena des troupeaux et pas de prisonniers."}},
      part:{t:"La frontière se stabilise. Les capitaines andalous sont mécontents : ils voulaient une guerre, on leur donne une garde.", e:{au:4,no:-4,flag:"frontiere_armee",ch:"La frontière tint, ce qui ne suffit à personne."}},
      succ:{t:"Les tours de guet sont refaites, les razzias efficaces, et Grenade demande une trêve — que l'on peut désormais accorder ou refuser.", e:{au:9,t:4,flag:"frontiere_armee",ch:"Pour la première fois depuis longtemps, ce fut Grenade qui demanda la trêve."}},
      tri:{t:"La frontière militarisée devient rentable : parias, tributs, butin. La guerre s'auto-finance avant même d'avoir commencé.", e:{au:12,t:9,flag:"frontiere_armee",flag2:"frontiere_rentable",ch:"On fit de la frontière une ferme, et elle rapporta."}}
    }},
   {label:"Écouter Ponce de León et tenter Alhama : un coup de main au cœur du royaume grenadin.",
    voie:"historique", port:"guerre", base:40, cost:2,
    note:"Alhama est à quarante lieues derrière les lignes. Si l'on y entre, on ne pourra plus reculer.",
    out:{
      crit:{t:"La colonne est interceptée dans la sierra. Le marquis s'échappe, l'essentiel de sa troupe non, et l'Andalousie apprend qu'elle est sans défense.", e:{guerre:"grenade",au:-17,no:-10,t:-4,pr:-5,ch:"On envoya des hommes derrière les montagnes et ils n'en revinrent pas."}},
      fail:{t:"L'escalade échoue de peu. La surprise est perdue et Grenade fortifie tout ce qui pouvait l'être.", e:{guerre:"grenade",au:-8,t:-4,ch:"Il manqua une échelle et deux heures de nuit."}},
      part:{t:"Alhama tombe et devient aussitôt intenable : il faut la ravitailler à travers le territoire ennemi, indéfiniment.", e:{guerre:"grenade",au:8,t:-5,flag:"alhama",inject:["siege_alhama"],flag2:"guerre_grenade",ch:"On prit une ville qu'il fallut ensuite nourrir à bout de bras."}},
      succ:{t:"Alhama est prise et tenue. La guerre de Grenade commence — non plus une frontière, mais une conquête.", e:{guerre:"grenade",au:14,no:7,flag:"alhama",inject:["siege_alhama"],flag2:"guerre_grenade",ch:"Ce ne fut plus une frontière, mais une entreprise."}},
      tri:{t:"La prise est si nette qu'elle vaut proclamation. Rome accorde la bulle de croisade et l'argent de la chrétienté commence à entrer.", e:{guerre:"grenade",au:18,t:8,no:9,flag:"alhama",inject:["siege_alhama"],flag2:"guerre_grenade",flag3:"bulle_croisade",ch:"Une échelle posée de nuit sur un mur ouvrit dix ans de guerre et vingt ans de gloire."}}
    }},
   {label:"Négocier avec Grenade : restitution de Zahara, tribut, et une trêve longue garantie par écrit.",
    voie:"inouïe", port:"diplomatie", base:34, cost:1,
    note:"Renoncer à la conquête. Le clergé, la noblesse andalouse et la chrétienté entière vous le reprocheront.",
    out:{
      crit:{t:"Abu al-Hasan refuse avec mépris et publie la lettre. Le roi de Castille a demandé la paix à un roi maure : la cour ne s'en remet pas.", e:{au:-22,no:-14,ch:"On demanda la paix et l'on reçut le mépris, ce qui coûte plus cher qu'une défaite."}},
      fail:{t:"Les pourparlers échouent sur le tribut. On a perdu une saison et de la réputation.", e:{au:-9,ch:"On marchanda un an pour rien."}},
      part:{t:"Une trêve de sept ans est signée, Zahara rendue. La frontière est calme et l'Andalousie furieuse.", e:{t:7,pr:8,no:-12,flag:"treve_grenade",ch:"La paix fut signée, et personne en Andalousie ne s'en réjouit."}},
      succ:{t:"La trêve est longue, le tribut substantiel, et le commerce grenadin reprend au bénéfice des ports castillans. On ne fera pas la guerre.", e:{t:13,pr:14,no:-10,flag:"treve_grenade",ch:"Grenade paya plus en tribut qu'elle n'aurait valu en butin."}},
      tri:{t:"L'accord va au-delà : Grenade devient vassale tributaire, ouvre ses ports, et la Castille se tourne vers l'Atlantique dix ans avant l'heure.", e:{t:18,pr:19,au:9,no:-9,flag:"grenade_vassale",flag2:"ocean_dabord",ch:"On garda Grenade comme un tributaire plutôt qu'un trophée, et l'on regarda vers la mer."}}
    }}
  ]
},

1482:{
  id:"n1482", t:"Loja, et ce qu'une place coûte", place:"Loja, juillet 1482",
  body:[
   "Alhama est prise depuis février et tient au prix d'un ravitaillement mensuel à travers la sierra. Pour la dégager il faudrait Loja, qui ferme la vallée du Genil et que l'on dit imprenable.",
   "Ferdinand veut y aller tout de suite, avec ce qui est disponible : quatre mille lances, peu d'artillerie, et une saison déjà avancée. Le marquis de Cadix conseille d'attendre le printemps et les bombardes.",
   "Attendre, c'est laisser Grenade se ressaisir. Y aller maintenant, c'est assiéger une place de montagne sans les moyens d'un siège."
  ],
  opts:[
   {label:"Marcher sur Loja immédiatement, avec ce qu'on a.",
    voie:"historique", port:"guerre", base:34, cost:4,
    note:"C'est ce qui fut fait, et ce fut un désastre.",
    out:{
      crit:{t:"Le camp est mal assis, la cavalerie de Grenade coupe l'eau, et la retraite se change en déroute sous les murs. On y laisse l'artillerie et le grand maître de Calatrava.", e:{au:-16,pr:-10,no:-12,ch:"On alla devant Loja sans les moyens d'un siège, et l'on en revint sans l'artillerie."}},
      fail:{t:"Le siège est levé après trois semaines. Rien de perdu que le temps, l'argent et la réputation.", e:{au:-9,t:-3,ch:"On assiégea Loja et l'on s'en retourna."}},
      part:{t:"La place tient, mais la vallée est ravagée et Alhama est ravitaillée pour l'année.", e:{pr:-3,au:2}},
      succ:{t:"Loja ne tombe pas, mais l'armée se retire en ordre après avoir brûlé les récoltes du Genil. Grenade passera l'hiver à compter ses greniers.", e:{au:6,pr:3,no:4}},
      tri:{t:"Contre toute attente la place capitule : la garnison, sans secours, traite au bout de cinq semaines. La vallée du Genil est ouverte et Alhama cesse d'être une île.", e:{au:14,pr:6,no:9,flag:"loja",ch:"Loja tomba, et la route d'Alhama cessa d'être un chemin de montagne."}}
    }},
   {label:"Différer d'un an et employer l'année à fondre des bombardes.",
    voie:"divergente", port:"admin", base:52, cost:3,
    note:"Les fondeurs sont français et allemands. Il faut les faire venir et les payer.",
    out:{
      crit:{t:"Les fondeurs sont mal payés et repartent. On a perdu la saison et l'argent, et Alhama a failli tomber pendant qu'on attendait.", e:{t:-4,au:-10,pr:-5}},
      fail:{t:"Six bombardes, toutes de calibres différents, aucune munition commune.", e:{au:-4,t:-2}},
      part:{t:"On obtient un train de siège médiocre mais réel. Ce sera pour la campagne suivante.", e:{au:3}},
      succ:{t:"Vingt bombardes de calibre uniforme, avec leurs fondeurs attachés à la couronne. La guerre de Grenade vient de changer de nature.", e:{au:9,pr:4,flag:"artillerie_royale",ch:"On passa l'année à fondre du bronze, et la guerre cessa d'être une affaire de cavaliers."}},
      tri:{t:"Non seulement le train de siège existe, mais on a fondé une fonderie royale à Huéscar avec ses maîtres, ses moules et son école. Aucune place de Grenade ne tiendra plus deux semaines.", e:{au:13,pr:7,co:5,flag:"artillerie_royale",flag2:"fonderie_royale",ch:"On institua une fonderie du roi, et les murailles cessèrent de compter."}}
    }},
   {label:"Renoncer à Loja et acheter la vallée : pensions aux alcaides, tribut à l'émir.",
    voie:"inouïe", port:"diplomatie", base:38, cost:2,
    note:"Payer les capitaines ennemis plutôt que les combattre. Cela se saura à la cour.",
    out:{
      crit:{t:"L'argent est pris et dénoncé publiquement à Grenade. On a financé la garnison qu'on voulait acheter et l'on passe pour un roi qui n'ose pas se battre.", e:{t:-5,au:-14,no:-10}},
      fail:{t:"Deux alcaides prennent l'or, aucun ne bouge.", e:{t:-3,au:-6,no:-4}},
      part:{t:"La vallée devient poreuse. Les convois pour Alhama passent moyennant péage.", e:{t:-2,pr:4,au:2}},
      succ:{t:"Trois alcaides passent au service castillan avec leurs tours. On a pris la vallée sans un siège.", e:{au:10,pr:6,no:-4,flag:"alcaides_achetes",ch:"On acheta les capitaines de l'ennemi, ce qui coûta moins cher qu'une bombarde."}},
      tri:{t:"La méthode fait école : on établit une caisse permanente pour les ralliements de frontière. Grenade se défera par ses propres capitaines avant de se défaire par les armes.", e:{au:15,pr:9,t:5,no:-5,flag:"alcaides_achetes",flag2:"caisse_frontiere",ch:"On institua une caisse pour acheter l'ennemi, et elle rendit plus que l'artillerie."}}
    }}
  ]
},

1483:{
  id:"n1483", t:"L'Axarquía, puis Lucena", place:"Les montagnes de Málaga, mars 1483",
  body:[
   "La chevalerie andalouse est entrée dans les montagnes de l'Axarquía pour razzier. Elle s'y est perdue. Trois jours de défilés, pas d'eau, les paysans maures sur les crêtes : mille morts, quatre cents prisonniers, et le marquis de Cadix qui s'échappe seul par un sentier de chèvres.",
   "Six semaines plus tard, la chance retourne : Boabdil, l'émir jeune, est pris à Lucena en tentant sa propre razzia. Le roi de Grenade est dans une tour de Castille.",
   "Ce qu'on fait de lui décidera de la guerre plus sûrement que dix sièges. Son père règne toujours à Grenade et le hait."
  ],
  opts:[
   {label:"Le relâcher contre vassalité, tribut et guerre civile à Grenade.",
    voie:"historique", port:"diplomatie", base:44, cost:2,
    note:"Rendre un roi à ses ennemis. C'est ce qui fut fait, et cela dura neuf ans.",
    out:{
      crit:{t:"Boabdil relâché se réconcilie avec son père contre l'envahisseur. On a rendu un roi et uni Grenade.", e:{au:-14,pr:-6,ch:"On rendit l'émir, et il fit la paix avec son père contre nous."}},
      fail:{t:"Il rentre, prête serment, ne paie rien et ne combat personne.", e:{au:-6,t:-2}},
      part:{t:"Grenade se divise en deux obédiences. La frontière est plus calme, l'émirat plus faible.", e:{au:5,pr:3}},
      succ:{t:"La guerre civile éclate à Grenade. Deux émirs, deux capitales, et une frontière qui ne menace plus personne.", e:{au:11,pr:6,t:5,flag:"grenade_divisee",ch:"On rendit l'émir à son père, et ils se déchirèrent pour nous."}},
      tri:{t:"Boabdil tient l'Albaicín contre son père et paie son tribut avec exactitude. Grenade se fait la guerre à elle-même et la Castille arbitre.", e:{au:16,pr:9,t:9,flag:"grenade_divisee",flag2:"grenade_vassale",ch:"L'émir de Grenade devint le vassal de Castille contre son propre père."}}
    }},
   {label:"Le garder en otage et négocier place par place contre sa liberté.",
    voie:"divergente", port:"justice", base:50, cost:1,
    note:"Un roi captif vaut plus qu'un roi vassal — tant qu'on ne le rend pas.",
    out:{
      crit:{t:"Grenade le déclare déchu et se donne un autre émir. On garde un otage sans valeur et l'on a perdu le seul levier qu'on avait.", e:{au:-12,t:-3}},
      fail:{t:"Les négociations traînent, aucune place ne change de main.", e:{au:-5}},
      part:{t:"Deux tours de la frontière sont cédées contre des adoucissements de captivité.", e:{au:4,pr:3}},
      succ:{t:"Quatre places tombent sans un coup, payées par la liberté qu'on ne rend jamais tout à fait.", e:{au:10,pr:6,no:5,flag:"otage_royal"}},
      tri:{t:"On monnaye si bien la captivité que la frontière avance de trente lieues sans qu'une bombarde soit tirée. L'émir finit par préférer la Castille à Grenade.", e:{au:15,pr:10,t:6,flag:"otage_royal",flag2:"frontiere_avancee",ch:"On ne rendit jamais l'émir, et l'on prit son royaume place par place."}}
    }},
   {label:"Reconnaître Boabdil roi de Grenade sous protection castillane, et le réinstaller par les armes.",
    voie:"inouïe", port:"guerre", base:32, cost:4,
    note:"Faire de l'émirat un royaume client au lieu de le conquérir. Aucun roi de Castille n'y a pensé.",
    out:{
      crit:{t:"L'armée castillane entre à Grenade pour installer un émir que personne ne veut. Elle en ressort poursuivie, et les deux Grenades s'unissent enfin contre nous.", e:{au:-20,pr:-12,no:-8,t:-6}},
      fail:{t:"L'expédition s'arrête à Loja. Boabdil reste un prétendant sans royaume, entretenu à nos frais.", e:{au:-8,t:-5}},
      part:{t:"Boabdil tient l'Albaicín par nos garnisons. C'est cher et ce n'est pas rien.", e:{au:3,t:-3,pr:-2}},
      succ:{t:"Grenade reconnaît Boabdil, qui reconnaît la Castille. Un royaume musulman sous protection chrétienne, tribut réglé, culte garanti.", e:{au:12,pr:8,t:7,flag:"grenade_protegee",ch:"On fit de Grenade un royaume client, et l'on cessa d'avoir une frontière."}},
      tri:{t:"Le protectorat tient et se révèle une machine à rentes : le tribut de Grenade dépasse ce que trois provinces castillanes rapportent, et la route de Berbérie s'ouvre. Nul n'a jamais tenté cela.", e:{au:17,pr:13,t:14,co:6,flag:"grenade_protegee",flag2:"route_berberie",paix:"grenade",ch:"Grenade demeura, et paya. On y gagna plus qu'à la détruire."}}
    }}
  ]
},

1484:{
  id:"n1484", t:"Le Saint-Office passe l'Èbre", place:"Saragosse et Teruel",
  body:[
   "Le tribunal fonctionne en Castille depuis quatre ans. On veut l'étendre à l'Aragon, où il existe déjà une inquisition pontificale, vieille, lente et sans moyens.",
   "Les Corts d'Aragon répondent que la confiscation des biens est contraire aux fueros, et qu'un tribunal royal nommé à Séville n'a rien à faire à Saragosse. Teruel ferme ses portes à l'inquisiteur.",
   "Derrière la question de procédure il y a la vraie : les fueros d'Aragon tiennent-ils contre la volonté du roi."
  ],
  opts:[
   {label:"Passer outre, garnison à Teruel, tribunal installé de force.",
    voie:"historique", port:"foi", base:42, cost:3,
    note:"C'est ce qui fut fait. L'inquisiteur Arbués sera poignardé dans sa cathédrale.",
    out:{
      crit:{t:"L'inquisiteur est assassiné dans la Seo. La répression qui suit vide Saragosse de ses marchands et l'Aragon retient la leçon : le roi force ses fueros quand il veut.", e:{au:6,co:-16,pr:-14,no:-8,ch:"On poignarda l'inquisiteur dans sa propre cathédrale, et l'Aragon paya pour cent ans."}},
      fail:{t:"Le tribunal s'installe et ne juge personne pendant deux ans. On a payé une garnison pour une chaise vide.", e:{co:-8,t:-3,au:-3}},
      part:{t:"Teruel cède. Le tribunal fonctionne, contesté, sous escorte.", e:{au:6,co:-6,pr:-4}},
      succ:{t:"Le Saint-Office s'établit dans les deux couronnes sous une seule autorité. C'est la première institution commune à la Castille et à l'Aragon.", e:{au:13,co:-7,t:6,flag:"office_commun",ch:"Le Saint-Office fut la première chose que les deux couronnes eurent en commun."}},
      tri:{t:"Non seulement le tribunal s'installe, mais le précédent est établi et écrit : sur les matières de foi, la volonté royale prime les fueros. Les juristes en tireront tout le reste.", e:{au:18,co:-9,t:9,flag:"office_commun",flag2:"primaute_royale",ch:"On établit que le roi passait avant le fuero, et l'on ne s'en tint pas à la foi."}}
    }},
   {label:"Négocier : tribunal accepté, confiscations abandonnées, juges aragonais.",
    voie:"divergente", port:"diplomatie", base:48, cost:2,
    note:"Sans les confiscations, le tribunal ne se finance plus lui-même.",
    out:{
      crit:{t:"Les concessions sont prises pour de la faiblesse et les Corts en demandent d'autres. On n'a ni tribunal ni autorité.", e:{au:-12,co:4,t:-3}},
      fail:{t:"L'accord se fait puis se défait sur le détail des nominations.", e:{au:-5,co:-3}},
      part:{t:"Un tribunal aragonais existe, modeste, qui juge peu et ne confisque pas.", e:{au:3,co:5}},
      succ:{t:"L'Aragon accepte le tribunal parce qu'il en garde le contrôle. Rien n'est arraché, tout est obtenu.", e:{au:8,co:12,pr:5,flag:"office_negocie",ch:"On obtint le tribunal en renonçant à ce qu'il rapportait, et l'Aragon ne se souleva pas."}},
      tri:{t:"Le compromis devient une doctrine des rapports entre les couronnes : ce que le roi veut passe par les corps du royaume où il l'applique. L'union se solidifie par le consentement plutôt que par la contrainte.", e:{au:12,co:18,pr:9,flag:"office_negocie",flag2:"union_consentie",ch:"On apprit à gouverner l'Aragon en aragonais, ce qui valut mieux que des garnisons."}}
    }},
   {label:"Suspendre l'extension et borner le tribunal à la Castille par édit.",
    voie:"inouïe", port:"justice", base:36, cost:1,
    note:"Arrêter volontairement le seul instrument royal qui s'étende tout seul.",
    out:{
      crit:{t:"Rome y voit un désaveu, la Castille une reculade, et les prédicateurs reprennent l'affaire contre la couronne elle-même.", e:{au:-14,co:-6,pr:-6}},
      fail:{t:"L'édit est publié et contourné : les inquisiteurs castillans opèrent en Aragon sans titre.", e:{au:-6}},
      part:{t:"Le tribunal reste castillan. L'Aragon respire et le remarque.", e:{co:8,pr:4}},
      succ:{t:"On a borné par écrit un pouvoir qui n'en avait pas. Les Corts d'Aragon votent un service extraordinaire de gratitude.", e:{co:15,pr:8,t:8,au:4,flag:"office_borne",ch:"On arrêta le Saint-Office aux frontières de Castille, ce qui ne s'était jamais vu."}},
      tri:{t:"L'édit devient le premier texte du règne à limiter une juridiction royale par une autre. Les légistes aragonais le citeront pendant deux siècles, et l'Aragon sera loyal comme il ne l'a jamais été.", e:{co:20,pr:12,t:10,au:8,flag:"office_borne",flag2:"juridiction_bornee",ch:"Le roi se donna lui-même une limite, et l'Aragon lui fut fidèle pour cela."}}
    }}
  ]
},

1485:{
  id:"n1485", t:"Ronda, et le bronze", place:"Ronda, mai 1485",
  body:[
   "Ronda est sur un rocher fendu par une gorge de cent brasses. Aucune armée ne l'a jamais prise. La ville commande toute la serranía et les convois qui vont de Málaga à la frontière.",
   "On a maintenant des bombardes — assez pour battre un mur en quinze jours au lieu de six mois. Ce que l'artillerie fait aux murailles, personne dans la péninsule ne l'a encore vu.",
   "Le train de siège coûte à lui seul plus que trois années de la Cour. Il faudra le dire aux Cortès."
  ],
  opts:[
   {label:"Battre la ville au canon, sans assaut.",
    voie:"historique", port:"guerre", base:46, cost:5,
    note:"Quinze jours de bombardement. C'est ce qui fut fait, et Ronda se rendit.",
    out:{
      crit:{t:"Les bombardes éclatent l'une après l'autre, faute de fondeurs. Le siège s'éternise, la peste entre au camp, on lève.", e:{au:-14,pr:-10,t:-6}},
      fail:{t:"Les murs tiennent plus longtemps que prévu et l'on négocie une reddition coûteuse.", e:{t:-5,au:-3}},
      part:{t:"Ronda capitule après cinq semaines. La serranía est ouverte.", e:{au:7,pr:4}},
      succ:{t:"Les murs tombent en quinze jours et la ville se rend sans assaut. Toute la serranía, soit soixante-dix places, se soumet dans le mois.", e:{au:14,pr:8,no:7,flag:"ronda",ch:"Ronda tomba en quinze jours, et soixante-dix places avec elle."}},
      tri:{t:"Ronda et la serranía tombent, et la manière frappe l'Europe : on écrit de Naples et de Bourgogne pour savoir comment la Castille a fait. L'artillerie royale devient une réputation.", e:{au:19,pr:11,no:9,co:6,flag:"ronda",flag2:"artillerie_royale",ch:"L'Europe apprit à Ronda que les murailles avaient cessé de compter."}}
    }},
   {label:"Contourner Ronda et couper Málaga de la frontière.",
    voie:"divergente", port:"guerre", base:52, cost:3,
    note:"Prendre le pays plutôt que la place. Moins glorieux, moins cher.",
    out:{
      crit:{t:"L'armée s'étire dans la serranía sans base et se fait harceler jusqu'à devoir se retirer par où elle est venue.", e:{au:-12,pr:-8,no:-6}},
      fail:{t:"On ravage sans tenir. Tout est à refaire l'an prochain.", e:{t:-4,au:-4}},
      part:{t:"Les vallées sont tenues, Ronda est isolée sans être prise.", e:{au:5,pr:4}},
      succ:{t:"Málaga est coupée de l'intérieur. Ronda, sans ravitaillement, se rendra d'elle-même dans l'année.", e:{au:10,pr:8,t:4,flag:"serrania"}},
      tri:{t:"La campagne réussit si bien qu'on établit une ligne de places tenues et payées, qui avance chaque année sans bataille. La guerre devient une administration.", e:{au:14,pr:12,t:7,co:5,flag:"serrania",flag2:"frontiere_avancee",ch:"On cessa de prendre des villes et l'on se mit à prendre le pays."}}
    }},
   {label:"Offrir aux villes de la serranía le statut de mudéjars protégés contre reddition sans siège.",
    voie:"inouïe", port:"justice", base:40, cost:2,
    note:"Garantir la loi et les biens des vaincus. Le clergé de camp criera à la trahison.",
    out:{
      crit:{t:"La garantie est violée par les hommes d'armes dès la première ville, et plus aucune ne se rendra sans siège pendant six ans.", e:{au:-16,pr:-10,no:-6}},
      fail:{t:"Deux villes traitent, les autres attendent de voir. On ne voit rien de concluant.", e:{au:-4,t:-2}},
      part:{t:"Sept villes se rendent aux conditions. Elles tiennent parole et nous aussi.", e:{au:6,pr:7,t:3}},
      succ:{t:"La serranía entière se rend sans un siège. On gagne une province avec ses habitants, ses moulins et ses récoltes intacts.", e:{au:12,pr:15,t:8,flag:"mudejars_garantis",ch:"On promit aux vaincus leur loi et leurs biens, et ils ouvrirent leurs portes."}},
      tri:{t:"Le statut devient la règle de toute la conquête : les villes se rendent d'avance pour l'obtenir. Le royaume qu'on prend n'est pas ruiné, et il paie l'impôt dès l'année suivante.", e:{au:17,pr:20,t:14,co:8,flag:"mudejars_garantis",flag2:"conquete_menagee",ch:"On conquit un royaume sans le détruire, ce qui n'était jamais arrivé."}}
    }}
  ]
},

1486:{
  id:"n1486", t:"Le Génois de Palos", place:"Alcalá de Henares, janvier 1486",
  body:[
   "Un marin génois, entretenu depuis deux ans par les moines de La Rábida, est enfin reçu. Il soutient qu'on peut atteindre les Indes par l'ouest en trois semaines, et il en donne le calcul.",
   "La commission de Talavera examine le calcul. Il est faux : le Génois sous-estime le tour de la terre d'un tiers. Tous les cosmographes de Salamanque le disent, et ils ont raison.",
   "Il demande le titre d'amiral, la vice-royauté des terres découvertes et le dixième de ce qui en viendra. Pour un homme dont on vient de démontrer qu'il se trompe."
  ],
  opts:[
   {label:"Le renvoyer sans le congédier : pension modeste, réponse ajournée.",
    voie:"historique", port:"cour", base:56, cost:1,
    note:"C'est ce qui fut fait, six ans durant. Il attendra Grenade.",
    out:{
      crit:{t:"Il part pour le Portugal en emportant ses cartes, et l'on entendra parler de lui d'une autre cour.", e:{au:-6,pr:-4,ch:"On laissa partir le Génois, et un autre roi le reçut."}},
      fail:{t:"Il reste, aigri, et occupe la cour de ses réclamations.", e:{au:-2,t:-1}},
      part:{t:"Il attend. On a gagné du temps sans rien perdre.", e:{}},
      succ:{t:"La pension le retient et l'on garde la main sur une possibilité qui ne coûte presque rien.", e:{t:-1,au:3,flag:"genois_retenu"}},
      tri:{t:"On le retient et l'on met discrètement deux pilotes de Palos à vérifier ses routes. Le jour où l'on voudra, tout sera prêt.", e:{au:6,pr:3,flag:"genois_retenu",flag2:"pilotes_palos",ch:"On fit attendre le Génois, mais on prépara ses navires."}}
    }},
   {label:"Accorder les caravelles tout de suite, sur les fonds de la Sainte Hermandad.",
    voie:"divergente", port:"admin", base:38, cost:3,
    note:"En pleine guerre de Grenade. Les Cortès demanderont des comptes.",
    out:{
      crit:{t:"L'expédition ne revient pas. Trois navires, leurs équipages et l'argent de la guerre, perdus pour une erreur de calcul dont on était averti.", e:{t:-8,au:-16,co:-12,ch:"On envoya trois navires vers l'ouest et l'on n'en revit aucun."}},
      fail:{t:"L'armement traîne, les pilotes refusent, et l'affaire s'enlise au port.", e:{t:-5,au:-6,co:-5}},
      part:{t:"Les navires partent, atteignent les Canaries, et rebroussent devant l'océan. On sait au moins que la route existe jusque-là.", e:{t:-3,au:-2,pr:2}},
      succ:{t:"Ils reviennent au bout de huit mois avec des hommes de peau cuivrée, de l'or en poudre et des perroquets. La terre est plus petite qu'on ne croyait, ou il y a quelque chose entre.", e:{au:16,pr:12,t:10,co:8,flag:"decouverte",ch:"Six ans avant l'heure, on sut qu'il y avait quelque chose à l'ouest."}},
      tri:{t:"Non seulement ils reviennent, mais ils reviennent avec une route, des relais aux Canaries et un contrat qui réserve tout à la couronne. La Castille a six ans d'avance et personne pour la suivre.", e:{au:22,pr:16,t:18,co:12,flag:"decouverte",flag2:"route_ouest",ch:"On trouva les Indes par l'ouest, et l'on prit soin d'en garder le secret un an."}}
    }},
   {label:"Refuser le titre mais acheter le calcul : payer ses cartes et armer des pilotes castillans.",
    voie:"inouïe", port:"diplomatie", base:44, cost:2,
    note:"L'idée sans l'homme. Il criera au vol dans toute l'Europe.",
    out:{
      crit:{t:"Il refuse, part pour Lisbonne avec ce qu'il sait, et la Castille passe pour une cour qui vole les étrangers.", e:{au:-12,pr:-5,ch:"On voulut l'idée sans l'homme, et l'on perdit les deux."}},
      fail:{t:"On achète des cartes que les pilotes castillans jugent inutilisables.", e:{t:-3,au:-4}},
      part:{t:"Les cartes sont copiées, l'homme s'en va mécontent. On a quelque chose, on ne sait pas quoi.", e:{t:-2,pr:2}},
      succ:{t:"Deux caravelles castillanes partent sans lui et reconnaissent huit cents lieues d'océan vide — assez pour savoir que la route est plus longue qu'il ne disait, et qu'elle existe.", e:{au:9,pr:7,t:4,flag:"pilotes_palos",ch:"On paya ses cartes et l'on envoya nos propres pilotes."}},
      tri:{t:"L'entreprise devient royale de bout en bout : pilotes castillans, navires castillans, cartes tenues au secret par la chancellerie. Ce qui sera trouvé n'aura pas de vice-roi génois à payer.", e:{au:14,pr:10,t:8,co:6,flag:"pilotes_palos",flag2:"route_ouest",ch:"L'océan fut reconnu par des pilotes du roi, et nul n'eut à en toucher le dixième."}}
    }}
  ]
},

1487:{
  id:"n1487", t:"Ce que l'on laisse derrière", place:"Medina del Campo, décembre 1487",
  body:[
   "Huit ans. Le royaume qui vous a été laissé était un pays sans routes sûres, sans revenus et sans roi reconnu. Ce que vous en avez fait s'écrit maintenant dans les registres de la chancellerie, et il faudra vivre avec.",
   "Une dernière décision, avant que l'acte se referme : où porter l'effort de la décennie qui vient ?"
  ],
  opts:[
   {label:"Grenade. Toute la force du royaume vers la frontière du sud.",
    voie:"historique", port:"guerre", base:54, cost:2,
    note:"La voie réelle. Dix ans de sièges, une réputation immense, un trésor épuisé.",
    out:{
      crit:{t:"L'effort est décidé sans les moyens. La première campagne se solde par un désastre dans les défilés de la Axarquía.", e:{au:-12,t:-5,flag:"cap_grenade",ch:"On voulut Grenade avant d'en avoir les moyens."}},
      fail:{t:"La décision est prise, l'organisation suit mal. Le sud engloutira plus qu'il ne devait.", e:{t:-4,flag:"cap_grenade",ch:"On engagea le royaume dans une guerre dont on avait mal compté le prix."}},
      part:{t:"L'entreprise est lancée. Elle prendra dix ans et tout l'argent disponible.", e:{au:7,flag:"cap_grenade",ch:"Le royaume se tourna vers le sud et n'en détourna plus les yeux."}},
      succ:{t:"L'entreprise est lancée avec méthode : artillerie, ravitaillement, bulle de croisade. Le sud tombera.", e:{au:12,t:5,flag:"cap_grenade",ch:"On prépara la guerre avant de la faire, ce qui était nouveau."}},
      tri:{t:"Tout est en place — argent, canons, alliances, et une chrétienté qui regarde. La conquête est déjà à moitié gagnée.", e:{au:16,t:9,no:8,flag:"cap_grenade",ch:"Il ne resta plus qu'à prendre les villes, ce qui était le plus simple."}}
    }},
   {label:"La mer. Ports, chantiers, Canaries, et ce que les Portugais trouvent au sud.",
    voie:"divergente", port:"diplomatie", base:42, cost:2,
    note:"Renoncer au prestige de la croisade pour une puissance qui ne se voit pas encore.",
    out:{
      crit:{t:"L'argent part dans des chantiers qui ne produisent rien et l'Andalousie, privée de guerre, se soulève contre les nouveaux impôts.", e:{au:-14,t:-6,no:-10,flag:"cap_mer",ch:"On construisit des quais pendant que l'on demandait des lances."}},
      fail:{t:"Quelques caravelles, quelques comptoirs. Le Portugal garde vingt ans d'avance.", e:{t:-3,flag:"cap_mer",ch:"On regarda la mer sans encore savoir qu'y chercher."}},
      part:{t:"Les Canaries sont soumises, les chantiers de Séville tournent. Le sud attendra.", e:{pr:9,t:4,no:-6,flag:"cap_mer",ch:"On acheva les Canaries et l'on remit Grenade à plus tard."}},
      succ:{t:"Une marine atlantique réelle sort des chantiers. Ce que le Portugal trouvera, la Castille pourra le disputer.", e:{pr:14,t:8,au:6,flag:"cap_mer",ch:"La Castille se donna une flotte avant d'avoir un empire."}},
      tri:{t:"Marine, capitaux et cartographes convergent à Séville. Dix ans d'avance sur l'histoire, et personne à la cour ne sait encore ce que cela vaudra.", e:{pr:19,t:12,au:9,flag:"cap_mer",flag2:"ocean_dabord",ch:"On mit tout dans l'océan, sans savoir ce qu'il y avait au bout."}}
    }},
   {label:"L'intérieur. Achever l'administration, les tribunaux, l'université et les comptes avant toute aventure.",
    voie:"inouïe", port:"admin", base:38, cost:2,
    note:"Aucun souverain de ce siècle n'a choisi de ne rien conquérir pendant dix ans.",
    out:{
      crit:{t:"La noblesse et le clergé, privés de guerre et de butin, s'agitent. On reproche au roi de gouverner comme un notaire.", e:{no:-16,au:-10,ch:"On reprocha au roi de préférer les registres aux batailles."}},
      fail:{t:"Les réformes avancent lentement, sans que rien de visible ne les justifie aux yeux du royaume.", e:{au:-6,ch:"On réforma sans que nul ne s'en aperçoive."}},
      part:{t:"Chancelleries, archives et écoles se mettent en place. Le royaume est mieux tenu et personne ne le célèbre.", e:{au:10,pr:9,co:8,flag:"cap_interieur",ch:"On bâtit un État, ce qui ne se chante pas."}},
      succ:{t:"En dix ans, la Castille se dote de l'appareil administratif que les autres royaumes mettront un siècle à construire.", e:{au:16,pr:14,co:12,t:6,flag:"cap_interieur",ch:"Le royaume devint gouvernable, ce qui valait plusieurs provinces."}},
      tri:{t:"Justice, finance, université et archives forment un ensemble cohérent. Ce que l'on lègue n'est pas une conquête mais une machine.", e:{au:21,pr:18,co:16,t:11,flag:"cap_interieur",flag2:"etat_moderne",ch:"On ne laissa aucune ville prise, et l'on laissa un État."}}
    }}
  ]
}


};

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
     voie   : "historique" | "divergente" | "inouïe"
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
   dv  divergence (écart cumulé avec l'histoire réelle)
   flag, flag2, flag3    marqueurs durables, lisibles par req() et par le bilan
   inject: ["id", …]     ajoute des événements de data/injected.js au deck
   ch: "…"               la ligne que le chroniqueur retiendra de l'année */

const NODES = {

1474:{
  id:"n1474", t:"La proclamation de Ségovie", place:"Ségovie, décembre 1474", art:"vierge",
  body:[
   "Henri IV est mort à Madrid le 11 décembre. Trois jours plus tard, sans attendre son mari retenu en Aragon, Isabelle se fait proclamer reine de Castille sur la place de Ségovie. L'épée de justice est portée devant elle, la pointe levée — un geste que personne ne se souvient d'avoir vu pour une femme.",
   "Ferdinand rentre furieux. Ses juristes soutiennent qu'un royaume ne se gouverne pas par une femme et que la couronne de Castille lui revient par la loi salique. Ceux d'Isabelle répondent que la Castille n'a jamais connu cette loi. La cour attend, et le trésor est vide : les revenus royaux ont fondu de moitié sous le règne précédent.",
   "Il faut trancher avant que la nouvelle atteigne le Portugal, où Juana, la fille contestée d'Henri IV, a d'autres partisans."
  ],
  opts:[
   {label:"Signer la Concorde de Ségovie : gouverner ensemble, mais la Castille demeure à Isabelle.",
    voie:"historique", port:"diplomatie", base:58, cost:1,
    note:"Les documents porteront les deux noms. La justice et le patronage restent castillans.",
    out:{
      crit:{t:"La négociation s'envenime. Ferdinand quitte la cour pour l'Aragon et l'on parle ouvertement de rupture ; les grands prennent note qu'il n'y a pas de maître.", e:{au:-10,no:-8,ch:"Le roi partit sans prendre congé, et l'on ne sut pas, cet hiver-là, qui gouvernait."}},
      fail:{t:"L'accord est signé mais mal, avec des clauses ambiguës que les juristes exploiteront pendant dix ans.", e:{au:-4,ch:"On signa un accord dont chacun retint ce qui l'arrangeait."}},
      part:{t:"La Concorde est acceptée. Ferdinand cède sur la Castille et l'on n'en parle plus — mais il ne l'a pas oublié.", e:{au:4,ch:"Les deux couronnes furent accordées, sinon les deux volontés."}},
      succ:{t:"Tanto monta. La formule satisfait les deux camps et les sceaux communs sont gravés dans la semaine.", e:{au:9,no:4,ch:"On grava les armes des deux royaumes sur un même sceau."}},
      tri:{t:"L'accord est proclamé si publiquement, et si vite, que la question ne se rouvrira plus jamais du vivant des deux souverains.", e:{au:14,no:6,co:5,flag:"concorde_forte",ch:"Le doute sur qui régnait fut tranché avant même que les grands n'aient eu le temps d'en profiter."}}
    }},
   {label:"Céder à Ferdinand la primauté en Castille pour acheter sans délai l'armée aragonaise.",
    voie:"divergente", port:"diplomatie", base:64, cost:0,
    note:"La guerre approche et l'Aragon a des hommes. Le prix se paiera plus tard.",
    out:{
      crit:{t:"Les villes castillanes prennent la chose pour une conquête aragonaise déguisée. Burgos et Tolède refusent de prêter serment.", e:{au:-14,co:-12,dv:2,ch:"Les villes dirent qu'elles avaient reçu une reine et qu'on leur rendait un étranger."}},
      fail:{t:"L'armée vient, mais la noblesse castillane murmure qu'on a vendu le royaume.", e:{no:-8,co:-6,dv:2,ch:"On eut des lances, et l'on perdit des cœurs."}},
      part:{t:"Ferdinand obtient la préséance et amène ses capitaines. Les Cortès n'ont pas été consultées et s'en souviendront.", e:{co:-5,dv:3,ch:"Le roi obtint la préséance ; les Cortès obtinrent une rancune."}},
      succ:{t:"Un commandement unique, une armée réelle, et la guerre à venir gagne un an d'avance.", e:{au:6,dv:3,flag:"primaute_aragon",ch:"On préféra une armée à un principe."}},
      tri:{t:"Le geste passe pour de la sagesse conjugale. Ferdinand, obligé, se montre plus généreux qu'exigeant, et l'Aragon paie une partie de la campagne.", e:{au:8,t:4,dv:4,flag:"primaute_aragon",ch:"Le roi, ayant tout obtenu, se crut tenu de payer."}}
    }},
   {label:"Convoquer immédiatement les Cortès pour faire déclarer la succession par les royaumes eux-mêmes.",
    voie:"inouïe", port:"justice", base:38, cost:3,
    note:"Fonder le titre sur le consentement plutôt que sur l'hérédité. Personne n'a jamais fait cela.",
    out:{
      crit:{t:"L'assemblée devient une tribune. On y discute publiquement de la légitimité d'Isabelle, de celle de Juana, et de ce que vaut un roi que l'on peut choisir.", e:{au:-18,no:-10,dv:8,ch:"On demanda aux royaumes de nommer leur reine ; les royaumes s'aperçurent qu'ils le pouvaient."}},
      fail:{t:"Les procureurs arrivent lentement, la session traîne, et le Portugal a le temps de s'armer.", e:{au:-7,t:-2,dv:5,ch:"On perdit un hiver en formalités."}},
      part:{t:"Les Cortès déclarent Isabelle reine et Ferdinand roi, mais y attachent une longue liste de doléances qu'il faudra bien lire un jour.", e:{co:10,au:3,dv:6,flag:"titre_consenti",ch:"Le titre fut confirmé, assorti d'un cahier de plaintes."}},
      succ:{t:"La déclaration est solennelle et unanime. Aucun prétendant ne pourra plus dire que la couronne fut prise.", e:{co:14,au:10,dv:7,flag:"titre_consenti",ch:"Les royaumes déclarèrent eux-mêmes qui les gouvernait, et cela valut mieux qu'une armée."}},
      tri:{t:"Non seulement le titre est confirmé, mais les procureurs, flattés d'avoir été consultés, votent un service extraordinaire pour la guerre qui vient.", e:{co:18,au:12,t:6,dv:8,flag:"titre_consenti",ch:"On leur demanda leur avis ; ils donnèrent leur argent avec."}}
    }}
  ]
},

1475:{
  id:"n1475", t:"Le Portugal entre en Castille", place:"Plasencia, mai 1475",
  etat:{guerre:"portugal"},   // Afonso a franchi la frontière : ce n'est pas un choix
  body:[
   "Afonso V de Portugal a épousé Juana, sa nièce de treize ans, et se proclame roi de Castille en son nom. Il franchit la frontière avec quinze mille hommes. Les Pacheco, les Stúñiga, l'archevêque de Tolède Carrillo — celui-là même qui fit le mariage d'Isabelle — passent de son côté.",
   "Le trésor ne peut pas payer trois mois de campagne. Les villes, elles, ont de l'argent et une hostilité ancienne envers les grands seigneurs qui soutiennent le Portugal."
  ],
  opts:[
   {label:"Lever un service de guerre sur l'argenterie des églises, à charge de remboursement.",
    voie:"historique", port:"foi", base:52, cost:1,
    note:"Trente millions de maravédis dorment dans les sacristies. Rome n'aimera pas.",
    out:{
      crit:{t:"Le clergé se révolte, Rome proteste, et l'on ne récolte qu'une fraction de la somme au prix d'un scandale.", e:{ro:-16,t:3,au:-6,ch:"On prit l'argent des autels et l'on n'en tira que du bruit."}},
      fail:{t:"Les évêques négocient, temporisent, et livrent tard et peu.", e:{ro:-8,t:5,ch:"Les évêques promirent beaucoup et livrèrent lentement."}},
      part:{t:"L'argenterie est fondue. La guerre est financée pour un an ; la dette envers l'Église restera inscrite longtemps.", e:{ro:-6,t:11,flag:"dette_eglise",ch:"On fondit les calices, en jurant de les refaire."}},
      succ:{t:"Le clergé castillan, présenté comme sauveur du royaume, livre l'argent presque de bon gré.", e:{ro:-3,t:14,au:5,ch:"L'Église donna ses vases, et on l'en remercia publiquement."}},
      tri:{t:"Non seulement l'argent vient, mais l'affaire est présentée à Rome comme une croisade intérieure et le pape n'y trouve rien à redire.", e:{t:16,au:7,ro:2,ch:"On fit d'une saisie une œuvre pie."}}
    }},
   {label:"S'appuyer sur les milices urbaines et promettre aux villes la charge des impôts de guerre.",
    voie:"divergente", port:"justice", base:46, cost:2,
    note:"Armer les conseils municipaux contre la noblesse. Efficace, et difficile à défaire.",
    out:{
      crit:{t:"Les milices se retournent contre les seigneurs locaux, pillent, et l'Andalousie s'embrase pour son propre compte.", e:{no:-14,au:-10,pr:-8,dv:4,inject:["revolte_andalouse"],ch:"On donna des armes aux villes ; elles s'en servirent d'abord contre leurs voisins."}},
      fail:{t:"Les villes lèvent des hommes, mal, et réclament aussitôt des privilèges en échange.", e:{co:4,no:-6,t:-2,dv:3,ch:"On eut des milices, et un cahier de demandes."}},
      part:{t:"Les conseils fournissent des hommes et de l'argent. En échange, ils gardent la main sur la levée — un pouvoir qu'ils ne rendront pas.", e:{t:8,co:9,no:-7,dv:4,flag:"villes_armees",ch:"Les villes payèrent la guerre et en tirèrent une fierté durable."}},
      succ:{t:"Les milices urbaines tiennent la Vieille-Castille pendant que la noblesse hésite. La guerre change de nature.", e:{t:10,co:12,au:8,no:-6,dv:5,flag:"villes_armees",ch:"Ce ne furent pas les grands qui sauvèrent la reine, mais les bourgs."}},
      tri:{t:"L'alliance des villes et de la couronne devient l'ossature du règne. Les grands comprennent qu'ils ne sont plus indispensables.", e:{t:12,co:15,au:12,no:-8,dv:6,flag:"villes_armees",ch:"On découvrit cette année-là que la couronne pouvait se passer de la noblesse."}}
    }},
   {label:"Ouvrir une négociation secrète avec Juana : lui offrir un apanage et la reconnaissance de sa naissance.",
    voie:"inouïe", port:"diplomatie", base:30, cost:2,
    note:"Reconnaître l'adversaire pour désarmer sa cause. Politiquement explosif.",
    out:{
      crit:{t:"La lettre est interceptée et lue à Lisbonne. Reconnaître Juana, c'est admettre qu'Isabelle a usurpé. Deux villes changent de camp.", e:{au:-20,no:-10,dv:9,ch:"Une lettre égarée valut à l'ennemi plus qu'une bataille."}},
      fail:{t:"Afonso refuse : il a besoin de la guerre plus que de l'accord. On a perdu du temps et donné une arme.", e:{au:-8,dv:6,ch:"L'offre fut refusée par celui même qu'elle aurait sauvé."}},
      part:{t:"Juana écoute. Rien n'est signé, mais une partie de son entourage castillan commence à douter.", e:{no:5,au:2,dv:7,flag:"juana_ecoute",ch:"On sema le doute dans la maison d'en face."}},
      succ:{t:"Un accord secret est ébauché. Plusieurs seigneurs qui la soutenaient se retirent discrètement de la guerre.", e:{no:12,au:6,dv:8,flag:"juana_ecoute",ch:"L'ennemi perdit ses appuis avant de perdre une bataille."}},
      tri:{t:"Juana accepte le principe d'un apanage. La cause portugaise se vide de sa légitimité castillane en une saison.", e:{no:16,au:12,t:3,dv:10,flag:"juana_pactisee",ch:"On préféra acheter la prétendante plutôt que la combattre, et cela coûta moins cher."}}
    }}
  ]
},

1476:{
  id:"n1476", t:"Toro, et ce qu'on en fait", place:"Toro puis Madrigal, mars-avril 1476",
  body:[
   "La bataille livrée près de Toro le 1er mars n'a rien décidé militairement : l'aile portugaise a tenu, l'aile castillane a rompu, les deux camps ont chanté victoire. Mais Ferdinand a fait rédiger le récit le premier et l'a envoyé partout.",
   "Le royaume, lui, est dans un état que les chroniqueurs eux-mêmes qualifient de sauvage : bandes armées sur les chemins, seigneurs qui rendent la justice à leur guise, villes fortifiées les unes contre les autres. Les Cortès sont convoquées à Madrigal."
  ],
  opts:[
   {label:"Créer la Sainte Hermandad : une police rurale permanente, financée et levée par les conseils municipaux.",
    voie:"historique", port:"justice", base:54, cost:3,
    note:"Une force armée qui ne dépend ni des grands ni du trésor royal.",
    out:{
      crit:{t:"Les villes refusent la charge, l'institution naît sans moyens et devient une source de plaintes plutôt qu'un instrument.", e:{co:-10,au:-6,ch:"On créa une milice sans argent, ce qui fit deux mécontentements au lieu d'un."}},
      fail:{t:"L'Hermandad existe sur le papier. Sur les chemins, rien ne change encore.", e:{t:-2,ch:"L'ordonnance fut lue partout et appliquée nulle part."}},
      part:{t:"Les quadrilles se mettent en place lentement. Les chemins se dégagent dans la Vieille-Castille, pas ailleurs.", e:{au:6,pr:4,co:-3,flag:"hermandad",ch:"Les chemins du nord redevinrent praticables."}},
      succ:{t:"L'Hermandad tient. Les bandes se dispersent, le commerce reprend, et la couronne dispose pour la première fois d'une force qu'elle n'a pas eu à mendier.", e:{paix:"portugal",au:11,pr:8,t:3,no:-4,flag:"hermandad",ch:"Pour la première fois depuis vingt ans, on voyagea sans escorte."}},
      tri:{t:"L'institution dépasse son objet : les quadrilles servent d'armée d'appoint, de police et de collecteurs. Les grands comprennent ce qu'on vient de leur retirer.", e:{paix:"portugal",au:15,pr:10,t:6,no:-7,flag:"hermandad",flag2:"hermandad_forte",ch:"On avait voulu une police ; on obtint une armée qui ne devait rien aux seigneurs."}}
    }},
   {label:"Confier la pacification aux grands seigneurs eux-mêmes, contre confirmation de leurs domaines.",
    voie:"divergente", port:"cour", base:60, cost:2,
    note:"Moins cher, plus rapide, et l'on renonce à reprendre ce qu'ils ont pris.",
    out:{
      crit:{t:"Chacun pacifie chez le voisin. Trois guerres privées éclatent sous couvert de service royal.", e:{au:-12,pr:-8,no:4,dv:3,inject:["guerre_privee"],ch:"On chargea les loups de garder les chemins."}},
      fail:{t:"Les seigneurs encaissent la confirmation et pacifient peu.", e:{au:-6,no:6,dv:3,ch:"On paya d'avance un service qui ne vint pas."}},
      part:{t:"L'ordre revient dans les grands domaines. Ailleurs, il ne revient pas, et la couronne a renoncé à ses reprises.", e:{au:2,no:12,pr:3,dv:4,flag:"grands_confirmes",ch:"L'ordre régna là où il y avait un maître, et nulle part ailleurs."}},
      succ:{t:"La haute noblesse, rassurée sur ses biens, se rallie franchement et met ses lances au service de la guerre portugaise.", e:{paix:"portugal",no:18,au:5,t:4,dv:5,flag:"grands_confirmes",ch:"Les grands, une fois rassurés, servirent bien."}},
      tri:{t:"Le ralliement est complet et gratuit. Mais la couronne vient de renoncer, pour une génération, à récupérer les domaines aliénés sous Henri IV.", e:{paix:"portugal",no:22,au:8,t:7,dv:6,flag:"grands_confirmes",ch:"On acheta la paix des grands au prix du patrimoine royal."}}
    }},
   {label:"Abolir la juridiction seigneuriale sur les chemins royaux et y substituer des juges nommés par la couronne.",
    voie:"inouïe", port:"justice", base:34, cost:4,
    note:"Une réforme judiciaire qui ne sera tentée qu'un siècle plus tard, et jamais aussi tôt.",
    out:{
      crit:{t:"La noblesse y voit une déclaration de guerre en pleine guerre. Deux maisons majeures passent au Portugal.", e:{no:-22,au:-12,dv:9,inject:["defection_noble"],ch:"On voulut prendre la justice aux seigneurs pendant qu'on avait besoin de leurs lances."}},
      fail:{t:"Les juges sont nommés et ne peuvent nulle part siéger. L'ordonnance devient une humiliation.", e:{au:-9,no:-10,dv:6,ch:"Les juges du roi trouvèrent les portes fermées."}},
      part:{t:"Le principe est posé et appliqué sur quelques routes du nord. C'est peu, mais c'est un précédent écrit.", e:{au:7,no:-9,pr:3,dv:7,flag:"chemins_royaux",ch:"On établit un principe que l'on ne put encore appliquer."}},
      succ:{t:"Les chemins royaux passent effectivement sous juridiction de la couronne. Le commerce intérieur s'en ressent aussitôt.", e:{paix:"portugal",au:14,pr:9,co:8,no:-11,dv:8,flag:"chemins_royaux",ch:"Le roi devint juge sur ses propres routes, ce qu'aucun de ses prédécesseurs n'avait osé."}},
      tri:{t:"La mesure réussit si bien que les villes en réclament l'extension à leurs territoires. Un modèle administratif naît trente ans avant son heure.", e:{paix:"portugal",au:19,pr:12,co:13,no:-12,dv:10,flag:"chemins_royaux",flag2:"justice_royale",ch:"Ce qui avait été conçu comme une mesure de guerre devint la charpente du royaume."}}
    }}
  ]
},

1477:{
  id:"n1477", t:"L'Andalousie sans roi", place:"Séville, juillet 1477", art:"isabelle",
  body:[
   "Isabelle descend en Andalousie sans armée, avec sa chancellerie. Séville est partagée entre le duc de Medina Sidonia et le marquis de Cadix, qui s'y font la guerre depuis des années comme deux princes étrangers. La ville a peur des deux.",
   "La reine s'installe à l'Alcázar et tient audience publique tous les vendredis. En deux mois, quatre mille personnes quittent la ville par crainte d'être jugées."
  ],
  opts:[
   {label:"Tenir l'audience du vendredi et juger en personne, sans exception ni égard au rang.",
    voie:"historique", port:"justice", base:50, cost:2,
    note:"La justice comme spectacle politique. Lent, épuisant, spectaculaire.",
    out:{
      crit:{t:"Un jugement mal informé frappe un innocent notable. L'affaire fait le tour de l'Andalousie et l'on parle de tyrannie.", e:{au:-11,pr:-4,ch:"Une sentence trop prompte fit plus de tort que dix ans de désordre."}},
      fail:{t:"Les audiences s'enlisent dans des affaires minuscules pendant que les vrais coupables s'absentent.", e:{au:-4,ch:"On jugea beaucoup de petites gens et aucun grand."}},
      part:{t:"L'ordre revient à Séville tant que la reine y est. On sait déjà que son départ rouvrira tout.", e:{au:7,pr:4,ch:"La ville fut tranquille aussi longtemps que la reine y coucha."}},
      succ:{t:"Medina Sidonia et Cadix sont contraints de quitter Séville et de démanteler leurs forteresses urbaines. La ville respire.", e:{au:14,pr:8,no:-5,ch:"Les deux seigneurs sortirent de Séville par des portes différentes, le même jour."}},
      tri:{t:"L'exemple sévillan se propage : Cordoue, Jerez et Écija réclament la même chose. Une pratique devient une institution.", e:{au:18,pr:11,co:9,no:-6,flag:"justice_andalouse",ch:"Ce que Séville obtint, les autres villes le voulurent, et l'on ne put plus le refuser."}}
    }},
   {label:"Amnistier largement, en échange du démantèlement immédiat des forteresses privées.",
    voie:"divergente", port:"cour", base:56, cost:1,
    note:"Acheter le désarmement avec l'impunité. Rapide, et durablement amer pour les victimes.",
    out:{
      crit:{t:"L'amnistie est perçue comme un aveu de faiblesse. Les forteresses restent debout et les crimes reprennent.", e:{au:-13,pr:-5,dv:3,ch:"On pardonna d'abord et l'on ne put ensuite rien exiger."}},
      fail:{t:"Quelques tours tombent, beaucoup restent. Les familles lésées ne pardonnent pas au roi ce que le roi a pardonné.", e:{au:-5,co:-5,dv:3,ch:"Le pardon du roi ne valut pas celui des veuves."}},
      part:{t:"Le désarmement est réel, l'amertume aussi. La paix est achetée et il faudra la repayer.", e:{au:5,pr:5,no:7,dv:4,ch:"On acheta le calme sans acheter le respect."}},
      succ:{t:"Les forteresses tombent vite et sans effusion. L'Andalousie est pacifiée en une saison au lieu de dix ans.", e:{au:10,pr:9,no:11,dv:5,ch:"On abattit plus de tours par une lettre que par un siège."}},
      tri:{t:"Le procédé fait école. Plusieurs seigneurs offrent spontanément leurs places fortes contre des offices à la cour — un échange que la couronne saura répéter.", e:{au:13,pr:11,no:15,dv:6,flag:"echange_tours",ch:"Les seigneurs découvrirent qu'un office à la cour valait mieux qu'une tour en province."}}
    }},
   {label:"Convoquer les deux maisons rivales et leur imposer un arbitrage écrit, exécutoire, publié.",
    voie:"inouïe", port:"admin", base:36, cost:3,
    note:"Substituer un acte de chancellerie à un rapport de force. Rien n'y oblige les parties.",
    out:{
      crit:{t:"Les deux refusent de comparaître. L'autorité royale est publiquement défiée par écrit, ce qui est pire qu'en silence.", e:{au:-16,no:-8,dv:7,ch:"On les convoqua par acte public ; leur absence fut publique aussi."}},
      fail:{t:"Ils viennent, écoutent, signent et n'appliquent rien. Le papier reste.", e:{au:-6,dv:5,ch:"Ils signèrent ce qu'ils n'avaient pas l'intention de tenir."}},
      part:{t:"L'arbitrage tient un temps. Surtout, il crée un précédent : la couronne juge entre les grands.", e:{au:9,dv:6,flag:"arbitrage_royal",ch:"Le roi jugea entre deux seigneurs, ce qui étonna plus que la sentence."}},
      succ:{t:"L'arbitrage est respecté, la frontière entre les deux maisons fixée par écrit, et cinq autres litiges nobiliaires sont portés devant la cour dans l'année.", e:{au:15,no:5,pr:6,dv:7,flag:"arbitrage_royal",ch:"On vint désormais plaider devant le roi plutôt que se battre."}},
      tri:{t:"La chancellerie devient l'instance naturelle des querelles seigneuriales. Un tribunal permanent s'esquisse là où il n'y avait que des sièges.", e:{au:20,no:9,pr:8,co:6,dv:9,flag:"arbitrage_royal",flag2:"chancellerie",ch:"Ce fut la fin des guerres privées, non par les armes, mais par le greffe."}}
    }}
  ]
},

1478:{
  id:"n1478", t:"Une bulle de Sixte IV", place:"Séville, novembre 1478", art:"torquemada",
  body:[
   "Le pape autorise les monarques à nommer eux-mêmes des inquisiteurs en Castille — trois évêques ou prêtres de plus de quarante ans, révocables par la couronne. C'est une concession considérable : ailleurs en chrétienté, l'Inquisition dépend de Rome.",
   "Les dominicains de Séville pressent : ils affirment que les conversos de la ville judaïsent en secret. Les marchands sévillans, dont beaucoup sont conversos, financent une partie du commerce atlantique. Le prince Jean est né en juin ; la dynastie a un héritier.",
   "La bulle est là. Rien n'oblige à s'en servir."
  ],
  opts:[
   {label:"Accepter la bulle et nommer les premiers inquisiteurs.",
    voie:"historique", port:"foi", base:62, cost:2,
    note:"Un tribunal royal, sous contrôle de la couronne, aux revenus confisqués considérables.",
    out:{
      crit:{t:"Les nominations sont contestées à Rome et à Séville à la fois ; le tribunal naît discrédité et se durcit d'autant.", e:{ro:-10,pr:-8,au:-4,flag:"inquisition",ch:"Le tribunal naquit contesté, et sa réponse fut la rigueur."}},
      fail:{t:"L'installation traîne. Les rumeurs, elles, ne traînent pas : les départs de marchands commencent avant le premier procès.", e:{pr:-9,t:1,flag:"inquisition",ch:"On n'avait encore jugé personne que déjà les maisons se vidaient."}},
      part:{t:"Le tribunal s'installe. Les confiscations rentrent ; le crédit sévillan se rétracte de la même main.", e:{t:7,pr:-11,ro:2,flag:"inquisition",ch:"Le trésor s'emplit de ce que le commerce perdait."}},
      succ:{t:"L'instrument fonctionne et il est royal, non romain : la couronne tient l'Église castillane par un bout qu'aucun prédécesseur n'a tenu.", e:{t:10,au:9,ro:4,pr:-12,flag:"inquisition",ch:"Le roi gagna sur son clergé un pouvoir que Rome ne lui reprendrait plus."}},
      tri:{t:"Le Saint-Office devient en trois ans la plus efficace administration du royaume — et la plus redoutée, y compris par ceux qui l'ont créée.", e:{t:14,au:12,ro:5,pr:-13,flag:"inquisition",flag2:"inquisition_forte",ch:"On avait forgé un outil admirable, et l'on découvrit qu'il ne se rangeait pas."}}
    }},
   {label:"Garder la bulle sans l'employer, et confier la question à une commission d'enquête épiscopale.",
    voie:"divergente", port:"foi", base:44, cost:2,
    note:"Ne pas refuser, ne pas exécuter. Rome s'impatientera, les dominicains aussi.",
    out:{
      crit:{t:"L'inaction est lue comme une protection des conversos. Une émeute éclate à Séville et l'on brûle sans jugement.", e:{au:-14,pr:-10,ro:-6,dv:5,ch:"Faute de tribunal, la rue en tint lieu."}},
      fail:{t:"La commission n'aboutit à rien, Rome reprend la main et menace de nommer ses propres inquisiteurs.", e:{ro:-9,au:-5,dv:4,ch:"On perdit l'affaire à force de ne pas la trancher."}},
      part:{t:"L'enquête traîne assez pour que la crise retombe. Le commerce sévillan reste en place ; les dominicains ne désarment pas.", e:{pr:6,ro:-4,dv:6,inject:["pression_dominicains"],ch:"On gagna du temps, et rien d'autre."}},
      succ:{t:"La commission conclut à des cas isolés. Séville garde ses marchands, la couronne garde la bulle en réserve.", e:{pr:11,t:3,dv:7,flag:"bulle_reserve",ch:"On tint l'arme sans la tirer, ce qui vaut souvent mieux."}},
      tri:{t:"Le rapport épiscopal, prudent et documenté, devient la doctrine officielle : on jugera les faits, pas les origines. Séville prospère.", e:{pr:16,t:6,au:6,dv:9,flag:"bulle_reserve",flag2:"doctrine_faits",ch:"On décida de juger ce que les gens faisaient plutôt que ce qu'ils étaient."}}
    }},
   {label:"Refuser la bulle et publier une garantie royale de protection pour les convertis.",
    voie:"inouïe", port:"foi", base:26, cost:3,
    note:"Rome, les dominicains et une partie de la cour contre vous. Le commerce et le crédit avec vous.",
    out:{
      crit:{t:"Rome parle de désobéissance, une partie du clergé castillan se détache ouvertement, et le refus est retourné contre la dynastie comme une preuve d'hérésie.", e:{ro:-24,au:-16,dv:12,inject:["schisme_clerc"],ch:"On avait voulu protéger des sujets ; on se retrouva accusé avec eux."}},
      fail:{t:"La garantie est publiée et ignorée. Rome envoie ses propres inquisiteurs et la couronne n'a plus aucun contrôle sur eux.", e:{ro:-14,au:-8,dv:9,flag:"inquisition_romaine",ch:"On refusa de tenir le couteau ; un autre le tint."}},
      part:{t:"La protection tient à Séville et à Burgos, nulle part ailleurs. Rome se refroidit durablement.", e:{ro:-12,pr:12,dv:10,flag:"protection_conversos",ch:"Le roi protégea ses marchands et perdit son pape."}},
      succ:{t:"La garantie royale tient. Le capital converso reste, les foires de Medina gonflent, et l'on paie cela d'une papauté hostile pour dix ans.", e:{ro:-14,pr:19,t:6,dv:12,flag:"protection_conversos",ch:"On choisit le crédit contre la faveur romaine."}},
      tri:{t:"Le refus est si bien argumenté, et si bien accompagné de dons aux ordres mendiants, que Rome se contente de protester. Un précédent immense est posé.", e:{ro:-7,pr:23,t:9,au:8,dv:14,flag:"protection_conversos",flag2:"concorde_trois_lois",ch:"Il se trouva un royaume chrétien pour dire non à une bulle, et n'en pas mourir."}}
    }}
  ]
},

1479:{
  id:"n1479", t:"Deux couronnes, une maison", place:"Barcelone, janvier 1479", art:"ferdinand",
  body:[
   "Jean II d'Aragon est mort. Ferdinand hérite de l'Aragon, de la Catalogne, de Valence, de la Sicile, des Baléares et de leurs dettes. La double monarchie n'est plus un projet de mariage : c'est un fait, et un problème.",
   "L'Aragon ne se gouverne pas comme la Castille. Rien ne s'y lève sans le vote des Corts, rien ne s'y décide sans les fueros, et le Justicia d'Aragon peut annuler un ordre royal. Au même moment, le traité d'Alcáçovas se négocie avec le Portugal : Juana renoncera, et l'on partagera l'Atlantique.",
   "La question qui se pose n'est pas de savoir si vous héritez, mais ce que vous en faites."
  ],
  opts:[
   {label:"Union personnelle stricte : chaque royaume garde ses lois, ses Cortès et son trésor.",
    voie:"historique", port:"admin", base:60, cost:2,
    note:"La solution réelle. Simple à obtenir, coûteuse à gouverner pendant quarante ans.",
    out:{
      crit:{t:"Les Catalans exigent des garanties si étendues que le roi y perd une partie de ce que son père détenait.", e:{au:-8,t:-3,ch:"On jura les fueros, et l'on jura plus qu'on ne voulait."}},
      fail:{t:"Le serment est prêté sans enthousiasme des deux côtés. Chaque royaume soupçonne l'autre de le financer.", e:{co:-5,ch:"Chacun crut payer pour le voisin."}},
      part:{t:"L'union tient. Elle exigera désormais deux voyages, deux chancelleries et deux budgets.", e:{au:5,ro:3,flag:"union_personnelle",ch:"Deux royaumes, un roi, et deux fois plus de chemin à faire."}},
      succ:{t:"Le serment de Barcelone se passe bien. La flotte aragonaise et les juristes catalans entrent au service de la couronne commune.", e:{au:10,t:5,co:5,flag:"union_personnelle",ch:"L'Aragon apporta ses galères, ses juristes et ses querelles."}},
      tri:{t:"L'union est présentée comme une restauration plutôt qu'une conquête. Valence vote un service, ce qu'elle ne faisait plus depuis vingt ans.", e:{au:13,t:9,co:9,flag:"union_personnelle",ch:"On fit d'un héritage une réconciliation."}}
    }},
   {label:"Créer un Conseil des Deux Couronnes, compétent pour la guerre, la diplomatie et les levées communes.",
    voie:"divergente", port:"admin", base:32, cost:5,
    note:"Un organe commun là où l'histoire n'en a jamais créé. Les fueros s'y opposent frontalement.",
    out:{
      crit:{t:"Le Justicia d'Aragon déclare le Conseil contraire aux fueros. La Catalogne parle de reprendre la guerre civile qu'elle vient à peine de finir.", e:{au:-18,co:-16,dv:10,inject:["crise_catalane"],ch:"On voulut un conseil commun et l'on réveilla une guerre éteinte."}},
      fail:{t:"Le Conseil est créé, siège deux fois, et se dissout faute de compétence reconnue nulle part.", e:{au:-7,t:-4,dv:7,ch:"Le conseil commun n'eut de commun que le nom."}},
      part:{t:"Le Conseil obtient la seule compétence diplomatique. C'est peu, et c'est plus qu'aucun souverain n'obtiendra avant Philippe V.", e:{au:8,dv:9,flag:"conseil_deux",ch:"On unit d'abord les ambassades, faute de pouvoir unir les impôts."}},
      succ:{t:"Guerre et diplomatie passent au Conseil commun. Les levées restent séparées, mais l'architecture existe.", e:{au:15,t:5,dv:11,flag:"conseil_deux",ch:"Pour la première fois, une décision fut prise au nom des deux royaumes ensemble."}},
      tri:{t:"Le Conseil obtient jusqu'à une compétence fiscale limitée. Ce qui naît là ne ressemble plus à une union personnelle mais à un État.", e:{au:20,t:10,co:8,dv:14,flag:"conseil_deux",flag2:"etat_commun",ch:"Ce ne fut plus un roi portant deux couronnes, mais un royaume en portant deux noms."}}
    }},
   {label:"Faire financer l'effort commun par l'Aragon en invoquant l'héritage, avant que les Corts ne s'organisent.",
    voie:"inouïe", port:"diplomatie", base:30, cost:1,
    note:"Un précédent fiscal vaudrait plus que dix victoires. S'il échoue, la Catalogne s'embrase.",
    out:{
      crit:{t:"Les Corts de Barcelone dénoncent une violation des fueros. Le roi est contraint de jurer publiquement qu'il ne recommencera pas.", e:{au:-20,co:-14,dv:9,inject:["crise_catalane"],ch:"On demanda de l'argent avant d'avoir juré les libertés, et l'on jura deux fois plus fort ensuite."}},
      fail:{t:"Refus poli et unanime. On a montré son intention sans obtenir la somme.", e:{co:-8,au:-6,dv:6,ch:"L'Aragon refusa avec une courtoisie qui valait un affront."}},
      part:{t:"Valence consent un service ; la Catalogne et l'Aragon refusent. Le précédent existe, à moitié.", e:{t:6,co:-5,dv:8,ch:"Un royaume paya, deux refusèrent, et l'on retint le premier."}},
      succ:{t:"Un service extraordinaire est voté. Le principe qu'un effort castillan peut être financé par l'Aragon vient d'être admis une fois.", e:{t:12,au:9,dv:11,flag:"precedent_fiscal",ch:"On obtint un précédent, ce qui vaut mieux qu'un trésor."}},
      tri:{t:"Non seulement le service est voté, mais il est renouvelable. Le principal obstacle structurel de la double monarchie vient d'être entamé.", e:{t:17,au:13,co:5,dv:14,flag:"precedent_fiscal",flag2:"fiscalite_commune",ch:"L'Aragon paya pour la Castille, ce qui n'était jamais arrivé et devint une habitude."}}
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
    voie:"historique", port:"admin", base:48, cost:3,
    note:"Trente millions de maravédis par an. Chaque grand y perdra quelque chose, aucun ne perdra tout.",
    out:{
      crit:{t:"La gradation est jugée arbitraire. Trois maisons se coalisent, et l'on doit suspendre la mesure sans avoir rien encaissé.", e:{au:-14,no:-12,t:-2,ch:"On voulut ne fâcher personne et l'on fâcha tout le monde."}},
      fail:{t:"Les reprises sont contestées cas par cas. Le rendement réel est le tiers de ce qu'on attendait.", e:{t:5,no:-8,ch:"Chaque rente reprise coûta un procès."}},
      part:{t:"La mesure passe. Le revenu royal remonte nettement ; la rancune s'installe pour une génération.", e:{t:14,au:8,no:-11,co:6,flag:"declaratoire",ch:"La couronne reprit ce qu'elle avait donné, et l'on ne le lui pardonna pas."}},
      succ:{t:"La gradation par ancienneté de service désarme les protestations : les plus anciens fidèles perdent le moins. Le trésor double presque.", e:{t:20,au:13,no:-7,co:9,flag:"declaratoire",ch:"On reprit beaucoup en donnant l'impression de ménager chacun."}},
      tri:{t:"L'opération est menée avec une telle maîtrise comptable que plusieurs seigneurs restituent volontairement pour ne pas être mis en cause. Le revenu royal est refondé.", e:{t:26,au:17,no:-4,co:12,flag:"declaratoire",flag2:"finances_refondees",ch:"Il se trouva des grands pour rendre d'eux-mêmes, ce qui valut mieux que la contrainte."}}
    }},
   {label:"Renoncer à la reprise et négocier à la place un impôt permanent sur le commerce des laines.",
    voie:"divergente", port:"cour", base:44, cost:2,
    note:"Épargner la noblesse et taxer la Mesta et les marchands. Les villes paieront.",
    out:{
      crit:{t:"Les marchands de Burgos et la Mesta font front. L'impôt est voté puis rendu inapplicable par une nuée d'exemptions.", e:{co:-14,pr:-8,t:-2,dv:5,ch:"On vota un impôt que personne ne paya."}},
      fail:{t:"L'impôt rentre mal et détourne une part du commerce vers les ports portugais.", e:{t:4,pr:-7,co:-7,dv:4,ch:"La laine trouva d'autres chemins que ceux du fisc."}},
      part:{t:"L'impôt rapporte, moins que la Déclaratoire, et la noblesse reste intacte — puissante, propriétaire, et reconnaissante.", e:{t:9,no:12,co:-8,pr:-4,dv:6,ch:"On préféra la gratitude des grands au revenu des rentes."}},
      succ:{t:"Le prélèvement sur les laines devient la ressource stable que la Castille n'avait pas. Les grands, épargnés, servent loyalement.", e:{t:15,no:15,co:-5,dv:7,flag:"impot_laines",ch:"La laine paya ce que les seigneurs ne payèrent pas."}},
      tri:{t:"L'impôt est accepté, indexé et administré par des officiers royaux. La couronne gagne un revenu régulier sans avoir créé un seul ennemi de rang.", e:{t:21,no:18,au:9,dv:9,flag:"impot_laines",flag2:"fisc_commercial",ch:"On trouva le moyen rare d'enrichir la couronne sans blesser personne d'important."}}
    }},
   {label:"Proposer aux Cortès un contrat : impôt régulier consenti chaque décennie, contre droit de regard sur la dépense.",
    voie:"inouïe", port:"justice", base:28, cost:4,
    note:"Un budget contrôlé. Aucune monarchie ibérique n'acceptera cela avant très longtemps.",
    out:{
      crit:{t:"Les procureurs, encouragés, réclament aussi le contrôle des nominations. Ce qui devait renforcer la couronne devient une machine à la limiter.", e:{au:-20,co:14,dv:12,inject:["cortes_exigeantes"],ch:"On ouvrit une porte, et l'on ne put plus la refermer."}},
      fail:{t:"Ni les Cortès ni le Conseil royal ne comprennent la proposition. Elle meurt de son étrangeté.", e:{au:-8,t:-3,dv:8,ch:"On proposa une chose que personne ne sut nommer."}},
      part:{t:"Un accord limité est trouvé : les Cortès voteront décennalement et vérifieront les comptes de guerre seulement.", e:{co:16,t:8,dv:10,flag:"contrat_cortes",ch:"Les villes obtinrent de voir les comptes de la guerre, ce qui les rendit étonnamment généreuses."}},
      succ:{t:"Le contrat est signé. Le revenu devient prévisible pour la première fois depuis un siècle, et les Cortès deviennent une alliée plutôt qu'un obstacle.", e:{co:22,t:15,au:8,dv:12,flag:"contrat_cortes",ch:"On échangea du secret contre de l'argent, et l'échange fut bon."}},
      tri:{t:"L'institution née à Tolède ne ressemble à rien de connu : une couronne forte qui rend des comptes. Les procureurs votent au-delà de ce qu'on demandait.", e:{co:26,t:22,au:14,dv:15,flag:"contrat_cortes",flag2:"budget_consenti",ch:"Il naquit à Tolède une manière de gouverner dont aucun royaume n'avait l'exemple."}}
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
    voie:"historique", port:"guerre", base:56, cost:3,
    note:"Ce que font tous les rois de Castille depuis deux siècles. Prudent, et sans issue.",
    out:{
      crit:{t:"Les contre-raids échouent et Grenade prend deux places de plus. La frontière est plus mauvaise qu'avant Zahara.", e:{au:-12,pr:-6,t:-3,ch:"On répondit à un coup de main par trois, et l'on en reçut cinq."}},
      fail:{t:"Les razzias rapportent du bétail et rien d'autre. Zahara reste perdue.", e:{au:-5,ch:"On ramena des troupeaux et pas de prisonniers."}},
      part:{t:"La frontière se stabilise. Les capitaines andalous sont mécontents : ils voulaient une guerre, on leur donne une garde.", e:{au:4,no:-4,flag:"frontiere_armee",ch:"La frontière tint, ce qui ne suffit à personne."}},
      succ:{t:"Les tours de guet sont refaites, les razzias efficaces, et Grenade demande une trêve — que l'on peut désormais accorder ou refuser.", e:{au:9,t:4,flag:"frontiere_armee",ch:"Pour la première fois depuis longtemps, ce fut Grenade qui demanda la trêve."}},
      tri:{t:"La frontière militarisée devient rentable : parias, tributs, butin. La guerre s'auto-finance avant même d'avoir commencé.", e:{au:12,t:9,flag:"frontiere_armee",flag2:"frontiere_rentable",ch:"On fit de la frontière une ferme, et elle rapporta."}}
    }},
   {label:"Écouter Ponce de León et tenter Alhama : un coup de main au cœur du royaume grenadin.",
    voie:"historique", port:"guerre", base:40, cost:4,
    note:"Alhama est à quarante lieues derrière les lignes. Si l'on y entre, on ne pourra plus reculer.",
    out:{
      crit:{t:"La colonne est interceptée dans la sierra. Le marquis s'échappe, l'essentiel de sa troupe non, et l'Andalousie apprend qu'elle est sans défense.", e:{guerre:"grenade",au:-17,no:-10,t:-4,pr:-5,ch:"On envoya des hommes derrière les montagnes et ils n'en revinrent pas."}},
      fail:{t:"L'escalade échoue de peu. La surprise est perdue et Grenade fortifie tout ce qui pouvait l'être.", e:{guerre:"grenade",au:-8,t:-4,ch:"Il manqua une échelle et deux heures de nuit."}},
      part:{t:"Alhama tombe et devient aussitôt intenable : il faut la ravitailler à travers le territoire ennemi, indéfiniment.", e:{guerre:"grenade",au:8,t:-5,flag:"alhama",inject:["siege_alhama"],flag2:"guerre_grenade",ch:"On prit une ville qu'il fallut ensuite nourrir à bout de bras."}},
      succ:{t:"Alhama est prise et tenue. La guerre de Grenade commence — non plus une frontière, mais une conquête.", e:{guerre:"grenade",au:14,ro:6,no:7,flag:"alhama",inject:["siege_alhama"],flag2:"guerre_grenade",ch:"Ce ne fut plus une frontière, mais une entreprise."}},
      tri:{t:"La prise est si nette qu'elle vaut proclamation. Rome accorde la bulle de croisade et l'argent de la chrétienté commence à entrer.", e:{guerre:"grenade",au:18,ro:12,t:8,no:9,flag:"alhama",inject:["siege_alhama"],flag2:"guerre_grenade",flag3:"bulle_croisade",ch:"Une échelle posée de nuit sur un mur ouvrit dix ans de guerre et vingt ans de gloire."}}
    }},
   {label:"Négocier avec Grenade : restitution de Zahara, tribut, et une trêve longue garantie par écrit.",
    voie:"inouïe", port:"diplomatie", base:34, cost:2,
    note:"Renoncer à la conquête. Le clergé, la noblesse andalouse et la chrétienté entière vous le reprocheront.",
    out:{
      crit:{t:"Abu al-Hasan refuse avec mépris et publie la lettre. Le roi de Castille a demandé la paix à un roi maure : la cour ne s'en remet pas.", e:{au:-22,ro:-12,no:-14,dv:10,ch:"On demanda la paix et l'on reçut le mépris, ce qui coûte plus cher qu'une défaite."}},
      fail:{t:"Les pourparlers échouent sur le tribut. On a perdu une saison et de la réputation.", e:{au:-9,ro:-6,dv:7,ch:"On marchanda un an pour rien."}},
      part:{t:"Une trêve de sept ans est signée, Zahara rendue. La frontière est calme et l'Andalousie furieuse.", e:{t:7,pr:8,no:-12,ro:-8,dv:10,flag:"treve_grenade",ch:"La paix fut signée, et personne en Andalousie ne s'en réjouit."}},
      succ:{t:"La trêve est longue, le tribut substantiel, et le commerce grenadin reprend au bénéfice des ports castillans. On ne fera pas la guerre.", e:{t:13,pr:14,ro:-8,no:-10,dv:13,flag:"treve_grenade",ch:"Grenade paya plus en tribut qu'elle n'aurait valu en butin."}},
      tri:{t:"L'accord va au-delà : Grenade devient vassale tributaire, ouvre ses ports, et la Castille se tourne vers l'Atlantique dix ans avant l'heure.", e:{t:18,pr:19,au:9,ro:-6,no:-9,dv:16,flag:"grenade_vassale",flag2:"ocean_dabord",ch:"On garda Grenade comme un tributaire plutôt qu'un trophée, et l'on regarda vers la mer."}}
    }}
  ]
},

1482:{
  id:"n1482", t:"Ce que l'on laisse derrière", place:"Medina del Campo, décembre 1482",
  body:[
   "Huit ans. Le royaume qui vous a été laissé était un pays sans routes sûres, sans revenus et sans roi reconnu. Ce que vous en avez fait s'écrit maintenant dans les registres de la chancellerie, et il faudra vivre avec.",
   "Une dernière décision, avant que l'acte se referme : où porter l'effort de la décennie qui vient ?"
  ],
  opts:[
   {label:"Grenade. Toute la force du royaume vers la frontière du sud.",
    voie:"historique", port:"guerre", base:54, cost:3,
    note:"La voie réelle. Dix ans de sièges, une réputation immense, un trésor épuisé.",
    out:{
      crit:{t:"L'effort est décidé sans les moyens. La première campagne se solde par un désastre dans les défilés de la Axarquía.", e:{au:-12,t:-5,flag:"cap_grenade",ch:"On voulut Grenade avant d'en avoir les moyens."}},
      fail:{t:"La décision est prise, l'organisation suit mal. Le sud engloutira plus qu'il ne devait.", e:{t:-4,flag:"cap_grenade",ch:"On engagea le royaume dans une guerre dont on avait mal compté le prix."}},
      part:{t:"L'entreprise est lancée. Elle prendra dix ans et tout l'argent disponible.", e:{au:7,ro:6,flag:"cap_grenade",ch:"Le royaume se tourna vers le sud et n'en détourna plus les yeux."}},
      succ:{t:"L'entreprise est lancée avec méthode : artillerie, ravitaillement, bulle de croisade. Le sud tombera.", e:{au:12,ro:10,t:5,flag:"cap_grenade",ch:"On prépara la guerre avant de la faire, ce qui était nouveau."}},
      tri:{t:"Tout est en place — argent, canons, alliances, et une chrétienté qui regarde. La conquête est déjà à moitié gagnée.", e:{au:16,ro:14,t:9,no:8,flag:"cap_grenade",ch:"Il ne resta plus qu'à prendre les villes, ce qui était le plus simple."}}
    }},
   {label:"La mer. Ports, chantiers, Canaries, et ce que les Portugais trouvent au sud.",
    voie:"divergente", port:"diplomatie", base:42, cost:3,
    note:"Renoncer au prestige de la croisade pour une puissance qui ne se voit pas encore.",
    out:{
      crit:{t:"L'argent part dans des chantiers qui ne produisent rien et l'Andalousie, privée de guerre, se soulève contre les nouveaux impôts.", e:{au:-14,t:-6,no:-10,dv:6,flag:"cap_mer",ch:"On construisit des quais pendant que l'on demandait des lances."}},
      fail:{t:"Quelques caravelles, quelques comptoirs. Le Portugal garde vingt ans d'avance.", e:{t:-3,dv:5,flag:"cap_mer",ch:"On regarda la mer sans encore savoir qu'y chercher."}},
      part:{t:"Les Canaries sont soumises, les chantiers de Séville tournent. Le sud attendra.", e:{pr:9,t:4,no:-6,dv:7,flag:"cap_mer",ch:"On acheva les Canaries et l'on remit Grenade à plus tard."}},
      succ:{t:"Une marine atlantique réelle sort des chantiers. Ce que le Portugal trouvera, la Castille pourra le disputer.", e:{pr:14,t:8,au:6,dv:9,flag:"cap_mer",ch:"La Castille se donna une flotte avant d'avoir un empire."}},
      tri:{t:"Marine, capitaux et cartographes convergent à Séville. Dix ans d'avance sur l'histoire, et personne à la cour ne sait encore ce que cela vaudra.", e:{pr:19,t:12,au:9,dv:12,flag:"cap_mer",flag2:"ocean_dabord",ch:"On mit tout dans l'océan, sans savoir ce qu'il y avait au bout."}}
    }},
   {label:"L'intérieur. Achever l'administration, les tribunaux, l'université et les comptes avant toute aventure.",
    voie:"inouïe", port:"admin", base:38, cost:4,
    note:"Aucun souverain de ce siècle n'a choisi de ne rien conquérir pendant dix ans.",
    out:{
      crit:{t:"La noblesse et le clergé, privés de guerre et de butin, s'agitent. On reproche au roi de gouverner comme un notaire.", e:{no:-16,ro:-8,au:-10,dv:9,ch:"On reprocha au roi de préférer les registres aux batailles."}},
      fail:{t:"Les réformes avancent lentement, sans que rien de visible ne les justifie aux yeux du royaume.", e:{au:-6,dv:7,ch:"On réforma sans que nul ne s'en aperçoive."}},
      part:{t:"Chancelleries, archives et écoles se mettent en place. Le royaume est mieux tenu et personne ne le célèbre.", e:{au:10,pr:9,co:8,dv:10,flag:"cap_interieur",ch:"On bâtit un État, ce qui ne se chante pas."}},
      succ:{t:"En dix ans, la Castille se dote de l'appareil administratif que les autres royaumes mettront un siècle à construire.", e:{au:16,pr:14,co:12,t:6,dv:13,flag:"cap_interieur",ch:"Le royaume devint gouvernable, ce qui valait plusieurs provinces."}},
      tri:{t:"Justice, finance, université et archives forment un ensemble cohérent. Ce que l'on lègue n'est pas une conquête mais une machine.", e:{au:21,pr:18,co:16,t:11,dv:16,flag:"cap_interieur",flag2:"etat_moderne",ch:"On ne laissa aucune ville prise, et l'on laissa un État."}}
    }}
  ]
}

};

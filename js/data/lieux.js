/* lieux.js — le glossaire des noms propres.

   Un nom de ville, de bataille ou de traité ne dit rien à qui ne l'a pas déjà
   lu. Chaque entrée d'ici est repérée dans le corps des situations et reçoit
   une infobulle au survol : ce que le lieu est, et pourquoi il compte en 1479.

   Le repérage se fait sur le texte affiché (voir glose() dans screens.js), une
   seule fois par nom et par paragraphe — sinon un paragraphe qui répète
   « Grenade » quatre fois devient illisible.

   Ajouter une entrée suffit : rien d'autre à toucher. Les clés les plus
   longues sont testées d'abord, pour que « Medina del Campo » l'emporte sur
   « Medina ». */

const LIEUX = {

/* ---------- villes et places ---------- */
"Ségovie":"Ville de Vieille-Castille et siège du trésor royal. Isabelle s'y fait proclamer reine en décembre 1474, trois jours après la mort d'Henri IV.",
"Tolède":"Capitale religieuse du royaume. Son archevêque est le deuxième personnage de Castille et dispose de revenus supérieurs à ceux de bien des princes.",
"Séville":"La plus grande ville de la couronne et son port sur l'Atlantique par le Guadalquivir. Ses douanes — l'almojarifazgo — sont l'une des premières recettes royales.",
"Burgos":"Capitale du commerce de la laine et siège du consulat qui traite avec la Flandre. Ce qu'elle décide sur les prix engage tout le nord.",
"Medina del Campo":"Ville des grandes foires de Castille, deux fois l'an. Le crédit du royaume s'y fait et s'y défait.",
"Valladolid":"Résidence habituelle de la cour et siège de la chancellerie. Le royaume n'a pas de capitale fixe : il suit les souverains.",
"Barcelone":"Capitale de la Catalogne, qui sort de dix ans de guerre civile. Ses Corts ne siègent qu'après que le roi a juré les libertés catalanes.",
"Saragosse":"Capitale de l'Aragon, où siège le Justicia — un magistrat qui peut annuler un ordre royal contraire aux fueros.",
"Salamanque":"Siège de la plus ancienne université de Castille. Les juristes qui rédigent les actes du règne en sortent tous.",
"Cordoue":"Ancienne capitale du califat, déchirée entre les maisons rivales qui s'y disputent la ville depuis deux générations.",
"Ávila":"Ville de Vieille-Castille, entourée de la muraille la mieux conservée du royaume. C'est là qu'en 1465 des nobles ont déposé Henri IV en effigie.",
"Grenade":"Dernier royaume musulman de la péninsule, tributaire par intermittence depuis deux siècles. Il tient une frontière de cent lieues et une population d'un demi-million d'âmes.",
"Alhama":"Place forte au cœur du royaume de Grenade, prise par surprise en février 1482. Isolée à quarante lieues des lignes castillanes, elle ne se ravitaille que par un chemin de montagne.",
"Zahara":"Place chrétienne de la frontière, enlevée par Grenade en décembre 1481. C'est le coup qui rouvre la guerre du sud après vingt ans de trêves.",
"Loja":"Forteresse qui ferme la vallée du Genil et couvre la route de Grenade. On la dit imprenable, et le siège de 1482 tourne au désastre.",
"Ronda":"Ville bâtie sur un rocher fendu par une gorge de cent brasses, réputée inexpugnable. Elle commande toute la serranía entre Málaga et la frontière.",
"Málaga":"Le grand port de Grenade et sa fenêtre sur la Berbérie. Tant qu'elle tient, l'émirat reçoit hommes et blé d'Afrique.",
"Lucena":"Bourg de la frontière cordouane où l'émir Boabdil est capturé en avril 1483 au cours d'une razzia manquée.",
"Perpignan":"Capitale du Roussillon, occupée par la France depuis que Jean II d'Aragon a engagé les comtés pour financer une guerre. La ville s'est révoltée deux fois contre la garnison française.",
"Pampelune":"Capitale de la Navarre, petit royaume pris entre la Castille, l'Aragon et la France, que les trois convoitent.",
"Cuenca":"Ville épiscopale de la Nouvelle-Castille, sur la route de Valence.",
"Teruel":"Ville d'Aragon qui ferme ses portes à l'inquisiteur en 1484, au nom des fueros.",
"Guadalupe":"Monastère hiéronymite d'Estrémadure et premier sanctuaire du royaume. Son droit d'asile couvre même ceux que la justice royale poursuit.",
"Uclés":"Siège du chapitre de l'ordre de Santiago, qui élit son grand maître — le plus riche seigneur de Castille après le roi.",
"Palos":"Petit port de l'Andalousie atlantique, voisin du monastère de La Rábida où le Génois attend depuis deux ans qu'on l'écoute.",
"Alcalá de Henares":"Ville de l'archevêché de Tolède où la cour séjourne. C'est là qu'en 1486 la commission de Talavera examine le projet du Génois.",
"Toro":"Ville du Duero où se livre en mars 1476 la bataille qui décide de la guerre de Succession, sans qu'on sache clairement qui l'a gagnée.",
"Plasencia":"Ville d'Estrémadure où Afonso V du Portugal épouse Juana en mai 1475 et se proclame roi de Castille.",
"Medina":"Ville des foires de Castille. Voir Medina del Campo.",

/* ---------- traités, institutions, gens ---------- */
"Alcáçovas":"Traité signé en septembre 1479 : Juana renonce à la Castille, le Portugal garde la Guinée et ses ors, la Castille garde les Canaries. Il met fin à la guerre de Succession.",
"Sainte Hermandad":"Police rurale permanente créée aux Cortès de Madrigal en 1476, armée et payée par les villes. Elle ne relève d'aucun seigneur — c'est tout son intérêt et tout le problème qu'elle pose.",
"Hermandad":"Police rurale permanente levée et payée par les villes, qui n'obéit qu'au roi.",
"Cortès":"Assemblée des procureurs des dix-sept villes ayant voix. Elles votent le service extraordinaire, qui est la seule recette que le roi ne peut pas lever seul.",
"Corts":"Assemblées de la couronne d'Aragon — Aragon, Catalogne, Valence — qui siègent séparément et dont l'accord est requis pour toute levée.",
"fueros":"Libertés écrites des royaumes d'Aragon, de Navarre et des provinces basques. Le roi les jure avant de régner et ne peut légalement passer outre.",
"Déclaratoire":"Loi votée aux Cortès de Tolède en 1480, qui reprend les rentes et domaines aliénés par Henri IV. Elle rend au trésor près de trente millions de maravédis par an.",
"Mesta":"Corporation des grands éleveurs transhumants, forte de trois millions de moutons. Ses privilèges de passage ruinent les cultures et sa laine paie le royaume.",
"Saint-Office":"Tribunal de la foi établi par la bulle de 1478 et installé à Séville en 1480. Ses inquisiteurs sont nommés par le roi, non par le pape — c'est ce qui le distingue de toutes les inquisitions antérieures.",
"Sixte IV":"Pape de 1471 à 1484. Il accorde en 1478 la bulle qui permet aux souverains de nommer eux-mêmes les inquisiteurs, puis tente en vain de revenir dessus.",
"Boabdil":"Muhammad XII, émir de Grenade, révolté contre son père Abû l-Hasan. Capturé à Lucena en 1483, il est relâché contre vassalité et tribut.",
"Louis XI":"Roi de France de 1461 à 1483. Il tient le Roussillon en gage, soutient le Portugal contre la Castille, et préfère acheter ses adversaires que les combattre.",
"Afonso V":"Roi de Portugal, oncle et époux de Juana, dont il soutient les droits sur la Castille les armes à la main de 1475 à 1479.",
"Juana":"Fille d'Henri IV, dite la Beltraneja par ceux qui contestent sa naissance. Prétendante à la couronne de Castille jusqu'à Alcáçovas.",
"Henri IV":"Roi de Castille de 1454 à 1474, demi-frère d'Isabelle. Son règne laisse un trésor vidé, une monnaie falsifiée et la moitié du domaine royal aux mains des grands.",
"Carrillo":"Alonso Carrillo, archevêque de Tolède. Il fait le mariage d'Isabelle et de Ferdinand puis passe au Portugal, et sa soumission est l'une des affaires du règne.",
"Ponce de León":"Rodrigo Ponce de León, marquis de Cadix, l'un des deux grands d'Andalousie. C'est lui qui enlève Alhama par surprise en 1482.",
"maravédis":"Monnaie de compte castillane. Sous Henri IV, sa teneur en argent a été divisée par quatre en dix ans.",
"alcabala":"Impôt du dixième sur toute vente, la première recette du royaume. Elle suit directement l'activité économique.",
"tercias":"Les deux neuvièmes de la dîme ecclésiastique que la papauté abandonne à la couronne de Castille.",
"conversos":"Juifs convertis au christianisme, souvent de plusieurs générations. Les prédicateurs les accusent de judaïser en secret ; c'est le motif invoqué pour établir le Saint-Office.",
"mudéjars":"Musulmans demeurant en territoire chrétien sous statut protégé, avec leur loi, leurs juges et leur culte.",
"aljama":"Communauté juive ou musulmane organisée d'une ville, avec ses propres institutions et sa fiscalité propre.",
"corregidor":"Magistrat nommé par le roi et envoyé gouverner une ville en son nom. L'instrument par lequel la couronne reprend les municipalités.",
"Justicia":"Magistrat suprême d'Aragon, gardien des fueros, qui peut suspendre un acte royal contraire aux libertés du royaume.",
"Axarquía":"Massif montagneux à l'est de Málaga où la chevalerie andalouse est anéantie en mars 1483, faute d'eau et de chemins.",
"Guadalquivir":"Fleuve d'Andalousie, navigable jusqu'à Séville. C'est par lui que le port communique avec l'Atlantique."

};

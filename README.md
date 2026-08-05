# Acte premier — 1479-1487

Jeu de gestion textuel. Le royaume est à vous ; reste à savoir ce qu'il devient.

L'acte s'ouvre en 1479 : Alcáçovas met fin à la guerre de Succession et Ferdinand hérite de l'Aragon la même année. C'est le moment où les deux souverains sont définitivement en place.

Les années d'avant se règlent en **prologue** : trois décisions rapides, sans dé et sans coût, qui disent seulement comment on est sorti de la guerre de Succession. Elles annoncent leurs effets — il n'y a rien à cacher là où il n'y a pas de hasard — et composent l'état de 1479. Le point de départ n'est donc pas fixe : c'est le résultat de ces cinq choix.

Ouvrir `index.html` dans un navigateur. Pas de serveur, pas d'installation, pas d'étape de compilation.

---

## Ce que fait le jeu

Neuf années, une par tour. Chaque année :

1. **Rentrées** — le trésor s'alimente. Le montant varie.
2. **Répartition** — six portefeuilles, cinq crans de dotation chacun. Il n'y a jamais de quoi tenir les six.
3. **Situations** — de deux à cinq. Le nœud historique de l'année, plus une situation par guerre en cours, plus ce que le passé vous renvoie. Le jeu vous dit ce qui a chargé l'année.
4. **Affaires courantes** — trois à cinq par an, tranchées sans dé : un pont emporté, un ours en cadeau, une éclipse. Effets minces, mais c'est ce qui empêche une année d'être une suite de crises.
5. **Chronique** — ce que l'année laisse par écrit, ce qu'elle laisse au règne, et le mouvement de chaque jauge sur les douze mois. Les années précédentes sont dans les **archives**, à l'icône du bandeau.

Chaque situation offre plusieurs réponses. Les données les classent en **historique**, **divergente** et **inouïe**, mais **le joueur ne voit jamais ces mots** et l'ordre d'affichage est tiré au sort à chaque partie : rien ne désigne la voie que l'histoire a suivie.

Sous chaque réponse, sans avoir à la sélectionner : le portefeuille et sa dotation, la jauge dont elle dépend et son état, le coût, et la **chance de réussite en pourcentage** avec sa barre. Le détail chiffré se déplie sur la réponse retenue. La glose en italique — ce que l'option engage vraiment — n'apparaît qu'à la résolution, une fois le sort jeté.

La règle qui tient l'uchronie est dans le mot **osé**. « Personne n'a osé » n'est pas « personne n'a imaginé » : une réponse inouïe doit rester une chose qu'un conseiller de 1484 aurait pu formuler devant la reine sans passer pour fou. Une option qu'aucun contemporain n'aurait pu concevoir n'est pas audacieuse, elle est anachronique — et elle n'a pas sa place ici.

Il n'y a pas de second choix sur l'intensité : l'arbitrage entre sûreté et audace se fait à la répartition, et choisir une réponse est déjà choisir une manière.

Le règne se juge en **points de victoire**, comptés à la fin et à la fin seulement. Chaque issue en vaut quelques-uns, mais l'essentiel vient des **exploits** : les acquis nommés du règne. Un exploit se gagne, et il peut se **perdre** — prendre Alhama vaut douze points, la laisser reprendre en coûte neuf de plus, parce que toute l'Europe avait vu la place tomber. Une réussite inouïe compte exactement autant qu'une réussite historique : c'est l'entreprise qui est jugée, pas sa conformité aux chroniques.

Les **exploits** sont peu nombreux et volontairement : un marqueur qui note qu'une affaire s'est bien passée n'est pas un exploit, c'est du travail bien fait. Ces marqueurs existent toujours — ils conditionnent des situations et grossissent les rentrées — mais ils ne comptent pas au bilan.

La partie **se sauvegarde** toute seule, à chaque situation résolue.

---

## Structure

```
index.html              coquille ; l'ordre des <script> fait la dépendance

css/
  tokens.css            palette, typographie, mesure — modifier ici change tout
  base.css              corps de texte, bandeau, titres, œuvres
  components.css        bandeau, options, chance, budget, archives, bilan
  responsive.css        étroit, et prefers-reduced-motion

js/
  data/
    config.js           portefeuilles, crans, jauges, rentes — tout l'équilibrage
    art.js              manifeste des œuvres (noms de fichiers Wikimedia Commons)
    exploits.js         les acquis du règne et ce qu'ils valent au bilan
    prologue.js         les trois décisions de 1474-1476, sans dé ni coût
    petits.js           l'ordinaire de la cour : affaires tranchées sans dé
    lieux.js            glossaire des noms propres, affiché en infobulle
    nodes.js            les neuf nœuds historiques, un par année (1479-1487)
    pool.js             événements de tirage, dont l'ordinaire du royaume
    injected.js         conséquences différées, semées par une issue précédente
  state.js              l'état de la partie, en un seul objet
  rules.js              moteur : bandes, seuils, effets, rentrées. Aucun DOM.
  turn.js               composition du deck de l'année
  screens.js            rendu : une fonction par écran
  main.js               amorçage

scripts/
  verifier.js           contrôle d'intégrité du contenu — node scripts/verifier.js
```

La séparation qui compte est **rules.js ↔ screens.js** : le moteur ne touche jamais au DOM, le rendu ne décide jamais rien. Chaque écran reconstruit `#app` entièrement à partir de `S`, donc `render()` est toujours sûr à rappeler et aucune désynchronisation n'est possible.

Scripts classiques plutôt que modules ES, délibérément : les modules imposeraient un serveur local à cause du CORS sur `file://`. Le prix est que l'ordre dans `index.html` doit être respecté.

---

## Ajouter du contenu

Un événement, où qu'il soit :

```js
{
  id:"famine", t:"Le blé manque", place:"Vieille-Castille, 1481",
  art:"vierge",                       // clé de data/art.js, facultatif
  years:[1484,1486],                  // pool.js seulement
  req:s=>s.flags.hermandad,           // facultatif
  body:["Premier paragraphe.","Second."],
  opts:[{
    label:"Ouvrir les greniers royaux.",
    voie:"historique",                // classement interne, jamais montré au joueur
    port:"justice",                   // portefeuille qui modifie le seuil
    base:52,                          // difficulté nue
    cost:2,                           // en trésor, affiché sous la réponse
    forme:"sure",                     // facultatif : normale | sure | extreme
    note:"Une ligne d'avertissement.",
    out:{
      crit:{t:"…", e:{au:-12,pr:-8}},
      fail:{t:"…", e:{pr:-4}},
      part:{t:"…", e:{pr:3}},
      succ:{t:"…", e:{pr:8,au:5,ch:"La ligne de chronique."}},
      tri:{t:"…", e:{pr:12,au:9,flag:"greniers",inject:["revolte_andalouse"]}}
    }
  }]
}
```

Les cinq issues sont **obligatoires**. Une bande sans issue casse le tour.

**Effets disponibles.** `t` trésor, `au` autorité, `co` Cortès, `pr` état du royaume, `no` les grands, `fr` France. Plus :

- `flag`/`flag2`/`flag3` — marqueurs durables. **Si le marqueur a une entrée dans `data/exploits.js`, il devient un acquis du règne et compte au bilan.** C'est tout ce qu'il y a à faire : rien à écrire dans l'issue.
- `perte:"id"` — reprend un exploit. Ne fait rien s'il n'a jamais été obtenu : on ne perd que ce qu'on a tenu.
- `guerre:"id"` / `paix:"id"` — ouvre ou conclut une guerre déclarée dans `GUERRES` (rules.js).
- `inject:[…]` — sème un événement de `injected.js`.
- `ch:"…"` — la ligne que le chroniqueur retiendra.

Une situation peut aussi porter `etat:{guerre:"id"}`, appliqué à son entrée dans l'année : ce que la situation impose par sa seule survenue, avant tout choix.

Tout effet posé par `apply()` doit pouvoir être défait par `undo()`. Si vous ajoutez un type d'effet, ajoutez-le aux deux.

### Vérifier

```
node scripts/verifier.js
```

Le jeu n'a ni compilation ni tests unitaires : ce script en tient lieu. Il détecte ce qu'un oubli d'écriture casse silencieusement — une issue manquante, un `inject` qui ne pointe nulle part, un exploit inatteignable, une année hors de l'acte, une année sans assez de tirages. Sort en code 1 s'il trouve une erreur.

---

## Le parti pris visuel

Un document de chancellerie lu sur un écran. Fond papier, encre brun-noir, un accent de cinabre — celui des rubriques manuscrites — réservé aux chiffres qui changent, à la réponse retenue et à l'alerte.

Les **paliers de jauge** ont leur propre échelle, du rouge au vert, désaturée pour tenir sur le papier. Elle ne dit pas qu'un choix est bon ou mauvais : elle dit où en est une jauge, ce que cinq mots seuls rendaient lent à lire.

Les jauges s'affichent en mots dans le bandeau, mais **au chiffre exact dans les résultats** — d'une résolution, d'une affaire courante ou d'une fin d'année — où le nombre se décompte de l'ancienne valeur à la nouvelle. C'est le seul mouvement du jeu avec le jet de dé, et pour la même raison : c'est le moment où l'on apprend quelque chose.

Tout nom propre inscrit dans `data/lieux.js` reçoit une infobulle au survol, une fois par paragraphe. Un nom de place forte ne dit rien à qui ne l'a pas déjà lu.

Les jauges s'affichent en mots, jamais en chiffres. L'incertitude sur son propre pouvoir est historiquement juste et mécaniquement plus tendue. Les chiffres exacts restent disponibles pour le trésor et pour le détail du seuil, que le joueur doit pouvoir vérifier ligne à ligne.

Le seul mouvement du jeu est le jet de dé. C'est le moment de tension ; tout le reste est immobile.

---

## Les œuvres

Une image tous les trois ou quatre événements. Au-delà, elles cessent de peser.

Les tableaux sont dans le domaine public ; les photographies ne le sont pas toujours, d'où le recours à Wikimedia Commons, qui le garantit. Si une image ne charge pas, `figHTML()` efface le bloc silencieusement — rien ne casse. Pour changer une œuvre, changer le nom de fichier dans `data/art.js`.

Les branches uchroniques n'ont volontairement aucune image. Plus le règne s'écarte de l'histoire, moins le monde est représenté.

---

## Équilibrage

Tout est dans `data/config.js` et dans quelques fonctions de `rules.js`.

### Le couplage budget ↔ jauges

C'est la pièce centrale. Trois règles :

**Une ligne de budget ne conditionne jamais la jauge qu'elle entretient.** Chaque portefeuille était autrefois adossé à la jauge que ses propres réussites alimentaient : payer la Cour servait à gagner la Noblesse, mais il fallait déjà la Noblesse pour que payer la Cour marche. Cinq boucles de rétroaction positive — d'où la noblesse « en armes » dans toutes les parties simulées. `PORT_JAUGE` croise désormais les dépendances : ce qui conditionne une dépense est ce qui la rend crédible, pas ce qu'elle achète. Le vérificateur refuse toute réapparition de boucle.

**L'argent dépensé fait monter la jauge en valeur absolue** (`ENTRETIEN_PAR_MARAVEDI`), deux points par maravédi et par an, contre −4 pour une ligne abandonnée. C'est ce qui permet de compenser ce que les situations retirent, et donc de relever un ordre effondré. Sans cela, un ordre généreusement payé s'effondrait quand même.

**La forme du budget compte autant que son montant.** Les six lignes se rangent en deux blocs : l'appareil de la couronne (justice, armée, ambassades) et les trois ordres. Ce qu'on donne à son propre appareil concentre le pouvoir, ce qu'on donne aux ordres achète leur fidélité et le disperse. La différence des deux totaux fait monter ou descendre le Pouvoir chaque année, jusqu'à ±5.

**Chaque ordre rend une chose différente**, et c'est là qu'est la stratégie :

| Ordre | Ce qu'il rend |
|---|---|
| Noblesse | La hueste sert à ses frais : jusqu'à deux cinquièmes de la solde de guerre en moins |
| Bourgeoisie | Le servicio de Cortes et l'almojarifazgo — de l'argent ordinaire |
| Clergé | Les tercias, et la bulle de croisade qui ne rentre que tant qu'on fait la guerre |

Et leur moyenne fait la **stabilité**, qui pèse sur toutes les entreprises et qui, sous « hostile », fait produire au royaume une affaire de plus chaque année.

**La rupture générale.** Si les trois ordres tombent en rupture la même année, il ne reste personne pour gouverner avec : ni les grands, ni les villes, ni l'Église. Le règne n'est pas arrêté sur-le-champ — la chronique le constate, le bandeau l'annonce, et l'on a un an. Si la rupture tient encore à la fin de l'année suivante, l'acte s'arrête là quel que soit ce qui avait été entrepris. Remonter un seul des trois suffit à annuler le sursis.

### Le reste

- `STEP_COST` / `STEP_MOD` — tenir les six lignes à « Suffisant » coûte 24 quand 1479 rapporte 9 et une bonne année de 1487 dix-huit. On n'en tient jamais plus de deux ou trois : c'est le vrai arbitrage du jeu.
- `RENTES` — chaque jauge verse une part d'elle-même au trésor. Le compte de l'année dit d'où vient l'argent, jauge par jauge, puis ce que la guerre prélève et ce que les dotations coûtent. Les noms d'époque (alcabala, almojarifazgo) ont été retirés : ils étaient décoratifs et n'apparaissaient nulle part ailleurs.
- `bands()` — la forme du risque. `forme` appartient à l'option, pas au joueur.
- `DETTE_MAX` — ce qu'on peut engager au-delà de la caisse. La dette non résorbée se paie en autorité et en crédit.
- `data/exploits.js` — le seul pourvoyeur de points.

Le trésor ne peut pas fermer un tour. On paie ce qu'on a, et ce qui manque devient une pénalité de seuil — « engagée sans les moyens ».

---

## Ce qui manque

- Le clergé ne bouge encore que par les rentes et les seuils : aucune issue du contenu ne pose d'effet `cl:`. La jauge existe et compte, elle attend d'être écrite.
- Les grands finissent « en armes » dans presque toutes les parties simulées. Soit les malus `no:` sont trop nombreux, soit rien ne les fait remonter assez.
- Les grands projets à paliers. L'acte I s'en passe ; l'acte II en aura besoin.
- La mort des souverains et les successions uchroniques, prévues pour l'acte III.

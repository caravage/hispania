# Acte premier — 1474-1482

Jeu de gestion textuel. Vous héritez d'un royaume que personne ne gouverne.

Ouvrir `index.html` dans un navigateur. Pas de serveur, pas d'installation, pas d'étape de compilation.

---

## Ce que fait le jeu

Neuf années, une par tour. Chaque année :

1. **Rentrées** — le trésor s'alimente. Le montant varie.
2. **Répartition** — six portefeuilles, cinq crans de dotation chacun. Il n'y a jamais de quoi tenir les six.
3. **Situations** — deux ou trois par an. Le nœud historique de l'année, plus ce que le passé vous renvoie, plus un tirage.
4. **Chronique** — ce que l'année laisse par écrit.

Chaque situation offre trois voies : **historique** (ce qui s'est produit, seuil favorable, conséquences documentées), **divergente** (ce qui fut envisagé et non fait), **hérétique** (ce que personne n'a osé, seuil dur, conséquences imprévisibles). Aucune n'est gratuite et aucune n'est strictement supérieure aux autres.

Puis vous choisissez la **manière** : prudente, équilibrée ou audacieuse. Elle ne change pas seulement vos chances, elle change la *forme* du risque — le prudent ne peut ni triompher ni s'effondrer ; l'audacieux joue les deux extrêmes. La bande affichée montre cette forme avant que vous validiez.

Trois jetons de **Fortune** pour tout le règne relancent un jet raté. Non renouvelables.

---

## Structure

```
index.html              coquille ; l'ordre des <script> fait la dépendance

css/
  tokens.css            palette, typographie, mesure — modifier ici change tout
  base.css              corps de texte, bandeau, titres, œuvres
  components.css        options, manière, bande de résolution, budget, chronique
  responsive.css        étroit, et prefers-reduced-motion

js/
  data/
    config.js           portefeuilles, crans, jauges, manières — tout l'équilibrage
    art.js              manifeste des œuvres (noms de fichiers Wikimedia Commons)
    nodes.js            les neuf nœuds historiques, un par année
    pool.js             événements de tirage
    injected.js         conséquences différées, semées par une issue précédente
  state.js              l'état de la partie, en un seul objet
  rules.js              moteur : bandes, seuils, effets, rentrées. Aucun DOM.
  turn.js               composition du deck de l'année
  screens.js            rendu : une fonction par écran
  main.js               amorçage
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
  years:[1481,1482],                  // pool.js seulement
  req:s=>s.flags.hermandad,           // facultatif
  body:["Premier paragraphe.","Second."],
  opts:[{
    label:"Ouvrir les greniers royaux.",
    voie:"historique",                // historique | divergente | hérétique
    port:"justice",                   // portefeuille qui modifie le seuil
    base:52,                          // difficulté nue
    cost:2,                           // multiplié par la manière choisie
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

**Effets disponibles.** `t` trésor, `au` autorité, `co` Cortès, `ro` Rome, `pr` état du royaume, `no` les grands, `dv` divergence. Plus `flag`/`flag2`/`flag3` (marqueurs durables, lus par `req()` et par le bilan), `inject:[…]` (sème un événement de `injected.js`), `ch:"…"` (la ligne que le chroniqueur retiendra).

Tout effet posé par `apply()` doit pouvoir être défait par `undo()` — c'est ce qui rend la Fortune propre. Si vous ajoutez un type d'effet, ajoutez-le aux deux.

---

## Le parti pris visuel

Un document de chancellerie lu sur un écran. Fond papier, encre brun-noir, une seule couleur d'accent — le cinabre des rubriques manuscrites. Elle ne sert qu'à trois choses : les chiffres qui changent, l'option retenue, l'alerte. Pas de vert et rouge « bon/mauvais » : il n'y a pas de bons et de mauvais choix, seulement des coûts différents.

Les jauges s'affichent en mots, jamais en chiffres. L'incertitude sur son propre pouvoir est historiquement juste et mécaniquement plus tendue. Les chiffres exacts restent disponibles pour le trésor et pour le détail du seuil, que le joueur doit pouvoir vérifier ligne à ligne.

Le seul mouvement du jeu est le jet de dé. C'est le moment de tension ; tout le reste est immobile.

---

## Les œuvres

Une image tous les trois ou quatre événements. Au-delà, elles cessent de peser.

Les tableaux sont dans le domaine public ; les photographies ne le sont pas toujours, d'où le recours à Wikimedia Commons, qui le garantit. Si une image ne charge pas, `figHTML()` efface le bloc silencieusement — rien ne casse. Pour changer une œuvre, changer le nom de fichier dans `data/art.js`.

Les branches uchroniques n'ont volontairement aucune image. Plus le règne s'écarte de l'histoire, moins le monde est représenté.

---

## Équilibrage

Tout est dans `data/config.js` et dans deux fonctions de `rules.js`.

- `STEP_COST` / `STEP_MOD` — ce que coûte un cran de dotation, ce qu'il vaut au seuil.
- `RISK` — les trois manières : décalage de seuil et multiplicateur de coût.
- `bands()` — la forme du risque. Les cinq largeurs totalisent toujours 100.
- `revenue()` — calibrée pour qu'en 1474 on tienne à peine six portefeuilles à « Suffisant », et qu'en 1482 un règne bien mené en tienne trois à « Généreux ».

La pénalité de divergence est plafonnée à −12 : l'inconnu doit gêner, pas rendre la fin d'acte injouable.

De même, le trésor ne peut pas fermer un tour. Vider la bourse à la répartition est un choix légitime — c'est la tentation de la première année — mais si plus aucune option n'était payable, l'écran de situation n'aurait plus un seul bouton vivant. `minCost()` rend la dépense la plus basse qu'une situation admette, toutes manières confondues ; quand même celle-là dépasse la réserve, `costOf()` ramène le prix à ce qui reste. La couronne racle ses fonds et décide sans rien. Hors de ce cas, le prix ne bouge pas.

---

## Ce qui manque

- Sauvegarde. `S` est sérialisable tel quel ; il n'y a qu'à l'écrire.
- Les grands projets à paliers. L'acte I s'en passe ; l'acte II en aura besoin.
- La mort des souverains et les successions uchroniques. Prévues pour l'acte III, mais la mécanique de tirage annuel devrait être posée dès l'acte II.

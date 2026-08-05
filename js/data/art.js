/* art.js — manifeste des œuvres.
   Une image tous les trois ou quatre événements, pas davantage : au-delà,
   elles cessent de peser. Toute image qui ne charge pas disparaît proprement
   (voir figHTML dans screens.js). Pour changer une œuvre, changer le nom de
   fichier Commons ci-dessous — rien d'autre à toucher.
   Les branches uchroniques n'ont volontairement pas d'image : plus le règne
   s'écarte de l'histoire, moins le monde est représenté. */

const COMMONS = f => "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(f) + "?width=900";
const ART = {
  vierge:{src:COMMONS("La Virgen de los Reyes Católicos.jpg"),
    cap:"Maître de la Vierge des Rois Catholiques, vers 1491 — Musée du Prado"},
  isabelle:{src:COMMONS("Gallegocatholicmonarchs isabella.jpg"),
    cap:"Détail — la reine agenouillée, panneau du Prado"},
  ferdinand:{src:COMMONS("Fernando Gallego - Madonna of the Catholic Kings - WGA8448.jpg"),
    cap:"Atelier de Fernando Gallego — Musée du Prado"},
  torquemada:{src:COMMONS("Tomás de Torquemada.jpg"),
    cap:"Tomás de Torquemada, portrait anonyme"},
  autodafe:{src:COMMONS("Pedro Berruguete Saint Dominic Presiding over an Auto-da-fe 1495.jpg"),
    cap:"Pedro Berruguete, Saint Dominique présidant un autodafé, vers 1495 — Musée du Prado"}
};

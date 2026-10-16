// src/data/partners.js
// The federations and institutions we work with, shown on the Partners page
// and the About page. Logos live in public/Partners — add an entry for every
// new file; names are translated under about.partners.items.<key>.
// Files with their own solid background fill the whole tile (`fit: "cover"`);
// the rest sit centred on `bg`. `zoom` evens out how much empty margin each
// file has around the logo.
export const PARTNERS = [
  {
    key: "worldAquatics",
    file: "Svetska Plivacka federacija copy.png",
    bg: "#110e09",
    zoom: 1.1,
    url: "https://www.worldaquatics.com",
  },
  {
    key: "europeanAquatics",
    file: "European Aquatics copy.jpg",
    bg: "#ffffff",
    fit: "cover",
    url: "https://www.europeanaquatics.org",
  },
  { key: "olympicCommittee", file: "Olimiski Komitet copy.png", bg: "#ffffff", zoom: 0.72 },
  {
    key: "ministryOfSport",
    file: "Ministerstvo za Sport copy.jpg",
    bg: "#01b7c4",
    fit: "cover",
    zoom: 1.35,
  },
  {
    key: "sportsFederationsUnion",
    file: "Sojus na sportski federacii copy.jpg",
    bg: "#ffffff",
    fit: "cover",
  },
];

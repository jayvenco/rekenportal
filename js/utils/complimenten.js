// utils/complimenten.js
// -----------------------------------------------------------------------------
// Beheert de wisselende Nederlandse complimenten en foutmeldingen.
// Zorgt dat hetzelfde compliment nooit twee keer achter elkaar verschijnt.
// -----------------------------------------------------------------------------

const COMPLIMENTEN_GOED = [
  "Goed zo!",
  "Top!",
  "Knap gedaan!",
  "Helemaal goed!",
  "Wauw!",
  "Precies!",
  "Super!",
];

const MELDINGEN_FOUT = [
  "Bijna! Kijk nog eens.",
  "Net niet! Kijk maar naar het juiste antwoord.",
  "Goed geprobeerd! Zo zit het echt.",
];

let laatsteComplimentIndex = -1;
let laatsteFoutIndex = -1;

/** Geeft een willekeurig compliment terug, nooit hetzelfde als de vorige keer. */
export function geefCompliment() {
  if (COMPLIMENTEN_GOED.length === 1) return COMPLIMENTEN_GOED[0];
  let index = Math.floor(Math.random() * COMPLIMENTEN_GOED.length);
  while (index === laatsteComplimentIndex) {
    index = Math.floor(Math.random() * COMPLIMENTEN_GOED.length);
  }
  laatsteComplimentIndex = index;
  return COMPLIMENTEN_GOED[index];
}

/** Geeft een vriendelijke foutmelding terug, nooit hetzelfde als de vorige keer. */
export function geefFoutmelding() {
  if (MELDINGEN_FOUT.length === 1) return MELDINGEN_FOUT[0];
  let index = Math.floor(Math.random() * MELDINGEN_FOUT.length);
  while (index === laatsteFoutIndex) {
    index = Math.floor(Math.random() * MELDINGEN_FOUT.length);
  }
  laatsteFoutIndex = index;
  return MELDINGEN_FOUT[index];
}

// utils/achtergronden.js
// -----------------------------------------------------------------------------
// Alle achtergronden van de opgaveschermen. Bij het openen van een opgave wordt
// er willekeurig één gekozen, nooit twee keer dezelfde achter elkaar.
// Nieuwe afbeelding toevoegen: bestand in img/opgave-achtergronden/ zetten en
// de bestandsnaam hieronder bijvoegen.
// -----------------------------------------------------------------------------

export const OPGAVE_ACHTERGRONDEN = [
  "natuur-bos.png",
  "ruimte.png",
  "anime-fantasie.png",
  "onderwater.png",
  "bergen.png",
  "boerderij.jpg",
  "winter.jpg",
  "beek-1.jpg",
  "onderwater-2.jpg",
  "onderwater-3.jpg",
  "onderwater-4.jpg",
  "onderwater-5.jpg",
  "kasteel.jpg",
  "ruimte-2.jpg",
  "bos-2.jpg",
  "klaslokaal.jpg",
];

const MAP = "/img/opgave-achtergronden/";
const SLEUTEL = "rekenportal:laatsteAchtergrond";

/** Kiest een willekeurige achtergrond, anders dan de vorige. Geeft een URL. */
export function kiesAchtergrond(lijst = OPGAVE_ACHTERGRONDEN) {
  let vorige = null;
  try { vorige = sessionStorage.getItem(SLEUTEL); } catch { /* geen opslag */ }
  const kandidaten = lijst.length > 1 ? lijst.filter((b) => b !== vorige) : lijst;
  const keuze = kandidaten[Math.floor(Math.random() * kandidaten.length)];
  try { sessionStorage.setItem(SLEUTEL, keuze); } catch { /* geen opslag */ }
  return `${MAP}${keuze}?v=2`;
}

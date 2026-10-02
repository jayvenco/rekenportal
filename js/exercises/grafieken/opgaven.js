// exercises/grafieken/opgaven.js
// Laadt de opgaven uit data/opgaven.json en kiest een set voor een sessie.

import { schudArray } from "../../utils/willekeurig.js";

let cache = null;

export async function laadOpgaven() {
  if (!cache) {
    const res = await fetch(new URL("./data/opgaven.json", import.meta.url));
    if (!res.ok) throw new Error("opgaven.json kon niet geladen worden");
    cache = await res.json();
  }
  return cache;
}

/** Filtert op niveau/categorie of op een lijst ids, schudt en sorteert van makkelijk naar moeilijk. */
export function kiesSet(alle, { niveau = "alle", categorie = "alle", aantal = 10, ids = null }) {
  let kandidaten = alle;
  if (ids) kandidaten = alle.filter((o) => ids.includes(o.id));
  else {
    if (niveau !== "alle") kandidaten = kandidaten.filter((o) => o.niveau === Number(niveau));
    if (categorie !== "alle") kandidaten = kandidaten.filter((o) => o.categorie === categorie);
  }
  const gekozen = schudArray(kandidaten).slice(0, aantal);
  return gekozen.sort((a, b) => a.niveau - b.niveau);
}

// exercises/grafieken/voortgang.js
// -----------------------------------------------------------------------------
// Lokale voortgang (localStorage, per profiel) voor "Grafieken lezen".
// Opslagvorm: { [opgaveId]: { pogingen, goed, laatsteGoed } }
// -----------------------------------------------------------------------------

import { getActiefProfielId } from "../../storage.js";

const sleutel = () => `rekenportal.grafieken.v1.${getActiefProfielId() ?? "gast"}`;

export function leesVoortgang(opslag = globalThis.localStorage) {
  try {
    return JSON.parse(opslag.getItem(sleutel()) || "{}") || {};
  } catch {
    return {};
  }
}

export function registreerResultaat(opgaveId, goed, opslag = globalThis.localStorage) {
  const v = leesVoortgang(opslag);
  const r = v[opgaveId] || { pogingen: 0, goed: 0, laatsteGoed: false };
  r.pogingen += 1;
  if (goed) r.goed += 1;
  r.laatsteGoed = goed;
  v[opgaveId] = r;
  try {
    opslag.setItem(sleutel(), JSON.stringify(v));
  } catch {
    /* opslag vol of geblokkeerd: voortgang niet bewaren */
  }
}

export function wisVoortgang(opslag = globalThis.localStorage) {
  try { opslag.removeItem(sleutel()); } catch { /* negeren */ }
}

/** Samenvatting voor het dashboard. */
export function berekenSamenvatting(opgaven, voortgang) {
  const gemaakt = opgaven.filter((o) => voortgang[o.id]);
  const goed = gemaakt.filter((o) => voortgang[o.id].laatsteGoed);
  const perGroep = (sleutelFn) => {
    const m = new Map();
    for (const o of opgaven) {
      const k = sleutelFn(o);
      const e = m.get(k) || { totaal: 0, gemaakt: 0, goed: 0 };
      e.totaal += 1;
      if (voortgang[o.id]) e.gemaakt += 1;
      if (voortgang[o.id]?.laatsteGoed) e.goed += 1;
      m.set(k, e);
    }
    return m;
  };
  return {
    totaal: opgaven.length,
    gemaakt: gemaakt.length,
    goed: goed.length,
    percentage: gemaakt.length ? Math.round((goed.length / gemaakt.length) * 100) : 0,
    fout: gemaakt.filter((o) => !voortgang[o.id].laatsteGoed).map((o) => o.id),
    perCategorie: perGroep((o) => o.categorie),
    perNiveau: perGroep((o) => o.niveau),
  };
}

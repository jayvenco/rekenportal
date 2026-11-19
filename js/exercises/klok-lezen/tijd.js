// exercises/klok-lezen/tijd.js
// -----------------------------------------------------------------------------
// Tijdlogica voor "Klok lezen" (geen DOM, dus in Node te testen).
// De tijd is een aantal minuten sinds middernacht (0 t/m 1439).
// -----------------------------------------------------------------------------

export const MINUTEN_PER_DAG = 1440;

/** Zet een getal in het bereik 0..1439. */
export function normaliseer(t) {
  return ((Math.round(t) % MINUTEN_PER_DAG) + MINUTEN_PER_DAG) % MINUTEN_PER_DAG;
}

export const uurVan = (t) => Math.floor(normaliseer(t) / 60);
export const minuutVan = (t) => normaliseer(t) % 60;

/** Uur op de klok: 1 t/m 12. */
export function uur12(t) {
  return uurVan(t) % 12 || 12;
}

/** Hoek (graden, 0 = boven, met de klok mee) van de minuutwijzer. */
export function minuutHoek(t) {
  return minuutVan(t) * 6;
}

/** Hoek van de uurwijzer: 30 graden per uur plus een half graad per minuut. */
export function uurHoek(t) {
  return ((uurVan(t) % 12) * 60 + minuutVan(t)) * 0.5;
}

/** Zachte (niet afgeronde) hoeken, voor animaties met kommagetallen. */
export function hoeken(tFloat) {
  const t = ((tFloat % MINUTEN_PER_DAG) + MINUTEN_PER_DAG) % MINUTEN_PER_DAG;
  return { minuut: (t % 60) * 6, uur: ((t % 720) / 720) * 360 };
}

/**
 * Sleep je aan de minuutwijzer, dan hoort bij de nieuwe minuut een nieuwe tijd.
 * Gaat de wijzer over de 12 heen, dan loopt het uur mee (vooruit of achteruit).
 * @param {number} t huidige tijd
 * @param {number} nieuweMinuut 0..59
 */
export function sleepMinuutwijzer(t, nieuweMinuut) {
  const oud = minuutVan(t);
  let uren = uurVan(t);
  if (oud >= 45 && nieuweMinuut <= 15) uren += 1;
  else if (oud <= 15 && nieuweMinuut >= 45) uren -= 1;
  return normaliseer(uren * 60 + nieuweMinuut);
}

/**
 * Sleep je aan de uurwijzer, dan volgt de tijd de hoek (0..360 graden).
 * Het dagdeel (voor of na 12 uur) blijft gelijk.
 */
export function sleepUurwijzer(t, hoekGraden) {
  const hoek = ((hoekGraden % 360) + 360) % 360;
  const minuten12 = Math.round(hoek * 2) % 720;
  const na12 = normaliseer(t) >= 720 ? 720 : 0;
  return normaliseer(na12 + minuten12);
}

/** Hoek van de muis ten opzichte van het midden (0 = boven, met de klok mee). */
export function hoekVanPunt(dx, dy) {
  const graden = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (graden + 360) % 360;
}

/** "2 uur en 15 minuten", "45 minuten", "3 uur" voor een aantal minuten (altijd positief gelezen). */
export function duurTekst(minuten) {
  const m = Math.abs(Math.round(minuten));
  const u = Math.floor(m / 60);
  const rest = m % 60;
  const uren = `${u} uur`;
  const min = `${rest} ${rest === 1 ? "minuut" : "minuten"}`;
  if (u === 0) return min;
  if (rest === 0) return uren;
  return `${uren} en ${min}`;
}

/** Verschuift de tijd met een aantal uur (positief = later, negatief = eerder). */
export function verschuifUren(t, uren) {
  return normaliseer(t + uren * 60);
}

// ---------------------------------------------------------------------------
// Tijd in woorden
// ---------------------------------------------------------------------------

/**
 * "Zeg het zoals je het zegt": 3:15 = kwart over 3, 3:30 = half 4.
 * Bij minuten die geen veelvoud van 5 zijn: "7 minuten over 3".
 */
export function tijdInWoorden(t) {
  const m = minuutVan(t);
  const h = uur12(t);
  const volgende = (h % 12) + 1;
  if (m === 0) return `${h} uur`;
  if (m === 15) return `kwart over ${h}`;
  if (m === 30) return `half ${volgende}`;
  if (m === 45) return `kwart voor ${volgende}`;
  if (m === 5 || m === 10) return `${m} over ${h}`;
  if (m === 20) return `10 voor half ${volgende}`;
  if (m === 25) return `5 voor half ${volgende}`;
  if (m === 35) return `5 over half ${volgende}`;
  if (m === 40) return `10 over half ${volgende}`;
  if (m === 50 || m === 55) return `${60 - m} voor ${volgende}`;
  if (m < 30) return `${m} ${m === 1 ? "minuut" : "minuten"} over ${h}`;
  return `${60 - m} ${60 - m === 1 ? "minuut" : "minuten"} voor ${volgende}`;
}

/** "3 uur en 15 minuten" */
export function urenEnMinuten(t) {
  const m = minuutVan(t);
  const h = uur12(t);
  if (m === 0) return `${h} uur`;
  return `${h} uur en ${m} ${m === 1 ? "minuut" : "minuten"}`;
}

/** Naam van een bijzondere minuutstand, of null. */
export function bijzonderMoment(t) {
  return { 0: "een heel uur", 15: "een kwartier (kwart over)", 30: "een half uur", 45: "drie kwartier (kwart voor)" }[minuutVan(t)] || null;
}

/** Wat wijst de lange wijzer aan? Bijvoorbeeld: "de 3, dat is 15 minuten". */
export function uitlegMinuutwijzer(t) {
  const m = minuutVan(t);
  const cijfer = m === 0 ? 12 : m / 5;
  if (m % 5 === 0) {
    const extra = { 0: " (een heel uur)", 15: " (een kwartier)", 30: " (een half uur)", 45: " (drie kwartier)" }[m] || "";
    return `De lange wijzer wijst naar de ${cijfer}. Dat is ${m} minuten${extra}.`;
  }
  const vorige = Math.floor(m / 5) * 5;
  const cijferVoor = vorige === 0 ? 12 : vorige / 5;
  return `De lange wijzer staat tussen de ${cijferVoor} en de ${cijferVoor === 12 ? 1 : cijferVoor + 1}: ${vorige} minuten plus ${m - vorige} streepjes = ${m} minuten.`;
}

/** Wat wijst de korte wijzer aan? */
export function uitlegUurwijzer(t) {
  const m = minuutVan(t);
  const h = uur12(t);
  if (m === 0) return `De korte wijzer wijst precies naar de ${h}. Het is ${h} uur.`;
  const volgende = (h % 12) + 1;
  if (m === 30) return `De korte wijzer staat precies tussen de ${h} en de ${volgende}. Het is half ${volgende}.`;
  return `De korte wijzer staat voorbij de ${h}, op weg naar de ${volgende}. Het uur is ${h}.`;
}

/** Dagdeel bij de tijd. */
export function dagdeel(t) {
  const u = uurVan(t);
  if (u < 6) return { naam: "'s nachts", emoji: "🌙" };
  if (u < 12) return { naam: "'s ochtends", emoji: "🌅" };
  if (u < 18) return { naam: "'s middags", emoji: "☀️" };
  return { naam: "'s avonds", emoji: "🌆" };
}

const twee = (n) => String(n).padStart(2, "0");

/** Digitale weergave: 24-uurs "15:05" of 12-uurs "3:05". */
export function digitaal(t, vierentwintig = true) {
  const u = vierentwintig ? uurVan(t) : uur12(t);
  return { uren: vierentwintig ? twee(u) : String(u), minuten: twee(minuutVan(t)) };
}

// ---------------------------------------------------------------------------
// Store: één gedeelde tijd voor de analoge en de digitale klok
// ---------------------------------------------------------------------------

export function maakKlokStore(start) {
  let t = normaliseer(start);
  const luisteraars = new Set();
  return {
    get: () => t,
    /** Zet de tijd. `bron` laat een weergave weten wie de wijziging deed. */
    zet(nieuw, bron = null) {
      const n = normaliseer(nieuw);
      if (n === t && bron !== "animatie") return;
      t = n;
      for (const fn of luisteraars) fn(t, bron);
    },
    /** Alleen voor animaties: een tijd met kommagetallen (vloeiende wijzers). */
    animatie(tFloat) {
      for (const fn of luisteraars) fn(normaliseer(Math.floor(tFloat)), "animatie", tFloat);
    },
    abonneer(fn) {
      luisteraars.add(fn);
      return () => luisteraars.delete(fn);
    },
  };
}

/** Huidige tijd van de computer, in minuten sinds middernacht. */
export function nuInMinuten() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

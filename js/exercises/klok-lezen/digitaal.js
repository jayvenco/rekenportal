// exercises/klok-lezen/digitaal.js
// -----------------------------------------------------------------------------
// De grote digitale klok van "Klok lezen": uren en minuten met pijltjes erboven
// en eronder om ze zelf te veranderen (vasthouden werkt ook), 24-uurs of
// 12-uurs, en het dagdeel (nacht, ochtend, middag, avond).
// -----------------------------------------------------------------------------

import { digitaal, dagdeel } from "./tijd.js";

/**
 * @param {ReturnType<import("./tijd.js").maakKlokStore>} store
 * @param {{opSleepStart?:Function, vierentwintig?:boolean}} opties
 */
export function maakDigitaleKlok(store, opties = {}) {
  let vierentwintig = opties.vierentwintig ?? true;

  const houder = document.createElement("div");
  houder.className = "kl-digi";

  const scherm = document.createElement("div");
  scherm.className = "kl-digi__scherm";
  scherm.setAttribute("role", "group");
  scherm.setAttribute("aria-label", "Digitale klok");

  function kolom(label, stap, korteLabel) {
    const k = document.createElement("div");
    k.className = "kl-digi__kolom";
    const omhoog = maakKnop("▲", `${label} omhoog`, stap);
    const cijfers = document.createElement("div");
    cijfers.className = "kl-digi__cijfers";
    cijfers.setAttribute("aria-live", "off");
    const omlaag = maakKnop("▼", `${label} omlaag`, -stap);
    const onder = document.createElement("div");
    onder.className = "kl-digi__label";
    onder.textContent = korteLabel;
    k.append(omhoog, cijfers, omlaag, onder);
    return { k, cijfers };
  }

  /** Pijltjesknop: één tik = één stap, vasthouden = herhalen. */
  function maakKnop(tekst, aria, stap) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "kl-digi__pijl";
    b.textContent = tekst;
    b.setAttribute("aria-label", aria);
    let wacht = null;
    let herhaal = null;
    const doe = () => store.zet(store.get() + stap, "digitaal");
    const stop = () => {
      clearTimeout(wacht);
      clearInterval(herhaal);
      wacht = herhaal = null;
    };
    b.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      opties.opSleepStart?.();
      doe();
      wacht = setTimeout(() => (herhaal = setInterval(doe, 110)), 450);
      e.preventDefault();
    });
    for (const ev of ["pointerup", "pointerleave", "pointercancel", "blur"]) b.addEventListener(ev, stop);
    b.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        opties.opSleepStart?.();
        doe();
      }
    });
    return b;
  }

  const uren = kolom("Uren", 60, "uur");
  const dubbel = document.createElement("div");
  dubbel.className = "kl-digi__dubbelepunt";
  dubbel.textContent = ":";
  dubbel.setAttribute("aria-hidden", "true");
  const minuten = kolom("Minuten", 1, "minuten");
  scherm.append(uren.k, dubbel, minuten.k);
  houder.appendChild(scherm);

  // snelle minuutstappen
  const snel = document.createElement("div");
  snel.className = "kl-digi__snel";
  for (const [tekst, stap] of [["−15 min", -15], ["−5 min", -5], ["+5 min", 5], ["+15 min", 15]]) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "kl-knop kl-knop--zacht";
    b.textContent = tekst;
    b.addEventListener("click", () => {
      opties.opSleepStart?.();
      store.zet(store.get() + stap, "digitaal");
    });
    snel.appendChild(b);
  }
  houder.appendChild(snel);

  // 24-uurs of 12-uurs
  const formaat = document.createElement("div");
  formaat.className = "kl-digi__formaat";
  const knop24 = document.createElement("button");
  const knop12 = document.createElement("button");
  for (const [b, tekst] of [[knop24, "24-uurs (15:00)"], [knop12, "12-uurs (3:00)"]]) {
    b.type = "button";
    b.className = "kl-knop kl-knop--zacht";
    b.textContent = tekst;
    formaat.appendChild(b);
  }
  houder.appendChild(formaat);

  const dag = document.createElement("div");
  dag.className = "kl-digi__dagdeel";
  dag.setAttribute("aria-live", "polite");
  houder.appendChild(dag);

  function teken(t) {
    const d = digitaal(t, vierentwintig);
    uren.cijfers.textContent = d.uren;
    minuten.cijfers.textContent = d.minuten;
    const deel = dagdeel(t);
    dag.textContent = `${deel.emoji} ${deel.naam}`;
    knop24.setAttribute("aria-pressed", String(vierentwintig));
    knop12.setAttribute("aria-pressed", String(!vierentwintig));
  }
  knop24.addEventListener("click", () => {
    vierentwintig = true;
    teken(store.get());
  });
  knop12.addEventListener("click", () => {
    vierentwintig = false;
    teken(store.get());
  });

  const stopAbonnement = store.abonneer((t) => teken(t));
  teken(store.get());

  return { element: houder, ruimOp: stopAbonnement };
}

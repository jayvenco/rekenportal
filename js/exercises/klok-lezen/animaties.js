// exercises/klok-lezen/animaties.js
// -----------------------------------------------------------------------------
// Korte animaties voor "Klok lezen": een uur, een half uur, de kwartieren, en
// een sprong van 1 tot 10 uur vooruit of achteruit. De animatie draait de
// wijzers vloeiend via de gedeelde klok-store.
// -----------------------------------------------------------------------------

import { normaliseer, uur12, tijdInWoorden } from "./tijd.js";

const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/**
 * @param {ReturnType<import("./tijd.js").maakKlokStore>} store
 * @param {{opBijschrift?:(tekst:string, soort?:string)=>void, opMarkeer?:(minuut:number, kleur?:string)=>void, opTaart?:(aan:boolean)=>void, opStatus?:(bezig:boolean)=>void}} haken
 */
export function maakAnimator(store, haken = {}) {
  let looptoken = 0;

  const bijschrift = (t, soort) => haken.opBijschrift?.(t, soort);

  function stop() {
    looptoken += 1;
    haken.opStatus?.(false);
  }

  /** Draait de tijd vloeiend van `van` naar `naar` (in minuten). Geeft false als de animatie is afgebroken. */
  function tween(van, naar, ms, token) {
    const duur = REDUCED ? 60 : ms;
    return new Promise((resolve) => {
      const start = performance.now();
      const stap = (nu) => {
        if (token !== looptoken) return resolve(false);
        const p = Math.min(1, (nu - start) / duur);
        store.animatie(van + (naar - van) * ease(p));
        if (p < 1) requestAnimationFrame(stap);
        else {
          store.zet(naar, "animatie");
          resolve(true);
        }
      };
      requestAnimationFrame(stap);
    });
  }
  const pauze = (ms, token) => new Promise((resolve) => setTimeout(() => resolve(token === looptoken), REDUCED ? 30 : ms));

  /** Begint bij het hele uur van nu. */
  function basisUur() {
    const basis = Math.floor(store.get() / 60) * 60;
    store.zet(basis, "animatie");
    return basis;
  }

  async function start(naam, taak) {
    stop();
    const token = looptoken;
    haken.opStatus?.(true);
    haken.opTaart?.(true);
    try {
      await taak(token);
    } finally {
      if (token === looptoken) haken.opStatus?.(false);
    }
  }

  return {
    stop,

    /** Een uur: de lange wijzer gaat één keer rond, de korte wijzer één cijfer verder. */
    speelUur() {
      return start("uur", async (token) => {
        const basis = basisUur();
        const h = uur12(basis);
        bijschrift(`Het is ${h} uur. De lange wijzer staat op de 12. Kijk goed: nu gaat de lange wijzer één keer rond…`);
        if (!(await pauze(1200, token))) return;
        if (!(await tween(basis, basis + 60, 5000, token))) return;
        haken.opMarkeer?.(0, "#e0533d");
        bijschrift(`Eén keer rond = 60 minuten = 1 uur. De korte wijzer is één cijfer verder: van de ${h} naar de ${(h % 12) + 1}. Het is nu ${(h % 12) + 1} uur.`, "klaar");
      });
    },

    /** Een half uur: de lange wijzer gaat naar de 6. */
    speelHalfUur() {
      return start("half", async (token) => {
        const basis = basisUur();
        const h = uur12(basis);
        bijschrift(`Het is ${h} uur. Nu gaat de lange wijzer van de 12 naar de 6…`);
        if (!(await pauze(1000, token))) return;
        if (!(await tween(basis, basis + 30, 3200, token))) return;
        haken.opMarkeer?.(30, "#2f6fb5");
        bijschrift(`De lange wijzer is een halve ronde: 30 minuten = een half uur. De korte wijzer staat precies tussen de ${h} en de ${(h % 12) + 1}. Het is half ${(h % 12) + 1}.`, "klaar");
      });
    },

    /** Alle kwartieren: kwart over, half, kwart voor en een heel uur. */
    speelKwartieren() {
      return start("kwartieren", async (token) => {
        const basis = basisUur();
        const h = uur12(basis);
        const volgende = (h % 12) + 1;
        bijschrift(`Het is ${h} uur. Een uur heeft vier kwartieren. We tellen ze één voor één…`);
        if (!(await pauze(1200, token))) return;
        const stappen = [
          [15, "#2e9e6b", `Het eerste kwartier: 15 minuten. De lange wijzer staat op de 3. Het is kwart over ${h}.`],
          [30, "#2f6fb5", `Het tweede kwartier: samen 30 minuten, een half uur. De lange wijzer staat op de 6. Het is half ${volgende}.`],
          [45, "#e8913a", `Het derde kwartier: samen 45 minuten, drie kwartier. De lange wijzer staat op de 9. Het is kwart voor ${volgende}.`],
          [60, "#e0533d", `Het vierde kwartier: samen 60 minuten, een heel uur. De lange wijzer staat weer op de 12. Het is ${volgende} uur.`],
        ];
        let vorige = 0;
        for (const [minuten, kleur, tekst] of stappen) {
          if (!(await tween(basis + vorige, basis + minuten, 1800, token))) return;
          haken.opMarkeer?.(minuten % 60, kleur);
          bijschrift(tekst, minuten === 60 ? "klaar" : "");
          vorige = minuten;
          if (minuten < 60 && !(await pauze(2400, token))) return;
        }
      });
    },

    /** 1 tot 10 uur vooruit (positief) of achteruit (negatief). */
    springUren(n) {
      return start("sprong", async (token) => {
        const van = store.get();
        const naar = van + n * 60;
        const woord = Math.abs(n) === 1 ? "1 uur" : `${Math.abs(n)} uur`;
        bijschrift(`${tijdInWoorden(van)}: ${woord} ${n > 0 ? "later" : "eerder"}…`);
        if (!(await tween(van, naar, 700 + 380 * Math.abs(n), token))) return;
        const nieuw = normaliseer(naar);
        bijschrift(`${tijdInWoorden(van)} ${n > 0 ? "+" : "−"} ${woord} = ${tijdInWoorden(nieuw)}. De lange wijzer ging ${Math.abs(n)} keer ${n > 0 ? "rond" : "terug rond"}, de korte wijzer ${Math.abs(n)} ${Math.abs(n) === 1 ? "cijfer" : "cijfers"} ${n > 0 ? "vooruit" : "terug"}.`, "klaar");
      });
    },

    /** Zet de lange wijzer vloeiend op een kwartier (0, 15, 30 of 45) binnen het huidige uur. */
    naarMinuut(minuut) {
      return start("minuut", async (token) => {
        const van = store.get();
        const basis = Math.floor(van / 60) * 60;
        if (!(await tween(van, basis + minuut, 900, token))) return;
        haken.opMarkeer?.(minuut % 60, { 0: "#e0533d", 15: "#2e9e6b", 30: "#2f6fb5", 45: "#e8913a" }[minuut]);
        const uitleg = { 0: "een heel uur (0 minuten)", 15: "een kwartier (15 minuten): kwart over", 30: "een half uur (30 minuten): half", 45: "drie kwartier (45 minuten): kwart voor" }[minuut];
        bijschrift(`${tijdInWoorden(store.get())} = ${uitleg}.`, "klaar");
      });
    },
  };
}

// exercises/breuken/oefenscherm.js
// -----------------------------------------------------------------------------
// Het oefenscherm van de breuken/procenten/kommagetallen-module: toont vragen
// één voor één, verwerkt antwoorden via een cijfertoetsenbord, geeft feedback.
// -----------------------------------------------------------------------------

import { recordAnswer } from "../../storage.js";
import { genereerOpgave, opgaveNaarSleutel } from "./opgaven.js";
import { genereerUniekeOpgave } from "../../utils/willekeurig.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";
import { berekenPunten, slaSessieOp, toonPuntenAnimatie } from "../../utils/punten.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/raketAnimatie.js";

const EXERCISE_ID = "breuken";

/** Grootste gemene deler (Euclides). */
function ggd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Normaliseert een breukstring naar vereenvoudigde {teller, noemer}.
 * Accepteert "3/4", "6/8" etc.
 */
function parseBreuk(ingave) {
  const delen = ingave.trim().split("/");
  if (delen.length !== 2) return null;
  const teller = parseInt(delen[0], 10);
  const noemer = parseInt(delen[1], 10);
  if (!Number.isFinite(teller) || !Number.isFinite(noemer) || noemer === 0) return null;
  const d = ggd(teller, noemer);
  return { teller: teller / d, noemer: noemer / d };
}

/**
 * Controleert of een antwoord goed is.
 * @param {string} ingave - ruwe toetsenbord-invoer
 * @param {Object} antwoordGoed - uit de opgave
 * @returns {boolean}
 */
function isAntwoordGoed(ingave, antwoordGoed) {
  const trimmed = ingave.trim();
  if (trimmed === "") return false;

  if (antwoordGoed.type === "procent") {
    // Vergelijk als getal (bv. "75" === 75)
    const getal = Number(trimmed);
    return Number.isFinite(getal) && getal === antwoordGoed.normaal;
  }

  if (antwoordGoed.type === "komma") {
    // Vergelijk als decimaal getal, sta zowel komma als punt toe
    const genormaliseerd = trimmed.replace(",", ".");
    const getal = parseFloat(genormaliseerd);
    return Number.isFinite(getal) && Math.abs(getal - antwoordGoed.normaal) < 0.0001;
  }

  if (antwoordGoed.type === "breuk") {
    // Vergelijk als vereenvoudigde breuk
    const geparsed = parseBreuk(trimmed);
    if (!geparsed) return false;
    return geparsed.teller === antwoordGoed.teller && geparsed.noemer === antwoordGoed.noemer;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Cijferpad — aangepast voor breuken/procenten/kommagetallen
// ---------------------------------------------------------------------------

/**
 * Bouwt een cijfertoetsenbord dat past bij het antwoordtype.
 * @param {HTMLElement} container
 * @param {string} antwoordType - "procent" | "komma" | "breuk"
 * @param {Function} opGeantwoord - callback(ingave: string)
 * @returns {Function} opruimfunctie
 */
function bouwCijferPad(container, antwoordType, opGeantwoord) {
  container.innerHTML = "";

  let huidigeWaarde = "";

  const scherm = document.createElement("div");
  scherm.className = "antwoord-scherm";
  scherm.setAttribute("aria-label", "Jouw antwoord");
  container.appendChild(scherm);

  const pad = document.createElement("div");
  pad.className = "cijfer-pad";

  function toonWaarde() {
    scherm.textContent = huidigeWaarde;
  }

  function voegToe(c) {
    const maxLen = antwoordType === "breuk" ? 9 : antwoordType === "procent" ? 3 : 7;
    if (huidigeWaarde.length < maxLen) {
      huidigeWaarde += c;
      toonWaarde();
    }
  }

  // Rij 1: 1 2 3
  for (const cijfer of [1, 2, 3]) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "cijfer-toets";
    knop.textContent = String(cijfer);
    knop.setAttribute("aria-label", `Cijfer ${cijfer}`);
    knop.addEventListener("click", () => voegToe(String(cijfer)));
    pad.appendChild(knop);
  }

  // Rij 2: 4 5 6
  for (const cijfer of [4, 5, 6]) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "cijfer-toets";
    knop.textContent = String(cijfer);
    knop.setAttribute("aria-label", `Cijfer ${cijfer}`);
    knop.addEventListener("click", () => voegToe(String(cijfer)));
    pad.appendChild(knop);
  }

  // Rij 3: 7 8 9
  for (const cijfer of [7, 8, 9]) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "cijfer-toets";
    knop.textContent = String(cijfer);
    knop.setAttribute("aria-label", `Cijfer ${cijfer}`);
    knop.addEventListener("click", () => voegToe(String(cijfer)));
    pad.appendChild(knop);
  }

  // Rij 4: speciale toetsen + 0
  const specialeRij = document.createElement("div");
  specialeRij.style.display = "contents";

  if (antwoordType === "komma") {
    // Decimale komma-toets
    const kommaKnop = document.createElement("button");
    kommaKnop.type = "button";
    kommaKnop.className = "cijfer-toets";
    kommaKnop.textContent = ",";
    kommaKnop.setAttribute("aria-label", "Komma");
    kommaKnop.addEventListener("click", () => {
      if (!huidigeWaarde.includes(",") && !huidigeWaarde.includes(".")) {
        if (huidigeWaarde === "") voegToe("0,");
        else voegToe(",");
      }
    });
    pad.appendChild(kommaKnop);
  }

  if (antwoordType === "breuk") {
    // Breukstreep-toets
    const streepKnop = document.createElement("button");
    streepKnop.type = "button";
    streepKnop.className = "cijfer-toets";
    streepKnop.textContent = "/";
    streepKnop.setAttribute("aria-label", "Breukstreep");
    streepKnop.addEventListener("click", () => {
      if (huidigeWaarde.length > 0 && !huidigeWaarde.includes("/")) {
        voegToe("/");
      }
    });
    pad.appendChild(streepKnop);
  }

  // 0
  const nulKnop = document.createElement("button");
  nulKnop.type = "button";
  nulKnop.className = "cijfer-toets";
  nulKnop.textContent = "0";
  nulKnop.setAttribute("aria-label", "Cijfer 0");
  nulKnop.addEventListener("click", () => voegToe("0"));
  pad.appendChild(nulKnop);

  // Wis (backspace)
  const wisKnop = document.createElement("button");
  wisKnop.type = "button";
  wisKnop.className = "cijfer-toets";
  wisKnop.textContent = "⌫";
  wisKnop.setAttribute("aria-label", "Verwijder laatste teken");
  wisKnop.addEventListener("click", () => {
    huidigeWaarde = huidigeWaarde.slice(0, -1);
    toonWaarde();
  });
  pad.appendChild(wisKnop);

  // Bevestig
  const bevestigKnop = document.createElement("button");
  bevestigKnop.type = "button";
  bevestigKnop.className = "cijfer-toets";
  bevestigKnop.style.background = "#38b26a";
  bevestigKnop.style.color = "#ffffff";
  bevestigKnop.textContent = "✓";
  bevestigKnop.setAttribute("aria-label", "Antwoord bevestigen");
  bevestigKnop.addEventListener("click", () => {
    if (huidigeWaarde === "") return;
    opGeantwoord(huidigeWaarde);
  });
  pad.appendChild(bevestigKnop);

  container.appendChild(pad);

  function toetsHandler(gebeurtenis) {
    const key = gebeurtenis.key;
    if (/^[0-9]$/.test(key)) {
      voegToe(key);
    } else if (key === "," || key === ".") {
      if (antwoordType === "komma" && !huidigeWaarde.includes(",") && !huidigeWaarde.includes(".")) {
        if (huidigeWaarde === "") voegToe("0,");
        else voegToe(",");
      }
    } else if (key === "/") {
      if (antwoordType === "breuk" && huidigeWaarde.length > 0 && !huidigeWaarde.includes("/")) {
        voegToe("/");
      }
    } else if (key === "Backspace") {
      huidigeWaarde = huidigeWaarde.slice(0, -1);
      toonWaarde();
    } else if (key === "Enter" && huidigeWaarde !== "") {
      opGeantwoord(huidigeWaarde);
    }
  }
  document.addEventListener("keydown", toetsHandler);

  return () => document.removeEventListener("keydown", toetsHandler);
}

// ---------------------------------------------------------------------------
// Oefenscherm
// ---------------------------------------------------------------------------

/**
 * Start de oefensessie.
 * @param {HTMLElement} container
 * @param {Object} instellingen - { conversieType, aantalOpgaven }
 */
export function toonOefeningScherm(container, instellingen) {
  const gebruikteSleutels = new Set();
  let opgaveIndex = 0;
  let aantalGoedTotaal = 0;
  let startTijdOpgave = performance.now();
  let huidigeOpgave = null;
  let bezigMetFeedback = false;
  let pogingNummer = 1;

  container.innerHTML = "";

  // --- Koppen: voortgang ---
  const koppenRij = document.createElement("div");
  koppenRij.className = "oefen-koppen";
  const voortgangTekst = document.createElement("span");
  voortgangTekst.className = "voortgang-tekst";
  koppenRij.appendChild(voortgangTekst);
  container.appendChild(koppenRij);

  // --- Voortgangscirkels ---
  const voortgangCirkels = maakVoortgangCirkels(container, instellingen.aantalOpgaven);
  const rewardTracker = maakRewardTracker(EXERCISE_ID, instellingen.aantalOpgaven);

  // --- Nyan Cat animatie ---
  const raket = maakRaketAnimatie(container, instellingen.aantalOpgaven);
  raket.element.style.marginBottom = "10px";

  // --- Vraagvlak ---
  const vraagVlak = document.createElement("div");
  vraagVlak.className = "opgave-vraag";
  vraagVlak.setAttribute("aria-live", "polite");
  container.appendChild(vraagVlak);

  // --- Feedback ---
  const feedbackVlak = document.createElement("div");
  feedbackVlak.className = "feedback-vlak";
  feedbackVlak.setAttribute("aria-live", "polite");
  container.appendChild(feedbackVlak);

  // --- Invoergebied ---
  const invoerVlak = document.createElement("div");
  container.appendChild(invoerVlak);

  function bijwerkenVoortgang() {
    voortgangTekst.textContent = `Opgave ${Math.min(opgaveIndex + 1, instellingen.aantalOpgaven)} van ${instellingen.aantalOpgaven} — ${aantalGoedTotaal} goed`;
  }

  let opruimHuidigeInvoer = null;

  function toonOpgave() {
    if (opgaveIndex >= instellingen.aantalOpgaven) {
      toonEindscherm();
      return;
    }
    bezigMetFeedback = false;
    pogingNummer = 1;
    feedbackVlak.className = "feedback-vlak";
    feedbackVlak.textContent = "";
    if (opruimHuidigeInvoer) {
      opruimHuidigeInvoer();
      opruimHuidigeInvoer = null;
    }

    huidigeOpgave = genereerUniekeOpgave(
      () => genereerOpgave(instellingen),
      opgaveNaarSleutel,
      gebruikteSleutels
    );
    startTijdOpgave = performance.now();
    bijwerkenVoortgang();

    // Toon vraag — gebruik een grote weergave
    vraagVlak.innerHTML = `<span class="getal-groot">${huidigeOpgave.vraagTekst}</span>`;

    // Bouw het juiste cijferpad
    opruimHuidigeInvoer = bouwCijferPad(invoerVlak, huidigeOpgave.antwoordType, verwerkAntwoord);
  }

  function verwerkAntwoord(ingave) {
    if (bezigMetFeedback) return;
    if (huidigeOpgave === null) return;

    const isGoed = isAntwoordGoed(ingave, huidigeOpgave.antwoordGoed);
    const tijdBesteed = Math.round(performance.now() - startTijdOpgave);

    if (isGoed) {
      bezigMetFeedback = true;
      aantalGoedTotaal += 1;
      raket.goedAntwoord();

      recordAnswer({
        exerciseId: EXERCISE_ID,
        correct: true,
        timeMs: tijdBesteed,
        meta: { ...huidigeOpgave.meta, pogingen: pogingNummer },
      }).catch(() => {});

      if (pogingNummer === 1) {
        feedbackVlak.className = "feedback-vlak feedback-vlak--goed";
        feedbackVlak.textContent = `✓ ${geefCompliment()}`;
        voortgangCirkels.zetStatus(opgaveIndex, "goed");
      } else {
        feedbackVlak.className = "feedback-vlak feedback-vlak--tweede-poging-goed";
        feedbackVlak.textContent = `✓ ${geefCompliment()} (tweede poging!)`;
        voortgangCirkels.zetStatus(opgaveIndex, "tweedePogingGoed");
      }
      speelGoedGeluid();
      rewardTracker.registreerGoed(pogingNummer, feedbackVlak);
      bijwerkenVoortgang();
      setTimeout(() => {
        opgaveIndex += 1;
        toonOpgave();
      }, 1600);
    } else if (pogingNummer === 1) {
      // Eerste poging fout: nog een kans
      pogingNummer = 2;
      raket.foutAntwoord();
      rewardTracker.registreerFout();
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = `${geefFoutmelding()} Probeer het nog eens.`;
      speelFoutGeluid();
      if (opruimHuidigeInvoer) {
        opruimHuidigeInvoer();
        opruimHuidigeInvoer = null;
      }
      opruimHuidigeInvoer = bouwCijferPad(invoerVlak, huidigeOpgave.antwoordType, verwerkAntwoord);
    } else {
      // Tweede poging ook fout: toon juiste antwoord
      bezigMetFeedback = true;
      raket.foutAntwoord();
      recordAnswer({
        exerciseId: EXERCISE_ID,
        correct: false,
        timeMs: tijdBesteed,
        meta: { ...huidigeOpgave.meta, pogingen: 2 },
      }).catch(() => {});
      feedbackVlak.className = "feedback-vlak feedback-vlak--fout";
      feedbackVlak.textContent = `${geefFoutmelding()} Het juiste antwoord is ${huidigeOpgave.antwoordGoed.display}.`;
      speelFoutGeluid();
      voortgangCirkels.zetStatus(opgaveIndex, "fout");
      bijwerkenVoortgang();
      setTimeout(() => {
        opgaveIndex += 1;
        toonOpgave();
      }, 1600);
    }
  }

  function toonEindscherm() {
    container.innerHTML = "";

    const kaart = document.createElement("div");
    kaart.className = "kaart";
    kaart.style.textAlign = "center";

    const titel = document.createElement("h2");
    const percentageGoed = (aantalGoedTotaal / instellingen.aantalOpgaven) * 100;
    if (percentageGoed === 100) toonPerfecteScoreAnimatie();
    titel.textContent = percentageGoed >= 70 ? "Goed gedaan!" : "Bijna! Nog even oefenen.";
    kaart.appendChild(titel);

    const raketEind = toonEindAnimatie(kaart, percentageGoed);
    const resultaatTekst = document.createElement("p");
    resultaatTekst.style.fontSize = "24px";
    resultaatTekst.style.fontWeight = "700";
    resultaatTekst.textContent = `Je had ${aantalGoedTotaal} van de ${instellingen.aantalOpgaven} goed!`;
    kaart.appendChild(resultaatTekst);

    const rewardVlak = document.createElement("div");
    kaart.appendChild(rewardVlak);

    const actiesRij = document.createElement("div");
    actiesRij.className = "acties-rij";

    const nogEenKeerKnop = document.createElement("button");
    nogEenKeerKnop.type = "button";
    nogEenKeerKnop.className = "knop knop--primair";
    nogEenKeerKnop.textContent = "Nog een keer";
    nogEenKeerKnop.addEventListener("click", () => {
      // Start opnieuw met dezelfde instellingen
      container.innerHTML = "";
      toonOefeningScherm(container, instellingen);
    });

    const terugKnop = document.createElement("button");
    terugKnop.type = "button";
    terugKnop.className = "knop knop--zacht";
    terugKnop.textContent = "Terug naar het menu";
    terugKnop.addEventListener("click", () => {
      window.location.hash = "#/";
    });

    actiesRij.append(nogEenKeerKnop, terugKnop);
    kaart.appendChild(actiesRij);
    container.appendChild(kaart);

    (async () => {
      const rewards = await rewardTracker.voltooi();
      toonRewardResultaat(rewardVlak, rewards);
      await verversCoinCounter();
      await toonBadgeUnlocks(rewards?.badgesEarned || []);
    })();
  }

  toonOpgave();
}
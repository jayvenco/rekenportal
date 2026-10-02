// exercises/grafieken/oefenscherm.js
// -----------------------------------------------------------------------------
// Oefensessie voor "Grafieken lezen": opgave tonen, antwoord invullen,
// "Controleer antwoord", feedback, uitleg openen en naar de volgende vraag.
// Twee pogingen per opgave; bij de tweede foute poging verschijnt het antwoord.
// -----------------------------------------------------------------------------

import { recordAnswer, getActiefProfielId, listProfielen } from "../../storage.js";
import { geefCompliment, geefFoutmelding } from "../../utils/complimenten.js";
import { speelGoedGeluid, speelFoutGeluid } from "../../utils/geluid.js";
import { maakRaketAnimatie, toonEindAnimatie } from "../../utils/voortgangAnimatie.js";
import { maakVoortgangCirkels } from "../../utils/voortgangCirkels.js";
import { maakRewardTracker, toonBadgeUnlocks, toonRewardResultaat, verversCoinCounter } from "../../utils/rewards.js";
import { toonPerfecteScoreAnimatie } from "../../utils/eindeAnimatie.js";
import { laadOpgaven, kiesSet } from "./opgaven.js";
import { maakGrafiek, voegGrafiekStijlToe } from "./grafiekWeergave.js";
import { controleerAntwoord, isIngevuld, toonJuisteAntwoord } from "./validatie.js";
import { registreerResultaat } from "./voortgang.js";

const EXERCISE_ID = "grafieken";

const GOED_TEKST = {
  getal: "Goed gedaan! Je hebt de juiste waarde gevonden.",
  meerkeuze: "Goed gedaan! Je hebt de juiste conclusie gekozen.",
  waaronwaar: "Goed gedaan! Je hebt de bewering goed beoordeeld.",
  meerdere: "Goed gedaan! Je hebt alle juiste antwoorden gekozen.",
  tekst: "Goed gedaan! Je hebt het juiste antwoord gevonden.",
};

export async function startOefensessie(container, instellingen, opKlaar) {
  voegGrafiekStijlToe();
  container.innerHTML = "";
  let data;
  try {
    data = await laadOpgaven();
  } catch (fout) {
    container.textContent = "De opgaven konden niet geladen worden.";
    console.error(fout);
    return;
  }
  const opgaven = kiesSet(data.opgaven, instellingen);
  if (!opgaven.length) {
    container.textContent = "Er zijn geen opgaven voor deze keuze.";
    return;
  }

  let index = 0;
  let aantalGoed = 0;
  let poging = 1;
  let klaar = false;
  let start = performance.now();
  let profielNaam = "";
  (async () => {
    const id = getActiefProfielId();
    if (id !== null) profielNaam = (await listProfielen()).find((p) => p.id === id)?.naam || "";
  })();

  const koppen = document.createElement("div");
  koppen.className = "oefen-koppen";
  const voortgangTekst = document.createElement("span");
  voortgangTekst.className = "voortgang-tekst";
  koppen.appendChild(voortgangTekst);
  container.appendChild(koppen);
  const cirkels = maakVoortgangCirkels(container, opgaven.length);
  const raket = maakRaketAnimatie(container, opgaven.length);
  const tracker = maakRewardTracker(EXERCISE_ID, opgaven.length);

  const opgaveVlak = document.createElement("div");
  const feedback = document.createElement("div");
  feedback.className = "feedback-vlak";
  feedback.setAttribute("aria-live", "polite");
  const uitlegVlak = document.createElement("div");
  container.append(opgaveVlak, feedback, uitlegVlak);

  let huidig = null;
  let lees = () => null;

  function bijwerken() {
    voortgangTekst.textContent = `Opgave ${Math.min(index + 1, opgaven.length)} van ${opgaven.length} — ${aantalGoed} goed`;
  }

  function bouwInvoer(vraag, vlak) {
    vlak.innerHTML = "";
    if (vraag.type === "getal" || vraag.type === "tekst") {
      const rij = document.createElement("div");
      const inv = document.createElement("input");
      inv.className = "gr-invoer";
      inv.type = "text";
      inv.autocomplete = "off";
      inv.setAttribute("aria-label", "Jouw antwoord");
      if (vraag.type === "getal") inv.inputMode = "decimal";
      inv.addEventListener("keydown", (e) => { if (e.key === "Enter") controleer(); });
      rij.appendChild(inv);
      if (vraag.eenheid) {
        const e = document.createElement("span");
        e.textContent = ` ${vraag.eenheid}`;
        e.style.cssText = "font-size:1.2rem;font-weight:700;margin-left:6px";
        rij.appendChild(e);
      }
      vlak.appendChild(rij);
      lees = () => inv.value;
      setTimeout(() => inv.focus(), 0);
    } else if (vraag.type === "meerkeuze" || vraag.type === "waaronwaar") {
      const opties = vraag.type === "meerkeuze" ? vraag.opties : ["Waar", "Niet waar"];
      let gekozen = null;
      const groep = document.createElement("div");
      groep.className = "gr-opties";
      groep.setAttribute("role", "radiogroup");
      opties.forEach((o, i) => {
        const k = document.createElement("button");
        k.type = "button";
        k.className = "gr-optie";
        k.textContent = o;
        k.setAttribute("aria-pressed", "false");
        k.addEventListener("click", () => {
          gekozen = vraag.type === "meerkeuze" ? i : i === 0;
          [...groep.children].forEach((x, j) => x.setAttribute("aria-pressed", String(j === i)));
        });
        groep.appendChild(k);
      });
      vlak.appendChild(groep);
      lees = () => gekozen;
    } else if (vraag.type === "meerdere") {
      const gekozen = new Set();
      const groep = document.createElement("div");
      groep.className = "gr-opties";
      vraag.opties.forEach((o, i) => {
        const k = document.createElement("button");
        k.type = "button";
        k.className = "gr-optie";
        k.textContent = o;
        k.setAttribute("aria-pressed", "false");
        k.addEventListener("click", () => {
          if (gekozen.has(i)) gekozen.delete(i); else gekozen.add(i);
          k.setAttribute("aria-pressed", String(gekozen.has(i)));
        });
        groep.appendChild(k);
      });
      vlak.appendChild(groep);
      lees = () => [...gekozen];
    }
  }

  let invoerVlak, controleKnop, volgendeKnop;

  function toonOpgave() {
    if (index >= opgaven.length) { toonEind(); return; }
    huidig = opgaven[index];
    poging = 1;
    klaar = false;
    start = performance.now();
    bijwerken();
    feedback.className = "feedback-vlak";
    feedback.textContent = "";
    uitlegVlak.innerHTML = "";
    opgaveVlak.innerHTML = "";

    const meta = document.createElement("div");
    meta.className = "gr-meta";
    for (const t of [`Niveau ${huidig.niveau}`, huidig.categorie]) {
      const b = document.createElement("span");
      b.className = "gr-badge";
      b.textContent = t;
      meta.appendChild(b);
    }
    const titel = document.createElement("h2");
    titel.textContent = huidig.titel;
    const ctx = document.createElement("p");
    ctx.className = "gr-context";
    ctx.textContent = huidig.context;
    const vraag = document.createElement("p");
    vraag.className = "gr-vraag";
    vraag.textContent = huidig.vraag.tekst;
    invoerVlak = document.createElement("div");
    const acties = document.createElement("div");
    acties.className = "acties-rij";
    controleKnop = document.createElement("button");
    controleKnop.type = "button";
    controleKnop.className = "knop knop--primair";
    controleKnop.textContent = "Controleer antwoord";
    controleKnop.addEventListener("click", controleer);
    volgendeKnop = document.createElement("button");
    volgendeKnop.type = "button";
    volgendeKnop.className = "knop knop--primair";
    volgendeKnop.textContent = index + 1 >= opgaven.length ? "Afronden" : "Volgende opgave";
    volgendeKnop.style.display = "none";
    volgendeKnop.addEventListener("click", () => { index += 1; toonOpgave(); });
    acties.append(controleKnop, volgendeKnop);

    opgaveVlak.append(meta, titel, ctx, maakGrafiek(huidig.grafiek), vraag, invoerVlak, acties);
    bouwInvoer(huidig.vraag, invoerVlak);
  }

  function toonUitleg() {
    uitlegVlak.innerHTML = "";
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "knop knop--zacht";
    knop.textContent = "Bekijk de uitleg";
    const doos = document.createElement("div");
    doos.className = "gr-uitleg";
    doos.hidden = true;
    const kop = document.createElement("strong");
    kop.textContent = "Zo vind je het antwoord:";
    const lijst = document.createElement("ol");
    for (const stap of huidig.uitleg) {
      const li = document.createElement("li");
      li.textContent = stap;
      lijst.appendChild(li);
    }
    const ant = document.createElement("p");
    ant.innerHTML = "<strong>Antwoord:</strong> ";
    ant.appendChild(document.createTextNode(toonJuisteAntwoord(huidig.vraag)));
    const leerdoel = document.createElement("p");
    leerdoel.style.cssText = "color:#52667a;font-size:.95rem";
    leerdoel.textContent = `Leerdoel: ${huidig.leerdoel}`;
    doos.append(kop, lijst, ant, leerdoel);
    knop.addEventListener("click", () => {
      doos.hidden = !doos.hidden;
      knop.textContent = doos.hidden ? "Bekijk de uitleg" : "Verberg de uitleg";
    });
    uitlegVlak.append(knop, doos);
  }

  async function rondAf(goed) {
    klaar = true;
    controleKnop.style.display = "none";
    volgendeKnop.style.display = "";
    registreerResultaat(huidig.id, goed);
    try {
      await recordAnswer({
        exerciseId: EXERCISE_ID,
        correct: goed,
        timeMs: Math.round(performance.now() - start),
        meta: { opgaveId: huidig.id, niveau: huidig.niveau, categorie: huidig.categorie, pogingen: poging },
      });
    } catch (fout) {
      console.error("Kon antwoord niet opslaan:", fout);
    }
    toonUitleg();
    volgendeKnop.focus();
  }

  async function controleer() {
    if (klaar) return;
    const invoer = lees();
    if (!isIngevuld(huidig.vraag, invoer)) {
      feedback.className = "feedback-vlak feedback-vlak--fout";
      feedback.textContent = "Vul eerst een antwoord in of kies een antwoord.";
      return;
    }
    if (controleerAntwoord(huidig.vraag, invoer)) {
      aantalGoed += 1;
      feedback.className = poging === 1 ? "feedback-vlak feedback-vlak--goed" : "feedback-vlak feedback-vlak--tweede-poging-goed";
      feedback.textContent = `✓ ${GOED_TEKST[huidig.vraag.type]} ${geefCompliment(profielNaam)}`;
      cirkels.zetStatus(index, poging === 1 ? "goed" : "tweedePogingGoed");
      speelGoedGeluid();
      raket.goedAntwoord();
      tracker.registreerGoed(poging, feedback);
      bijwerken();
      await rondAf(true);
    } else if (poging === 1) {
      poging = 2;
      tracker.registreerFout();
      feedback.className = "feedback-vlak feedback-vlak--fout";
      feedback.textContent = `${huidig.hint} Probeer het nog eens.`;
      speelFoutGeluid();
    } else {
      feedback.className = "feedback-vlak feedback-vlak--fout";
      feedback.textContent = `${geefFoutmelding()} Het juiste antwoord is: ${toonJuisteAntwoord(huidig.vraag)}.`;
      cirkels.zetStatus(index, "fout");
      speelFoutGeluid();
      raket.foutAntwoord();
      bijwerken();
      await rondAf(false);
    }
  }

  function toonEind() {
    container.innerHTML = "";
    const kaart = document.createElement("div");
    kaart.className = "kaart";
    kaart.style.textAlign = "center";
    const pct = (aantalGoed / opgaven.length) * 100;
    if (pct === 100) toonPerfecteScoreAnimatie();
    const t = document.createElement("h2");
    t.textContent = pct >= 70 ? "Goed gedaan!" : "Bijna! Nog even oefenen.";
    kaart.appendChild(t);
    toonEindAnimatie(kaart, pct);
    const r = document.createElement("p");
    r.style.cssText = "font-size:24px;font-weight:700";
    r.textContent = `Je had ${aantalGoed} van de ${opgaven.length} goed!`;
    kaart.appendChild(r);
    const rewardVlak = document.createElement("div");
    kaart.appendChild(rewardVlak);
    const acties = document.createElement("div");
    acties.className = "acties-rij";
    const maak = (tekst, klasse, opts) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `knop ${klasse}`;
      b.textContent = tekst;
      b.addEventListener("click", () => opKlaar(opts));
      return b;
    };
    acties.append(
      maak("Nog een keer", "knop--primair", { opnieuw: true }),
      maak("Mijn voortgang bekijken", "knop--zacht", { terugNaarInstel: true }),
      maak("Terug naar het menu", "knop--zacht", { opnieuw: false }),
    );
    kaart.appendChild(acties);
    container.appendChild(kaart);
    (async () => {
      const rewards = await tracker.voltooi();
      toonRewardResultaat(rewardVlak, rewards);
      await verversCoinCounter();
      await toonBadgeUnlocks(rewards?.badgesEarned || []);
    })();
  }

  toonOpgave();
}

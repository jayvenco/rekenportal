// utils/raketAnimatie.js
// -----------------------------------------------------------------------------
// Motiverende animatie die bij elke oefening te zien is: een raket die bij elk
// goed antwoord een stukje omhoog vliegt naar de maan. De maan (het doel) is
// altijd in beeld. Bij een fout antwoord blijft de raket gewoon staan (nooit
// terugvallen — geen straf). Als de raket de maan bereikt: sterretjes-confetti
// en de tekst "Je bent er!".
//
// Gebruik:
//   const raket = maakRaketAnimatie(container, aantalOpgaven);
//   raket.goedAntwoord();   // beweegt de raket een stapje omhoog
//   raket.foutAntwoord();   // raket blijft staan, geen strafbeweging
//   raket.reset();          // begin opnieuw (bv. bij "nog een keer")
// -----------------------------------------------------------------------------

const AANTAL_STERREN = 18;
const AANTAL_CONFETTI = 24;
const CONFETTI_KLEUREN = ["#4f8fe8", "#f5b942", "#38b26a", "#e8735a", "#a56ee2"];
const AANTAL_EXPLOSIE_STUKJES = 16;
const EXPLOSIE_KLEUREN = ["#f0883e", "#e8735a", "#f5b942", "#c95a41"];

function svgElement(tag, attributen = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [naam, waarde] of Object.entries(attributen)) {
    el.setAttribute(naam, waarde);
  }
  return el;
}

/** Bouwt de raket-vorm als SVG-groep (lichaam, venster, vlammen, vinnen). */
function bouwRaketSvg() {
  const svg = svgElement("svg", { viewBox: "0 0 64 64", width: "64", height: "64" });
  const romp = svgElement("path", {
    d: "M32 2 C42 14 46 30 40 50 L24 50 C18 30 22 14 32 2 Z",
    fill: "#e8735a",
    stroke: "#c95a41",
    "stroke-width": "2",
  });
  const venster = svgElement("circle", {
    cx: "32", cy: "24", r: "7",
    fill: "#eaf2ff", stroke: "#4f8fe8", "stroke-width": "2",
  });
  const vinLinks = svgElement("path", {
    d: "M24 50 L14 60 L24 58 Z",
    fill: "#4f8fe8",
  });
  const vinRechts = svgElement("path", {
    d: "M40 50 L50 60 L40 58 Z",
    fill: "#4f8fe8",
  });
  const vlam = svgElement("path", {
    d: "M27 50 L32 62 L37 50 Z",
    fill: "#f5b942",
  });
  svg.append(vinLinks, vinRechts, romp, venster, vlam);
  return svg;
}

/** Maakt de sterretjes-achtergrond met een klein twinkel-animatietje. */
function bouwSterren(baan) {
  for (let i = 0; i < AANTAL_STERREN; i += 1) {
    const ster = document.createElement("div");
    ster.className = "raket-ster";
    const grootte = 2 + Math.random() * 3;
    ster.style.width = `${grootte}px`;
    ster.style.height = `${grootte}px`;
    ster.style.left = `${Math.random() * 96}%`;
    ster.style.top = `${5 + Math.random() * 55}%`;
    ster.style.background = "#c7d7f0";
    ster.style.borderRadius = "50%";
    ster.style.animationDelay = `${Math.random() * 2.4}s`;
    baan.appendChild(ster);
  }
}

/** Tekent de maan (het doel) rechtsboven in de baan, als SVG. */
function bouwMaan() {
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.top = "6%";
  wrapper.style.right = "8%";
  wrapper.style.width = "64px";
  wrapper.style.height = "64px";
  const svg = svgElement("svg", { viewBox: "0 0 64 64", width: "64", height: "64" });
  const maan = svgElement("circle", { cx: "32", cy: "32", r: "26", fill: "#f5e6b8" });
  const krater1 = svgElement("circle", { cx: "22", cy: "24", r: "5", fill: "#e8d69a" });
  const krater2 = svgElement("circle", { cx: "38", cy: "36", r: "7", fill: "#e8d69a" });
  const krater3 = svgElement("circle", { cx: "28", cy: "42", r: "3.5", fill: "#e8d69a" });
  svg.append(maan, krater1, krater2, krater3);
  wrapper.appendChild(svg);
  return wrapper;
}

/** Genereert wat vonkjes rond de raket bij een goed antwoord. */
function toonVonken(baan, links) {
  for (let i = 0; i < 6; i += 1) {
    const vonk = document.createElement("div");
    vonk.className = "raket-vonk raket-vonk--actief";
    const grootte = 4 + Math.random() * 5;
    vonk.style.width = `${grootte}px`;
    vonk.style.height = `${grootte}px`;
    vonk.style.left = `calc(${links}% + ${(Math.random() - 0.5) * 50}px)`;
    vonk.style.bottom = "10%";
    baan.appendChild(vonk);
    setTimeout(() => vonk.remove(), 1000);
  }
}

/** Toont confetti-regen over de hele baan wanneer het doel bereikt is. */
function toonConfetti(baan) {
  for (let i = 0; i < AANTAL_CONFETTI; i += 1) {
    const stuk = document.createElement("div");
    stuk.className = "confetti-stukje confetti-stukje--actief";
    stuk.style.left = `${Math.random() * 100}%`;
    stuk.style.width = "8px";
    stuk.style.height = "8px";
    stuk.style.background = CONFETTI_KLEUREN[i % CONFETTI_KLEUREN.length];
    stuk.style.borderRadius = i % 2 === 0 ? "50%" : "2px";
    stuk.style.animationDelay = `${Math.random() * 0.6}s`;
    baan.appendChild(stuk);
    setTimeout(() => stuk.remove(), 3200);
  }
}

/** Toont een uitbarsting van deeltjes vanuit het midden, voor het "ruimteschip ontploft"-effect. */
function toonExplosieDeeltjes(baan) {
  for (let i = 0; i < AANTAL_EXPLOSIE_STUKJES; i += 1) {
    const stukje = document.createElement("div");
    stukje.className = "explosie-stukje explosie-stukje--actief";
    const hoek = (360 / AANTAL_EXPLOSIE_STUKJES) * i + (Math.random() * 20 - 10);
    const afstand = 40 + Math.random() * 55;
    const dx = Math.cos((hoek * Math.PI) / 180) * afstand;
    const dy = Math.sin((hoek * Math.PI) / 180) * afstand;
    stukje.style.setProperty("--dx", `${dx}px`);
    stukje.style.setProperty("--dy", `${dy}px`);
    stukje.style.left = "50%";
    stukje.style.top = "44%";
    const grootte = 5 + Math.random() * 6;
    stukje.style.width = `${grootte}px`;
    stukje.style.height = `${grootte}px`;
    stukje.style.background = EXPLOSIE_KLEUREN[i % EXPLOSIE_KLEUREN.length];
    baan.appendChild(stukje);
    setTimeout(() => stukje.remove(), 1200);
  }
}

/** Tekent een kleine vrolijke astronaut: armen omhoog, lachend gezicht. Gebruikt bij een goede eindscore. */
function bouwAstronautVrolijk() {
  const svg = svgElement("svg", { viewBox: "0 0 80 96", width: "84", height: "100" });
  const beenLinks = svgElement("path", { d: "M30 84 L24 94", stroke: "#4f8fe8", "stroke-width": "7", "stroke-linecap": "round", fill: "none" });
  const beenRechts = svgElement("path", { d: "M50 84 L56 94", stroke: "#4f8fe8", "stroke-width": "7", "stroke-linecap": "round", fill: "none" });
  const armLinks = svgElement("path", { d: "M20 50 L6 28", stroke: "#4f8fe8", "stroke-width": "7", "stroke-linecap": "round", fill: "none" });
  const armRechts = svgElement("path", { d: "M60 50 L74 28", stroke: "#4f8fe8", "stroke-width": "7", "stroke-linecap": "round", fill: "none" });
  const lichaam = svgElement("ellipse", { cx: "40", cy: "58", rx: "22", ry: "28", fill: "#f6f8fc", stroke: "#4f8fe8", "stroke-width": "3" });
  const handLinks = svgElement("circle", { cx: "6", cy: "26", r: "6", fill: "#f6f8fc", stroke: "#4f8fe8", "stroke-width": "2" });
  const handRechts = svgElement("circle", { cx: "74", cy: "26", r: "6", fill: "#f6f8fc", stroke: "#4f8fe8", "stroke-width": "2" });
  const helm = svgElement("circle", { cx: "40", cy: "30", r: "22", fill: "#eaf2ff", stroke: "#4f8fe8", "stroke-width": "3" });
  const visor = svgElement("ellipse", { cx: "40", cy: "31", rx: "14", ry: "12", fill: "#4f8fe8" });
  const oogLinks = svgElement("circle", { cx: "35", cy: "29", r: "2.4", fill: "#ffffff" });
  const oogRechts = svgElement("circle", { cx: "45", cy: "29", r: "2.4", fill: "#ffffff" });
  const mond = svgElement("path", { d: "M33 35 Q40 41 47 35", stroke: "#ffffff", "stroke-width": "2.4", fill: "none", "stroke-linecap": "round" });
  svg.append(beenLinks, beenRechts, armLinks, armRechts, lichaam, handLinks, handRechts, helm, visor, oogLinks, oogRechts, mond);
  return svg;
}

/** Tekent een kleine verdrietige astronaut: armen omlaag, verdrietig gezicht met traan. Gebruikt bij een zwakke eindscore. */
function bouwAstronautVerdrietig() {
  const svg = svgElement("svg", { viewBox: "0 0 80 96", width: "84", height: "100" });
  const beenLinks = svgElement("path", { d: "M30 84 L26 94", stroke: "#8a94a6", "stroke-width": "7", "stroke-linecap": "round", fill: "none" });
  const beenRechts = svgElement("path", { d: "M50 84 L54 94", stroke: "#8a94a6", "stroke-width": "7", "stroke-linecap": "round", fill: "none" });
  const armLinks = svgElement("path", { d: "M20 50 L14 72", stroke: "#8a94a6", "stroke-width": "7", "stroke-linecap": "round", fill: "none" });
  const armRechts = svgElement("path", { d: "M60 50 L66 72", stroke: "#8a94a6", "stroke-width": "7", "stroke-linecap": "round", fill: "none" });
  const lichaam = svgElement("ellipse", { cx: "40", cy: "58", rx: "22", ry: "28", fill: "#f6f8fc", stroke: "#8a94a6", "stroke-width": "3" });
  const helm = svgElement("circle", { cx: "40", cy: "30", r: "22", fill: "#eaf2ff", stroke: "#8a94a6", "stroke-width": "3" });
  const visor = svgElement("ellipse", { cx: "40", cy: "31", rx: "14", ry: "12", fill: "#8a94a6" });
  const oogLinks = svgElement("circle", { cx: "35", cy: "30", r: "2.4", fill: "#ffffff" });
  const oogRechts = svgElement("circle", { cx: "45", cy: "30", r: "2.4", fill: "#ffffff" });
  const mond = svgElement("path", { d: "M33 38 Q40 32 47 38", stroke: "#ffffff", "stroke-width": "2.4", fill: "none", "stroke-linecap": "round" });
  const traan = svgElement("path", { d: "M47 33 Q49.5 38 47 41 Q44.5 38 47 33 Z", fill: "#8fd0f5" });
  svg.append(beenLinks, beenRechts, armLinks, armRechts, lichaam, helm, visor, oogLinks, oogRechts, mond, traan);
  return svg;
}

/** Bouwt de wrapper-elementen voor de eind-astronaut (intro-animatie + infinite zweven, los van elkaar). */
function bouwEindAstronaut(soort) {
  const wrapper = document.createElement("div");
  wrapper.className = "eind-astronaut eind-astronaut--intro";
  const binnen = document.createElement("div");
  binnen.className = `eind-astronaut-binnen eind-astronaut-binnen--${soort}`;
  binnen.appendChild(soort === "vrolijk" ? bouwAstronautVrolijk() : bouwAstronautVerdrietig());
  wrapper.appendChild(binnen);
  return wrapper;
}

/**
 * Toont de eind-animatie op het afsluitscherm van een oefensessie: bij een goede score
 * (minder dan of gelijk aan 30% fout) een juichende astronaut met confetti, bij een
 * zwakke score (meer dan 30% fout) een "ruimteschip ontploft"-effect met een kleine
 * verdrietige astronaut die er rustig doorheen zweeft (geen enge/harde animatie).
 * @param {HTMLElement} container - element waar de animatie in komt (bv. de eindscherm-kaart).
 * @param {number} percentageGoed - percentage goed beantwoorde opgaven (0-100).
 */
export function toonEindAnimatie(container, percentageGoed) {
  const vlak = document.createElement("div");
  vlak.className = "eind-animatie-vlak";
  vlak.setAttribute("role", "img");
  bouwSterren(vlak);

  const raketWrapper = document.createElement("div");
  raketWrapper.className = "eind-raket";
  raketWrapper.appendChild(bouwRaketSvg());
  vlak.appendChild(raketWrapper);

  if (percentageGoed >= 70) {
    vlak.classList.add("eind-animatie-vlak--goed");
    vlak.setAttribute("aria-label", "Het ruimteschip is veilig geland. Een juichende astronaut steekt zijn armen omhoog, want het ging heel goed!");
    const astronautWrapper = bouwEindAstronaut("vrolijk");
    astronautWrapper.classList.add("eind-astronaut--naast-raket");
    vlak.appendChild(astronautWrapper);
    toonConfetti(vlak);
  } else {
    vlak.classList.add("eind-animatie-vlak--fout");
    vlak.setAttribute(
      "aria-label",
      "Het ruimteschip valt uit elkaar. Een klein verdrietig astronautje zweeft rustig door de ruimte."
    );
    const astronautWrapper = bouwEindAstronaut("verdrietig");
    astronautWrapper.classList.add("eind-astronaut--naast-raket");
    vlak.appendChild(astronautWrapper);
    // Na een klein moment (zodat het schip eerst nog even in beeld staat) ontploft het.
    setTimeout(() => {
      raketWrapper.classList.add("eind-raket--explodeer");
      toonExplosieDeeltjes(vlak);
    }, 500);
  }

  container.appendChild(vlak);
  return vlak;
}

/**
 * Maakt de raket-animatie aan in de gegeven container.
 * @param {HTMLElement} container - element waar de animatie in komt.
 * @param {number} doelAantal - hoeveel goede antwoorden nodig zijn om de maan te bereiken.
 */
export function maakRaketAnimatie(container, doelAantal) {
  const totaal = Math.max(1, doelAantal);
  let aantalGoed = 0;

  const baan = document.createElement("div");
  baan.className = "raket-baan";
  baan.setAttribute("role", "img");
  baan.setAttribute("aria-label", "Een raket die richting de maan vliegt bij elk goed antwoord.");

  bouwSterren(baan);
  baan.appendChild(bouwMaan());

  const raketWrapper = document.createElement("div");
  raketWrapper.className = "raket-figuur";
  raketWrapper.appendChild(bouwRaketSvg());
  baan.appendChild(raketWrapper);

  const doelTekst = document.createElement("div");
  doelTekst.style.position = "absolute";
  doelTekst.style.top = "50%";
  doelTekst.style.left = "50%";
  doelTekst.style.transform = "translate(-50%, -50%)";
  doelTekst.style.fontSize = "28px";
  doelTekst.style.fontWeight = "800";
  doelTekst.style.color = "#3a72c4";
  doelTekst.style.opacity = "0";
  doelTekst.style.transition = "opacity 0.5s ease";
  doelTekst.textContent = "Je bent er!";
  baan.appendChild(doelTekst);

  container.appendChild(baan);

  /** Berekent de bottom-positie (%) van de raket op basis van aantal goed. */
  function berekenPositie() {
    const verhouding = Math.min(1, aantalGoed / totaal);
    // 8% is de startpositie, 78% is net onder de maan.
    return 8 + verhouding * 70;
  }

  function bijwerken() {
    raketWrapper.style.bottom = `${berekenPositie()}%`;
    if (aantalGoed >= totaal) {
      doelTekst.style.opacity = "1";
      toonConfetti(baan);
    }
  }

  return {
    /** De raket vliegt een stapje omhoog. */
    goedAntwoord() {
      aantalGoed += 1;
      toonVonken(baan, 50);
      bijwerken();
    },
    /** De raket blijft precies staan waar hij was. */
    foutAntwoord() {
      // Bewust geen enkele wijziging: geen straf bij een fout antwoord.
    },
    /** Zet de animatie terug naar het begin. */
    reset() {
      aantalGoed = 0;
      doelTekst.style.opacity = "0";
      bijwerken();
    },
    /** Geeft het DOM-element van de baan terug. */
    element: baan,
  };
}

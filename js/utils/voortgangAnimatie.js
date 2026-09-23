// utils/voortgangAnimatie.js
// -----------------------------------------------------------------------------
// Pixel-art mijntunnel-voortgangsanimatie ("math tunnel", zie css/math-tunnel.css).
// Een mijnwerker graaft een horizontale tunnel naar rechts; hoe meer opgaven
// goed beantwoord, hoe verder hij komt. Onderweg passeert hij vier mijlpalen
// (edelsteen, goud, zeldzaam mineraal, schatkist) die oplichten zodra ze
// bereikt zijn.
//
// Puur HTML/CSS/vanilla JS, geen externe libraries. De publieke API
// (maakRaketAnimatie / toonEindAnimatie) is bewust ongewijzigd gebleven zodat
// alle oefenschermen die deze module gebruiken niet aangepast hoeven worden.
// -----------------------------------------------------------------------------

const MIJLPALEN = [25, 50, 75, 100];
const MIJLPAAL_ICONEN = ["💎", "🪙", "💠", "🎁"];
const STOF_KLEUREN = ["#b98a5a", "#9aa3ad", "#5b6672"];

// Vaste, decoratieve ertsjes in de steenlaag (puur textuur, geen betekenis).
const ERTS_POSITIES = [
  [8, "kool"], [18, "ijzer"], [37, "kool"], [45, "ijzer"],
  [63, "kool"], [70, "ijzer"], [88, "kool"], [93, "ijzer"],
];

function el(tag, className, tekst) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

/**
 * Eigen, blokkig mijnwerker-personage opgebouwd uit losse lichaamsdelen
 * (div's per hoofd/romp/arm/been), zodat CSS-keyframes een echte loop- en
 * graafcyclus kunnen animeren in plaats van één statisch plaatje.
 */
function bouwPoppetjeLichaam() {
  return `
    <div class="math-tunnel-lichaam">
      <div class="math-tunnel-helm"></div>
      <div class="math-tunnel-hoofd"></div>
      <div class="math-tunnel-romp"></div>
      <div class="math-tunnel-arm math-tunnel-arm--links"></div>
      <div class="math-tunnel-arm math-tunnel-arm--rechts">
        <div class="math-tunnel-pikhouweel">
          <div class="math-tunnel-pikhouweel__steel"></div>
          <div class="math-tunnel-pikhouweel__kop"></div>
        </div>
      </div>
      <div class="math-tunnel-been math-tunnel-been--links"></div>
      <div class="math-tunnel-been math-tunnel-been--rechts"></div>
    </div>
  `;
}

/** Bouwt de volledige tunnelwereld (grond, mijlpalen, poppetje, voortgangspaneel). */
function bouwWereld(doelAantal) {
  const container = el("div", "math-tunnel-container");
  container.setAttribute("role", "img");
  container.setAttribute(
    "aria-label",
    "Een mijnwerker graaft een tunnel; hoe verder hij komt, hoe meer opgaven goed zijn beantwoord."
  );

  const wereld = el("div", "math-tunnel-world");

  const grond = el("div", "math-tunnel-ground");
  const grasLaag = el("div", "math-tunnel-layer math-tunnel-layer--gras");
  const aardeLaag = el("div", "math-tunnel-layer math-tunnel-layer--aarde");
  const steenLaag = el("div", "math-tunnel-layer math-tunnel-layer--steen");
  const donkerLaag = el("div", "math-tunnel-layer math-tunnel-layer--donker");
  grond.append(grasLaag, aardeLaag, steenLaag, donkerLaag);

  for (const [links, type] of ERTS_POSITIES) {
    const erts = el("div", `math-tunnel-erts math-tunnel-erts--${type}`);
    erts.style.left = `${links}%`;
    steenLaag.appendChild(erts);
  }

  const mijlpaalElementen = MIJLPALEN.map((grens, i) => {
    const mijlpaal = el("div", "math-tunnel-milestone", MIJLPAAL_ICONEN[i]);
    mijlpaal.style.left = `${grens}%`;
    mijlpaal.dataset.grens = String(grens);
    steenLaag.appendChild(mijlpaal);
    return mijlpaal;
  });

  const gegraven = el("div", "math-tunnel-gegraven");

  const poppetje = el("div", "math-tunnel-character");
  const sprite = el("div", "math-tunnel-character__sprite");
  sprite.innerHTML = bouwPoppetjeLichaam();
  const dust = el("div", "math-tunnel-dust");
  poppetje.append(sprite, dust);

  const finishBanner = el("div", "math-tunnel-finish", "⛏️ REKENMISSIE VOLTOOID!");

  wereld.append(grond, gegraven, poppetje, finishBanner);

  const progress = el("div", "math-tunnel-progress");
  const labelRij = el("div", "math-tunnel-progress__label");
  labelRij.append(el("span", null, "REKENMISSIE"), el("span", "math-tunnel-progress__pct", "0%"));
  const bar = el("div", "math-tunnel-progress__bar");
  const fill = el("div", "math-tunnel-progress__fill");
  bar.appendChild(fill);
  const count = el("div", "math-tunnel-progress__count", `0 / ${doelAantal}`);
  progress.append(labelRij, bar, count);

  container.append(wereld, progress);

  return {
    container, wereld, poppetje, dust, gegraven, fill,
    labelPct: labelRij.querySelector(".math-tunnel-progress__pct"),
    count, mijlpaalElementen, finishBanner,
  };
}

/** Korte stofdeeltjes-uitbarsting bij de pikhouweel (verwijdert zichzelf, geen opgehoopte DOM). */
function toonStof(dustHost) {
  for (let i = 0; i < 6; i += 1) {
    const deeltje = document.createElement("span");
    deeltje.className = "math-tunnel-dust__deeltje";
    const hoek = (Math.random() - 0.5) * Math.PI;
    const afstand = 10 + Math.random() * 14;
    deeltje.style.setProperty("--tx", `${(Math.cos(hoek) * afstand).toFixed(1)}px`);
    deeltje.style.setProperty("--ty", `${(-Math.abs(Math.sin(hoek) * afstand) - 4).toFixed(1)}px`);
    deeltje.style.setProperty("--kleur", STOF_KLEUREN[i % STOF_KLEUREN.length]);
    dustHost.appendChild(deeltje);
    setTimeout(() => deeltje.remove(), 600);
  }
}

/** Korte sparkle-flonkering op een vaste positie (mijlpaal bereikt / finish). */
function toonSparkle(wereldEl, xPct, aantal = 8) {
  for (let i = 0; i < aantal; i += 1) {
    const s = document.createElement("span");
    s.className = "math-tunnel-sparkle";
    s.style.left = `${xPct}%`;
    s.style.top = "55%";
    s.style.animationDelay = `${(Math.random() * 0.15).toFixed(2)}s`;
    wereldEl.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

function animHerstart(element, klasse, duurMs) {
  element.classList.remove(klasse);
  void element.offsetWidth; // forceer reflow zodat de animatie opnieuw start
  element.classList.add(klasse);
  setTimeout(() => element.classList.remove(klasse), duurMs);
}

/** Animatieduur op basis van de afgelegde afstand: kleine stap = kort, grote stap = langer. */
function bepaalDuur(vanPct, naarPct) {
  const afstand = Math.abs(naarPct - vanPct);
  return Math.max(280, Math.min(900, afstand * 9));
}

// -----------------------------------------------------------------------
// Publieke API (namen bewust ongewijzigd t.o.v. de vorige Nyan Cat-versie).
// -----------------------------------------------------------------------

/** Bouwt de tunnelanimatie en geeft besturingsfuncties terug. */
export function maakRaketAnimatie(container, doelAantal) {
  const totaal = Math.max(1, doelAantal);
  let aantalGoed = 0;
  let huidigPct = 0;
  let bereikteMijlpalen = new Set();

  const wereld = bouwWereld(totaal);
  container.appendChild(wereld.container);

  function bijwerkenTeller() {
    wereld.count.textContent = `${aantalGoed} / ${totaal}`;
  }

  function setProgress(pct) {
    const nieuw = Math.max(0, Math.min(100, pct));
    const duur = bepaalDuur(huidigPct, nieuw);
    // Karakter en tunnel blijven binnen 4%-94% zodat het poppetje nooit
    // half buiten beeld valt; de voortgangsbalk toont wel het echte percentage.
    const naarLeft = 4 + (nieuw / 100) * 92;

    wereld.poppetje.style.transitionDuration = `${duur}ms`;
    wereld.gegraven.style.transitionDuration = `${duur}ms`;
    wereld.fill.style.transitionDuration = `${duur}ms`;

    wereld.poppetje.style.left = `${naarLeft}%`;
    wereld.gegraven.style.width = `${naarLeft}%`;
    wereld.fill.style.width = `${nieuw}%`;
    wereld.labelPct.textContent = `${Math.round(nieuw)}%`;

    for (const mijlpaalEl of wereld.mijlpaalElementen) {
      const grens = Number(mijlpaalEl.dataset.grens);
      if (nieuw >= grens && !bereikteMijlpalen.has(grens)) {
        bereikteMijlpalen.add(grens);
        mijlpaalEl.classList.add("math-tunnel-milestone--bereikt");
        animHerstart(mijlpaalEl, "math-tunnel-milestone--pulse", 750);
        toonSparkle(wereld.wereld, grens);
      }
    }

    huidigPct = nieuw;
    return duur;
  }

  bijwerkenTeller();

  return {
    goedAntwoord() {
      aantalGoed = Math.min(totaal, aantalGoed + 1);
      bijwerkenTeller();

      animHerstart(wereld.poppetje, "math-tunnel-character--graaft", 550);
      toonStof(wereld.dust);

      const duur = setProgress((aantalGoed / totaal) * 100);
      animHerstart(wereld.poppetje, "math-tunnel-character--loopt", duur);

      if (aantalGoed >= totaal) {
        wereld.poppetje.classList.add("math-tunnel-character--klaar");
        setTimeout(() => {
          animHerstart(wereld.finishBanner, "math-tunnel-finish--toon", 2600);
          toonSparkle(wereld.wereld, 96, 12);
        }, 350);
      }
    },
    foutAntwoord() {
      animHerstart(wereld.poppetje, "math-tunnel-character--geraakt", 420);
    },
    reset() {
      aantalGoed = 0;
      huidigPct = 0;
      bereikteMijlpalen = new Set();
      bijwerkenTeller();

      wereld.poppetje.classList.remove("math-tunnel-character--klaar", "math-tunnel-character--loopt", "math-tunnel-character--graaft");
      for (const m of wereld.mijlpaalElementen) {
        m.classList.remove("math-tunnel-milestone--bereikt", "math-tunnel-milestone--pulse");
      }
      wereld.poppetje.style.transitionDuration = "0ms";
      wereld.gegraven.style.transitionDuration = "0ms";
      wereld.fill.style.transitionDuration = "0ms";
      wereld.poppetje.style.left = "4%";
      wereld.gegraven.style.width = "4%";
      wereld.fill.style.width = "0%";
      wereld.labelPct.textContent = "0%";
    },
    element: wereld.container,
  };
}

/** Toont een compact eindscherm met dezelfde mijnwerker en het behaalde percentage. */
export function toonEindAnimatie(container, pct) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const geslaagd = p >= 70;

  const kaart = el("div", "math-tunnel-eind");

  const sprite = el("div", "math-tunnel-eind__sprite");
  sprite.innerHTML = bouwPoppetjeLichaam();
  kaart.appendChild(sprite);

  const titel = el("h3", "math-tunnel-eind__titel", p >= 100 ? "MIJNMEESTER!" : geslaagd ? "TOPPER!" : "OP WEG!");
  kaart.appendChild(titel);

  kaart.appendChild(el("p", "math-tunnel-eind__tekst", "Goed gedaan!"));

  const balk = el("div", "math-tunnel-eind__balk");
  const vulling = el("div", "math-tunnel-eind__balk-vulling");
  vulling.style.width = `${p}%`;
  balk.appendChild(vulling);
  kaart.appendChild(balk);

  kaart.appendChild(el("strong", "math-tunnel-eind__pct", `${p}% goed`));

  container.appendChild(kaart);
  return kaart;
}

// utils/ruimteMissieAnimatie.js
// -----------------------------------------------------------------------------
// "Space Math Mission" — tweede voortgangsanimatie (zie css/space-missie.css).
// Een eigen 2D-raket vliegt van links naar rechts door de ruimte; de positie
// volgt de voortgang van de oefensessie. Onderweg passeert de raket vier
// mijlpalen (ster, maan, raket, trofee). Bij een fout antwoord verschijnt een
// kleine, speelse asteroïde-botsing — zonder voortgangsverlies.
//
// Puur HTML/CSS/vanilla JS, geen externe libraries. Wordt aangeroepen vanuit
// de dispatcher in voortgangAnimatie.js, die om en om deze animatie of de
// mijntunnel-animatie kiest.
// -----------------------------------------------------------------------------

const MIJLPALEN = [25, 50, 75, 100];
const MIJLPAAL_ICONEN = ["⭐", "🌙", "🚀", "🏆"];

function el(tag, className, tekst) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (tekst !== undefined) e.textContent = tekst;
  return e;
}

/** Inline SVG van een eigen, eenvoudige 2D-raket (romp, cockpitraam, vinnen). */
function bouwRocketSvg() {
  return `
    <svg viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M25 2 C34 10 36 24 36 34 L14 34 C14 24 16 10 25 2 Z" fill="#e7ecf5" stroke="#a9b6e0" stroke-width="1.5" />
      <rect x="14" y="32" width="22" height="6" rx="2" fill="#c7cee0" />
      <circle cx="25" cy="19" r="6" fill="#7ad0ff" stroke="#2a4fc9" stroke-width="2" />
      <path d="M14 34 L4 46 L14 40 Z" fill="#ff6b5a" />
      <path d="M36 34 L46 46 L36 40 Z" fill="#ff6b5a" />
    </svg>
  `;
}

/** Bouwt de volledige ruimtewereld (sterren, mijlpalen, raket, voortgangspaneel). */
function bouwWereld(doelAantal) {
  const container = el("div", "space-missie-container");
  container.setAttribute("role", "img");
  container.setAttribute(
    "aria-label",
    "Een raket vliegt door de ruimte; hoe verder ze komt, hoe meer opgaven goed zijn beantwoord."
  );

  const wereld = el("div", "space-missie-world");
  wereld.appendChild(el("div", "space-missie-sterren space-missie-sterren--ver"));
  wereld.appendChild(el("div", "space-missie-sterren space-missie-sterren--groot"));
  wereld.appendChild(el("div", "space-missie-nevel"));
  wereld.appendChild(el("div", "space-missie-planeet"));

  const mijlpaalElementen = MIJLPALEN.map((grens, i) => {
    const mijlpaal = el("div", "space-missie-milestone", MIJLPAAL_ICONEN[i]);
    mijlpaal.style.left = `${grens}%`;
    mijlpaal.dataset.grens = String(grens);
    wereld.appendChild(mijlpaal);
    return mijlpaal;
  });

  const rocket = el("div", "space-missie-rocket");
  const sprite = el("div", "space-missie-rocket__sprite");
  sprite.innerHTML = bouwRocketSvg();
  const vlam = el("div", "space-missie-vlam");
  rocket.append(sprite, vlam);

  const finishBanner = el("div", "space-missie-finish", "🚀 MISSIE VOLTOOID!");

  wereld.append(rocket, finishBanner);

  const progress = el("div", "space-missie-progress");
  const labelRij = el("div", "space-missie-progress__label");
  labelRij.append(el("span", null, "SPACE MISSIE"), el("span", "space-missie-progress__pct", "0%"));
  const bar = el("div", "space-missie-progress__bar");
  const fill = el("div", "space-missie-progress__fill");
  bar.appendChild(fill);
  const count = el("div", "space-missie-progress__count", `0 / ${doelAantal}`);
  progress.append(labelRij, bar, count);

  container.append(wereld, progress);

  return {
    container, wereld, rocket, vlam, fill,
    labelPct: labelRij.querySelector(".space-missie-progress__pct"),
    count, mijlpaalElementen, finishBanner,
  };
}

/** Korte sparkle-flonkering op een vaste positie (mijlpaal bereikt / finish / boost). */
function toonSparkle(wereldEl, xPct, yPct = 40, aantal = 8) {
  for (let i = 0; i < aantal; i += 1) {
    const s = document.createElement("span");
    s.className = "space-missie-sparkle";
    s.style.left = `${xPct}%`;
    s.style.top = `${yPct}%`;
    s.style.animationDelay = `${(Math.random() * 0.15).toFixed(2)}s`;
    wereldEl.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

/** Kleine asteroïde die richting de raket vliegt, botst en in een korte flits verdwijnt. */
function toonBotsing(wereldEl, rocketEl, xPct) {
  const asteroide = document.createElement("div");
  asteroide.className = "space-missie-asteroide space-missie-asteroide--vliegt";
  asteroide.style.left = `${xPct}%`;
  wereldEl.appendChild(asteroide);

  setTimeout(() => {
    asteroide.remove();
    const explosie = document.createElement("div");
    explosie.className = "space-missie-explosie";
    explosie.style.left = `${xPct}%`;
    explosie.style.top = "42%";
    wereldEl.appendChild(explosie);
    setTimeout(() => explosie.remove(), 500);
    animHerstart(rocketEl, "space-missie-rocket--geraakt", 500);
  }, 480);
}

/** Kleine "+10 XP"-indicator die kort omhoog beweegt bij de raket. */
function toonXp(wereldEl, xPct) {
  const xp = el("div", "space-missie-xp", "+10 XP");
  xp.style.left = `${xPct}%`;
  wereldEl.appendChild(xp);
  requestAnimationFrame(() => xp.classList.add("space-missie-xp--toon"));
  setTimeout(() => xp.remove(), 900);
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
  return Math.max(320, Math.min(1000, afstand * 10));
}

/** Bouwt de ruimte-missie-animatie en geeft besturingsfuncties terug. */
export function maakRuimteMissieAnimatie(container, doelAantal) {
  const totaal = Math.max(1, doelAantal);
  let aantalGoed = 0;
  let huidigPct = 0;
  let huidigLeft = 4;
  let bereikteMijlpalen = new Set();

  const wereld = bouwWereld(totaal);
  container.appendChild(wereld.container);

  function bijwerkenTeller() {
    wereld.count.textContent = `${aantalGoed} / ${totaal}`;
  }

  function setProgress(pct) {
    const nieuw = Math.max(0, Math.min(100, pct));
    const duur = bepaalDuur(huidigPct, nieuw);
    // De raket blijft binnen 4%-94% zodat ze nooit half buiten beeld valt;
    // de voortgangsbalk toont wel het echte percentage.
    const naarLeft = 4 + (nieuw / 100) * 92;

    wereld.rocket.style.transitionDuration = `${duur}ms`;
    wereld.fill.style.transitionDuration = `${duur}ms`;

    wereld.rocket.style.left = `${naarLeft}%`;
    wereld.fill.style.width = `${nieuw}%`;
    wereld.labelPct.textContent = `${Math.round(nieuw)}%`;

    for (const mijlpaalEl of wereld.mijlpaalElementen) {
      const grens = Number(mijlpaalEl.dataset.grens);
      if (nieuw >= grens && !bereikteMijlpalen.has(grens)) {
        bereikteMijlpalen.add(grens);
        mijlpaalEl.classList.add("space-missie-milestone--bereikt");
        animHerstart(mijlpaalEl, "space-missie-milestone--pulse", 750);
        toonSparkle(wereld.wereld, grens);
      }
    }

    huidigPct = nieuw;
    huidigLeft = naarLeft;
    return duur;
  }

  bijwerkenTeller();

  return {
    goedAntwoord() {
      aantalGoed = Math.min(totaal, aantalGoed + 1);
      bijwerkenTeller();

      animHerstart(wereld.rocket, "space-missie-rocket--boost", 550);
      toonSparkle(wereld.wereld, huidigLeft, 35, 6);
      toonXp(wereld.wereld, huidigLeft);

      setProgress((aantalGoed / totaal) * 100);

      if (aantalGoed >= totaal) {
        wereld.rocket.classList.add("space-missie-rocket--klaar");
        setTimeout(() => {
          animHerstart(wereld.finishBanner, "space-missie-finish--toon", 2600);
          toonSparkle(wereld.wereld, 96, 40, 12);
        }, 400);
      }
    },
    foutAntwoord() {
      toonBotsing(wereld.wereld, wereld.rocket, huidigLeft);
    },
    reset() {
      aantalGoed = 0;
      huidigPct = 0;
      huidigLeft = 4;
      bereikteMijlpalen = new Set();
      bijwerkenTeller();

      wereld.rocket.classList.remove("space-missie-rocket--klaar", "space-missie-rocket--boost", "space-missie-rocket--geraakt");
      for (const m of wereld.mijlpaalElementen) {
        m.classList.remove("space-missie-milestone--bereikt", "space-missie-milestone--pulse");
      }
      wereld.rocket.style.transitionDuration = "0ms";
      wereld.fill.style.transitionDuration = "0ms";
      wereld.rocket.style.left = "4%";
      wereld.fill.style.width = "0%";
      wereld.labelPct.textContent = "0%";
    },
    element: wereld.container,
  };
}

/** Toont een compact eindscherm met dezelfde raket en het behaalde percentage. */
export function toonRuimteMissieEindAnimatie(container, pct) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const geslaagd = p >= 70;

  const kaart = el("div", "space-missie-eind");

  const sprite = el("div", "space-missie-eind__sprite");
  sprite.innerHTML = bouwRocketSvg();
  kaart.appendChild(sprite);

  const titel = el("h3", "space-missie-eind__titel", p >= 100 ? "MISSIE VOLTOOID!" : geslaagd ? "TOPPER!" : "OP WEG!");
  kaart.appendChild(titel);

  kaart.appendChild(el("p", "space-missie-eind__tekst", "Goed gedaan!"));

  const balk = el("div", "space-missie-eind__balk");
  const vulling = el("div", "space-missie-eind__balk-vulling");
  vulling.style.width = `${p}%`;
  balk.appendChild(vulling);
  kaart.appendChild(balk);

  kaart.appendChild(el("strong", "space-missie-eind__pct", `${p}% goed`));

  container.appendChild(kaart);
  return kaart;
}

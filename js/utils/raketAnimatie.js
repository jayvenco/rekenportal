// utils/raketAnimatie.js
// -----------------------------------------------------------------------------
// Superhero Math Power: gedeelde voortgangsanimatie voor alle oefeningen.
// De publieke API blijft bewust gelijk aan de oude raket-animatie, zodat de
// oefenschermen alleen goedAntwoord(), foutAntwoord() en reset() hoeven te kennen.
// -----------------------------------------------------------------------------

const CHECKPOINTS = [
  { grens: 25, tekst: "HERO IN TRAINING" },
  { grens: 50, tekst: "POWER HERO" },
  { grens: 75, tekst: "SUPER HERO" },
  { grens: 100, tekst: "MATH MASTER" },
];

const PARTIKELS = ["+", "-", "x", "÷", "Σ", "★"];
const PARTIKEL_KLEUREN = ["#2f6ed4", "#38b26a", "#f5b942", "#f07a3d", "#9b5de5"];

function begrens(getal, min, max) {
  return Math.max(min, Math.min(max, getal));
}

function maakElement(tag, className, tekst = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (tekst) element.textContent = tekst;
  return element;
}

function svgSuperheld() {
  const wrapper = maakElement("div", "math-hero__character");
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.innerHTML = `
    <svg class="math-hero__svg" viewBox="0 0 180 180" role="img">
      <defs>
        <linearGradient id="heroCape" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#ff785a" />
          <stop offset="100%" stop-color="#d42d52" />
        </linearGradient>
        <linearGradient id="heroSuit" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#4f8fe8" />
          <stop offset="100%" stop-color="#2652b8" />
        </linearGradient>
        <filter id="heroGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g class="math-hero__aura">
        <circle cx="90" cy="92" r="62" fill="#f8d84c" opacity="0.16" />
        <path d="M90 16 L100 54 L136 35 L119 72 L160 78 L122 96 L151 126 L111 118 L116 160 L90 126 L64 160 L69 118 L29 126 L58 96 L20 78 L61 72 L44 35 L80 54 Z" fill="#ffd83d" opacity="0.18" />
      </g>
      <path class="math-hero__cape" d="M55 72 C28 90 21 128 39 161 C58 145 75 135 93 132 C111 136 128 146 146 161 C163 128 154 89 125 72 C112 88 70 88 55 72 Z" fill="url(#heroCape)" />
      <path d="M46 111 C26 123 24 146 35 151 C42 135 53 125 68 119 Z" fill="#f7c7a1" />
      <path d="M134 111 C154 123 156 146 145 151 C138 135 127 125 112 119 Z" fill="#f7c7a1" />
      <path class="math-hero__body" d="M62 82 C63 65 76 54 90 54 C104 54 117 65 118 82 L125 129 C105 142 75 142 55 129 Z" fill="url(#heroSuit)" />
      <path d="M71 89 L90 123 L109 89 Z" fill="#ffffff" opacity="0.92" />
      <circle cx="90" cy="101" r="18" fill="#ffd83d" stroke="#ffffff" stroke-width="4" />
      <text x="90" y="109" text-anchor="middle" font-size="23" font-family="Arial, sans-serif" font-weight="900" fill="#2652b8">Σ</text>
      <circle cx="90" cy="44" r="30" fill="#f7c7a1" />
      <path d="M59 39 C67 13 110 6 123 37 C110 27 81 27 59 39 Z" fill="#4b2d73" />
      <path d="M61 45 C76 35 103 35 119 45 L113 58 C101 51 79 51 67 58 Z" fill="#263b83" />
      <circle cx="79" cy="49" r="4" fill="#1c2740" />
      <circle cx="101" cy="49" r="4" fill="#1c2740" />
      <path d="M80 64 Q90 72 101 64" fill="none" stroke="#7a3d2a" stroke-width="4" stroke-linecap="round" />
      <path d="M67 132 L58 164" stroke="#263b83" stroke-width="14" stroke-linecap="round" />
      <path d="M113 132 L122 164" stroke="#263b83" stroke-width="14" stroke-linecap="round" />
      <path class="math-hero__bolt-left" d="M35 34 L22 62 L39 58 L31 86 L58 45 L42 49 Z" fill="#ffd83d" />
      <path class="math-hero__bolt-right" d="M145 34 L158 62 L141 58 L149 86 L122 45 L138 49 Z" fill="#ffd83d" />
    </svg>
  `;
  return wrapper;
}

function checkpointVoorPercentage(percentage) {
  return CHECKPOINTS.reduce((gevonden, checkpoint) => (
    percentage >= checkpoint.grens ? checkpoint : gevonden
  ), CHECKPOINTS[0]);
}

function tierVoorPercentage(percentage) {
  if (percentage >= 100) return 5;
  if (percentage >= 80) return 4;
  if (percentage >= 60) return 3;
  if (percentage >= 40) return 2;
  if (percentage >= 20) return 1;
  return 0;
}

function animatieHerstart(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function toonPartikels(laag, opties = {}) {
  const aantal = opties.aantal ?? 12;
  const symbols = opties.symbols ?? PARTIKELS;
  for (let i = 0; i < aantal; i += 1) {
    const partikel = maakElement("span", "math-hero__particle");
    partikel.textContent = symbols[i % symbols.length];
    partikel.style.left = `${18 + Math.random() * 64}%`;
    partikel.style.top = `${34 + Math.random() * 34}%`;
    partikel.style.color = PARTIKEL_KLEUREN[i % PARTIKEL_KLEUREN.length];
    partikel.style.setProperty("--dx", `${(Math.random() - 0.5) * 130}px`);
    partikel.style.setProperty("--dy", `${-45 - Math.random() * 70}px`);
    partikel.style.animationDelay = `${Math.random() * 0.12}s`;
    laag.appendChild(partikel);
    setTimeout(() => partikel.remove(), 1100);
  }
}

function toonBadge(badge, tekst) {
  badge.textContent = tekst;
  animatieHerstart(badge, "math-hero__badge--show");
  setTimeout(() => badge.classList.remove("math-hero__badge--show"), 1400);
}

function bouwSuperheroBlok() {
  const blok = maakElement("div", "math-hero");
  blok.style.setProperty("--power-progress", "0%");
  blok.setAttribute("role", "img");
  blok.setAttribute("aria-label", "Superheld die sterker wordt bij elk goed rekenantwoord.");

  const achtergrond = maakElement("div", "math-hero__scene");
  const speedlines = maakElement("div", "math-hero__speedlines");
  const particles = maakElement("div", "math-hero__particles");
  const hero = svgSuperheld();
  const badge = maakElement("div", "math-hero__badge");
  const bubble = maakElement("div", "math-hero__bubble", "Klaar voor math power!");

  const meter = maakElement("div", "math-hero__meter");
  meter.innerHTML = `
    <div class="math-hero__meter-top">
      <span class="math-hero__label">MATH POWER</span>
      <span class="math-hero__percent">0%</span>
    </div>
    <div class="math-hero__bar" aria-hidden="true">
      <div class="math-hero__bar-fill"></div>
      <div class="math-hero__checkpoint math-hero__checkpoint--25"></div>
      <div class="math-hero__checkpoint math-hero__checkpoint--50"></div>
      <div class="math-hero__checkpoint math-hero__checkpoint--75"></div>
      <div class="math-hero__checkpoint math-hero__checkpoint--100"></div>
    </div>
    <div class="math-hero__meta">
      <span class="math-hero__rank">HERO IN TRAINING</span>
      <span class="math-hero__count">0 / 1 goed</span>
    </div>
  `;

  achtergrond.append(speedlines, particles, hero, badge, bubble);
  blok.append(achtergrond, meter);

  return {
    blok,
    hero,
    particles,
    badge,
    bubble,
    percent: meter.querySelector(".math-hero__percent"),
    rank: meter.querySelector(".math-hero__rank"),
    count: meter.querySelector(".math-hero__count"),
    fill: meter.querySelector(".math-hero__bar-fill"),
  };
}

export function toonEindAnimatie(container, percentageGoed) {
  const percentage = begrens(Math.round(percentageGoed || 0), 0, 100);
  const vlak = maakElement("div", "math-hero-result");
  vlak.style.setProperty("--power-progress", `${percentage}%`);
  vlak.setAttribute("role", "img");

  const succes = percentage >= 70;
  const titel = percentage >= 100
    ? "MATH MASTER!"
    : succes
      ? "SUPER MATH HERO!"
      : "HERO IN TRAINING!";
  const tekst = succes
    ? "Missie voltooid. Je power staat hoog!"
    : "Goed geoefend. De volgende missie maakt je sterker.";

  vlak.setAttribute("aria-label", `${titel} ${tekst}`);
  vlak.innerHTML = `
    <div class="math-hero-result__burst"></div>
    <div class="math-hero-result__hero"></div>
    <h3>${titel}</h3>
    <p>${tekst}</p>
    <div class="math-hero-result__meter">
      <div class="math-hero-result__fill"></div>
    </div>
    <strong>${percentage}% goed</strong>
  `;
  vlak.querySelector(".math-hero-result__hero").appendChild(svgSuperheld());
  container.appendChild(vlak);

  if (succes) {
    toonPartikels(vlak.querySelector(".math-hero-result__burst"), { aantal: 22 });
  }

  return vlak;
}

export function maakRaketAnimatie(container, doelAantal) {
  const totaal = Math.max(1, doelAantal);
  let aantalGoed = 0;
  let laatstGehaaldeCheckpoint = 0;
  let bubbleTimer = null;

  const ui = bouwSuperheroBlok();
  container.appendChild(ui.blok);

  function zetBubble(tekst) {
    ui.bubble.textContent = tekst;
    ui.bubble.classList.add("math-hero__bubble--show");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      ui.bubble.classList.remove("math-hero__bubble--show");
    }, 1500);
  }

  function bijwerken({ toonCheckpoint = false } = {}) {
    const percentage = begrens(Math.round((aantalGoed / totaal) * 100), 0, 100);
    const checkpoint = checkpointVoorPercentage(percentage);
    const tier = tierVoorPercentage(percentage);

    ui.blok.dataset.tier = String(tier);
    ui.blok.style.setProperty("--power-progress", `${percentage}%`);
    ui.fill.style.width = `${percentage}%`;
    ui.percent.textContent = `${percentage}%`;
    ui.rank.textContent = checkpoint.tekst;
    ui.count.textContent = `${aantalGoed} / ${totaal} goed`;

    if (toonCheckpoint && checkpoint.grens > laatstGehaaldeCheckpoint) {
      laatstGehaaldeCheckpoint = checkpoint.grens;
      toonBadge(ui.badge, checkpoint.tekst);
    }

    if (percentage >= 100) {
      toonBadge(ui.badge, "MISSIE VOLTOOID!");
      zetBubble("SUPER MATH HERO!");
      ui.blok.classList.add("math-hero--complete");
    } else {
      ui.blok.classList.remove("math-hero--complete");
    }
  }

  bijwerken();

  return {
    goedAntwoord() {
      const vorigePercentage = Math.round((aantalGoed / totaal) * 100);
      aantalGoed = Math.min(totaal, aantalGoed + 1);
      const nieuwePercentage = Math.round((aantalGoed / totaal) * 100);
      animatieHerstart(ui.blok, "math-hero--boost");
      toonPartikels(ui.particles, { aantal: nieuwePercentage >= 100 ? 24 : 12 });
      zetBubble("+1 POWER");
      bijwerken({ toonCheckpoint: nieuwePercentage > vorigePercentage });
    },

    foutAntwoord() {
      animatieHerstart(ui.blok, "math-hero--encourage");
      zetBubble("Nog een keer!");
      toonPartikels(ui.particles, { aantal: 5, symbols: ["★", "+"] });
      bijwerken();
    },

    reset() {
      aantalGoed = 0;
      laatstGehaaldeCheckpoint = 0;
      clearTimeout(bubbleTimer);
      ui.blok.classList.remove("math-hero--complete", "math-hero--boost", "math-hero--encourage");
      ui.bubble.classList.remove("math-hero__bubble--show");
      bijwerken();
    },

    element: ui.blok,
  };
}

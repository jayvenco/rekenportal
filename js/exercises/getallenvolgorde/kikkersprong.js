// exercises/getallenvolgorde/kikkersprong.js
// -----------------------------------------------------------------------------
// Visuele laag voor de volgorde-oefening: een kikker springt van lelieblad
// naar lelieblad. Elk lelieblad toont een getal; de kikker springt erheen
// zodra het kind het aantikt, en laat een boogje achter dat groen is bij een
// juiste sprong (op volgorde) en rood bij een foute sprong (verkeerde
// volgorde) — waarna de kikker terugspringt naar het vorige lelieblad.
//
// Puur eigen, zelfgetekende SVG/CSS — geen bestaand personage, geen externe
// assets. Deze module regelt alleen de weergave/animatie; de rekenlogica
// (welk getal is het volgende, goed/fout) blijft in oefenscherm.js.
// -----------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";
const SPRONG_DUUR_MS = 480;
const TERUGSPRONG_DUUR_MS = 380;

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

/** Inline SVG van een eenvoudige, zelfgetekende kikker (eigen ontwerp). */
function bouwKikkerSvg() {
  return `
    <svg viewBox="0 0 40 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="20" cy="22" rx="14" ry="10" fill="#5cb85c" />
      <circle cx="10" cy="10" r="6" fill="#5cb85c" />
      <circle cx="30" cy="10" r="6" fill="#5cb85c" />
      <circle cx="10" cy="9" r="2.6" fill="#fff" />
      <circle cx="30" cy="9" r="2.6" fill="#fff" />
      <circle cx="10" cy="9" r="1.2" fill="#1c2126" />
      <circle cx="30" cy="9" r="1.2" fill="#1c2126" />
      <path d="M12 25 Q20 30 28 25" stroke="#2d7a2d" stroke-width="2" fill="none" stroke-linecap="round" />
      <ellipse cx="20" cy="24" rx="8" ry="4" fill="#8fd98f" opacity="0.6" />
    </svg>
  `;
}

function berekenPosities(aantal) {
  // Index 0 = start-lelieblad (links, geen getal). Daarna één per getal,
  // gelijkmatig verdeeld met een lichte zigzag zodat het op een vijver lijkt.
  const posities = [{ xPct: 6, yPct: 62 }];
  for (let i = 0; i < aantal; i += 1) {
    const xPct = 22 + i * (72 / Math.max(1, aantal - 1));
    const yPct = i % 2 === 0 ? 38 : 68;
    posities.push({ xPct, yPct });
  }
  return posities;
}

function puntOpBoog(van, midden, naar, t) {
  const x = (1 - t) ** 2 * van.x + 2 * (1 - t) * t * midden.x + t ** 2 * naar.x;
  const y = (1 - t) ** 2 * van.y + 2 * (1 - t) * t * midden.y + t ** 2 * naar.y;
  return { x, y };
}

/**
 * Bouwt het kikkersprong-speelveld voor één opgave.
 * @param {number[]} getallen - de (door elkaar geschudde) getallen, in weergavevolgorde.
 * @param {(getal: number) => void} onTik - callback wanneer een lelieblad wordt aangetikt.
 * @returns {{ element: HTMLElement, springNaarGetal: (getal: number, isGoed: boolean) => Promise<void> }}
 */
export function bouwKikkersprong(getallen, onTik) {
  const vlak = el("div", "kikkersprong-vlak");
  vlak.setAttribute("role", "img");
  vlak.setAttribute(
    "aria-label",
    "Een kikker springt van lelieblad naar lelieblad. Spring van het kleinste naar het grootste getal."
  );

  const water = el("div", "kikkersprong-water");
  vlak.appendChild(water);

  const boogSvg = document.createElementNS(SVG_NS, "svg");
  boogSvg.setAttribute("class", "kikkersprong-boogjes");
  vlak.appendChild(boogSvg);

  const posities = berekenPosities(getallen.length);

  const startBlad = el("div", "kikkersprong-lelieblad kikkersprong-lelieblad--start");
  startBlad.style.left = `${posities[0].xPct}%`;
  startBlad.style.top = `${posities[0].yPct}%`;
  vlak.appendChild(startBlad);

  const leliebladElementen = [startBlad];
  getallen.forEach((getal, i) => {
    const blad = document.createElement("button");
    blad.type = "button";
    blad.className = "kikkersprong-lelieblad";
    blad.textContent = String(getal);
    blad.setAttribute("aria-label", `Spring naar ${getal}`);
    blad.style.left = `${posities[i + 1].xPct}%`;
    blad.style.top = `${posities[i + 1].yPct}%`;
    blad.addEventListener("click", () => onTik(getal));
    vlak.appendChild(blad);
    leliebladElementen.push(blad);
  });

  const kikker = el("div", "kikkersprong-kikker");
  kikker.innerHTML = bouwKikkerSvg();
  vlak.appendChild(kikker);

  let huidigeIndex = 0;

  function pixelPositie(index) {
    const rect = vlak.getBoundingClientRect();
    const pos = posities[index];
    return { x: (pos.xPct / 100) * rect.width, y: (pos.yPct / 100) * rect.height };
  }

  function zetKikkerOp(x, y) {
    kikker.style.transform = `translate(${x}px, ${y}px) translate(-50%, -78%)`;
  }

  function tekenBoog(vanIndex, naarIndex, kleurKlasse) {
    const van = pixelPositie(vanIndex);
    const naar = pixelPositie(naarIndex);
    const midX = (van.x + naar.x) / 2;
    const midY = Math.min(van.y, naar.y) - 44;
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", `M ${van.x} ${van.y} Q ${midX} ${midY} ${naar.x} ${naar.y}`);
    path.setAttribute("class", `kikkersprong-boog ${kleurKlasse}`);
    boogSvg.appendChild(path);
    return path;
  }

  function animeerSprong(naarIndex, duurMs) {
    return new Promise((resolve) => {
      const van = pixelPositie(huidigeIndex);
      const naar = pixelPositie(naarIndex);
      const midden = { x: (van.x + naar.x) / 2, y: Math.min(van.y, naar.y) - 44 };
      const start = performance.now();

      kikker.classList.add("kikkersprong-kikker--springt");

      function frame(nu) {
        const t = Math.min(1, (nu - start) / duurMs);
        const punt = puntOpBoog(van, midden, naar, t);
        zetKikkerOp(punt.x, punt.y);
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          kikker.classList.remove("kikkersprong-kikker--springt");
          huidigeIndex = naarIndex;
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  /** Laat de kikker springen naar het lelieblad met dit getal. */
  async function springNaarGetal(getal, isGoed) {
    const naarIndex = getallen.indexOf(getal) + 1; // +1: index 0 is het start-lelieblad
    if (naarIndex < 1) return;
    const vanIndex = huidigeIndex;

    const boog = tekenBoog(vanIndex, naarIndex, isGoed ? "kikkersprong-boog--goed" : "kikkersprong-boog--fout");
    await animeerSprong(naarIndex, SPRONG_DUUR_MS);

    if (isGoed) {
      leliebladElementen[naarIndex].classList.add("kikkersprong-lelieblad--opgelost");
      leliebladElementen[naarIndex].disabled = true;
    } else {
      leliebladElementen[naarIndex].classList.add("kikkersprong-lelieblad--fout");
      setTimeout(() => leliebladElementen[naarIndex].classList.remove("kikkersprong-lelieblad--fout"), 500);
      await new Promise((resolve) => setTimeout(resolve, 350));
      boog.remove();
      await animeerSprong(vanIndex, TERUGSPRONG_DUUR_MS);
    }
  }

  // Plaats de kikker pas nadat het element in de pagina hangt (anders is
  // getBoundingClientRect() nog 0x0).
  requestAnimationFrame(() => {
    const p = pixelPositie(0);
    zetKikkerOp(p.x, p.y);
  });

  return { element: vlak, springNaarGetal };
}

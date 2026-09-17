// utils/voortgangCirkels.js
// -----------------------------------------------------------------------------
// Rij van kleine sterren boven in het scherm, één per opgave. Elke ster
// verandert van kleur zodra die opgave beantwoord is:
//   - grijs  = nog niet beantwoord
//   - groen  = goed op de eerste poging
//   - oranje = goed op de tweede poging
//   - rood   = fout (na de tweede, laatste poging)
// -----------------------------------------------------------------------------

/** Bouwt een SVG-ster met de gegeven kleur. */
function maakSterSvg(vulKleur = "#e2e8f0", lijnKleur = "#d0d6e0") {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.style.display = "block";

  // 5-puntige ster (gestandaardiseerde coördinaten)
  const path = document.createElementNS(NS, "path");
  path.setAttribute(
    "d",
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
  );
  path.setAttribute("fill", vulKleur);
  path.setAttribute("stroke", lijnKleur);
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);
  return svg;
}

/**
 * Bouwt de rij met sterretjes in de gegeven container.
 * @param {HTMLElement} container - waar de rij in komt (wordt hierin toegevoegd).
 * @param {number} aantalOpgaven - hoeveel sterretjes er getekend worden.
 * @returns {{ element: HTMLElement, zetStatus: (index: number, status: string) => void }}
 */
export function maakVoortgangCirkels(container, aantalOpgaven) {
  const rij = document.createElement("div");
  rij.className = "voortgang-cirkels";
  rij.setAttribute("role", "img");
  rij.setAttribute(
    "aria-label",
    `Voortgang: ${aantalOpgaven} opgaven, sterretjes kleuren in naarmate je antwoordt.`
  );

  const sterren = [];
  for (let i = 0; i < aantalOpgaven; i += 1) {
    const wrapper = document.createElement("span");
    wrapper.className = "voortgang-cirkel";
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.appendChild(maakSterSvg());
    rij.appendChild(wrapper);
    sterren.push(wrapper);
  }

  container.appendChild(rij);

  /**
   * Zet de status van één ster.
   * @param {number} index - index van de opgave (0-gebaseerd).
   * @param {"goed"|"tweedePogingGoed"|"fout"} status
   */
  function zetStatus(index, status) {
    const wrapper = sterren[index];
    if (!wrapper) return;
    wrapper.classList.remove(
      "voortgang-cirkel--goed",
      "voortgang-cirkel--tweede-poging-goed",
      "voortgang-cirkel--fout"
    );
    if (status === "goed") {
      wrapper.classList.add("voortgang-cirkel--goed");
      vervangSterKleur(wrapper, "#38b26a", "#2d8f55");
    } else if (status === "tweedePogingGoed") {
      wrapper.classList.add("voortgang-cirkel--tweede-poging-goed");
      vervangSterKleur(wrapper, "#f0883e", "#d4722e");
    } else if (status === "fout") {
      wrapper.classList.add("voortgang-cirkel--fout");
      vervangSterKleur(wrapper, "#e8735a", "#d45a40");
    }
  }

  return { element: rij, zetStatus };
}

/** Vervangt de vul- en lijnkleur van de SVG-ster in een wrapper. */
function vervangSterKleur(wrapper, vul, lijn) {
  const svg = wrapper.querySelector("svg");
  if (!svg) return;
  const path = svg.querySelector("path");
  if (!path) return;
  path.setAttribute("fill", vul);
  path.setAttribute("stroke", lijn);
}
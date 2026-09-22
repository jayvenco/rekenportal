// utils/telraam.js
// ---------------------------------------------------------------------------
// Telraam — een interactief rekenhulpmiddel met 2 verticale kolommen van elk
// 10 kralen (5 witte onder, 5 blauwe boven). Klik een kraal om die en alle
// kralen eronder naar boven te schuiven (te "tellen"). Klik nogmaals om te
// resetten. Wordt getoond/verborgen via een floating toggle in elke oefening.
// ---------------------------------------------------------------------------

const BEAD_STEP = 30; // px per kraal (hoogte + tussenruimte)
const AANTAL_PER_KOLOM = 10;

/** Kleuren per positie: indices 0-4 = wit, 5-9 = blauw */
function kraalKleur(index) {
  return index < 5 ? "wit" : "blauw";
}

export class Telraam {
  constructor() {
    this.waarden = [0, 0]; // waarde per kolom (0–10)
    this.element = null;
    this.toggleKnop = null;
  }

  // -----------------------------------------------------------------------
  // Bouw het telraam-element (wordt eenmalig aangemaakt, hidden by default)
  // -----------------------------------------------------------------------
  bouw() {
    if (this.element) return;

    this.element = document.createElement("div");
    this.element.className = "telraam-widget";
    this.element.dataset.zichtbaar = "false";

    this.element.innerHTML = `
      <div class="telraam-balk">
        <span class="telraam-titel">🧮 Telraam</span>
        <button class="telraam-sluit" title="Telraam sluiten">✕</button>
      </div>
      <div class="telraam-lichaam">
        ${this.#bouwKolommen()}
      </div>
      <div class="telraam-voet">
        Totaal: <span class="telraam-totaal-cijfer">0</span>
      </div>
    `;

    this.#bindEvents();
    this.#render();

    // Toggle-knop (floating, altijd zichtbaar)
    this.toggleKnop = document.createElement("button");
    this.toggleKnop.className = "telraam-toggle";
    this.toggleKnop.title = "Telraam tonen/verbergen";
    this.toggleKnop.setAttribute("aria-label", "Telraam tonen of verbergen");
    this.toggleKnop.textContent = "🧮";
    this.toggleKnop.addEventListener("click", () => this.toggle());
  }

  #bouwKolommen() {
    let html = "";
    for (let k = 0; k < 2; k++) {
      html += `<div class="telraam-kolom" data-kolom="${k}">`;
      html += `<div class="telraam-rail">`;
      // Kralen van boven naar beneden in DOM: index 9 (top) → 0 (bottom)
      for (let i = AANTAL_PER_KOLOM - 1; i >= 0; i--) {
        const kleur = kraalKleur(i);
        html += `<div class="telraam-kraal telraam-kraal--${kleur}" data-index="${i}" role="button" tabindex="0"></div>`;
      }
      html += `</div>`;
      html += `<div class="telraam-label" data-label="${k}">0</div>`;
      html += `</div>`;
    }
    return html;
  }

  #bindEvents() {
    // Click op een kraal
    this.element.addEventListener("click", (e) => {
      const kraal = e.target.closest(".telraam-kraal");
      if (kraal) {
        const kolomDiv = kraal.closest(".telraam-kolom");
        const kolom = parseInt(kolomDiv.dataset.kolom);
        const index = parseInt(kraal.dataset.index);
        this.#klik(kolom, index);
        return;
      }

      // Sluit-knop
      if (e.target.closest(".telraam-sluit")) {
        this.verberg();
      }
    });

    // Keyboard support (Enter/Space op een kraal)
    this.element.addEventListener("keydown", (e) => {
      if (e.target.closest(".telraam-kraal") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        const kraal = e.target.closest(".telraam-kraal");
        const kolomDiv = kraal.closest(".telraam-kolom");
        const kolom = parseInt(kolomDiv.dataset.kolom);
        const index = parseInt(kraal.dataset.index);
        this.#klik(kolom, index);
      }
    });
  }

  #klik(kolom, index) {
    const nieuweWaarde = index + 1;
    if (this.waarden[kolom] === nieuweWaarde) {
      this.waarden[kolom] = 0; // toggle off
    } else {
      this.waarden[kolom] = nieuweWaarde;
    }
    this.#render();
  }

  // -----------------------------------------------------------------------
  // Render — verplaatst kralen via transform op basis van de waarden
  // Formule: voor kraal i (0 = onder, 9 = boven) in kolom met waarde N:
  //   i < N → top = (N-1-i) * BEAD_STEP    (bovenste N kralen = geteld)
  //   i >= N → top = i * BEAD_STEP          (onderste kralen = rust)
  // -----------------------------------------------------------------------
  #render() {
    const kolommen = this.element.querySelectorAll(".telraam-kolom");
    kolommen.forEach((kolomDiv, k) => {
      const N = this.waarden[k];
      const kralen = kolomDiv.querySelectorAll(".telraam-kraal");

      kralen.forEach((kraal) => {
        const i = parseInt(kraal.dataset.index); // 0 = onder, 9 = boven
        let topPx;
        if (i < N) {
          topPx = (N - 1 - i) * BEAD_STEP; // geteld: stapelen van boven
          kraal.classList.add("telraam-kraal--oben");
        } else {
          topPx = i * BEAD_STEP; // rust: natuurlijke positie van onder
          kraal.classList.remove("telraam-kraal--oben");
        }
        kraal.style.setProperty("--kraal-top", `${topPx}px`);
      });

      // Label bijwerken
      const label = kolomDiv.querySelector(".telraam-label");
      if (label) label.textContent = String(N);
    });

    // Totaal bijwerken
    const totaalEl = this.element.querySelector(".telraam-totaal-cijfer");
    if (totaalEl) {
      totaalEl.textContent = String(this.waarden[0] + this.waarden[1]);
    }
  }

  // -----------------------------------------------------------------------
  // Toon / verberg / toggle
  // -----------------------------------------------------------------------
  toon() {
    if (!this.element) this.bouw();
    this.element.dataset.zichtbaar = "true";
    this.element.classList.add("telraam-widget--zichtbaar");
  }

  verberg() {
    if (!this.element) return;
    this.element.dataset.zichtbaar = "false";
    this.element.classList.remove("telraam-widget--zichtbaar");
  }

  toggle() {
    if (!this.element) this.bouw();
    const isZichtbaar = this.element.dataset.zichtbaar === "true";
    if (isZichtbaar) {
      this.verberg();
    } else {
      this.toon();
    }
  }

  // Geeft de toggle-knop (wordt in de DOM gehangen door de integrator)
  getToggleKnop() {
    if (!this.toggleKnop) this.bouw();
    return this.toggleKnop;
  }

  // Geeft het telraam-element zelf
  getElement() {
    if (!this.element) this.bouw();
    return this.element;
  }

  // Reset alle kralen naar 0
  reset() {
    this.waarden = [0, 0];
    this.#render();
  }

  // Vernietig DOM-elementen (als de pagina ververst)
  vernietig() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.toggleKnop && this.toggleKnop.parentNode) {
      this.toggleKnop.parentNode.removeChild(this.toggleKnop);
    }
    this.element = null;
    this.toggleKnop = null;
  }
}

// ---------------------------------------------------------------------------
// Singleton-export — één telraam voor de hele app
// ---------------------------------------------------------------------------
let _telraamInstance = null;

export function getTelraam() {
  if (!_telraamInstance) {
    _telraamInstance = new Telraam();
  }
  return _telraamInstance;
}

export function vernietigTelraam() {
  if (_telraamInstance) {
    _telraamInstance.vernietig();
    _telraamInstance = null;
  }
}
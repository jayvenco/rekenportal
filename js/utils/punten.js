// utils/punten.js
// -----------------------------------------------------------------------------
// Punten- en beloningssysteem voor de Rekenportal.
// Berekent punten op basis van een voltooide oefensessie en slaat ze
// op via de backend-API.
// -----------------------------------------------------------------------------

const API_BASE = (window.location.port === "8791" || window.location.port === "8792")
  ? "http://localhost:8420/api"
  : "/api";

/**
 * Berekent het aantal punten op basis van score.
 * @param {number} aantalGoed
 * @param {number} totaal
 * @returns {{ punten: number, percentage: number, label: string }}
 */
export function berekenPunten(aantalGoed, totaal) {
  const pct = totaal > 0 ? (aantalGoed / totaal) * 100 : 0;
  const g = Math.round(pct * 10) / 10; // 1 decimaal

  // Geen opgaven gedaan
  if (totaal === 0) return { punten: 0, percentage: 0, label: "Geen opgaven gedaan." };

  // Minder dan 50% → 2 punten aftrek (gehalveerd van 5)
  if (pct < 50) {
    return {
      punten: -2,
      percentage: g,
      label: "Minder dan 50% goed — 2 punten aftrek.",
    };
  }

  // Tussen 50% en 70% → neutraal (0 punten)
  if (pct < 70) {
    return {
      punten: 0,
      percentage: g,
      label: "Tussen 50% en 70% — geen punten, geen aftrek.",
    };
  }

  // Tussen 70% en 99% → 3 punten basis + bonus per extra % (gehalveerd)
  if (pct < 100) {
    const extraPunten = Math.round(((pct - 70) / 30) * 3);
    const totaalPunten = 3 + extraPunten;
    return {
      punten: totaalPunten,
      percentage: g,
      label: `${totaalPunten} punten verdiend!`,
    };
  }

  // 100% → 5 punten (gehalveerd van 10)
  return {
    punten: 5,
    percentage: 100,
    label: "Perfect — 5 punten!",
  };
}

/**
 * Slaat een voltooide sessie op via de API.
 */
export async function slaSessieOp(profielId, exerciseId, aantalGoed, totaal) {
  const { punten, percentage } = berekenPunten(aantalGoed, totaal);
  try {
    const r = await fetch(`${API_BASE}/sessies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profiel_id: profielId,
        exercise_id: exerciseId,
        aantal_goed: aantalGoed,
        aantal_totaal: totaal,
        percentage,
        punten,
      }),
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return await r.json();
  } catch (fout) {
    console.error("Kon sessie niet opslaan:", fout);
    return null;
  }
}

/**
 * Haalt het maandoverzicht van een profiel op.
 */
export async function haalMaandOverzicht(profielId, jaar, maand) {
  try {
    const r = await fetch(
      `${API_BASE}/sessies/maand/${profielId}?jaar=${jaar}&maand=${maand}`
    );
    if (!r.ok) throw new Error(`API ${r.status}`);
    return await r.json();
  } catch (fout) {
    console.error("Kon maandoverzicht niet ophalen:", fout);
    return { totaalPunten: 0, dagen: [] };
  }
}

/**
 * Haalt het totaal aantal punten aller tijden op.
 */
export async function haalTotaalPunten(profielId) {
  try {
    const r = await fetch(`${API_BASE}/sessies/totaal/${profielId}`);
    if (!r.ok) throw new Error(`API ${r.status}`);
    return await r.json();
  } catch (fout) {
    console.error("Kon totaal punten niet ophalen:", fout);
    return { totaalPunten: 0 };
  }
}

// -----------------------------------------------------------------------------
// Muntanimatie — laat punten zien oplopen met een leuk effect
// -----------------------------------------------------------------------------

/**
 * Toont een punten-animatie in een container.
 * Punten tellen vloeiend op van 0 naar het eindbedrag.
 * @param {HTMLElement} container
 * @param {number} punten - aantal punten om te tonen (negatief = rood)
 * @param {string} [label] - tekst erbij (bv. "5 punten!")
 * @param {number} [duurMs=1200] - hoe lang het tellen duurt
 */
export function toonPuntenAnimatie(container, punten, label, duurMs = 1200) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "punten-animatie";

  // Munt-icoon
  const munt = document.createElement("div");
  munt.className = "punten-munt";
  munt.textContent = punten < 0 ? "💔" : "🪙";
  wrapper.appendChild(munt);

  // Punten-teller
  const teller = document.createElement("div");
  teller.className = "punten-teller";
  teller.textContent = "0";
  wrapper.appendChild(teller);

  // Label
  if (label) {
    const labelEl = document.createElement("div");
    labelEl.className = "punten-label";
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);
  }

  // Voortgangsbalk
  const balkWrap = document.createElement("div");
  balkWrap.className = "punten-balk-wrap";
  const balk = document.createElement("div");
  balk.className = "punten-balk";
  balkWrap.appendChild(balk);
  wrapper.appendChild(balkWrap);

  container.appendChild(wrapper);

  // Animatie: punten tellen op
  if (punten >= 0) {
    animeerTeller(teller, balk, punten, duurMs);
  } else {
    // Negatieve punten: teller wordt rood
    teller.style.color = "#e8735a";
    munt.textContent = "💔";
    animeerTeller(teller, balk, Math.abs(punten), duurMs, true);
  }
}

function animeerTeller(tellerEl, balkEl, eindDoel, duurMs, isNegatief = false) {
  const startTijd = performance.now();
  const stappen = 30;
  const interval = duurMs / stappen;

  function tik() {
    const verstreken = performance.now() - startTijd;
    const vordering = Math.min(1, verstreken / duurMs);
    const waarde = Math.round(vordering * eindDoel);

    if (isNegatief) {
      tellerEl.textContent = `-${waarde}`;
    } else {
      tellerEl.textContent = String(waarde);
    }
    balkEl.style.width = `${vordering * 100}%`;

    if (vordering < 1) {
      setTimeout(tik, interval);
    } else {
      // Eindwaarde zetten (voorkom afrondingsverschillen)
      tellerEl.textContent = isNegatief ? `-${eindDoel}` : String(eindDoel);
      balkEl.style.width = "100%";
      // Munt laatst een sprongetje maken
      const munt = tellerEl.closest(".punten-animatie")?.querySelector(".punten-munt");
      if (munt) {
        munt.classList.add("punten-munt--sprong");
      }
    }
  }

  setTimeout(tik, 50);
}
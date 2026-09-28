// exercises/meerminder/illustraties.js
// -----------------------------------------------------------------------------
// Zelfgetekende SVG-illustraties bij de "Meer of minder?"-opgaven: een grid
// van bolletjes voor de "aantal"-categorie, en een geschaalde staaf (met een
// klein bolletje erboven) voor de "grootte"- en "hoogte"-categorie. Geen
// externe afbeeldingen of libraries.
// -----------------------------------------------------------------------------

/** Rij(en) bolletjes die het aantal voorstellen (max 12, in rijen van 4). */
export function bouwAantalIllustratie(aantal, kleur) {
  const perRij = 4;
  const rijen = Math.ceil(aantal / perRij);
  const cirkels = [];
  for (let i = 0; i < aantal; i += 1) {
    const rij = Math.floor(i / perRij);
    const kolom = i % perRij;
    const itemsInRij = Math.min(perRij, aantal - rij * perRij);
    const rijBreedte = itemsInRij * 22;
    const startX = (perRij * 22 - rijBreedte) / 2 + 11;
    const cx = startX + kolom * 22;
    const cy = 14 + rij * 22;
    cirkels.push(`<circle cx="${cx}" cy="${cy}" r="8" fill="${kleur}" stroke="rgba(0,0,0,0.15)" stroke-width="1" />`);
  }
  const hoogte = 14 + rijen * 22;
  return `
    <svg viewBox="0 0 88 ${hoogte}" width="100%" height="${Math.max(60, hoogte)}" aria-hidden="true">
      ${cirkels.join("")}
    </svg>
  `;
}

/**
 * Verticale staaf, geschaald t.o.v. schaalMax, met een klein bolletje erboven.
 * Gebruikt voor zowel "grootte" (toren/boom/doos) als "hoogte" (vlieger/ballon/drone).
 */
export function bouwStaafIllustratie(waarde, schaalMax, kleur) {
  const maxHoogte = 80;
  const staafHoogte = Math.max(6, Math.round((waarde / schaalMax) * maxHoogte));
  const grondY = 96;
  const staafY = grondY - staafHoogte;
  const bolY = staafY - 6;

  return `
    <svg viewBox="0 0 60 104" width="100%" height="120" aria-hidden="true">
      <line x1="4" y1="${grondY}" x2="56" y2="${grondY}" stroke="#c9d3e0" stroke-width="3" stroke-linecap="round" />
      <rect x="20" y="${staafY}" width="20" height="${staafHoogte}" rx="4" fill="${kleur}" opacity="0.85" />
      <circle cx="30" cy="${bolY}" r="7" fill="${kleur}" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
    </svg>
  `;
}

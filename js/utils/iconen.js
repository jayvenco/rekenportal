// utils/iconen.js
// -----------------------------------------------------------------------------
// Kleine bibliotheek met zelfgetekende SVG-icoontjes voor de menutegels.
// Geen externe plaatjes of libraries: alles is hier met SVG-paden getekend.
// Elke functie geeft een string terug met inline SVG-markup.
// -----------------------------------------------------------------------------

export function icoonGetallenlijn() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <line x1="6" y1="32" x2="58" y2="32" stroke="#3a72c4" stroke-width="4" stroke-linecap="round" />
      <line x1="14" y1="24" x2="14" y2="40" stroke="#3a72c4" stroke-width="3" />
      <line x1="32" y1="20" x2="32" y2="44" stroke="#3a72c4" stroke-width="4" />
      <line x1="50" y1="24" x2="50" y2="40" stroke="#3a72c4" stroke-width="3" />
      <circle cx="32" cy="14" r="5" fill="#f5b942" />
    </svg>
  `;
}

export function icoonTafels() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <rect x="8" y="8" width="48" height="48" rx="8" fill="none" stroke="#3a72c4" stroke-width="3" />
      <line x1="8" y1="24" x2="56" y2="24" stroke="#3a72c4" stroke-width="2" />
      <line x1="8" y1="40" x2="56" y2="40" stroke="#3a72c4" stroke-width="2" />
      <line x1="24" y1="8" x2="24" y2="56" stroke="#3a72c4" stroke-width="2" />
      <line x1="40" y1="8" x2="40" y2="56" stroke="#3a72c4" stroke-width="2" />
      <text x="32" y="20" text-anchor="middle" font-size="10" font-weight="800" fill="#f5b942">x</text>
    </svg>
  `;
}

/** Icoon voor de verhaaltjessommen-oefening: een opengeslagen boekje met een klein sommetje erop. */
export function icoonVerhaaltjes() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <path d="M32 14 C27 10 16 9 9 11 L9 47 C16 45 27 46 32 50 C37 46 48 45 55 47 L55 11 C48 9 37 10 32 14 Z"
        fill="#f3e9fb" stroke="#8f4fd6" stroke-width="3" stroke-linejoin="round" />
      <line x1="32" y1="14" x2="32" y2="50" stroke="#8f4fd6" stroke-width="3" />
      <line x1="14" y1="20" x2="26" y2="19" stroke="#a56ee2" stroke-width="2" stroke-linecap="round" />
      <line x1="14" y1="27" x2="26" y2="26" stroke="#a56ee2" stroke-width="2" stroke-linecap="round" />
      <line x1="14" y1="34" x2="24" y2="33" stroke="#a56ee2" stroke-width="2" stroke-linecap="round" />
      <text x="45" y="31" text-anchor="middle" font-size="14" font-weight="800" fill="#8f4fd6">+3</text>
    </svg>
  `;
}

export function icoonPlusMin() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <circle cx="20" cy="20" r="15" fill="none" stroke="#38b26a" stroke-width="3" />
      <line x1="13" y1="20" x2="27" y2="20" stroke="#38b26a" stroke-width="4" stroke-linecap="round" />
      <line x1="20" y1="13" x2="20" y2="27" stroke="#38b26a" stroke-width="4" stroke-linecap="round" />
      <circle cx="44" cy="44" r="15" fill="none" stroke="#e8735a" stroke-width="3" />
      <line x1="37" y1="44" x2="51" y2="44" stroke="#e8735a" stroke-width="4" stroke-linecap="round" />
    </svg>
  `;
}

/** Icoon voor de volgorde-oefening: drie oplopende bolletjes met een trapje ertussen. */
export function icoonVolgorde() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <path d="M20 37 L28 30" stroke="#c9d3e0" stroke-width="2" stroke-linecap="round" />
      <path d="M40 25 L48 18" stroke="#c9d3e0" stroke-width="2" stroke-linecap="round" />
      <circle cx="12" cy="42" r="9" fill="#fde68a" stroke="#d97706" stroke-width="2" />
      <text x="12" y="46" text-anchor="middle" font-size="10" font-weight="800" fill="#92400e">4</text>
      <circle cx="32" cy="30" r="9" fill="#bfdbfe" stroke="#2563eb" stroke-width="2" />
      <text x="32" y="34" text-anchor="middle" font-size="10" font-weight="800" fill="#1e3a8a">7</text>
      <circle cx="52" cy="18" r="9" fill="#bbf7d0" stroke="#16a34a" stroke-width="2" />
      <text x="52" y="22" text-anchor="middle" font-size="10" font-weight="800" fill="#14532d">9</text>
    </svg>
  `;
}

/** Icoon voor de verhoudingen-oefening: een eenvoudige balansweegschaal. */
export function icoonWeegschaal() {
  return `
    <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden="true">
      <line x1="32" y1="56" x2="32" y2="20" stroke="#2f6ed4" stroke-width="3" stroke-linecap="round" />
      <path d="M16 60 L48 60" stroke="#2f6ed4" stroke-width="3" stroke-linecap="round" />
      <line x1="6" y1="22" x2="58" y2="22" stroke="#2f6ed4" stroke-width="3" stroke-linecap="round" />
      <line x1="6" y1="22" x2="12" y2="42" stroke="#2f6ed4" stroke-width="2" stroke-linecap="round" />
      <rect x="6" y="42" width="12" height="4" rx="1" fill="none" stroke="#2f6ed4" stroke-width="2" />
      <line x1="58" y1="22" x2="52" y2="42" stroke="#2f6ed4" stroke-width="2" stroke-linecap="round" />
      <rect x="46" y="42" width="12" height="4" rx="1" fill="none" stroke="#2f6ed4" stroke-width="2" />
      <polygon points="32,14 28,22 36,22" fill="#2f6ed4" />
    </svg>
  `;
}

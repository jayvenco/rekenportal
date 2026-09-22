// exercises/redactiesommen/index.js
function icoonRedactie() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="28" fill="#fff3cd" stroke="#f08b28" stroke-width="3"/>
  <text x="32" y="42" text-anchor="middle" font-size="28" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">✏️</text>
</svg>`;
}

/** Leest de groep uit de URL-hash (#/oefening/redactiesommen?groep=8). */
function leesGroepUitHash() {
  const match = window.location.hash.match(/groep=(\d+)/);
  const g = match ? Number(match[1]) : null;
  return g === 8 ? 8 : 7;
}

export async function mount(container, settings) {
  const groep = leesGroepUitHash();
  const { toonInstellingenScherm } = await import("./instelscherm.js");
  await toonInstellingenScherm(container, { ...(settings || {}), groep }, (inst) => {
    import("./oefenscherm.js").then(({ toonOefeningScherm }) =>
      toonOefeningScherm(container, { ...inst, groep })
    );
  });
}

export const redactiesommenOefening = {
  id: "redactiesommen",
  titel: "Redactiesommen",
  omschrijving: "Verhaaltjessommen: optellen, aftrekken, breuken, procenten en meten",
  icoonSvg: icoonRedactie(),
  kleurthema: "#f08b28",
  mount,
};
// exercises/redactiesommen/index.js
function icoonRedactie() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="28" fill="#fff3cd" stroke="#f08b28" stroke-width="3"/>
  <text x="32" y="42" text-anchor="middle" font-size="28" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">✏️</text>
</svg>`;
}

export async function mount(container, settings) {
  const { toonInstellingenScherm } = await import("./instelscherm.js");
  await toonInstellingenScherm(container, settings || {}, async (inst) => {
    const { toonOefeningScherm } = await import("./oefenscherm.js");
    toonOefeningScherm(container, inst);
  });
}

export const redactiesommenOefening = {
  id: "redactiesommen",
  titel: "Redactiesommen",
  omschrijving: "Verhaaltjessommen tot 1000",
  icoonSvg: icoonRedactie(),
  kleurthema: "#f08b28",
  mount,
};

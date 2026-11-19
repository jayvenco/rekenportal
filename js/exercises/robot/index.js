// exercises/robot/index.js
// -----------------------------------------------------------------------------
// Startpunt van de Robot Programmeer Spel-module.
// Regelt de overgang tussen het instelscherm en het oefenscherm,
// en meldt de oefening aan bij het register.
// -----------------------------------------------------------------------------

/**
 * IcoonSVG: robot-emoji tekst in een cirkel, kindvriendelijk.
 * @returns {string} SVG-markup.
 */
function icoonRobot() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48" fill="none">
  <circle cx="32" cy="32" r="28" fill="#dbeafe" stroke="#2f6ed4" stroke-width="3"/>
  <text x="32" y="42" text-anchor="middle" font-size="28" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">🤖</text>
</svg>`;
}

/**
 * mount() — verplichte functie die elke oefening moet leveren aan het register.
 * @param {HTMLElement} container - het element waarin de oefening zichzelf tekent.
 * @param {Object} [settings] - optionele start-instellingen.
 */
export async function mount(container, settings) {
  const { toonInstellingenScherm } = await import("./instelscherm.js");
  const startscherm = { ...settings, groep: settings.groep || 4 };

  async function toonInstellingen() {
    await toonInstellingenScherm(
      container,
      startscherm,
      (gekozenInstellingen) => {
        toonOefenscherm(gekozenInstellingen);
      },
      async () => {
        const { toonUitleg } = await import("./uitleg.js");
        toonUitleg(container, toonInstellingen, toonInstellingen);
      }
    );
  }
  await toonInstellingen();

  async function toonOefenscherm(instellingen) {
    const { toonOefeningScherm } = await import("./oefenscherm.js");
    toonOefeningScherm(container, instellingen, ({ opnieuw, nieuweInstellingen }) => {
      if (opnieuw) {
        toonOefenscherm(nieuweInstellingen || instellingen);
      } else {
        window.location.hash = "#/";
      }
    });
  }
}

export const robotOefening = {
  id: "robot",
  titel: "Robot Programmeer Spel",
  omschrijving: "Stuur de robot naar het doel met pijltjes of code!",
  icoonSvg: icoonRobot(),
  kleurthema: "#2f6ed4",
  mount,
};
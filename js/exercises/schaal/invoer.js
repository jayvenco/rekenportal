// exercises/schaal/invoer.js
// -----------------------------------------------------------------------------
// Invoerblok met cijfertoetsenbord en komma, waarbij de eenheid (meter, cm, km)
// of het voorvoegsel ("1 :") naast het antwoord staat, zoals op een werkblad.
// -----------------------------------------------------------------------------

/**
 * @param {HTMLElement} invoerVlak
 * @param {(waarde:number)=>void} opAntwoord
 * @param {()=>boolean} getBezig - true als er feedback getoond wordt (toetsen negeren)
 * @param {{eenheid?:string, voorvoegsel?:string, maxTekens?:number}} opties
 * @returns {Function} opruimfunctie
 */
export function bouwDecimaleInvoer(invoerVlak, opAntwoord, getBezig, opties = {}) {
  const { eenheid = "", voorvoegsel = "", maxTekens = 8 } = opties;
  invoerVlak.innerHTML = "";
  let waarde = "";

  const rij = document.createElement("div");
  rij.className = "schaal-antwoordrij";
  if (voorvoegsel) {
    const v = document.createElement("span");
    v.className = "schaal-eenheid";
    v.textContent = voorvoegsel;
    rij.appendChild(v);
  }
  const scherm = document.createElement("div");
  scherm.className = "antwoord-scherm";
  scherm.setAttribute("aria-label", "Jouw antwoord");
  rij.appendChild(scherm);
  if (eenheid) {
    const e = document.createElement("span");
    e.className = "schaal-eenheid";
    e.textContent = eenheid;
    rij.appendChild(e);
  }
  invoerVlak.appendChild(rij);

  const toon = () => { scherm.textContent = waarde.replace(".", ","); };

  function voegToe(c) {
    if (waarde.length >= maxTekens) return;
    if (waarde === "0" && c !== ".") waarde = "";
    waarde += c;
    toon();
  }
  function komma() {
    if (waarde.includes(".")) return;
    if (waarde === "") waarde = "0";
    voegToe(".");
  }
  function wis() { waarde = waarde.slice(0, -1); toon(); }
  function bevestig() {
    if (waarde === "" || waarde === "0.") return;
    const n = Number(waarde);
    if (Number.isFinite(n)) opAntwoord(n);
  }

  const pad = document.createElement("div");
  pad.className = "cijfer-pad";
  const maakToets = (tekst, aria, actie, stijl) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cijfer-toets";
    b.textContent = tekst;
    b.setAttribute("aria-label", aria);
    if (stijl) Object.assign(b.style, stijl);
    b.addEventListener("click", actie);
    pad.appendChild(b);
  };
  for (const c of [1, 2, 3, 4, 5, 6, 7, 8, 9]) maakToets(String(c), `Cijfer ${c}`, () => voegToe(String(c)));
  maakToets(",", "Komma", komma);
  maakToets("0", "Cijfer 0", () => voegToe("0"));
  maakToets("⌫", "Verwijder laatste teken", wis);
  maakToets("✓", "Antwoord bevestigen", bevestig, { background: "#38b26a", color: "#fff", gridColumn: "1 / -1" });
  invoerVlak.appendChild(pad);

  function toets(e) {
    if (getBezig()) return;
    if (/^[0-9]$/.test(e.key)) voegToe(e.key);
    else if (e.key === "," || e.key === ".") komma();
    else if (e.key === "Backspace") wis();
    else if (e.key === "Enter") bevestig();
  }
  document.addEventListener("keydown", toets);
  return () => document.removeEventListener("keydown", toets);
}

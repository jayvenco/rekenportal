// exercises/grafieken/validatie.js
// -----------------------------------------------------------------------------
// Antwoordcontrole voor alle antwoordtypen: getal (met komma/punt, eenheid en
// spaties), meerkeuze, waar/niet waar, meerdere antwoorden en korte tekst.
// -----------------------------------------------------------------------------

/** Zet een invoerstring om naar een getal, of null als dat niet lukt. */
export function parseGetal(invoer) {
  if (typeof invoer === "number") return invoer;
  let s = String(invoer ?? "").toLowerCase().trim();
  s = s.replace(/[€%°]/g, " ").replace(/[a-zA-Zµ²³]+/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return null;
  // Duizendtallen met punt of spatie: "1.800", "1 800" -> 1800
  if (/^\d{1,3}([. ]\d{3})+(,\d+)?$/.test(s)) s = s.replace(/[. ]/g, "");
  s = s.replace(/\s/g, "").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

function normaliseerTekst(t) {
  return String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Controleert een antwoord.
 * @param {Object} vraag - het vraag-object uit opgaven.json
 * @param {*} invoer - getal/tekst (getal, tekst), index (meerkeuze),
 *   boolean (waaronwaar) of array van indexen (meerdere).
 * @returns {boolean}
 */
export function controleerAntwoord(vraag, invoer) {
  switch (vraag.type) {
    case "getal": {
      const g = parseGetal(invoer);
      return g !== null && Math.abs(g - vraag.antwoord) < 1e-9;
    }
    case "meerkeuze":
      return Number(invoer) === vraag.antwoord;
    case "waaronwaar":
      return invoer === vraag.antwoord;
    case "meerdere": {
      if (!Array.isArray(invoer)) return false;
      const a = [...invoer].map(Number).sort((x, y) => x - y);
      const b = [...vraag.antwoord].sort((x, y) => x - y);
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    case "tekst": {
      const n = normaliseerTekst(invoer);
      if (!n) return false;
      return [vraag.antwoord, ...(vraag.geaccepteerd || [])].some((x) => normaliseerTekst(x) === n);
    }
    default:
      return false;
  }
}

/** Is er een bruikbaar antwoord ingevuld? */
export function isIngevuld(vraag, invoer) {
  if (vraag.type === "getal") return parseGetal(invoer) !== null;
  if (vraag.type === "tekst") return normaliseerTekst(invoer) !== "";
  if (vraag.type === "meerdere") return Array.isArray(invoer) && invoer.length > 0;
  return invoer !== null && invoer !== undefined;
}

/** Leesbare weergave van het juiste antwoord. */
export function toonJuisteAntwoord(vraag) {
  switch (vraag.type) {
    case "getal": return `${String(vraag.antwoord).replace(".", ",")}${vraag.eenheid ? " " + vraag.eenheid : ""}`;
    case "meerkeuze": return vraag.opties[vraag.antwoord];
    case "waaronwaar": return vraag.antwoord ? "Waar" : "Niet waar";
    case "meerdere": return vraag.antwoord.map((i) => vraag.opties[i]).join(", ");
    default: return String(vraag.antwoord);
  }
}

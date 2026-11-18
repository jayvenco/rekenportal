// exercises/codeblokken/voortgang.js
// -----------------------------------------------------------------------------
// Bewaart per profiel hoeveel sterren (0-3) elk level heeft, via de
// instellingen-opslag van de portal (zelfde plek als de andere oefeningen).
// -----------------------------------------------------------------------------

import { getInstellingen, saveInstellingen } from "../../storage.js";

const ID = "codeblokken";

export async function laadVoortgang() {
  const opgeslagen = (await getInstellingen(ID)) || {};
  return { sterren: opgeslagen.sterren || {}, set: opgeslagen.set || null };
}

export async function bewaarVoortgang(voortgang) {
  await saveInstellingen(ID, { sterren: voortgang.sterren, set: voortgang.set });
}

export const sleutel = (setId, index) => `${setId}:${index + 1}`;

// utils/willekeurig.js
// -----------------------------------------------------------------------------
// Kleine, generieke hulpfuncties voor willekeurige getallen en het voorkomen
// van dubbele opgaven binnen één sessie. Wordt door meerdere oefeningen gebruikt.
// -----------------------------------------------------------------------------

/** Geeft een willekeurig geheel getal terug tussen min en max, beide inclusief. */
export function randomGeheelGetal(min, max) {
  const laag = Math.ceil(Math.min(min, max));
  const hoog = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (hoog - laag + 1)) + laag;
}

/** Kiest willekeurig één item uit een array. */
export function kiesWillekeurig(lijst) {
  return lijst[randomGeheelGetal(0, lijst.length - 1)];
}

/** Schudt een array (Fisher-Yates) en geeft een nieuwe array terug. */
export function schudArray(lijst) {
  const kopie = [...lijst];
  for (let i = kopie.length - 1; i > 0; i -= 1) {
    const j = randomGeheelGetal(0, i);
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

/**
 * Genereert een opgave die nog niet eerder in deze sessie is voorgekomen.
 * @param {Function} genereerEen - functie die één opgave-object teruggeeft.
 * @param {Function} naarSleutel - functie die van een opgave een unieke string maakt.
 * @param {Set<string>} gebruikteSleutels - set met sleutels die al gebruikt zijn (wordt aangepast).
 * @param {number} maxPogingen - hoeveel keer we het proberen voor we opgeven.
 * @returns {Object} een opgave-object (mogelijk een herhaling als het echt niet anders kan).
 */
export function genereerUniekeOpgave(genereerEen, naarSleutel, gebruikteSleutels, maxPogingen = 200) {
  let opgave = genereerEen();
  let pogingen = 0;
  while (gebruikteSleutels.has(naarSleutel(opgave)) && pogingen < maxPogingen) {
    opgave = genereerEen();
    pogingen += 1;
  }
  gebruikteSleutels.add(naarSleutel(opgave));
  return opgave;
}

// Test voor de robot-regels en alle levels.
// Draai: node js/exercises/robot/test/test.mjs
import { LEVELS, NIVEAUS_GROEP4, NIVEAUS_GROEP8 } from "../levels.js";
import { maakWereld, doeStap, ontplof, zoekKortsteRoute } from "../regels.js";

let fouten = 0;
const check = (ok, tekst) => { if (!ok) { fouten += 1; console.log("FOUT:", tekst); } };
const cel = (row, col) => ({ row, col });
const kleinLevel = (extra) => ({ size: 8, robot: cel(0, 0), target: cel(7, 7), obstacles: [], coins: [], ...extra });

// --- regels ----------------------------------------------------------------
{
  // TNT blaast alleen zwakke muurtjes binnen straal 1 (3x3) op, stevige muren niet
  const w = maakWereld(kleinLevel({
    tnt: [cel(3, 3)],
    muurtjes: [cel(2, 2), cel(3, 4), cel(4, 3), cel(1, 3), cel(3, 5)], // laatste twee liggen op afstand 2
    obstacles: [cel(4, 4)],
  }));
  const ev = ontplof(w, 3, 3);
  check(ev.length === 1, "één TNT = één ontploffing");
  check(w.muurtjes.size === 2 && w.muurtjes.has("1,3") && w.muurtjes.has("3,5"), "alleen muurtjes binnen straal 1 verdwijnen");
  check(w.stenen.has("4,4"), "stevige muur blijft staan");
}
{
  // kettingreactie
  const w = maakWereld(kleinLevel({ tnt: [cel(3, 1), cel(3, 2), cel(3, 3), cel(3, 6)], muurtjes: [cel(3, 4)] }));
  const ev = ontplof(w, 3, 1);
  check(ev.length === 3, `kettingreactie: 3 TNT (was ${ev.length})`);
  check(w.tnt.size === 1 && w.tnt.has("3,6"), "TNT op afstand blijft liggen");
  check(!w.muurtjes.has("3,4"), "muurtje aan het eind van de lont is weg");
}
{
  // munten in de straal gaan kapot, ver weg niet; robot blijft heel
  const w = maakWereld(kleinLevel({ tnt: [cel(0, 1)], coins: [cel(1, 1), cel(5, 5)] }));
  const r = doeStap(w, "RIGHT");
  check(r.ontploffingen.length === 1 && r.botsing === null, "stappen op TNT laat hem ontploffen");
  check(w.munten.size === 1 && w.kapot === 1, "munt in straal kapot");
  check(w.robot.row === 0 && w.robot.col === 1, "robot blijft staan");
}
{
  // botsen: muurtje, steen, rand
  const w = maakWereld(kleinLevel({ muurtjes: [cel(0, 1)], obstacles: [cel(1, 0)] }));
  check(doeStap(w, "RIGHT").botsing === "muurtje", "botsen tegen muurtje");
  check(doeStap(w, "DOWN").botsing === "steen", "botsen tegen steen");
  check(doeStap(w, "UP").botsing === "rand", "botsen tegen de rand");
  check(doeStap(w, "BOEM").botsing === "onbekend", "onbekend commando");
}

// --- levels ------------------------------------------------------------------
const ids = LEVELS.map((l) => l.id);
check(new Set(ids).size === ids.length, "level-id's zijn uniek");
check(NIVEAUS_GROEP4.every((i) => ids.includes(i)) && NIVEAUS_GROEP8.every((i) => ids.includes(i)), "levellijsten verwijzen naar bestaande levels");

for (const level of LEVELS) {
  const naam = `level ${level.id} (${level.name})`;
  const zonderMunten = zoekKortsteRoute(level);
  check(zonderMunten !== null, `${naam}: onoplosbaar`);
  const alle = zoekKortsteRoute(level, { alleMunten: true });
  if (level.id >= 13) {
    // alleen de nieuwe TNT-levels: strenger controleren
    check(alle !== null, `${naam}: niet alle munten haalbaar`);
    check(alle && alle.stappen === level.minSteps, `${naam}: minSteps ${level.minSteps} klopt niet (oplosser: ${alle?.stappen})`);
    check(zoekKortsteRoute(level, { negeerTnt: true }) === null, `${naam}: te halen zonder TNT`);
    check(level.tnt.length > 0 && level.muurtjes.length > 0, `${naam}: mist TNT of muurtjes`);
  } else if (alle === null) {
    console.log(`(opmerking: ${naam}: niet alle munten haalbaar)`);
  }
}

console.log(fouten === 0 ? `Alle tests geslaagd (${LEVELS.length} levels).` : `${fouten} fout(en).`);
process.exit(fouten === 0 ? 0 : 1);

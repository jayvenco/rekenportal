// Test voor de tijdlogica van Klok lezen. Draai: node js/exercises/klok-lezen/test/test.mjs
import {
  normaliseer, uurVan, minuutVan, uur12, minuutHoek, uurHoek, sleepMinuutwijzer, sleepUurwijzer,
  hoekVanPunt, verschuifUren, tijdInWoorden, urenEnMinuten, uitlegMinuutwijzer, uitlegUurwijzer,
  dagdeel, digitaal, maakKlokStore, hoeken,
} from "../tijd.js";

let fouten = 0;
const gelijk = (a, b, tekst) => { if (a !== b) { fouten += 1; console.log(`FOUT: ${tekst}: verwacht ${JSON.stringify(b)}, kreeg ${JSON.stringify(a)}`); } };
const t = (u, m) => u * 60 + m;

// normaliseren en delen
gelijk(normaliseer(-1), 1439, "min 1 minuut = 23:59");
gelijk(normaliseer(1440), 0, "24:00 = 0:00");
gelijk(uur12(t(0, 0)), 12, "0:00 staat op 12");
gelijk(uur12(t(15, 0)), 3, "15:00 staat op 3");
gelijk(uurVan(t(15, 7)), 15, "uur van 15:07");
gelijk(minuutVan(t(15, 7)), 7, "minuut van 15:07");

// wijzers
gelijk(minuutHoek(t(3, 15)), 90, "minuutwijzer bij kwart over");
gelijk(minuutHoek(t(3, 30)), 180, "minuutwijzer bij half");
gelijk(uurHoek(t(3, 0)), 90, "uurwijzer om 3 uur");
gelijk(uurHoek(t(3, 30)), 105, "uurwijzer om half 4");
gelijk(uurHoek(t(12, 0)), 0, "uurwijzer om 12 uur");
gelijk(uurHoek(t(15, 0)), 90, "uurwijzer om 15:00");
gelijk(Math.round(hoeken(t(3, 30)).uur), 105, "zachte hoeken");

// tijd in woorden (zoals je het zegt)
const woorden = [
  [t(3, 0), "3 uur"], [t(3, 5), "5 over 3"], [t(3, 10), "10 over 3"], [t(3, 15), "kwart over 3"],
  [t(3, 20), "10 voor half 4"], [t(3, 25), "5 voor half 4"], [t(3, 30), "half 4"], [t(3, 35), "5 over half 4"],
  [t(3, 40), "10 over half 4"], [t(3, 45), "kwart voor 4"], [t(3, 50), "10 voor 4"], [t(3, 55), "5 voor 4"],
  [t(11, 30), "half 12"], [t(12, 30), "half 1"], [t(0, 45), "kwart voor 1"], [t(23, 45), "kwart voor 12"],
  [t(3, 7), "7 minuten over 3"], [t(3, 1), "1 minuut over 3"], [t(3, 53), "7 minuten voor 4"], [t(3, 59), "1 minuut voor 4"],
];
for (const [tijd, verwacht] of woorden) gelijk(tijdInWoorden(tijd), verwacht, `woorden bij ${Math.floor(tijd / 60)}:${minuutVan(tijd)}`);
gelijk(urenEnMinuten(t(3, 15)), "3 uur en 15 minuten", "uren en minuten");
gelijk(urenEnMinuten(t(3, 0)), "3 uur", "alleen uren");

// uitleg
gelijk(uitlegMinuutwijzer(t(3, 15)).includes("naar de 3. Dat is 15 minuten (een kwartier)"), true, "uitleg kwartier");
gelijk(uitlegMinuutwijzer(t(3, 0)).includes("naar de 12"), true, "uitleg 12");
gelijk(uitlegMinuutwijzer(t(3, 17)).includes("tussen de 3 en de 4"), true, "uitleg tussen twee cijfers");
gelijk(uitlegUurwijzer(t(3, 30)).includes("tussen de 3 en de 4"), true, "uitleg uurwijzer half");

// slepen aan de minuutwijzer: het uur loopt mee over de 12
gelijk(sleepMinuutwijzer(t(3, 58), 2), t(4, 2), "vooruit over de 12");
gelijk(sleepMinuutwijzer(t(3, 2), 58), t(2, 58), "achteruit over de 12");
gelijk(sleepMinuutwijzer(t(3, 20), 25), t(3, 25), "gewoon verder");
gelijk(sleepMinuutwijzer(t(23, 58), 3), t(0, 3), "over middernacht vooruit");
gelijk(sleepMinuutwijzer(t(0, 2), 57), t(23, 57), "over middernacht achteruit");
// slepen aan de uurwijzer: hoek bepaalt de tijd, dagdeel blijft
gelijk(sleepUurwijzer(t(15, 0), 90), t(15, 0), "uurwijzer op de 3, middag");
gelijk(sleepUurwijzer(t(3, 0), 105), t(3, 30), "uurwijzer op 105 graden");
gelijk(sleepUurwijzer(t(14, 0), 359.9), t(12, 0), "uurwijzer rond de 12 blijft in de middag");
gelijk(Math.round(hoekVanPunt(0, -10)), 0, "boven");
gelijk(Math.round(hoekVanPunt(10, 0)), 90, "rechts");
gelijk(Math.round(hoekVanPunt(0, 10)), 180, "onder");
gelijk(Math.round(hoekVanPunt(-10, 0)), 270, "links");

// 1 tot 10 uur vooruit en achteruit
for (let n = 1; n <= 10; n += 1) {
  gelijk(verschuifUren(t(3, 15), n), normaliseer(t(3, 15) + n * 60), `+${n} uur`);
  gelijk(minuutVan(verschuifUren(t(3, 15), -n)), 15, `-${n} uur houdt de minuten`);
}
gelijk(verschuifUren(t(3, 0), 10), t(13, 0), "3 uur + 10 uur = 13:00");
gelijk(verschuifUren(t(3, 0), -10), t(17, 0), "3:00 - 10 uur = 17:00 (gisteren)");
gelijk(verschuifUren(t(23, 0), 3), t(2, 0), "23:00 + 3 uur = 2:00");

// dagdeel en digitaal
gelijk(dagdeel(t(3, 0)).naam, "'s nachts", "nacht");
gelijk(dagdeel(t(9, 0)).naam, "'s ochtends", "ochtend");
gelijk(dagdeel(t(14, 0)).naam, "'s middags", "middag");
gelijk(dagdeel(t(20, 0)).naam, "'s avonds", "avond");
gelijk(JSON.stringify(digitaal(t(15, 5), true)), JSON.stringify({ uren: "15", minuten: "05" }), "digitaal 24 uur");
gelijk(JSON.stringify(digitaal(t(15, 5), false)), JSON.stringify({ uren: "3", minuten: "05" }), "digitaal 12 uur");

// store
{
  const store = maakKlokStore(t(3, 0));
  const gezien = [];
  const stop = store.abonneer((tijd, bron) => gezien.push([tijd, bron]));
  store.zet(t(3, 5), "test");
  store.zet(t(3, 5), "test"); // dezelfde tijd: geen melding
  store.zet(t(3, 6));
  stop();
  store.zet(t(4, 0));
  gelijk(gezien.length, 2, "store meldt alleen echte veranderingen en stopt na afmelden");
  gelijk(store.get(), t(4, 0), "store houdt de tijd bij");
}

console.log(fouten === 0 ? "Alle tests geslaagd." : `${fouten} fout(en).`);
process.exit(fouten === 0 ? 0 : 1);

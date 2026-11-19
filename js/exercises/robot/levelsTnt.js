// exercises/robot/levelsTnt.js
// -----------------------------------------------------------------------------
// TNT-levels voor het Robot Programmeer Spel. Elk level is een 8x8-kaartje:
//   S start   G doel   # stevige muur   W zwak muurtje   T TNT   c munt   . leeg
// Levels 13-16: pijltjesmodus (groep 4). Levels 17-22: codemodus (groep 8).
// minSteps = kortste route naar het doel mét alle munten (berekend door de
// oplosser; test/test.mjs controleert dat het klopt).
// -----------------------------------------------------------------------------

function uitKaart(id, name, mode, rijen, minSteps) {
  const level = { id, name, size: 8, robot: null, target: null, obstacles: [], muurtjes: [], tnt: [], coins: [], minSteps, mode };
  rijen.forEach((tekst, row) => {
    [...tekst].forEach((teken, col) => {
      const cel = { row, col };
      if (teken === "S") level.robot = cel;
      else if (teken === "G") level.target = cel;
      else if (teken === "#") level.obstacles.push(cel);
      else if (teken === "W") level.muurtjes.push(cel);
      else if (teken === "T") level.tnt.push(cel);
      else if (teken === "c") level.coins.push(cel);
    });
  });
  return level;
}

export const TNT_LEVELS = [
  // ── Groep 4: pijltjes ────────────────────────────────────────────────
  uitKaart(13, "Boem! De eerste TNT", "arrows", [
    "S...#...",
    "....#...",
    "....#...",
    "...TW..G",
    "....W...",
    "....#...",
    "....#...",
    "....#...",
  ], 10),
  uitKaart(14, "Dubbel boem", "arrows", [
    "S.......",
    "........",
    "...#####",
    "..TWTW.G",
    "...#####",
    "........",
    ".c......",
    "........",
  ], 16),
  uitKaart(15, "Eerst de munt!", "arrows", [
    "S.......",
    "........",
    "..######",
    "..TW...G",
    "..c#####",
    "........",
    "........",
    "........",
  ], 12),
  uitKaart(16, "Kettingreactie", "arrows", [
    "S.......",
    "c.......",
    "..######",
    "..TTTTWG",
    "..######",
    "........",
    "........",
    "........",
  ], 10),
  // ── Groep 8: code ────────────────────────────────────────────────────
  uitKaart(17, "Het fort", "code", [
    "S.......",
    "........",
    "..c#####",
    "..T#.W.#",
    "..cWTWG#",
    "...#.W.#",
    "...#####",
    "........",
  ], 14),
  uitKaart(18, "De lange weg", "code", [
    "S.#.....",
    "#.#.###.",
    "....#...",
    "#####.##",
    "...c.TWG",
    "########",
    "########",
    "########",
  ], 23),
  uitKaart(19, "Voorzichtig met munten", "code", [
    "S.......",
    "........",
    "..c#####",
    "..TWcTWG",
    "..c#####",
    "........",
    "........",
    "........",
  ], 14),
  uitKaart(20, "De slang", "code", [
    "S.....c#",
    "######.#",
    "...c...#",
    ".#######",
    "...TWTWG",
    "########",
    "########",
    "########",
  ], 23),
];

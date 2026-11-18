// exercises/codeblokken/editor.js
// -----------------------------------------------------------------------------
// De blokken-editor van Code-blokken: een toolbox met puzzelblokken, een werkvlak
// waar de blokken onder elkaar vastklikken, een prullenbak en (voor gevorderden)
// herhaal-blokken en functies. Slepen werkt met muis en vinger (pointer-events);
// tikken op een blok in de toolbox zet het onderaan het actieve programma.
// -----------------------------------------------------------------------------

import { nieuwId, telBlokken } from "./engine.js";

const BLOK = {
  up: { kleur: "#1fb5c4", letter: "N", pijl: "↑", naam: "omhoog" },
  down: { kleur: "#1fb5c4", letter: "Z", pijl: "↓", naam: "omlaag" },
  left: { kleur: "#1fb5c4", letter: "W", pijl: "←", naam: "naar links" },
  right: { kleur: "#1fb5c4", letter: "O", pijl: "→", naam: "naar rechts" },
  fwd: { kleur: "#1fb5c4", pijl: "↑", tekst: "vooruit" },
  tl: { kleur: "#f0a030", pijl: "↺", tekst: "draai links" },
  tr: { kleur: "#f0a030", pijl: "↻", tekst: "draai rechts" },
  walk: { kleur: "#1fb5c4", pijl: "🚶", tekst: "loop" },
  jump: { kleur: "#e0653d", pijl: "🦘", tekst: "spring" },
  shoot: { kleur: "#d6457a", pijl: "💥", tekst: "schiet" },
  build: { kleur: "#8a6bd1", pijl: "🧱", tekst: "bouw" },
  repeat: { kleur: "#9b59d0", pijl: "🔁", tekst: "herhaal" },
  callA: { kleur: "#e8b923", pijl: "🅰️", tekst: "functie A" },
  callB: { kleur: "#e8b923", pijl: "🅱️", tekst: "functie B" },
};

const TEKST = {
  up: "ga omhoog", down: "ga omlaag", left: "ga naar links", right: "ga naar rechts",
  fwd: "vooruit", tl: "draai links", tr: "draai rechts",
  walk: "loop", jump: "spring", shoot: "schiet", build: "bouw",
};

export function voegStijlToe() {
  if (document.getElementById("cb-stijl")) return;
  const s = document.createElement("style");
  s.id = "cb-stijl";
  s.textContent = `
  .cb{--werkvlak:#f7fafc;display:flex;flex-direction:column;gap:12px}
  .cb-bovenrij{display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:16px;align-items:start}
  .cb-bovenrij--platform{grid-template-columns:minmax(0,1fr)}
  @media (max-width:820px){.cb-bovenrij{grid-template-columns:minmax(0,1fr)}}
  .cb-links{display:flex;flex-direction:column;gap:10px}
  .cb-knoppen{display:flex;gap:10px;flex-wrap:wrap}
  .cb-knop{flex:1;min-width:110px;border:0;border-radius:8px;padding:12px 18px;font-size:1.1rem;font-weight:800;color:#fff;background:#f08a1c;cursor:pointer;box-shadow:0 3px 0 #b8640f}
  .cb-knop:hover{background:#f59a36}
  .cb-knop:disabled{opacity:.5;cursor:default}
  .cb-knop--zacht{background:#8a97a8;box-shadow:0 3px 0 #5f6b7a}
  .cb-bericht{min-height:2.6em;padding:10px 12px;border-radius:12px;background:#fff;font-weight:700;color:#1f2937;border:2px solid #e3e8ef}
  .cb-bericht--goed{background:#e7f8ec;border-color:#9fdcb4;color:#14703a}
  .cb-bericht--fout{background:#fff1e6;border-color:#f3b987;color:#a24a07}
  .cb-editor{background:#fff;border-radius:12px;overflow:hidden;border:2px solid #cfd8e3}
  .cb-balk{display:flex;gap:0;background:#7a4bb8;color:#fff;font-weight:800;font-size:.95rem}
  .cb-balk > *{padding:10px 14px;border-right:1px solid rgba(255,255,255,.35)}
  .cb-balk .cb-balk-midden{flex:1}
  .cb-balk button{background:none;color:#fff;border:0;font:inherit;cursor:pointer}
  .cb-lichaam{display:flex;min-height:300px}
  .cb-toolbox{flex:0 0 130px;background:#e9edf3;padding:12px 10px;display:flex;flex-direction:column;gap:6px;border-right:2px solid #cfd8e3}
  .cb-toolbox-titel{font-size:.8rem;font-weight:800;color:#5b6676}
  .cb-werkvlak{position:relative;flex:1;background:var(--werkvlak);padding:12px 10px 16px;display:flex;flex-direction:column;gap:14px;min-width:0}
  .cb-prullenbak{position:absolute;right:10px;top:10px;width:48px;height:48px;border-radius:50%;background:#7a4bb8;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.4rem;z-index:2;transition:transform .15s}
  .cb-prullenbak--actief{transform:scale(1.25);background:#d6453a}
  .cb-stapel-titel{font-size:.8rem;font-weight:800;color:#5b6676;margin:0 0 4px 2px}
  .cb-stapel{width:max-content;min-width:170px;max-width:100%}
  .cb-lijst{display:flex;flex-direction:column;min-height:52px;border-radius:8px;padding:2px 0}
  .cb-lijst:empty::before{content:attr(data-leeg);color:#8a97a8;font-size:.85rem;font-weight:700;border:2px dashed #c3cedc;border-radius:8px;padding:12px;display:block;text-align:center}
  .cb-lijst--actief{outline:3px solid rgba(122,75,184,.35);outline-offset:3px}
  .cb-blok{position:relative;display:flex;align-items:center;gap:8px;min-height:46px;padding:6px 14px 6px 12px;margin-top:-1px;background:var(--k);color:#fff;font-weight:800;font-size:1rem;border-radius:7px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);user-select:none;-webkit-user-select:none;touch-action:none;cursor:grab;z-index:1}
  .cb-blok::before{content:"";position:absolute;left:16px;top:0;width:22px;height:7px;background:var(--achter,var(--werkvlak));border-radius:0 0 7px 7px}
  .cb-blok::after{content:"";position:absolute;left:16px;bottom:-7px;width:22px;height:8px;background:var(--k);border-radius:0 0 7px 7px;z-index:2}
  .cb-toolbox .cb-blok{--achter:#e9edf3;margin-top:0;margin-bottom:8px}
  .cb-letter{font-size:.8rem;opacity:.95;min-width:1.1em}
  .cb-pijl{font-size:1.9rem;line-height:1;font-weight:900;margin-left:auto}
  .cb-pijl--klein{font-size:1.25rem;margin-left:0}
  .cb-pijl + .cb-x{margin-left:6px}
  .cb-x{margin-left:auto;background:rgba(0,0,0,.18);color:#fff;border:0;border-radius:50%;width:22px;height:22px;line-height:22px;padding:0;font-size:.8rem;cursor:pointer}
  .cb-repeat{display:block;padding:0;background:none;box-shadow:none;cursor:grab}
  .cb-repeat::before,.cb-repeat::after{display:none}
  .cb-repeat-kop{position:relative;display:flex;align-items:center;gap:8px;min-height:44px;padding:6px 12px;background:var(--k);border-radius:7px 7px 0 0;box-shadow:inset 0 -3px 0 rgba(0,0,0,.12)}
  .cb-repeat-kop::before{content:"";position:absolute;left:16px;top:0;width:22px;height:7px;background:var(--achter,var(--werkvlak));border-radius:0 0 7px 7px}
  .cb-n{background:#fff;color:var(--k);border:0;border-radius:8px;min-width:34px;height:30px;font-weight:900;font-size:1rem;cursor:pointer}
  .cb-repeat-binnen{margin-left:0;padding:4px 0 0 18px;background:var(--k)}
  .cb-repeat-binnen .cb-lijst{background:var(--werkvlak);border-radius:6px 0 0 6px;padding:4px 6px 12px 6px;min-width:150px}
  .cb-repeat-voet{height:14px;background:var(--k);border-radius:0 0 7px 7px;position:relative}
  .cb-repeat-voet::after{content:"";position:absolute;left:16px;bottom:-7px;width:22px;height:8px;background:var(--k);border-radius:0 0 7px 7px}
  .cb-actief{filter:brightness(1.18);box-shadow:0 0 0 3px #ffd84d, inset 0 -3px 0 rgba(0,0,0,.18) !important;z-index:3}
  .cb-hoed{display:inline-block;background:#f0a030;color:#fff;font-weight:800;font-size:.85rem;border-radius:14px 14px 0 0;padding:3px 12px;margin-bottom:-2px;position:relative;z-index:2}
  .cb-hoed--functie{background:#e8b923}
  .cb-spook{position:fixed;pointer-events:none;z-index:10000;opacity:.92;filter:drop-shadow(0 6px 8px rgba(0,0,0,.3))}
  .cb-plek{height:10px;margin:2px 0;border-radius:5px;background:rgba(122,75,184,.45)}
  .cb-sleept{display:none !important}
  .cb-vergrendeld .cb-toolbox,.cb-vergrendeld .cb-stapel{pointer-events:none}
  .cb-vergrendeld .cb-toolbox{opacity:.6}
  .cb-teller{font-size:.9rem}
  .cb-teller--vol{color:#ffd84d}
  .cb-schud{animation:cb-schud .35s}
  @keyframes cb-schud{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
  .cb-code{margin:0;padding:10px 14px;background:#1f2937;color:#d6f5ff;font:13px/1.5 ui-monospace,Menlo,monospace;white-space:pre;overflow-x:auto}
  .cb-wereld{background:#fff}
  `;
  document.head.appendChild(s);
}

/** Maakt een nieuw blok van een bepaald type. */
function nieuwBlok(t) {
  if (t === "repeat") return { id: nieuwId(), t, n: 3, body: [] };
  return { id: nieuwId(), t };
}

/** Programma als leesbare tekst (voor "Toon code"). */
export function programmaTekst(programma) {
  const regels = [];
  const schrijf = (lijst, diepte) => {
    for (const b of lijst) {
      const sp = "  ".repeat(diepte);
      if (b.t === "repeat") {
        regels.push(`${sp}herhaal ${b.n} keer`);
        schrijf(b.body, diepte + 1);
      } else if (b.t === "callA" || b.t === "callB") {
        regels.push(`${sp}functie ${b.t === "callA" ? "A" : "B"}()`);
      } else {
        regels.push(`${sp}${TEKST[b.t] || b.t}`);
      }
    }
  };
  regels.push("als je op Start drukt:");
  schrijf(programma.main, 1);
  for (const f of ["A", "B"]) {
    if (programma[f]?.length) {
      regels.push("", `functie ${f}:`);
      schrijf(programma[f], 1);
    }
  }
  return regels.join("\n");
}

/**
 * @param {{level:Object, opVeranderd?:(programma:Object)=>void}} opties
 */
export function maakEditor({ level, opVeranderd }) {
  voegStijlToe();
  const functies = level.functies || [];
  const programma = { main: [], A: [], B: [] };
  let actief = "main";
  let vergrendeld = false;
  let codeZichtbaar = false;

  const element = document.createElement("div");
  element.className = "cb-editor";

  // --- balk ---
  const balk = document.createElement("div");
  balk.className = "cb-balk";
  const balkBlokjes = document.createElement("div");
  balkBlokjes.textContent = "Blokjes";
  balkBlokjes.style.flex = "0 0 130px";
  const balkMidden = document.createElement("div");
  balkMidden.className = "cb-balk-midden";
  balkMidden.textContent = "Zet je blokjes hier in elkaar";
  const teller = document.createElement("div");
  teller.className = "cb-teller";
  const codeKnop = document.createElement("button");
  codeKnop.type = "button";
  codeKnop.textContent = "Toon code";
  balk.append(balkBlokjes, balkMidden, teller, codeKnop);

  // --- lichaam ---
  const lichaam = document.createElement("div");
  lichaam.className = "cb-lichaam";
  const toolbox = document.createElement("div");
  toolbox.className = "cb-toolbox";
  const werkvlak = document.createElement("div");
  werkvlak.className = "cb-werkvlak";
  const prullenbak = document.createElement("div");
  prullenbak.className = "cb-prullenbak";
  prullenbak.setAttribute("aria-label", "Prullenbak: sleep een blokje hiernaartoe om het weg te halen");
  prullenbak.textContent = "🗑";
  werkvlak.appendChild(prullenbak);
  lichaam.append(toolbox, werkvlak);

  const codeVak = document.createElement("pre");
  codeVak.className = "cb-code";
  codeVak.style.display = "none";
  element.append(balk, lichaam, codeVak);

  codeKnop.addEventListener("click", () => {
    codeZichtbaar = !codeZichtbaar;
    codeKnop.textContent = codeZichtbaar ? "Verberg code" : "Toon code";
    codeVak.style.display = codeZichtbaar ? "block" : "none";
    werkCodeBij();
  });

  // ---------------------------------------------------------------------------
  // Model-hulpfuncties
  // ---------------------------------------------------------------------------
  function lijstVoor(sleutel, lijst = programma.main, via = null) {
    if (sleutel === "main" || sleutel === "A" || sleutel === "B") return programma[sleutel];
    const zoek = (l) => {
      for (const b of l) {
        if (b.id === sleutel) return b.body;
        if (b.body) {
          const r = zoek(b.body);
          if (r) return r;
        }
      }
      return null;
    };
    return zoek(programma.main) || zoek(programma.A) || zoek(programma.B);
  }

  function haalUit(id) {
    const zoek = (l) => {
      for (let i = 0; i < l.length; i += 1) {
        if (l[i].id === id) return l.splice(i, 1)[0];
        if (l[i].body) {
          const r = zoek(l[i].body);
          if (r) return r;
        }
      }
      return null;
    };
    return zoek(programma.main) || zoek(programma.A) || zoek(programma.B);
  }

  const aantal = () => telBlokken(programma);
  const kanErBijRaw = (extra) => level.max === null || level.max === undefined || aantal() + extra <= level.max;

  function werkTellerBij() {
    const n = aantal();
    teller.textContent = level.max == null ? `Blokjes: ${n}` : `Blokjes: ${n} / ${level.max}`;
    teller.classList.toggle("cb-teller--vol", level.max != null && n >= level.max);
  }
  function werkCodeBij() {
    if (codeZichtbaar) codeVak.textContent = programmaTekst(programma);
  }
  function veranderd() {
    render();
    werkTellerBij();
    werkCodeBij();
    opVeranderd?.(programma);
  }

  // ---------------------------------------------------------------------------
  // Tekenen
  // ---------------------------------------------------------------------------
  function blokInhoud(b, inToolbox) {
    const m = BLOK[b.t];
    const bron = document.createDocumentFragment();
    if (m.letter) {
      const l = document.createElement("span");
      l.className = "cb-letter";
      l.textContent = m.letter;
      bron.appendChild(l);
    }
    if (!m.letter) {
      const t = document.createElement("span");
      t.textContent = m.tekst;
      bron.appendChild(t);
    }
    const pijl = document.createElement("span");
    pijl.className = "cb-pijl" + (m.letter ? "" : " cb-pijl--klein");
    pijl.textContent = m.pijl;
    if (m.letter) bron.appendChild(pijl);
    else bron.insertBefore(pijl, bron.firstChild);
    if (!inToolbox) {
      const x = document.createElement("button");
      x.type = "button";
      x.className = "cb-x";
      x.textContent = "✕";
      x.setAttribute("aria-label", `Haal blokje ${m.tekst || m.naam} weg`);
      x.addEventListener("click", (e) => {
        e.stopPropagation();
        if (vergrendeld) return;
        haalUit(b.id);
        veranderd();
      });
      if (!m.letter) bron.appendChild(x);
      else bron.appendChild(x);
    }
    return bron;
  }

  function maakBlokEl(b, inToolbox = false) {
    const m = BLOK[b.t];
    const e = document.createElement("div");
    e.className = "cb-blok";
    e.dataset.id = b.id;
    e.dataset.t = b.t;
    e.style.setProperty("--k", m.kleur);
    e.setAttribute("role", "listitem");
    if (b.t === "repeat") {
      e.classList.add("cb-repeat");
      const kop = document.createElement("div");
      kop.className = "cb-repeat-kop";
      const ic = document.createElement("span");
      ic.className = "cb-pijl cb-pijl--klein";
      ic.textContent = m.pijl;
      const tx = document.createElement("span");
      tx.textContent = "herhaal";
      kop.append(ic, tx);
      if (inToolbox) {
        const n = document.createElement("span");
        n.textContent = "3×";
        kop.appendChild(n);
      } else {
        const n = document.createElement("button");
        n.type = "button";
        n.className = "cb-n";
        n.textContent = `${b.n}×`;
        n.setAttribute("aria-label", `Herhaal ${b.n} keer. Tik om te veranderen.`);
        n.addEventListener("click", (ev) => {
          ev.stopPropagation();
          if (vergrendeld) return;
          b.n = b.n >= 9 ? 2 : b.n + 1;
          veranderd();
        });
        kop.appendChild(n);
        const x = document.createElement("button");
        x.type = "button";
        x.className = "cb-x";
        x.textContent = "✕";
        x.setAttribute("aria-label", "Haal herhaal-blokje weg");
        x.addEventListener("click", (ev) => {
          ev.stopPropagation();
          if (vergrendeld) return;
          haalUit(b.id);
          veranderd();
        });
        kop.appendChild(x);
      }
      e.appendChild(kop);
      const binnen = document.createElement("div");
      binnen.className = "cb-repeat-binnen";
      if (inToolbox) {
        binnen.style.padding = "8px 0 0 18px";
        const leeg = document.createElement("div");
        leeg.style.cssText = "height:22px;background:var(--werkvlak);border-radius:6px 0 0 6px";
        binnen.appendChild(leeg);
      } else {
        const lijst = maakLijstEl(b.id, b.body, "Sleep blokjes hierin");
        binnen.appendChild(lijst);
      }
      e.appendChild(binnen);
      const voet = document.createElement("div");
      voet.className = "cb-repeat-voet";
      e.appendChild(voet);
      return e;
    }
    e.appendChild(blokInhoud(b, inToolbox));
    return e;
  }

  function maakLijstEl(sleutel, lijst, leegTekst) {
    const l = document.createElement("div");
    l.className = "cb-lijst";
    l.dataset.lijst = sleutel;
    l.dataset.leeg = leegTekst;
    l.setAttribute("role", "list");
    if (sleutel === actief) l.classList.add("cb-lijst--actief");
    for (const b of lijst) l.appendChild(maakBlokEl(b));
    return l;
  }

  function render() {
    // werkvlak
    werkvlak.querySelectorAll(".cb-stapel").forEach((e) => e.remove());
    const stapels = [["main", "Als je op Start drukt:", "cb-hoed", "Sleep blokjes hierheen"]];
    for (const f of functies) stapels.push([f, `Functie ${f}:`, "cb-hoed cb-hoed--functie", `Sleep blokjes in functie ${f}`]);
    for (const [sleutel, titel, hoedKlasse, leeg] of stapels) {
      const stapel = document.createElement("div");
      stapel.className = "cb-stapel";
      const hoed = document.createElement("div");
      hoed.className = hoedKlasse;
      hoed.textContent = titel;
      hoed.dataset.lijst = sleutel;
      stapel.append(hoed, maakLijstEl(sleutel, programma[sleutel], leeg));
      werkvlak.appendChild(stapel);
    }
  }

  function bouwToolbox() {
    toolbox.textContent = "";
    const titel = document.createElement("div");
    titel.className = "cb-toolbox-titel";
    titel.textContent = "Sleep of tik";
    toolbox.appendChild(titel);
    for (const t of level.blokken) {
      const e = maakBlokEl({ id: `tpl-${t}`, t, n: 3 }, true);
      e.dataset.sjabloon = t;
      e.setAttribute("aria-label", `Blokje ${BLOK[t].tekst || BLOK[t].naam}. Sleep het naar het werkvlak of tik erop.`);
      toolbox.appendChild(e);
    }
  }

  // ---------------------------------------------------------------------------
  // Toevoegen / slepen
  // ---------------------------------------------------------------------------
  function weiger() {
    teller.classList.remove("cb-schud");
    void teller.offsetWidth;
    teller.classList.add("cb-schud");
    teller.classList.add("cb-teller--vol");
  }

  function voegToe(t, sleutel, index) {
    if (!kanErBijRaw(1)) {
      weiger();
      return false;
    }
    const lijst = lijstVoor(sleutel) || programma.main;
    const b = nieuwBlok(t);
    lijst.splice(index == null ? lijst.length : index, 0, b);
    if (b.t === "repeat") actief = b.id;
    veranderd();
    return true;
  }

  let sleep = null;
  element.addEventListener("pointerdown", (e) => {
    if (vergrendeld || e.button > 0) return;
    if (e.target.closest("button")) return;
    const blokEl = e.target.closest(".cb-blok");
    const lijstEl = e.target.closest(".cb-lijst");
    const hoedEl = e.target.closest(".cb-hoed");
    if (hoedEl) {
      actief = hoedEl.dataset.lijst;
      render();
      return;
    }
    // Een tik op een lijst binnen een herhaal-blok (lege ruimte) hoort bij die binnenste lijst.
    if (!blokEl || (lijstEl && blokEl.contains(lijstEl))) {
      if (lijstEl) {
        actief = lijstEl.dataset.lijst;
        render();
      }
      return;
    }
    const sjabloon = blokEl.dataset.sjabloon || null;
    sleep = {
      blokEl, sjabloon, id: blokEl.dataset.id, startX: e.clientX, startY: e.clientY,
      bezig: false, spook: null, plek: null, doelLijst: null, inPrullenbak: false, pointerId: e.pointerId,
    };
    e.preventDefault();
  });

  function maakPlek(lijstEl, y) {
    const kinderen = [...lijstEl.children].filter((c) => c.classList.contains("cb-blok") && !c.classList.contains("cb-sleept"));
    let index = kinderen.length;
    for (let i = 0; i < kinderen.length; i += 1) {
      const r = kinderen[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        index = i;
        break;
      }
    }
    return { index, voor: kinderen[index] || null };
  }

  function bijVerplaatsen(e) {
    if (!sleep) return;
    const dx = e.clientX - sleep.startX;
    const dy = e.clientY - sleep.startY;
    if (!sleep.bezig && Math.hypot(dx, dy) < 6) return;
    if (!sleep.bezig) {
      sleep.bezig = true;
      const r = sleep.blokEl.getBoundingClientRect();
      sleep.offX = sleep.startX - r.left;
      sleep.offY = sleep.startY - r.top;
      const spook = sleep.blokEl.cloneNode(true);
      spook.classList.add("cb-spook");
      spook.classList.remove("cb-actief");
      spook.style.width = `${r.width}px`;
      spook.querySelectorAll("button").forEach((b) => b.remove());
      document.body.appendChild(spook);
      sleep.spook = spook;
      if (!sleep.sjabloon) sleep.blokEl.classList.add("cb-sleept");
    }
    sleep.spook.style.left = `${e.clientX - sleep.offX}px`;
    sleep.spook.style.top = `${e.clientY - sleep.offY}px`;

    const onder = document.elementsFromPoint(e.clientX, e.clientY);
    const prul = onder.find((n) => n === prullenbak || n.closest?.(".cb-toolbox"));
    sleep.inPrullenbak = Boolean(prul) && !sleep.sjabloon;
    prullenbak.classList.toggle("cb-prullenbak--actief", sleep.inPrullenbak);

    const lijstEl = sleep.inPrullenbak ? null : onder.map((n) => n.closest?.(".cb-lijst")).find((l) => l && !l.closest(".cb-sleept") && l.closest(".cb-werkvlak"));
    sleep.plek?.remove();
    sleep.plek = null;
    sleep.doelLijst = null;
    if (lijstEl) {
      const { index, voor } = maakPlek(lijstEl, e.clientY);
      const plek = document.createElement("div");
      plek.className = "cb-plek";
      if (voor) lijstEl.insertBefore(plek, voor);
      else lijstEl.appendChild(plek);
      sleep.plek = plek;
      sleep.doelLijst = { sleutel: lijstEl.dataset.lijst, index };
    }
  }

  function bijLoslaten() {
    if (!sleep) return;
    const s = sleep;
    sleep = null;
    s.plek?.remove();
    s.spook?.remove();
    prullenbak.classList.remove("cb-prullenbak--actief");
    if (!s.bezig) {
      // tik
      if (s.sjabloon) voegToe(s.sjabloon, actief, null);
      else {
        const lijstEl = s.blokEl.closest(".cb-lijst");
        if (lijstEl) {
          actief = lijstEl.dataset.lijst;
          render();
        }
      }
      return;
    }
    if (s.sjabloon) {
      if (s.doelLijst) voegToe(s.sjabloon, s.doelLijst.sleutel, s.doelLijst.index);
      return;
    }
    // bestaand blok verplaatsen of weggooien
    s.blokEl.classList.remove("cb-sleept");
    if (s.inPrullenbak) {
      haalUit(s.id);
      veranderd();
    } else if (s.doelLijst) {
      const blok = haalUit(s.id);
      if (blok) {
        const lijst = lijstVoor(s.doelLijst.sleutel) || programma.main;
        lijst.splice(Math.min(s.doelLijst.index, lijst.length), 0, blok);
        actief = s.doelLijst.sleutel;
      }
      veranderd();
    } else {
      render();
    }
  }

  document.addEventListener("pointermove", bijVerplaatsen);
  document.addEventListener("pointerup", bijLoslaten);
  document.addEventListener("pointercancel", bijLoslaten);

  // ---------------------------------------------------------------------------
  // Publieke API
  // ---------------------------------------------------------------------------
  bouwToolbox();
  render();
  werkTellerBij();

  return {
    element,
    getProgramma: () => programma,
    tel: aantal,
    zetProgramma(p) {
      programma.main = p.main || [];
      programma.A = p.A || [];
      programma.B = p.B || [];
      actief = "main";
      veranderd();
    },
    wis() {
      programma.main = [];
      programma.A = [];
      programma.B = [];
      actief = "main";
      veranderd();
    },
    vergrendel(waar) {
      vergrendeld = waar;
      element.classList.toggle("cb-vergrendeld", waar);
    },
    markeer(pad = []) {
      element.querySelectorAll(".cb-actief").forEach((n) => n.classList.remove("cb-actief"));
      for (const id of pad) element.querySelectorAll(`[data-id="${id}"]`).forEach((n) => n.classList.add("cb-actief"));
    },
    ruimOp() {
      document.removeEventListener("pointermove", bijVerplaatsen);
      document.removeEventListener("pointerup", bijLoslaten);
      document.removeEventListener("pointercancel", bijLoslaten);
    },
  };
}

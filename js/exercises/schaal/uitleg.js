// exercises/schaal/uitleg.js
// -----------------------------------------------------------------------------
// Uitlegpagina "Rekenen op schaal": wat een schaal is, omrekenen van eenheden,
// van tekening naar echt (vermenigvuldigen), van echt naar tekening (delen),
// de schaal bepalen en schaalmodellen aflezen met een liniaal.
// -----------------------------------------------------------------------------

import { afbeeldingSvg } from "./afbeeldingen.js";
import { voegSchaalStijlToe, tabelHtml } from "./stijl.js";

function sectie(titel, inhoud) {
  return `<section class="sch-sectie"><h2>${titel}</h2>${inhoud}</section>`;
}

const PLAT = { soort: "plattegrond", maten: { A: 8, B: 3.5, C: 12 }, seed: 11, schaal: 50 };
const KAART = { soort: "kaart", seed: 5, van: "Huis van Anne", naar: "School", afstand: 8, schaal: 25000 };
const MODEL = { soort: "liniaal", model: "auto", lengte: 9, schaal: 40 };

/**
 * @param {HTMLElement} container
 * @param {Function} opTerug
 * @param {Function} opStart
 */
export function toonUitleg(container, opTerug, opStart) {
  voegSchaalStijlToe();
  container.innerHTML = "";
  const kaart = document.createElement("div");
  kaart.className = "kaart sch-uitleg";

  kaart.innerHTML = `
    <h1>Rekenen op schaal: zo werkt het 📐</h1>
    <p>Een plattegrond, een kaart of een speelgoedauto is <strong>veel kleiner</strong> dan het echte ding. De <strong>schaal</strong> vertelt hoeveel kleiner. Daarmee reken je uit hoe groot het in het echt is.</p>

    ${sectie("1. Wat betekent een schaal?", `
      <div class="sch-rij">
        <div>${afbeeldingSvg(KAART)}</div>
        <div>
          <p>Bij deze kaart staat <strong>Schaal 1 : 25 000</strong>.</p>
          <p>Dat betekent: <strong>1 cm</strong> op de kaart is <strong>25 000 cm</strong> in het echt.</p>
          ${tabelHtml([["Op de kaart", "In het echt"], ["1 cm", "25 000 cm"], ["2 cm", "50 000 cm"], ["8 cm", "200 000 cm"]])}
          <div class="sch-tip">💡 Het eerste getal (1) hoort bij de <b>tekening</b>. Het tweede getal hoort bij de <b>werkelijkheid</b>.</div>
        </div>
      </div>`)}

    ${sectie("2. Eerst goed omrekenen: cm, meter en kilometer", `
      <p>Je rekent met een schaal altijd eerst in <strong>centimeters</strong>. Daarna reken je om naar de eenheid die in de vraag staat.</p>
      ${tabelHtml([["Eenheid", "Is hetzelfde als"], ["1 meter", "100 cm"], ["1 kilometer", "1000 meter = 100 000 cm"]])}
      <ul>
        <li>cm → meter: <span class="sch-som">: 100</span></li>
        <li>meter → km: <span class="sch-som">: 1000</span></li>
        <li>cm → km: <span class="sch-som">: 100 000</span> (laat 5 nullen weg)</li>
      </ul>
      <div class="sch-tip">💡 Bij <b>1 : 100</b> worden cm gewoon meters: 6 cm op de tekening is 6 meter. Bij <b>1 : 100 000</b> worden cm kilometers: 3 cm is 3 km.</div>`)}

    ${sectie("3. Van tekening naar echt: vermenigvuldigen", `
      <div class="sch-rij">
        <div>${afbeeldingSvg(PLAT)}</div>
        <div>
          <p><strong>Hoe lang is muur A in het echt?</strong> Op de plattegrond is muur A 8 cm. De schaal is 1 : 50.</p>
          <ol>
            <li>1 cm op de plattegrond is 50 cm in het echt.</li>
            <li>Dus 8 cm × 50 = <strong>400 cm</strong>.</li>
            <li>Omrekenen naar meters: 400 : 100 = <strong>4 meter</strong>.</li>
          </ol>
          ${tabelHtml([["Op de plattegrond", "In het echt"], ["1 cm", "50 cm"], ["8 cm <b style='color:#e0533d'>(× 50)</b>", "400 cm = 4 m <b style='color:#e0533d'>(× 50)</b>"]])}
        </div>
      </div>
      <div class="sch-tip">💡 Muur B is 3,5 cm: 3,5 × 50 = 175 cm = <b>1,75 meter</b>.</div>`)}

    ${sectie("4. Afstanden op een kaart", `
      <p><strong>Op de kaart (1 : 25 000) is de afstand van huis naar school 8 cm. Hoe ver is dat in het echt?</strong></p>
      <ol>
        <li>8 cm × 25 000 = <strong>200 000 cm</strong>.</li>
        <li>200 000 cm : 100 = <strong>2000 meter</strong>.</li>
        <li>2000 meter : 1000 = <strong>2 kilometer</strong>.</li>
      </ol>
      <div class="sch-tip">💡 Wil je het in kilometers? Laat in één keer vijf nullen weg: 200 000 cm → <b>2 km</b>.</div>`)}

    ${sectie("5. Van echt naar tekening: delen", `
      <p>Soms weet je hoe groot iets echt is en moet je weten hoe groot het op de tekening is. De tekening is <strong>kleiner</strong>, dus je <strong>deelt</strong>.</p>
      <p><strong>Een kamer is 6 meter lang. Hoe lang is die op een plattegrond van 1 : 50?</strong></p>
      <ol>
        <li>6 meter = <strong>600 cm</strong> (× 100).</li>
        <li>600 cm : 50 = <strong>12 cm</strong> op de plattegrond.</li>
      </ol>
      ${tabelHtml([["Op de plattegrond", "In het echt"], ["1 cm", "50 cm"], ["<b>12 cm</b> <b style='color:#e0533d'>(: 50)</b>", "600 cm = 6 m <b style='color:#e0533d'>(: 50)</b>"]])}
      <div class="sch-tip">💡 Controle: 12 × 50 = 600 ✔. Echt is altijd een <b>groter</b> getal dan op de tekening (als je in dezelfde eenheid rekent).</div>`)}

    ${sectie("6. De schaal zelf bepalen", `
      <p><strong>Een muur is op de tekening 4 cm. In het echt is de muur 2 meter. Wat is de schaal?</strong></p>
      <ol>
        <li>2 meter = <strong>200 cm</strong>.</li>
        <li>4 cm op de tekening is 200 cm in het echt.</li>
        <li>Deel: 200 : 4 = <strong>50</strong>. Dus 1 cm op de tekening is 50 cm in het echt.</li>
        <li>De schaal is <strong>1 : 50</strong>.</li>
      </ol>
      ${tabelHtml([["Op de tekening", "In het echt"], ["4 cm", "200 cm"], ["1 cm <b style='color:#e0533d'>(: 4)</b>", "<b>50 cm</b> <b style='color:#e0533d'>(: 4)</b>"]])}`)}

    ${sectie("7. Schaalmodellen en de liniaal", `
      <div class="sch-rij">
        <div>${afbeeldingSvg(MODEL)}</div>
        <div>
          <p>Dit is een model van een auto op schaal <strong>1 : 40</strong>. Hoe lang is de echte auto?</p>
          <ol>
            <li>Lees de liniaal af. Begin bij de <strong>0</strong>! Het model is <strong>9 cm</strong> lang.</li>
            <li>9 cm × 40 = <strong>360 cm</strong>.</li>
            <li>360 cm : 100 = <strong>3,6 meter</strong>.</li>
          </ol>
        </div>
      </div>
      <div class="sch-tip">💡 Ligt het einde van het model tussen twee streepjes? Het streepje in het midden is de halve cm (bijvoorbeeld 4,5).</div>`)}

    ${sectie("8. Handige tips", `
      <ul>
        <li>Vraag jezelf af: moet het antwoord <b>groter</b> (echt) of <b>kleiner</b> (tekening) worden?</li>
        <li>Zet de getallen in een <b>verhoudingstabel</b>: links de tekening, rechts het echt.</li>
        <li>Schrijf de eenheden erbij, dan kom je niet in de war met cm, meter en km.</li>
        <li>Klopt je antwoord? Een kamer van 400 meter is niet realistisch. Bedenk of het antwoord past bij wat je tekent.</li>
      </ul>`)}
  `;

  const acties = document.createElement("div");
  acties.className = "acties-rij";
  const start = document.createElement("button");
  start.type = "button";
  start.className = "knop knop--primair";
  start.textContent = "Start met oefenen";
  start.addEventListener("click", opStart);
  const terug = document.createElement("button");
  terug.type = "button";
  terug.className = "knop knop--zacht";
  terug.textContent = "← Terug";
  terug.addEventListener("click", opTerug);
  acties.append(start, terug);
  kaart.appendChild(acties);
  container.appendChild(kaart);
  window.scrollTo(0, 0);
}

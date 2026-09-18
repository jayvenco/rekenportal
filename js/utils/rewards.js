// utils/rewards.js
// -----------------------------------------------------------------------------
// Frontendlaag voor profielgebonden Math Hero rewards.
// -----------------------------------------------------------------------------

import { getActiefProfielId } from "../storage.js";

const API_BASE = (window.location.port === "8791" || window.location.port === "8792")
  ? "http://localhost:8420/api"
  : "/api";

let coinCounterEl = null;

function formatCoins(waarde) {
  const getal = Number(waarde || 0);
  return Number.isInteger(getal) ? String(getal) : getal.toFixed(1);
}

function badgeIconHtml(badge, { locked = false } = {}) {
  if (locked) return "🔒";
  if (badge.visual) {
    return `<img class="badge-icon-img" src="${badge.visual}" alt="" loading="lazy">`;
  }
  return badge.icon || "🏆";
}

function vulBadgeIcoon(container, badge) {
  container.innerHTML = badgeIconHtml(badge);
}

async function fetchJson(pad, opties = {}) {
  const response = await fetch(`${API_BASE}${pad}`, {
    headers: { "Content-Type": "application/json", ...(opties.headers || {}) },
    ...opties,
  });
  if (!response.ok) throw new Error(`API ${response.status}: ${pad}`);
  const tekst = await response.text();
  return tekst ? JSON.parse(tekst) : null;
}

export async function haalProfielRewards(profielId = getActiefProfielId()) {
  if (profielId === null || profielId === undefined) return null;
  return await fetchJson(`/rewards/profiel/${encodeURIComponent(profielId)}`);
}

export async function haalRewardHistory(profielId = getActiefProfielId(), limit = 20) {
  if (profielId === null || profielId === undefined) return { events: [] };
  return await fetchJson(`/rewards/profiel/${encodeURIComponent(profielId)}/history?limit=${limit}`);
}

export async function verwerkSessieReward(payload) {
  const profielId = getActiefProfielId();
  if (profielId === null || profielId === undefined) return null;
  return await fetchJson(`/rewards/profiel/${encodeURIComponent(profielId)}/session`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function initialiseerCoinCounter() {
  if (coinCounterEl) return coinCounterEl;

  coinCounterEl = document.createElement("button");
  coinCounterEl.type = "button";
  coinCounterEl.className = "coin-counter";
  coinCounterEl.setAttribute("aria-label", "Open badge collectie");
  coinCounterEl.innerHTML = `<span class="coin-counter__coin">🪙</span><span class="coin-counter__waarde">0</span>`;
  coinCounterEl.addEventListener("click", () => toonBadgeCollectie());
  document.body.appendChild(coinCounterEl);
  return coinCounterEl;
}

export async function verversCoinCounter() {
  const counter = initialiseerCoinCounter();
  const profielId = getActiefProfielId();
  if (profielId === null || profielId === undefined) {
    counter.hidden = true;
    return null;
  }

  try {
    const rewards = await haalProfielRewards(profielId);
    counter.hidden = false;
    counter.querySelector(".coin-counter__waarde").textContent = formatCoins(rewards.coins);
    counter.classList.add("coin-counter--pulse");
    setTimeout(() => counter.classList.remove("coin-counter--pulse"), 450);
    return rewards;
  } catch (fout) {
    console.error("Kon coin counter niet verversen:", fout);
    counter.hidden = true;
    return null;
  }
}

export function toonCoinVlucht(vanafEl, bedrag) {
  const counter = initialiseerCoinCounter();
  if (!vanafEl || counter.hidden) return;

  const start = vanafEl.getBoundingClientRect();
  const eind = counter.getBoundingClientRect();
  const munt = document.createElement("span");
  munt.className = "coin-flight";
  munt.textContent = bedrag === 0.5 ? "+0.5 🪙" : "+1 🪙";
  munt.style.left = `${start.left + start.width / 2}px`;
  munt.style.top = `${start.top + start.height / 2}px`;
  munt.style.setProperty("--coin-dx", `${eind.left + eind.width / 2 - (start.left + start.width / 2)}px`);
  munt.style.setProperty("--coin-dy", `${eind.top + eind.height / 2 - (start.top + start.height / 2)}px`);
  document.body.appendChild(munt);
  setTimeout(() => munt.remove(), 950);
}

export function maakRewardTracker(exerciseId, totalQuestions) {
  const sessionId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  let correctAnswers = 0;
  let firstAttemptCorrect = 0;
  let secondAttemptCorrect = 0;
  let currentFirstAttemptStreak = 0;
  let bestFirstAttemptStreak = 0;

  return {
    registreerGoed(pogingNummer, vanafEl) {
      correctAnswers += 1;
      if (pogingNummer === 1) {
        firstAttemptCorrect += 1;
        currentFirstAttemptStreak += 1;
        bestFirstAttemptStreak = Math.max(bestFirstAttemptStreak, currentFirstAttemptStreak);
        toonCoinVlucht(vanafEl, 1);
      } else {
        secondAttemptCorrect += 1;
        currentFirstAttemptStreak = 0;
        toonCoinVlucht(vanafEl, 0.5);
      }
    },

    registreerFout() {
      currentFirstAttemptStreak = 0;
    },

    async voltooi() {
      return await verwerkSessieReward({
        sessionId,
        exerciseId,
        totalQuestions,
        correctAnswers,
        firstAttemptCorrect,
        secondAttemptCorrect,
        bestFirstAttemptStreak,
      });
    },
  };
}

export function toonRewardResultaat(container, rewardResult) {
  if (!rewardResult?.sessionResult) return;
  const resultaat = rewardResult.sessionResult;
  const blok = document.createElement("div");
  blok.className = "reward-result";
  const bonusLabel = resultaat.bonusCoins >= 10 ? "PERFECT!" : resultaat.bonusCoins > 0 ? "BONUS!" : "POWER";
  blok.innerHTML = `
    <div class="reward-result__coins">
      <span class="reward-result__coin">🪙</span>
      <strong>+${formatCoins(resultaat.totalCoins)}</strong>
    </div>
    <p>${formatCoins(resultaat.baseCoins)} coins uit antwoorden</p>
    <p>${bonusLabel} ${resultaat.bonusCoins > 0 ? `+${formatCoins(resultaat.bonusCoins)} bonus` : "blijf oefenen voor bonuscoins"}</p>
  `;
  container.appendChild(blok);
}

export function toonBadgeUnlocks(badges) {
  if (!badges || badges.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    let index = 0;
    const overlay = document.createElement("div");
    overlay.className = "badge-unlock";
    overlay.innerHTML = `
      <div class="badge-unlock__kaart">
        <div class="badge-unlock__glow"></div>
        <div class="badge-unlock__icoon"></div>
        <p class="badge-unlock__eyebrow">🏆 NIEUWE BADGE!</p>
        <h2></h2>
        <p class="badge-unlock__tekst">Badge toegevoegd aan jouw collectie!</p>
        <button type="button" class="knop knop--primair">Doorgaan</button>
      </div>
    `;

    const icoon = overlay.querySelector(".badge-unlock__icoon");
    const titel = overlay.querySelector("h2");
    const tekst = overlay.querySelector(".badge-unlock__tekst");
    const knop = overlay.querySelector("button");

    function toonHuidigeBadge() {
      const badge = badges[index];
      vulBadgeIcoon(icoon, badge);
      icoon.dataset.rarity = badge.rarity;
      titel.textContent = badge.name;
      tekst.textContent = badge.description || "Badge toegevoegd aan jouw collectie!";
    }

    knop.addEventListener("click", () => {
      index += 1;
      if (index >= badges.length) {
        overlay.remove();
        resolve();
      } else {
        toonHuidigeBadge();
      }
    });

    toonHuidigeBadge();
    document.body.appendChild(overlay);
  });
}

export async function toonBadgeCollectie() {
  const rewards = await haalProfielRewards();
  if (!rewards) return;

  const overlay = document.createElement("div");
  overlay.className = "badge-collection";
  const badgesHtml = rewards.badges.map((badge) => `
    <button type="button" class="badge-card ${badge.earned ? "badge-card--earned" : "badge-card--locked"}" data-rarity="${badge.rarity}">
      <span class="badge-card__icon">${badgeIconHtml(badge, { locked: !badge.earned })}</span>
      <strong>${badge.name}</strong>
      <small>${badge.rarity}</small>
      <span>${badge.description}</span>
      <em>${badge.earned ? `Nog ${badge.daysRemaining} dagen` : "Nog niet verdiend"}</em>
    </button>
  `).join("");

  overlay.innerHTML = `
    <section class="badge-collection__pane" aria-label="Badge collectie">
      <button type="button" class="badge-collection__close" aria-label="Sluit badge collectie">×</button>
      <header>
        <p>🏆 BADGE COLLECTION</p>
        <h2>Power level ${rewards.level}</h2>
        <strong>🪙 ${formatCoins(rewards.coins)} coins</strong>
        <span>${rewards.earnedBadgeCount} / ${rewards.totalBadgeCount} badges verzameld</span>
      </header>
      <div class="badge-collection__grid">${badgesHtml}</div>
    </section>
  `;
  overlay.querySelector(".badge-collection__close").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

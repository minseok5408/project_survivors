// js/ui/levelUpSelect.js
import { MAX_WEAPON_LEVEL } from "../weapons/registry.js";
import { ICONS } from "./icons.js";

const ALL_KEYS = ["bullet", "bible"];
const SOON_CARD = {
  key: "soon",
  name: "Coming Soon",
  desc: "아직 준비중입니다",
  enabled: false,
};

function makeDescriptions(name, max) {
  return Array.from({ length: max }, (_, i) => {
    const lv = i + 1;
    const suffix = lv === max ? " (최대)" : "";
    return `Lv${lv}: ${name} ${lv}개${suffix}`;
  });
}

const MAX_LEVEL = MAX_WEAPON_LEVEL;

// 무기별 레벨업 설명 사전
export const WEAPON_DESCRIPTIONS = {
  bullet: makeDescriptions("탄환", MAX_LEVEL),
  bible: makeDescriptions("성서", MAX_LEVEL),
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickCards() {
  const keys = shuffle(ALL_KEYS)
    .slice(0, 2)
    .map((k) => ({ key: k }));
  return shuffle([...keys, SOON_CARD]);
}

export function openLevelUpSelect(
  { currentLevels, maxLevel = MAX_LEVEL },
  onPick,
  onClose
) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <h2>레벨 업! 업그레이드를 선택하세요</h2>
    <div class="char-grid"></div>
    <div class="modal-actions">
      <button id="levelupClose" class="ghost">닫기</button>
    </div>
  `;

  const grid = modal.querySelector(".char-grid");
  grid.style.gridTemplateColumns = "repeat(3, minmax(0,1fr))";

  const options = pickCards();
  let anyUpgradeable = false;

  const cards = [];

  options.forEach((opt) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "char-card";

    if (opt.key === "soon") {
      card.classList.add("disabled");
      card.innerHTML = `
        <div class="avatar icon-wrap disabled">${ICONS.lock}</div>
        <div class="name">Coming Soon</div>
        <div class="stats">아직 준비중입니다</div>
        <div class="stats">선택 불가</div>
      `;
      grid.appendChild(card);
      cards.push({ opt, card });
      return;
    }

    const name = opt.key === "bullet" ? "Bullet" : "Bible";
    const cur = currentLevels[opt.key] || 0;
    const canUp = cur < maxLevel;
    if (canUp) anyUpgradeable = true;

    if (!canUp) card.classList.add("disabled");

    const nextLv = Math.min(cur + 1, maxLevel);
    const levelText = canUp ? `Lv ${cur} → ${nextLv}` : `Lv ${cur} (MAX)`;
    const descPreview =
      WEAPON_DESCRIPTIONS[opt.key][
        Math.min(nextLv - 1, WEAPON_DESCRIPTIONS[opt.key].length - 1)
      ];

    const avatarColor = canUp ? "#ffd166" : "#666";
    const icon =
      opt.key === "bullet"
        ? ICONS.bullet
        : opt.key === "bible"
        ? ICONS.bible
        : ICONS.lock;

    card.innerHTML = `
      <div class="avatar icon-wrap" style="color:${avatarColor};">${icon}</div>
      <div class="name">${name}</div>
      <div class="stats">${descPreview}</div>
      <div class="stats">${levelText}</div>
    `;

    if (canUp) {
      card.addEventListener("click", () => {
        cleanup();
        onPick && onPick(opt.key);
      });
    }

    grid.appendChild(card);
    cards.push({ opt, card });
  });

  function cleanup() {
    window.removeEventListener("keydown", onKey);
    overlay.remove();
  }

  // 닫기 버튼
  modal.querySelector("#levelupClose").addEventListener("click", () => {
    cleanup();
    onClose && onClose();
  });

  // 단축키(1/2/3, Enter, Esc)
  const onKey = (e) => {
    if (e.key === "Escape") {
      cleanup();
      onClose && onClose();
    }
    if (["1", "2", "3"].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      const target = cards[idx];
      if (!target) return;
      const { opt, card } = target;
      if (opt.key !== "soon" && !card.classList.contains("disabled")) {
        cleanup();
        onPick && onPick(opt.key);
      }
    }
    if (e.key === "Enter") {
      const first = cards.find(
        ({ opt, card }) =>
          opt.key !== "soon" && !card.classList.contains("disabled")
      );
      if (first) {
        cleanup();
        onPick && onPick(first.opt.key);
      }
    }
  };
  window.addEventListener("keydown", onKey);

  overlay.appendChild(modal);
  document.getElementById("gameContainer").appendChild(overlay);
}

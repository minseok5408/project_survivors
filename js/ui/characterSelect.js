// js/ui/characterSelect.js
import { CHARACTERS } from "../config/index.js";

export function openCharacterSelect(onConfirm, onCancel) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <h2>캐릭터를 선택하세요</h2>
    <div class="char-grid"></div>
    <div class="modal-actions">
      <button id="charConfirm" class="primary" disabled>선택하고 시작</button>
      <button id="charCancel" class="ghost">취소</button>
    </div>
  `;

  const grid = modal.querySelector(".char-grid");
  let selectedId = null;

  CHARACTERS.forEach((c) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "char-card";
    card.dataset.id = c.id;
    card.innerHTML = `
      <div class="avatar" style="background:${c.color};"></div>
      <div class="name">${c.name}</div>
      <div class="stats">HP ${c.hp} • SPD ${c.speed} • BUL ${c.bulletCount}</div>
    `;
    card.addEventListener("click", () => {
      grid
        .querySelectorAll(".char-card")
        .forEach((n) => n.classList.remove("selected"));
      card.classList.add("selected");
      selectedId = c.id;
      modal.querySelector("#charConfirm").disabled = false;
    });
    grid.appendChild(card);
  });

  modal.querySelector("#charCancel").addEventListener("click", () => {
    overlay.remove();
    onCancel && onCancel();
  });

  modal.querySelector("#charConfirm").addEventListener("click", () => {
    if (!selectedId) return;
    const chosen = CHARACTERS.find((c) => c.id === selectedId);
    overlay.remove();
    onConfirm && onConfirm(chosen);
  });

  overlay.appendChild(modal);
  document.getElementById("gameContainer").appendChild(overlay);
}

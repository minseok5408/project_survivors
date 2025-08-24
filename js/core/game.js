// js/core/game.js
import { createLoop } from "./loop.js";
import { createState, createPlayer } from "./state.js";
import { openCharacterSelect } from "../ui/characterSelect.js";
import { openLevelUpSelect } from "../ui/levelUpSelect.js";
import {
  setActiveWeapon,
  updateWeapons,
  drawWeapons,
  clearWeapons,
  setWeaponSpeed,
  clampLevels,
  canLevelUp,
  MAX_WEAPON_LEVEL,
} from "../weapons/registry.js";
import { checkCollisions } from "../systems/collisions.js";

// === 초기 상태/객체 준비 ===
const state = createState();
const loop = createLoop(update);

// 무기 레벨 테이블 초기화 (부메랑 제거 상태)
state.weaponLevels = { bullet: 0, bible: 0 };
state.pendingLevelUp = false;

// 레벨업 모달 열림 여부 플래그 (숫자키 속도변경 차단용)
state.isLevelUpModalOpen = false;

// HUD 표시 전용
state.hud = { weapons: [], passives: [] };

function ensureInHud(list, key, max = 5) {
  if (!key) return;
  if (!list.includes(key) && list.length < max) list.push(key);
}

// 입력
window.addEventListener("keydown", (e) => {
  state.keys[e.key] = true;

  if (e.key === "Escape" && state.isGameStarted && !state.isGameOver) {
    state.isPaused = !state.isPaused;
  }

  // 일시정지 중 속도 변경 (1~5) ➜ 레벨업 모달 열려있으면 무시
  if (state.isPaused && !state.isGameOver && !state.isLevelUpModalOpen) {
    const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2];
    if (e.key >= "1" && e.key <= "5") {
      const idx = parseInt(e.key, 10) - 1;
      if (idx < SPEED_OPTIONS.length) {
        state.gameSpeed = SPEED_OPTIONS[idx];
        if (state.player) state.player.updateSpeed(state.gameSpeed);
        state.managers?.enemyManager?.updateSpeed?.(state.gameSpeed);
        state.managers?.bulletManager?.updateSpeed?.(state.gameSpeed);
        state.managers?.itemManager?.updateSpeed?.(state.gameSpeed);
        setWeaponSpeed(state);
      }
    }
  }
});
window.addEventListener("keyup", (e) => (state.keys[e.key] = false));

// 시작 버튼 → 캐릭터 선택
state.startButton?.addEventListener("click", () => {
  openCharacterSelect((chosen) => startWithCharacter(chosen));
});

// 리트라이 → 캐릭터 선택
state.retryButton?.addEventListener("click", () => {
  state.retryButton.style.display = "none";
  openCharacterSelect((chosen) => startWithCharacter(chosen));
});

// weapon 미지정 캐릭터 대비: id로 안전 매핑 (bible/bullet만)
function inferWeaponById(id) {
  const key = String(id || "").toLowerCase();
  if (key === "scout" || key === "priest") return "bible";
  return "bullet"; // soldier, tank, gunner 등 기본값
}

function startWithCharacter(chosen) {
  // 혹시 남아있는 오버레이 제거
  document.querySelectorAll(".modal-overlay")?.forEach((el) => el.remove());

  // 버튼 숨김
  if (state.startButton) state.startButton.style.display = "none";
  if (state.retryButton) state.retryButton.style.display = "none";

  // 상태 플래그 초기화
  state.isGameOver = false;
  state.isPaused = false;
  state.pendingLevelUp = false;
  state.isLevelUpModalOpen = false;

  // 플레이어 생성
  createPlayer(state, chosen);

  // 시작 무기 결정 (weapon 우선, 없으면 id로 유추)
  const startKey =
    chosen && chosen.weapon ? chosen.weapon : inferWeaponById(chosen?.id);
  setActiveWeapon(state, startKey);

  // 시작 무기 레벨 세팅 (최대 7)
  state.weaponLevels = clampLevels({ bullet: 0, bible: 0 });
  const startLv = Math.min(MAX_WEAPON_LEVEL, chosen?.bulletCount || 1);
  state.weaponLevels[startKey] = startLv;

  // bullet 발사 수 동기화 (bullet일 때만)
  if (state.player) {
    state.player.bulletCount =
      startKey === "bullet" ? state.weaponLevels.bullet || 0 : 0;
  }

  // HUD 초기화 및 시작 무기 등록
  state.hud.weapons = [];
  state.hud.passives = [];
  if (startLv > 0) ensureInHud(state.hud.weapons, startKey, 5);

  // 속도 반영
  if (state.player) state.player.updateSpeed(state.gameSpeed);
  state.managers?.enemyManager?.updateSpeed?.(state.gameSpeed);
  state.managers?.bulletManager?.updateSpeed?.(state.gameSpeed);
  state.managers?.itemManager?.updateSpeed?.(state.gameSpeed);
  setWeaponSpeed(state);

  state.isGameStarted = true;

  resetGame();
  loop.start();
}

// 초기화
function resetGame() {
  state.isGameOver = false;

  state.player?.reset?.();
  state.managers?.bulletManager?.clear?.();
  state.managers?.enemyManager?.clear?.();
  state.managers?.itemManager?.clear?.();
  clearWeapons(state);

  state.killCount = 0;
  state.lastSpawnRateIncrease = 0;
  state.isThunderActive = false;
  state.thunderDuration = 0;
  state.pendingLevelUp = false;
  state.isLevelUpModalOpen = false;

  // ★ CHANGED: 시작하자마자 선스폰을 여러 마리 투입 (체감 밀도 ↑)
  const prewarmCount = 8; // 필요시 5~12 사이로 조절
  for (let i = 0; i < prewarmCount; i++) {
    state.managers?.enemyManager?.spawn?.();
  }
}

// === 메인 루프 ===
function update() {
  const ui = state.ui;
  const canvas = state.canvas;
  const managers = state.managers || {};
  const enemyManager = managers.enemyManager;
  const itemManager = managers.itemManager;

  if (!ui || !canvas) return;
  ui.ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 레벨업 모달 처리
  if (state.pendingLevelUp && !state.isGameOver) {
    state.pendingLevelUp = false;
    state.isPaused = true;
    state.isLevelUpModalOpen = true;

    openLevelUpSelect(
      { currentLevels: state.weaponLevels, maxLevel: MAX_WEAPON_LEVEL },
      (pickedKey) => {
        if (canLevelUp(state, pickedKey)) {
          state.weaponLevels[pickedKey] = Math.min(
            MAX_WEAPON_LEVEL,
            (state.weaponLevels[pickedKey] || 0) + 1
          );
          // bullet 업그레이드 시 발사 수 동기화
          if (pickedKey === "bullet" && state.player) {
            state.player.bulletCount = state.weaponLevels.bullet || 0;
          }
          ensureInHud(state.hud.weapons, pickedKey, 5);
        }
        state.isLevelUpModalOpen = false;
        state.isPaused = false;
      },
      () => {
        state.isLevelUpModalOpen = false;
        state.isPaused = false;
      }
    );
  }

  if (!state.isGameOver && !state.isPaused) {
    // 천둥 효과
    if (state.isThunderActive) {
      state.thunderDuration -= (1 / 60) * (state.gameSpeed || 1);
      if (state.thunderDuration <= 0) state.isThunderActive = false;
    }

    // 5분마다 스폰률 증가 + 보스/HP 스케일
    if (state.player && enemyManager) {
      const t = state.player.gameTime;
      enemyManager.updateScaling?.(t);
      enemyManager.maybeSpawnBoss?.(t, state.player);

      if (t - (state.lastSpawnRateIncrease || 0) >= 300) {
        if (typeof enemyManager.spawnRate === "number") {
          enemyManager.spawnRate *= 2;
        }
        state.lastSpawnRateIncrease = t;
      }
    }

    // 플레이어
    if (state.player) {
      state.player.move?.(state.keys);
      state.player.update?.();
    }

    // 무기
    updateWeapons(state); // ← Bible 회전
    state.managers?.bulletManager?.shoot?.(state.player); // ← Bullet 발사
    state.managers?.bulletManager?.update?.();

    // 플레이어 드로우
    if (state.player) {
      ui.ctx.fillStyle = state.player.color || "blue";
      ui.ctx.fillRect(
        state.player.x,
        state.player.y,
        state.player.size,
        state.player.size
      );
    }

    // UI (현재 UI 유지 + 인벤토리)
    if (state.player) {
      ui.drawExpBar?.(state.player);
      ui.drawHealthBar?.(state.player);
      ui.drawStats?.(state.player, state.killCount || 0);
      ui.drawInventoryBelowLevel?.(state.hud);
    }

    // 무기 드로우 (Bible만)
    drawWeapons(state);

    // 적 처리/드로우 (+ HP바)
    enemyManager?.update?.(
      state.player || { x: canvas.width / 2, y: canvas.height / 2 }
    );
    enemyManager?.enemies?.forEach((enemy) => {
      ui.ctx.fillStyle = enemy.isBoss ? "purple" : "red";
      ui.ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
      ui.drawEntityHpBar?.(enemy);
    });

    // 아이템 처리/드로우
    itemManager?.update?.(state.player || { hasMagnet: false, x: 0, y: 0 });
    itemManager?.gems?.forEach((gem) => {
      ui.ctx.fillStyle = "cyan";
      ui.ctx.fillRect(gem.x, gem.y, gem.size, gem.size);
    });
    itemManager?.hearts?.forEach((heart) => ui.drawHeart?.(heart));
    itemManager?.magnets?.forEach((magnet) => {
      ui.ctx.fillStyle = "purple";
      ui.ctx.fillRect(magnet.x, magnet.y, magnet.size, magnet.size);
    });
    itemManager?.thunders?.forEach((thunder) => {
      ui.ctx.fillStyle = "yellow";
      ui.ctx.fillRect(thunder.x, thunder.y, thunder.size, thunder.size);
    });

    // 천둥 오버레이
    if (state.isThunderActive) {
      ui.ctx.fillStyle = `rgba(255, 255, 0, ${state.thunderDuration})`;
      ui.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 충돌
    checkCollisions(state);

    // 적 스폰 (확률)
    const sr =
      typeof enemyManager?.spawnRate === "number" ? enemyManager.spawnRate : 0;
    if (Math.random() < sr * (state.gameSpeed || 1)) {
      enemyManager?.spawn?.();
    }
  }

  // 오버레이
  if (state.isGameOver) {
    ui.drawGameOver?.();
  } else if (state.isPaused && !state.isLevelUpModalOpen) {
    drawPauseScreen();
  }
}

function drawPauseScreen() {
  const ui = state.ui;
  const canvas = state.canvas;
  const gameSpeed = state.gameSpeed || 1;

  ui.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ui.ctx.fillRect(0, 0, canvas.width, canvas.height);
  ui.ctx.fillStyle = "white";
  ui.ctx.font = "50px Arial";
  ui.ctx.fillText("PAUSED", canvas.width / 2 - 100, canvas.height / 2);
  ui.ctx.font = "20px Arial";
  ui.ctx.fillText(
    "Press ESC to Resume",
    canvas.width / 2 - 100,
    canvas.height / 2 + 40
  );

  const SPEED_OPTIONS = [
    { value: 0.25, label: "0.25배속" },
    { value: 0.5, label: "0.5배속" },
    { value: 1, label: "1배속" },
    { value: 1.5, label: "1.5배속" },
    { value: 2, label: "2배속" },
  ];

  ui.ctx.font = "24px Arial";
  ui.ctx.fillText(
    "Game Speed:",
    canvas.width / 2 - 100,
    canvas.height / 2 + 100
  );

  SPEED_OPTIONS.forEach((option, index) => {
    const baseX = canvas.width / 2 - 200;
    const spacing = 150;
    const x = baseX + index * spacing;
    const y = canvas.height / 2 + 140;
    const isSelected = gameSpeed === option.value;

    ui.ctx.fillStyle = isSelected ? "yellow" : "white";
    ui.ctx.fillText(`${index + 1}: ${option.label}`, x, y);
  });
}

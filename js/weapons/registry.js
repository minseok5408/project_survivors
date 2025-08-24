import { BibleManager } from "../entities/weapons/bible.js";

const MAX_WEAPON_LEVEL = 7;

const layer = {
  bible: new BibleManager(),
};

export function setWeaponSpeed(state) {
  const { gameSpeed } = state;
  layer.bible.updateSpeed(gameSpeed);
}

export function clearWeapons(state) {
  layer.bible.clear();
}

export function setActiveWeapon(state, weaponType /* "bullet" | "bible" */) {
  state.activeWeapon = weaponType || "bullet";
}

// 외부에서 레벨업 전 clamp/check 용
export function canLevelUp(state, key) {
  const lv = state.weaponLevels[key] || 0;
  return lv < MAX_WEAPON_LEVEL;
}

export function clampLevels(levels) {
  return {
    bullet: Math.min(MAX_WEAPON_LEVEL, Math.max(0, levels.bullet || 0)),
    bible: Math.min(MAX_WEAPON_LEVEL, Math.max(0, levels.bible || 0)),
  };
}

export function applyWeaponLevels(state) {
  // clamp 보정
  state.weaponLevels = clampLevels(state.weaponLevels);
  // bullet ↔ player.bulletCount 동기화
  if (state.player) state.player.bulletCount = state.weaponLevels.bullet;
  // bible 개수 반영
  layer.bible.setCount(state.weaponLevels.bible);
}

export function updateWeapons(state) {
  const { player } = state;
  if (!player) return;

  applyWeaponLevels(state);

  if (state.weaponLevels.bullet > 0) {
    state.managers.bulletManager.shoot(player);
  }
  if (state.weaponLevels.bible > 0) {
    layer.bible.update(player);
  }
}

export function drawWeapons(state) {
  const { ui, managers } = state;
  const { bulletManager } = managers;

  bulletManager.bullets.forEach((bullet) => {
    ui.ctx.fillStyle = "yellow";
    ui.ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
  });

  if (state.weaponLevels.bible > 0) {
    layer.bible.bibles.forEach((bible) => {
      ui.ctx.beginPath();
      ui.ctx.fillStyle = "white";
      ui.ctx.arc(bible.x, bible.y, bible.size / 2, 0, Math.PI * 2);
      ui.ctx.fill();
    });
  }
}

export function bibleHitRadius(bible, enemy) {
  return bible.size + enemy.size * 0.7;
}

export function getBibleManager() {
  return layer.bible;
}

export { MAX_WEAPON_LEVEL };

// js/systems/collisions.js
import { ITEM_CONFIG } from "../config/index.js";
import { bibleHitRadius, getBibleManager } from "../weapons/registry.js";

export function checkCollisions(state) {
  const { player, managers } = state;
  if (!player) return;

  const { bulletManager, enemyManager, itemManager } = managers;

  // 총알-적: 피해 적용
  bulletManager.bullets.forEach((bullet, bIndex) => {
    enemyManager.enemies.forEach((enemy, eIndex) => {
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bullet.size + enemy.size) {
        const damage = bullet.damage ?? 20; // 기본 데미지
        enemy.hp -= damage;

        // 총알은 1회 타격 후 제거(관통 없음 가정)
        bulletManager.bullets.splice(bIndex, 1);

        if (enemy.hp <= 0) {
          handleEnemyDeath(state, eIndex);
        }
      }
    });
  });

  // 바이블-적: 지속 피해
  if (state.weaponLevels.bible > 0) {
    const bibleManager = getBibleManager();
    bibleManager.bibles.forEach((bible) => {
      enemyManager.enemies.forEach((enemy, eIndex) => {
        const dx = bible.x - enemy.x;
        const dy = bible.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bibleHitRadius(bible, enemy)) {
          const damage = bible.damage ?? 10;
          enemy.hp -= damage;

          if (enemy.hp <= 0) {
            handleEnemyDeath(state, eIndex);
          }
        }
      });
    });
  }

  // 적-플레이어
  enemyManager.enemies.forEach((enemy, eIndex) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + enemy.size && !player.isInvincible) {
      player.hp -= enemy.isBoss ? 30 : 10; // 보스는 더 아픔
      player.activateInvincibility();
      // 보스는 몸박으로 죽지 않음
      if (!enemy.isBoss) {
        enemyManager.enemies.splice(eIndex, 1);
        state.killCount++;
        dropAll(state.managers.itemManager, enemy);
      }

      if (player.hp <= 0) {
        player.hp = 0;
        gameOver(state);
      }
    }
  });

  // 보석 (경험치)
  itemManager.gems.forEach((gem, gIndex) => {
    const dx = player.x - gem.x;
    const dy = player.y - gem.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + gem.size) {
      const amount = gem.amount ?? 10; // 일반 보석 기본 10
      const leveledUp = player.addExp(amount);
      itemManager.gems.splice(gIndex, 1);
      if (leveledUp) state.pendingLevelUp = true;
    }
  });

  // 하트 (소모)
  itemManager.hearts.forEach((heart, hIndex) => {
    const dx = player.x - heart.x;
    const dy = player.y - heart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + heart.size) {
      player.hp = Math.min(player.hp + 50, 100);
      itemManager.hearts.splice(hIndex, 1);
    }
  });

  // 자석
  itemManager.magnets.forEach((magnet, mIndex) => {
    const dx = player.x - magnet.x;
    const dy = player.y - magnet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + magnet.size) {
      player.hasMagnet = true;
      player.magnetDuration = ITEM_CONFIG.magnet.duration;
      itemManager.magnets.splice(mIndex, 1);
    }
  });

  // 천둥
  itemManager.thunders.forEach((thunder, tIndex) => {
    const dx = player.x - thunder.x;
    const dy = player.y - thunder.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + thunder.size) {
      state.killCount += state.managers.enemyManager.enemies.length;
      state.managers.enemyManager.enemies.forEach((enemy) =>
        dropAll(itemManager, enemy)
      );
      state.managers.enemyManager.enemies = [];

      state.isThunderActive = true;
      state.thunderDuration = 0.5;

      itemManager.thunders.splice(tIndex, 1);
    }
  });
}

function handleEnemyDeath(state, enemyIndex) {
  const { enemyManager, itemManager } = state.managers;
  const enemy = enemyManager.enemies[enemyIndex];
  enemyManager.enemies.splice(enemyIndex, 1);
  state.killCount++;

  if (enemy.isBoss) {
    // 보스 처치: 대량 경험치 드랍
    // 큰 보석 여러 개로 드랍 (각 50 EXP, 총 10개 = 500 EXP)
    for (let i = 0; i < 10; i++) {
      const jitterX = enemy.x + (Math.random() - 0.5) * 40;
      const jitterY = enemy.y + (Math.random() - 0.5) * 40;
      const gem = itemManager.dropGem(jitterX, jitterY);
      if (gem) gem.amount = 50;
    }
    // 보스 플래그 해제
    enemyManager.bossAlive = false;
  } else {
    dropAll(itemManager, enemy);
  }
}

function dropAll(itemManager, enemy) {
  itemManager.dropGem(enemy.x, enemy.y);
  itemManager.dropHeart(enemy.x, enemy.y);
  itemManager.dropMagnet(enemy.x, enemy.y);
  itemManager.dropThunder(enemy.x, enemy.y);
}

export function gameOver(state) {
  state.isGameOver = true;
  state.ui.drawGameOver();
  state.retryButton.style.display = "block";
}

import { ITEM_CONFIG } from "./config.js";

export class Heart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = ITEM_CONFIG.heart.size;
  }
}

export class Gem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = ITEM_CONFIG.gem.size;
    this.speed = ITEM_CONFIG.gem.speed;
  }

  moveTowardsPlayer(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }
  }
}

export class Magnet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = ITEM_CONFIG.magnet.size;
  }
}

export class Thunder {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = ITEM_CONFIG.thunder.size;
  }
}

export class ItemManager {
  constructor() {
    this.hearts = [];
    this.gems = [];
    this.magnets = [];
    this.thunders = [];
    this.currentGameSpeed = 1; // 현재 게임 속도 저장
  }

  updateSpeed(gameSpeed) {
    this.currentGameSpeed = gameSpeed;
  }

  dropHeart(x, y) {
    if (Math.random() < ITEM_CONFIG.heart.dropRate) {
      this.hearts.push(new Heart(x, y));
    }
  }

  dropGem(x, y) {
    this.gems.push(new Gem(x, y));
  }

  dropMagnet(x, y) {
    if (Math.random() < ITEM_CONFIG.magnet.dropRate) {
      this.magnets.push(new Magnet(x, y));
    }
  }

  dropThunder(x, y) {
    if (Math.random() < ITEM_CONFIG.thunder.dropRate) {
      this.thunders.push(new Thunder(x, y));
    }
  }

  update(player) {
    // 자석 아이템 효과가 활성화된 경우 보석만 플레이어 쪽으로 이동
    if (player.hasMagnet) {
      const magnetSpeed = 5 * this.currentGameSpeed; // 자석 아이템의 이동 속도를 게임 속도에 맞춤

      // 보석만 이동
      this.gems.forEach((gem) => {
        const dx = player.x - gem.x;
        const dy = player.y - gem.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        gem.x += Math.cos(angle) * magnetSpeed;
        gem.y += Math.sin(angle) * magnetSpeed;
      });
    }
  }

  clear() {
    this.hearts = [];
    this.gems = [];
    this.magnets = [];
    this.thunders = [];
  }
}

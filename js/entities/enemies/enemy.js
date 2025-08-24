// js/entities/enemies/enemy.js

export class Enemy {
  constructor(x, y, size, speed, hp, isBoss = false) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.hp = hp;
    this.maxHp = hp;
    this.isBoss = isBoss;
  }

  moveToward(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    this.x += nx * this.speed;
    this.y += ny * this.speed;
  }
}

export class EnemyManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.enemies = [];

    this.spawnRate = 0.02;
    this.speed = 1;

    this.hpScale = 1;
    this.lastHpScaleTime = 0;
    this.lastBossTime = 0;
    this.bossAlive = false; // 동시 1기 제한
  }

  updateSpeed(gameSpeed) {
    this.speed = gameSpeed || 1;
  }

  clear() {
    this.enemies = [];
    this.hpScale = 1;
    this.lastHpScaleTime = 0;
    this.lastBossTime = 0;
    this.bossAlive = false;
  }

  // 3분(180s)마다 체력 10% 증가
  updateScaling(gameTimeSec) {
    const STEP = 180;
    while (gameTimeSec - this.lastHpScaleTime >= STEP) {
      this.hpScale *= 1.1;
      this.lastHpScaleTime += STEP;
    }
  }

  // 5분(300s)마다 보스 소환
  maybeSpawnBoss(gameTimeSec, player) {
    const INTERVAL = 300;
    if (!this.bossAlive && gameTimeSec - this.lastBossTime >= INTERVAL) {
      this.spawnBoss(player);
      this.lastBossTime = gameTimeSec;
      this.bossAlive = true;
    }
  }

  spawn() {
    const margin = 30;
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) {
      x = Math.random() * this.canvas.width;
      y = -margin;
    } else if (side === 1) {
      x = this.canvas.width + margin;
      y = Math.random() * this.canvas.height;
    } else if (side === 2) {
      x = Math.random() * this.canvas.width;
      y = this.canvas.height + margin;
    } else {
      x = -margin;
      y = Math.random() * this.canvas.height;
    }

    const size = 16;
    const speed = 1.2 * this.speed;
    const hp = 30 * this.hpScale;

    this.enemies.push(new Enemy(x, y, size, speed, hp, false));
  }

  spawnBoss() {
    const margin = 40;
    const sides = [
      { x: Math.random() * this.canvas.width, y: -margin },
      { x: this.canvas.width + margin, y: Math.random() * this.canvas.height },
      { x: Math.random() * this.canvas.width, y: this.canvas.height + margin },
      { x: -margin, y: Math.random() * this.canvas.height },
    ];
    const pos = sides[Math.floor(Math.random() * sides.length)];

    const size = 64;
    const speed = 0.8 * this.speed;
    const hp = 2000 * this.hpScale;

    this.enemies.push(new Enemy(pos.x, pos.y, size, speed, hp, true));
  }

  update(player) {
    this.enemies.forEach((e) => e.moveToward(player));
  }
}

import { ENEMY_CONFIG } from "./config.js";

export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = ENEMY_CONFIG.size;
    this.baseSpeed = ENEMY_CONFIG.speed;
    this.speed = this.baseSpeed;
  }

  updateSpeed(gameSpeed) {
    this.speed = this.baseSpeed * gameSpeed;
  }

  move(player) {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
  }
}

export class EnemyManager {
  constructor(canvas) {
    this.enemies = [];
    this.canvas = canvas;
    this.spawnRate = ENEMY_CONFIG.spawnRate;
    this.currentGameSpeed = 1; // 기본 게임 속도 설정
  }

  updateSpeed(gameSpeed) {
    this.currentGameSpeed = gameSpeed; // 현재 게임 속도 업데이트
    this.enemies.forEach((enemy) => enemy.updateSpeed(gameSpeed));
  }

  spawn() {
    const size = ENEMY_CONFIG.size;
    let x, y;

    // 랜덤하게 생성 위치 선택 (위, 아래, 왼쪽, 오른쪽)
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: // 위
        x = Math.random() * this.canvas.width;
        y = -size;
        break;
      case 1: // 아래
        x = Math.random() * this.canvas.width;
        y = this.canvas.height + size;
        break;
      case 2: // 왼쪽
        x = -size;
        y = Math.random() * this.canvas.height;
        break;
      case 3: // 오른쪽
        x = this.canvas.width + size;
        y = Math.random() * this.canvas.height;
        break;
    }

    const enemy = new Enemy(x, y);
    enemy.updateSpeed(this.currentGameSpeed);
    this.enemies.push(enemy);
  }

  update(player) {
    this.enemies.forEach((enemy) => enemy.move(player));
  }

  clear() {
    this.enemies = [];
    this.spawnRate = ENEMY_CONFIG.spawnRate;
  }
}

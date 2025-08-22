import { BULLET_CONFIG } from "./config.js";

export class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.size = BULLET_CONFIG.size;
    this.baseSpeed = BULLET_CONFIG.speed;
    this.speed = this.baseSpeed;
    this.angle = angle;
  }

  updateSpeed(gameSpeed) {
    this.speed = this.baseSpeed * gameSpeed;
  }

  move() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }
}

export class BulletManager {
  constructor() {
    this.bullets = [];
    this.lastBulletTime = 0;
    this.currentGameSpeed = 1; // 현재 게임 속도 저장
  }

  updateSpeed(gameSpeed) {
    this.currentGameSpeed = gameSpeed; // 현재 게임 속도 업데이트
    this.bullets.forEach((bullet) => bullet.updateSpeed(gameSpeed));
  }

  shoot(player) {
    const currentTime = Date.now();
    // 발사 간격을 게임 속도에 맞춰 조정
    const adjustedFireRate = BULLET_CONFIG.fireRate / this.currentGameSpeed;
    if (currentTime - this.lastBulletTime >= adjustedFireRate) {
      // 플레이어가 이동하지 않았을 때는 마지막 방향으로 발사
      const direction = player.lastDirection || 0;
      let angleStep = Math.PI / (player.bulletCount + 1);
      for (let i = 0; i < player.bulletCount; i++) {
        let angle = direction + angleStep * (i - (player.bulletCount - 1) / 2);
        const bullet = new Bullet(
          player.x + player.size / 2,
          player.y + player.size / 2,
          angle
        );
        bullet.updateSpeed(this.currentGameSpeed);
        this.bullets.push(bullet);
      }
      this.lastBulletTime = currentTime;
    }
  }

  update() {
    this.bullets.forEach((bullet) => bullet.move());
  }

  clear() {
    this.bullets = [];
    this.lastBulletTime = 0;
    this.currentGameSpeed = 1; // 게임 재시작 시 속도 초기화
  }
}

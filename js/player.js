import { PLAYER_CONFIG } from "./config.js";

export class Player {
  constructor(canvas) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = PLAYER_CONFIG.size;
    this.baseSpeed = PLAYER_CONFIG.speed;
    this.speed = this.baseSpeed;
    this.dx = 0;
    this.dy = 0;
    this.hp = PLAYER_CONFIG.hp;
    this.level = PLAYER_CONFIG.level;
    this.exp = PLAYER_CONFIG.exp;
    this.expToNextLevel = PLAYER_CONFIG.expToNextLevel;
    this.bulletCount = PLAYER_CONFIG.bulletCount;
    this.lastDirection = 0;
    this.canvas = canvas;
    this.gameTime = 0;
    this.hasMagnet = false;
    this.magnetDuration = 0;
    this.isInvincible = false;
    this.invincibleDuration = 0;
  }

  updateSpeed(gameSpeed) {
    this.speed = this.baseSpeed * gameSpeed;
  }

  move(keys) {
    this.dx = 0;
    this.dy = 0;

    if (keys["w"] || keys["ArrowUp"]) this.dy = -this.speed;
    if (keys["s"] || keys["ArrowDown"]) this.dy = this.speed;
    if (keys["a"] || keys["ArrowLeft"]) this.dx = -this.speed;
    if (keys["d"] || keys["ArrowRight"]) this.dx = this.speed;

    if (this.dx !== 0 || this.dy !== 0) {
      this.lastDirection = Math.atan2(this.dy, this.dx);
    } else {
      this.lastDirection = this.lastDirection || 0;
    }

    this.x += this.dx;
    this.y += this.dy;

    // 화면 밖으로 나가지 않게 제한
    this.x = Math.max(0, Math.min(this.canvas.width - this.size, this.x));
    this.y = Math.max(0, Math.min(this.canvas.height - this.size, this.y));
  }

  checkLevelUp() {
    if (this.exp >= this.expToNextLevel) {
      this.exp = 0;
      this.level++;
      this.expToNextLevel += 50;
      this.bulletCount++;
    }
  }

  update() {
    this.gameTime += 1 / 60;

    if (this.hasMagnet) {
      this.magnetDuration -= 1 / 60;
      if (this.magnetDuration <= 0) {
        this.hasMagnet = false;
      }
    }

    if (this.isInvincible) {
      this.invincibleDuration -= 1 / 60;
      if (this.invincibleDuration <= 0) {
        this.isInvincible = false;
      }
    }
  }

  reset() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.hp = PLAYER_CONFIG.hp;
    this.level = PLAYER_CONFIG.level;
    this.exp = PLAYER_CONFIG.exp;
    this.expToNextLevel = PLAYER_CONFIG.expToNextLevel;
    this.bulletCount = PLAYER_CONFIG.bulletCount;
    this.gameTime = 0;
    this.hasMagnet = false;
    this.magnetDuration = 0;
    this.isInvincible = false;
    this.invincibleDuration = 0;
  }

  activateInvincibility() {
    this.isInvincible = true;
    this.invincibleDuration = 0.5;
  }
}

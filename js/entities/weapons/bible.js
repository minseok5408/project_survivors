import { BIBLE_CONFIG } from "../../config/index.js";

class Bible {
  constructor(angle) {
    this.angle = angle;
    this.size = BIBLE_CONFIG.size;
    this.x = 0;
    this.y = 0;
  }
}

export class BibleManager {
  constructor() {
    this.bibles = [];
    this.currentGameSpeed = 1;
    this._angleBase = 0;
    this._desiredCount = 0; // 외부에서 무기 레벨로 세팅
  }

  updateSpeed(gameSpeed) {
    this.currentGameSpeed = gameSpeed;
  }

  setCount(count) {
    const clamped = Math.min(Math.max(0, count), BIBLE_CONFIG.maxCount);
    this._desiredCount = clamped;
  }

  clear() {
    this.bibles = [];
    this._angleBase = 0;
    this.currentGameSpeed = 1;
  }

  update(player) {
    if (!player) return;

    const desired = this._desiredCount;
    const diff = desired - this.bibles.length;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        const idx = this.bibles.length + i;
        const angle = (2 * Math.PI * idx) / Math.max(1, desired);
        this.bibles.push(new Bible(angle));
      }
    } else if (diff < 0) {
      this.bibles.length = desired;
    }

    // 회전
    const dt = 1 / 60;
    this._angleBase += BIBLE_CONFIG.rotationSpeed * this.currentGameSpeed * dt;

    // 위치 갱신
    const cx = player.x + player.size / 2;
    const cy = player.y + player.size / 2;
    const r = BIBLE_CONFIG.radius;
    const N = this.bibles.length || 1;

    for (let i = 0; i < N; i++) {
      const b = this.bibles[i];
      const targetAngle = this._angleBase + (2 * Math.PI * i) / N;
      b.angle = targetAngle;
      b.x = cx + Math.cos(targetAngle) * r;
      b.y = cy + Math.sin(targetAngle) * r;
    }
  }
}

// js/core/UI.js
export class UI {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  drawHealthBar(player) {
    const hpBarWidth = player.size;
    const hpBarHeight = 5;
    const hpX = player.x + player.size / 2 - hpBarWidth / 2;
    const hpY = player.y - 10;

    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(hpX, hpY, hpBarWidth, hpBarHeight);
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(hpX, hpY, (player.hp / 100) * hpBarWidth, hpBarHeight);
  }

  drawExpBar(player) {
    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(0, 0, this.canvas.width, 10);
    this.ctx.fillStyle = "yellow";
    this.ctx.fillRect(
      0,
      0,
      (player.exp / player.expToNextLevel) * this.canvas.width,
      10
    );
  }

  drawStats(player, killCount) {
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(`Level: ${player.level}`, 20, 50);

    const minutes = Math.floor(player.gameTime / 60);
    const seconds = Math.floor(player.gameTime % 60);
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    this.ctx.fillText(timeString, this.canvas.width / 2 - 40, 50);

    this.ctx.fillText(`Kills: ${killCount}`, this.canvas.width - 120, 50);
  }

  drawHeart(heart) {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();

    const x = heart.x;
    const y = heart.y;
    const size = heart.size;

    this.ctx.arc(x - size / 4, y - size / 4, size / 2, 0, Math.PI * 2);
    this.ctx.arc(x + size / 4, y - size / 4, size / 2, 0, Math.PI * 2);

    this.ctx.moveTo(x - size / 2, y);
    this.ctx.lineTo(x + size / 2, y);
    this.ctx.lineTo(x, y + size);

    this.ctx.closePath();
    this.ctx.fill();
  }

  drawGameOver() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.ctx.font = "50px Arial";
    this.ctx.fillText(
      "GAME OVER",
      this.canvas.width / 2 - 150,
      this.canvas.height / 2
    );
    this.ctx.font = "20px Arial";
    this.ctx.fillText(
      "Press Retry to Restart",
      this.canvas.width / 2 - 100,
      this.canvas.height / 2 + 40
    );
  }

  // ====== 인벤토리(무기/패시브) ======
  drawInventoryBelowLevel(hud = { weapons: [], passives: [] }) {
    const ctx = this.ctx;
    const anchorX = 20;
    let y = 50 + 24;

    const slotW = 36;
    const slotH = 36;
    const gap = 8;
    const slots = 5;
    const borderColor = "rgba(255,255,255,0.35)";
    const fillEmpty = "rgba(255,255,255,0.06)";

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "14px Arial";
    ctx.fillText("Weapons", anchorX, y);

    y += 8;
    for (let i = 0; i < slots; i++) {
      const sx = anchorX + i * (slotW + gap);
      const sy = y;
      this._slot(ctx, sx, sy, slotW, slotH, borderColor, fillEmpty);
      const weapon = hud.weapons && hud.weapons[i];
      if (weapon) this._weaponIcon(weapon, sx, sy, slotW);
    }

    y += slotH + 18;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "14px Arial";
    ctx.fillText("Passives", anchorX, y);

    y += 8;
    for (let i = 0; i < slots; i++) {
      const sx = anchorX + i * (slotW + gap);
      const sy = y;
      this._slot(ctx, sx, sy, slotW, slotH, borderColor, fillEmpty);
      const passive = hud.passives && hud.passives[i];
      if (passive) this._passiveIcon(passive, sx, sy, slotW);
    }
  }

  _slot(ctx, x, y, w, h, borderColor, fillEmpty) {
    this._roundRectPath(ctx, x, y, w, h, 6);
    ctx.fillStyle = fillEmpty;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  _roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  _weaponIcon(kind, x, y, size) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    if (kind === "bullet") {
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(-3, -10, 6, 20);
    } else if (kind === "bible") {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.18);
      ctx.lineTo(0, size * 0.18);
      ctx.moveTo(-size * 0.18, 0);
      ctx.lineTo(size * 0.18, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  _passiveIcon(kind, x, y, size) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    if (kind === "magnet") {
      ctx.strokeStyle = "#a29bfe";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 2, size * 0.28, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = "#a29bfe";
      ctx.fillRect(-size * 0.28, -size * 0.2, size * 0.18, size * 0.18);
      ctx.fillRect(size * 0.1, -size * 0.2, size * 0.18, size * 0.18);
    } else if (kind === "thunder") {
      ctx.fillStyle = "#ffe66d";
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(2, -2);
      ctx.lineTo(-2, -2);
      ctx.lineTo(4, 10);
      ctx.lineTo(-2, 2);
      ctx.lineTo(2, 2);
      ctx.closePath();
      ctx.fill();
    } else if (kind === "heart") {
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.bezierCurveTo(8, -2, 6, -10, 0, -4);
      ctx.bezierCurveTo(-6, -10, -8, -2, 0, 6);
      ctx.fill();
    }
    ctx.restore();
  }

  drawEntityHpBar(entity) {
    const ctx = this.ctx;
    const w = Math.max(20, entity.size);
    const h = entity.isBoss ? 8 : 4;
    const x = entity.x + entity.size / 2 - w / 2;
    const y = entity.y - (entity.isBoss ? 14 : 8);

    const max = entity.maxHp || entity.hp || 1;
    const ratio = Math.max(0, Math.min(1, (entity.hp || 0) / max));

    // 배경
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);

    // 빈바
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(x, y, w, h);

    // 체력
    ctx.fillStyle = entity.isBoss ? "#a78bfa" : "#4caf50";
    ctx.fillRect(x, y, w * ratio, h);

    // 테두리
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
}

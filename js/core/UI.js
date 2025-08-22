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

    // 경과 시간 계산 및 표시
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

    // 왼쪽 원
    this.ctx.arc(x - size / 4, y - size / 4, size / 2, 0, Math.PI * 2);

    // 오른쪽 원
    this.ctx.arc(x + size / 4, y - size / 4, size / 2, 0, Math.PI * 2);

    // 하단 삼각형 모양
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
}

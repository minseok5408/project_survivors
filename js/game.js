import { CANVAS_WIDTH, CANVAS_HEIGHT, ITEM_CONFIG } from "./config.js";
import { Player } from "./player.js";
import { BulletManager } from "./bullet.js";
import { EnemyManager } from "./enemy.js";
import { ItemManager } from "./item.js";
import { UI } from "./ui.js";

// 캔버스 설정
const canvas = document.getElementById("gameCanvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// 버튼 요소 가져오기
const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");

// 게임 상태 변수
let isGameOver = false;
let isGameStarted = false;
let isPaused = false;
let gameLoopId = null;
let killCount = 0;
let isThunderActive = false; // 천둥 효과 상태
let thunderDuration = 0; // 천둥 효과 지속 시간
let lastSpawnRateIncrease = 0; // 마지막으로 스폰 속도가 증가한 시간
let gameSpeed = 1; // 게임 속도 (기본값: 1배속)

// 게임 속도 옵션
const SPEED_OPTIONS = [
  { value: 0.25, label: "0.25배속" },
  { value: 0.5, label: "0.5배속" },
  { value: 1, label: "1배속" },
  { value: 1.5, label: "1.5배속" },
  { value: 2, label: "2배속" },
];

// 게임 객체 생성
const player = new Player(canvas);
const bulletManager = new BulletManager();
const enemyManager = new EnemyManager(canvas);
const itemManager = new ItemManager();
const ui = new UI(canvas);

// 게임 루프 시작 함수
function startGameLoop() {
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  gameLoopId = requestAnimationFrame(update);
}

// 키 입력 처리
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === "Escape" && isGameStarted && !isGameOver) {
    isPaused = !isPaused;
  }
  // 숫자 키로 게임 속도 변경 (일시정지 상태에서만)
  if (isPaused && !isGameOver) {
    if (e.key >= "1" && e.key <= "5") {
      const speedIndex = parseInt(e.key) - 1;
      if (speedIndex < SPEED_OPTIONS.length) {
        gameSpeed = SPEED_OPTIONS[speedIndex].value;
        player.updateSpeed(gameSpeed);
        enemyManager.updateSpeed(gameSpeed);
        bulletManager.updateSpeed(gameSpeed);
        itemManager.updateSpeed(gameSpeed); // ItemManager의 속도도 업데이트
      }
    }
  }
});
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// 시작 버튼 클릭 시 게임 시작
startButton.addEventListener("click", () => {
  isGameStarted = true;
  startButton.style.display = "none";
  retryButton.style.display = "none";
  resetGame();
  startGameLoop(); // 게임 시작 버튼을 눌렀을 때만 게임 루프 시작
});

// 리트라이 버튼 클릭 시 게임 재시작
retryButton.addEventListener("click", () => {
  resetGame();
  startGameLoop();
  retryButton.style.display = "none";
});

// 게임 초기화 함수
function resetGame() {
  isGameOver = false;
  player.reset();
  bulletManager.clear();
  enemyManager.clear();
  itemManager.clear();
  killCount = 0;
  enemyManager.spawn();
}

// 충돌 감지
function checkCollisions() {
  // 총알과 적 충돌
  bulletManager.bullets.forEach((bullet, bIndex) => {
    enemyManager.enemies.forEach((enemy, eIndex) => {
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bullet.size + enemy.size) {
        bulletManager.bullets.splice(bIndex, 1);
        enemyManager.enemies.splice(eIndex, 1);
        killCount++;
        itemManager.dropGem(enemy.x, enemy.y);
        itemManager.dropHeart(enemy.x, enemy.y);
        itemManager.dropMagnet(enemy.x, enemy.y);
        itemManager.dropThunder(enemy.x, enemy.y); // 천둥 아이템 드롭 추가
      }
    });
  });

  // 적과 플레이어 충돌
  enemyManager.enemies.forEach((enemy, eIndex) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + enemy.size && !player.isInvincible) {
      player.hp -= 10;
      player.activateInvincibility(); // 무적 시간 활성화
      enemyManager.enemies.splice(eIndex, 1);

      if (player.hp <= 0) {
        player.hp = 0;
        gameOver();
      }
    }
  });

  // 플레이어가 경험치 보석 먹기
  itemManager.gems.forEach((gem, gIndex) => {
    const dx = player.x - gem.x;
    const dy = player.y - gem.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + gem.size) {
      player.exp += 10;
      itemManager.gems.splice(gIndex, 1);
      player.checkLevelUp();
    }
  });

  // 플레이어가 하트 먹기
  itemManager.hearts.forEach((heart, hIndex) => {
    const dx = player.x - heart.x;
    const dy = player.y - heart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + heart.size) {
      player.hp = Math.min(player.hp + 50, 100);
      itemManager.hearts.splice(hIndex, 1);
    }
  });

  // 플레이어가 자석 아이템 먹기
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

  // 플레이어가 천둥 아이템 먹기
  itemManager.thunders.forEach((thunder, tIndex) => {
    const dx = player.x - thunder.x;
    const dy = player.y - thunder.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.size + thunder.size) {
      // 모든 적 처치
      enemyManager.enemies.forEach((enemy) => {
        itemManager.dropGem(enemy.x, enemy.y);
        itemManager.dropHeart(enemy.x, enemy.y);
        itemManager.dropMagnet(enemy.x, enemy.y);
        itemManager.dropThunder(enemy.x, enemy.y);
      });
      killCount += enemyManager.enemies.length;
      enemyManager.enemies = [];

      // 천둥 효과 활성화
      isThunderActive = true;
      thunderDuration = 0.5; // 0.5초 동안 효과 지속

      itemManager.thunders.splice(tIndex, 1);
    }
  });
}

// 게임 오버 처리 함수
function gameOver() {
  isGameOver = true;
  ui.drawGameOver();
  retryButton.style.display = "block";
  cancelAnimationFrame(gameLoopId);
}

// 게임 루프
function update() {
  // 화면 초기화
  ui.ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isGameOver && !isPaused) {
    // 천둥 효과 업데이트
    if (isThunderActive) {
      thunderDuration -= (1 / 60) * gameSpeed;
      if (thunderDuration <= 0) {
        isThunderActive = false;
      }
    }

    // 5분마다 적 생성 속도 증가
    const currentTime = player.gameTime;
    if (currentTime - lastSpawnRateIncrease >= 300) {
      enemyManager.spawnRate *= 2;
      lastSpawnRateIncrease = currentTime;
    }

    // 플레이어 이동 및 시간 업데이트
    player.move(keys);
    player.update();

    // 탄막 발사 및 업데이트
    bulletManager.shoot(player);
    bulletManager.update();

    // 플레이어 그리기
    ui.ctx.fillStyle = "blue";
    ui.ctx.fillRect(player.x, player.y, player.size, player.size);

    // UI 요소 그리기
    ui.drawHealthBar(player);
    ui.drawExpBar(player);
    ui.drawStats(player, killCount);

    // 총알 처리
    bulletManager.bullets.forEach((bullet) => {
      ui.ctx.fillStyle = "yellow";
      ui.ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    });

    // 적 처리
    enemyManager.update(player);
    enemyManager.enemies.forEach((enemy) => {
      ui.ctx.fillStyle = "red";
      ui.ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });

    // 아이템 처리
    itemManager.update(player);

    // 보석 처리
    itemManager.gems.forEach((gem) => {
      ui.ctx.fillStyle = "cyan";
      ui.ctx.fillRect(gem.x, gem.y, gem.size, gem.size);
    });

    // 하트 처리
    itemManager.hearts.forEach((heart) => ui.drawHeart(heart));

    // 자석 아이템 처리
    itemManager.magnets.forEach((magnet) => {
      ui.ctx.fillStyle = "purple";
      ui.ctx.fillRect(magnet.x, magnet.y, magnet.size, magnet.size);
    });

    // 천둥 아이템 처리
    itemManager.thunders.forEach((thunder) => {
      ui.ctx.fillStyle = "yellow";
      ui.ctx.fillRect(thunder.x, thunder.y, thunder.size, thunder.size);
    });

    // 천둥 효과 표시
    if (isThunderActive) {
      ui.ctx.fillStyle = `rgba(255, 255, 0, ${thunderDuration})`;
      ui.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 충돌 처리
    checkCollisions();

    // 적 생성 (수정된 스폰 속도 사용)
    if (Math.random() < enemyManager.spawnRate * gameSpeed) {
      enemyManager.spawn();
    }
  }

  // 게임 오버나 일시정지 상태일 때 해당 화면 표시
  if (isGameOver) {
    ui.drawGameOver();
  } else if (isPaused) {
    drawPauseScreen();
  }

  gameLoopId = requestAnimationFrame(update);
}

// UI 클래스에 일시정지 화면 그리기 메서드 추가
function drawPauseScreen() {
  ui.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ui.ctx.fillRect(0, 0, canvas.width, canvas.height);
  ui.ctx.fillStyle = "white";
  ui.ctx.font = "50px Arial";
  ui.ctx.fillText("PAUSED", canvas.width / 2 - 100, canvas.height / 2);
  ui.ctx.font = "20px Arial";
  ui.ctx.fillText(
    "Press ESC to Resume",
    canvas.width / 2 - 100,
    canvas.height / 2 + 40
  );

  // 게임 속도 옵션 표시
  ui.ctx.font = "24px Arial";
  ui.ctx.fillText(
    "Game Speed:",
    canvas.width / 2 - 100,
    canvas.height / 2 + 100
  );

  SPEED_OPTIONS.forEach((option, index) => {
    const baseX = canvas.width / 2 - 200;
    const spacing = 150; // 간격을 150으로 늘림
    const x = baseX + index * spacing;
    const y = canvas.height / 2 + 140;
    const isSelected = gameSpeed === option.value;

    ui.ctx.fillStyle = isSelected ? "yellow" : "white";
    ui.ctx.fillText(`${index + 1}: ${option.label}`, x, y);
  });
}

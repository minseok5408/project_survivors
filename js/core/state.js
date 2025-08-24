// js/core/state.js
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../config/index.js";
import { Player } from "../entities/players/player.js";
import { BulletManager } from "../entities/weapons/bullet.js";
import { EnemyManager } from "../entities/enemies/enemy.js";
import { ItemManager } from "../entities/items/item.js";
import { UI } from "./../core/UI.js"; // 경로가 js/core/UI.js이면 그대로 사용

export function createState() {
  const canvas = document.getElementById("gameCanvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const startButton = document.getElementById("startButton");
  const retryButton = document.getElementById("retryButton");

  const bulletManager = new BulletManager();
  const enemyManager = new EnemyManager(canvas);
  const itemManager = new ItemManager();
  const ui = new UI(canvas);

  const state = {
    // 화면/컨트롤
    canvas,
    ui,
    startButton,
    retryButton,

    // 게임 플래그
    isGameOver: false,
    isGameStarted: false,
    isPaused: false,

    // ✅ 기본 실제 배속을 0.5로: 표시상 1배속이 됨
    gameSpeed: 0.5,

    lastSpawnRateIncrease: 0,

    // 통계
    killCount: 0,
    isThunderActive: false,
    thunderDuration: 0,

    // 입력
    keys: {},

    // 엔티티/매니저
    player: null,
    managers: {
      bulletManager,
      enemyManager,
      itemManager,
    },

    // 무기
    activeWeapon: "bullet", // "bullet" | "bible"
  };

  return state;
}

export function createPlayer(state, character) {
  state.player = new Player(state.canvas, character);
}

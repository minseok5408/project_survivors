// 캔버스 설정
export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 900;

// 플레이어 기본 설정
export const PLAYER_CONFIG = {
  size: 20,
  speed: 4,
  hp: 100,
  level: 1,
  exp: 0,
  expToNextLevel: 100,
  bulletCount: 1,
};

// 총알 설정
export const BULLET_CONFIG = {
  size: 5,
  speed: 10,
  damage: 10,
  fireRate: 200, // 발사 간격 (밀리초)
};

// 적 설정
export const ENEMY_CONFIG = {
  size: 25,
  speed: 1.5,
  spawnRate: 0.02,
};

// 아이템 설정
export const ITEM_CONFIG = {
  gem: {
    size: 10,
    expAmount: 10,
    speed: 3, // 젬이 플레이어를 향해 이동하는 속도
  },
  heart: {
    size: 10,
    healAmount: 50,
    dropRate: 0.05, // 하트 아이템 드롭 확률 5%
  },
  magnet: {
    size: 10,
    duration: 5, // 자석 효과 지속 시간 (초)
    dropRate: 0.03, // 자석 아이템 드롭 확률 3%
  },
  thunder: {
    size: 10,
    dropRate: 0.01, // 천둥 아이템 드롭 확률 1%
  },
};

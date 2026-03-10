export const GRID_SIZE = 40;
export const COLS = 20;
export const ROWS = 15;
export const CANVAS_WIDTH = COLS * GRID_SIZE;
export const CANVAS_HEIGHT = ROWS * GRID_SIZE;

// 0: Buildable, 1: Path, 2: Base
export const MAP_GRID = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const WAYPOINTS = [
  { x: 0, y: 2 },
  { x: 15, y: 2 },
  { x: 15, y: 10 },
  { x: 5, y: 10 },
  { x: 5, y: 13 },
  { x: 19, y: 13 },
];

export const TOWER_TYPES = {
  soldier: {
    name: 'Soldier',
    cost: 50,
    range: 100,
    damage: 10,
    cooldown: 60, // frames (1 sec at 60fps)
    color: '#3b82f6', // blue
    projectileSpeed: 5,
  },
  flame: {
    name: 'Flame',
    cost: 100,
    range: 80,
    damage: 2,
    cooldown: 5,
    color: '#ef4444', // red
    projectileSpeed: 8,
  },
  sniper: {
    name: 'Sniper',
    cost: 150,
    range: 250,
    damage: 50,
    cooldown: 120,
    color: '#10b981', // green
    projectileSpeed: 15,
  },
};

export const ENEMY_TYPES = {
  basic: {
    health: 30,
    speed: 1,
    damage: 1,
    reward: 5,
    color: '#f59e0b', // amber
    radius: 10,
  },
  fast: {
    health: 20,
    speed: 2,
    damage: 1,
    reward: 8,
    color: '#eab308', // yellow
    radius: 8,
  },
  tank: {
    health: 150,
    speed: 0.6,
    damage: 3,
    reward: 20,
    color: '#78350f', // dark brown
    radius: 14,
  },
  boss: {
    health: 500,
    speed: 0.5,
    damage: 10,
    reward: 100,
    color: '#4c1d95', // purple
    radius: 20,
  },
};

export const WAVES = [
  [
    { type: 'basic', count: 10, interval: 60 },
  ],
  [
    { type: 'basic', count: 15, interval: 50 },
    { type: 'fast', count: 5, interval: 40 },
  ],
  [
    { type: 'basic', count: 10, interval: 40 },
    { type: 'tank', count: 5, interval: 80 },
    { type: 'fast', count: 10, interval: 30 },
  ],
  [
    { type: 'tank', count: 15, interval: 60 },
    { type: 'fast', count: 15, interval: 30 },
  ],
  [
    { type: 'boss', count: 1, interval: 100 },
    { type: 'tank', count: 10, interval: 50 },
  ],
];

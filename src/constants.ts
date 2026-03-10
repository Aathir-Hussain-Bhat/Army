export const GRID_SIZE = 40;
export const COLS = 20;
export const ROWS = 15;
export const CANVAS_WIDTH = COLS * GRID_SIZE;
export const CANVAS_HEIGHT = ROWS * GRID_SIZE;

// 0: Buildable, 1: Path, 2: Base
export const MAP_GRID = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const WAYPOINTS = [
  { x: 0, y: 1 },
  { x: 4, y: 1 },
  { x: 4, y: 3 },
  { x: 10, y: 3 },
  { x: 10, y: 6 },
  { x: 16, y: 6 },
  { x: 16, y: 10 },
  { x: 8, y: 10 },
  { x: 8, y: 13 },
  { x: 19, y: 13 },
];

export const TOWER_TYPES = {
  blaster: {
    name: 'Blaster',
    cost: 50,
    range: 100,
    damage: 10,
    cooldown: 40, // frames (1 sec at 60fps)
    color: '#06b6d4', // cyan
    projectileSpeed: 8,
  },
  plasma: {
    name: 'Plasma',
    cost: 100,
    range: 80,
    damage: 3,
    cooldown: 5,
    color: '#d946ef', // fuchsia
    projectileSpeed: 10,
  },
  railgun: {
    name: 'Railgun',
    cost: 150,
    range: 250,
    damage: 60,
    cooldown: 120,
    color: '#10b981', // emerald
    projectileSpeed: 20,
  },
};

export const ENEMY_TYPES = {
  glitch: {
    health: 30,
    speed: 1.2,
    damage: 1,
    reward: 5,
    color: '#f97316', // orange
    radius: 10,
  },
  runner: {
    health: 20,
    speed: 2.5,
    damage: 1,
    reward: 8,
    color: '#eab308', // yellow
    radius: 8,
  },
  brute: {
    health: 180,
    speed: 0.7,
    damage: 3,
    reward: 20,
    color: '#ef4444', // red
    radius: 14,
  },
  virus: {
    health: 600,
    speed: 0.6,
    damage: 10,
    reward: 100,
    color: '#8b5cf6', // violet
    radius: 20,
  },
};

export const WAVES = [
  [
    { type: 'glitch', count: 10, interval: 60 },
  ],
  [
    { type: 'glitch', count: 15, interval: 50 },
    { type: 'runner', count: 5, interval: 40 },
  ],
  [
    { type: 'glitch', count: 10, interval: 40 },
    { type: 'brute', count: 5, interval: 80 },
    { type: 'runner', count: 10, interval: 30 },
  ],
  [
    { type: 'brute', count: 15, interval: 60 },
    { type: 'runner', count: 15, interval: 30 },
  ],
  [
    { type: 'virus', count: 1, interval: 100 },
    { type: 'brute', count: 10, interval: 50 },
  ],
];

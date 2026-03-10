export interface Point {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  type: string;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  reward: number;
  color: string;
  radius: number;
  waypointIndex: number;
}

export interface Tower {
  id: string;
  type: string;
  x: number;
  y: number;
  col: number;
  row: number;
  range: number;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  color: string;
  projectileSpeed: number;
  level: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  damage: number;
  speed: number;
  color: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'gameover' | 'victory';
  coins: number;
  baseHealth: number;
  maxBaseHealth: number;
  wave: number;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  particles: Particle[];
  waveTimer: number;
  enemiesToSpawn: { type: string; timer: number }[];
  unlockedTowers: string[];
}

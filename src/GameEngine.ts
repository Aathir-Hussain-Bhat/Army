import { GameState, Enemy, Tower, Projectile, Particle } from './types';
import { GRID_SIZE, WAYPOINTS, TOWER_TYPES, ENEMY_TYPES, WAVES, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

export class GameEngine {
  state: GameState;
  ctx: CanvasRenderingContext2D | null = null;
  onStateChange: (state: GameState) => void;

  constructor(onStateChange: (state: GameState) => void) {
    this.onStateChange = onStateChange;
    this.state = this.getInitialState();
  }

  getInitialState(): GameState {
    return {
      status: 'menu',
      coins: 150,
      baseHealth: 20,
      maxBaseHealth: 20,
      wave: 0,
      enemies: [],
      towers: [],
      projectiles: [],
      particles: [],
      waveTimer: 0,
      enemiesToSpawn: [],
      unlockedTowers: ['blaster'],
    };
  }

  setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  saveGame() {
    const saveData = {
      coins: this.state.coins,
      baseHealth: this.state.baseHealth,
      wave: this.state.wave,
      towers: this.state.towers,
      unlockedTowers: this.state.unlockedTowers,
    };
    localStorage.setItem('warriors_save', JSON.stringify(saveData));
  }

  loadGame() {
    const data = localStorage.getItem('warriors_save');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.state.coins = parsed.coins;
        this.state.baseHealth = parsed.baseHealth;
        this.state.wave = parsed.wave;
        this.state.towers = parsed.towers;
        this.state.unlockedTowers = parsed.unlockedTowers || ['blaster'];
        this.state.enemies = [];
        this.state.projectiles = [];
        this.state.particles = [];
        this.state.enemiesToSpawn = [];
        this.state.status = 'playing';
        this.startWave(this.state.wave);
        this.notify();
        return true;
      } catch (e) {
        console.error('Failed to load save', e);
      }
    }
    return false;
  }

  startGame() {
    this.state = this.getInitialState();
    this.state.status = 'playing';
    this.startWave(0);
    this.notify();
  }

  startWave(waveIndex: number) {
    if (waveIndex >= WAVES.length) {
      this.state.status = 'victory';
      this.notify();
      return;
    }

    this.state.wave = waveIndex;
    this.state.enemiesToSpawn = [];
    
    if (waveIndex >= 1 && !this.state.unlockedTowers.includes('plasma')) {
      this.state.unlockedTowers.push('plasma');
    }
    if (waveIndex >= 3 && !this.state.unlockedTowers.includes('railgun')) {
      this.state.unlockedTowers.push('railgun');
    }
    
    let delay = 0;
    WAVES[waveIndex].forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        this.state.enemiesToSpawn.push({
          type: group.type,
          timer: delay + i * group.interval,
        });
      }
      delay += group.count * group.interval + 60; // gap between groups
    });
    
    this.notify();
  }

  placeTower(col: number, row: number, type: keyof typeof TOWER_TYPES) {
    const towerDef = TOWER_TYPES[type];
    if (this.state.coins >= towerDef.cost) {
      this.state.coins -= towerDef.cost;
      this.state.towers.push({
        id: generateId(),
        type,
        x: col * GRID_SIZE + GRID_SIZE / 2,
        y: row * GRID_SIZE + GRID_SIZE / 2,
        col,
        row,
        range: towerDef.range,
        damage: towerDef.damage,
        cooldown: towerDef.cooldown,
        currentCooldown: 0,
        color: towerDef.color,
        projectileSpeed: towerDef.projectileSpeed,
        level: 1,
      });
      this.notify();
      return true;
    }
    return false;
  }

  update() {
    if (this.state.status !== 'playing') return;

    this.updateSpawns();
    this.updateEnemies();
    this.updateTowers();
    this.updateProjectiles();
    this.updateParticles();

    // Check wave end
    if (this.state.enemies.length === 0 && this.state.enemiesToSpawn.length === 0) {
      if (this.state.wave < WAVES.length - 1) {
        this.state.waveTimer++;
        if (this.state.waveTimer > 180) { // 3 seconds between waves
          this.state.waveTimer = 0;
          this.startWave(this.state.wave + 1);
        }
      } else {
        this.state.status = 'victory';
        this.notify();
      }
    }

    this.notify();
  }

  updateSpawns() {
    for (let i = this.state.enemiesToSpawn.length - 1; i >= 0; i--) {
      const spawn = this.state.enemiesToSpawn[i];
      spawn.timer--;
      if (spawn.timer <= 0) {
        const enemyDef = ENEMY_TYPES[spawn.type as keyof typeof ENEMY_TYPES];
        const startPoint = WAYPOINTS[0];
        this.state.enemies.push({
          id: generateId(),
          type: spawn.type,
          x: startPoint.x * GRID_SIZE + GRID_SIZE / 2,
          y: startPoint.y * GRID_SIZE + GRID_SIZE / 2,
          health: enemyDef.health,
          maxHealth: enemyDef.health,
          speed: enemyDef.speed,
          damage: enemyDef.damage,
          reward: enemyDef.reward,
          color: enemyDef.color,
          radius: enemyDef.radius,
          waypointIndex: 1,
        });
        this.state.enemiesToSpawn.splice(i, 1);
      }
    }
  }

  updateEnemies() {
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];
      const targetWp = WAYPOINTS[enemy.waypointIndex];
      
      if (!targetWp) {
        // Reached end
        this.state.baseHealth -= enemy.damage;
        this.state.enemies.splice(i, 1);
        if (this.state.baseHealth <= 0) {
          this.state.status = 'gameover';
        }
        continue;
      }

      const targetX = targetWp.x * GRID_SIZE + GRID_SIZE / 2;
      const targetY = targetWp.y * GRID_SIZE + GRID_SIZE / 2;

      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < enemy.speed) {
        enemy.x = targetX;
        enemy.y = targetY;
        enemy.waypointIndex++;
      } else {
        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
      }
    }
  }

  updateTowers() {
    this.state.towers.forEach(tower => {
      if (tower.currentCooldown > 0) {
        tower.currentCooldown--;
      } else {
        // Find target
        let target: Enemy | null = null;
        let minD = tower.range;

        for (const enemy of this.state.enemies) {
          const dx = enemy.x - tower.x;
          const dy = enemy.y - tower.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= minD) {
            minD = dist;
            target = enemy;
          }
        }

        if (target) {
          this.state.projectiles.push({
            id: generateId(),
            x: tower.x,
            y: tower.y,
            targetId: target.id,
            damage: tower.damage,
            speed: tower.projectileSpeed,
            color: tower.color,
          });
          tower.currentCooldown = tower.cooldown;
        }
      }
    });
  }

  updateProjectiles() {
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i];
      const target = this.state.enemies.find(e => e.id === proj.targetId);

      if (!target) {
        this.state.projectiles.splice(i, 1);
        continue;
      }

      const dx = target.x - proj.x;
      const dy = target.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < proj.speed) {
        // Hit
        target.health -= proj.damage;
        this.createExplosion(target.x, target.y, proj.color);
        this.state.projectiles.splice(i, 1);

        if (target.health <= 0) {
          this.state.coins += target.reward;
          const enemyIndex = this.state.enemies.findIndex(e => e.id === target.id);
          if (enemyIndex !== -1) {
            this.state.enemies.splice(enemyIndex, 1);
          }
        }
      } else {
        proj.x += (dx / dist) * proj.speed;
        proj.y += (dy / dist) * proj.speed;
      }
    }
  }

  createExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 5; i++) {
      this.state.particles.push({
        id: generateId(),
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 20,
        maxLife: 20,
        color,
        size: Math.random() * 3 + 1,
      });
    }
  }

  updateParticles() {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw path (neon circuit style)
    ctx.strokeStyle = '#1e1b4b'; // dark violet path
    ctx.lineWidth = GRID_SIZE;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    WAYPOINTS.forEach((wp, i) => {
      const x = wp.x * GRID_SIZE + GRID_SIZE / 2;
      const y = wp.y * GRID_SIZE + GRID_SIZE / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Inner glowing line for path
    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw base (neon core)
    const lastWp = WAYPOINTS[WAYPOINTS.length - 1];
    ctx.fillStyle = '#0ea5e9';
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 15;
    ctx.fillRect(lastWp.x * GRID_SIZE + 4, lastWp.y * GRID_SIZE + 4, GRID_SIZE - 8, GRID_SIZE - 8);
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 0;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CORE', lastWp.x * GRID_SIZE + GRID_SIZE / 2, lastWp.y * GRID_SIZE + GRID_SIZE / 2);

    // Draw towers
    this.state.towers.forEach(tower => {
      ctx.fillStyle = '#0f172a'; // dark base
      ctx.strokeStyle = tower.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = tower.color;
      ctx.shadowBlur = 10;
      
      // Tower base
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(tower.col * GRID_SIZE + 6, tower.row * GRID_SIZE + 6, GRID_SIZE - 12, GRID_SIZE - 12, 4);
      } else {
        ctx.rect(tower.col * GRID_SIZE + 6, tower.row * GRID_SIZE + 6, GRID_SIZE - 12, GRID_SIZE - 12);
      }
      ctx.fill();
      ctx.stroke();
      
      // Turret
      ctx.fillStyle = tower.color;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw enemies
    this.state.enemies.forEach(enemy => {
      ctx.fillStyle = '#000';
      ctx.strokeStyle = enemy.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = enemy.color;
      ctx.shadowBlur = 8;
      
      ctx.beginPath();
      // Draw as a diamond/polygon for cyber feel
      ctx.moveTo(enemy.x, enemy.y - enemy.radius);
      ctx.lineTo(enemy.x + enemy.radius, enemy.y);
      ctx.lineTo(enemy.x, enemy.y + enemy.radius);
      ctx.lineTo(enemy.x - enemy.radius, enemy.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Health bar
      const hpPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x - 12, enemy.y - enemy.radius - 8, 24, 3);
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x - 12, enemy.y - enemy.radius - 8, 24 * hpPercent, 3);
    });

    // Draw projectiles
    this.state.projectiles.forEach(proj => {
      ctx.fillStyle = proj.color;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw particles
    this.state.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 5;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });
  }

  notify() {
    // We create a shallow copy so React detects the change
    this.onStateChange({ ...this.state });
  }
}

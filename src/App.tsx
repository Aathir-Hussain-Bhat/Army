import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './GameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, MAP_GRID, TOWER_TYPES } from './constants';
import { GameState } from './types';
import { Coins, Heart, Shield, Play, RotateCcw, Save, Download, Lock } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTower, setSelectedTower] = useState<keyof typeof TOWER_TYPES>('blaster');
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = () => {
    engineRef.current?.saveGame();
    setToast('Game Saved!');
    setTimeout(() => setToast(null), 2000);
  };

  const handleLoad = () => {
    const success = engineRef.current?.loadGame();
    if (success) {
      setToast('Game Loaded!');
    } else {
      setToast('No saved game found.');
    }
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new GameEngine((state) => {
        setGameState(state);
      });
    }

    const canvas = canvasRef.current;
    if (canvas && engineRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        engineRef.current.setContext(ctx);
        engineRef.current.draw();
      }
    }

    let animationFrameId: number;
    const loop = () => {
      if (engineRef.current) {
        engineRef.current.update();
        engineRef.current.draw();
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || gameState?.status !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / GRID_SIZE);
    const row = Math.floor(y / GRID_SIZE);

    if (col >= 0 && col < MAP_GRID[0].length && row >= 0 && row < MAP_GRID.length) {
      if (MAP_GRID[row][col] === 0) {
        // Check if tower already exists
        const hasTower = gameState.towers.some(t => t.col === col && t.row === row);
        if (!hasTower) {
          engineRef.current.placeTower(col, row, selectedTower);
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState?.status !== 'playing') {
      setHoverCell(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / GRID_SIZE);
    const row = Math.floor(y / GRID_SIZE);

    if (col >= 0 && col < MAP_GRID[0].length && row >= 0 && row < MAP_GRID.length) {
      setHoverCell({ col, row });
    } else {
      setHoverCell(null);
    }
  };

  const startGame = () => {
    engineRef.current?.startGame();
  };

  if (!gameState) return <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-cyan-50 font-sans flex flex-col items-center py-8">
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-cyan-400 px-6 py-3 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-800 z-50 animate-in fade-in slide-in-from-bottom-4 font-mono">
          {toast}
        </div>
      )}
      <div className="w-full max-w-5xl px-4 flex flex-col gap-6">
        
        {/* Header UI */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-950 border border-cyan-900/50 p-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)] gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 uppercase">Neon Defense</h1>
              <p className="text-cyan-800 text-sm font-mono">System v2.0</p>
            </div>
            <div className="flex md:hidden gap-2">
              <button onClick={handleSave} className="p-2 bg-zinc-900 border border-cyan-900/50 rounded-lg text-cyan-500"><Save size={20}/></button>
              <button onClick={handleLoad} className="p-2 bg-zinc-900 border border-cyan-900/50 rounded-lg text-cyan-500"><Download size={20}/></button>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-6 w-full md:w-auto">
            <div className="hidden md:flex gap-2 mr-4">
              <button onClick={handleSave} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-cyan-900/50 hover:bg-zinc-800 hover:border-cyan-500 rounded-lg text-cyan-400 text-sm font-mono transition-all"><Save size={16}/> SAVE</button>
              <button onClick={handleLoad} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-cyan-900/50 hover:bg-zinc-800 hover:border-cyan-500 rounded-lg text-cyan-400 text-sm font-mono transition-all"><Download size={16}/> LOAD</button>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/80 border border-cyan-900/30 px-3 py-2 md:px-4 rounded-xl shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-fuchsia-500" />
              <span className="font-mono text-lg md:text-xl font-bold text-fuchsia-400">{gameState.baseHealth}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/80 border border-cyan-900/30 px-3 py-2 md:px-4 rounded-xl shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              <span className="font-mono text-lg md:text-xl font-bold text-yellow-400">{gameState.coins}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900/80 border border-cyan-900/30 px-3 py-2 md:px-4 rounded-xl shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-cyan-500" />
              <span className="font-mono text-lg md:text-xl font-bold text-cyan-400">WAVE {gameState.wave + 1}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Canvas Container */}
          <div className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-cyan-900/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] w-full lg:w-auto flex-shrink-0" style={{ touchAction: 'none' }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoverCell(null)}
              className="block cursor-crosshair w-full h-auto"
              style={{
                backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
              }}
            />
            
            {/* Hover Indicator */}
            {hoverCell && gameState.status === 'playing' && (
              <div 
                className="absolute pointer-events-none border border-cyan-400 bg-cyan-400/10 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{
                  left: hoverCell.col * GRID_SIZE,
                  top: hoverCell.row * GRID_SIZE,
                  width: GRID_SIZE,
                  height: GRID_SIZE,
                  borderColor: MAP_GRID[hoverCell.row][hoverCell.col] === 0 ? 'rgba(6, 182, 212, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                }}
              />
            )}

            {/* Overlays */}
            {gameState.status === 'menu' && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 uppercase tracking-widest">System Ready</h2>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] font-mono"
                >
                  <Play className="w-6 h-6" />
                  INITIALIZE
                </button>
              </div>
            )}

            {gameState.status === 'gameover' && (
              <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center backdrop-blur-sm">
                <h2 className="text-5xl font-bold mb-4 text-red-500 uppercase tracking-widest">Core Breach</h2>
                <p className="text-red-300 mb-8 text-lg font-mono">System survived until Wave {gameState.wave + 1}</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] font-mono"
                >
                  <RotateCcw className="w-6 h-6" />
                  REBOOT
                </button>
              </div>
            )}

            {gameState.status === 'victory' && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center backdrop-blur-sm">
                <h2 className="text-5xl font-bold mb-4 text-emerald-400 uppercase tracking-widest">System Secured</h2>
                <p className="text-emerald-200 mb-8 text-lg font-mono">All threats neutralized.</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] font-mono"
                >
                  <RotateCcw className="w-6 h-6" />
                  NEW SESSION
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-zinc-950 border border-cyan-900/50 p-6 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <h3 className="text-lg font-bold mb-4 text-cyan-500 uppercase tracking-widest text-sm font-mono">Defense Modules</h3>
              <div className="flex flex-col gap-3">
                {(Object.entries(TOWER_TYPES) as [keyof typeof TOWER_TYPES, typeof TOWER_TYPES[keyof typeof TOWER_TYPES]][]).map(([key, tower]) => {
                  const isUnlocked = gameState.unlockedTowers.includes(key);
                  return (
                  <button
                    key={key}
                    onClick={() => isUnlocked && setSelectedTower(key)}
                    disabled={!isUnlocked}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      !isUnlocked ? 'opacity-50 cursor-not-allowed bg-zinc-950 border-zinc-800' :
                      selectedTower === key 
                        ? 'bg-zinc-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                        : 'bg-zinc-950 border-cyan-900/50 hover:border-cyan-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_currentColor]" style={{ backgroundColor: isUnlocked ? tower.color : '#52525b', color: isUnlocked ? tower.color : '#52525b' }}>
                        {!isUnlocked && <Lock size={10} className="text-zinc-900" />}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-zinc-200 font-mono uppercase">{tower.name}</span>
                        <span className="text-xs text-cyan-700 font-mono">
                          {isUnlocked ? `DMG:${tower.damage} RNG:${tower.range}` : 'LOCKED'}
                        </span>
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="flex items-center gap-1 text-yellow-400 font-mono font-bold">
                        {tower.cost}
                      </div>
                    )}
                  </button>
                )})}
              </div>
            </div>

            <div className="bg-zinc-950 border border-cyan-900/50 p-6 rounded-2xl flex-1 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <h3 className="text-lg font-bold mb-4 text-cyan-500 uppercase tracking-widest text-sm font-mono">System Logs</h3>
              <ul className="text-sm text-cyan-700 space-y-3 font-mono">
                <li>&gt; Select module from menu.</li>
                <li>&gt; Click grid to deploy.</li>
                <li>&gt; Modules require credits.</li>
                <li>&gt; Protect the CORE at all costs.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

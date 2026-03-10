import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './GameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, MAP_GRID, TOWER_TYPES } from './constants';
import { GameState } from './types';
import { Coins, Heart, Shield, Play, RotateCcw, Save, Download, Lock } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTower, setSelectedTower] = useState<keyof typeof TOWER_TYPES>('soldier');
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col items-center py-8">
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-6 py-3 rounded-full shadow-xl border border-zinc-700 z-50 animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}
      <div className="w-full max-w-5xl px-4 flex flex-col gap-6">
        
        {/* Header UI */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Warriors of the Valley</h1>
              <p className="text-zinc-400 text-sm">Web Prototype</p>
            </div>
            <div className="flex md:hidden gap-2">
              <button onClick={handleSave} className="p-2 bg-zinc-800 rounded-lg text-zinc-300"><Save size={20}/></button>
              <button onClick={handleLoad} className="p-2 bg-zinc-800 rounded-lg text-zinc-300"><Download size={20}/></button>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-6 w-full md:w-auto">
            <div className="hidden md:flex gap-2 mr-4">
              <button onClick={handleSave} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-sm font-bold transition-colors"><Save size={16}/> Save</button>
              <button onClick={handleLoad} className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-sm font-bold transition-colors"><Download size={16}/> Load</button>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 md:px-4 rounded-xl">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              <span className="font-mono text-lg md:text-xl font-bold">{gameState.baseHealth}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 md:px-4 rounded-xl">
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              <span className="font-mono text-lg md:text-xl font-bold">{gameState.coins}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-2 md:px-4 rounded-xl">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              <span className="font-mono text-lg md:text-xl font-bold">Wave {gameState.wave + 1}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Canvas Container */}
          <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl w-full lg:w-auto flex-shrink-0" style={{ touchAction: 'none' }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoverCell(null)}
              className="block cursor-crosshair w-full h-auto"
              style={{
                backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
                backgroundSize: `calc(100% / ${MAP_GRID[0].length}) calc(100% / ${MAP_GRID.length})`
              }}
            />
            
            {/* Hover Indicator */}
            {hoverCell && gameState.status === 'playing' && (
              <div 
                className="absolute pointer-events-none border-2 border-white/50 bg-white/10"
                style={{
                  left: hoverCell.col * GRID_SIZE,
                  top: hoverCell.row * GRID_SIZE,
                  width: GRID_SIZE,
                  height: GRID_SIZE,
                  borderColor: MAP_GRID[hoverCell.row][hoverCell.col] === 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                }}
              />
            )}

            {/* Overlays */}
            {gameState.status === 'menu' && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <h2 className="text-4xl font-bold mb-8 text-white">Ready to Defend?</h2>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-xl transition-colors shadow-lg shadow-blue-900/20"
                >
                  <Play className="w-6 h-6" />
                  Start Game
                </button>
              </div>
            )}

            {gameState.status === 'gameover' && (
              <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center backdrop-blur-sm">
                <h2 className="text-5xl font-bold mb-4 text-red-500">Base Destroyed</h2>
                <p className="text-zinc-300 mb-8 text-lg">You survived until Wave {gameState.wave + 1}</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl font-bold text-xl transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                  Try Again
                </button>
              </div>
            )}

            {gameState.status === 'victory' && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center backdrop-blur-sm">
                <h2 className="text-5xl font-bold mb-4 text-emerald-400">Victory!</h2>
                <p className="text-zinc-300 mb-8 text-lg">You successfully defended the valley.</p>
                <button 
                  onClick={startGame}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold text-xl transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 text-white uppercase tracking-wider text-sm">Towers</h3>
              <div className="flex flex-col gap-3">
                {(Object.entries(TOWER_TYPES) as [keyof typeof TOWER_TYPES, typeof TOWER_TYPES[keyof typeof TOWER_TYPES]][]).map(([key, tower]) => {
                  const isUnlocked = gameState.unlockedTowers.includes(key);
                  return (
                  <button
                    key={key}
                    onClick={() => isUnlocked && setSelectedTower(key)}
                    disabled={!isUnlocked}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      !isUnlocked ? 'opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-800' :
                      selectedTower === key 
                        ? 'bg-zinc-800 border-blue-500 shadow-md shadow-blue-900/20' 
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: isUnlocked ? tower.color : '#52525b' }}>
                        {!isUnlocked && <Lock size={10} className="text-zinc-900" />}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-zinc-200">{tower.name}</span>
                        <span className="text-xs text-zinc-500">
                          {isUnlocked ? `Dmg: ${tower.damage} | Rng: ${tower.range}` : 'Locked'}
                        </span>
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="flex items-center gap-1 text-yellow-500 font-mono font-bold">
                        {tower.cost}
                      </div>
                    )}
                  </button>
                )})}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex-1">
              <h3 className="text-lg font-bold mb-4 text-white uppercase tracking-wider text-sm">Instructions</h3>
              <ul className="text-sm text-zinc-400 space-y-3">
                <li>• Select a tower from the menu above.</li>
                <li>• Click on the grid to place towers.</li>
                <li>• Towers cost coins, earned by defeating enemies.</li>
                <li>• Don't let enemies reach the blue base!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

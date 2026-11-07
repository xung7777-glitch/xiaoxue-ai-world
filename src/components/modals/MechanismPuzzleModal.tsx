import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, RotateCw, ArrowDown, ArrowLeft, ArrowRight, Play, Trophy } from 'lucide-react';
import { PlayerStats } from '../../types/cultivation';
import { sounds } from '../../utils/audio';

interface MechanismPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

const ROWS = 12;
const COLS = 8;

const SHAPES = [
  // I-shape
  [[1, 1, 1, 1]],
  // O-shape
  [
    [2, 2],
    [2, 2],
  ],
  // T-shape
  [
    [0, 3, 0],
    [3, 3, 3],
  ],
  // L-shape
  [
    [4, 0],
    [4, 0],
    [4, 4],
  ],
  // Z-shape
  [
    [5, 5, 0],
    [0, 5, 5],
  ],
];

const COLORS: Record<number, string> = {
  1: 'bg-cyan-500 border-cyan-300 shadow-[0_0_8px_#06b6d4]', // 水
  2: 'bg-amber-500 border-amber-300 shadow-[0_0_8px_#f59e0b]', // 金
  3: 'bg-purple-500 border-purple-300 shadow-[0_0_8px_#a855f7]', // 雷
  4: 'bg-emerald-500 border-emerald-300 shadow-[0_0_8px_#10b981]', // 木
  5: 'bg-rose-500 border-rose-300 shadow-[0_0_8px_#f43f5e]', // 火
};

export const MechanismPuzzleModal: React.FC<MechanismPuzzleModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][];
    r: number;
    c: number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Spawn new falling block
  const spawnPiece = useCallback(() => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const newPiece = {
      shape,
      r: 0,
      c: Math.floor((COLS - shape[0].length) / 2),
    };
    return newPiece;
  }, []);

  const startGame = useCallback(() => {
    sounds.playChime(523.25, 0.4);
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setLinesCleared(0);
    setIsGameOver(false);
    setIsRunning(true);
    setCurrentPiece(spawnPiece());
  }, [spawnPiece]);

  // Check collision helper
  const canPlace = useCallback(
    (shape: number[][], r: number, c: number, checkGrid: number[][]) => {
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col] !== 0) {
            const nr = r + row;
            const nc = c + col;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
            if (checkGrid[nr][nc] !== 0) return false;
          }
        }
      }
      return true;
    },
    []
  );

  // Drop piece by 1 row
  const tick = useCallback(() => {
    if (!currentPiece || !isRunning || isGameOver) return;

    if (canPlace(currentPiece.shape, currentPiece.r + 1, currentPiece.c, grid)) {
      setCurrentPiece({ ...currentPiece, r: currentPiece.r + 1 });
    } else {
      // Lock piece into grid
      const newGrid = grid.map((row) => [...row]);
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const nr = currentPiece.r + r;
            const nc = currentPiece.c + c;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              newGrid[nr][nc] = currentPiece.shape[r][c];
            }
          }
        }
      }

      // Check cleared lines
      let cleared = 0;
      const filteredGrid = newGrid.filter((row) => {
        const full = row.every((val) => val !== 0);
        if (full) cleared++;
        return !full;
      });

      while (filteredGrid.length < ROWS) {
        filteredGrid.unshift(Array(COLS).fill(0));
      }

      if (cleared > 0) {
        sounds.playBreakthrough();
        const bonus = cleared * 50;
        setScore((s) => s + bonus);
        setLinesCleared((l) => l + cleared);
        onUpdateStats({
          spiritStones: stats.spiritStones + cleared * 8,
          currentExp: stats.currentExp + cleared * 15,
        });
      }

      // Spawn next
      const nextPiece = spawnPiece();
      if (!canPlace(nextPiece.shape, nextPiece.r, nextPiece.c, filteredGrid)) {
        setIsGameOver(true);
        setIsRunning(false);
      } else {
        setGrid(filteredGrid);
        setCurrentPiece(nextPiece);
      }
    }
  }, [canPlace, currentPiece, grid, isGameOver, isRunning, onUpdateStats, spawnPiece, stats]);

  useEffect(() => {
    if (!isOpen || !isRunning || isGameOver) return;
    const interval = setInterval(tick, 600);
    return () => clearInterval(interval);
  }, [isOpen, isRunning, isGameOver, tick]);

  const moveHorizontal = (dir: -1 | 1) => {
    if (!currentPiece || !isRunning) return;
    if (canPlace(currentPiece.shape, currentPiece.r, currentPiece.c + dir, grid)) {
      sounds.playChime(392, 0.1);
      setCurrentPiece({ ...currentPiece, c: currentPiece.c + dir });
    }
  };

  const rotate = () => {
    if (!currentPiece || !isRunning) return;
    const rotated: number[][] = [];
    const rows = currentPiece.shape.length;
    const cols = currentPiece.shape[0].length;
    for (let c = 0; c < cols; c++) {
      const newRow: number[] = [];
      for (let r = rows - 1; r >= 0; r--) {
        newRow.push(currentPiece.shape[r][c]);
      }
      rotated.push(newRow);
    }
    if (canPlace(rotated, currentPiece.r, currentPiece.c, grid)) {
      sounds.playChime(440, 0.1);
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  };

  const hardDrop = () => {
    if (!currentPiece || !isRunning) return;
    let r = currentPiece.r;
    while (canPlace(currentPiece.shape, r + 1, currentPiece.c, grid)) {
      r++;
    }
    setCurrentPiece({ ...currentPiece, r });
    tick();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#131b2c] via-[#0e1624] to-[#070b13] border border-purple-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-purple-900/40 bg-[#162136]/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-serif">機關解密 · 璇璣陣破</h3>
              <p className="text-[11px] text-purple-300">五行靈石機關方塊 · 陣眼化解</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#090f1a] text-xs border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-purple-300">
            <Trophy className="w-3.5 h-3.5" />
            <span>破陣積分: {score}</span>
          </div>
          <div className="text-slate-400">解開機關層數: {linesCleared}</div>
        </div>

        {/* Tetris Board */}
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-56 h-[336px] bg-[#050811] p-1.5 rounded-xl border-2 border-purple-900/60 grid grid-rows-12 grid-cols-8 gap-0.5 shadow-inner">
            {Array.from({ length: ROWS }).map((_, r) =>
              Array.from({ length: COLS }).map((_, c) => {
                let cellValue = grid[r][c];

                // Render active piece preview
                if (currentPiece) {
                  const pr = r - currentPiece.r;
                  const pc = c - currentPiece.c;
                  if (
                    pr >= 0 &&
                    pr < currentPiece.shape.length &&
                    pc >= 0 &&
                    pc < currentPiece.shape[0].length &&
                    currentPiece.shape[pr][pc] !== 0
                  ) {
                    cellValue = currentPiece.shape[pr][pc];
                  }
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`rounded-[3px] border ${
                      cellValue !== 0
                        ? COLORS[cellValue]
                        : 'bg-[#0a1120]/40 border-slate-900/60'
                    }`}
                  />
                );
              })
            )}

            {!isRunning && !isGameOver && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center space-y-3 rounded-lg">
                <p className="text-xs text-slate-300 max-w-[180px] text-center">
                  古仙洞府機關鎖，以五行靈石填補空缺，破解陣法！
                </p>
                <button
                  onClick={startGame}
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  開動機關
                </button>
              </div>
            )}

            {isGameOver && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center space-y-2 rounded-lg">
                <span className="text-sm font-bold text-rose-400">機關咬合鎖死！</span>
                <p className="text-xs text-slate-300">本回破除 {linesCleared} 層機關</p>
                <button
                  onClick={startGame}
                  className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
                >
                  重置機關
                </button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => moveHorizontal(-1)}
              className="w-11 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-white flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={rotate}
              className="w-11 h-10 rounded-xl bg-purple-900/80 hover:bg-purple-800 active:bg-purple-600 text-purple-200 border border-purple-500/50 flex items-center justify-center"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={hardDrop}
              className="w-11 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-white flex items-center justify-center"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => moveHorizontal(1)}
              className="w-11 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-purple-600 text-white flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { PlayerStats } from '../../types/cultivation';
import { sounds } from '../../utils/audio';

interface Talisman2048ModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

const TALISMAN_NAMES: Record<number, { name: string; grade: string; color: string; bg: string }> = {
  2: { name: '黃紙符', grade: '一品', color: 'text-amber-200', bg: 'bg-amber-950/60 border-amber-700/60' },
  4: { name: '聚靈符', grade: '二品', color: 'text-cyan-200', bg: 'bg-cyan-950/70 border-cyan-700/60' },
  8: { name: '辟邪符', grade: '三品', color: 'text-teal-200', bg: 'bg-teal-950/70 border-teal-700/60' },
  16: { name: '玄冰符', grade: '四品', color: 'text-sky-200', bg: 'bg-sky-950/80 border-sky-600/70' },
  32: { name: '神火符', grade: '五品', color: 'text-orange-200', bg: 'bg-orange-950/80 border-orange-600/70' },
  64: { name: '天雷符', grade: '六品', color: 'text-indigo-200', bg: 'bg-indigo-950/80 border-indigo-500/80' },
  128: { name: '太乙符', grade: '七品', color: 'text-purple-200', bg: 'bg-purple-950/80 border-purple-500/80' },
  256: { name: '紫極符', grade: '八品', color: 'text-fuchsia-200', bg: 'bg-fuchsia-950/90 border-fuchsia-500/80' },
  512: { name: '渡劫符', grade: '九品', color: 'text-rose-200', bg: 'bg-rose-950/90 border-rose-500/90 shadow-[0_0_15px_rgba(244,63,94,0.5)]' },
  1024: { name: '混元符', grade: '仙品', color: 'text-amber-100', bg: 'bg-gradient-to-br from-amber-600 to-yellow-500 text-black font-extrabold shadow-[0_0_20px_#f59e0b]' },
  2048: { name: '通天神符', grade: '神品', color: 'text-white', bg: 'bg-gradient-to-tr from-cyan-400 via-teal-300 to-amber-300 text-black font-black shadow-[0_0_30px_#22d3ee]' },
};

type Board = number[][];

export const Talisman2048Modal: React.FC<Talisman2048ModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [board, setBoard] = useState<Board>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [maxTile, setMaxTile] = useState(2);

  // Spawn random tile (2 or 4)
  const spawnTile = useCallback((currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.85 ? 2 : 4;
    const next = currentBoard.map((row) => [...row]);
    next[randomCell.r][randomCell.c] = val;
    return next;
  }, []);

  const resetGame = useCallback(() => {
    sounds.playChime(440, 0.4);
    let b: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    b = spawnTile(b);
    b = spawnTile(b);
    setBoard(b);
    setScore(0);
  }, [spawnTile]);

  useEffect(() => {
    if (isOpen) {
      resetGame();
    }
  }, [isOpen, resetGame]);

  // Slide move logic
  const move = useCallback(
    (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
      let moved = false;
      let points = 0;
      let highest = maxTile;

      const slide = (row: number[]): number[] => {
        const filtered = row.filter((v) => v !== 0);
        const result: number[] = [];
        let i = 0;
        while (i < filtered.length) {
          if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
            const merged = filtered[i] * 2;
            result.push(merged);
            points += merged;
            if (merged > highest) highest = merged;
            i += 2;
          } else {
            result.push(filtered[i]);
            i++;
          }
        }
        while (result.length < 4) result.push(0);
        return result;
      };

      const nextBoard: Board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];

      if (dir === 'LEFT') {
        for (let r = 0; r < 4; r++) {
          nextBoard[r] = slide(board[r]);
        }
      } else if (dir === 'RIGHT') {
        for (let r = 0; r < 4; r++) {
          nextBoard[r] = slide([...board[r]].reverse()).reverse();
        }
      } else if (dir === 'UP') {
        for (let c = 0; c < 4; c++) {
          const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
          const slided = slide(col);
          for (let r = 0; r < 4; r++) nextBoard[r][c] = slided[r];
        }
      } else if (dir === 'DOWN') {
        for (let c = 0; c < 4; c++) {
          const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
          const slided = slide(col);
          for (let r = 0; r < 4; r++) nextBoard[r][c] = slided[3 - r];
        }
      }

      // Check if board changed
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (nextBoard[r][c] !== board[r][c]) {
            moved = true;
          }
        }
      }

      if (moved) {
        sounds.playChime(350 + Math.min(600, points * 2), 0.2);
        const finalBoard = spawnTile(nextBoard);
        setBoard(finalBoard);
        setScore((s) => s + points);
        setMaxTile(highest);

        // Grant slight talisman knowledge & spirit stones
        onUpdateStats({
          talismanKnowledge: stats.talismanKnowledge + Math.floor(points / 20),
          spiritStones: stats.spiritStones + Math.floor(points / 10),
          currentExp: stats.currentExp + Math.floor(points / 15),
        });
      }
    },
    [board, maxTile, onUpdateStats, spawnTile, stats]
  );

  // Keyboard handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        move('UP');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        move('DOWN');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move('LEFT');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        move('RIGHT');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, move]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#141b2a] via-[#0d1420] to-[#080d16] border border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/40 bg-[#192233]/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">符咒解謎 · 符籙融道</h3>
              <p className="text-xs text-amber-300">2048仙道變體 · 融合無上神符</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#0c121d] border-b border-cyan-950 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">道悟積分:</span>
            <span className="text-amber-300 font-bold text-sm">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetGame}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              重新開局
            </button>
          </div>
        </div>

        {/* 4x4 Grid Board */}
        <div className="p-5 flex flex-col items-center justify-center">
          <div className="grid grid-cols-4 gap-2.5 w-full aspect-square bg-[#070b13] p-3 rounded-2xl border border-cyan-900/60 shadow-inner">
            {board.map((row, r) =>
              row.map((val, c) => {
                const info = TALISMAN_NAMES[val];
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`rounded-xl border flex flex-col items-center justify-center p-1 select-none transition-all duration-150 ${
                      val === 0
                        ? 'bg-[#0f1726]/40 border-slate-800/40 text-transparent'
                        : `${info?.bg || 'bg-cyan-950'} ${info?.color || 'text-cyan-200'}`
                    }`}
                  >
                    {val > 0 && (
                      <>
                        <span className="text-[10px] opacity-75 font-serif">{info?.grade || '符'}</span>
                        <span className="text-xs sm:text-sm font-bold tracking-tight text-center leading-tight">
                          {info?.name || val}
                        </span>
                        <span className="text-[9px] opacity-60 font-mono mt-0.5">{val}</span>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* D-Pad Controls for mobile / touch */}
          <div className="mt-4 flex flex-col items-center gap-1.5 select-none">
            <button
              onClick={() => move('UP')}
              className="w-12 h-10 rounded-xl bg-slate-800/90 active:bg-cyan-700 hover:bg-slate-700 text-cyan-200 flex items-center justify-center shadow"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => move('LEFT')}
                className="w-12 h-10 rounded-xl bg-slate-800/90 active:bg-cyan-700 hover:bg-slate-700 text-cyan-200 flex items-center justify-center shadow"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => move('DOWN')}
                className="w-12 h-10 rounded-xl bg-slate-800/90 active:bg-cyan-700 hover:bg-slate-700 text-cyan-200 flex items-center justify-center shadow"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => move('RIGHT')}
                className="w-12 h-10 rounded-xl bg-slate-800/90 active:bg-cyan-700 hover:bg-slate-700 text-cyan-200 flex items-center justify-center shadow"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

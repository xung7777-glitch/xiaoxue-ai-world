import React, { useState, useEffect } from 'react';
import { X, Anchor, Sparkles, Fish, Compass } from 'lucide-react';
import { PlayerStats, InventoryItem } from '../../types/cultivation';
import { sounds } from '../../utils/audio';

interface FishingRiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

type FishingState = 'idle' | 'waiting' | 'hooked' | 'reeling' | 'caught';

interface CaughtReward {
  name: string;
  type: 'fish' | 'treasure';
  grade: string;
  stones: number;
  exp: number;
  icon: string;
  flavor: string;
}

export const FishingRiverModal: React.FC<FishingRiverModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [state, setState] = useState<FishingState>('idle');
  const [tension, setTension] = useState(50);
  const [targetTension, setTargetTension] = useState(60);
  const [reelProgress, setReelProgress] = useState(0);
  const [lastCaught, setLastCaught] = useState<CaughtReward | null>(null);

  // Reel tension mechanics
  useEffect(() => {
    if (state !== 'reeling') return;

    const interval = setInterval(() => {
      // Target area drifts naturally
      setTargetTension((prev) => {
        const drift = (Math.random() - 0.5) * 12;
        return Math.max(25, Math.min(80, prev + drift));
      });

      // Tension drops if not held
      setTension((prev) => Math.max(0, prev - 3.5));

      // Check if player tension is inside the target zone (+/- 18)
      setReelProgress((prog) => {
        const inZone = Math.abs(tension - targetTension) < 18;
        const newProg = inZone ? prog + 4.5 : Math.max(0, prog - 2);

        if (newProg >= 100) {
          // Success catch!
          sounds.playBreakthrough();
          const catches: CaughtReward[] = [
            {
              name: '玄冰七彩神鯉',
              type: 'fish',
              grade: '靈階三品',
              stones: 45,
              exp: 30,
              icon: '🐟',
              flavor: '通體晶瑩如冰晶，蘊含極純靈水之氣。',
            },
            {
              name: '太虛金翅龍魚',
              type: 'fish',
              grade: '靈階二品',
              stones: 80,
              exp: 60,
              icon: '🐠',
              flavor: '傳聞有化龍之潛力，服之百病不生。',
            },
            {
              name: '萬年深潭靈鰲',
              type: 'fish',
              grade: '仙品一等',
              stones: 180,
              exp: 120,
              icon: '🐢',
              flavor: '自荒古生長至今的靈鰲，龜甲可煉頂級防禦法寶！',
            },
            {
              name: '沉江遠古玉簡',
              type: 'treasure',
              grade: '秘寶',
              stones: 100,
              exp: 150,
              icon: '📜',
              flavor: '記載著失傳上古劍訣殘篇的神秘玉簡。',
            },
          ];
          const won = catches[Math.floor(Math.random() * catches.length)];
          setLastCaught(won);
          setState('caught');

          // Update inventory & player stats
          const newInvItem: InventoryItem = {
            id: `catch-${Date.now()}`,
            name: won.name,
            type: won.type === 'fish' ? 'fish' : 'treasure',
            grade: won.grade,
            count: 1,
            icon: won.icon,
            description: won.flavor,
          };

          onUpdateStats({
            fishCaughtCount: stats.fishCaughtCount + 1,
            spiritStones: stats.spiritStones + won.stones,
            currentExp: stats.currentExp + won.exp,
            inventory: [...stats.inventory, newInvItem],
          });

          return 100;
        }
        return newProg;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [state, tension, targetTension, stats, onUpdateStats]);

  if (!isOpen) return null;

  const handleCast = () => {
    sounds.playWaterSplash();
    setState('waiting');
    setReelProgress(0);
    setTension(50);
    setLastCaught(null);

    // Random wait between 2 to 4.5 seconds for bite
    const waitTime = 2000 + Math.random() * 2500;
    setTimeout(() => {
      sounds.playWaterSplash();
      sounds.playChime(659.25, 0.4);
      setState('hooked');
    }, waitTime);
  };

  const handleHook = () => {
    sounds.playChime(587.33, 0.4);
    setState('reeling');
  };

  const handleHoldReel = () => {
    setTension((prev) => Math.min(100, prev + 11));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0c1a2d] via-[#091424] to-[#050b14] border border-cyan-400/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#0f233d]/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌊</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">釣魚河邊 · 悠然垂釣</h3>
              <p className="text-xs text-cyan-300">靈溪碧波 · 感悟靜心之道</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* River Scene */}
        <div className="p-6 flex flex-col items-center justify-center flex-1 space-y-6">
          <div className="relative w-full h-64 rounded-2xl bg-gradient-to-b from-[#0e2a47] via-[#0b2038] to-[#071626] border border-cyan-500/30 overflow-hidden flex flex-col items-center justify-center select-none shadow-inner">
            {/* Water waves effect */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-300 via-transparent to-transparent pointer-events-none" />

            {/* River Ripples */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" style={{ animationDuration: '3.5s' }} />
              <div className="absolute inset-4 rounded-full border border-teal-300/20 animate-ping" style={{ animationDuration: '2.5s' }} />

              {/* Floating Bobber */}
              <div
                className={`w-6 h-10 rounded-full transition-transform ${
                  state === 'waiting'
                    ? 'bg-gradient-to-t from-red-500 to-white animate-bounce'
                    : state === 'hooked'
                    ? 'bg-rose-500 scale-125 animate-ping'
                    : state === 'reeling'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-400 opacity-60'
                } flex items-center justify-center text-[10px] text-white font-bold shadow-lg`}
              >
                漂
              </div>
            </div>

            {/* Current prompt message */}
            <div className="relative z-10 mt-3 text-center">
              {state === 'idle' && (
                <span className="text-sm text-cyan-200">靈溪靜謐，水波微興，請拋出靈竹魚竿。</span>
              )}
              {state === 'waiting' && (
                <span className="text-sm text-teal-300 animate-pulse">靜候靈魚接近... 屏息凝神...</span>
              )}
              {state === 'hooked' && (
                <span className="text-base font-bold text-rose-400 animate-bounce">
                  ⚡ 浮漂猛沉！大魚咬鉤了！速速收線！
                </span>
              )}
              {state === 'reeling' && (
                <span className="text-sm text-amber-300 font-medium">保持拉扯力度在綠色靈力共振區！</span>
              )}
              {state === 'caught' && lastCaught && (
                <span className="text-sm text-emerald-300 font-bold">
                  🎉 釣獲【{lastCaught.name}】！
                </span>
              )}
            </div>
          </div>

          {/* Interactive controls */}
          <div className="w-full space-y-4">
            {state === 'idle' && (
              <button
                onClick={handleCast}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-bold text-base shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-98"
              >
                🎣 拋竿垂釣 (以靈引魚)
              </button>
            )}

            {state === 'waiting' && (
              <div className="text-center py-2 text-xs text-slate-400">
                垂釣乃修心之舉，稍安勿躁...
              </div>
            )}

            {state === 'hooked' && (
              <button
                onClick={handleHook}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-extrabold text-base animate-bounce shadow-[0_0_25px_rgba(244,63,94,0.6)]"
              >
                ⚡ 立即提竿！進入搏魚！
              </button>
            )}

            {state === 'reeling' && (
              <div className="space-y-3 p-4 rounded-xl bg-[#091524] border border-cyan-800/60">
                {/* Tension gauge */}
                <div>
                  <div className="flex justify-between text-xs text-cyan-200 mb-1">
                    <span>魚線張力: {Math.floor(tension)}%</span>
                    <span className="text-emerald-300">共振區: {Math.floor(targetTension)}% (±18)</span>
                  </div>
                  <div className="relative h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-900">
                    {/* Target safe zone */}
                    <div
                      className="absolute top-0 bottom-0 bg-emerald-500/40 border-x border-emerald-400 transition-all duration-300"
                      style={{
                        left: `${Math.max(0, targetTension - 18)}%`,
                        width: '36%',
                      }}
                    />
                    {/* Current tension bar */}
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all duration-75"
                      style={{ width: `${tension}%` }}
                    />
                  </div>
                </div>

                {/* Progress bar to catch */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>收竿進度</span>
                    <span className="text-amber-400 font-bold">{Math.floor(reelProgress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-100"
                      style={{ width: `${reelProgress}%` }}
                    />
                  </div>
                </div>

                <button
                  onMouseDown={handleHoldReel}
                  onTouchStart={handleHoldReel}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-400 text-white font-bold select-none active:scale-98 transition-all"
                >
                  長按 / 連續點擊收線拉扯
                </button>
              </div>
            )}

            {state === 'caught' && lastCaught && (
              <div className="p-4 rounded-2xl bg-cyan-950/70 border border-teal-500/50 text-center space-y-3">
                <div className="text-3xl">{lastCaught.icon}</div>
                <h4 className="text-lg font-bold text-teal-200">{lastCaught.name}</h4>
                <p className="text-xs text-slate-300 italic">{lastCaught.flavor}</p>
                <div className="flex justify-center gap-4 text-xs font-semibold text-cyan-300">
                  <span>靈石 +{lastCaught.stones}</span>
                  <span>修為 +{lastCaught.exp}</span>
                </div>
                <button
                  onClick={() => setState('idle')}
                  className="px-6 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  再釣一竿
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

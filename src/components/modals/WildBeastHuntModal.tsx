import React, { useState, useEffect, useRef } from 'react';
import { X, Sword, Shield, Flame, Sparkles, RefreshCw, Trophy } from 'lucide-react';
import { PlayerStats } from '../../types/cultivation';
import { sounds } from '../../utils/audio';

interface WildBeastHuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

interface Beast {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: 'wolf' | 'fox' | 'snake' | 'boss';
  name: string;
  color: string;
  size: number;
}

interface SwordSlash {
  id: number;
  angle: number;
  dist: number;
}

export const WildBeastHuntModal: React.FC<WildBeastHuntModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [score, setScore] = useState(0);
  const [collectedStones, setCollectedStones] = useState(0);
  const [collectedSouls, setCollectedSouls] = useState(0);
  const [beasts, setBeasts] = useState<Beast[]>([]);
  const [swordCount, setSwordCount] = useState(2);
  const [wave, setWave] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [levelUpChoice, setLevelUpChoice] = useState<string | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const swordsAngleRef = useRef<number>(0);
  const beastIdCounter = useRef(1);

  // Start new hunt session
  const startHunt = () => {
    setIsPlaying(true);
    setPlayerHp(100);
    setScore(0);
    setCollectedStones(0);
    setCollectedSouls(0);
    setSwordCount(2);
    setWave(1);
    setGameOver(false);
    setLevelUpChoice(null);
    setBeasts([]);
    sounds.playSwordSlash();
  };

  // Main game tick loop
  useEffect(() => {
    if (!isOpen || !isPlaying || gameOver || levelUpChoice) return;

    const interval = setInterval(() => {
      // Rotate flying swords
      swordsAngleRef.current = (swordsAngleRef.current + 0.08) % (Math.PI * 2);

      // Spawn beasts periodically
      setBeasts((prev) => {
        let updated = [...prev];
        if (updated.length < 12 && Math.random() < 0.45) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 160;
          const isBoss = Math.random() < 0.08;
          const beastTypes: Beast['type'][] = ['wolf', 'fox', 'snake'];
          const type = isBoss ? 'boss' : beastTypes[Math.floor(Math.random() * beastTypes.length)];

          const names = {
            wolf: '赤炎妖狼',
            fox: '幻靈雪狐',
            snake: '幽冥毒蟒',
            boss: '九幽玄魔獸',
          };

          const hpMap = { wolf: 20, fox: 15, snake: 18, boss: 75 };
          const speedMap = { wolf: 1.1, fox: 1.4, snake: 0.9, boss: 0.6 };

          updated.push({
            id: beastIdCounter.current++,
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            hp: hpMap[type],
            maxHp: hpMap[type],
            speed: speedMap[type],
            type,
            name: names[type],
            color: type === 'boss' ? '#ef4444' : type === 'wolf' ? '#f97316' : type === 'fox' ? '#06b6d4' : '#10b981',
            size: type === 'boss' ? 26 : 18,
          });
        }

        // Move beasts towards center (player)
        let playerDamage = 0;
        let gainedStones = 0;
        let gainedSouls = 0;
        let gainedScore = 0;

        updated = updated
          .map((b) => {
            const angleToCenter = Math.atan2(-b.y, -b.x);
            const nx = b.x + Math.cos(angleToCenter) * b.speed;
            const ny = b.y + Math.sin(angleToCenter) * b.speed;
            const distToCenter = Math.hypot(nx, ny);

            // Check collision with spinning swords (radius ~ 55px)
            let currentHp = b.hp;
            for (let i = 0; i < swordCount; i++) {
              const swordAngle = swordsAngleRef.current + (i * (Math.PI * 2)) / swordCount;
              const sx = Math.cos(swordAngle) * 55;
              const sy = Math.sin(swordAngle) * 55;
              const hitDist = Math.hypot(nx - sx, ny - sy);

              if (hitDist < b.size + 14) {
                currentHp -= 12; // Sword slash damage
                sounds.playSwordSlash();
              }
            }

            // Hit player
            if (distToCenter < 22) {
              playerDamage += b.type === 'boss' ? 18 : 6;
              return null; // Beast self destructs on impact
            }

            // Beast died
            if (currentHp <= 0) {
              gainedScore += b.type === 'boss' ? 120 : 25;
              gainedStones += b.type === 'boss' ? 15 : 3;
              gainedSouls += 1;
              return null;
            }

            return { ...b, x: nx, y: ny, hp: currentHp };
          })
          .filter(Boolean) as Beast[];

        if (playerDamage > 0) {
          setPlayerHp((prev) => {
            const next = Math.max(0, prev - playerDamage);
            if (next <= 0) {
              setGameOver(true);
            }
            return next;
          });
        }

        if (gainedScore > 0) {
          setScore((s) => s + gainedScore);
          setCollectedStones((st) => st + gainedStones);
          setCollectedSouls((so) => so + gainedSouls);
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, gameOver, levelUpChoice, swordCount]);

  if (!isOpen) return null;

  // Manual click / spell cast
  const handleCastSpell = (e: React.MouseEvent) => {
    if (!isPlaying || gameOver) return;
    sounds.playSwordSlash();
    setBeasts((prev) =>
      prev.map((b) => ({
        ...b,
        hp: b.hp - 18,
      })).filter((b) => b.hp > 0)
    );
  };

  const handleSettleRewards = () => {
    onUpdateStats({
      spiritStones: stats.spiritStones + collectedStones,
      beastSouls: stats.beastSouls + collectedSouls,
      currentExp: stats.currentExp + Math.floor(score / 5),
    });
    setIsPlaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#131b2c] via-[#0c1422] to-[#070b13] border border-orange-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.25)] flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-900/40 bg-[#162238]/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">野外獸區 · 倖存者試煉</h3>
              <p className="text-xs text-orange-400">十萬荒山妖窟 · 飛劍降魔</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (collectedStones > 0) handleSettleRewards();
              else onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Game Arena Body */}
        <div className="p-6 flex flex-col items-center justify-center flex-1">
          {!isPlaying ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-2xl bg-orange-950/60 border border-orange-500/40 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-orange-950">
                🗡️
              </div>
              <h4 className="text-xl font-bold text-white font-serif">荒古獸潮來襲！</h4>
              <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                操縱周天護體飛劍，抵擋四方妖獸圍攻。擊殺妖獸可繳獲【靈石】與【妖獸精魄】以資修仙！
              </p>
              <button
                onClick={startHunt}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all active:scale-95"
              >
                出鞘！進入野外歷練
              </button>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {/* Status bar */}
              <div className="flex items-center justify-between text-xs px-2">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <Shield className="w-3.5 h-3.5" />
                  <span>護體真氣: {playerHp}/100</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-300">
                  <span>靈石: +{collectedStones}</span>
                  <span>精魄: +{collectedSouls}</span>
                  <span className="text-amber-300">戰績: {score}</span>
                </div>
              </div>

              {/* Arena Canvas Container */}
              <div
                ref={arenaRef}
                onClick={handleCastSpell}
                className="relative w-full h-80 rounded-2xl bg-[#070d18] border border-cyan-800/40 overflow-hidden cursor-crosshair select-none flex items-center justify-center"
              >
                {/* Background array runes */}
                <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-cyan-300 rounded-full animate-spin" style={{ animationDuration: '40s' }} />
                </div>

                {/* Center Daoist Character */}
                <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_#22d3ee]">
                  仙
                  <div className="absolute -inset-1 rounded-full border border-cyan-300/60 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                </div>

                {/* Flying swords revolving around player */}
                {Array.from({ length: swordCount }).map((_, idx) => {
                  const angle = swordsAngleRef.current + (idx * (Math.PI * 2)) / swordCount;
                  const sx = Math.cos(angle) * 55;
                  const sy = Math.sin(angle) * 55;
                  return (
                    <div
                      key={idx}
                      className="absolute z-20 pointer-events-none flex items-center justify-center"
                      style={{
                        transform: `translate(${sx}px, ${sy}px) rotate(${angle + Math.PI / 2}rad)`,
                      }}
                    >
                      <div className="w-1.5 h-6 bg-gradient-to-t from-cyan-400 to-white rounded-full shadow-[0_0_10px_#22d3ee]" />
                    </div>
                  );
                })}

                {/* Beasts */}
                {beasts.map((b) => (
                  <div
                    key={b.id}
                    className="absolute z-10 pointer-events-none flex flex-col items-center justify-center transition-transform"
                    style={{
                      transform: `translate(${b.x}px, ${b.y}px)`,
                    }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md animate-pulse"
                      style={{
                        width: b.size,
                        height: b.size,
                        backgroundColor: b.color,
                        boxShadow: `0 0 10px ${b.color}`,
                      }}
                    >
                      {b.type === 'boss' ? '王' : '妖'}
                    </div>
                    <span className="text-[9px] text-slate-300 mt-0.5 scale-90 whitespace-nowrap">
                      {b.name}
                    </span>
                  </div>
                ))}

                {/* Quick click hint */}
                <div className="absolute bottom-2 text-[10px] text-slate-500 pointer-events-none">
                  提示：點擊任意處激發劍氣爆發
                </div>
              </div>

              {/* Controls & upgrades */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    sounds.playQiAbsorb();
                    setSwordCount((c) => Math.min(6, c + 1));
                  }}
                  disabled={collectedStones < 10 || swordCount >= 6}
                  className="text-xs px-3 py-2 rounded-xl bg-cyan-950/70 border border-cyan-600/40 text-cyan-200 hover:bg-cyan-900 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Sword className="w-3.5 h-3.5" />
                  祭煉飛劍+1 (消耗10靈石, 當前: {swordCount})
                </button>

                <button
                  onClick={handleSettleRewards}
                  className="text-xs px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  帶收穫回洞府
                </button>
              </div>

              {/* Game Over Modal Screen */}
              {gameOver && (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600/50 text-center space-y-2 mt-2">
                  <h5 className="text-base font-bold text-rose-200">真氣竭盡，遁回洞府！</h5>
                  <p className="text-xs text-rose-300">
                    此役降伏妖獸，共奪得靈石 +{collectedStones}、精魄 +{collectedSouls}、修為 +{Math.floor(score / 5)}。
                  </p>
                  <button
                    onClick={handleSettleRewards}
                    className="px-6 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
                  >
                    納入儲物袋
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

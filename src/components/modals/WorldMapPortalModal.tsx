import React, { useState } from 'react';
import { X, Compass, Sparkles, MapPin, Navigation } from 'lucide-react';
import { PlayerStats } from '../../types/cultivation';
import { sounds } from '../../utils/audio';

interface WorldMapPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

interface RealmMap {
  id: string;
  name: string;
  climate: string;
  description: string;
  bonus: string;
  color: string;
  icon: string;
}

const WORLD_MAPS: RealmMap[] = [
  {
    id: 'map-1',
    name: '雲隱仙峰 · 主洞府',
    climate: '仙氣氤氳 · 四季如春',
    description: '小雪起居室與宗門靈脈所在，天地靈氣最為純淨溫和。',
    bonus: '冥想靈氣吸收速度 +30%',
    color: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/50',
    icon: '🏔️',
  },
  {
    id: 'map-2',
    name: '十萬蠻荒大山',
    climate: '凶煞毒瘴 · 巨木蔽日',
    description: '遠古大妖棲息之所，妖獸橫行，險象環生，充滿無盡機緣。',
    bonus: '野外妖獸掉落精魄數量 +50%',
    color: 'from-orange-500/20 to-amber-500/10 border-orange-500/50',
    icon: '🌲',
  },
  {
    id: 'map-3',
    name: '幽都碧落冥海',
    climate: '幽寒玄冰 · 深潭千丈',
    description: '連接陰陽兩界的萬丈海淵，生長著極寒靈草與深海巨鰲。',
    bonus: '垂釣珍稀靈魚概率 +40%',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/50',
    icon: '🌊',
  },
  {
    id: 'map-4',
    name: '東海蓬萊仙島',
    climate: '紫氣東來 · 仙鶴翱翔',
    description: '世外散仙聚集之所，常有九品天劫神符與上古丹鼎現世。',
    bonus: '煉丹成功率 +20%',
    color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/50',
    icon: '🏝️',
  },
];

export const WorldMapPortalModal: React.FC<WorldMapPortalModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [selectedMapId, setSelectedMapId] = useState<string>('map-1');
  const [isTeleporting, setIsTeleporting] = useState(false);

  if (!isOpen) return null;

  const currentMap = WORLD_MAPS.find((m) => m.id === selectedMapId) || WORLD_MAPS[0];

  const handleTeleport = () => {
    sounds.playBreakthrough();
    setIsTeleporting(true);

    setTimeout(() => {
      setIsTeleporting(false);
      onUpdateStats({
        currentExp: stats.currentExp + 50,
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#111929] via-[#0d1421] to-[#060b13] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#16233a]/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">大千世界 · 星璿傳送門</h3>
              <p className="text-xs text-cyan-300">九州星圖跨界 · 遨遊太虛神州</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Swirling Stargate Canvas Animation */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="relative w-full h-52 rounded-2xl bg-[#060b14] border border-cyan-600/40 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Swirling vortex rings */}
            <div
              className={`absolute w-44 h-44 rounded-full border-2 border-dashed border-cyan-400/50 animate-spin ${
                isTeleporting ? 'scale-150 duration-700' : ''
              }`}
              style={{ animationDuration: '20s' }}
            />
            <div
              className={`absolute w-32 h-32 rounded-full border-2 border-dotted border-teal-300/60 animate-spin ${
                isTeleporting ? 'scale-125 duration-500' : ''
              }`}
              style={{ animationDuration: '10s', animationDirection: 'reverse' }}
            />
            <div className="absolute w-20 h-20 rounded-full bg-cyan-400/25 blur-xl animate-pulse" />

            {/* Center icon / status */}
            <div className="relative z-10 text-center space-y-1">
              <div className="text-4xl">{currentMap.icon}</div>
              <h4 className="text-lg font-bold text-white font-serif">{currentMap.name}</h4>
              <p className="text-xs text-cyan-300 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {currentMap.climate}
              </p>
            </div>

            {isTeleporting && (
              <div className="absolute inset-0 bg-cyan-400/30 backdrop-blur-sm flex items-center justify-center z-20">
                <span className="text-lg font-bold text-white tracking-widest animate-pulse font-serif">
                  太虛穿梭中 · 移星換斗...
                </span>
              </div>
            )}
          </div>

          {/* Map selector list */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-slate-300">可傳送洞天福地：</span>
            <div className="grid grid-cols-1 gap-2.5">
              {WORLD_MAPS.map((map) => (
                <div
                  key={map.id}
                  onClick={() => {
                    sounds.playChime(523.25, 0.2);
                    setSelectedMapId(map.id);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedMapId === map.id
                      ? 'bg-gradient-to-r from-cyan-950/70 to-teal-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-[#09111c] border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{map.icon}</span>
                    <div>
                      <h5 className="text-sm font-bold font-serif">{map.name}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">{map.description}</p>
                      <span className="inline-block text-[11px] text-teal-300 font-semibold mt-1">
                        ✨ 洞天福緣：{map.bonus}
                      </span>
                    </div>
                  </div>

                  {selectedMapId === map.id && (
                    <span className="text-xs text-cyan-400 font-bold whitespace-nowrap ml-2">
                      當前鎖定
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Teleport action button */}
          <button
            onClick={handleTeleport}
            disabled={isTeleporting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Navigation className="w-4 h-4 fill-current" />
            啟動星璿陣門 · 傳送至【{currentMap.name}】
          </button>
        </div>
      </div>
    </div>
  );
};

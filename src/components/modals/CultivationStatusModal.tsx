import React, { useState } from 'react';
import { X, Award, Shield, Zap, Sparkles, User, Package, Heart, RefreshCw } from 'lucide-react';
import { PlayerStats, InventoryItem, RealmInfo } from '../../types/cultivation';
import { REALMS } from '../../data/cultivationData';
import { sounds } from '../../utils/audio';

interface CultivationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onTriggerBreakthrough: () => void;
}

export const CultivationStatusModal: React.FC<CultivationStatusModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
  onTriggerBreakthrough,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'inventory'>('status');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(stats.daoName);

  const currentRealm: RealmInfo = REALMS[stats.currentRealmIndex] || REALMS[0];
  const nextRealm = REALMS[stats.currentRealmIndex + 1];
  const canBreakthrough = stats.currentExp >= currentRealm.maxExp;

  if (!isOpen) return null;

  // Consume pill to gain Exp
  const handleConsumeItem = (item: InventoryItem) => {
    if (item.type !== 'pill' && item.type !== 'herb') {
      alert('此乃法寶或靈材，不可直接吞服！');
      return;
    }

    sounds.playQiAbsorb();
    const expGained = item.type === 'pill' ? 35 : 10;

    // Deduct 1 count
    const updated = stats.inventory
      .map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i))
      .filter((i) => i.count > 0);

    onUpdateStats({
      inventory: updated,
      currentExp: Math.min(currentRealm.maxExp * 1.5, stats.currentExp + expGained),
    });
  };

  const handleSaveDaoName = () => {
    if (tempName.trim()) {
      onUpdateStats({ daoName: tempName.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#121c2e] via-[#0d1523] to-[#070b13] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#16243b]/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">修仙玉牒 · 狀態總覽</h3>
              <p className="text-xs text-cyan-400">大道無涯 · 丹田經脈周天運轉</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-cyan-950 bg-[#09111c]">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'status'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            洞府修為本體
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            乾坤儲物袋 ({stats.inventory.length})
          </button>
        </div>

        {/* Tab 1: Status */}
        {activeTab === 'status' && (
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Daoist Profile Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1627] to-[#14223b] border border-cyan-700/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-slate-900 border border-cyan-500 rounded px-2 py-0.5 text-sm text-cyan-200 w-32"
                      />
                      <button
                        onClick={handleSaveDaoName}
                        className="text-xs px-2 py-0.5 bg-cyan-600 rounded text-white"
                      >
                        保存
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-bold text-white font-serif tracking-wider">
                        {stats.daoName}
                      </h4>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-[11px] text-cyan-400 underline"
                      >
                        改道號
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-cyan-300 mt-1">小雪修仙門徒 · 氣運所鍾</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500 text-xs font-bold text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  {currentRealm.stage}
                </span>
              </div>
            </div>

            {/* Cultivation Exp progress */}
            <div className="p-4 rounded-2xl bg-[#09111e] border border-cyan-900/60 space-y-2">
              <div className="flex justify-between text-xs text-slate-200">
                <span>丹田真氣凝聚進度</span>
                <span className="text-cyan-300 font-bold">
                  {stats.currentExp} / {currentRealm.maxExp} 靈氣 ({Math.min(100, Math.floor((stats.currentExp / currentRealm.maxExp) * 100))}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-950">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#22d3ee]"
                  style={{ width: `${Math.min(100, (stats.currentExp / currentRealm.maxExp) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 italic">
                {currentRealm.description}
              </p>

              {canBreakthrough && (
                <button
                  onClick={() => {
                    sounds.playBreakthrough();
                    onTriggerBreakthrough();
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_#f59e0b] animate-bounce"
                >
                  ⚡ 衝擊突破至【{nextRealm?.stage || '大道終點'}】！
                </button>
              )}
            </div>

            {/* Five Elements Spiritual Roots */}
            <div className="p-4 rounded-2xl bg-[#09111e] border border-cyan-900/60 space-y-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-serif">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                先天五行靈根純度
              </span>

              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200">
                  <div className="text-[10px] opacity-70">庚金</div>
                  <div className="font-bold text-sm mt-0.5">85%</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                  <div className="text-[10px] opacity-70">乙木</div>
                  <div className="font-bold text-sm mt-0.5">92%</div>
                </div>
                <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200">
                  <div className="text-[10px] opacity-70">癸水</div>
                  <div className="font-bold text-sm mt-0.5">96%</div>
                </div>
                <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200">
                  <div className="text-[10px] opacity-70">丙火</div>
                  <div className="font-bold text-sm mt-0.5">78%</div>
                </div>
                <div className="p-2 rounded-xl bg-yellow-950/40 border border-yellow-500/40 text-yellow-200">
                  <div className="text-[10px] opacity-70">戊土</div>
                  <div className="font-bold text-sm mt-0.5">88%</div>
                </div>
              </div>
            </div>

            {/* Daoist statistics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0a121e] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">儲備靈石</span>
                <span className="text-amber-300 font-bold">{stats.spiritStones} 💎</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a121e] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">小雪好感</span>
                <span className="text-rose-300 font-bold">{stats.affinityWithXiaoxue}% 💖</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a121e] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">妖獸精魄</span>
                <span className="text-orange-300 font-bold">{stats.beastSouls} 顆</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a121e] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">真言習得</span>
                <span className="text-cyan-300 font-bold">{stats.englishVocabularyMastered} 條</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Inventory */}
        {activeTab === 'inventory' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="text-xs text-slate-300 flex justify-between items-center">
              <span>儲物袋容量：{stats.inventory.length} 種珍寶</span>
              <span className="text-cyan-400">點擊靈丹可當場吞服修煉</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {stats.inventory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#0a1322] border border-slate-800 hover:border-cyan-600/50 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-lg bg-slate-900 border border-slate-700">
                      {item.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-serif">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {item.grade}
                        </span>
                        <span className="text-xs text-amber-300 font-mono">x{item.count}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  {item.type === 'pill' && (
                    <button
                      onClick={() => handleConsumeItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs whitespace-nowrap active:scale-95"
                    >
                      服用 (+35氣)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

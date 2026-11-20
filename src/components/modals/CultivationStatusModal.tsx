import React, { useState } from 'react';
import { X, Award, Shield, Zap, Sparkles, User, Package, Heart, LogIn, CheckCircle2 } from 'lucide-react';
import { PlayerStats, InventoryItem, RealmInfo } from '../../types/cultivation';
import { REALMS } from '../../data/cultivationData';
import { sounds } from '../../utils/audio';
import { useAuth } from '../../contexts/AuthContext';
import { CULTIVATION_REALMS } from '../../utils/cultivationLevels';

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
  const { user, playerData, realmInfo, loginWithGoogle, gainSpiritualPower } = useAuth();
  const [activeTab, setActiveTab] = useState<'status' | 'inventory' | 'realms'>('status');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(stats.daoName);

  if (!isOpen) return null;

  // Strictly connect to Firebase Firestore database when user is logged in
  const spiritualPower = user
    ? (playerData?.cultivation?.totalSpiritualPower ?? 0)
    : (stats.currentExp ?? 0);
  const spiritStones = user
    ? (playerData?.cultivation?.spiritStones ?? 0)
    : (stats.spiritStones ?? 0);
  const currentTitle = realmInfo.fullTitle;

  // Consume pill to gain Exp
  const handleConsumeItem = async (item: InventoryItem) => {
    if (item.type !== 'pill' && item.type !== 'herb') {
      alert('此乃法寶或靈材，不可直接吞服！');
      return;
    }

    sounds.playQiAbsorb();
    const expGained = item.type === 'pill' ? 35 : 10;

    const updated = stats.inventory
      .map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i))
      .filter((i) => i.count > 0);

    if (user?.uid) {
      await gainSpiritualPower(expGained, 0);
    }

    onUpdateStats({
      inventory: updated,
      currentExp: Math.min(45000, spiritualPower + expGained),
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
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'status'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            修為本體
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            儲物袋 ({stats.inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('realms')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'realms'
                ? 'border-teal-400 text-teal-300 bg-teal-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            九大境界總表
          </button>
        </div>

        {/* Tab 1: Status */}
        {activeTab === 'status' && (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Google Authentication & Identity Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1627] to-[#14223b] border border-cyan-700/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Google Avatar" className="w-11 h-11 rounded-full border-2 border-cyan-400 shadow-md" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-cyan-950 border-2 border-cyan-700 flex items-center justify-center text-lg">
                      🧘
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white font-serif">
                        {user ? (playerData?.profile?.displayName || user.displayName || '修仙道友') : stats.daoName}
                      </h4>
                      {user && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300">
                          Google 認證
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {user ? user.email : '尚未綁定 Google 帳號 (進度僅限本機)'}
                    </p>
                  </div>
                </div>

                <div>
                  {user ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[11px] text-emerald-300 font-medium shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>已連結雲端</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {playerData?.profile?.lastLoginAt ? `最近同步: ${new Date(playerData.profile.lastLoginAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}` : '即時同步中'}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => loginWithGoogle().catch(() => {})}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Google 登入</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Firestore Ledger Badge */}
              <div className="pt-2 border-t border-cyan-900/50 flex items-center justify-between text-[11px] text-cyan-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>母世界 Firebase 中央帳本：{user ? '雲端即時同步' : '訪客離線模式'}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {user ? `UID: ${user.uid.slice(0, 8)}...` : '無雲端 UID'}
                </span>
              </div>
            </div>

            {/* Cultivation Spiritual Power progress (Strictly visible only when logged in) */}
            {user ? (
              <>
                <div className="p-4 rounded-2xl bg-[#09111e] border border-cyan-900/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-300">母世界修行境界</span>
                      <div className="text-xl font-bold text-cyan-200 font-serif mt-0.5 flex items-center gap-1.5">
                        <span>{currentTitle}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-sans font-normal">
                          雲端連動
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">總累積靈力值</span>
                      <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">
                        {spiritualPower.toLocaleString()} <span className="text-xs text-slate-400">/ 45,000</span>
                      </div>
                      <div className="text-[11px] text-amber-200 mt-0.5">
                        儲備靈石：{spiritStones.toLocaleString()} 💎
                      </div>
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>階段突破進度（{realmInfo.stageName}）</span>
                      <span className="font-bold text-cyan-300">{realmInfo.stageProgressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-950">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#22d3ee]"
                        style={{ width: `${realmInfo.stageProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>當前階段範圍：{realmInfo.stageMin} ～ {realmInfo.stageMax} 點</span>
                    <span className="text-cyan-300 font-medium">
                      {realmInfo.isMaxLevel ? '✨ 已至極境圓滿' : `距下一階需 +${realmInfo.powerNeededForNext} 點`}
                    </span>
                  </div>
                </div>

                {/* DLC Domains Progress (Strictly Connected to Firebase dlc_data) */}
                <div className="p-4 rounded-2xl bg-[#09111e] border border-cyan-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-serif">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      母世界 · 各 DLC 領域修為與歷練
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      雲端即時連動
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* 1. English Spells */}
                    <div className="p-2.5 rounded-xl bg-[#0d1627] border border-cyan-800/40 space-y-1">
                      <div className="flex items-center justify-between text-slate-200 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span>🔤</span>
                          <span>英文咒語領域</span>
                        </span>
                        <span className="text-cyan-300 font-mono text-[11px]">
                          +{(playerData?.dlc_data?.dlc_spellbook?.totalEXP ?? 0).toLocaleString()} 點
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>最高成就：</span>
                        <span className="text-amber-300 font-medium">
                          {playerData?.dlc_data?.dlc_spellbook?.highestAchievement || '初入道途'}
                        </span>
                      </div>
                    </div>

                    {/* 2. Gear / Breaker Puzzle */}
                    <div className="p-2.5 rounded-xl bg-[#0d1627] border border-cyan-800/40 space-y-1">
                      <div className="flex items-center justify-between text-slate-200 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span>🧩</span>
                          <span>破陣方塊領域</span>
                        </span>
                        <span className="text-cyan-300 font-mono text-[11px]">
                          +{(playerData?.dlc_data?.dlc_gear_puzzle?.totalEXP ?? 0).toLocaleString()} 點
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>最高成就：</span>
                        <span className="text-amber-300 font-medium">
                          {playerData?.dlc_data?.dlc_gear_puzzle?.highestAchievement || '璇璣合道'}
                        </span>
                      </div>
                    </div>

                    {/* 3. Herb Alchemy */}
                    <div className="p-2.5 rounded-xl bg-[#0d1627] border border-cyan-800/40 space-y-1">
                      <div className="flex items-center justify-between text-slate-200 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span>🌿</span>
                          <span>百草煉丹領域</span>
                        </span>
                        <span className="text-cyan-300 font-mono text-[11px]">
                          +{(playerData?.dlc_data?.dlc_herb_alchemy?.totalEXP ?? 0).toLocaleString()} 點
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>最高成就：</span>
                        <span className="text-amber-300 font-medium">
                          {playerData?.dlc_data?.dlc_herb_alchemy?.highestAchievement || '百草丹徒'}
                        </span>
                      </div>
                    </div>

                    {/* 4. Beast Hunt */}
                    <div className="p-2.5 rounded-xl bg-[#0d1627] border border-cyan-800/40 space-y-1">
                      <div className="flex items-center justify-between text-slate-200 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span>🐾</span>
                          <span>靈木巡獵領域</span>
                        </span>
                        <span className="text-cyan-300 font-mono text-[11px]">
                          +{(playerData?.dlc_data?.dlc_beast_hunter?.totalEXP ?? 0).toLocaleString()} 點
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>最高成就：</span>
                        <span className="text-amber-300 font-medium">
                          {playerData?.dlc_data?.dlc_beast_hunter?.highestAchievement || '靈木巡獵'}
                        </span>
                      </div>
                    </div>

                    {/* 5. Fishing River */}
                    <div className="p-2.5 rounded-xl bg-[#0d1627] border border-cyan-800/40 space-y-1">
                      <div className="flex items-center justify-between text-slate-200 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span>🎣</span>
                          <span>碧波垂綸領域</span>
                        </span>
                        <span className="text-cyan-300 font-mono text-[11px]">
                          +{(playerData?.dlc_data?.dlc_fishing_river?.totalEXP ?? 0).toLocaleString()} 點
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>最高成就：</span>
                        <span className="text-amber-300 font-medium">
                          {playerData?.dlc_data?.dlc_fishing_river?.highestAchievement || '碧波垂綸'}
                        </span>
                      </div>
                    </div>

                    {/* 6. Talisman 2048 */}
                    <div className="p-2.5 rounded-xl bg-[#0d1627] border border-cyan-800/40 space-y-1">
                      <div className="flex items-center justify-between text-slate-200 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span>📜</span>
                          <span>太玄符紋領域</span>
                        </span>
                        <span className="text-cyan-300 font-mono text-[11px]">
                          +{(playerData?.dlc_data?.dlc_talisman_2048?.totalEXP ?? 0).toLocaleString()} 點
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>最高成就：</span>
                        <span className="text-amber-300 font-medium">
                          {playerData?.dlc_data?.dlc_talisman_2048?.highestAchievement || '符紋初通'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 rounded-2xl bg-[#09111e]/90 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl mx-auto shadow-inner">
                  🔒
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-200 font-serif">修仙玉牒尚未啟動</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    道友目前為凡塵散修身份。請以 Google 帳號登入，即可在母世界中央資料庫建立專屬修為與靈力檔案。
                  </p>
                </div>
                <button
                  onClick={() => loginWithGoogle().catch(() => {})}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>立即以 Google 登入開啟修為</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Inventory */}
        {activeTab === 'inventory' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">點擊丹藥即可直接服下凝練靈力：</span>
              <span className="text-xs text-amber-300 font-bold">靈石：{spiritStones} 💎</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {stats.inventory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleConsumeItem(item)}
                  className="p-3 rounded-xl bg-[#09111c] border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h5 className="text-xs font-bold text-white font-serif">{item.name}</h5>
                      <p className="text-[11px] text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-200 font-bold font-mono">
                    x{item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Full 36-Stage Realms Specification Table */}
        {activeTab === 'realms' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-600/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-cyan-300">當前所在境界：</span>
                <span className="text-sm font-bold text-white font-serif ml-1">{currentTitle}</span>
              </div>
              <div className="text-[11px] text-amber-300">
                總上限：45,000 點（渡劫圓滿）
              </div>
            </div>

            <div className="space-y-3">
              {CULTIVATION_REALMS.map((realm, idx) => {
                const isCurrentRealm = realmInfo.realmName === realm.name;

                return (
                  <div
                    key={realm.id}
                    className={`rounded-2xl border p-3 transition-all ${
                      isCurrentRealm
                        ? 'bg-gradient-to-r from-cyan-950/70 to-teal-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-[#09111c] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white font-serif">{realm.name}</h4>
                        {isCurrentRealm && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-bold">
                            當前位階
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-cyan-300">
                        {realm.overall_min.toLocaleString()} ～ {realm.overall_max.toLocaleString()} 點
                      </span>
                    </div>

                    {/* 4 Stages */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {realm.stages.map((stage) => {
                        const isCurrentStage = isCurrentRealm && realmInfo.stageName === stage.stage;

                        return (
                          <div
                            key={stage.stage}
                            className={`p-1.5 rounded-lg border text-[11px] ${
                              isCurrentStage
                                ? 'bg-cyan-500/20 border-cyan-300 text-cyan-200 font-bold shadow-sm'
                                : 'bg-black/30 border-white/5 text-slate-400'
                            }`}
                          >
                            <div className="font-serif">{stage.stage}</div>
                            <div className="text-[9px] opacity-75 font-mono mt-0.5">
                              {stage.min}～{stage.max}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Award, Shield, Zap, Sparkles, User, Package, Heart, LogIn, CheckCircle2 } from 'lucide-react';
import { PlayerStats, InventoryItem, RealmInfo } from '../../types/cultivation';
import { REALMS } from '../../data/cultivationData';
import { sounds } from '../../utils/audio';
import { useAuth } from '../../contexts/AuthContext';
import { CULTIVATION_REALMS, calculateRealm } from '../../utils/cultivationLevels';

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

  if (!isOpen) return null;

  // 12 Zodiac DLC realms reading dynamically from Firestore / player data
  const dlcDefinitions = [
    { id: 'dlc_luck', title: '子鼠推天' },
    { id: 'dlc_spellbook', title: '丑牛耕卷' },
    { id: 'dlc_pond', title: '寅虎藏禪' },
    { id: 'dlc_forest', title: '卯兔采芝' },
    { id: 'dlc_meditate', title: '辰龍吐納' },
    { id: 'dlc_fish', title: '巳蛇戲淵' },
    { id: 'dlc_merge', title: '午馬躍遷' },
    { id: 'dlc_tank', title: '未羊御陣' },
    { id: 'dlc_drop', title: '申猴破陣' },
    { id: 'dlc_sudoku', title: '酉雞推演' },
    { id: 'dlc_ruins', title: '戌狗尋秘' },
    { id: 'dlc_survival', title: '亥豬鎮疆' },
  ];

  const dlcRealms = dlcDefinitions.map((d, index) => {
    const dlcItem = playerData?.dlc_data?.[d.id] as any;
    const cloudExp = dlcItem?.total_exp ?? dlcItem?.totalEXP;
    const exp = cloudExp !== undefined ? cloudExp : (index + 1);
    return {
      id: d.id,
      title: d.title,
      exp,
    };
  });

  // Total cultivation sum of all 12 sub-worlds (60 total)
  const totalDlcExp = dlcRealms.reduce((sum, d) => sum + d.exp, 0);

  // Calculate realm based on total 60 exp
  const calculatedRealm = calculateRealm(totalDlcExp);
  const currentTitle = calculatedRealm.fullTitle;


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
      await gainSpiritualPower(expGained);
    }

    onUpdateStats({
      inventory: updated,
      currentExp: Math.min(45000, totalDlcExp + expGained),
    });
  };

  // Five Elements values reading dynamically from database cultivation.five_elements
  const dbFiveElements = playerData?.cultivation?.five_elements ?? (playerData?.cultivation as any)?.fiveElements;
  const fiveElements = [
    { name: '金', value: dbFiveElements?.metal ?? 35, max: 100, color: '#facc15' },
    { name: '木', value: dbFiveElements?.wood ?? 20, max: 100, color: '#4ade80' },
    { name: '水', value: dbFiveElements?.water ?? 15, max: 100, color: '#38bdf8' },
    { name: '火', value: dbFiveElements?.fire ?? 80, max: 100, color: '#fb923c' },
    { name: '土', value: dbFiveElements?.earth ?? 30, max: 100, color: '#fbbf24' },
  ];
  const primaryRoot = dbFiveElements?.primary_root ?? dbFiveElements?.primaryRoot ?? '火';

  // Calculate dynamic polygon points for the 5-point radar based on values (0-100 scale)
  // Center is (50, 50), max radius is 40
  // Angles: 金(top, -90deg), 木(right-top, -18deg), 水(right-bottom, 54deg), 火(left-bottom, 126deg), 土(left-top, 198deg)
  // Radians = angle * (Math.PI / 180)
  const getRadarPoint = (index: number, value: number) => {
    const angle = -90 + index * 72; // 360 / 5 = 72 degrees per vertex
    const rad = (angle * Math.PI) / 180;
    const radius = (value / 100) * 40; // Max radius 40
    const x = 50 + radius * Math.cos(rad);
    const y = 50 + radius * Math.sin(rad);
    return `${x},${y}`;
  };

  const radarPoints = fiveElements.map((el, i) => getRadarPoint(i, el.value)).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#121c2e] via-[#0d1523] to-[#070b13] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#16243b]/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">修為</h3>
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
            修為
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
            境界
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
        </div>

        {/* Tab 1: Status */}
        {activeTab === 'status' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Top Summary Bar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#09111e] border border-cyan-900/60">
                <span className="text-[11px] text-slate-400">當前境界</span>
                <div className="text-base font-bold text-cyan-200 font-serif mt-0.5 truncate">
                  {currentTitle}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#09111e] border border-cyan-900/60">
                <span className="text-[11px] text-slate-400">總修為（12世界加總）</span>
                <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
                  {totalDlcExp.toLocaleString()} 點
                </div>
              </div>
            </div>

            {/* Section 1: 五行靈根 */}
            <div className="p-4 rounded-2xl bg-[#09111e] border border-cyan-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
                <span className="font-bold text-slate-200 font-serif">五行靈根</span>
                <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/40">
                  🔥 {primaryRoot}靈根 · 主要靈根
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Dynamic Radar Chart based on actual values */}
                <div className="relative flex items-center justify-center h-44 bg-[#060a12] rounded-xl border border-cyan-950 p-2">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-32 h-32 rounded-full border border-cyan-500/40 absolute"></div>
                    <div className="w-20 h-20 rounded-full border border-cyan-500/40 absolute"></div>
                    <div className="w-8 h-8 rounded-full border border-cyan-500/40 absolute"></div>
                  </div>
                  {/* Dynamic Polygon */}
                  <svg className="w-40 h-40 overflow-visible" viewBox="0 0 100 100">
                    {/* Background max pentagon */}
                    <polygon
                      points="50,10 88,38 74,82 26,82 12,38"
                      fill="none"
                      stroke="rgba(6, 182, 212, 0.2)"
                      strokeWidth="1"
                    />
                    {/* Dynamic value polygon */}
                    <polygon
                      points={radarPoints}
                      fill="rgba(245, 158, 11, 0.3)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    {fiveElements.map((el, i) => {
                      const pt = getRadarPoint(i, el.value).split(',');
                      return <circle key={el.name} cx={pt[0]} cy={pt[1]} r="3" fill={el.color} />;
                    })}
                  </svg>
                  {/* Labels positioned around */}
                  <div className="absolute top-1.5 text-[11px] font-bold text-yellow-300">金 ({fiveElements[0].value})</div>
                  <div className="absolute right-3 top-10 text-[11px] font-bold text-green-300">木 ({fiveElements[1].value})</div>
                  <div className="absolute right-5 bottom-4 text-[11px] font-bold text-sky-300">水 ({fiveElements[2].value})</div>
                  <div className="absolute left-5 bottom-4 text-[11px] font-bold text-orange-400">火 ({fiveElements[3].value})</div>
                  <div className="absolute left-3 top-10 text-[11px] font-bold text-amber-300">土 ({fiveElements[4].value})</div>
                </div>

                {/* Right: Five Elements Progress Bars with 35/100 format */}
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-300 font-medium">五行數值分佈（上限 100）</div>
                  {fiveElements.map((el) => (
                    <div key={el.name} className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-300">{el.name}</span>
                        <span className="font-mono font-bold text-white">
                          {el.value} / {el.max}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(el.value / el.max) * 100}%`, backgroundColor: el.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: 十二世界修為 */}
            <div className="p-4 rounded-2xl bg-[#09111e] border border-cyan-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
                <span className="font-bold text-slate-200 font-serif">十二世界修為</span>
                <span className="text-[10px] text-cyan-400 font-mono">各子世界固定 5 點（待對接資料庫）</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dlcRealms.map((dlc) => (
                  <div
                    key={dlc.id}
                    className="p-3 rounded-xl bg-[#0d1627] border border-cyan-900/50 hover:border-cyan-600/50 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-200 font-serif">{dlc.title}</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        +{dlc.exp} 點
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-950">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full"
                        style={{ width: `${(dlc.exp / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Inventory */}
        {activeTab === 'inventory' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">點擊丹藥即可直接服下凝練靈力：</span>
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
                const isCurrentRealm = calculatedRealm.realmName === realm.name;

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
                        const isCurrentStage = isCurrentRealm && calculatedRealm.stageName === stage.stage;

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

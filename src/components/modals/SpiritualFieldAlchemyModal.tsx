import React, { useState } from 'react';
import { X, Sprout, Flame, Droplets, Sparkles, Check, Plus } from 'lucide-react';
import { PlayerStats, InventoryItem } from '../../types/cultivation';
import { ALCHEMY_RECIPES, AlchemyRecipe } from '../../data/cultivationData';
import { sounds } from '../../utils/audio';

interface SpiritualFieldAlchemyModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

interface Plot {
  id: number;
  plantedHerbName: string | null;
  growth: number; // 0 to 100
  watered: boolean;
}

export const SpiritualFieldAlchemyModal: React.FC<SpiritualFieldAlchemyModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [activeTab, setActiveTab] = useState<'field' | 'alchemy'>('field');
  const [plots, setPlots] = useState<Plot[]>([
    { id: 1, plantedHerbName: '玄冰靈草', growth: 80, watered: true },
    { id: 2, plantedHerbName: '赤陽朱果', growth: 45, watered: false },
    { id: 3, plantedHerbName: null, growth: 0, watered: false },
    { id: 4, plantedHerbName: null, growth: 0, watered: false },
  ]);

  const [selectedRecipe, setSelectedRecipe] = useState<AlchemyRecipe>(ALCHEMY_RECIPES[0]);
  const [alchemyState, setAlchemyState] = useState<'idle' | 'brewing' | 'done'>('idle');
  const [cauldronHeat, setCauldronHeat] = useState(50);

  if (!isOpen) return null;

  // Water plot
  const handleWater = (plotId: number) => {
    sounds.playWaterSplash();
    setPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId && p.plantedHerbName) {
          const newGrowth = Math.min(100, p.growth + 30);
          return { ...p, watered: true, growth: newGrowth };
        }
        return p;
      })
    );
  };

  // Harvest herb
  const handleHarvest = (plotId: number) => {
    const plot = plots.find((p) => p.id === plotId);
    if (!plot || !plot.plantedHerbName || plot.growth < 100) return;

    sounds.playBreakthrough();
    const herbName = plot.plantedHerbName;

    // Add to inventory
    const existing = stats.inventory.find((i) => i.name === herbName);
    let updatedInv: InventoryItem[];
    if (existing) {
      updatedInv = stats.inventory.map((i) =>
        i.name === herbName ? { ...i, count: i.count + 2 } : i
      );
    } else {
      updatedInv = [
        ...stats.inventory,
        {
          id: `herb-${Date.now()}`,
          name: herbName,
          type: 'herb',
          grade: '靈階',
          count: 2,
          icon: '🌿',
          description: `從自家靈田細心培育出的新鮮${herbName}。`,
        },
      ];
    }

    onUpdateStats({
      inventory: updatedInv,
      currentExp: stats.currentExp + 20,
    });

    // Reset plot
    setPlots((prev) =>
      prev.map((p) => (p.id === plotId ? { ...p, plantedHerbName: null, growth: 0, watered: false } : p))
    );
  };

  // Plant seed
  const handlePlant = (plotId: number, herb: string) => {
    sounds.playChime(440, 0.3);
    setPlots((prev) =>
      prev.map((p) => (p.id === plotId ? { ...p, plantedHerbName: herb, growth: 10, watered: true } : p))
    );
  };

  // Brew pill in cauldron
  const handleStartBrew = () => {
    // Check ingredients
    for (const req of selectedRecipe.ingredients) {
      const have = stats.inventory.find((i) => i.name === req.name)?.count || 0;
      if (have < req.count) {
        alert(`藥材不足！缺少【${req.name}】x${req.count - have} 株，請在靈田培育或野外探查！`);
        return;
      }
    }

    // Deduct ingredients
    let updatedInv = stats.inventory.map((i) => {
      const match = selectedRecipe.ingredients.find((req) => req.name === i.name);
      if (match) {
        return { ...i, count: i.count - match.count };
      }
      return i;
    }).filter((i) => i.count > 0);

    sounds.playChime(329.63, 0.6);
    setAlchemyState('brewing');

    // Simulate 2.5s pill brewing
    setTimeout(() => {
      sounds.playBreakthrough();
      setAlchemyState('done');

      // Add pill to inventory
      const existingPill = updatedInv.find((i) => i.name === selectedRecipe.targetItemName);
      if (existingPill) {
        updatedInv = updatedInv.map((i) =>
          i.name === selectedRecipe.targetItemName ? { ...i, count: i.count + 1 } : i
        );
      } else {
        updatedInv.push({
          id: `pill-${Date.now()}`,
          name: selectedRecipe.targetItemName,
          type: 'pill',
          grade: selectedRecipe.grade,
          count: 1,
          icon: '💊',
          description: selectedRecipe.description,
        });
      }

      onUpdateStats({
        inventory: updatedInv,
        currentExp: stats.currentExp + selectedRecipe.expReward,
        alchemyPoints: stats.alchemyPoints + 15,
      });
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#111e2b] via-[#0c1622] to-[#070d14] border border-emerald-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/40 bg-[#162738]/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">靈田 · 煉丹房</h3>
              <p className="text-xs text-emerald-300">草藥培靈 · 八卦神鼎化丹</p>
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
        <div className="flex border-b border-emerald-950 bg-[#0a121c]">
          <button
            onClick={() => setActiveTab('field')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'field'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sprout className="w-4 h-4" />
            洞天靈田 (種植採收)
          </button>
          <button
            onClick={() => setActiveTab('alchemy')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'alchemy'
                ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            八卦煉丹房 (開鼎成丹)
          </button>
        </div>

        {/* Tab 1: Spiritual Field */}
        {activeTab === 'field' && (
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>四象聚靈陣土壤 · 靈氣浸潤</span>
              <span className="text-emerald-400">目前靈水充足</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {plots.map((plot) => (
                <div
                  key={plot.id}
                  className="rounded-2xl bg-[#09121e] border border-emerald-800/50 p-4 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300 font-serif">
                      靈圃 #{plot.id}
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      {plot.growth >= 100 ? '可收割' : plot.plantedHerbName ? `${plot.growth}%` : '閒置'}
                    </span>
                  </div>

                  {plot.plantedHerbName ? (
                    <div className="text-center my-2 space-y-1">
                      <div className="text-2xl animate-pulse">🌿</div>
                      <div className="text-xs font-bold text-emerald-200">{plot.plantedHerbName}</div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-teal-400 to-emerald-400"
                          style={{ width: `${plot.growth}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center my-3 text-xs text-slate-500">
                      肥沃靈土，尚未播種
                    </div>
                  )}

                  <div className="flex gap-1.5 pt-2">
                    {plot.growth >= 100 ? (
                      <button
                        onClick={() => handleHarvest(plot.id)}
                        className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md animate-bounce"
                      >
                        採摘入囊
                      </button>
                    ) : plot.plantedHerbName ? (
                      <button
                        onClick={() => handleWater(plot.id)}
                        className="w-full py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-600/40 text-cyan-200 text-xs flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                        澆灌靈泉 (+30%)
                      </button>
                    ) : (
                      <div className="flex gap-1 w-full">
                        <button
                          onClick={() => handlePlant(plot.id, '玄冰靈草')}
                          className="flex-1 py-1 rounded-md bg-slate-800 hover:bg-emerald-900 text-[10px] text-emerald-200"
                        >
                          播玄冰草
                        </button>
                        <button
                          onClick={() => handlePlant(plot.id, '赤陽朱果')}
                          className="flex-1 py-1 rounded-md bg-slate-800 hover:bg-amber-900 text-[10px] text-amber-200"
                        >
                          播朱果
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Alchemy Cauldron */}
        {activeTab === 'alchemy' && (
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Cauldron Visual */}
            <div className="rounded-2xl bg-gradient-to-b from-[#141d2a] to-[#0c1420] border border-amber-600/40 p-5 text-center relative overflow-hidden">
              <div className="text-4xl my-2 animate-bounce">🏺</div>
              <h4 className="text-base font-bold text-amber-200 font-serif">九鼎乾坤爐</h4>
              <p className="text-xs text-slate-400 mt-1">丹火凝神，文武交泰方能成丹</p>

              {alchemyState === 'brewing' && (
                <div className="mt-4 p-3 bg-amber-950/80 rounded-xl border border-amber-500/50 text-amber-300 text-xs animate-pulse">
                  🔥 爐火熾烈，三昧真火融合靈液中...
                </div>
              )}

              {alchemyState === 'done' && (
                <div className="mt-4 p-3 bg-emerald-950/80 rounded-xl border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                  ✨ 霞光萬道！【{selectedRecipe.targetItemName}】煉製功成！已入儲物袋！
                </div>
              )}
            </div>

            {/* Recipes List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">丹方選錄：</span>
              <div className="grid grid-cols-1 gap-2">
                {ALCHEMY_RECIPES.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      sounds.playChime(440, 0.2);
                      setSelectedRecipe(r);
                      setAlchemyState('idle');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRecipe.id === r.id
                        ? 'bg-amber-950/60 border-amber-500 text-amber-100 shadow'
                        : 'bg-[#0b1320] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold font-serif">{r.name}</span>
                      <span className="text-xs text-amber-400">{r.grade}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{r.description}</p>
                    <div className="mt-2 flex gap-3 text-[11px] text-cyan-300">
                      {r.ingredients.map((ing) => {
                        const count = stats.inventory.find((i) => i.name === ing.name)?.count || 0;
                        return (
                          <span
                            key={ing.name}
                            className={count >= ing.count ? 'text-emerald-400' : 'text-rose-400'}
                          >
                            {ing.name}: {count}/{ing.count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brew Action */}
            <button
              onClick={handleStartBrew}
              disabled={alchemyState === 'brewing'}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 active:scale-98 transition-all"
            >
              {alchemyState === 'brewing' ? '火候融合中...' : `起鼎開煉【${selectedRecipe.targetItemName}】`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

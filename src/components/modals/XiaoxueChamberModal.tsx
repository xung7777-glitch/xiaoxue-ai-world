import React, { useState, useEffect } from 'react';
import { X, Sparkles, Heart, MessageCircle, Wind, Award } from 'lucide-react';
import { PlayerStats, RealmInfo } from '../../types/cultivation';
import { REALMS, XIAOXUE_DIALOGUES } from '../../data/cultivationData';
import { sounds } from '../../utils/audio';
import { CharacterSprite } from '../CharacterSprite';

interface XiaoxueChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onTriggerBreakthrough: () => void;
}

export const XiaoxueChamberModal: React.FC<XiaoxueChamberModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
  onTriggerBreakthrough,
}) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isMeditating, setIsMeditating] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'吸氣' | '呼氣'>('吸氣');
  const [absorbEffect, setAbsorbEffect] = useState(false);
  const [showModelSheet, setShowModelSheet] = useState(false);

  const currentRealm: RealmInfo = REALMS[stats.currentRealmIndex] || REALMS[0];
  const canBreakthrough = stats.currentExp >= currentRealm.maxExp;

  // Breathing cycle during meditation
  useEffect(() => {
    if (!isMeditating) return;
    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        const next = prev === '吸氣' ? '呼氣' : '吸氣';
        if (next === '呼氣') {
          // Grant Qi on breath exhale
          sounds.playQiAbsorb();
          setAbsorbEffect(true);
          setTimeout(() => setAbsorbEffect(false), 600);
          onUpdateStats({
            currentExp: Math.min(currentRealm.maxExp, stats.currentExp + 8),
          });
        }
        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isMeditating, stats.currentExp, currentRealm.maxExp, onUpdateStats]);

  if (!isOpen) return null;

  const handleNextDialogue = () => {
    sounds.playChime(523.25, 0.3);
    setDialogueIndex((prev) => (prev + 1) % XIAOXUE_DIALOGUES.length);
  };

  const handleGiftXiaoxue = () => {
    const herbs = stats.inventory.find((i) => i.type === 'herb' && i.count > 0);
    if (!herbs) {
      alert('儲物袋中暫無靈草可贈予小雪，可前往「靈田」採收或「野外」獲取！');
      return;
    }

    sounds.playChime(659.25, 0.8);
    const updatedInv = stats.inventory.map((item) =>
      item.id === herbs.id ? { ...item, count: item.count - 1 } : item
    ).filter((i) => i.count > 0);

    const newAffinity = Math.min(100, stats.affinityWithXiaoxue + 10);
    onUpdateStats({
      inventory: updatedInv,
      affinityWithXiaoxue: newAffinity,
      currentExp: Math.min(currentRealm.maxExp, stats.currentExp + 25),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#10192b] via-[#0d1524] to-[#090e18] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#121c2e]/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">小雪起居室</h3>
              <p className="text-xs text-cyan-400">紫霄峰上境 · 靈氣福地</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chamber Main Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Chamber illustration & Dialogue banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0d1627] to-[#162238] border border-cyan-800/50 p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0 relative">
              <CharacterSprite id="chamber" className="w-full h-full rounded-xl object-cover" glow={true} />
            </div>

            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-cyan-200 font-serif">小雪 (好感度: {stats.affinityWithXiaoxue}%)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  {currentRealm.stage} 侍道
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-cyan-900/30">
                「{XIAOXUE_DIALOGUES[dialogueIndex].text}」
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleNextDialogue}
                  className="text-xs px-3 py-1 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700/40 text-cyan-200 flex items-center gap-1 transition-all active:scale-95"
                >
                  <MessageCircle className="w-3 h-3" />
                  再聊兩句
                </button>
                <button
                  onClick={handleGiftXiaoxue}
                  className="text-xs px-3 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-700/40 text-rose-200 flex items-center gap-1 transition-all active:scale-95"
                >
                  <Heart className="w-3 h-3 text-rose-400" />
                  贈送靈草
                </button>
                <button
                  onClick={() => setShowModelSheet(true)}
                  className="text-xs px-3 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900/70 border border-teal-600/50 text-teal-200 flex items-center gap-1 transition-all active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  小雪原型圖鑑
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Meditation Circle */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-[#09111e] to-[#0d1628] border border-teal-500/30 relative overflow-hidden">
            <h4 className="text-base font-bold text-slate-200 mb-2 font-serif flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              吐納太玄靈氣 · 閉關打坐
            </h4>
            <p className="text-xs text-slate-400 text-center max-w-xs mb-5">
              跟隨仙道呼吸節奏，收斂神識，吸納周天純陽靈氣轉化為修為。
            </p>

            {/* Glowing animated breath circle */}
            <div className="relative w-40 h-40 flex items-center justify-center my-2">
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 transition-transform duration-[2800ms] ${
                  isMeditating && breathPhase === '吸氣' ? 'scale-125 opacity-100 rotate-90' : 'scale-90 opacity-40 rotate-0'
                }`}
              />

              {/* Middle aura ring */}
              <div
                className={`absolute w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500/20 via-teal-400/25 to-blue-500/20 blur-md transition-all duration-[2800ms] ${
                  isMeditating ? (breathPhase === '吸氣' ? 'scale-110 opacity-80' : 'scale-75 opacity-30') : 'opacity-20'
                }`}
              />

              {/* Center meditation button */}
              <button
                onClick={() => {
                  sounds.playChime(isMeditating ? 293.66 : 587.33, 0.5);
                  setIsMeditating(!isMeditating);
                }}
                className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
                  isMeditating
                    ? 'bg-gradient-to-b from-teal-500 to-cyan-700 text-white shadow-cyan-500/50 scale-105'
                    : 'bg-[#152136] hover:bg-[#1a2942] text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
                }`}
              >
                <Sparkles className={`w-5 h-5 mb-1 ${isMeditating ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                <span className="text-xs font-bold tracking-wider">
                  {isMeditating ? breathPhase : '開始冥想'}
                </span>
              </button>

              {absorbEffect && (
                <div className="absolute top-2 text-xs font-bold text-emerald-300 animate-bounce pointer-events-none">
                  +8 靈氣
                </div>
              )}
            </div>

            {/* Exp progress */}
            <div className="w-full mt-5">
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>當前修為：{currentRealm.stage}</span>
                <span className="text-cyan-300">
                  {stats.currentExp} / {currentRealm.maxExp} 靈氣
                </span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-900/60">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_#22d3ee]"
                  style={{ width: `${Math.min(100, (stats.currentExp / currentRealm.maxExp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Breakthrough button */}
            {canBreakthrough && (
              <button
                onClick={() => {
                  sounds.playBreakthrough();
                  onTriggerBreakthrough();
                }}
                className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 animate-pulse active:scale-98 transition-all"
              >
                <Award className="w-4 h-4" />
                靈氣圓滿 · 渡劫衝擊【{REALMS[stats.currentRealmIndex + 1]?.stage || '無上天尊'}】！
              </button>
            )}
          </div>
        </div>

        {/* Official Xiaoxue Reference Model Sheet Overlay */}
        {showModelSheet && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative max-w-4xl w-full bg-[#0b121e] border-2 border-cyan-400/60 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❄️</span>
                  <div>
                    <h4 className="text-base font-bold text-white font-serif">小雪 · 官方原型設定圖鑑</h4>
                    <p className="text-xs text-cyan-300">天青冰藍仙裙 · 珠翠花鈿 · 角色三視圖與細節原型</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModelSheet(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-2 my-2 flex flex-col items-center justify-center bg-[#070b13] rounded-2xl border border-cyan-950">
                <img
                  src="/assets/character/xiaoxue_reference.png"
                  alt="小雪官方原型設定"
                  className="max-h-[68vh] w-auto object-contain rounded-xl shadow-lg shadow-cyan-950"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 px-1">
                <span>原案規格：三視角身姿、面部花鈿、冰花髮釵、天青流雲刺繡、白鹿皮雲靴</span>
                <span className="text-cyan-400 font-semibold">後續繪圖生成基準已永久鎖定此原型</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

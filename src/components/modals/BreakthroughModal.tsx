import React from 'react';
import { Sparkles, Award, Zap, Check } from 'lucide-react';
import { RealmInfo } from '../../types/cultivation';

interface BreakthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  newRealm: RealmInfo;
}

export const BreakthroughModal: React.FC<BreakthroughModalProps> = ({
  isOpen,
  onClose,
  newRealm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#192419] via-[#0e1713] to-[#080d0b] border-2 border-amber-400 rounded-3xl p-6 text-center shadow-[0_0_80px_rgba(245,158,11,0.5)] overflow-hidden">
        {/* Glow halo */}
        <div className="absolute inset-0 bg-radial from-amber-400/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_#f59e0b] animate-bounce">
            <Award className="w-10 h-10 text-slate-950" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
              雷劫渡盡 · 道果初成
            </span>
            <h3 className="text-2xl font-black text-white font-serif tracking-wider">
              晉升【{newRealm.stage}】！
            </h3>
            <p className="text-sm text-amber-200/90 font-serif italic">
              「{newRealm.title}」
            </p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-amber-900/60">
            {newRealm.description}
          </p>

          <div className="py-1 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span>修為加成提升至 {newRealm.bonusMultiplier}x，得天道贈禮靈石 +150！</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-widest shadow-lg shadow-amber-950 transition-all active:scale-95"
          >
            謝天道垂憐 · 穩固境界
          </button>
        </div>
      </div>
    </div>
  );
};

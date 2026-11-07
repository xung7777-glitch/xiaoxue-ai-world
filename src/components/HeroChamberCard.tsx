import React from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { REALMS } from '../data/cultivationData';
import { PlayerStats } from '../types/cultivation';
import { sounds } from '../utils/audio';
import { CharacterSprite } from './CharacterSprite';

interface HeroChamberCardProps {
  stats: PlayerStats;
  onEnterChamber: () => void;
}

export const HeroChamberCard: React.FC<HeroChamberCardProps> = ({ stats, onEnterChamber }) => {
  const currentRealm = REALMS[stats.currentRealmIndex] || REALMS[0];
  const progressPercent = Math.min(100, Math.floor((stats.currentExp / currentRealm.maxExp) * 100));

  return (
    <div
      onClick={() => {
        sounds.playChime(392, 0.6);
        onEnterChamber();
      }}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-[#111928] via-[#0f172a] to-[#131d31] p-5 border border-cyan-700/35 hover:border-cyan-400/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:shadow-[0_10px_35px_rgba(6,182,212,0.2)] active:scale-[0.99]"
    >
      {/* Decorative celestial background mist */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10 group-hover:bg-cyan-400/15 transition-all" />

      <div className="relative z-10 flex items-center justify-between">
        {/* Left text section */}
        <div className="flex-1 pr-3 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-wide text-white font-serif drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                小雪起居室
              </h2>
            </div>
            
            <p className="text-cyan-400 font-medium text-sm mt-1 tracking-wider flex items-center gap-1.5">
              <span>冥想初始化</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </p>
          </div>

          <div className="mt-5">
            {/* Pill Badge matching screenshot: ● 當前修為：煉氣初期 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#09111e]/90 border border-teal-500/30 text-xs text-teal-200 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="font-medium tracking-wide">
                當前修為：{currentRealm.stage}
              </span>
            </div>

            {/* Experience progress bar */}
            <div className="mt-3 w-40">
              <div className="flex justify-between text-[10px] text-cyan-300/70 mb-1">
                <span>靈氣凝聚</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#060c18] rounded-full overflow-hidden border border-cyan-900/40">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Xiaoxue sitting in meditation (extracted from screenshot) */}
        <div className="relative w-44 sm:w-52 h-36 flex-shrink-0 flex items-center justify-end">
          <CharacterSprite 
            id="chamber" 
            className="w-full h-full object-cover rounded-xl"
            glow={true}
          />

          {/* Subtitle hover hint */}
          <div className="absolute bottom-1 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-950/80 backdrop-blur-sm border border-cyan-500/40 text-[10px] text-cyan-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
            <span>點擊入閣靜思</span>
          </div>
        </div>
      </div>
    </div>
  );
};

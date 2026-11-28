import React from 'react';
import { Sparkles, LogIn, User, ArrowUpRight } from 'lucide-react';
import { sounds } from '../utils/audio';
import { useAuth } from '../contexts/AuthContext';
import { PlayerStats } from '../types/cultivation';
import { calculateRealm } from '../utils/cultivationLevels';

interface HeroChamberCardProps {
  stats: PlayerStats;
  onEnterChamber: () => void;
  onOpenProfile: () => void;
}

export const HeroChamberCard: React.FC<HeroChamberCardProps> = ({
  stats,
  onEnterChamber,
  onOpenProfile,
}) => {
  const { user, playerData, loginWithGoogle } = useAuth();

  // Sum up total EXP from all 12 Zodiac DLCs in database
  const dlcKeys = [
    'dlc_luck', 'dlc_spellbook', 'dlc_pond', 'dlc_forest',
    'dlc_meditate', 'dlc_fish', 'dlc_merge', 'dlc_tank',
    'dlc_drop', 'dlc_sudoku', 'dlc_ruins', 'dlc_survival'
  ];

  const totalDlcExpFromDb = user && playerData?.dlc_data
    ? dlcKeys.reduce((sum, id) => {
        const d = (playerData.dlc_data as any)[id];
        return sum + (Number(d?.totalEXP) || 0);
      }, 0)
    : (stats.currentExp ?? 0);

  const spiritualPower = user
    ? Math.max(playerData?.cultivation?.totalSpiritualPower ?? 0, totalDlcExpFromDb)
    : totalDlcExpFromDb;

  // Directly calculate realm and stage from the actual database spiritual power
  const activeRealm = calculateRealm(spiritualPower);
  const currentTitle = activeRealm.fullTitle;
  const progressPercent = activeRealm.stageProgressPercent;
  const powerNeeded = activeRealm.powerNeededForNext;
  const isMaxLevel = activeRealm.isMaxLevel;
  const userName = user ? (playerData?.profile?.displayName || user.displayName || '修仙道友') : '凡塵散修';

  return (
    <div
      className="group relative w-full overflow-hidden rounded-2xl border border-cyan-500/50 hover:border-amber-400/95 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.85)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] p-4 sm:p-5 flex items-center justify-between"
      style={{
        backgroundImage: `url('/assets/images/home_btn/hero_chamber.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark celestial gradient overlay on the left to make text pop while keeping artwork visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#060a12]/95 via-[#070b14]/75 to-[#070b14]/30 pointer-events-none" />

      {/* ============================================================== */}
      {/* LEFT SECTION: USER LOGIN STATE & CULTIVATION PROGRESS          */}
      {/* Clicks directly to User Status & Cultivation Overview          */}
      {/* ============================================================== */}
      <div
        onClick={() => {
          sounds.playChime(440, 0.4);
          onOpenProfile();
        }}
        className="flex-1 min-w-0 pr-2 sm:pr-3 flex flex-col justify-between py-1 cursor-pointer group/user select-none z-10"
        title="點擊查看修為玉牒與帳號狀態"
      >
        <div>
          {/* User Name as Main Title (Truncated single-line, prevents line wrap) */}
          <div className="w-full overflow-hidden">
            <h2 className="text-lg sm:text-xl font-bold tracking-wide text-white font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover/user:text-cyan-200 transition-colors flex items-center gap-1 max-w-full">
              <span
                className="truncate block whitespace-nowrap overflow-hidden max-w-[170px] sm:max-w-[210px]"
                title={userName}
              >
                {userName}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover/user:opacity-100 transition-opacity flex-shrink-0" />
            </h2>
          </div>

          {/* When not logged in, provide quick Google login button */}
          {!user && (
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playChime(523.25, 0.3);
                  loginWithGoogle().catch(() => {});
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/60 text-[11px] text-amber-200 hover:bg-amber-900 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
              >
                <LogIn className="w-3 h-3 text-amber-400" />
                <span>Google 登入同步</span>
              </button>
            </div>
          )}
        </div>

        {/* Cultivation Status Badge & Progress (Directly visible when logged in) */}
        {user ? (
          <div className="mt-2.5 sm:mt-3">
            {/* Current Realm Pill Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#09111e]/90 border border-teal-500/30 text-xs text-teal-200 shadow-inner group-hover/user:border-cyan-400/50 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399] flex-shrink-0" />
              <span className="font-medium tracking-wide whitespace-nowrap">
                當前修為：{currentTitle}
              </span>
            </div>

            {/* Experience / Spiritual power progress bar */}
            <div className="mt-2 w-38 sm:w-44">
              <div className="flex justify-between text-[10px] text-cyan-300/80 mb-1 whitespace-nowrap">
                <span>總靈力：{spiritualPower.toLocaleString()} 點</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#060c18] rounded-full overflow-hidden border border-cyan-900/40">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-300 mt-0.5 text-right whitespace-nowrap">
                {isMaxLevel ? '已達渡劫圓滿' : `距下一階需 +${powerNeeded} 點`}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2.5 sm:mt-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-700/60 text-[11px] text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>修為未凝 · 登入後啟動</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">
              登入 Google 建立專屬修仙玉牒並開啟修為境界
            </p>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* RIGHT SECTION: ENTER CHAMBER BUTTON                             */}
      {/* ============================================================== */}
      <div
        onClick={() => {
          sounds.playChime(392, 0.6);
          onEnterChamber();
        }}
        className="relative z-10 flex flex-col items-center justify-center cursor-pointer group/chamber pl-2 flex-shrink-0 select-none"
        title="點擊進入小雪起居室（入閣吐納與對話）"
      >
        <div className="px-3 py-2 rounded-xl bg-cyan-950/80 border border-cyan-400/60 group-hover/chamber:border-amber-400 group-hover/chamber:bg-amber-950/80 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-amber-300 font-serif whitespace-nowrap">小雪起居室</span>
            <span className="text-[9px] text-cyan-200 whitespace-nowrap">入閣吐納</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 border border-cyan-200/90 flex items-center justify-center text-white text-xs font-black shadow-[0_0_12px_rgba(6,182,212,0.9)] group-hover/chamber:scale-110 group-hover/chamber:bg-gradient-to-br group-hover/chamber:from-amber-400 group-hover/chamber:to-amber-600 transition-all">
            ›
          </div>
        </div>
      </div>
    </div>
  );
};

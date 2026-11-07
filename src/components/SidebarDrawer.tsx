import React from 'react';
import { X, User, Package, Github, Volume2, VolumeX, RotateCcw, Sparkles, BookOpen, Heart, Compass, Music } from 'lucide-react';
import { PlayerStats, RealmInfo } from '../types/cultivation';
import { REALMS } from '../data/cultivationData';
import { sounds } from '../utils/audio';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onOpenStatus: () => void;
  onOpenChamber: () => void;
  onOpenWorldMap?: () => void;
  onOpenGitHubSync: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onResetStats: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  stats,
  onOpenStatus,
  onOpenChamber,
  onOpenWorldMap,
  onOpenGitHubSync,
  audioEnabled,
  onToggleAudio,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const currentRealm: RealmInfo = REALMS[stats.currentRealmIndex] || REALMS[0];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] h-full bg-gradient-to-b from-[#0f1728] via-[#0b121f] to-[#070b13] border-r border-cyan-700/40 p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40">
            <div className="flex items-center gap-2">
              <span className="text-xl">⛩️</span>
              <div>
                <h3 className="text-base font-bold text-white font-serif tracking-wider">
                  修仙洞府
                </h3>
                <p className="text-[11px] text-cyan-400">xiaoxue-ai-world</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Player Daoist Badge */}
          <div className="my-5 p-3.5 rounded-2xl bg-[#131d31] border border-cyan-700/50 flex items-center justify-between shadow-inner">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-white font-serif">{stats.daoName}</div>
              <div className="text-xs text-cyan-300 font-medium">當前境界：{currentRealm.stage}</div>
              <div className="text-[11px] text-slate-400">靈石：{stats.spiritStones} 💎</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-400/60 flex items-center justify-center text-cyan-200 text-sm font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              修
            </div>
          </div>

          {/* Navigation links */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onClose();
                onOpenChamber();
              }}
              className="w-full p-3 rounded-xl bg-[#0e1627] hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-600/50 text-slate-200 text-xs font-semibold flex items-center gap-3 transition-all"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>小雪起居室 · 吐納問道</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenStatus();
              }}
              className="w-full p-3 rounded-xl bg-[#0e1627] hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-600/50 text-slate-200 text-xs font-semibold flex items-center gap-3 transition-all"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>修為狀態面板 · 儲物袋</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenWorldMap) onOpenWorldMap();
              }}
              className="w-full p-3 rounded-xl bg-[#0e1627] hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-600/50 text-slate-200 text-xs font-semibold flex items-center gap-3 transition-all"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>太虛神州 · 世界地圖</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenGitHubSync();
              }}
              className="w-full p-3 rounded-xl bg-[#0e1627] hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-600/50 text-slate-200 text-xs font-semibold flex items-center gap-3 transition-all"
            >
              <Github className="w-4 h-4 text-cyan-400" />
              <span>GitHub 原專案接管說明</span>
            </button>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="space-y-3 pt-4 border-t border-cyan-950">
          <button
            onClick={onToggleAudio}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs flex items-center justify-between transition-all duration-200 active:scale-98 ${
              audioEnabled
                ? 'bg-gradient-to-r from-cyan-950/90 to-teal-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-750 text-slate-300'
            }`}
            title={audioEnabled ? '點擊暫停小雪主題曲' : '點擊播放小雪主題曲'}
          >
            <span className="flex items-center gap-2">
              <Music className={`w-4 h-4 ${audioEnabled ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="font-medium text-slate-100">小雪修仙主題曲</span>
            </span>
            <span className={`text-[10px] font-bold ${audioEnabled ? 'text-cyan-300' : 'text-slate-400'}`}>
              {audioEnabled ? '播放中 🎵' : '播放主題曲 ▶'}
            </span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('確定要重置所有修為進度與儲物袋記錄嗎？')) {
                onResetStats();
                onClose();
              }
            }}
            className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-300 text-[11px] flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>轉世重修 (重置存檔)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

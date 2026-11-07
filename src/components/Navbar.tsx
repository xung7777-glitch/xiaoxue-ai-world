import { Volume2, VolumeX, Sparkles, Music } from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenProfile: () => void;
  onOpenGitHubSync: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  onOpenProfile,
  onOpenGitHubSync,
  audioEnabled,
  onToggleAudio,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0a0f1c]/80 border-b border-cyan-900/30 px-4 py-3 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left Hamburger Button matching image */}
        <button
          onClick={() => {
            sounds.playChime(440, 0.4);
            onOpenSidebar();
          }}
          aria-label="打開導航選單"
          className="w-10 h-10 rounded-xl bg-[#141d2e] border border-cyan-950/80 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 text-cyan-200/80 hover:text-cyan-100 shadow-sm shadow-cyan-950/40"
        >
          <span className="w-5 h-0.5 bg-current rounded-full" />
          <span className="w-5 h-0.5 bg-current rounded-full" />
          <span className="w-5 h-0.5 bg-current rounded-full" />
        </button>

        {/* Center Title: 小雪的修仙世界 */}
        <div className="flex items-center gap-2 select-none">
          <h1 className="text-xl font-bold tracking-widest flex items-center font-serif text-slate-100 drop-shadow-[0_2px_12px_rgba(34,211,238,0.25)]">
            <span className="text-slate-100">小雪的</span>
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent ml-1 font-extrabold animate-pulse">
              修仙世界
            </span>
          </h1>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        {/* Right side: Audio Quick Toggle & Google / Avatar Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? '點擊暫停小雪主題曲' : '點擊播放小雪主題曲'}
            className={`px-3 h-9 rounded-xl border flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
              audioEnabled
                ? 'bg-gradient-to-r from-cyan-950 to-teal-950 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                : 'bg-[#141d2e]/90 border-cyan-900/50 text-slate-400 hover:text-slate-200 hover:border-cyan-600'
            }`}
          >
            {audioEnabled ? (
              <>
                <span className="flex items-end gap-0.5 h-3.5 pb-0.5">
                  <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                  <span className="w-1 h-2 bg-teal-300 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
                  <span className="w-1 h-3.5 bg-cyan-200 rounded-full animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.3s' }} />
                </span>
                <span className="text-[11px] font-bold tracking-tight text-cyan-200">播放中 🎵</span>
              </>
            ) : (
              <>
                <Music className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium text-slate-300">播放主題曲</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              sounds.playChime(523.25, 0.4);
              onOpenProfile();
            }}
            title="修仙洞府玉牌"
            className="w-10 h-10 rounded-full bg-white p-0.5 shadow-[0_0_12px_rgba(59,130,246,0.35)] hover:shadow-[0_0_16px_rgba(34,211,238,0.6)] transition-all active:scale-95 flex items-center justify-center relative overflow-hidden"
          >
            {/* Authentic Google Multi-Color G Icon as in screenshot */}
            <svg viewBox="0 0 48 48" className="w-7 h-7">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.79l7.98-6.2z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0a0f1c]" />
          </button>
        </div>
      </div>
    </header>
  );
};

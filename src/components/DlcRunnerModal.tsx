import React, { useEffect, useRef } from 'react';
import { X, RotateCcw, ExternalLink, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DlcRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  targetUrl: string;
  onDlcReward: (exp: number, stones: number, msg?: string) => void;
}

export const DlcRunnerModal: React.FC<DlcRunnerModalProps> = ({
  isOpen,
  onClose,
  title,
  targetUrl,
  onDlcReward,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Listen to standard postMessage protocol from independent DLCs
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'XIAOXUE_DLC_EVENT') {
        const { action, payload } = event.data;

        if (action === 'REWARD' && payload) {
          sounds.playBreakthrough();
          const exp = Number(payload.exp) || 0;
          const stones = Number(payload.spiritStones) || 0;
          onDlcReward(exp, stones, payload.message);
        } else if (action === 'CLOSE') {
          sounds.playChime(392, 0.2);
          onClose();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, onClose, onDlcReward]);

  if (!isOpen) return null;

  const handleReload = () => {
    sounds.playChime(440, 0.2);
    if (iframeRef.current) {
      iframeRef.current.src = targetUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      {/* 9:16 mobile simulator framed container */}
      <div className="relative w-full max-w-md h-[95vh] bg-[#070d18] border-2 border-cyan-500/50 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d1728] border-b border-cyan-900/60 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-cyan-200 font-serif tracking-wide truncate max-w-[200px]">
              {title}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              DLC 沙盒
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReload}
              title="重新載入 DLC"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              title="返回母世界"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Iframe Sandbox running the independent DLC index.html */}
        <div className="flex-1 w-full h-full relative bg-[#040810]">
          <iframe
            ref={iframeRef}
            src={targetUrl}
            title={title}
            className="w-full h-full border-none select-none"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
};

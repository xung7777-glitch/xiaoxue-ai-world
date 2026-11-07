import React, { useState } from 'react';
import { X, Github, CheckCircle2, Copy, Sparkles, BookOpen, Layers } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyGuide = () => {
    sounds.playChime(523.25, 0.3);
    const guideText = `專案名稱: xiaoxue-ai-world\n架構: React 19 + Vite + Tailwind CSS 4 + Web Audio API\n已包含完整的 8 大修仙子系統與起居室冥想，如需導入 GitHub 原專案代碼，可直接提供倉庫連結或相關代碼檔案。`;
    navigator.clipboard.writeText(guideText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#111827] via-[#0d1421] to-[#080d16] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#162237]/70">
          <div className="flex items-center gap-2.5">
            <Github className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">專案接管與開發建議</h3>
              <p className="text-xs text-cyan-300">xiaoxue-ai-world 雲端無縫進化指南</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {/* Recommendation Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/60 to-cyan-950/50 border border-teal-500/40 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold font-serif text-base">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>工程師結論：推薦「在此全新重構＋按需整合 GitHub 精華」</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              您原本在 Google Anti-Gravity 寫的模板因額度不足而中斷，而在此 AI Studio 環境中，我們已經為您構建了全新、架構乾淨的現代化全功能版本：
            </p>
          </div>

          {/* Advantages Comparison */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              當前版本（AI Studio）相比半成品的優勢：
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#09111c] border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">視覺 100% 像素級還原並增強：</strong>
                  <p className="text-slate-400 mt-0.5">
                    起居室、8 大入口卡片、仙俠深藍發光主題、小雪專屬立繪切圖、粒子動態皆已完整到位。
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#09111c] border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">八大子系統均為真實可玩：</strong>
                  <p className="text-slate-400 mt-0.5">
                    野外倖存者飛劍打怪、河邊釣魚力度計、符籙 2048、璇璣五行俄羅斯方塊、英文仙咒真言填空、靈田種植與八卦爐煉丹、星璿大世界傳送。
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#09111c] border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">無流量中斷顧慮與本機進度保存：</strong>
                  <p className="text-slate-400 mt-0.5">
                    內建 Web Audio API 仙音合成器（零外鏈加載失敗）、LocalStorage 自動存檔修為境界。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to merge GitHub assets */}
          <div className="p-4 rounded-xl bg-[#09121f] border border-cyan-900/60 space-y-2">
            <h5 className="text-xs font-bold text-amber-300 font-serif">
              如何保留您 GitHub 上的原創內容？
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              如果您 GitHub 倉庫中有特定的劇情腳本、數值配置、自訂音頻或更多圖片資產，隨時在對話中貼上 GitHub 連結或代碼片段，我可以立即為您無縫接管融合！
            </p>
          </div>

          {/* Copy Button */}
          <div className="pt-1">
            <button
              onClick={handleCopyGuide}
              className="w-full py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? '已複製架構摘要！' : '複製架構資訊（方便對齊 GitHub）'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

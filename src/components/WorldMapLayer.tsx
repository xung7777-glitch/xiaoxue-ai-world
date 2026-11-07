import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Sparkles, MapPin, Compass, Info, Home } from 'lucide-react';
import { sounds } from '../utils/audio';

interface WorldMapLayerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Landmark {
  id: string;
  name: string;
  category: string;
  top: string;
  left: string;
  description: string;
  color: string;
}

const LANDMARKS: Landmark[] = [
  {
    id: 'snow_mountain',
    name: '太古玄冰雪嶽',
    category: '極北秘境',
    top: '12%',
    left: '52%',
    description: '終年被九幽玄冰覆蓋的巍峨雪山，傳說藏有冰靈魄與上古雪狐。',
    color: 'from-blue-400 to-cyan-200',
  },
  {
    id: 'sky_palace',
    name: '蓬萊浮空仙閣',
    category: '洞天福地',
    top: '10%',
    left: '18%',
    description: '懸浮於九天之上的凌虛宮闕，瀑布如銀河垂落，乃遠古仙宗舊址。',
    color: 'from-amber-300 to-yellow-100',
  },
  {
    id: 'cherry_temple',
    name: '青丘落櫻神殿',
    category: '青丘靈島',
    top: '32%',
    left: '82%',
    description: '萬株靈櫻常年盛開，仙鶴棲息其間，是幻術與符咒傳承聖地。',
    color: 'from-pink-400 to-rose-200',
  },
  {
    id: 'crystal_peak',
    name: '天青靈晶群峰',
    category: '靈脈樞紐',
    top: '32%',
    left: '20%',
    description: '蘊含純淨碧玉靈晶的奇峰怪石，靈泉飛濺，滋養周遭草木。',
    color: 'from-teal-400 to-emerald-200',
  },
  {
    id: 'desert_ruins',
    name: '大漠古國遺蹟',
    category: '西荒禁域',
    top: '59%',
    left: '25%',
    description: '埋藏於黃沙之下的遠古宮門與石雕，沉睡著數百年前的傀儡機關術。',
    color: 'from-yellow-500 to-amber-200',
  },
  {
    id: 'bamboo_grove',
    name: '千竿翠竹隱廬',
    category: '幽靜竹海',
    top: '60%',
    left: '84%',
    description: '靈竹修長入雲，泉水叮咚，適合修行靜氣斂息的無上寶地。',
    color: 'from-emerald-400 to-lime-200',
  },
  {
    id: 'volcano_tree',
    name: '火麟焚天聖樹',
    category: '南溟赤島',
    top: '81%',
    left: '51%',
    description: '誕生於地底熔漿熱核之上的萬年赤火神樹，枝葉燃燒著不滅神火。',
    color: 'from-red-500 to-orange-300',
  },
];

export const WorldMapLayer: React.FC<WorldMapLayerProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [teaserToast, setTeaserToast] = useState<string | null>(null);

  // Play entry chime sound when opened
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      sounds.playChime(440, 0.3);
      setTimeout(() => sounds.playChime(587.33, 0.4), 180);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  // Handle returning to main cultivation world
  const handleReturnToChamber = () => {
    sounds.playChime(659.25, 0.35);
    setTimeout(() => sounds.playChime(523.25, 0.35), 120);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 380);
  };

  const handleLandmarkClick = (landmark: Landmark) => {
    sounds.playChime(523.25, 0.2);
    setSelectedLandmark(landmark);
    setTeaserToast(`✨ 【${landmark.name}】尚未開啟，待未來擴充解鎖！`);
    setTimeout(() => setTeaserToast(null), 3000);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-400 ${
        isClosing ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Container constrained to mobile phone 9:16 layout */}
      <div
        className={`relative w-full max-w-md h-full max-h-[100vh] sm:max-h-[92vh] sm:rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.35)] border-0 sm:border sm:border-cyan-500/40 bg-[#060b14] flex flex-col transition-transform duration-400 ease-out ${
          isClosing ? 'translate-y-12 scale-95' : 'translate-y-0 scale-100'
        }`}
      >
        {/* Top Floating Glass Navigation Header */}
        <div className="absolute top-0 inset-x-0 z-30 px-3.5 py-3 bg-gradient-to-b from-[#09111c]/95 via-[#09111c]/80 to-transparent flex items-center justify-between pointer-events-auto backdrop-blur-sm">
          {/* Back button */}
          <button
            onClick={handleReturnToChamber}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 text-cyan-200 text-xs font-bold shadow-lg transition-transform active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>返回洞府</span>
          </button>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-100 font-serif tracking-wider flex items-center justify-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '15s' }} />
              <span>太虛神州 · 世界地圖</span>
            </h2>
            <p className="text-[10px] text-cyan-300 font-sans">點選中央小雪頭像即可返回修仙世界</p>
          </div>

          {/* Quick exit close */}
          <button
            onClick={handleReturnToChamber}
            className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center active:scale-90 transition-transform"
            title="關閉地圖"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable / Scaled Map Canvas */}
        <div className="relative flex-1 w-full h-full overflow-hidden select-none bg-[#070e1b]">
          {/* The High-Res Master World Map Image */}
          <img
            src="/assets/images/world_map_master.png"
            alt="小雪修仙大世界地圖"
            className="w-full h-full object-cover object-center pointer-events-none"
            onError={(e) => {
              // Fallback to original uploaded asset path if needed
              (e.currentTarget as HTMLImageElement).src = '/assets/aistudio/image_75ad3f9e.png';
            }}
          />

          {/* Subtle mist and spiritual particle ambiance */}
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-transparent to-blue-950/20 pointer-events-none" />

          {/* ============================================================== */}
          {/* THE CORE: XIAOXUE'S CAVE RESIDENCE (小雪洞府 · 中心洞穴)           */}
          {/* User requirement: "中间有一个小雪的样子，可以让它一个小图标，点选小雪，又降到最后面去" */}
          {/* ============================================================== */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group select-none"
            style={{ top: '45.8%', left: '50%' }}
            onClick={handleReturnToChamber}
          >
            {/* Outer expanding pulsing ripple ring */}
            <div className="absolute -inset-3.5 rounded-full bg-cyan-400/30 animate-ping pointer-events-none duration-1000" />
            <div className="absolute -inset-2 rounded-full border-2 border-cyan-300/80 animate-pulse pointer-events-none" />

            {/* Rotating celestial runic aura */}
            <div
              className="absolute -inset-3 rounded-full border border-dashed border-teal-300/50 animate-spin pointer-events-none"
              style={{ animationDuration: '8s' }}
            />

            {/* Xiaoxue Character Avatar Circle */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-cyan-300 bg-cyan-950/90 shadow-[0_0_25px_rgba(6,182,212,0.85)] group-hover:scale-110 group-active:scale-95 transition-all duration-300 flex items-center justify-center">
              <img
                src="/assets/character/xiaoxue_avatar.jpg"
                alt="小雪"
                className="w-full h-full object-cover object-top scale-110 group-hover:scale-120 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/assets/character/xiaoxue_reference.png';
                }}
              />
              {/* Internal glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Banner Label underneath Xiaoxue */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 pointer-events-none">
              <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center gap-1 animate-bounce duration-700">
                <Home className="w-3 h-3 text-cyan-300" />
                <span className="text-[11px] font-bold text-cyan-100 tracking-wider font-serif">
                  小雪洞府 · 點擊歸返
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* FUTURE EXTENSION TEASER PINS (留個懸念，未來擴充點選)            */}
          {/* ============================================================== */}
          {LANDMARKS.map((landmark) => (
            <div
              key={landmark.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ top: landmark.top, left: landmark.left }}
              onClick={() => handleLandmarkClick(landmark)}
            >
              {/* Subtle ambient pulse */}
              <div className="absolute -inset-1.5 rounded-full bg-white/20 animate-pulse pointer-events-none" />

              {/* Pin indicator */}
              <div className="relative px-2 py-1 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-600/80 hover:border-cyan-400 text-slate-200 text-[10px] font-bold flex items-center gap-1 shadow-lg transition-transform group-hover:scale-110 group-active:scale-95">
                <MapPin className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300" />
                <span className="font-serif">{landmark.name}</span>
                <span className="text-[9px] text-amber-400/90 ml-0.5">鎖</span>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Teaser Toast Notification */}
        {teaserToast && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 bg-slate-950/90 border border-cyan-400 text-cyan-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300 max-w-[85%] text-center">
            <span>{teaserToast}</span>
          </div>
        )}

        {/* Landmark Detail Drawer (When clicked) */}
        {selectedLandmark && (
          <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-[#09111c] via-[#09111c]/95 to-slate-950/90 border-t border-cyan-500/40 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                    {selectedLandmark.category}
                  </span>
                  <h3 className="text-sm font-bold text-white font-serif">{selectedLandmark.name}</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedLandmark.description}</p>
                <div className="mt-2 text-[11px] text-amber-300 font-medium flex items-center gap-1">
                  <span>⏳ 秘境探索功能規劃中 · 未來將作為獨立 DLC 模組接入</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLandmark(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Floating Hint Bar */}
        <div className="absolute bottom-2 inset-x-0 z-20 pointer-events-none flex justify-center">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 flex items-center gap-1.5 shadow">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>點擊中心小雪洞府即可無縫歸回修仙主世界</span>
          </div>
        </div>
      </div>
    </div>
  );
};

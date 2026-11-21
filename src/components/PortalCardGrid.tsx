import React from 'react';
import { CharacterSprite, SpriteId } from './CharacterSprite';
import { sounds } from '../utils/audio';

export interface CardDef {
  id: string;
  spriteId: SpriteId;
  icon: string;
  numberStr: string;
  title: string;
  subtitle: string;
  badge?: string;
  targetUrl: string;
  bgImage?: string;
  frequencyNote?: number;
}

export const DEFAULT_PORTAL_CARDS: CardDef[] = [
  {
    id: 'dlc_luck',
    spriteId: 'status',
    icon: '✨',
    numberStr: '01',
    title: '子鼠推天',
    subtitle: '開運導航 · 運勢指引',
    badge: '運勢',
    targetUrl: '/dlc-portal.html?dlc=dlc_luck',
    bgImage: '/assets/images/dlc/dlc_luck.png',
    frequencyNote: 329.63,
  },
  {
    id: 'dlc_spellbook',
    spriteId: 'english',
    icon: '📖',
    numberStr: '02',
    title: '丑牛耕卷',
    subtitle: '英咒寶典 · 輕鬆學英語',
    badge: '真言',
    targetUrl: '/dlc-portal.html?dlc=dlc_spellbook',
    bgImage: '/assets/images/dlc/dlc_spellbook.png',
    frequencyNote: 392.0,
  },
  {
    id: 'dlc_pond',
    spriteId: 'fish',
    icon: '🪷',
    numberStr: '03',
    title: '寅虎藏禪',
    subtitle: '靜心靈泉 · 放鬆療癒',
    badge: '禪意',
    targetUrl: '/dlc-portal.html?dlc=dlc_pond',
    bgImage: '/assets/images/dlc/dlc_pond.png',
    frequencyNote: 440.0,
  },
  {
    id: 'dlc_forest',
    spriteId: 'alchemy',
    icon: '🌿',
    numberStr: '04',
    title: '卯兔采芝',
    subtitle: '神農藥谷 · 田園慢活',
    badge: '田園',
    targetUrl: '/dlc-portal.html?dlc=dlc_forest',
    bgImage: '/assets/images/dlc/dlc_forest.png',
    frequencyNote: 493.88,
  },
  {
    id: 'dlc_meditate',
    spriteId: 'chamber',
    icon: '🧘',
    numberStr: '05',
    title: '辰龍吐納',
    subtitle: '先天一炁 · 修煉心境',
    badge: '吐納',
    targetUrl: '/dlc-portal.html?dlc=dlc_meditate',
    bgImage: '/assets/images/dlc/dlc_meditate.png',
    frequencyNote: 523.25,
  },
  {
    id: 'dlc_fish',
    spriteId: 'fish',
    icon: '🌊',
    numberStr: '06',
    title: '巳蛇戲淵',
    subtitle: '逆水擒龍 · 釣魚博弈',
    badge: '博弈',
    targetUrl: '/dlc-portal.html?dlc=dlc_fish',
    bgImage: '/assets/images/dlc/dlc_fish.png',
    frequencyNote: 587.33,
  },
  {
    id: 'dlc_merge',
    spriteId: 'talisman',
    icon: '⚛️',
    numberStr: '07',
    title: '午馬躍遷',
    subtitle: '大道飛升 · 參悟大道',
    badge: '飛升',
    targetUrl: '/dlc-portal.html?dlc=dlc_merge',
    bgImage: '/assets/images/dlc/dlc_merge.png',
    frequencyNote: 659.25,
  },
  {
    id: 'dlc_tank',
    spriteId: 'mechanism',
    icon: '🛡️',
    numberStr: '08',
    title: '未羊御陣',
    subtitle: '飛劍御敵 · 守護基地',
    badge: '御敵',
    targetUrl: '/dlc-portal.html?dlc=dlc_tank',
    bgImage: '/assets/images/dlc/dlc_tank.png',
    frequencyNote: 698.46,
  },
  {
    id: 'dlc_drop',
    spriteId: 'talisman',
    icon: '🧱',
    numberStr: '09',
    title: '申猴破陣',
    subtitle: '破陣方塊 · 暢快解謎',
    badge: '消除',
    targetUrl: '/dlc-portal.html?dlc=dlc_drop',
    bgImage: '/assets/images/dlc/dlc_drop.png',
    frequencyNote: 783.99,
  },
  {
    id: 'dlc_sudoku',
    spriteId: 'mechanism',
    icon: '🔢',
    numberStr: '10',
    title: '酉雞推演',
    subtitle: '九宮雷劫 · 破陣智慧',
    badge: '數獨',
    targetUrl: '/dlc-portal.html?dlc=dlc_sudoku',
    bgImage: '/assets/images/dlc/dlc_sudoku.png',
    frequencyNote: 880.0,
  },
  {
    id: 'dlc_ruins',
    spriteId: 'beast',
    icon: '🗺️',
    numberStr: '11',
    title: '戌狗尋秘',
    subtitle: '幻變遺蹟 · 尋寶探險',
    badge: '迷宮',
    targetUrl: '/dlc-portal.html?dlc=dlc_ruins',
    bgImage: '/assets/images/dlc/dlc_ruins.png',
    frequencyNote: 987.77,
  },
  {
    id: 'dlc_survival',
    spriteId: 'beast',
    icon: '⚔️',
    numberStr: '12',
    title: '亥豬鎮疆',
    subtitle: '邊疆修仙 · 生存挑戰',
    badge: '生存',
    targetUrl: '/dlc-portal.html?dlc=dlc_survival',
    bgImage: '/assets/images/dlc/dlc_survival.png',
    frequencyNote: 1046.5,
  },
  {
    id: 'world_map_portal',
    spriteId: 'map',
    icon: '🧭',
    numberStr: '13',
    title: '世界地圖換場傳送門',
    subtitle: '探索蠻荒大世界',
    badge: '跨域',
    targetUrl: '/dlcs/dlc_world_map/index.html',
    frequencyNote: 783.99,
  },
];

interface PortalCardGridProps {
  cards?: CardDef[];
  onSelectCard: (card: CardDef) => void;
}

export const PortalCardGrid: React.FC<PortalCardGridProps> = ({
  cards = DEFAULT_PORTAL_CARDS,
  onSelectCard,
}) => {
  // Always guarantee world_map_portal is the final button at the bottom!
  const sortedCards = [...cards].sort((a, b) => {
    if (a.id === 'world_map_portal') return 1;
    if (b.id === 'world_map_portal') return -1;
    return 0;
  });

  return (
    <div className="grid grid-cols-2 gap-2.5 w-full">
      {sortedCards.map((card, idx) => {
        const isLastAndOdd = idx === sortedCards.length - 1 && sortedCards.length % 2 !== 0;

        return (
          <div
            key={card.id}
            onClick={() => {
              sounds.playChime(card.frequencyNote || 440, 0.4);
              onSelectCard(card);
            }}
            className={`group relative cursor-pointer overflow-hidden rounded-xl border border-cyan-500/50 hover:border-amber-400/95 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.85)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-[0.98] flex items-center justify-between p-2.5 sm:p-3 h-[82px] sm:h-[88px] ${
              isLastAndOdd ? 'col-span-2 bg-gradient-to-r from-[#111a2a] via-[#0d1624] to-[#121f33] border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.3)]' : ''
            }`}
            style={{
              backgroundImage: card.bgImage ? `url('${card.bgImage}')` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          >
            {/* Rich dark celestial gradient overlay to make text pop while keeping artwork visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#060a12]/95 via-[#070b14]/80 to-[#070b14]/50 group-hover:from-[#060a12]/90 group-hover:via-[#070b14]/70 transition-all duration-300 pointer-events-none" />

            {/* Left: Number badge + Title + Subtitle */}
            <div className="relative z-10 flex items-center gap-2.5 flex-1 pr-1.5 select-none overflow-hidden">
              {card.numberStr && (
                <span className="text-[11px] font-black w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.7)] font-mono">
                  {card.numberStr}
                </span>
              )}
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide font-serif group-hover:text-amber-200 transition-colors leading-tight truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {card.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-200 font-medium tracking-tight mt-0.5 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {card.subtitle}
                </p>
              </div>
            </div>

            {/* Right: Glowing Arrow Button */}
            <div className="relative z-10 flex items-center flex-shrink-0 pl-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 border border-cyan-200/90 flex items-center justify-center text-white text-xs font-black shadow-[0_0_12px_rgba(6,182,212,0.9)] group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-amber-600 group-hover:border-amber-200 transition-all">
                ›
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

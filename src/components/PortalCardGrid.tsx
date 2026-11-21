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
    frequencyNote: 329.63,
  },
  {
    id: 'dlc_spellbook',
    spriteId: 'english',
    icon: '📖',
    numberStr: '02',
    title: '丑牛耕卷',
    subtitle: '英兇寶典 · 輕鬆學英語',
    badge: '真言',
    targetUrl: '/dlc-portal.html?dlc=dlc_spellbook',
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
    <div className="grid grid-cols-2 gap-3.5 w-full">
      {sortedCards.map((card, idx) => {
        const isLastAndOdd = idx === sortedCards.length - 1 && sortedCards.length % 2 !== 0;

        return (
          <div
            key={card.id}
            onClick={() => {
              sounds.playChime(card.frequencyNote || 440, 0.4);
              onSelectCard(card);
            }}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#08101d] to-[#0a1424] border border-cyan-500/40 hover:border-amber-400/90 p-3 sm:p-3.5 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.8)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98] flex items-center justify-between min-h-[108px] ${
              isLastAndOdd ? 'col-span-2 bg-gradient-to-r from-[#111a2a] via-[#0d1624] to-[#121f33] border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]' : ''
            }`}
          >
            {/* Ambient gold/cyan celestial glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-amber-500/10 group-hover:from-amber-500/15 group-hover:to-cyan-500/15 transition-all duration-300 pointer-events-none" />

            {/* Left content info */}
            <div className="relative z-10 flex flex-col justify-between h-full flex-1 pr-2 select-none">
              {/* Number Badge & Badge */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {card.numberStr && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] font-mono">
                      {card.numberStr}
                    </span>
                  )}
                  {card.badge && (
                    <span className="text-[9px] px-2 py-0.2 rounded-full bg-cyan-950/90 border border-cyan-600/70 text-cyan-200">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-amber-300 tracking-wide font-serif group-hover:text-amber-200 transition-colors leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {card.title}
                </h3>
              </div>

              {/* Subtitle */}
              <p className="text-[10px] sm:text-[11px] text-slate-300/90 group-hover:text-slate-200 font-medium tracking-tight mt-1 line-clamp-1">
                {card.subtitle}
              </p>
            </div>

            {/* Right Character / Creature artwork & Glowing Arrow Button */}
            <div className="relative flex items-center gap-2.5 flex-shrink-0">
              <div className="relative w-18 sm:w-22 h-18 sm:h-22 flex-shrink-0 overflow-hidden rounded-xl border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <CharacterSprite
                  id={card.spriteId}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                  glow={true}
                />
              </div>

              {/* Glowing Arrow Button matching reference image */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 border border-cyan-200/80 flex items-center justify-center text-white text-xs font-black shadow-[0_0_12px_rgba(6,182,212,0.8)] group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-amber-600 group-hover:border-amber-200 transition-all">
                ›
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

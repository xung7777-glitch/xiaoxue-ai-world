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
    id: 'luck_nav',
    spriteId: 'status',
    icon: '✨',
    numberStr: '01',
    title: '開運導航',
    subtitle: '趣吉避凶 · 運勢指引',
    badge: '運勢',
    targetUrl: '/dlc/dlc_luck.html',
    frequencyNote: 329.63,
  },
  {
    id: 'english_spellbook',
    spriteId: 'english',
    icon: '📖',
    numberStr: '02',
    title: '英咒寶典',
    subtitle: '邊看影片 · 輕鬆學英語',
    badge: '真言',
    targetUrl: '/dlc/dlc_spellbook.html',
    frequencyNote: 392.0,
  },
  {
    id: 'spirit_pond',
    spriteId: 'fish',
    icon: '🪷',
    numberStr: '03',
    title: '靜心靈泉',
    subtitle: '觀魚賞蓮 · 放鬆療癒',
    badge: '禪意',
    targetUrl: '/dlc/dlc_pond.html',
    frequencyNote: 440.0,
  },
  {
    id: 'herb_forest',
    spriteId: 'alchemy',
    icon: '🌿',
    numberStr: '04',
    title: '神農藥谷',
    subtitle: '採藥種植 · 田園慢活',
    badge: '田園',
    targetUrl: '/dlc/dlc_forest.html',
    frequencyNote: 493.88,
  },
  {
    id: 'meditate_qi',
    spriteId: 'chamber',
    icon: '🧘',
    numberStr: '05',
    title: '先天一炁',
    subtitle: '打坐冥想 · 修煉心境',
    badge: '吐納',
    targetUrl: '/dlc/dlc_meditate.html',
    frequencyNote: 523.25,
  },
  {
    id: 'fish_dragon',
    spriteId: 'fish',
    icon: '🌊',
    numberStr: '06',
    title: '逆水擒龍',
    subtitle: '極限拔河 · 釣魚博弈',
    badge: '博弈',
    targetUrl: '/dlc/dlc_fish.html',
    frequencyNote: 587.33,
  },
  {
    id: 'merge_ascend',
    spriteId: 'talisman',
    icon: '⚛️',
    numberStr: '07',
    title: '大道飛升',
    subtitle: '合成突破 · 參悟大道',
    badge: '飛升',
    targetUrl: '/dlc/dlc_merge.html',
    frequencyNote: 659.25,
  },
  {
    id: 'tank_defend',
    spriteId: 'mechanism',
    icon: '🛡️',
    numberStr: '08',
    title: '飛劍御敵',
    subtitle: '懷舊戰車 · 守護基地',
    badge: '御敵',
    targetUrl: '/dlc/dlc_tank.html',
    frequencyNote: 698.46,
  },
  {
    id: 'drop_puzzle',
    spriteId: 'talisman',
    icon: '🧱',
    numberStr: '09',
    title: '破陣方塊',
    subtitle: '連消破陣 · 暢快解謎',
    badge: '消除',
    targetUrl: '/dlc/dlc_drop.html',
    frequencyNote: 783.99,
  },
  {
    id: 'sudoku_tribulation',
    spriteId: 'mechanism',
    icon: '🔢',
    numberStr: '10',
    title: '九宮雷劫',
    subtitle: '數獨挑戰 · 破陣智慧',
    badge: '數獨',
    targetUrl: '/dlc/dlc_sudoku.html',
    frequencyNote: 880.0,
  },
  {
    id: 'ruins_explore',
    spriteId: 'beast',
    icon: '🗺️',
    numberStr: '11',
    title: '幻變遺蹟',
    subtitle: '隨機迷宮 · 尋寶探險',
    badge: '迷宮',
    targetUrl: '/dlc/dlc_ruins.html',
    frequencyNote: 987.77,
  },
  {
    id: 'survival_beast',
    spriteId: 'beast',
    icon: '⚔️',
    numberStr: '12',
    title: '邊疆修仙',
    subtitle: '生存挑戰 · 斬妖割草',
    badge: '生存',
    targetUrl: '/dlc/dlc_survival.html',
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
            className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-[#111927] to-[#0e1522] border border-cyan-900/40 hover:border-cyan-400/60 p-3 sm:p-3.5 transition-all duration-300 shadow-md shadow-black/40 hover:shadow-[0_4px_20px_rgba(6,182,212,0.22)] active:scale-[0.97] flex items-center justify-between min-h-[104px] ${
              isLastAndOdd ? 'col-span-2 bg-gradient-to-r from-[#111a2a] via-[#0d1624] to-[#121f33] border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : ''
            }`}
          >
            {/* Subtle inner ambient glow */}
            <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors duration-300 pointer-events-none" />

            {/* Left content info */}
            <div className="relative z-10 flex flex-col justify-between h-full flex-1 pr-1.5 select-none">
              {/* Icon & Title */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  {card.numberStr && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono">
                      {card.numberStr}
                    </span>
                  )}
                  {card.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 scale-90 origin-left">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-wide font-serif group-hover:text-cyan-200 transition-colors leading-tight">
                  {card.title}
                </h3>
              </div>

              {/* Subtitle */}
              <p className="text-[11px] sm:text-xs text-slate-400/90 group-hover:text-slate-300 font-normal tracking-tight mt-2 line-clamp-1">
                {card.subtitle}
              </p>
            </div>

            {/* Right Character artwork snippet */}
            <div className="relative w-20 sm:w-24 h-22 sm:h-24 flex-shrink-0 flex items-center justify-end overflow-hidden rounded-xl">
              <CharacterSprite
                id={card.spriteId}
                className="w-full h-full object-cover rounded-xl group-hover:scale-108 transition-transform duration-500 shadow-sm"
                glow={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

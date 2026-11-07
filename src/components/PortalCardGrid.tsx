import React from 'react';
import { CharacterSprite, SpriteId } from './CharacterSprite';
import { sounds } from '../utils/audio';

export interface CardDef {
  id: string;
  spriteId: SpriteId;
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  targetUrl: string;
  frequencyNote?: number;
}

export const DEFAULT_PORTAL_CARDS: CardDef[] = [
  {
    id: 'beast_zone',
    spriteId: 'beast',
    icon: '🔥',
    title: '野外獸區',
    subtitle: '倖存者打怪入口',
    badge: '歷練',
    targetUrl: '/dlcs/dlc_beast_hunter/index.html',
    frequencyNote: 329.63,
  },
  {
    id: 'fishing_river',
    spriteId: 'fish',
    icon: '🌊',
    title: '釣魚河邊',
    subtitle: '休閒垂釣入口',
    badge: '悠閒',
    targetUrl: '/dlcs/dlc_fishing_river/index.html',
    frequencyNote: 392.0,
  },
  {
    id: 'talisman_puzzle',
    spriteId: 'talisman',
    icon: '📜',
    title: '符咒解謎',
    subtitle: '2048 變體玩法',
    badge: '益智',
    targetUrl: '/dlcs/dlc_talisman_2048/index.html',
    frequencyNote: 440.0,
  },
  {
    id: 'gear_puzzle',
    spriteId: 'mechanism',
    icon: '⚙️',
    title: '機關解密',
    subtitle: '俄羅斯方塊變體',
    badge: '機關',
    targetUrl: '/dlcs/dlc_gear_puzzle/index.html',
    frequencyNote: 493.88,
  },
  {
    id: 'english_spells',
    spriteId: 'english',
    icon: '💬',
    title: '英文咒語習得',
    subtitle: '填空 App (DLC)',
    badge: '真言',
    targetUrl: '/dlcs/dlc_spellbook/index.html',
    frequencyNote: 523.25,
  },
  {
    id: 'herb_alchemy',
    spriteId: 'alchemy',
    icon: '🌿',
    title: '靈田 煉丹房',
    subtitle: '草藥培養與丹道',
    badge: '生生不息',
    targetUrl: '/dlcs/dlc_herb_alchemy/index.html',
    frequencyNote: 587.33,
  },
  {
    id: 'spirit_spring',
    spriteId: 'fish',
    icon: '🪷',
    title: '靈泉庭院',
    subtitle: '錦鯉靈蛙生態 (DLC)',
    badge: '生態',
    targetUrl: '/dlcs/dlc_spirit_spring/index.html',
    frequencyNote: 523.25,
  },
  {
    id: 'stats_panel',
    spriteId: 'status',
    icon: '📊',
    title: '修為 / 狀態',
    subtitle: '完整修為狀態面板',
    badge: '洞府',
    targetUrl: '/dlcs/dlc_stats_panel/index.html',
    frequencyNote: 659.25,
  },
  {
    id: 'world_map_portal',
    spriteId: 'map',
    icon: '🧭',
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
                  <span className="text-base select-none leading-none drop-shadow">
                    {card.icon}
                  </span>
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

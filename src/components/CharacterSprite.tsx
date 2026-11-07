import React from 'react';

// Newly re-drawn high definition Xiaoxue artwork based on official turnaround prototype
import chamberImg from '../assets/images/xiaoxue_chamber_1794054550675.jpg';
import beastImg from '../assets/images/xiaoxue_beast_1794054568400.jpg';
import fishImg from '../assets/images/xiaoxue_fish_1794054584829.jpg';
import talismanImg from '../assets/images/xiaoxue_talisman_1794054600123.jpg';
import mechanismImg from '../assets/images/xiaoxue_mechanism_1794054616164.jpg';
import englishImg from '../assets/images/xiaoxue_english_1794054633098.jpg';
import alchemyImg from '../assets/images/xiaoxue_alchemy_1794054650188.jpg';
import statusImg from '../assets/images/xiaoxue_status_1794054667884.jpg';
import portalImg from '../assets/images/xiaoxue_portal_1794054684349.jpg';

export type SpriteId = 
  | 'chamber'
  | 'beast'
  | 'fish'
  | 'talisman'
  | 'mechanism'
  | 'english'
  | 'alchemy'
  | 'status'
  | 'map';

interface CharacterSpriteProps {
  id: SpriteId;
  className?: string;
  glow?: boolean;
}

const NEW_IMAGES: Record<SpriteId, string> = {
  chamber: chamberImg,
  beast: beastImg,
  fish: fishImg,
  talisman: talismanImg,
  mechanism: mechanismImg,
  english: englishImg,
  alchemy: alchemyImg,
  status: statusImg,
  map: portalImg,
};

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({ id, className = '', glow = true }) => {
  const imgSrc = NEW_IMAGES[id] || NEW_IMAGES.chamber;

  return (
    <div className={`relative overflow-hidden select-none pointer-events-none rounded-xl ${className}`}>
      {/* Glow aura */}
      {glow && (
        <div 
          className="absolute inset-0 bg-radial from-cyan-400/20 via-transparent to-transparent opacity-60 mix-blend-screen pointer-events-none z-10"
        />
      )}

      {/* Re-drawn High Definition Xiaoxue Artwork */}
      <img
        src={imgSrc}
        alt={`小雪 - ${id}`}
        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
        loading="eager"
      />

      {/* Inner shadow overlay for seamless blending into card background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1627]/90 via-transparent to-transparent opacity-75 z-10" />
    </div>
  );
};

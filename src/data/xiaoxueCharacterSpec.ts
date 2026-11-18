/**
 * Master Character Design Specification for Xiaoxue (小雪)
 * Based on official reference: /public/assets/character/xiaoxue_reference.png
 */

export interface CharacterDesignSpec {
  name: string;
  chineseName: string;
  archetype: string;
  referenceImagePath: string;
  visualTraits: {
    face: string;
    hair: string;
    ornaments: string;
    clothing: string;
    footwear: string;
    colorPalette: string[];
    atmosphere: string;
  };
  masterPromptGuide: string;
}

export const XIAOXUE_MASTER_SPEC: CharacterDesignSpec = {
  name: 'Xiaoxue',
  chineseName: '小雪',
  archetype: 'Ethereal Xianxia Immortal Fairy / Disciple',
  referenceImagePath: '/assets/character/xiaoxue_reference.png',
  visualTraits: {
    face: 'Delicate porcelain skin, gentle and elegant gaze, soft pink lips, blue celestial forehead bindi/bindu marking (眉心花鈿).',
    hair: 'Long glossy black silk hair flowing past hips, braided buns at the crown with delicate loose side-tendrils.',
    ornaments: 'Ice-blue and white blossom hairpins with hanging pearl and silver tassels framing both sides and back.',
    clothing: 'Flowing pale ice-blue (天青色 / 淺冰藍) and translucent silver-white layered Xianxia robes, adorned with intricate gold and silver mountain-and-cloud embroidery, wide gossamer fairy sleeves, turquoise jade belt with hanging cords.',
    footwear: 'High-heeled fitted white leather boots with embossed golden filigree patterns.',
    colorPalette: [
      '#E0F2FE', // Ice blue gossamer
      '#F8FAFC', // Silver white silk
      '#F59E0B', // Muted gold embroidery
      '#0284C7', // Turquoise jade ornament
      '#1E293B', // Jet black hair
    ],
    atmosphere: 'Serene, celestial, tranquil, otherworldly grace, swirling spiritual Qi aura.',
  },
  masterPromptGuide: `Masterpiece Xianxia character portrait of Xiaoxue (小雪), a gentle and stunning immortal fairy. Delicate porcelain face with ethereal almond eyes, soft blush, intricate cyan flower mark on forehead. Long waist-length silky jet-black hair styled with delicate ice-blue floral hairpins, white jade blossoms, and cascading pearl tassels. Wearing layered flowing pale ice-blue and sheer silver-white celestial silk robes with exquisite gold wave embroidery and gossamer ribbons fluttering in spiritual wind. Graceful, serene, tranquil aura, cinematic ethereal lighting, 8k quality, authentic Chinese cultivation aesthetics.`,
};

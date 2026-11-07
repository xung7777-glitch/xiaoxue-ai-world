/**
 * Cultivation & Xianxia World Data Models
 */

export type RealmStage = 
  | '煉氣初期' 
  | '煉氣中期' 
  | '煉氣圓滿' 
  | '築基初期' 
  | '築基中期' 
  | '築基圓滿' 
  | '金丹初期' 
  | '金丹中期' 
  | '元嬰老祖' 
  | '化神天尊';

export interface RealmInfo {
  stage: RealmStage;
  level: number;
  maxExp: number;
  title: string;
  bonusMultiplier: number;
  color: string;
  description: string;
}

export interface PlayerStats {
  daoName: string;
  gender: string;
  currentRealmIndex: number;
  currentExp: number;
  spiritStones: number; // 靈石
  alchemyPoints: number; // 丹道經驗
  beastSouls: number; // 妖獸精魄
  talismanKnowledge: number; // 符道造詣
  englishVocabularyMastered: number; // 英文咒語掌握數
  fishCaughtCount: number; // 捕獲靈魚數
  affinityWithXiaoxue: number; // 與小雪好感度 (0-100)
  inventory: InventoryItem[];
  unlockedMaps: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'pill' | 'herb' | 'talisman' | 'fish' | 'material' | 'treasure';
  grade: string;
  count: number;
  icon: string;
  description: string;
}

export interface PortalCardItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  iconName: string;
  iconColor: string;
  badge?: string;
  imageCropIndex: number;
  flavor: string;
}

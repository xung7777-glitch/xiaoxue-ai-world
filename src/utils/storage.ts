import { PlayerStats } from '../types/cultivation';
import { INITIAL_INVENTORY } from '../data/cultivationData';

const STORAGE_KEY = 'xiaoxue_cultivation_save_v1';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  daoName: '太素道人',
  gender: '修士',
  currentRealmIndex: 0, // 0 = 練氣初期
  currentExp: 0,        // 初始修為嚴格為 0
  spiritStones: 0,      // 初始靈石 0
  alchemyPoints: 0,
  beastSouls: 0,
  talismanKnowledge: 0,
  englishVocabularyMastered: 0,
  fishCaughtCount: 0,
  affinityWithXiaoxue: 0,
  inventory: INITIAL_INVENTORY,
  unlockedMaps: ['map-1', 'map-2'],
};

export function loadPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLAYER_STATS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PLAYER_STATS, ...parsed };
  } catch {
    return DEFAULT_PLAYER_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // LocalStorage error ignore
  }
}

export function resetPlayerStats(): PlayerStats {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PLAYER_STATS;
}

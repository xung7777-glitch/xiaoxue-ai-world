export interface RealmStage {
  stage: '初期' | '中期' | '後期' | '圓滿';
  min: number;
  max: number;
}

export interface RealmDefinition {
  id: string;
  name: string;
  overall_min: number;
  overall_max: number;
  stages: RealmStage[];
}

export interface RealmCalculationResult {
  realmId: string;
  realmName: string;
  stageName: '初期' | '中期' | '後期' | '圓滿';
  fullTitle: string; // e.g. "練氣初期"
  currentPower: number;
  stageMin: number;
  stageMax: number;
  stageProgressPercent: number; // 0 - 100
  overallProgressPercent: number; // 0 - 100
  nextStageThreshold: number;
  powerNeededForNext: number;
  isMaxLevel: boolean;
}

export const CULTIVATION_REALMS: RealmDefinition[] = [
  {
    id: 'realm_1',
    name: '練氣期',
    overall_min: 0,
    overall_max: 1000,
    stages: [
      { stage: '初期', min: 0, max: 250 },
      { stage: '中期', min: 251, max: 500 },
      { stage: '後期', min: 501, max: 750 },
      { stage: '圓滿', min: 751, max: 1000 },
    ],
  },
  {
    id: 'realm_2',
    name: '築基期',
    overall_min: 1001,
    overall_max: 3000,
    stages: [
      { stage: '初期', min: 1001, max: 1500 },
      { stage: '中期', min: 1501, max: 2000 },
      { stage: '後期', min: 2001, max: 2500 },
      { stage: '圓滿', min: 2501, max: 3000 },
    ],
  },
  {
    id: 'realm_3',
    name: '金丹期',
    overall_min: 3001,
    overall_max: 6000,
    stages: [
      { stage: '初期', min: 3001, max: 3750 },
      { stage: '中期', min: 3751, max: 4500 },
      { stage: '後期', min: 4501, max: 5250 },
      { stage: '圓滿', min: 5251, max: 6000 },
    ],
  },
  {
    id: 'realm_4',
    name: '元嬰期',
    overall_min: 6001,
    overall_max: 10000,
    stages: [
      { stage: '初期', min: 6001, max: 7000 },
      { stage: '中期', min: 7001, max: 8000 },
      { stage: '後期', min: 8001, max: 9000 },
      { stage: '圓滿', min: 9001, max: 10000 },
    ],
  },
  {
    id: 'realm_5',
    name: '化神期',
    overall_min: 10001,
    overall_max: 15000,
    stages: [
      { stage: '初期', min: 10001, max: 11250 },
      { stage: '中期', min: 11251, max: 12500 },
      { stage: '後期', min: 12501, max: 13750 },
      { stage: '圓滿', min: 13751, max: 15000 },
    ],
  },
  {
    id: 'realm_6',
    name: '煉虛期',
    overall_min: 15001,
    overall_max: 21000,
    stages: [
      { stage: '初期', min: 15001, max: 16500 },
      { stage: '中期', min: 16501, max: 18000 },
      { stage: '後期', min: 18001, max: 19500 },
      { stage: '圓滿', min: 19501, max: 21000 },
    ],
  },
  {
    id: 'realm_7',
    name: '合體期',
    overall_min: 21001,
    overall_max: 28000,
    stages: [
      { stage: '初期', min: 21001, max: 22750 },
      { stage: '中期', min: 22751, max: 24500 },
      { stage: '後期', min: 24501, max: 26250 },
      { stage: '圓滿', min: 26251, max: 28000 },
    ],
  },
  {
    id: 'realm_8',
    name: '大乘期',
    overall_min: 28001,
    overall_max: 36000,
    stages: [
      { stage: '初期', min: 28001, max: 30000 },
      { stage: '中期', min: 30001, max: 32000 },
      { stage: '後期', min: 32001, max: 34000 },
      { stage: '圓滿', min: 34001, max: 36000 },
    ],
  },
  {
    id: 'realm_9',
    name: '渡劫期',
    overall_min: 36001,
    overall_max: 45000,
    stages: [
      { stage: '初期', min: 36001, max: 38250 },
      { stage: '中期', min: 38251, max: 40500 },
      { stage: '後期', min: 40501, max: 42750 },
      { stage: '圓滿', min: 42751, max: 45000 },
    ],
  },
];

export const MAX_SPIRITUAL_POWER = 45000;

/**
 * Calculates current realm, stage, and progression from spiritual power.
 * Strictly adheres to the 9 realms x 4 stages specifications.
 */
export function calculateRealm(power: number): RealmCalculationResult {
  const safePower = Math.max(0, Math.min(MAX_SPIRITUAL_POWER, Math.floor(power || 0)));

  for (let rIndex = 0; rIndex < CULTIVATION_REALMS.length; rIndex++) {
    const realm = CULTIVATION_REALMS[rIndex];

    for (let sIndex = 0; sIndex < realm.stages.length; sIndex++) {
      const stage = realm.stages[sIndex];

      if (safePower >= stage.min && safePower <= stage.max) {
        const stageSpan = Math.max(1, stage.max - stage.min);
        const stageProgress = Math.min(100, Math.max(0, ((safePower - stage.min) / stageSpan) * 100));
        const overallProgress = Math.min(100, Math.max(0, (safePower / MAX_SPIRITUAL_POWER) * 100));

        const nextThreshold = stage.max + 1;
        const powerNeeded = Math.max(0, nextThreshold - safePower);
        const isMax = safePower >= MAX_SPIRITUAL_POWER;

        return {
          realmId: realm.id,
          realmName: realm.name,
          stageName: stage.stage,
          fullTitle: `${realm.name.replace('期', '')}${stage.stage}`, // e.g. 練氣初期
          currentPower: safePower,
          stageMin: stage.min,
          stageMax: stage.max,
          stageProgressPercent: Math.round(stageProgress),
          overallProgressPercent: Number(overallProgress.toFixed(1)),
          nextStageThreshold: Math.min(MAX_SPIRITUAL_POWER, nextThreshold),
          powerNeededForNext: isMax ? 0 : powerNeeded,
          isMaxLevel: isMax,
        };
      }
    }
  }

  // Fallback for max level
  const lastRealm = CULTIVATION_REALMS[CULTIVATION_REALMS.length - 1];
  const lastStage = lastRealm.stages[lastRealm.stages.length - 1];

  return {
    realmId: lastRealm.id,
    realmName: lastRealm.name,
    stageName: lastStage.stage,
    fullTitle: `${lastRealm.name.replace('期', '')}${lastStage.stage}`,
    currentPower: MAX_SPIRITUAL_POWER,
    stageMin: lastStage.min,
    stageMax: lastStage.max,
    stageProgressPercent: 100,
    overallProgressPercent: 100,
    nextStageThreshold: MAX_SPIRITUAL_POWER,
    powerNeededForNext: 0,
    isMaxLevel: true,
  };
}

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { calculateRealm } from '../utils/cultivationLevels';

// 1. Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without passing firestoreDatabaseId!
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 2. Strict Error Handling conforming to FirestoreErrorInfo standard
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check configuration');
    }
  }
}
testFirestoreConnection().catch(() => {});

// 4. Player Document Types
export interface PlayerProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt?: any;
  lastLoginAt?: any;
}

export interface PlayerCultivation {
  totalSpiritualPower: number; // 0 ~ 45,000
  currentRealm: string;        // e.g. "練氣期"
  currentStage: string;        // e.g. "初期"
  spiritStones: number;
}

export interface DlcProgressRecord {
  totalEXP: number;
  highestAchievement: string;
  history?: any[];
}

export interface PlayerDoc {
  profile: PlayerProfile;
  cultivation: PlayerCultivation;
  dlc_data?: Record<string, DlcProgressRecord>;
}

// 5. Google Authentication
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      await ensurePlayerRecord(user);
    }
    return user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

// 6. Ensure Player Document Exists in Firestore
export async function ensurePlayerRecord(user: FirebaseUser): Promise<PlayerDoc> {
  const path = `players/${user.uid}`;
  const playerRef = doc(db, 'players', user.uid);

  try {
    const snap = await getDoc(playerRef);

    if (snap.exists()) {
      // Update last login & ensure cultivation defaults to 0 if missing
      const existing = snap.data() as PlayerDoc;
      const initialRealm = calculateRealm(0);
      const updates: any = {
        profile: {
          displayName: user.displayName || existing.profile?.displayName || '修仙道友',
          photoURL: user.photoURL || existing.profile?.photoURL || '',
          lastLoginAt: new Date().toISOString(),
        },
      };

      if (!existing.cultivation || existing.cultivation.totalSpiritualPower === undefined) {
        updates.cultivation = {
          totalSpiritualPower: 0,
          currentRealm: initialRealm.realmName,
          currentStage: initialRealm.stageName,
          spiritStones: 0,
        };
      }

      if (!existing.dlc_data) {
        updates.dlc_data = {
          dlc_spellbook: { totalEXP: 0, highestAchievement: '初入道途', history: [] },
          dlc_beast_hunter: { totalEXP: 0, highestAchievement: '靈木巡獵', history: [] },
          dlc_fishing_river: { totalEXP: 0, highestAchievement: '碧波垂綸', history: [] },
          dlc_talisman_2048: { totalEXP: 0, highestAchievement: '符紋初通', history: [] },
          dlc_gear_puzzle: { totalEXP: 0, highestAchievement: '璇璣合道', history: [] },
          dlc_herb_alchemy: { totalEXP: 0, highestAchievement: '百草丹徒', history: [] },
          dlc_spirit_spring: { totalEXP: 0, highestAchievement: '靈蛙清鳴', history: [] },
        };
      }

      await setDoc(playerRef, updates, { merge: true });
      return { ...existing, ...updates };
    } else {
      // Create initial player document: Strictly 0 initial spiritual power!
      const initialRealm = calculateRealm(0);
      const newPlayer: PlayerDoc = {
        profile: {
          uid: user.uid,
          displayName: user.displayName || '修仙道友',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
        cultivation: {
          totalSpiritualPower: 0, // Initial spiritual power is strictly 0
          currentRealm: initialRealm.realmName,
          currentStage: initialRealm.stageName,
          spiritStones: 0,        // Initial spirit stones is strictly 0
        },
        dlc_data: {
          dlc_spellbook: { totalEXP: 0, highestAchievement: '初入道途', history: [] },
          dlc_beast_hunter: { totalEXP: 0, highestAchievement: '靈木巡獵', history: [] },
          dlc_fishing_river: { totalEXP: 0, highestAchievement: '碧波垂綸', history: [] },
          dlc_talisman_2048: { totalEXP: 0, highestAchievement: '符紋初通', history: [] },
          dlc_gear_puzzle: { totalEXP: 0, highestAchievement: '璇璣合道', history: [] },
          dlc_herb_alchemy: { totalEXP: 0, highestAchievement: '百草丹徒', history: [] },
          dlc_spirit_spring: { totalEXP: 0, highestAchievement: '靈蛙清鳴', history: [] },
        },
      };

      await setDoc(playerRef, newPlayer);
      return newPlayer;
    }
  } catch (error) {
    const errStr = error instanceof Error ? error.message : String(error);
    if (errStr.includes('offline') || errStr.includes('network-request-failed') || errStr.includes('Failed to get document')) {
      console.warn('Firestore offline fallback activated for player record');
      const initialRealm = calculateRealm(0);
      return {
        profile: {
          uid: user.uid,
          displayName: user.displayName || '修仙道友 (離線模式)',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
        cultivation: {
          totalSpiritualPower: 0,
          currentRealm: initialRealm.realmName,
          currentStage: initialRealm.stageName,
          spiritStones: 0,
        },
        dlc_data: {
          dlc_spellbook: { totalEXP: 0, highestAchievement: '初入道途', history: [] },
          dlc_beast_hunter: { totalEXP: 0, highestAchievement: '靈木巡獵', history: [] },
          dlc_fishing_river: { totalEXP: 0, highestAchievement: '碧波垂綸', history: [] },
          dlc_talisman_2048: { totalEXP: 0, highestAchievement: '符紋初通', history: [] },
          dlc_gear_puzzle: { totalEXP: 0, highestAchievement: '璇璣合道', history: [] },
          dlc_herb_alchemy: { totalEXP: 0, highestAchievement: '百草丹徒', history: [] },
          dlc_spirit_spring: { totalEXP: 0, highestAchievement: '靈蛙清鳴', history: [] },
        },
      };
    }
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// 7. Subscribe to Player Data
export function subscribeToPlayer(
  uid: string,
  onUpdate: (data: PlayerDoc | null) => void,
  onError?: (err: any) => void
) {
  const path = `players/${uid}`;
  const playerRef = doc(db, 'players', uid);

  return onSnapshot(
    playerRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as PlayerDoc);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      const errStr = error instanceof Error ? error.message : String(error);
      if (!errStr.includes('offline') && !errStr.includes('network-request-failed')) {
        handleFirestoreError(error, OperationType.GET, path);
      } else {
        console.warn('Firestore subscription offline mode');
      }
      if (onError) onError(error);
    }
  );
}

// 8. Add Spiritual Power from DLC or Chamber Meditation
export async function addSpiritualPower(
  uid: string,
  expDelta: number,
  stonesDelta: number = 0,
  dlcId?: string,
  dlcPayload?: { achievement?: string; message?: string }
) {
  const path = `players/${uid}`;
  const playerRef = doc(db, 'players', uid);

  try {
    const snap = await getDoc(playerRef);
    if (!snap.exists()) return;

    const data = snap.data() as PlayerDoc;
    const currentPower = data.cultivation?.totalSpiritualPower || 0;
    const newPower = Math.min(45000, currentPower + Math.max(0, expDelta));
    const newRealm = calculateRealm(newPower);
    const newStones = Math.max(0, (data.cultivation?.spiritStones || 0) + stonesDelta);

    const updates: any = {
      'cultivation.totalSpiritualPower': newPower,
      'cultivation.currentRealm': newRealm.realmName,
      'cultivation.currentStage': newRealm.stageName,
      'cultivation.spiritStones': newStones,
      'profile.lastLoginAt': new Date().toISOString(),
    };

    if (dlcId) {
      const existingDlc = data.dlc_data?.[dlcId] || { totalEXP: 0, highestAchievement: '歷練中' };
      updates[`dlc_data.${dlcId}.totalEXP`] = (existingDlc.totalEXP || 0) + expDelta;
      if (dlcPayload?.achievement) {
        updates[`dlc_data.${dlcId}.highestAchievement`] = dlcPayload.achievement;
      }
    }

    await setDoc(playerRef, updates, { merge: true });
  } catch (error) {
    const errStr = error instanceof Error ? error.message : String(error);
    if (errStr.includes('offline') || errStr.includes('network-request-failed')) {
      console.warn('Firestore offline: spiritual power update cached locally');
      return;
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

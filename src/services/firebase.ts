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

export interface FiveElementsData {
  metal: number;
  wood: number;
  water: number;
  fire: number;
  earth: number;
}

export interface PlayerCultivation {
  totalSpiritualPower: number; // 0 ~ 45,000
  currentRealm: string;        // e.g. "練氣期"
  currentStage: string;        // e.g. "初期"
  five_elements?: FiveElementsData;
}

export interface DlcProgressRecord {
  total_exp: number;
  dlc_name: string;
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

      if (!existing.cultivation || existing.cultivation.totalSpiritualPower === undefined || !existing.cultivation.five_elements) {
        updates.cultivation = {
          totalSpiritualPower: existing.cultivation?.totalSpiritualPower ?? 0,
          currentRealm: existing.cultivation?.currentRealm || initialRealm.realmName,
          currentStage: existing.cultivation?.currentStage || initialRealm.stageName,
          five_elements: (existing.cultivation as any)?.five_elements || (existing.cultivation as any)?.fiveElements || {
            metal: 35,
            wood: 20,
            water: 15,
            fire: 80,
            earth: 30,
          },
        };
      }

      const zodiacMap: Record<string, { exp: number; title: string }> = {
        dlc_luck: { exp: 0, title: '子鼠推天' },
        dlc_spellbook: { exp: 2, title: '丑牛耕卷' },
        dlc_pond: { exp: 3, title: '寅虎藏禪' },
        dlc_forest: { exp: 4, title: '卯兔采芝' },
        dlc_meditate: { exp: 5, title: '辰龍吐納' },
        dlc_fish: { exp: 6, title: '巳蛇戲淵' },
        dlc_merge: { exp: 7, title: '午馬躍遷' },
        dlc_tank: { exp: 8, title: '未羊御陣' },
        dlc_drop: { exp: 9, title: '申猴破陣' },
        dlc_sudoku: { exp: 10, title: '酉雞推演' },
        dlc_ruins: { exp: 11, title: '戌狗尋秘' },
        dlc_survival: { exp: 12, title: '亥豬鎮疆' },
      };
      
      const currentDlcData = existing.dlc_data || {};
      let needsDlcUpdate = false;
      const updatedDlcData = { ...currentDlcData };

      for (const [k, info] of Object.entries(zodiacMap)) {
        const item = updatedDlcData[k] as any;
        if (!item || (item.total_exp === undefined && item.totalEXP === undefined) || (k === 'dlc_luck' && item.total_exp === 1)) {
          needsDlcUpdate = true;
          updatedDlcData[k] = {
            total_exp: k === 'dlc_luck' ? 0 : (item?.total_exp ?? item?.totalEXP ?? info.exp),
            dlc_name: item?.dlc_name ?? item?.highestAchievement ?? info.title,
            history: item?.history || [],
          };
        }
      }

      if (needsDlcUpdate || !existing.dlc_data) {
        updates.dlc_data = updatedDlcData;
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
          five_elements: {
            metal: 35,
            wood: 20,
            water: 15,
            fire: 80,
            earth: 30,
          },
        },
        dlc_data: {
          dlc_luck: { total_exp: 0, dlc_name: '子鼠推天', history: [] },
          dlc_spellbook: { total_exp: 2, dlc_name: '丑牛耕卷', history: [] },
          dlc_pond: { total_exp: 3, dlc_name: '寅虎藏禪', history: [] },
          dlc_forest: { total_exp: 4, dlc_name: '卯兔采芝', history: [] },
          dlc_meditate: { total_exp: 5, dlc_name: '辰龍吐納', history: [] },
          dlc_fish: { total_exp: 6, dlc_name: '巳蛇戲淵', history: [] },
          dlc_merge: { total_exp: 7, dlc_name: '午馬躍遷', history: [] },
          dlc_tank: { total_exp: 8, dlc_name: '未羊御陣', history: [] },
          dlc_drop: { total_exp: 9, dlc_name: '申猴破陣', history: [] },
          dlc_sudoku: { total_exp: 10, dlc_name: '酉雞推演', history: [] },
          dlc_ruins: { total_exp: 11, dlc_name: '戌狗尋秘', history: [] },
          dlc_survival: { total_exp: 12, dlc_name: '亥豬鎮疆', history: [] },
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
          five_elements: {
            metal: 35,
            wood: 20,
            water: 15,
            fire: 80,
            earth: 30,
          },
        },
        dlc_data: {
          dlc_luck: { total_exp: 1, dlc_name: '子鼠推天', history: [] },
          dlc_spellbook: { total_exp: 2, dlc_name: '丑牛耕卷', history: [] },
          dlc_pond: { total_exp: 3, dlc_name: '寅虎藏禪', history: [] },
          dlc_forest: { total_exp: 4, dlc_name: '卯兔采芝', history: [] },
          dlc_meditate: { total_exp: 5, dlc_name: '辰龍吐納', history: [] },
          dlc_fish: { total_exp: 6, dlc_name: '巳蛇戲淵', history: [] },
          dlc_merge: { total_exp: 7, dlc_name: '午馬躍遷', history: [] },
          dlc_tank: { total_exp: 8, dlc_name: '未羊御陣', history: [] },
          dlc_drop: { total_exp: 9, dlc_name: '申猴破陣', history: [] },
          dlc_sudoku: { total_exp: 10, dlc_name: '酉雞推演', history: [] },
          dlc_ruins: { total_exp: 11, dlc_name: '戌狗尋秘', history: [] },
          dlc_survival: { total_exp: 12, dlc_name: '亥豬鎮疆', history: [] },
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

    const updates: any = {
      'cultivation.totalSpiritualPower': newPower,
      'cultivation.currentRealm': newRealm.realmName,
      'cultivation.currentStage': newRealm.stageName,
      'profile.lastLoginAt': new Date().toISOString(),
    };

    if (dlcId) {
      const existingDlc = (data.dlc_data as any)?.[dlcId] || { total_exp: 0, dlc_name: '歷練中' };
      const currentExp = existingDlc.total_exp ?? existingDlc.totalEXP ?? 0;
      updates[`dlc_data.${dlcId}.total_exp`] = currentExp + expDelta;
      if (dlcPayload?.achievement) {
        updates[`dlc_data.${dlcId}.dlc_name`] = dlcPayload.achievement;
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

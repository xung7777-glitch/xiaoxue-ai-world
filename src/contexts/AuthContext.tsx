import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  logOut,
  PlayerDoc,
  subscribeToPlayer,
  addSpiritualPower,
  ensurePlayerRecord,
} from '../services/firebase';
import { calculateRealm, RealmCalculationResult } from '../utils/cultivationLevels';

interface AuthContextType {
  user: FirebaseUser | null;
  playerData: PlayerDoc | null;
  realmInfo: RealmCalculationResult;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  gainSpiritualPower: (
    exp: number,
    dlcId?: string,
    dlcPayload?: { achievement?: string; message?: string }
  ) => Promise<void>;
  resetCloudCultivation: () => Promise<void>;
}

const defaultRealmInfo = calculateRealm(0);

const AuthContext = createContext<AuthContextType>({
  user: null,
  playerData: null,
  realmInfo: defaultRealmInfo,
  isLoading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  gainSpiritualPower: async () => {},
  resetCloudCultivation: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [playerData, setPlayerData] = useState<PlayerDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive realm info dynamically
  const spiritualPower = playerData?.cultivation?.totalSpiritualPower ?? 0;
  const realmInfo = calculateRealm(spiritualPower);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          await ensurePlayerRecord(currentUser);
          unsubscribeFirestore = subscribeToPlayer(
            currentUser.uid,
            (data) => {
              setPlayerData(data);
              setIsLoading(false);
            },
            (err) => {
              console.error('Player subscribe error:', err);
              setIsLoading(false);
            }
          );
        } catch (error) {
          console.error('Failed to init player record:', error);
          setIsLoading(false);
        }
      } else {
        setPlayerData(null);
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const gainSpiritualPower = async (
    exp: number,
    dlcId?: string,
    dlcPayload?: { achievement?: string; message?: string }
  ) => {
    if (user?.uid) {
      await addSpiritualPower(user.uid, exp, dlcId, dlcPayload);
    }
  };

  const resetCloudCultivation = async () => {
    if (user?.uid) {
      const initialRealm = calculateRealm(0);
      const playerRef = doc(db, 'players', user.uid);
      await setDoc(
        playerRef,
        {
          cultivation: {
            totalSpiritualPower: 0,
            currentRealm: initialRealm.realmName,
            currentStage: initialRealm.stageName,
          },
        },
        { merge: true }
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        playerData,
        realmInfo,
        isLoading,
        loginWithGoogle,
        logout,
        gainSpiritualPower,
        resetCloudCultivation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Play, RotateCcw, ChevronRight, CheckCircle2, Volume2, Sparkles, BookOpen, Trophy, Home, Shuffle, ListOrdered, Library, Minus, Plus, LogIn, LogOut, User as UserIcon, Heart, Zap, Compass, ShieldCheck, Mail, Video, Monitor, Scroll, ArrowLeft, ArrowRight, Search, ChevronDown, Clock, Calendar } from 'lucide-react';
import sentencesData from './data/sentences.json';
import { auth, googleProvider, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, onSnapshot, getDocFromServer, collection, query, deleteDoc } from 'firebase/firestore';

// Types
interface Sentence {
  id: number;
  english: string;
  chinese: string;
  spell_name?: string;
  keywords: string[];
  keywords_cn?: string[];
  keywords2?: string[];
  keywords2_cn?: string[];
  pattern?: string;
  learning_note?: string;
  url?: string;
}

type Screen = 'start' | 'practice' | 'result' | 'privacy' | 'patterns' | 'pattern_detail' | 'lesson_detail';
type PracticeMode = 'full' | 'genealogy' | 'favorites' | 'wrong';
type StartViewState = 'menu' | 'practice_hub' | 'favorites_list' | 'wrong_list' | 'rank_detail' | 'app_guide' | 'how_it_works' | 'about';

const MistyMountains = React.memo(() => (
  <div className="absolute inset-x-0 bottom-0 h-full z-0 pointer-events-none opacity-60">
    <svg viewBox="0 0 400 200" className="absolute bottom-0 w-full h-full scale-110 origin-bottom">
      <path d="M0 200 L100 110 L200 170 L300 90 L400 150 V200 H0 Z" fill="#2A3B5D" />
      <path d="M-50 200 L50 80 L150 150 L280 60 L380 140 V200 H-50 Z" fill="#1A253D" opacity="0.4" />
    </svg>
  </div>
));

const XuanwuBeast = React.memo(() => (
  <motion.div 
    animate={{ y: [5, -5, 5], opacity: [0.85, 1, 0.85] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    className="relative will-change-transform"
  >
    <svg viewBox="0 0 160 120" className="w-48 h-36 filter drop-shadow-[0_0_25px_rgba(30,120,255,0.6)]">
      <defs>
        <radialGradient id="shellGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <pattern id="hexPattern" width="10" height="17" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
          <path d="M5 0 L10 3 L10 9 L5 12 L0 9 L0 3 Z" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>
      <path d="M35 105 Q30 105 32 95 Q25 90 28 80 Q10 75 15 55 Q20 45 35 50 Q45 55 40 75 Q42 85 50 85" fill="#1e3a8a" />
      <path d="M45 102 L40 110 M50 102 L50 112" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M125 102 L120 110 M130 102 L130 112" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M35 85 C35 30 65 15 90 15 C115 15 145 30 145 85 L135 100 L45 100 Z" fill="url(#shellGradient)" />
      <path d="M45 80 C45 45 135 45 135 80 L125 95 L55 95 Z" fill="url(#hexPattern)" />
      <circle cx="21" cy="52" r="1.5" fill="#93c5fd" className="animate-pulse" />
      <path d="M18 45 Q20 35 25 45" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <motion.g animate={{ rotate: [-1, 1, -1], x: [-2, 2, -2], y: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "90px", originY: "60px" }}>
        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2 }} d="M125 90 C155 90 155 55 125 55 C100 55 95 80 65 80 C40 80 40 45 60 30 C75 22 95 35 90 52" fill="none" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
        <circle cx="90" cy="52" r="1.5" fill="#bfdbfe" />
        <path d="M90 52 L96 58 M90 52 L84 58" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
    <div className="absolute inset-0 bg-blue-500/15 blur-[50px] rounded-full scale-125 -z-10" />
  </motion.div>
));

const BaihuBeast = React.memo(() => (
  <motion.div animate={{ scale: [1, 1.05, 1], y: [0, -5, 0], opacity: [0.9, 1, 0.9] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative will-change-transform">
    <svg viewBox="0 0 160 120" className="w-52 h-40 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
      <defs>
        <linearGradient id="tigerBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#cbd5e1" /></linearGradient>
        <pattern id="tigerStripePattern" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><path d="M0 5 Q10 10 20 5 L20 10 Q10 15 0 10 Z" fill="#334155" opacity="0.4" /></pattern>
      </defs>
      <path d="M30 85 Q20 50 70 45 Q120 45 130 80 Q135 110 90 110 L40 110 Q30 110 30 85" fill="url(#tigerBodyGradient)" />
      <path d="M35 55 Q70 48 120 55 L110 95 L45 95 Z" fill="url(#tigerStripePattern)" />
      <path d="M40 100 Q30 125 55 120" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
      <path d="M110 100 Q120 125 95 120" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
      <path d="M50 118 L45 125 M55 118 L55 125 M60 118 L65 125" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 65 Q10 40 45 40 Q75 45 70 75 Q65 100 40 95 Q15 95 15 65" fill="url(#tigerBodyGradient)" />
      <path d="M22 45 L15 30 L32 40 Z" fill="#94a3b8" /><path d="M55 45 L62 30 L45 40 Z" fill="#94a3b8" />
      <path d="M30 82 Q40 85 50 82" fill="none" stroke="#64748b" strokeWidth="2" opacity="0.5" />
      <path d="M18 55 L30 58 M18 65 L30 65 M18 75 L30 72 M62 55 L50 58 M62 65 L50 65 M62 75 L50 72" fill="none" stroke="#334155" strokeWidth="1.5" opacity="0.3" />
      <circle cx="32" cy="58" r="2" fill="#ffffff" className="animate-pulse" /><circle cx="48" cy="58" r="2" fill="#ffffff" className="animate-pulse" />
      <path d="M32 58 L28 54 M48 58 L52 54" stroke="#ffffff" strokeWidth="1" />
      <motion.path animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }} d="M130 85 Q160 55 150 30" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" style={{ originX: "130px", originY: "85px" }} />
    </svg>
    <div className="absolute inset-0 bg-white/20 blur-[80px] rounded-full scale-125 -z-10" />
  </motion.div>
));

const SuzakuBeast = React.memo(() => (
  <motion.div animate={{ scale: [1, 1.05, 1], y: [0, -12, 0], opacity: [0.9, 1, 0.9] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative will-change-transform">
    <svg viewBox="0 0 160 120" className="w-48 h-36 filter drop-shadow-[0_0_30px_rgba(248,113,113,0.7)]">
      <defs>
        <radialGradient id="birdBodyGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#991b1b" /><stop offset="100%" stopColor="#7f1d1d" /></radialGradient>
        <linearGradient id="featherGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
      </defs>
      <motion.g animate={{ rotateX: [0, 60, 0], y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "80px 60px", perspective: "1000px" }}>
        <path d="M80 60 C50 10 20 20 10 60 C30 70 60 70 80 60 Z" fill="url(#birdBodyGradient)" />
        <path d="M80 60 C110 10 140 20 150 60 C130 70 100 70 80 60 Z" fill="url(#birdBodyGradient)" />
      </motion.g>
      <path d="M80 90 Q50 130 30 115" fill="none" stroke="url(#featherGradient)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M80 95 Q80 140 80 125" fill="none" stroke="url(#featherGradient)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M80 90 Q110 130 130 115" fill="none" stroke="url(#featherGradient)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M70 55 Q80 45 90 55 L85 95 Q80 105 75 95 Z" fill="#b91c1c" />
      <circle cx="80" cy="45" r="10" fill="url(#birdBodyGradient)" />
      <path d="M78 38 Q80 30 82 38" fill="none" stroke="#fcd34d" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="84" cy="44" r="1" fill="#fef3c7" className="animate-pulse" />
    </svg>
    <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full scale-150 -z-10" />
  </motion.div>
));

const SeiryuBeast = React.memo(() => (
  <motion.div animate={{ opacity: [0.9, 1, 0.9] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="relative will-change-transform">
    <svg viewBox="0 0 160 120" className="w-48 h-36 filter drop-shadow-[0_0_25px_rgba(52,211,153,0.6)]">
      <defs>
        <radialGradient id="dragonBodyGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#065f46" /><stop offset="100%" stopColor="#064e3b" /></radialGradient>
        <pattern id="scalePattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M4 0 L8 4 L4 8 L0 4 Z" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.4" /></pattern>
      </defs>
      <motion.g animate={{ rotate: [-2, 2, -2], scale: [1, 1.02, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "80px", originY: "60px" }}>
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3 }} d="M130 90 C150 70 140 30 100 30 C60 30 70 70 40 70 C10 70 20 100 50 105" fill="none" stroke="url(#dragonBodyGradient)" strokeWidth="14" strokeLinecap="round" />
        <path d="M130 90 C150 70 140 30 100 30 C60 30 70 70 40 70 C10 70 20 100 50 105" fill="none" stroke="url(#scalePattern)" strokeWidth="12" strokeLinecap="round" />
      </motion.g>
      <motion.g animate={{ x: [0, 3, 0], y: [0, -2, 0], rotate: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "125px", originY: "90px" }}>
        <path d="M100 30 L95 20 M110 30 L115 20 M85 32 L80 25" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M125 100 Q145 105 140 85 Q135 70 125 75 L115 90 Z" fill="#065f46" />
        <circle cx="134" cy="88" r="1.5" fill="#34d399" className="animate-pulse" />
        <motion.g animate={{ skewX: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity }}>
          <path d="M135 95 Q150 100 155 90" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.5" /><path d="M135 90 Q150 85 155 75" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.5" />
        </motion.g>
      </motion.g>
    </svg>
    <div className="absolute inset-0 bg-emerald-500/15 blur-[50px] rounded-full scale-125 -z-10" />
  </motion.div>
));

const HuanglongBeast = React.memo(() => (
  <motion.div animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="relative will-change-transform">
    <svg viewBox="0 0 160 120" className="w-56 h-42 filter drop-shadow-[0_0_40px_rgba(234,179,8,0.6)]">
      <defs>
        <radialGradient id="huanglongBodyGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fde047" /><stop offset="100%" stopColor="#ca8a04" /></radialGradient>
        <pattern id="goldScale" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M4 0 L8 4 L4 8 L0 4 Z" fill="none" stroke="#fef08a" strokeWidth="0.5" opacity="0.4" /></pattern>
      </defs>
      <motion.g animate={{ scale: [1, 1.03, 1], rotate: [-1, 1, -1], skewX: [-1, 1, -1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "80px", originY: "80px" }}>
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4 }} d="M30 80 C30 110 80 110 80 80 C80 50 130 50 130 80 C130 110 110 120 90 110" fill="none" stroke="url(#huanglongBodyGradient)" strokeWidth="12" strokeLinecap="round" />
        <path d="M30 80 C30 110 80 110 80 80 C80 50 130 50 130 80 C130 110 110 120 90 110" fill="none" stroke="url(#goldScale)" strokeWidth="10" strokeLinecap="round" />
      </motion.g>
      <motion.g animate={{ x: [-2, 2, -2], y: [0, -3, 0], rotate: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "30px", originY: "70px" }}>
        <path d="M40 70 L35 60 M50 72 L55 62 M30 75 L20 70" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M30 85 Q10 85 15 65 Q20 50 35 55 L45 70 Z" fill="#ca8a04" />
        <circle cx="24" cy="68" r="1.5" fill="#fef9c3" className="animate-pulse" />
        <motion.g animate={{ skewY: [-3, 3, -3] }} transition={{ duration: 3, repeat: Infinity }}>
          <path d="M15 75 Q-5 80 -10 70" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.6" /><path d="M15 80 Q-5 85 -10 95" fill="none" stroke="#fef08a" strokeWidth="1" opacity="0.6" />
        </motion.g>
      </motion.g>
    </svg>
    <div className="absolute inset-0 bg-yellow-500/15 blur-[50px] rounded-full scale-125 -z-10" />
  </motion.div>
));

// Global counter to ensure absolute uniqueness for temporary animations
let burstCounter = 0;

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [startViewState, setStartViewState] = useState<StartViewState>('menu');
  
  // Track states in refs for the back-button handler closure
  const currentScreenRef = useRef<Screen>(screen);
  const startViewStateRef = useRef<StartViewState>(startViewState);
  
  useEffect(() => {
    currentScreenRef.current = screen;
    startViewStateRef.current = startViewState;
  }, [screen, startViewState]);

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('full');
  const [isRandom, setIsRandom] = useState(true);
  const [startId, setStartId] = useState(1);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [currentQuestions, setCurrentQuestions] = useState<Sentence[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeKeywords, setActiveKeywords] = useState<string[]>([]);
  const [activeKeywordsCn, setActiveKeywordsCn] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  // Use a ref to track answers synchronously for rapid-fire click handling
  const answersSyncRef = useRef<(number | null)[]>([]);

  // Update ref whenever state changes (from resets)
  useEffect(() => {
    answersSyncRef.current = userAnswers;
  }, [userAnswers]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userGreeting, setUserGreeting] = useState<{show: boolean, message: string, type: 'welcome' | 'farewell'}>({
    show: false,
    message: '',
    type: 'welcome'
  });
  const [speechRate, setSpeechRate] = useState(0.8);
  const [bursts, setBursts] = useState<{ id: string; slotIdx: number }[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userStats, setUserStats] = useState<{totalCorrect: number, totalAttempted: number, totalTimeMinutes?: number, lastSpecifiedId?: number} | null>(null);
  const [userFavorites, setUserFavorites] = useState<number[]>([]);
  const [userWrongSentences, setUserWrongSentences] = useState<number[]>([]);
  const [sessionIsRandom, setSessionIsRandom] = useState(true);
  const [unlockedLimit, setUnlockedLimit] = useState(50);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [showBreakthrough, setShowBreakthrough] = useState<{show: boolean, name: string, type: 'big' | 'small'} | null>(null);

  // Pattern SEO State
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Sentence | null>(null);
  const [previewPattern, setPreviewPattern] = useState<typeof patternsData[0] | null>(null);
  const [selectedAlpha, setSelectedAlpha] = useState<string | null>(null);
  const [isAlphaMenuOpen, setIsAlphaMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'patterns' | 'practice' | 'insights' | 'profile' | 'home'>('home');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Scroll visibility logic for Bottom Nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsNavVisible(true);
        return;
      }
      if (currentScrollY > lastScrollY.current + 5) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync activeTab with screen state for external navigations
  useEffect(() => {
    if (screen === 'patterns' || screen === 'pattern_detail' || screen === 'lesson_detail') {
      setActiveTab('patterns');
    } else if (screen === 'start') {
      if (startViewState === 'menu') setActiveTab('home');
      else if (startViewState === 'practice_hub') setActiveTab('practice');
      else if (startViewState === 'favorites_list' || startViewState === 'wrong_list' || startViewState === 'how_it_works') setActiveTab('insights');
      else if (startViewState === 'rank_detail') setActiveTab('profile');
    }
  }, [screen, startViewState]);

  // Grouped Pattern Data
  const patternsData = useMemo(() => {
    const groups: { [key: string]: Sentence[] } = {};
    sentencesData.forEach(s => {
      const p = s.pattern || 'Other';
      if (!groups[p]) groups[p] = [];
      groups[p].push(s);
    });
    return Object.entries(groups).map(([name, lessons]) => ({
      name,
      lessons,
      description: lessons.find(l => l.learning_note)?.learning_note?.substring(0, 50) + '...' || '英文發音與詞族規律學習'
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const groupedPatterns = useMemo(() => {
    const alphaGroups: { [key: string]: typeof patternsData } = {};
    patternsData.forEach(p => {
      const char = p.name.charAt(0).toUpperCase();
      const groupKey = /^[A-Z]$/.test(char) ? char : '#';
      if (!alphaGroups[groupKey]) alphaGroups[groupKey] = [];
      alphaGroups[groupKey].push(p);
    });
    return Object.entries(alphaGroups).sort(([a], [b]) => a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b));
  }, [patternsData]);

  const availableAlphas = useMemo(() => groupedPatterns.map(([char]) => char), [groupedPatterns]);

  const handleWatchAd = async () => {
    if (unlockedLimit >= 800) return;
    
    setAdCountdown(15); // 15 second mock ad
    setShowAdOverlay(true);
    
    const timer = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (showAdOverlay && adCountdown === 0) {
      const completeAd = async () => {
        const newLimit = Math.min(800, unlockedLimit + 10);
        setUnlockedLimit(newLimit);
        setShowAdOverlay(false);
        
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            unlockedLimit: newLimit,
            lastActive: serverTimestamp()
          }).catch(console.error);
        }
      };
      completeAd();
    }
  }, [adCountdown, showAdOverlay, unlockedLimit, user]);

  // Heartbeat tracker for Total Cultivation Time (悟道時長)
  useEffect(() => {
    if (!user) return;

    // Wait 1 minute before first increment to ensure active session
    const interval = setInterval(async () => {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalTimeMinutes: increment(1),
        lastActive: serverTimestamp()
      }).catch(e => console.warn("Heartbeat update failed:", e.message));
    }, 60000); // Every 60 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Global Scroll-to-Top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [screen, startViewState]);

  // Helper to change screen with history tracking
  const navigateTo = useCallback((newScreen: Screen, newState: StartViewState = 'menu', forceReplace = false, extraData?: any) => {
    const currentState = window.history.state;
    
    // Update pattern/lesson state if provided
    if (newScreen === 'pattern_detail' && extraData?.pattern) {
      setSelectedPattern(extraData.pattern);
    }
    if (newScreen === 'lesson_detail' && extraData?.lesson) {
      setSelectedLesson(extraData.lesson);
      setSelectedPattern(extraData.lesson.pattern || 'Other');
    }

    // Logic for Hierarchy:
    // 1. "Root Menu" is (screen: 'start', state: 'menu')
    // 2. Sub-panels are (screen: 'start', state: 'anything_else')
    // 3. Other Screens are (screen: 'practice', 'result', etc.)
    
    const wasAtMenu = currentState && currentState.screen === 'start' && currentState.startViewState === 'menu';
    const isEnteringSubPanel = newScreen === 'start' && newState !== 'menu';
    const isReturningHome = newScreen === 'start' && newState === 'menu';
    const isStayingInSubPanels = currentState && currentState.screen === 'start' && currentState.startViewState !== 'menu' && newScreen === 'start' && newState !== 'menu';
    
    // We REPLACE when:
    // - Switching between sub-panels (to avoid stack bloat)
    // - Returning home (to keep the "Home" slot as the stack bottom)
    // - Explicitly forced
    const shouldReplace = forceReplace || isReturningHome || isStayingInSubPanels;
    
    // We PUSH when:
    // - Entering a sub-panel from the main menu (so Back works)
    // - Changing main screens (start -> practice, etc.)
    
    setScreen(newScreen);
    setStartViewState(newState);
    
    if (shouldReplace) {
      window.history.replaceState({ screen: newScreen, startViewState: newState, ...extraData }, '');
    } else {
      window.history.pushState({ screen: newScreen, startViewState: newState, ...extraData }, '');
    }
  }, []);

  // Navigation management for PWA/Mobile Back Button
  useEffect(() => {
    // Standard PWA/SPA History Trap
    const initNavigation = () => {
      // Ensure we always have a base state to catch the back button
      if (!window.history.state || window.history.state.screen === 'root_buffer') {
        window.history.replaceState({ screen: 'logout_trigger' }, '');
        window.history.pushState({ screen: 'start', startViewState: 'menu' }, '');
      }
    };

    initNavigation();

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;

      // 1. PRACTICE TRAP: Catch back button during practice sessions
      if (currentScreenRef.current === 'practice') {
        setShowCancelConfirm(true);
        // Force the browser back to a practice state so it doesn't navigate away
        window.history.pushState({ screen: 'practice', startViewState: 'menu' }, '');
        return;
      }

      // 2. ROOT TRAP: If at the very bottom (logout_trigger) or at menu and going back
      const isAtMenu = currentScreenRef.current === 'start' && startViewStateRef.current === 'menu';
      const isAtTrigger = state && state.screen === 'logout_trigger';

      if (isAtMenu || isAtTrigger || !state) {
        setShowLogoutConfirm(true);
        // Reset to Menu state in history to trap next back button
        window.history.replaceState({ screen: 'logout_trigger' }, '');
        window.history.pushState({ screen: 'start', startViewState: 'menu' }, '');
        setScreen('start');
        setStartViewState('menu');
        return;
      }

      // 3. NORMAL NAVIGATION
      if (state.screen === 'start') {
        setScreen('start');
        setStartViewState(state.startViewState || 'menu');
      } else if (state.screen === 'patterns') {
        setScreen('patterns');
      } else if (state.screen === 'pattern_detail') {
        setScreen('pattern_detail');
        if (state.pattern) setSelectedPattern(state.pattern);
      } else if (state.screen === 'lesson_detail') {
        setScreen('lesson_detail');
        if (state.lesson) setSelectedLesson(state.lesson);
      } else if (state.screen === 'result') {
        setScreen('result');
      } else if (state.screen === 'privacy') {
        setScreen('privacy');
      } else {
        // Fallback safety
        setScreen('start');
        setStartViewState('menu');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // SEO Update Logic
  useEffect(() => {
    if (screen === 'patterns') {
      document.title = 'English Pattern Learning Map - 小雪英咒寶典';
    } else if (screen === 'pattern_detail' && selectedPattern) {
      document.title = `${selectedPattern} Pattern English Practice - 小雪英咒寶典`;
    } else if (screen === 'lesson_detail' && selectedLesson) {
      document.title = `Lesson ${selectedLesson.id} - ${selectedLesson.pattern} Pattern - 小雪英咒寶典`;
    } else {
      document.title = '小雪的英咒寶典 - 不教語法，唯手熟爾';
    }
  }, [screen, selectedPattern, selectedLesson]);

  // Firestore Error Handler
  const handleFirestoreError = useCallback((error: any, operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write', path: string | null) => {
    if (error && (error.code === 'permission-denied' || error.message?.includes('insufficient permissions'))) {
      const info = {
        error: error.message,
        operationType,
        path,
        authInfo: {
          userId: auth.currentUser?.uid || 'anonymous',
          email: auth.currentUser?.email || 'N/A',
          emailVerified: auth.currentUser?.emailVerified || false,
          isAnonymous: auth.currentUser?.isAnonymous || false,
          providerInfo: auth.currentUser?.providerData.map(p => ({
            providerId: p.providerId,
            displayName: p.displayName || '',
            email: p.email || '',
          })) || []
        }
      };
      const errorStr = JSON.stringify(info);
      console.error("Firestore Error:", errorStr);
      return new Error(errorStr);
    }
    return error;
  }, []);

  const cultivationRanks = useMemo(() => [
    { 
      name: "凡人", range: "0 - 3", desc: "肉體凡胎，感悟靈氣之源。此境界尚無守護神獸。", color: "text-gray-400",
      stages: []
    },
    { 
      name: "練氣", range: "4 - 100", desc: "引氣入體，通明內外。初步掌控咒語靈力。", color: "text-green-400",
      stages: [
        { name: "前期", min: 4, max: 30 },
        { name: "中期", min: 31, max: 60 },
        { name: "圓滿", min: 61, max: 100 }
      ]
    },
    { 
      name: "築基", range: "101 - 200", desc: "大道之基，脫胎換骨。靈魂共鳴日益深厚。", color: "text-blue-400",
      stages: [
        { name: "前期", min: 101, max: 130 },
        { name: "中期", min: 131, max: 160 },
        { name: "圓滿", min: 161, max: 200 }
      ]
    },
    { 
      name: "結丹", range: "201 - 300", desc: "金丹璀璨，造化自生。咒法已入登堂入室之境。", color: "text-amber-400",
      stages: [
        { name: "前期", min: 201, max: 230 },
        { name: "中期", min: 231, max: 260 },
        { name: "圓滿", min: 261, max: 300 }
      ]
    },
    { 
      name: "元嬰", range: "301 - 500", desc: "元神出竅，萬術隨心。通曉古今英咒之奧秘。", color: "text-purple-400",
      stages: [
        { name: "前期", min: 301, max: 360 },
        { name: "中期", min: 361, max: 420 },
        { name: "圓滿", min: 421, max: 500 }
      ]
    },
    { 
      name: "化神", range: "501 >", desc: "化凡為神，與道合真。隨口即是真理，咒語信手拈來。", color: "text-orange-400",
      stages: [
        { name: "前期", min: 501, max: 700 },
        { name: "中期", min: 701, max: 1000 },
        { name: "圓滿", min: 1001, max: 99999 }
      ]
    },
  ], []);

  // Firestore connection test on boot
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();
  }, []);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Monitor Auth Data - Separate effect for clarity and robustness
  useEffect(() => {
    if (!user) {
      setUserStats(null);
      setUserFavorites([]);
      setUserWrongSentences([]);
      return;
    }

    let statsUnsub: (() => void) | null = null;
    let favsUnsub: (() => void) | null = null;
    let wrongsUnsub: (() => void) | null = null;

    const setupUser = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        
        // Non-blocking initialization check
        const userSnap = await getDoc(userRef).catch(e => {
          return null;
        });
        
        if (userSnap && !userSnap.exists()) {
          await setDoc(userRef, {
            userId: user.uid,
            email: user.email || `${user.uid}@example.com`,
            displayName: user.displayName || "修行者",
            photoURL: user.photoURL || null,
            totalCorrect: 0,
            totalAttempted: 0,
            lastSpecifiedId: 1,
            lastActive: serverTimestamp()
          }).catch(e => {
            const err = handleFirestoreError(e, 'create', `users/${user.uid}`);
            console.error("Profile creation failed:", err);
          });
        }

        // Subscriptions
        statsUnsub = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUnlockedLimit(data.unlockedLimit || 50);
            setUserStats({
              totalCorrect: data.totalCorrect || 0,
              totalAttempted: data.totalAttempted || 0,
              totalTimeMinutes: data.totalTimeMinutes || 0,
              lastSpecifiedId: data.lastSpecifiedId || 1
            });
            if (data.lastSpecifiedId) {
              setStartId(data.lastSpecifiedId);
            }
          }
        }, (err) => {
          handleFirestoreError(err, 'get', `users/${user.uid}`);
        });

        const favsRef = collection(db, 'users', user.uid, 'favorites');
        favsUnsub = onSnapshot(query(favsRef), (snapshot) => {
          setUserFavorites(snapshot.docs.map(doc => doc.data().sentenceId));
        }, (err) => {
          handleFirestoreError(err, 'list', `users/${user.uid}/favorites`);
        });

        const wrongsRef = collection(db, 'users', user.uid, 'wrong_sentences');
        wrongsUnsub = onSnapshot(query(wrongsRef), (snapshot) => {
          setUserWrongSentences(snapshot.docs.map(doc => doc.data().sentenceId));
        }, (err) => {
          handleFirestoreError(err, 'list', `users/${user.uid}/wrong_sentences`);
        });

      } catch (err) {
        console.error("Data setup failed:", err);
      }
    };

    setupUser();

    return () => {
      if (statsUnsub) statsUnsub();
      if (favsUnsub) favsUnsub();
      if (wrongsUnsub) wrongsUnsub();
    };
  }, [user?.uid, handleFirestoreError]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUserGreeting({
          show: true,
          message: '歡迎回來，期待與您一同精進修業！',
          type: 'welcome'
        });
        setTimeout(() => setUserGreeting(prev => ({ ...prev, show: false })), 3000);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setStartId(1);
      setShowLogoutConfirm(false);
      
      setUserGreeting({
        show: true,
        message: '期待您再次回來，願修心之路長青。',
        type: 'farewell'
      });
      setTimeout(() => setUserGreeting(prev => ({ ...prev, show: false })), 3000);
    } catch (error) {
      console.error("Logout failed:", error);
      setShowLogoutConfirm(false);
    }
  };

  const getCultivationRank = (successes: number = 0) => {
    const majorRanks = ["凡人", "練氣", "築基", "結丹", "元嬰", "化神"];
    const subRanks = ["初期", "中期", "圓滿"];
    
    // Safety check for NaN or invalid input
    const safeSuccesses = typeof successes === 'number' ? Math.max(0, successes) : 0;
    
    if (safeSuccesses <= 3) return { name: "凡人", style: "text-gray-400 border-gray-400/30 bg-gray-400/10" };

    // stage index logic (skipping 凡人 index 0 for subRank logic)
    // successes 4-100: majorIdx 1 (練氣)
    let majorIdx = 0;
    let subIdx = 0;

    if (safeSuccesses <= 100) {
      majorIdx = 1;
      subIdx = Math.min(2, Math.floor((safeSuccesses - 4) / 32));
    } else if (safeSuccesses <= 200) {
      majorIdx = 2;
      subIdx = Math.min(2, Math.floor((safeSuccesses - 101) / 33));
    } else if (safeSuccesses <= 300) {
      majorIdx = 3;
      subIdx = Math.min(2, Math.floor((safeSuccesses - 201) / 33));
    } else if (safeSuccesses <= 500) {
      majorIdx = 4;
      subIdx = Math.min(2, Math.floor((safeSuccesses - 301) / 66));
    } else {
      majorIdx = 5;
      return { name: "化神", style: "text-orange-400 border-orange-400/30 bg-orange-400/10" };
    }
    
    const colors = [
      "text-gray-400 border-gray-400/30 bg-gray-400/10",    // 凡人
      "text-green-400 border-green-400/30 bg-green-400/10",  // 練氣
      "text-blue-400 border-blue-400/30 bg-blue-400/10",    // 築基
      "text-amber-400 border-amber-400/30 bg-amber-400/10", // 結丹 (金)
      "text-purple-400 border-purple-400/30 bg-purple-400/10", // 元嬰
      "text-orange-400 border-orange-400/30 bg-orange-400/10", // 化神
    ];

    return {
      name: `${majorRanks[majorIdx] || "修行"}${subRanks[subIdx] || "者"}`,
      style: colors[majorIdx] || "text-parchment/60 border-white/10 bg-white/5"
    };
  };

  const renderAuthUI = () => {
    // CRITICAL: These icons MUST ONLY appear on the main start screen menu.
    // They are forbidden on practice screen, result screen, or secondary list views.
    if (screen !== 'start' || startViewState !== 'menu') return null;

    const rank = userStats ? getCultivationRank(userStats.totalCorrect) : getCultivationRank(0);

    return (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-0 z-[70] pointer-events-none">
        <div className="relative w-full">
          {/* Left Side: Utility Buttons (Restored) */}
          <div className="absolute top-6 left-4 pointer-events-auto">
            <AnimatePresence>
              <div key="utility-buttons" className="flex flex-col gap-1.5 items-start">
                <motion.button 
                  key="patterns-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('patterns');
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[10px] font-black text-gold border border-gold/40 px-2 py-0.5 rounded-full bg-gold/10 backdrop-blur-sm flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(212,175,55,0.2)] w-[68px]"
                >
                  <Library className="w-3 h-3 text-gold" />
                  <span className="tracking-widest">咒譜</span>
                </motion.button>

                <motion.button 
                  key="about-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('start', 'about');
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[10px] font-black text-gold border border-gold/40 px-2 py-0.5 rounded-full bg-gold/10 backdrop-blur-sm flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(212,175,55,0.2)] w-[68px]"
                >
                  <Sparkles className="w-3 h-3 text-gold" />
                  <span className="tracking-widest">道典</span>
                </motion.button>

                <motion.button 
                  key="how-it-works-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('start', 'app_guide');
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[10px] font-black text-gold border border-gold/40 px-2 py-0.5 rounded-full bg-gold/10 backdrop-blur-sm flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(212,175,55,0.2)] w-[68px]"
                >
                  <Compass className="w-3 h-3 text-gold animate-pulse" />
                  <span className="tracking-widest">修行</span>
                </motion.button>

                <motion.button 
                  key="privacy-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('privacy');
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[10px] font-black text-gold border border-gold/40 px-2 py-0.5 rounded-full bg-gold/10 backdrop-blur-sm flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(212,175,55,0.2)] w-[68px]"
                >
                  <ShieldCheck className="w-3 h-3 text-gold" />
                  <span className="tracking-widest">天律</span>
                </motion.button>
              </div>
            </AnimatePresence>
          </div>

          {/* Right Side: Login/User Profile (Contained within max-w-md) */}
          <div className="absolute top-6 right-4 pointer-events-auto">
            <AnimatePresence mode="wait">
              {isAuthLoading ? (
                <motion.div 
                  key="auth-loading"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-spin"
                >
                  <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full" />
                </motion.div>
              ) : user ? (
                <motion.div 
                  key="auth-user"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-black/80 backdrop-blur-2xl border border-white/20 p-1 pr-3 rounded-full shadow-2xl group cursor-pointer transition-colors hover:border-gold/50"
                >
                  <div className="relative">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || ""} 
                        className="w-7 h-7 rounded-full border border-gold/40 group-hover:border-gold transition-colors" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center border-2 border-gold/40 group-hover:border-gold transition-colors">
                        <UserIcon className="w-3.5 h-3.5 text-gold" />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full shadow-lg" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white font-black leading-tight truncate max-w-[70px] tracking-wide">
                      {user.displayName || "修行者"}
                    </span>
                    <span className="text-[8px] text-gold/60 group-hover:text-gold uppercase tracking-[0.1em] text-left font-black transition-all">
                      點擊登出
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="auth-login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={handleLogin}
                  className="flex items-center gap-2 bg-gold text-ink px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.1em] shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  <LogIn className="w-3 h-3" />
                  登入
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const toggleWrongSentence = async (sentenceId: number) => {
    if (!user) return;
    const wrongRef = doc(db, 'users', user.uid, 'wrong_sentences', String(sentenceId));
    if (userWrongSentences.includes(sentenceId)) {
      await deleteDoc(wrongRef);
    } else {
      await setDoc(wrongRef, { sentenceId, recordedAt: serverTimestamp() });
    }
  };

  const toggleFavorite = async (sentenceId: number) => {
    if (!user) return;
    const favRef = doc(db, 'users', user.uid, 'favorites', sentenceId.toString());
    const isFav = userFavorites.includes(sentenceId);
    
    try {
      if (isFav) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          sentenceId,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const renderRankDetail = () => {
    const currentCorrect = userStats?.totalCorrect || 0;
    
    return (
      <motion.div
        key="profile-tab"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full max-w-md mx-auto min-h-screen relative overflow-y-auto pb-10 bg-navy-dark safe-area-pb p-6"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(10, 15, 28, 0.9), rgba(10, 15, 28, 0.9)), url("https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english2.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Profile Header */}
        <div className="pt-4 pb-8 flex flex-col items-center">
          <div className="relative mb-6">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute -inset-4 border border-gold/20 rounded-full border-dashed"
            />
            <div className="w-24 h-24 rounded-full border-4 border-gold shadow-[0_0_30px_rgba(212,175,55,0.4)] overflow-hidden relative z-10">
              <img 
                src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 right-0 bg-gold text-ink p-1.5 rounded-full shadow-lg z-20 animate-bounce-slow">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-parchment tracking-tight mb-1 text-center">
            {user?.displayName || "無名修煉者"}
          </h2>
          <div className="flex items-center gap-2 mb-8">
            <span className={`text-sm font-bold uppercase tracking-[0.2em] px-3 py-0.5 rounded-full bg-gold/10 border border-gold/20 ${getCultivationRank(currentCorrect).style.split(' ')[0]}`}>
              {getCultivationRank(currentCorrect).name}
            </span>
          </div>

          {/* Detailed Stats Grid */}
          <div className="w-full grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center gap-1">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 mb-1">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-parchment">
                {userStats?.totalTimeMinutes ? (
                  <>
                    {Math.floor(userStats.totalTimeMinutes / 60) > 0 && `${Math.floor(userStats.totalTimeMinutes / 60)}h `}
                    {userStats.totalTimeMinutes % 60}m
                  </>
                ) : '尚未記錄'}
              </span>
              <span className="text-[9px] text-parchment/30 font-black uppercase tracking-widest">悟道時長</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center gap-1">
              <div className="p-2 bg-green-500/10 rounded-xl text-green-400 mb-1">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-parchment">
                {userStats?.totalCorrect || 0}
              </span>
              <span className="text-[9px] text-parchment/30 font-black uppercase tracking-widest">成功咒語</span>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

          {/* Account Actions */}
          <div className="w-full space-y-3 mb-10">
             <button 
               onClick={handleLogout}
               className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-red-500 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors active:scale-95"
             >
               <LogOut className="w-4 h-4" />
               解除元神綁定 (登出)
             </button>
          </div>

          <div className="w-full flex items-center justify-between px-2 mb-6">
            <h3 className="text-xs font-black text-gold/60 uppercase tracking-[0.4em]">境界圖譜 Ranking</h3>
          </div>
        </div>

        {/* Rank List Rendering */}
        <div className="px-6 space-y-6">
          {cultivationRanks.map((r, i) => {
             const rankPointsReq = [0, 4, 101, 201, 301, 501];
             const isActive = (i === 0 && currentCorrect <= 3) ||
                              (i === 1 && currentCorrect >= 4 && currentCorrect <= 100) || 
                              (i === 2 && currentCorrect >= 101 && currentCorrect <= 200) ||
                              (i === 3 && currentCorrect >= 201 && currentCorrect <= 300) ||
                              (i === 4 && currentCorrect >= 301 && currentCorrect <= 500) ||
                              (i === 5 && currentCorrect >= 501);

             const isCompleted = (i === 0 && currentCorrect > 3) ||
                                 (i === 1 && currentCorrect > 100) ||
                                 (i === 2 && currentCorrect > 200) ||
                                 (i === 3 && currentCorrect > 300) ||
                                 (i === 4 && currentCorrect > 500);

            return (
              <motion.div 
                key={`rank-profile-${i}`}
                className={`p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden ${isActive ? 'bg-white/10 border-gold shadow-[0_0_40px_rgba(212,175,55,0.2)]' : 'bg-white/5 border-white/10'}`}
              >
                 <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${(!isCompleted && !isActive) ? 'blur-[12px] brightness-[0.2] grayscale' : ''}`}>
                    <MistyMountains />
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      {i === 1 && <XuanwuBeast />}
                      {i === 2 && <BaihuBeast />}
                      {i === 3 && <SuzakuBeast />}
                      {i === 4 && <SeiryuBeast />}
                      {i === 5 && <HuanglongBeast />}
                    </div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-2xl font-black ${(!isCompleted && !isActive) ? 'text-white/20' : r.color}`}>
                          {(!isCompleted && !isActive) ? '？？？' : r.name}
                        </span>
                        {isActive && (
                         <motion.div 
                           animate={{ scale: [1, 1.2, 1] }}
                           transition={{ repeat: Infinity, duration: 2 }}
                           className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,1)]"
                         />
                        )}
                      </div>
                      
                      {r.stages && r.stages.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {r.stages.map((s, si) => {
                            const isCurrentStage = currentCorrect >= s.min && currentCorrect <= s.max;
                            const isPastStage = currentCorrect > s.max;
                            const isLocked = !isCompleted && !isActive;
                            return (
                              <div 
                                key={`stage-rank-${i}-stage-${si}-${s.name}`}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold border transition-all ${
                                  isLocked ? 'bg-white/5 border-white/5 text-white/5' :
                                  isCurrentStage 
                                  ? 'bg-gold/20 border-gold text-gold shadow-[0_0_8px_rgba(212,175,55,0.2)]' 
                                  : isPastStage
                                  ? 'bg-green-400/10 border-green-400/20 text-green-400/60'
                                  : 'bg-white/5 border-white/10 text-white/20'
                                }`}
                              >
                                {isLocked ? '？？' : s.name}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-parchment/60 uppercase block tracking-tighter">{r.range}</span>
                      {isActive ? (
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                          目前的境界
                        </span>
                      ) : isCompleted ? (
                        <div className="flex items-center justify-end gap-1 text-green-400">
                          <Trophy className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">達成</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/10 flex items-center justify-end gap-1">
                          <Minus className="w-3 h-3" /> 尚未窺視
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[14px] text-parchment/80 leading-relaxed italic mt-4 relative z-10 transition-all">
                    {(!isCompleted && !isActive) ? (
                      <span className="opacity-20 leading-relaxed">修為不足，天地機緣尚無緣窺見此境界之玄妙...</span>
                    ) : r.desc}
                  </p>

                  {/* Small progress bar for active rank */}
                  {isActive && !isCompleted && (
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentCorrect - (rankPointsReq[i] || 0)) / ((rankPointsReq[i+1] || 800) - (rankPointsReq[i] || 0))) * 100}%` }}
                        className={`h-full ${r.color.replace('text-', 'bg-')}`}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Memoize filtered sentence lists for performance
  const favoritesPool = useMemo(() => 
    sentencesData.filter(s => userFavorites.includes(s.id)),
    [userFavorites]
  );

  const wrongPool = useMemo(() => 
    sentencesData.filter(s => userWrongSentences.includes(s.id)),
    [userWrongSentences]
  );

  const renderSentenceListScreen = (viewType: 'favorites' | 'wrong') => {
    const listIds = viewType === 'favorites' ? userFavorites : userWrongSentences;
    const filteredSentences = viewType === 'favorites' ? favoritesPool : wrongPool;
    const title = viewType === 'favorites' ? "我的最愛" : "封神殘卷";
    const subTitle = viewType === 'favorites' ? "手動收藏的強力咒語" : "修煉失敗的殘破咒語 (錯題庫)";
    const emptyMsg = viewType === 'favorites' ? "目前尚無收藏的咒語" : "目前尚無紀錄，看來閣下的修行相當順利";
    const startBtn = viewType === 'favorites' ? "開始全收藏練習" : "開始殘卷重生試煉";
    const bgUrl = viewType === 'favorites' 
      ? 'https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english3.jfif'
      : 'https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english4.jfif';

    return (
      <motion.div 
        key={viewType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-screen w-full max-w-md mx-auto bg-navy-dark relative shadow-2xl overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 15, 28, 0.4), rgba(10, 15, 28, 0.4)), url("${bgUrl}")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom'
        }}
      >
        {/* Header */}
        <div className="p-6 pt-24 border-b border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif italic text-white flex items-center gap-2">
              {viewType === 'favorites' ? <Heart className="w-6 h-6 text-red-500 fill-red-500" /> : <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />}
              {title}
            </h2>
          </div>
          <p className="text-parchment/40 text-[10px] tracking-widest uppercase font-medium">{subTitle}</p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredSentences.length > 0 ? (
              filteredSentences.map((sentence, idx) => (
                <div 
                  key={`list-${viewType}-${sentence.id}-${idx}-${sentence.english.substring(0, 5)}`}
                  onClick={() => startPractice(filteredSentences.length, viewType, idx)}
                  className="group relative bg-white/0 border border-white/5 p-5 rounded-2xl hover:border-gold/30 transition-all hover:bg-white/5 cursor-pointer active:scale-[0.98] [contain:content] [will-change:transform]"
                >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    {/* Row 1: Spell Name (咒語名稱) */}
                    {sentence.spell_name && (
                      <div className="text-[13px] font-black text-white bg-gold/20 px-2 py-0.5 rounded border border-gold/30 w-fit mb-1 shadow-[0_0_8px_rgba(212,175,55,0.1)]">
                        {sentence.spell_name}
                      </div>
                    )}

                    {/* Row 2: ID. English (編號. 咒語內容) */}
                    <p className="text-gold font-bold text-sm tracking-tight leading-snug">
                       {sentence.id}. {sentence.english}
                    </p>

                    {/* Row 3: Chinese (對照解意) */}
                    <p className="text-parchment/60 text-xs font-serif italic">
                       {sentence.chinese}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      viewType === 'favorites' ? toggleFavorite(sentence.id) : toggleWrongSentence(sentence.id);
                    }}
                    className={`p-2 transition-transform active:scale-75 ${viewType === 'favorites' ? 'text-red-500' : 'text-amber-500'}`}
                  >
                    {viewType === 'favorites' ? (
                      <Heart className="w-5 h-5 fill-red-500" />
                    ) : (
                      <Zap className="w-5 h-5 fill-amber-500" />
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              {viewType === 'favorites' ? <Heart className="w-12 h-12 text-white/5" /> : <Zap className="w-12 h-12 text-white/5" />}
              <p className="text-parchment/40 font-serif italic">{emptyMsg}</p>
              <button 
                onClick={() => navigateTo('start', 'menu')}
                className="text-xs text-gold underline underline-offset-4"
              >
                {viewType === 'favorites' ? '前往練習並點擊愛心收藏' : '繼續修行，殘卷隨緣'}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-navy-dark shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-20">
          <button 
            onClick={() => startPractice(listIds.length, viewType)}
            disabled={listIds.length === 0}
            className={`w-full py-4 rounded-xl text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:brightness-110 disabled:opacity-50 transition-all ${viewType === 'favorites' ? 'bg-red-500 shadow-red-500/20' : 'bg-amber-600 shadow-amber-600/20'}`}
          >
            {startBtn}
          </button>
        </div>
      </motion.div>
    );
  };

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Helper to find the best voice (preferring female voices)
  const getBestVoice = (lang: string) => {
    if (voicesRef.current.length === 0) {
      voicesRef.current = window.speechSynthesis.getVoices();
    }
    const voices = voicesRef.current;
    const femaleVoice = voices.find(v => 
      v.lang.includes(lang) && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'))
    );
    if (femaleVoice) return femaleVoice;
    
    return voices.find(v => v.lang.includes(lang) && v.name.includes('Google')) || 
           voices.find(v => v.lang.includes(lang)) || 
           null;
  };

  const speak = useCallback((text: string, lang: 'zh-TW' | 'en-US', rate: number = 1.0) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.voice = getBestVoice(lang);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  const playGreeting = useCallback(() => {
    if (screen === 'start') {
      speak("小雪的英咒寶典。不教語法，唯手熟爾。", 'zh-TW', 1.0);
    }
  }, [screen, speak]);

  useEffect(() => {
    const handleInteraction = () => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Reliability for Speech Synthesis: Update voices dynamically
  useEffect(() => {
    const updateVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    updateVoices();
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, []);

  // Initialize practice session
  const startPractice = (count: number, mode: PracticeMode = 'full', forceStartIndex: number | null = null) => {
    setPracticeMode(mode);
    setSessionIsRandom(isRandom);
    
    // Apply current unlocked limit to global sentencesData
    let pool = sentencesData.slice(0, unlockedLimit);
    
    // favorites mode
    if (mode === 'favorites') {
      pool = pool.filter(s => userFavorites.includes(s.id));
      if (pool.length === 0) return;
    }

    // wrong mode
    if (mode === 'wrong') {
      pool = pool.filter(s => userWrongSentences.includes(s.id));
      if (pool.length === 0) return;
    }

    // In genealogy mode, only use sentences that have keywords2 defined
    if (mode === 'genealogy') {
      pool = pool.filter(s => s.keywords2 && s.keywords2.length > 0);
      // Fallback if pool is empty
      if (pool.length === 0) pool = [...sentencesData];
    }
    
    let selected: Sentence[] = [];
    if (forceStartIndex !== null && (mode === 'favorites' || mode === 'wrong')) {
      // In specific list mode, start from the selected index and include all others in sequence
      selected = [...pool.slice(forceStartIndex), ...pool.slice(0, forceStartIndex)];
    } else if (isRandom) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      selected = shuffled.slice(0, Math.min(count, shuffled.length));
    } else {
      // Sequential logic
      const startIndex = pool.findIndex(s => s.id >= startId);
      const actualStart = startIndex === -1 ? 0 : startIndex;
      selected = pool.slice(actualStart, actualStart + count);
      
      // If we don't have enough, wrap around
      if (selected.length < count) {
        selected = [...selected, ...pool.slice(0, count - selected.length)];
      }
    }
    
    setCurrentQuestions(selected);
    setQuestionCount(selected.length);
    setCurrentIndex(0);
    navigateTo('practice', startViewState);
    resetQuestionState(selected[0], mode);
    setTotalCorrect(0);

    // Initial save for sequential mode to ensure we track where we started
    if (!isRandom && selected.length > 0) {
      saveSpecifiedProgress(selected[0].id);
    }
  };

  const resetQuestionState = (sentence: Sentence, mode: PracticeMode = practiceMode) => {
    const english = sentence.english;
    
    // Determine which keyword set to use
    const allKeywords = (mode === 'genealogy' && sentence.keywords2 && sentence.keywords2.length > 0) 
      ? sentence.keywords2 
      : sentence.keywords;
      
    const allKeywordsCn = (mode === 'genealogy' && sentence.keywords2_cn && sentence.keywords2_cn.length > 0)
      ? sentence.keywords2_cn
      : sentence.keywords_cn;

    // 1. 找出所有關鍵字在句子中的所有位置
    let occurrences: { word: string, start: number }[] = [];
    allKeywords.forEach(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 使用 \b 確保全字匹配，避免挖錯單字的一部分
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
      let match;
      while ((match = regex.exec(english)) !== null) {
        occurrences.push({ word: match[0], start: match.index });
      }
    });

    // 2. 按位置排序並過濾重疊（以防萬一）
    occurrences.sort((a, b) => a.start - b.start);
    const filteredOccurrences: typeof occurrences = [];
    let lastEnd = -1;
    occurrences.forEach(occ => {
      if (occ.start >= lastEnd) {
        filteredOccurrences.push(occ);
        lastEnd = occ.start + occ.word.length;
      }
    });

    // 3. 決定挖空數量：最多 4 個
    const targetCount = Math.min(4, filteredOccurrences.length);
    
    // 4. 隨機挑選指定數量的位置，然後「再次按位置排序」
    const shuffled = [...filteredOccurrences].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, targetCount).sort((a, b) => a.start - b.start);

    setActiveKeywords(selected.map(s => s.word));
    
    // Map Chinese translations if available
    if (allKeywordsCn) {
      const cnMap: {[key: string]: string} = {};
      allKeywords.forEach((word, idx) => {
        cnMap[word.toLowerCase()] = allKeywordsCn[idx];
      });
      setActiveKeywordsCn(selected.map(s => cnMap[s.word.toLowerCase()] || ""));
    } else {
      setActiveKeywordsCn(new Array(selected.length).fill(""));
    }

    const newArray = new Array(selected.length).fill(null);
    setUserAnswers(newArray);
    answersSyncRef.current = newArray;
    setIsSubmitted(false);
    setBursts([]);
  };

  const handleDrop = (wordIndex: number) => {
    if (isSubmitted) return;
    
    // Use the synchronous ref to find the truly next empty slot
    const currentAnswers = [...answersSyncRef.current];
    const emptyIdx = currentAnswers.findIndex(a => a === null);
    
    if (emptyIdx === -1) return;

    // Update synchronous ref immediately
    currentAnswers[emptyIdx] = wordIndex;
    answersSyncRef.current = currentAnswers;

    // Update state for rendering
    setUserAnswers(currentAnswers);

    // Correctness check for particle effect
    if (activeKeywords[wordIndex].toLowerCase() === activeKeywords[emptyIdx].toLowerCase()) {
      burstCounter++;
      const burstId = `burst-${Date.now()}-${burstCounter}-${Math.random()}`;
      setBursts(current => [...current, { id: burstId, slotIdx: emptyIdx }]);
      setTimeout(() => {
        setBursts(current => current.filter(b => b.id !== burstId));
      }, 1000);
    }

    // Play sound for feedback
    const word = activeKeywords[wordIndex];
    speak(word, 'en-US', speechRate);
  };

  const recordProgress = async (sentenceId: number, isCorrect: boolean) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const progressRef = doc(db, 'users', user.uid, 'sentences', String(sentenceId));
    const wrongRef = doc(db, 'users', user.uid, 'wrong_sentences', String(sentenceId));
    
    try {
      const progressSnap = await getDoc(progressRef);
      
      if (!progressSnap.exists()) {
        await setDoc(progressRef, {
          sentenceId,
          status: isCorrect ? 'mastered' : 'attempted',
          correctCount: isCorrect ? 1 : 0,
          totalAttempts: 1,
          lastUpdated: serverTimestamp()
        });
      } else {
        await updateDoc(progressRef, {
          status: isCorrect ? 'mastered' : progressSnap.data().status,
          correctCount: increment(isCorrect ? 1 : 0),
          totalAttempts: increment(1),
          lastUpdated: serverTimestamp()
        });
      }
      
      // Automatic recording of wrong answers to "Failed Spells" library
      if (!isCorrect) {
        await setDoc(wrongRef, {
          sentenceId,
          recordedAt: serverTimestamp()
        });
      } else {
        // If they get it correct, we can optionaly remove it from wrong database or keep it.
        // User didn't specify removal, but usually corrective learning implies "clearing" failures.
        // For now, let's keep them until they manually clear or we define "mastery" logic.
      }

      await updateDoc(userRef, {
        totalCorrect: increment(isCorrect ? 1 : 0),
        totalAttempted: increment(1),
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to record progress:", error);
    }
  };

  const clearAnswer = (index: number) => {
    if (isSubmitted) return;
    const newAnswers = [...answersSyncRef.current];
    newAnswers[index] = null;
    answersSyncRef.current = newAnswers;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (isSubmitted || activeKeywords.length === 0) return;
    
    // Normalize function based on strict rules
    const normalize = (str: string | null) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
    };

    // Step 1: Length Check
    if (userAnswers.length !== activeKeywords.length) {
      setIsSubmitted(true);
      return;
    }

    // Step 2: Strict Sequential Comparison
    let correctCount = 0;
    let isAllCorrect = true;

    for (let i = 0; i < activeKeywords.length; i++) {
      const answerIndex = userAnswers[i];
      const answerWord = answerIndex !== null ? activeKeywords[answerIndex] : null;
      
      if (normalize(answerWord) === normalize(activeKeywords[i])) {
        correctCount++;
      } else {
        isAllCorrect = false;
      }
    }

    // Final result based on strict literal matching
    if (isAllCorrect) {
      setTotalCorrect(prev => prev + 1);
    }
    setTotalAttempted(prev => prev + 1);
    
    // Record progress to Firebase
    if (user && currentQuestions[currentIndex]) {
      recordProgress(currentQuestions[currentIndex].id, isAllCorrect);
    }
    
    // Check for Breakthrough
    if (isAllCorrect) {
      const newTotal = (userStats?.totalCorrect || 0) + 1;
      const bigThresholds = [{t: 4, n: '練氣'}, {t: 101, n: '築基'}, {t: 201, n: '結丹'}, {t: 301, n: '元嬰'}, {t: 501, n: '化神'}];
      const bigMatch = bigThresholds.find(bt => bt.t === newTotal);
      
      if (bigMatch) {
        setShowBreakthrough({ show: true, name: bigMatch.n, type: 'big' });
      } else {
        // Small Breakthrough Logic
        for (const rank of cultivationRanks) {
          if (rank.stages) {
            const stageMatch = rank.stages.find(s => s.min === newTotal);
            if (stageMatch && stageMatch.min !== rank.stages[0].min) { // Skip the first stage of a rank (that's a big breakthrough)
              setShowBreakthrough({ show: true, name: `${rank.name}${stageMatch.name}`, type: 'small' });
              break;
            }
          }
        }
      }
    }
    
    setIsSubmitted(true);
  };

  const saveSpecifiedProgress = async (id: number) => {
    if (!user || sessionIsRandom) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastSpecifiedId: id,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to save specified progress:", error);
    }
  };

  const nextQuestion = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < currentQuestions.length) {
      setCurrentIndex(nextIdx);
      resetQuestionState(currentQuestions[nextIdx], practiceMode);
      // Save progress if sequential
      if (!sessionIsRandom) {
        saveSpecifiedProgress(currentQuestions[nextIdx].id);
      }
    } else {
      // Completed the set, save the ID after the last one if sequential
      if (!sessionIsRandom) {
        const lastId = currentQuestions[currentIndex].id;
        saveSpecifiedProgress(lastId + 1);
      }
      navigateTo('result', startViewState);
    }
  };

  const retryQuestion = () => {
    // Just clear answers and submission state, keep activeKeywords the same
    const newArray = new Array(activeKeywords.length).fill(null);
    setUserAnswers(newArray);
    answersSyncRef.current = newArray;
    setIsSubmitted(false);
    setBursts([]);
  };

  const speakSentence = () => {
    if (screen !== 'practice' && screen !== 'result') return;
    speak(currentQuestions[currentIndex].english, 'en-US', speechRate);
  };

  // Memoized current question data
  const current = currentQuestions[currentIndex];
  
  const sentenceParts = useMemo(() => {
    if (!current || activeKeywords.length === 0) return [current?.english || ''];
    
    let resultParts: (string | {idx: number})[] = [current.english];

    // 依序處理 activeKeywords，因為它們已經按句子中的位置排好序了
    activeKeywords.forEach((word, idx) => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
      
      // 永遠在最後一個字串片段中尋找下一個關鍵字
      const lastPartIdx = resultParts.length - 1;
      const lastPart = resultParts[lastPartIdx];
      
      if (typeof lastPart === 'string') {
        const match = lastPart.match(regex);
        if (match && match.index !== undefined) {
          const before = lastPart.substring(0, match.index);
          const after = lastPart.substring(match.index + word.length);
          
          // 將最後一個片段拆分為：[之前文字, 挖空索引, 之後文字]
          resultParts.splice(lastPartIdx, 1, before, {idx}, after);
        } else {
          // 如果全字匹配失敗，嘗試簡單匹配
          const simpleRegex = new RegExp(escapedWord, 'i');
          const simpleMatch = lastPart.match(simpleRegex);
          if (simpleMatch && simpleMatch.index !== undefined) {
            const before = lastPart.substring(0, simpleMatch.index);
            const after = lastPart.substring(simpleMatch.index + word.length);
            resultParts.splice(lastPartIdx, 1, before, {idx}, after);
          }
        }
      }
    });

    // 轉換回渲染格式
    return resultParts.map(p => typeof p === 'string' ? p : `__[[${p.idx}]]__`);
  }, [current, activeKeywords]);

  const shuffledKeywords = useMemo(() => {
    if (activeKeywords.length === 0) return [];
    // Use a stable sort seed if needed, but random is okay as long as activeKeywords stays same
    const wordsWithIndices = activeKeywords.map((word, index) => ({ word, index }));
    return [...wordsWithIndices].sort((a, b) => {
      // Create a pseudo-random but stable-per-activeKeywords sort
      const combined = (a.word + a.index + b.word + b.index);
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        hash = (hash << 5) - hash + combined.charCodeAt(i);
        hash |= 0;
      }
      return hash % 2 === 0 ? 1 : -1;
    });
  }, [activeKeywords]);

  // Renderers
      {/* Breadcrumb Navigation Component */}
      const Breadcrumb = ({ items }: { items: { label: string, onClick?: () => void }[] }) => (
        <nav aria-label="breadcrumb" className="w-full flex items-center gap-2 text-[10px] text-parchment/40 uppercase tracking-widest mb-6">
          <button onClick={() => navigateTo('start', 'menu')} className="hover:text-gold transition-colors">Home</button>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="opacity-20">/</span>
              {item.onClick ? (
                <button onClick={item.onClick} className="hover:text-gold transition-colors">{item.label}</button>
              ) : (
                <span className="text-gold/60">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      );

      const renderPatternsMapView = () => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col min-h-screen p-8 w-full max-w-md mx-auto relative z-10"
        >
          <Breadcrumb items={[{ label: 'Patterns' }]} />
          
          <header className="mb-6 text-left space-y-2">
            <h1 className="text-3xl font-black text-gold tracking-tight uppercase">English Pattern Map</h1>
            <p className="text-xs text-parchment/60 leading-relaxed italic">字母索引導覽。點選類別快速尋找 Pattern。</p>
          </header>

          {/* Alpha Selector Dropdown - Custom UI */}
          <div className="mb-8 relative z-30">
            <div 
              onClick={() => setIsAlphaMenuOpen(!isAlphaMenuOpen)}
              className="group relative p-0.5 rounded-[22px] bg-gradient-to-br from-gold/40 via-gold/5 Pro to-gold/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-ink/90 backdrop-blur-xl rounded-[20px] border border-white/5 transition-all group-hover:border-gold/20">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                    <Search className="w-3.5 h-3.5 text-gold" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[9px] text-gold/40 font-black uppercase tracking-[0.2em] leading-none mb-1">Navigation Index</span>
                     <span className="text-[11px] text-parchment font-bold uppercase tracking-widest">字母快速索引</span>
                   </div>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gold/40 font-black uppercase">Current</span>
                    <span className="text-xl font-black text-gold leading-none tracking-tighter">
                      {selectedAlpha || 'ALL'}
                    </span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gold transition-transform duration-300 ${isAlphaMenuOpen ? 'rotate-180' : 'animate-bounce-slow'}`} />
                </div>
              </div>
            </div>

            {/* Custom Dropdown Menu */}
            <AnimatePresence>
              {isAlphaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 5, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 p-2 bg-[#1a1c24]/95 backdrop-blur-2xl border-2 border-gold/30 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] grid grid-cols-4 gap-2 overflow-hidden"
                >
                  <button 
                    onClick={() => { setSelectedAlpha(null); setIsAlphaMenuOpen(false); }}
                    className={`col-span-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${!selectedAlpha ? 'bg-gold text-ink border-gold' : 'bg-white/5 text-parchment/40 border-white/10 hover:border-gold/30'}`}
                  >
                    顯示全部 (Display All)
                  </button>
                  {availableAlphas.map(char => (
                    <button 
                      key={char}
                      onClick={() => { setSelectedAlpha(char); setIsAlphaMenuOpen(false); }}
                      className={`py-3 rounded-xl text-sm font-black transition-all border ${selectedAlpha === char ? 'bg-gold text-ink border-gold' : 'bg-white/5 text-parchment/40 border-white/10 hover:border-gold/30 hover:text-gold'}`}
                    >
                      {char}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-12 pb-20">
            {groupedPatterns
              .filter(([char]) => !selectedAlpha || char === selectedAlpha)
              .map(([char, items]) => (
                <div key={char} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-gold/40">{char}</span>
                    <div className="h-px flex-1 bg-gold/10"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {items.map((pattern) => (
                      <motion.button
                        key={pattern.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPreviewPattern(pattern)}
                        className="aspect-square rounded-2xl border border-gold/20 bg-gold/5 flex items-center justify-center shadow-lg shadow-gold/5 text-center group relative overflow-hidden"
                      >
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-black text-gold uppercase tracking-tighter group-hover:scale-110 transition-transform">{pattern.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Pattern Preview Modal/Overlay */}
          <AnimatePresence>
            {previewPattern && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewPattern(null)}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-[340px] bg-[#21242e] border-2 border-gold/50 rounded-[40px] p-8 space-y-6 shadow-[0_0_60px_rgba(212,175,55,0.2)]"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-left">
                      <div className="text-[10px] text-gold font-black tracking-[0.2em] uppercase opacity-60">Pattern Study</div>
                      <h2 className="text-4xl font-black text-gold uppercase tracking-tighter leading-none">{previewPattern.name}</h2>
                    </div>
                    <div className="bg-gold/20 px-3 py-1.5 rounded-xl border border-gold/30 text-[10px] text-gold font-black">
                      {previewPattern.lessons.length} STAGES
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10 shadow-inner">
                      <p className="text-[11px] text-parchment/80 leading-relaxed text-justify italic">
                        {previewPattern.description}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                       <span className="text-[10px] text-gold font-black uppercase tracking-[0.2em] flex items-center gap-2">
                         <Sparkles className="w-3 h-3 text-gold" /> Preview Lessons
                       </span>
                       <div className="space-y-2">
                         {previewPattern.lessons.slice(0, 2).map((l, i) => (
                           <div key={i} className="text-[11px] bg-gold/5 border border-gold/10 p-4 rounded-2xl text-parchment/60 flex flex-col gap-1">
                             <span className="font-bold text-parchment tracking-tight">{l.english}</span>
                             <span className="opacity-40 text-[10px] uppercase font-black tracking-widest">{l.chinese}</span>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setPreviewPattern(null);
                        navigateTo('pattern_detail', 'menu', false, { pattern: previewPattern.name });
                      }}
                      className="w-full py-4 bg-gold rounded-2xl text-[12px] font-black text-ink uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.3)] transition-all"
                    >
                      <ArrowRight className="w-4 h-4" /> 進入修煉 (Enter)
                    </motion.button>
                    <button 
                      onClick={() => setPreviewPattern(null)}
                      className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black text-parchment/40 uppercase tracking-widest hover:text-parchment transition-all"
                    >
                      返回列表 (Exit)
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );

      const renderPatternDetailView = () => {
        if (!selectedPattern) return null;
        const pattern = patternsData.find(p => p.name === selectedPattern);
        if (!pattern) return null;

        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex flex-col min-h-screen p-6 pt-12 pb-10 w-full max-w-md mx-auto relative z-10"
          >
            <Breadcrumb items={[
              { label: 'Patterns', onClick: () => navigateTo('patterns') },
              { label: pattern.name }
            ]} />

            <header className="mb-10 text-left space-y-4">
              <div className="inline-block px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-[10px] text-gold font-black tracking-[0.2em] uppercase">Teaching Module</div>
              <h1 className="text-4xl font-black text-gold tracking-tighter uppercase">{pattern.name} Pattern Learning</h1>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 italic text-sm text-parchment/70 leading-relaxed">
                {pattern.lessons[0]?.learning_note || '學習此拼寫模式的發音與詞族關聯。'}
              </div>
            </header>

            <section className="space-y-6">
              <h2 className="text-[10px] text-gold font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Library className="w-4 h-4" /> Lesson Curriculum
              </h2>
              <div className="space-y-3">
                {pattern.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => navigateTo('lesson_detail', 'menu', false, { lesson })}
                    className="w-full p-5 rounded-2xl border border-white/5 bg-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="text-[10px] text-gold font-black uppercase tracking-widest">Lesson {idx + 1}</div>
                      <p className="text-sm font-bold text-parchment group-hover:text-gold transition-colors">{lesson.english}</p>
                      <p className="text-xs text-parchment/40">{lesson.chinese}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gold/20 group-hover:text-gold transition-colors" />
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        );
      };

      const renderLessonDetailView = () => {
        if (!selectedLesson) return null;
        
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col min-h-screen p-6 pt-12 pb-10 w-full max-w-md mx-auto relative z-10"
          >
            <Breadcrumb items={[
              { label: 'Patterns', onClick: () => navigateTo('patterns') },
              { label: selectedLesson.pattern || 'Other', onClick: () => navigateTo('pattern_detail', 'menu', false, { pattern: selectedLesson.pattern }) },
              { label: `Lesson ${selectedLesson.id}` }
            ]} />

            <article className="space-y-8">
              <div className="space-y-2">
                <div className="text-[10px] text-gold font-black tracking-[0.4em] uppercase opacity-60">Spell Name: {selectedLesson.spell_name || '未命名咒語'}</div>
                <h1 className="text-3xl font-serif italic text-parchment leading-tight">「{selectedLesson.chinese}」</h1>
              </div>

              <div className="p-6 rounded-[32px] bg-gold/5 border-2 border-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative">
                <div className="absolute top-4 right-6">
                  <button 
                    onClick={() => speak(selectedLesson.english, 'en-US', speechRate)}
                    className="p-3 bg-gold rounded-2xl text-ink shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-90 transition-all"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                   <p className="text-2xl font-bold text-gold notranslate font-serif pr-12">{selectedLesson.english}</p>
                   {selectedLesson.url && (
                     <button 
                       onClick={() => window.open(selectedLesson.url, '_blank')}
                       className="flex items-center gap-2 text-[10px] font-black text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-red-400 hover:text-white transition-all"
                     >
                       <Play className="w-3 h-3 fill-current" /> Watch Short Film
                     </button>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(selectedLesson.keywords2 || selectedLesson.keywords).map((word, idx) => (
                  <button 
                    key={idx}
                    onClick={() => speak(word, 'en-US', speechRate)}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:border-gold/30 hover:bg-gold/5 transition-all group"
                  >
                    <div className="text-lg font-bold text-parchment group-hover:text-gold transition-colors">{word}</div>
                    <div className="text-xs text-parchment/40">{(selectedLesson.keywords2_cn || selectedLesson.keywords_cn)?.[idx] || ''}</div>
                  </button>
                ))}
              </div>

              {selectedLesson.learning_note && (
                <section className="space-y-3">
                  <h2 className="text-[10px] text-gold font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Learning Note 修煉要領
                  </h2>
                  <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-sm text-parchment/70 leading-relaxed text-justify italic">
                    {selectedLesson.learning_note}
                  </div>
                </section>
              )}

              <footer className="pt-10 flex gap-4">
                 <button 
                  onClick={() => navigateTo('pattern_detail', 'menu', false, { pattern: selectedLesson.pattern })}
                  className="flex-1 py-4 bg-white/10 rounded-2xl text-[12px] font-black text-parchment uppercase tracking-widest border border-white/10 hover:bg-white/20"
                 >
                   Back to Program
                 </button>
                 <button 
                  onClick={() => {
                    // Start a micro-practice with just this sentence
                    setCurrentQuestions([selectedLesson]);
                    setCurrentIndex(0);
                    setPracticeMode('full');
                    setIsSubmitted(false);
                    setUserAnswers(new Array(selectedLesson.keywords2?.length || 0).fill(null));
                    setActiveKeywords(selectedLesson.keywords2 || []);
                    setActiveKeywordsCn(selectedLesson.keywords2_cn || []);
                    setScreen('practice');
                  }}
                  className="flex-1 py-4 bg-gold rounded-2xl text-[12px] font-black text-ink uppercase tracking-widest hover:brightness-110 shadow-lg shadow-gold/20"
                 >
                   Enter Trial
                 </button>
              </footer>
            </article>
          </motion.div>
        );
      };

  const renderStartScreen = () => {
    const totalSentences = sentencesData.length;
    const maxDigits = String(totalSentences).length;

    if (startViewState === 'rank_detail') return renderRankDetail();
    if (startViewState === 'practice_hub') return renderPracticeHubScreen();
    if (startViewState === 'favorites_list') return renderSentenceListScreen('favorites');
    if (startViewState === 'wrong_list') return renderSentenceListScreen('wrong');
    if (startViewState === 'app_guide') return renderAppGuideScreen();
    if (startViewState === 'how_it_works') return renderInsightsScreen();
    if (startViewState === 'about') return renderAboutScreen();
    
    // Pattern SEO Views
    if (screen === 'patterns') return renderPatternsMapView();
    if (screen === 'pattern_detail') return renderPatternDetailView();
    if (screen === 'lesson_detail') return renderLessonDetailView();

    if (startViewState === 'menu') {
      return (
        <motion.div 
          key="start-home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col w-full max-w-md mx-auto relative overflow-y-auto overflow-x-hidden safe-area-pb pb-4"
          style={{
            backgroundImage: 'linear-gradient(rgba(10, 15, 28, 0.6), rgba(10, 15, 28, 0.6)), url("https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english.jfif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Banner Section */}
          <div className="relative h-64 overflow-hidden">
            <MistyMountains />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-dark/40 to-navy-dark" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-12 opacity-30 flex items-center justify-center pointer-events-none"
                >
                  <Sparkles className="w-40 h-40 text-gold" />
                </motion.div>
                <div className="absolute -inset-8 bg-gold/10 blur-3xl rounded-full animate-pulse" />
                <h1 className="text-4xl font-black text-gold font-serif italic tracking-tight leading-none mb-2">
                  小雪的<br/>英咒寶典
                </h1>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-12 bg-gold/30 rounded-full" />
                  <span className="text-[10px] text-gold/60 font-black uppercase tracking-[0.4em]">Essential Spells</span>
                  <div className="h-0.5 w-12 bg-gold/30 rounded-full" />
                </div>
              </motion.div>
            </div>
          </div>

          <div className="px-6 space-y-8 relative z-10 -mt-14 pb-4 text-center">
            {/* Branding / Slogan Section */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex flex-col items-center gap-0">
                <motion.div 
                  animate={{ 
                    opacity: [0.3, 1, 0.3],
                    scale: [0.85, 1.3, 0.85]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-gold text-xl font-serif italic tracking-[0.2em] px-6 py-2"
                >
                  — 不教語法，唯手熟爾 —
                </motion.div>
              </div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </div>

            {/* Core Stats Grid (Restored to original side-by-side size) */}
            <div className="grid grid-cols-2 gap-4">
               <button 
                  onClick={() => navigateTo('start', 'rank_detail')}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-5 flex flex-col items-center justify-center gap-3 shadow-2xl relative overflow-hidden group active:scale-95 transition-all text-center h-full"
               >
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-gold/40 font-black uppercase tracking-[0.2em]">修煉境界</span>
                    <span className={`text-lg font-black font-serif italic leading-tight ${getCultivationRank(userStats?.totalCorrect || 0).style.split(' ')[0]}`}>
                      {getCultivationRank(userStats?.totalCorrect || 0).name}
                    </span>
                  </div>
               </button>

               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-5 flex flex-col items-center justify-center gap-3 shadow-2xl relative overflow-hidden group h-full">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-parchment/40 font-black uppercase tracking-[0.2em]">靈識廣度</span>
                    <span className="text-xl font-black text-parchment">
                      {unlockedLimit}<span className="text-[10px] text-parchment/30"> / 800</span>
                    </span>
                  </div>
                  {unlockedLimit < 800 && (
                    <button 
                      onClick={handleWatchAd}
                      className="mt-1 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[8px] font-black uppercase tracking-widest hover:bg-gold/20 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Video className="w-2.5 h-2.5" />
                      冥想參悟
                    </button>
                  )}
               </div>
            </div>

            <div className="pt-2">
               <p className="text-[10px] text-parchment/20 font-black uppercase tracking-[0.4em]">
                 道友，今日準備好繼續參悟仙術奧秘了嗎？
               </p>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const renderPracticeHubScreen = () => {
    const totalSentences = sentencesData.length;
    const maxDigits = String(totalSentences).length;

    return (
      <motion.div 
        key="start-practice-hub"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col min-h-screen w-full max-w-md mx-auto relative overflow-y-auto overflow-x-hidden safe-area-pb bg-navy-dark"
      >
        {/* Simple Header */}
        <div className="p-6 pt-12 space-y-2">
           <div className="flex items-center gap-3">
             <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 text-gold">
               <Zap className="w-6 h-6 fill-current" />
             </div>
             <div>
               <h2 className="text-2xl font-black text-parchment tracking-tighter uppercase leading-none">修煉中心</h2>
               <p className="text-[10px] text-gold/40 font-bold uppercase tracking-[0.3em] mt-1">Training & Mastery</p>
             </div>
           </div>
        </div>

        <div className="px-6 space-y-8 pb-10">
          {/* Main Practice System Box */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-gold/40 uppercase tracking-[0.2em]">驟解全咒語系統</h2>
            </div>

            <div className="bg-navy-light/60 border border-white/5 rounded-[32px] p-6 space-y-6 shadow-3xl">
              {/* Mode Toggle Tab */}
              <div className="flex bg-ink/50 p-1.5 rounded-[20px] border border-white/5">
                <button 
                  onClick={() => setIsRandom(true)}
                  className={`flex-1 py-3 px-4 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isRandom ? 'bg-gold text-ink shadow-lg shadow-gold/20' : 'text-parchment/30 hover:text-parchment/60'}`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  隨機修煉
                </button>
                <button 
                  onClick={() => setIsRandom(false)}
                  className={`flex-1 py-3 px-4 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!isRandom ? 'bg-gold text-ink shadow-lg shadow-gold/20' : 'text-parchment/30 hover:text-parchment/60'}`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  指定序號
                </button>
              </div>

              {/* Slider for Sequential Mode */}
              <AnimatePresence mode="wait">
                {!isRandom && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-2 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] text-parchment/40 font-black uppercase tracking-widest">起始卷軸</span>
                      <span className="text-xl font-black text-gold">#{String(startId).padStart(maxDigits, '0')}</span>
                    </div>
                    <div className="relative px-2">
                      <div className="absolute inset-y-0 left-0 right-0 h-1 my-auto bg-white/5 rounded-full" />
                      <input 
                        type="range"
                        min="1"
                        max={Math.min(totalSentences, unlockedLimit)}
                        value={startId}
                        onChange={(e) => setStartId(parseInt(e.target.value))}
                        className="w-full relative z-10 h-1 rounded-full appearance-none bg-transparent cursor-pointer accent-gold"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Big Action Buttons */}
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => startPractice(questionCount, 'full')}
                  className="group relative h-20 bg-gradient-to-r from-gold/20 to-gold/5 border-2 border-gold/40 rounded-[24px] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-gold/5"
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="relative flex items-center justify-between px-6 h-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center border border-gold/40 text-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xl font-black text-gold tracking-tighter uppercase leading-none mb-1">咒語全解</span>
                        <span className="text-[10px] text-gold/40 font-black uppercase tracking-[0.2em]">Universal Spells</span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gold/40 group-hover:text-gold transition-colors" />
                  </div>
                </button>

                <button 
                  onClick={() => startPractice(questionCount, 'genealogy')}
                  className="group relative h-20 bg-gradient-to-r from-white/10 to-transparent border border-white/10 rounded-[24px] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                >
                  <div className="relative flex items-center justify-between px-6 h-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-parchment/60">
                        <Library className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-xl font-black text-parchment tracking-tighter uppercase leading-none mb-1">咒語系譜</span>
                        <span className="text-[10px] text-parchment/30 font-black uppercase tracking-[0.2em]">Genealogy Spells</span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-parchment/20 group-hover:text-parchment/40 transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          </section>

          <section className="pt-4 text-center">
             <p className="text-[10px] text-parchment/20 font-black uppercase tracking-[0.4em]">修行系統核心模組</p>
          </section>
        </div>
      </motion.div>
    );
  };

  const renderInsightsScreen = () => {
    return (
      <motion.div 
        key="insights"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col min-h-screen w-full max-w-md mx-auto p-6 pt-12 space-y-8 bg-navy-dark relative z-10 border-x border-white/5 safe-area-pb"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20 text-gold">
               <Compass className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-2xl font-black text-parchment tracking-tighter uppercase leading-none">悟道中心</h2>
               <p className="text-[10px] text-gold/40 font-bold uppercase tracking-[0.3em] mt-1">Insights & Collection</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 pb-10">
          {/* Quick Access Grid */}
          <section className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigateTo('start', 'favorites_list')}
              className="p-6 bg-red-500/5 border border-red-500/10 rounded-[32px] flex flex-col items-center gap-3 transition-all active:scale-95 hover:bg-red-500/10 hover:border-red-500/20"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-black text-parchment/80">我的最愛</span>
                <span className="text-[9px] text-parchment/40 font-bold uppercase tracking-widest">{userFavorites.length} 卷咒語</span>
              </div>
            </button>
            <button 
              onClick={() => navigateTo('start', 'wrong_list')}
              className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[32px] flex flex-col items-center gap-3 transition-all active:scale-95 hover:bg-amber-500/10 hover:border-amber-500/20"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-black text-parchment/80">封神殘卷</span>
                <span className="text-[9px] text-parchment/40 font-bold uppercase tracking-widest">{userWrongSentences.length} 卷殘卷</span>
              </div>
            </button>
          </section>

          {/* PWA/Ad Promotion */}
          {unlockedLimit < 800 && (
            <div className="relative group overflow-hidden p-8 rounded-[36px] border-2 border-gold/30 bg-gold/5 flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-gold rounded-2xl text-ink">
                    <Video className="w-6 h-6" />
                 </div>
                 <div className="flex flex-col items-start gap-1">
                  <span className="text-xl font-black text-gold uppercase tracking-tighter">冥想參悟</span>
                  <p className="text-[10px] text-gold/60 font-bold uppercase tracking-widest leading-none">解鎖 10 卷新的仙術咒語</p>
                </div>
              </div>
              
              <p className="text-xs text-parchment/50 leading-relaxed italic">
                透過短暫的冥想（觀看影像），可以擴張您的靈識範圍，進一步參悟更深奧的咒語卷軸。
              </p>

              <button 
                onClick={handleWatchAd}
                className="w-full py-4 rounded-2xl bg-gold text-ink font-black text-xs uppercase tracking-widest shadow-lg shadow-gold/20 active:scale-95 transition-all text-center"
              >
                開始冥想
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-white/5 opacity-30">
            <p className="text-[10px] text-center uppercase tracking-[0.2em] font-bold">
              靈識收藏與修煉紀錄系統
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderPracticeScreen = () => {
    if (!current) return null;

    // Optimization: Group bursts by slotIdx once per render
    const burstsBySlot: Record<number, { id: string; slotIdx: number }[]> = {};
    bursts.forEach(b => {
      if (!burstsBySlot[b.slotIdx]) burstsBySlot[b.slotIdx] = [];
      burstsBySlot[b.slotIdx].push(b);
    });

    return (
      <motion.div 
        key="practice-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen pb-10 w-full max-w-md mx-auto border-x border-white/5 shadow-2xl relative will-change-transform"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 28, 0.5), rgba(10, 15, 28, 0.5)), url("https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Header */}
        <div className="p-4 text-center border-b border-gold/10 sticky top-0 z-20 bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-gold/80 bg-gold/5 px-3 py-1 rounded-full border border-gold/10 whitespace-nowrap">第 {currentIndex + 1} 題</span>
            
            {/* Speech Rate Slider - Moved here to save space */}
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <div className="text-[16px] font-bold uppercase tracking-[0.1em] text-gold/60">語速：{speechRate.toFixed(1)}x</div>
              <div className="w-full flex items-center gap-1.5">
                <input 
                  type="range" 
                  min="0.3" 
                  max="1.2" 
                  step="0.1" 
                  value={speechRate} 
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>
            </div>

            <button 
              onClick={() => setShowCancelConfirm(true)}
              className="text-[16px] uppercase tracking-[0.1em] text-red-400 hover:text-white hover:bg-red-500/20 transition-all font-black border-2 border-red-400/30 px-3 py-1.5 rounded-lg active:scale-95 whitespace-nowrap"
            >
              取消試煉
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 w-full flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Translation Box */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center px-2"
            >
              {current.spell_name && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-px w-8 bg-gold/30" />
                  <span className="text-[10px] text-gold font-black tracking-[0.4em] uppercase opacity-80">
                    {current.spell_name}
                  </span>
                  <div className="h-px w-8 bg-gold/30" />
                </div>
              )}
              <h2 className="font-serif text-xl font-light italic leading-relaxed text-parchment opacity-90 inline-block">
                {user && (
                  <div className="mr-2 inline-flex items-center gap-2 align-middle">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => toggleFavorite(current.id)}
                    >
                      <Heart 
                        className={`w-6 h-6 transition-all ${userFavorites.includes(current.id) ? 'text-red-500 fill-red-500' : 'text-[#FFD700] drop-shadow-sm'}`} 
                      />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => toggleWrongSentence(current.id)}
                    >
                      <Zap 
                        className={`w-6 h-6 transition-all ${userWrongSentences.includes(current.id) ? 'text-amber-500 fill-amber-500' : 'text-[#FFD700] drop-shadow-sm opacity-40'}`} 
                      />
                    </motion.button>
                  </div>
                )}
                {current.id}. 「{current.chinese}」
                {current.url && (
                  <button 
                    onClick={() => window.open(current.url, '_blank')}
                    className="inline-flex items-center gap-1 align-middle ml-2 text-[14px] text-red-500/90 border-2 border-red-500/30 px-2 py-0.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all font-black tracking-widest uppercase shadow-md shadow-red-500/5 active:scale-95 whitespace-nowrap"
                  >
                    <Play className="w-3 h-3 fill-red-500" /> 觀看短片
                  </button>
                )}
              </h2>
            </motion.div>



            {/* Spell Area */}
            <div className="notranslate font-serif text-xl leading-[1.8] text-gold text-center px-2 drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] relative z-10">
              {sentenceParts.map((part, i) => {
                const match = part.match(/__\[\[(\d+)\]\]__/);
                if (match) {
                  const idx = parseInt(match[1]);
                  const answerIndex = userAnswers[idx];
                  const answerWord = answerIndex !== null ? activeKeywords[answerIndex] : null;
                  
                  const isCorrect = isSubmitted && answerWord?.trim().toLowerCase() === activeKeywords[idx]?.trim().toLowerCase();
                  const isWrong = isSubmitted && answerWord !== null && answerWord?.trim().toLowerCase() !== activeKeywords[idx]?.trim().toLowerCase();
                  
                  // Find the first empty slot to highlight it
                  const firstEmptyIdx = userAnswers.findIndex(a => a === null);
                  const isActive = !isSubmitted && idx === firstEmptyIdx;

                  return (
                    <motion.span 
                      key={`sentence-slot-${current?.id || 'q'}-${idx}-pos-${i}`}
                      whileTap={!isSubmitted ? { scale: 0.95 } : {}}
                      onClick={() => !isSubmitted && userAnswers[idx] !== null && clearAnswer(idx)}
                      className={`inline-block min-w-[100px] h-10 border-b-2 mx-1 px-2 transition-all duration-300 align-middle cursor-pointer relative group ${
                        isCorrect ? 'bg-gold text-ink rounded font-sans text-lg font-bold border-none shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 
                        isWrong ? 'bg-red-500 text-white rounded font-sans text-lg font-bold border-none' : 
                        isActive ? 'border-gold bg-gold/20 ring-2 ring-gold/50 ring-offset-2 ring-offset-navy-dark animate-pulse' :
                        'border-gold/40 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {/* Particle Eruption Effect */}
                      <AnimatePresence>
                        {(burstsBySlot[idx] || []).map((b, bi) => (
                          <div key={`burst-wrapper-${b.id}-${idx}-${bi}`} className="absolute inset-x-0 -top-4 -bottom-4 pointer-events-none flex items-center justify-center z-[100]">
                            {[...Array(6)].map((_, pi) => (
                              <motion.div
                                key={`burst-particle-${b.id}-${pi}`}
                                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                animate={{ 
                                  scale: [0, 1.5, 0],
                                  x: (Math.random() - 0.5) * 100,
                                  y: (Math.random() - 0.5) * 100,
                                  opacity: [1, 1, 0]
                                }}
                                transition={{ duration: 1.0, ease: "easeOut" }}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_#FFD700]"
                              />
                            ))}
                            <motion.div
                               initial={{ opacity: 1, scale: 0.8 }}
                               animate={{ opacity: 0, scale: 2.5 }}
                               transition={{ duration: 0.6 }}
                               className="absolute inset-0 border-4 border-yellow-400 rounded-full blur-[1px]"
                            />
                          </div>
                        ))}
                      </AnimatePresence>

                      <span className="flex items-center justify-center h-full">
                        {answerWord || ''}
                      </span>
                      {!isSubmitted && userAnswers[idx] !== null && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <RotateCcw className="w-3 h-3" />
                        </div>
                      )}
                    </motion.span>
                  );
                }
                return <span key={`sentence-static-${current?.id || 'q'}-idx-${i}`} className="whitespace-pre-wrap">{part}</span>;
              })}
            </div>
          </div>

          {/* Word Bank */}
          {!isSubmitted && (
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <p className="text-base text-gold font-bold whitespace-nowrap">請依序點擊單字填入</p>
                <p className="text-sm text-parchment/60 uppercase tracking-widest font-medium">點擊已填入的空格可清除重填</p>
              </div>
              <div className="notranslate grid grid-cols-2 gap-2 bg-black/30 p-3 rounded-[20px]">
                {shuffledKeywords.map((item, i) => {
                  const isUsed = userAnswers.includes(item.index);
                  return (
                    <motion.button
                      key={`wb-btn-${current?.id || 'q'}-${item.index}-at-${i}`}
                      whileHover={!isUsed ? { scale: 1.02 } : {}}
                      whileTap={!isUsed ? { scale: 0.98 } : {}}
                      onClick={() => !isUsed && handleDrop(item.index)}
                      disabled={isUsed}
                      className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg font-bold transition-all ${
                        isUsed 
                        ? 'bg-white/10 text-parchment/20 border-none opacity-30 pointer-events-none' 
                        : 'bg-parchment text-ink border-b-2 border-[#C4B9A3] active:border-none active:translate-y-[1px]'
                      }`}
                    >
                      <span className="text-lg leading-tight">{item.word}</span>
                      {activeKeywordsCn[item.index] && (
                        <span className="text-[14px] opacity-70 font-medium leading-none -mt-0.5">{activeKeywordsCn[item.index]}</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Pattern & Learning Note - Added as requested by user to increase content and clarity */}
              {current && (current.pattern || current.learning_note) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                    <Sparkles className="w-10 h-10 text-gold" />
                  </div>
                  
                  {current.pattern && (
                    <div className="flex items-center gap-2">
                       <div className="px-1.5 py-0.5 rounded bg-gold/20 text-[10px] text-gold font-black uppercase tracking-widest border border-gold/30">拼寫模式</div>
                       <div className="text-xs text-gold font-bold italic">{current.pattern}</div>
                    </div>
                  )}

                  {current.learning_note && (
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-parchment/30 uppercase tracking-[0.2em] font-black">修煉要領</div>
                      <div className="text-[12px] text-parchment/80 leading-relaxed text-justify font-medium italic">
                        {current.learning_note}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* Result Feedback */}
          {isSubmitted && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6 pb-4"
            >
              {/* Pronunciation Review Area */}
              <div className="space-y-3">
                <p className="text-[10px] text-gold/60 font-bold uppercase tracking-[0.2em]">點擊單字練習發音</p>
                <div className="notranslate grid grid-cols-2 gap-2 bg-black/30 p-3 rounded-[20px]">
                  {activeKeywords.map((word, idx) => (
                    <motion.button
                      key={`rev-s${current?.id}-${idx}-${word}-${current?.english.substring(0, 3)}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => speak(word, 'en-US', speechRate)}
                      className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg font-bold bg-white/5 border border-white/10 text-parchment hover:border-gold/50 hover:bg-white/10 transition-all"
                    >
                      <span className="text-lg leading-tight">{word}</span>
                      {activeKeywordsCn[idx] && (
                        <span className="text-[14px] opacity-70 font-medium leading-none -mt-0.5">{activeKeywordsCn[idx]}</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Pattern & Learning Note - Re-displayed in result screen for reinforcement and AdSense content */}
              {current && (current.pattern || current.learning_note) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                    <Sparkles className="w-10 h-10 text-gold" />
                  </div>
                  
                  {current.pattern && (
                    <div className="flex items-center gap-2">
                       <div className="px-1.5 py-0.5 rounded bg-gold/20 text-[10px] text-gold font-black uppercase tracking-widest border border-gold/30">拼寫模式</div>
                       <div className="text-xs text-gold font-bold italic">{current.pattern}</div>
                    </div>
                  )}

                  {current.learning_note && (
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-parchment/30 uppercase tracking-[0.2em] font-black">修煉要領</div>
                      <div className="text-[12px] text-parchment/80 leading-relaxed text-justify font-medium italic">
                        {current.learning_note}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex justify-center gap-4">
                <button 
                  onClick={retryQuestion}
                  className="flex-1 py-3 rounded-2xl bg-white/5 text-parchment font-bold text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                >
                  重新修煉
                </button>
                <button 
                  onClick={nextQuestion}
                  className="flex-1 py-3 rounded-2xl bg-gold text-ink font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-gold/20"
                >
                  下一題
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-navy-dark/90 backdrop-blur-md border-t border-white/5 flex justify-center gap-2 z-30">
          {!isSubmitted ? (
            <>
              <button 
                onClick={() => setUserAnswers(new Array(activeKeywords.length).fill(null))}
                className="p-3 rounded-xl bg-white/5 text-parchment/40 hover:bg-white/10 transition-all border border-white/10"
                title="重置"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={speakSentence}
                className="p-3 rounded-xl bg-white/5 text-gold hover:bg-white/10 transition-all border border-gold/20 flex items-center justify-center"
                title="播放整句"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSubmit}
                disabled={userAnswers.some(a => a === null)}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${
                  userAnswers.some(a => a === null) 
                  ? 'bg-white/5 text-parchment/20 cursor-not-allowed border border-white/5' 
                  : 'bg-gold text-ink hover:brightness-110 shadow-gold/20 active:scale-95'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> 送出修煉
              </button>
            </>
          ) : (
            <button 
              onClick={speakSentence}
              className="w-full py-3 rounded-xl bg-white/5 text-gold font-bold text-xs uppercase tracking-widest border border-gold/30 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" /> 聆聽完整咒語
            </button>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div 
              key="cancel-confirm-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-navy-dark/90 backdrop-blur-sm"
            >
              <motion.div 
                key="cancel-confirm-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-navy-light border-2 border-gold/30 p-8 rounded-[32px] w-full max-w-xs text-center space-y-6 shadow-2xl"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-serif italic text-gold">中斷修煉？</h3>
                  <p className="text-sm text-parchment/60">當前的進度將會遺失，你確定要離開試煉嗎？</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      if (!sessionIsRandom && currentQuestions[currentIndex]) {
                        saveSpecifiedProgress(currentQuestions[currentIndex].id);
                      }
                      setShowCancelConfirm(false);
                      navigateTo('result', startViewState);
                    }}
                    className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                  >
                    確定取消
                  </button>
                  <button 
                    onClick={() => setShowCancelConfirm(false)}
                    className="w-full py-3 rounded-xl bg-gold text-ink font-bold text-sm hover:brightness-110 transition-all"
                  >
                    繼續試煉
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderResultScreen = () => {
    const score = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const totalWrong = totalAttempted - totalCorrect;
    
    return (
      <motion.div 
        key="result-summary-screen"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 text-parchment w-full max-w-md mx-auto border-x border-white/5 relative will-change-transform"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 28, 0.5), rgba(10, 15, 28, 0.5)), url("https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="space-y-6 w-full max-w-sm scale-90 md:scale-100 transition-transform">
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-8 bg-gold/10 rounded-full blur-3xl"
            />
            <Trophy className="w-20 h-20 text-gold relative z-10 mx-auto drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-serif italic text-gold">修煉完成！</h1>
            <p className="text-parchment/60 uppercase tracking-widest text-[10px]">本次修煉成果統計</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-6 rounded-[40px] border border-white/10 w-full space-y-4 shadow-2xl">
            <div className="text-5xl font-black text-gold">{score}%</div>
            <p className="text-[9px] font-bold text-parchment/40 uppercase tracking-[0.3em]">準確率</p>
            
            <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className="h-full bg-gold shadow-[0_0_8px_var(--color-gold)]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col items-center">
                <span className="text-gold font-bold text-lg">{totalCorrect}</span>
                <span className="text-[9px] text-parchment/40 uppercase tracking-tighter">成功</span>
              </div>
              <div className="flex flex-col items-center border-x border-white/10">
                <span className="text-red-400 font-bold text-lg">{totalWrong}</span>
                <span className="text-[9px] text-parchment/40 uppercase tracking-tighter">失敗</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-parchment font-bold text-lg">{totalAttempted}</span>
                <span className="text-[9px] text-parchment/40 uppercase tracking-tighter">總計練習</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setTotalAttempted(0);
              setTotalCorrect(0);
              if (practiceMode === 'favorites') {
                navigateTo('start', 'favorites_list');
              } else if (practiceMode === 'wrong') {
                navigateTo('start', 'wrong_list');
              } else {
                navigateTo('start', 'menu');
              }
            }}
            className="w-full py-4 rounded-xl bg-gold text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-gold/20"
          >
            {practiceMode === 'favorites' ? '返回我的最愛' : 
             practiceMode === 'wrong' ? '返回封神殘卷' : 
             '返回主頁'}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderPrivacyScreen = () => {
    return (
      <motion.div 
        key="privacy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen w-full max-w-md mx-auto p-6 pt-20 space-y-6 bg-navy-dark relative z-10 border-x border-white/5"
      >
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <h1 className="text-xl font-serif italic text-gold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            法典律令與隱私守則 (Privacy Policy)
          </h1>
        </div>

        <div className="text-[13px] text-parchment/70 leading-relaxed font-sans space-y-5 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar pb-10">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wider">一、修煉數據收集 (Data Collection)</h2>
            <p className="pl-2">此系統使用 Firebase 作為後端服務，可能會收集以下修煉數據：</p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-parchment/60">
              <li>使用者登入資訊（Google 帳號基本資料）</li>
              <li>修煉紀錄（境界進度、收藏、心魔紀錄等）</li>
              <li>基本裝置資訊（用於系統優化）</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wider">二、數據使用目的 (Usage Purpose)</h2>
            <ul className="list-disc list-inside space-y-1 pl-4 text-parchment/60">
              <li>維持系統修煉功能正常運作</li>
              <li>記錄個人化設定與修煉境界</li>
              <li>優化體驗與法典效能</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wider">三、資料保護與安全 (Data Security)</h2>
            <p className="pl-2">我們採取合理的技術措施保護您的資訊，避免未經授權的存取或洩漏。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wider">四、資料分享與第三方 (Data Sharing)</h2>
            <p className="pl-2">不會出售或出租個人資料。但在以下情況可能會使用或揭露：符合法律要求或保障本系統安全。</p>
            <p className="mt-2 p-3 bg-gold/5 border border-gold/10 rounded-lg italic text-[12px]">
              此法典可能使用 Google AdSense 顯示內容廣告，這些服務可能會使用 Cookie 提供相關內容。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wider">五、Cookie 與追蹤技術 (Tracking)</h2>
            <p className="pl-2">使用 Cookie 來記住偏好、分析流量並提供適合的廣告。使用者可於瀏覽器調整設定。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wider">六、使用者權利 (User Rights)</h2>
            <p className="pl-2">如需刪除帳號或資料，請透過聯絡方式聯繫我們。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wider">七、政策更新 (Policy Updates)</h2>
            <p className="pl-2">本政策可能依需求更新，更新後將公告於本頁面。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wider">八、聯絡方式 (Contact Us)</h2>
            <div className="pl-2 flex flex-col gap-0.5">
              <p className="text-gold font-bold text-sm">Email：</p>
              <p className="text-gold/80 font-mono text-[13px] break-all leading-tight tracking-tight">xiaoxueaiworld@gmail.com</p>
            </div>
          </section>

          <div className="text-[10px] text-parchment/20 uppercase tracking-widest pt-6 opacity-50">
            最後更新日期：2026 年
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => navigateTo('start', 'menu')}
            className="w-full py-4 rounded-xl bg-gold text-ink font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            返回主頁
          </button>
        </div>
      </motion.div>
    );
  };

  const renderHowItWorksScreen = () => {
    return (
      <motion.div 
        key="how_it_works"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="flex flex-col min-h-screen w-full max-w-md mx-auto p-6 pt-20 space-y-6 bg-navy-dark relative z-10 border-x border-white/5"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 28, 0.92), rgba(10, 15, 28, 0.92)), url("https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <h1 className="text-xl font-serif italic text-gold flex items-center gap-3">
            <Compass className="w-7 h-7" />
            修行引導與修煉心法 (Practice Guide)
          </h1>
        </div>

        {/* Content Scroll Area */}
        <div className="notranslate text-[13px] text-parchment/70 leading-relaxed font-sans space-y-8 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar pb-10">
          
          {/* 1. 核心簡介 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">📌 核心簡介 (Core Introduction)</h2>
            <p className="pl-3 text-justify">
              小雪的英咒寶典是一款結合修仙世界觀與語言學習方法的英語修煉法典。系統以「咒語 (句子)」為核心單位，透過結構拆解、填空重構與語音輔助，讓修煉者在語境中理解英文，逐步建立語感與實際應用能力。
            </p>
          </section>

          {/* 2. 產品定位 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">🧩 產品定位 (Positioning)</h2>
            <p className="pl-3 text-justify">
              本系統將英語句子視為「可解析的結構」，而非單純記憶的內容。每一句話都可被拆解、觀察與重組，學習過程強調理解與運用，而非背誦。
            </p>
          </section>

          {/* 3. 學習機制 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">🧠 學習機制 (Learning Mechanism)</h2>
            
            <div className="space-y-4 pl-3">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold italic flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  1. 單字難度與出現頻率分級
                </h3>
                <p className="text-[12px] opacity-80 leading-relaxed">
                  系統依據單字在語言中的出現頻率與使用難度進行分級，從基礎到進階，建立穩定的學習路徑。透過此機制，學習者能從高頻單字建立信心，逐步接觸複雜語句，避免負荷過重。
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold italic flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  2. 字根與詞族聯想 (Word Families)
                </h3>
                <p className="text-[12px] opacity-80 leading-relaxed">
                  透過字根 (Root) 與發音規律 (Phonetic Pattern)，將相關單字組織為詞族，讓學習從單點轉為網狀理解。例如以 <span className="text-gold font-bold">ear</span> 為核心：ear, hear, clear, near, bear，強化聲音與文字的對應。
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold italic flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  3. 目標導向修煉 (Targeted Learning)
                </h3>
                <p className="text-[12px] opacity-80 leading-relaxed">
                  本系統確保每一句「咒語」都有其獨特的教學目標。每道題目皆標註了 <span className="text-gold font-bold">拼寫模式 (Pattern)</span> 與 <span className="text-gold font-bold">修煉要領 (Learning Note)</span>，讓修煉者清楚掌握該句的核心規律（如：發音押韻、詞族結構）與學習重點，使修煉目的更顯著，杜絕無效率的重複練習。
                </p>
              </div>
            </div>
          </section>

          {/* 4. 核心練習方式 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">✍️ 核心練習方式 (Practice Method)</h2>
            <div className="pl-3 space-y-2">
              <h3 className="text-sm font-bold text-gold italic">輸出重構填空 (Output Reconstruction)</h3>
              <p className="text-[12px] opacity-80 leading-relaxed">
                系統挖空關鍵單字，要求學習者依據語境判斷。這需要理解句意、辨識語法與主動思考，能有效建立穩定的語言輸出能力。
              </p>
            </div>
          </section>

          {/* 5. 語音與聽力系統 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">🔊 語音與聽力系統 (Audio System)</h2>
            <div className="pl-3 space-y-2">
              <h3 className="text-sm font-bold text-gold italic">即時語音回饋 (TTS)</h3>
              <p className="text-[12px] opacity-80 leading-relaxed">
                所有單字與句子皆提供語音支援，建立發音、拼字與語意之間的連結。
              </p>
            </div>
          </section>

          {/* 6. 練習範例 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">📘 練習範例 (Practice Examples)</h2>
            
            <div className="space-y-4 pl-3">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <p className="text-[11px] text-parchment/40 uppercase tracking-widest font-black">範例一：句型理解</p>
                <div className="text-sm font-medium text-parchment/90 leading-tight">
                  With my own <span className="text-gold">ears</span> I clearly heard the heart beat of the <span className="text-gold">nuclear</span> bomb.
                </div>
                <p className="text-[11px] text-parchment/50">我親耳清楚地聽到原子彈的心臟的跳動。</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <p className="text-[11px] text-parchment/40 uppercase tracking-widest font-black">範例二：詞族與發音 (ear 規律)</p>
                <div className="text-sm font-medium text-parchment/90 leading-tight">
                  Next <span className="text-gold">year</span> the bearded <span className="text-gold">bear</span> will <span className="text-gold">bear</span> a <span className="text-gold">dear</span> baby in the <span className="text-gold">rear</span>.
                </div>
                <p className="text-[11px] text-parchment/50">明年，長鬍子的熊將在後方產一頭可愛的小崽。</p>
              </div>
            </div>
          </section>

          {/* 7. 修煉與進度系統 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">🏆 修煉與進度系統 (Ranking System)</h2>
            <div className="pl-3 space-y-3">
              <div>
                <h4 className="text-[12px] font-bold text-gold italic">● 境界分級</h4>
                <p className="text-[11px] opacity-70">凡人 → 練氣 → 築基 → 結丹 → 元嬰 → 化神</p>
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-gold italic">● 成就與解鎖</h4>
                <p className="text-[11px] opacity-70">動態解鎖內容，維持學習節奏與探索感。</p>
              </div>
            </div>
          </section>

          {/* 8. 個人化數據 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">📊 個人化數據 (Personal Data)</h2>
            <p className="pl-3 text-[12px] opacity-80">
              包含學習時長統計、正確率分析、錯題整理與收藏功能。
            </p>
          </section>

          {/* 9. 技術架構 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">⚙️ 技術架構 (Technology)</h2>
            <p className="pl-3 text-[11px] opacity-60 font-mono italic">
              React + Vite + TypeScript / Tailwind CSS / Firebase Authentication & Firestore
            </p>
          </section>

          {/* 10. 適用對象 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3 uppercase tracking-wide">🎯 適用對象 (Target User)</h2>
            <ul className="list-disc list-inside space-y-1 pl-4 text-[12px] opacity-80">
              <li>希望提升英文閱讀與理解能力者</li>
              <li>想建立語感而非死記單字者</li>
              <li>需要結構化學習方式的使用者</li>
            </ul>
          </section>

          {/* 11. 總結 */}
          <section className="pt-4 border-t border-white/10">
            <div className="p-4 bg-gold/10 border border-gold/20 rounded-2xl italic">
              <p className="text-xs text-parchment/80 text-justify">
                小雪的英咒寶典以句子為核心，結合填空重構、詞族聯想與語音輔助，協助學習者逐步建立語感、提升聽力，並強化實際運用能力。
              </p>
            </div>
          </section>

        </div>

        {/* Footer Button */}
        <div className="pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => navigateTo('start', 'menu')}
            className="w-full py-4 rounded-xl bg-gold text-ink font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            返回主頁
          </button>
        </div>
      </motion.div>
    );
  };

  const renderAboutScreen = () => {
    return (
      <motion.div 
        key="about"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="flex flex-col min-h-screen w-full max-w-md mx-auto p-6 pt-20 space-y-6 bg-navy-dark relative z-10 border-x border-white/5"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 28, 0.92), rgba(10, 15, 28, 0.92)), url("https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <h1 className="text-xl font-serif italic text-gold flex items-center gap-3">
            <Sparkles className="w-7 h-7" />
            法典手記 (Archive)
          </h1>
          <button 
            onClick={() => navigateTo('start', 'menu')}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-parchment/60"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="text-[14px] text-parchment/80 leading-relaxed font-sans space-y-8 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar pb-10">
          
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3">創作者與願景 (Vision)</h2>
            <p className="text-justify">
              「小雪的英咒寶典 (Spell-Bound)」致力於打造一個基於「肌肉記憶」與「輸出重構」的英語修煉環境。我們深信，語言不應只是靜態的拼圖，而是如同「咒語」般存在於潛意識中的反射。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3">教育理念 (Philosophy)</h2>
            <p className="text-justify">
              我們主張「不教語法，唯手熟爾」。透過模擬真實語境下的填空與重組，強迫大腦進行高強度的檢索與組裝。這不僅是記憶，更是對語言結構的深度重構，讓使用者能在毫秒內做出正確反應。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gold border-l-4 border-gold/40 pl-3">我們的團隊 (Team)</h2>
            <p className="text-justify">
              我們是一個專注於語言教學研發的小型團隊，持續更新內容，確保所有「英咒」不僅符合現代英語習慣，更具備教育層次的深度與趣味。
            </p>
          </section>
        </div>

        {/* Footer Button - Added for consistency */}
        <div className="pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => navigateTo('start', 'menu')}
            className="w-full py-4 rounded-xl bg-gold text-ink font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            返回主頁
          </button>
        </div>
      </motion.div>
    );
  };

  const renderAppGuideScreen = () => {
    return (
      <motion.div 
        key="app_guide"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="flex flex-col min-h-screen w-full max-w-md mx-auto p-6 pt-20 space-y-6 bg-navy-dark relative z-10 border-x border-white/5"
        style={{
          backgroundImage: 'linear-gradient(rgba(10, 15, 28, 0.9), rgba(10, 15, 28, 0.9)), url("https://raw.githubusercontent.com/xung7777-glitch/my-images/refs/heads/main/bg_english2.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <h1 className="text-xl font-serif italic text-gold flex items-center gap-3">
            <Scroll className="w-7 h-7" />
            修煉天書 (App 使用指南)
          </h1>
        </div>

        <div className="notranslate text-[13px] text-parchment/70 leading-relaxed font-sans space-y-6 overflow-y-auto max-h-[72vh] pr-2 custom-scrollbar pb-10">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gold border-l-3 border-gold/40 pl-3 uppercase tracking-wide">壹・核心導引</h2>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <p className="text-gold font-serif italic text-sm">「不教語法，唯手熟爾。」</p>
              <p className="pl-1">這款 **App** 的修煉核心在於 **「靈魂記憶」**。透過反覆的咒語填空試煉，將英文句子轉化為大腦的本能反應。我們不強調枯燥的語法分析，而是追求如同吟唱咒語般的流暢感。</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gold border-l-3 border-gold/40 pl-3 uppercase tracking-wide">貳・境界階級與神獸</h2>
            <p className="pl-1">您的每一次成功修煉都會積累靈力（積分）。當積分跨越特定門檻，您將會觸發 **「大突破」** 並晉升境界。</p>
            <ul className="grid grid-cols-1 gap-2 pl-1">
              <li className="bg-white/10 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>解鎖高等級境界，可觀測到傳說中的 **守護神獸**。</span>
              </li>
              <li className="bg-white/10 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>未達成的境界會被 **雲霧封鎖**，待您實力足夠方可窺見。</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gold border-l-3 border-gold/40 pl-3 uppercase tracking-wide">參・試煉法寶說明</h2>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-cyan-400 font-bold flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4" /> 咒語全解 (Universal Spells)
                </div>
                <p className="text-[12px] opacity-80">全語境浸潤式練習，針對句子的整體結構進行修煉，建立完整的語言直覺。</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-gold font-bold flex items-center gap-2 mb-1">
                  <Library className="w-4 h-4" /> 咒語系譜 (Genealogy)
                </div>
                <p className="text-[12px] opacity-80">詞族聯想式練習，自動提取核心關鍵詞進行高強度填空，專為擴張詞彙深度設計。</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-red-400 font-bold flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4" /> 我的最愛 (Favorites)
                </div>
                <p className="text-[12px] opacity-80">手動標記那些與您靈魂共鳴的強力咒語，隨時進行針對性複習。</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="text-amber-500 font-bold flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" /> 封神殘卷 (Wrong List)
                </div>
                <p className="text-[12px] opacity-80">自動捕捉修煉中的心魔（錯題），透過「重生試煉」將失敗轉化為深層記憶。</p>
              </div>
            </div>
            <div className="mt-2 p-3 bg-gold/5 border border-gold/20 rounded-xl text-[11px] text-parchment/60 italic">
              提示：在「咒語全解」與「咒語系譜」中，您可以灵活切換 **「隨機試煉」** 或 **「指定序號」** 功能，自定義您的修行節奏。
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gold border-l-3 border-gold/40 pl-3 uppercase tracking-wide">肆・靈識廣度 (解鎖限額)</h2>
            <p className="pl-1">為了確保修行穩健，這款 **App** 初始僅開放前 50 卷咒語。您可以透過 **「冥想參悟」**（觀看加值內容）來擴張您的靈識廣度，每日不斷挑戰，直至解鎖全卷 800 卷。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-gold border-l-3 border-gold/40 pl-3 uppercase tracking-wide">伍・悟道數據追蹤</h2>
            <p className="pl-1 text-gold/80 italic">「滴水穿石，誠不我欺。」</p>
            <p className="pl-1">這款 **App** 會自動紀錄您的 **總修煉時長** 與 **修煉數量**。這些數據反映了您對英語世界的依賴程度與掌控力，也是您身為高階修煉者的最好證明。</p>
          </section>

          {/* AdSense Compliance Content */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-base font-bold text-gold border-l-3 border-gold/40 pl-3 uppercase tracking-wide">陸・高級修煉機制</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="text-gold font-bold mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4" /> 冥想參悟 (Meditation)
                </h4>
                <p className="text-[12px] text-parchment/70 leading-relaxed">
                  道友可透過「冥想參悟」功能快速擴張靈識廣度。每次成功參悟都能永久解鎖 10 卷新的咒語殘卷，是提升境界的捷徑。
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="text-gold font-bold mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> 境界大突破 (Breakthrough)
                </h4>
                <p className="text-[12px] text-parchment/70 leading-relaxed">
                  積累足夠的修煉成功後，系統將會觸發進階試煉。成功突破後，您的境界標章將會發生質變。
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-base font-bold text-gold border-l-3 border-gold/40 pl-3 uppercase tracking-wide">柒・寶典修煉價值</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold italic">● 神諭聲音試煉：提升聲音直覺</h3>
                <p className="text-[12px] text-parchment/70 leading-relaxed pl-2 text-justify">
                  內建 AI 神諭朗讀系統，透過高頻率的聲音試煉，將視覺咒語轉化為腦中音律，建立無國界的語言直覺。
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold italic">● 高強度修煉：建立腦部反射</h3>
                <p className="text-[12px] text-parchment/70 leading-relaxed pl-2 text-justify">
                  我們追求如同反射動作般的輸出。透過 800 卷高強度詞族聯想，讓您的英語溝通從「翻譯」轉向「本能」。
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gold italic">● 境界成就系統：實力精準量化</h3>
                <p className="text-[12px] text-parchment/70 leading-relaxed pl-2 text-justify">
                  從凡人到化神，每一階層都代表著語言掌控力的質變。透過獎杯式成就，讓您的修行路徑清晰可見。
                </p>
              </div>
            </div>
          </section>

          <div className="pt-4 opacity-30 text-[10px] text-center uppercase tracking-[0.4em]">
            祝道友修行順利，早日登頂化神
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 text-center">
          <button 
            onClick={() => navigateTo('start', 'menu')}
            className="w-full py-3 rounded-xl bg-gold text-ink font-bold text-xs uppercase tracking-widest shadow-lg shadow-gold/20"
          >
            返回主頁
          </button>
        </div>
      </motion.div>
    );
  };

  const renderTopBar = () => {
    const isRoot = screen === 'start' && startViewState === 'menu';
    
    let title = "小雪的英咒寶典";
    let showBack = !isRoot && screen !== 'lesson_detail' && startViewState !== 'how_it_works' && startViewState !== 'rank_detail';
    let breadcrumb = null;

    if (screen === 'patterns') title = "咒譜大圖";
    else if (screen === 'pattern_detail') {
      title = selectedPattern || "Pattern";
      breadcrumb = "咒譜";
    }
    else if (screen === 'lesson_detail') {
      title = `Lesson ${selectedLesson?.id || ''}`;
      breadcrumb = selectedPattern;
    }
    else if (screen === 'start') {
      if (startViewState === 'favorites_list') title = "我的最愛";
      else if (startViewState === 'wrong_list') title = "封神殘卷";
      else if (startViewState === 'rank_detail') title = "仙途修為";
      else if (startViewState === 'app_guide') title = "修煉天書";
      else if (startViewState === 'how_it_works') title = "法典導航";
      else if (startViewState === 'about') title = "法典手記";
    }

    return (
      <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-navy-dark/80 backdrop-blur-xl border-b border-white/5 safe-area-pt">
        <div className="max-w-md mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={() => window.history.back()}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all text-gold"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              {breadcrumb && (
                <span className="text-[9px] text-gold/40 uppercase tracking-widest font-black leading-none mb-0.5">
                  {breadcrumb}
                </span>
              )}
              <h1 className="text-sm font-black text-parchment uppercase tracking-tighter">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
               <button 
                onClick={handleLogin}
                className="p-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold"
               >
                <LogIn className="w-4 h-4" />
               </button>
            ) : (
              <div 
                onClick={() => navigateTo('start', 'rank_detail')}
                className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-gold/30">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  };

  const renderBottomNav = () => {
    // Hide nav in practice screen or result screen for immersion
    if (screen === 'practice' || screen === 'result') return null;

    const navItems = [
      { id: 'patterns', label: '咒譜', icon: Library, action: () => navigateTo('patterns') },
      { id: 'practice', label: '修煉', icon: Zap, action: () => navigateTo('start', 'practice_hub') },
      { id: 'home', label: '主介面', icon: Home, action: () => navigateTo('start', 'menu'), isCenter: true },
      { id: 'insights', label: '悟道', icon: Scroll, action: () => navigateTo('start', 'how_it_works') },
      { id: 'profile', label: '我的', icon: UserIcon, action: () => navigateTo('start', 'rank_detail') },
    ];

    const currentTabId = (screen === 'start' && startViewState === 'menu') ? 'home' : activeTab;

    return (
      <nav 
        className={`fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-300 ${isNavVisible ? 'translate-y-0' : 'translate-y-full'} safe-area-pb`}
      >
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="bg-navy-light/95 backdrop-blur-3xl border border-white/10 rounded-[36px] p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-visible">
            {navItems.map((item) => {
              const isActive = currentTabId === item.id;
              
              if (item.id === 'home') {
                return (
                  <div key="home-center" className="relative -top-6 flex flex-col items-center">
                    <button
                      onClick={() => {
                        setActiveTab('home');
                        item.action();
                      }}
                      className={`w-16 h-16 rounded-full border-4 transition-all duration-500 flex items-center justify-center shadow-2xl active:scale-90 ${isActive ? 'bg-gold border-navy-light text-ink shadow-gold/40' : 'bg-navy-dark border-white/10 text-gold shadow-black/50'}`}
                    >
                      <Home className={`w-7 h-7 ${isActive ? 'scale-110' : ''}`} />
                      {isActive && (
                        <motion.div 
                          layoutId="home-glow" 
                          className="absolute -inset-2 bg-gold/20 rounded-full blur-xl -z-10" 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}
                    </button>
                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 transition-colors ${isActive ? 'text-gold' : 'text-parchment/30'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    item.action();
                  }}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl transition-all ${isActive ? 'text-gold' : 'text-parchment/30 hover:text-parchment/60'}`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'scale-100'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    );
  };

  return (
    <div className="antialiased font-sans min-h-screen text-parchment relative bg-navy-dark overflow-x-hidden selection:bg-gold/30 selection:text-gold">
      {renderAuthUI()}
      
      <main className={`${screen === 'practice' ? 'pt-0 pb-0' : ''}`}>
        <AnimatePresence mode="wait">
          {screen === 'practice' ? renderPracticeScreen() : 
           screen === 'result' ? renderResultScreen() : 
           screen === 'privacy' ? renderPrivacyScreen() :
           renderStartScreen()}
        </AnimatePresence>
      </main>

      {renderBottomNav()}

      {/* Simplified Universal Footer - Consolidated Branding & Compliance */}
      <footer className="w-full max-w-md mx-auto px-6 pt-2 pb-12 flex flex-col items-center justify-center gap-2 text-[10px] text-parchment/30 tracking-[0.1em] font-bold uppercase relative z-50 border-t border-white/5">
        <div className="flex flex-col items-center gap-0.5 opacity-50">
          <div className="text-[11px] font-bold tracking-[0.25em] text-gold/60">V1.5 版</div>
          <div className="text-[9px] tracking-[0.35em]">XIAOXUE STUDIO</div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 text-gold/40">
            <button 
              onClick={() => navigateTo('patterns')} 
              className="hover:text-gold transition-colors underline underline-offset-4 decoration-gold/10 flex items-center gap-1.5"
            >
              <Library className="w-3 h-3" />
              Patterns
            </button>
            <span className="opacity-20 text-[8px]">|</span>
            <button 
              onClick={() => navigateTo('start', 'about')}
              className="hover:text-gold transition-colors underline underline-offset-4 decoration-gold/10 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              About
            </button>
            <span className="opacity-20 text-[8px]">|</span>
            <button 
              onClick={() => navigateTo('start', 'app_guide')}
              className="hover:text-gold transition-colors underline underline-offset-4 decoration-gold/10 flex items-center gap-1.5"
            >
              <Compass className="w-3 h-3" />
              Guide
            </button>
            <span className="opacity-20 text-[8px]">|</span>
            <button 
              onClick={() => navigateTo('privacy')}
              className="hover:text-gold transition-colors underline underline-offset-4 decoration-gold/10 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3 h-3" />
              Privacy
            </button>
          </div>
          <div className="flex items-center gap-2 opacity-30 mt-1">
            <div className="w-4 h-px bg-white/20" />
            <span className="lowercase text-[10px] tracking-[0.05em] font-mono">xiaoxueaiworld@gmail.com</span>
            <div className="w-4 h-px bg-white/20" />
          </div>
        </div>
      </footer>
    </div>
  );
}

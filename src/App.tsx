import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroChamberCard } from './components/HeroChamberCard';
import { PortalCardGrid, CardDef, DEFAULT_PORTAL_CARDS } from './components/PortalCardGrid';
import { SidebarDrawer } from './components/SidebarDrawer';

// Modals
import { XiaoxueChamberModal } from './components/modals/XiaoxueChamberModal';
import { WildBeastHuntModal } from './components/modals/WildBeastHuntModal';
import { FishingRiverModal } from './components/modals/FishingRiverModal';
import { Talisman2048Modal } from './components/modals/Talisman2048Modal';
import { MechanismPuzzleModal } from './components/modals/MechanismPuzzleModal';
import { EnglishSpellModal } from './components/modals/EnglishSpellModal';
import { SpiritualFieldAlchemyModal } from './components/modals/SpiritualFieldAlchemyModal';
import { CultivationStatusModal } from './components/modals/CultivationStatusModal';
import { WorldMapPortalModal } from './components/modals/WorldMapPortalModal';
import { WorldMapLayer } from './components/WorldMapLayer';
import { BreakthroughModal } from './components/modals/BreakthroughModal';
import { DlcRunnerModal } from './components/DlcRunnerModal';

// Data & Helpers
import { PlayerStats, RealmInfo } from './types/cultivation';
import { REALMS } from './data/cultivationData';
import { loadPlayerStats, savePlayerStats, resetPlayerStats } from './utils/storage';
import { sounds } from './utils/audio';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { user, playerData, gainSpiritualPower } = useAuth();
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Active modal controls
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [activeDlc, setActiveDlc] = useState<{ id: string; title: string; url: string } | null>(null);
  const [dlcToast, setDlcToast] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [breakthroughInfo, setBreakthroughInfo] = useState<RealmInfo | null>(null);
  const [portalCards, setPortalCards] = useState<CardDef[]>(DEFAULT_PORTAL_CARDS);

  // Synchronize Firestore Player Data to local state when logged in
  useEffect(() => {
    if (playerData?.cultivation?.totalSpiritualPower !== undefined) {
      setStats((prev) => ({
        ...prev,
        currentExp: playerData.cultivation.totalSpiritualPower,
        daoName: playerData.profile?.displayName || prev.daoName,
      }));
    }
  }, [playerData]);

  // Bind audio player state listener
  useEffect(() => {
    sounds.onBgmChange = (playing) => {
      setAudioEnabled(playing);
    };
  }, []);

  // Dynamic Config-Driven loading of DLC modules
  useEffect(() => {
    fetch('/config.json')
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg.modules && Array.isArray(cfg.modules) && cfg.modules.length > 0) {
          const merged = cfg.modules.map((m: any) => {
            const defaultMatch = DEFAULT_PORTAL_CARDS.find(
              (d) => d.id === m.id || (m.id === 'survival_beast' && d.id === 'dlc_survival')
            );
            return {
              ...m,
              bgImage: m.bgImage || defaultMatch?.bgImage,
            };
          });
          setPortalCards(merged);
        }
      })
      .catch((err) => console.warn('Using default portal cards', err));
  }, []);

  // Auto-save whenever player stats change
  useEffect(() => {
    savePlayerStats(stats);
  }, [stats]);

  const updateStats = (newStats: Partial<PlayerStats>) => {
    // If exp changed and user is logged in, sync to Firebase Central Ledger!
    if (user?.uid) {
      const expDelta = newStats.currentExp !== undefined ? Math.max(0, newStats.currentExp - stats.currentExp) : 0;
      if (expDelta > 0) {
        gainSpiritualPower(expDelta).catch((err) => console.error('Cloud sync err:', err));
      }
    }
    setStats((prev) => {
      const merged = { ...prev, ...newStats };
      return merged;
    });
  };

  const handleToggleAudio = () => {
    sounds.toggleBgm();
  };

  const handleReset = () => {
    const fresh = resetPlayerStats();
    setStats(fresh);
  };

  // Breakthrough trigger
  const triggerBreakthrough = () => {
    const nextIndex = stats.currentRealmIndex + 1;
    if (nextIndex < REALMS.length) {
      const targetRealm = REALMS[nextIndex];
      setStats((prev) => ({
        ...prev,
        currentRealmIndex: nextIndex,
        currentExp: 0,
      }));
      setBreakthroughInfo(targetRealm);
    }
  };

  // Every card on the main page represents an independent DLC module!
  const handleSelectPortalCard = (card: CardDef) => {
    if (card.id === 'world_map_portal') {
      setIsWorldMapOpen(true);
      return;
    }
    if (card.targetUrl) {
      if (card.targetUrl.startsWith('/dlc-portal.html')) {
        window.location.href = card.targetUrl;
        return;
      }
      setActiveDlc({ id: card.id, title: `${card.title} · DLC`, url: card.targetUrl });
    } else {
      // Internal modal fallback
      if (card.id === 'beast_zone') setActiveModal('beast');
      else if (card.id === 'fishing_river') setActiveModal('fishing');
      else if (card.id === 'talisman_puzzle') setActiveModal('talisman');
      else if (card.id === 'gear_puzzle') setActiveModal('mechanism');
      else if (card.id === 'english_spells') setActiveModal('english');
      else if (card.id === 'herb_alchemy') setActiveModal('alchemy');
      else if (card.id === 'stats_panel') setActiveModal('status');
      else if (card.id === 'world_map_portal') setIsWorldMapOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#03060c] text-slate-100 flex items-center justify-center font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden p-0 sm:p-4">
      {/* Mobile Phone Device Frame Wrapper */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[900px] sm:rounded-3xl sm:border-[10px] sm:border-slate-800 sm:shadow-[0_0_80px_rgba(0,0,0,0.9)] bg-[#070b14] flex flex-col relative overflow-hidden">
        {/* Background celestial starry ambient glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-cyan-600/10 via-teal-500/5 to-transparent blur-3xl rounded-full" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600/5 blur-3xl rounded-full" />
          <div className="absolute top-1/2 right-4 w-60 h-60 bg-teal-500/5 blur-3xl rounded-full" />
        </div>

        {/* Top Header / 20% Frame anchored to top */}
        <div 
          className="relative w-full h-[150px] sm:h-[180px] bg-cover bg-top border-b border-cyan-500/30 shadow-lg flex-shrink-0"
          style={{ backgroundImage: `url('/assets/images/xiaoxue_header.png')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#070b14]/90 pointer-events-none" />
          
          <div className="relative z-25">
            <Navbar />
          </div>

          {/* Theme Song Audio Toggle Button placed in the bottom-left blank space underneath title */}
          <div className="absolute bottom-2.5 left-3 sm:left-4 z-20">
            <button
              onClick={handleToggleAudio}
              title={audioEnabled ? '點擊暫停小雪主題曲' : '點擊播放小雪主題曲'}
              className={`px-2.5 h-7 sm:h-8 rounded-xl border flex items-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md shadow-lg ${
                audioEnabled
                  ? 'bg-gradient-to-r from-cyan-950/90 to-teal-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.45)]'
                  : 'bg-[#141d2e]/85 border-cyan-900/60 text-slate-300 hover:text-white hover:border-cyan-600'
              }`}
            >
              {audioEnabled ? (
                <>
                  <span className="flex items-end gap-0.5 h-3 pb-0.5">
                    <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                    <span className="w-1 h-2 bg-teal-300 rounded-full animate-bounce" style={{ animationDuration: '0.8s', animationDelay: '0.15s' }} />
                    <span className="w-1 h-3 bg-cyan-200 rounded-full animate-bounce" style={{ animationDuration: '0.5s', animationDelay: '0.3s' }} />
                  </span>
                  <span className="text-[10px] font-bold tracking-tight text-cyan-200">播放中 🎵</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="text-[10px] font-semibold text-slate-200">播放主題曲</span>
                </>
              )}
            </button>
          </div>
        </div>

      {/* Bottom 80% Frame with Cosmic Nebula Background */}
      <div 
        className="relative flex-1 w-full bg-cover bg-repeat-y flex flex-col"
        style={{ backgroundImage: `url('/assets/images/cosmic_nebula_bg.png')`, backgroundColor: '#070b14' }}
      >
        <div className="absolute inset-0 bg-[#070b14]/70 backdrop-blur-[1px] pointer-events-none" />

        {/* Main Screen Layout */}
        <main className="relative z-10 flex-1 max-w-md w-full mx-auto px-3.5 sm:px-4 py-4 space-y-3.5 pb-24">
          {/* Top Hero Chamber Card */}
          <HeroChamberCard
            stats={stats}
            onEnterChamber={() => setActiveModal('chamber')}
            onOpenProfile={() => setActiveModal('status')}
          />

          {/* Dynamic 12 DLC Card Grid */}
          <PortalCardGrid
            cards={portalCards}
            onSelectCard={handleSelectPortalCard}
          />

          {/* Brand Identity Text Block */}
          <div className="pt-4 pb-2 text-center select-none flex flex-col items-center justify-center space-y-1">
            <h1 className="text-base sm:text-lg font-serif font-medium tracking-widest text-[#f0d5a3] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Xiaoxue AI World
            </h1>
            <p className="text-[11px] sm:text-xs font-serif tracking-wide text-[#8fa3be] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              以現實為內容・以小雪為主角・以修仙為語言
            </p>
          </div>
        </main>

        {/* Mobile Bottom Tab Bar (修行 | 主世界 | 仙緣) - Persistent fixed bottom bar with seamless background blending (无痛衔接) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-gradient-to-t from-[#04070e] via-[#070d18]/95 to-transparent backdrop-blur-md border-t border-cyan-500/25 px-6 py-3 pb-4 flex items-center justify-around shadow-[0_-15px_35px_rgba(3,6,12,0.95)]">
          <button
            onClick={() => {
              sounds.playChime(440, 0.2);
              setActiveModal('status');
            }}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors group select-none"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
              ⛩️
            </div>
            <span className="text-[11px] font-medium">修行</span>
          </button>

          <button
            onClick={() => {
              sounds.playChime(523.25, 0.2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-1 text-amber-400 select-none group"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              🏠
            </div>
            <span className="text-[11px] font-bold tracking-wide">主世界</span>
          </button>

          <button
            onClick={() => {
              sounds.playChime(659.25, 0.2);
              setActiveModal('chamber');
            }}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors group select-none"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
              👤
            </div>
            <span className="text-[11px] font-medium">仙緣</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        stats={stats}
        onOpenChamber={() => setActiveModal('chamber')}
        onOpenStatus={() => setActiveModal('status')}
        onOpenWorldMap={() => setIsWorldMapOpen(true)}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        onResetStats={handleReset}
      />

      {/* Modals for All 8 Portals & Chamber */}
      <XiaoxueChamberModal
        isOpen={activeModal === 'chamber'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onUpdateStats={updateStats}
        onTriggerBreakthrough={triggerBreakthrough}
      />

      <WildBeastHuntModal
        isOpen={activeModal === 'beast'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onUpdateStats={updateStats}
      />

      <FishingRiverModal
        isOpen={activeModal === 'fishing'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onUpdateStats={updateStats}
      />

      <Talisman2048Modal
        isOpen={activeModal === 'talisman'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onUpdateStats={updateStats}
      />

      <MechanismPuzzleModal
        isOpen={activeModal === 'mechanism'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onUpdateStats={updateStats}
      />

      <EnglishSpellModal
        isOpen={activeModal === 'english'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onUpdateStats={updateStats}
      />

      <SpiritualFieldAlchemyModal
        isOpen={activeModal === 'alchemy'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onUpdateStats={updateStats}
      />

      <CultivationStatusModal
        isOpen={activeModal === 'status'}
        onClose={() => setActiveModal(null)}
        stats={stats}
        onUpdateStats={updateStats}
        onTriggerBreakthrough={triggerBreakthrough}
      />

      {/* World Map Layer (Dual-Layer View Engine) */}
      <WorldMapLayer
        isOpen={isWorldMapOpen || activeModal === 'map'}
        onClose={() => {
          setIsWorldMapOpen(false);
          if (activeModal === 'map') setActiveModal(null);
        }}
      />

      {/* Breakthrough Victory Celebration */}
      <BreakthroughModal
        isOpen={!!breakthroughInfo}
        onClose={() => setBreakthroughInfo(null)}
        newRealm={breakthroughInfo || REALMS[0]}
      />


      {/* Standalone DLC Runner Modal (Iframe Sandbox with postMessage) */}
      <DlcRunnerModal
        isOpen={!!activeDlc}
        onClose={() => setActiveDlc(null)}
        title={activeDlc?.title || 'DLC 模組'}
        targetUrl={activeDlc?.url || ''}
        onDlcReward={(exp, msg) => {
          gainSpiritualPower(exp, activeDlc?.id, { message: msg });
          updateStats({
            currentExp: stats.currentExp + exp,
          });
          setDlcToast(msg ? `${msg} (+${exp} 靈力)` : `DLC 獎勵: +${exp} 靈力`);
          setTimeout(() => setDlcToast(null), 3500);
        }}
      />

      {/* Floating Toast Notification for DLC Rewards */}
      {dlcToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-emerald-950/90 border border-emerald-400 text-emerald-200 px-4 py-2 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
          <span>✨</span>
          <span>{dlcToast}</span>
        </div>
      )}
      </div>
    </div>
  );
}

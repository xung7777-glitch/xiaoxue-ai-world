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
import { GitHubSyncModal } from './components/modals/GitHubSyncModal';
import { DlcRunnerModal } from './components/DlcRunnerModal';

// Data & Helpers
import { PlayerStats, RealmInfo } from './types/cultivation';
import { REALMS } from './data/cultivationData';
import { loadPlayerStats, savePlayerStats, resetPlayerStats } from './utils/storage';
import { sounds } from './utils/audio';

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Active modal controls
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [activeDlc, setActiveDlc] = useState<{ title: string; url: string } | null>(null);
  const [dlcToast, setDlcToast] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false);
  const [breakthroughInfo, setBreakthroughInfo] = useState<RealmInfo | null>(null);
  const [portalCards, setPortalCards] = useState<CardDef[]>(DEFAULT_PORTAL_CARDS);

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
          setPortalCards(cfg.modules);
        }
      })
      .catch((err) => console.warn('Using default portal cards', err));
  }, []);

  // Auto-save whenever player stats change
  useEffect(() => {
    savePlayerStats(stats);
  }, [stats]);

  const updateStats = (newStats: Partial<PlayerStats>) => {
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
        spiritStones: prev.spiritStones + 150,
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
      setActiveDlc({ title: `${card.title} · DLC`, url: card.targetUrl });
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
    <div className="min-h-screen bg-[#0a0f1c] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Background celestial starry ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-cyan-600/10 via-teal-500/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600/5 blur-3xl rounded-full" />
        <div className="absolute top-1/2 right-4 w-60 h-60 bg-teal-500/5 blur-3xl rounded-full" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenProfile={() => setActiveModal('status')}
        onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
      />

      {/* Main Screen Layout (Mobile optimized & centered desktop preview) */}
      <main className="relative z-10 flex-1 max-w-md w-full mx-auto px-3.5 sm:px-4 py-4 space-y-3.5 pb-10">
        {/* Top Hero Chamber Card matching screenshot */}
        <HeroChamberCard
          stats={stats}
          onEnterChamber={() => setActiveModal('chamber')}
        />

        {/* Dynamic DLC Card Grid driven by config.json */}
        <PortalCardGrid
          cards={portalCards}
          onSelectCard={handleSelectPortalCard}
        />

        {/* Bottom footer with GitHub advice badge */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setIsGitHubSyncOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 text-[11px] text-cyan-300 transition-all active:scale-95 shadow-sm"
          >
            <span>🏮 xiaoxue-ai-world · 點此查看 GitHub 原專案接管說明</span>
          </button>
        </div>
      </main>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        stats={stats}
        onOpenChamber={() => setActiveModal('chamber')}
        onOpenStatus={() => setActiveModal('status')}
        onOpenWorldMap={() => setIsWorldMapOpen(true)}
        onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
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

      {/* GitHub Sync & Takeover Info Modal */}
      <GitHubSyncModal
        isOpen={isGitHubSyncOpen}
        onClose={() => setIsGitHubSyncOpen(false)}
      />

      {/* Standalone DLC Runner Modal (Iframe Sandbox with postMessage) */}
      <DlcRunnerModal
        isOpen={!!activeDlc}
        onClose={() => setActiveDlc(null)}
        title={activeDlc?.title || 'DLC 模組'}
        targetUrl={activeDlc?.url || ''}
        onDlcReward={(exp, stones, msg) => {
          updateStats({
            currentExp: stats.currentExp + exp,
            spiritStones: stats.spiritStones + stones,
          });
          setDlcToast(msg ? `${msg} (+${exp} 靈氣, +${stones} 靈石)` : `DLC 獎勵: +${exp} 靈氣, +${stones} 靈石`);
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
  );
}

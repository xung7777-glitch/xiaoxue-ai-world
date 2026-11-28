import React, { useState, useEffect } from 'react';
import { X, Sparkles, Heart, MessageCircle, Wind, Award, User, LogIn, ExternalLink } from 'lucide-react';
import { PlayerStats, RealmInfo } from '../../types/cultivation';
import { REALMS, XIAOXUE_DIALOGUES } from '../../data/cultivationData';
import { sounds } from '../../utils/audio';
import { CharacterSprite } from '../CharacterSprite';
import { useAuth } from '../../contexts/AuthContext';

interface XiaoxueChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onTriggerBreakthrough: () => void;
}

export const XiaoxueChamberModal: React.FC<XiaoxueChamberModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
  onTriggerBreakthrough,
}) => {
  const { user, playerData, realmInfo, gainSpiritualPower, loginWithGoogle } = useAuth();
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [showModelSheet, setShowModelSheet] = useState(false);

  const currentRealm: RealmInfo = REALMS[stats.currentRealmIndex] || REALMS[0];

  if (!isOpen) return null;

  const handleNextDialogue = () => {
    sounds.playChime(523.25, 0.3);
    setDialogueIndex((prev) => (prev + 1) % XIAOXUE_DIALOGUES.length);
  };

  const handleGiftXiaoxue = () => {
    const herbs = stats.inventory.find((i) => i.type === 'herb' && i.count > 0);
    if (!herbs) {
      alert('儲物袋中暫無靈草可贈予小雪，可前往「靈田」採收或「野外」獲取！');
      return;
    }

    sounds.playChime(659.25, 0.8);
    const updatedInv = stats.inventory.map((item) =>
      item.id === herbs.id ? { ...item, count: item.count - 1 } : item
    ).filter((i) => i.count > 0);

    const newAffinity = Math.min(100, stats.affinityWithXiaoxue + 10);
    onUpdateStats({
      inventory: updatedInv,
      affinityWithXiaoxue: newAffinity,
      currentExp: Math.min(currentRealm.maxExp, stats.currentExp + 25),
    });
  };

  // Official Social Channels (YouTube full-width, others 2 columns)
  const socialChannels = [
    {
      name: 'YouTube',
      desc: '音樂 MV、修仙世界、生活 Vlog 與英文學習',
      url: 'https://www.youtube.com/@XiaoxueAI',
      icon: '▶️',
      color: 'from-red-950/60 to-red-900/40 border-red-500/40 hover:border-red-400 text-red-200',
      isOfficial: true,
      fullWidth: true,
    },
    {
      name: 'Bilibili',
      desc: '官方影音與動態',
      url: 'https://space.bilibili.com/zh-Hant/1524700074',
      icon: '📺',
      color: 'from-blue-950/60 to-blue-900/40 border-blue-500/40 hover:border-blue-400 text-blue-200',
    },
    {
      name: 'TikTok',
      desc: '短影片與日常',
      url: 'https://www.tiktok.com/@xiaoxueaiworld',
      icon: '🎵',
      color: 'from-purple-950/60 to-purple-900/40 border-purple-500/40 hover:border-purple-400 text-purple-200',
    },
    {
      name: 'Instagram',
      desc: '精美插畫與點滴',
      url: 'https://www.instagram.com/xiaoxueaiworld/',
      icon: '📸',
      color: 'from-pink-950/60 to-pink-900/40 border-pink-500/40 hover:border-pink-400 text-pink-200',
    },
    {
      name: 'Facebook 粉絲頁',
      desc: '社群與道友交流',
      url: 'https://www.facebook.com/profile.php?id=61596425902411',
      icon: '📘',
      color: 'from-indigo-950/60 to-indigo-900/40 border-indigo-500/40 hover:border-indigo-400 text-indigo-200',
    },
    {
      name: 'Threads',
      desc: '心情随笔与动态',
      url: 'https://www.threads.com/@xiaoxueaiworld',
      icon: '🧵',
      color: 'from-slate-900 to-slate-800 border-slate-700 hover:border-slate-500 text-slate-200',
    },
    {
      name: 'X (Twitter)',
      desc: '公告與世界觀更新',
      url: 'https://x.com/XiaoxueAIWorld',
      icon: '🐦',
      color: 'from-slate-900 to-slate-800 border-slate-700 hover:border-slate-500 text-slate-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#10192b] via-[#0d1524] to-[#090e18] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#121c2e]/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">仙緣</h3>
              <p className="text-xs text-cyan-400">與小雪相遇，從這裡開始</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playChime(440, 0.2);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chamber Main Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Chamber illustration & Dialogue banner (RETAINED AS REQUESTED) */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0d1627] to-[#162238] border border-cyan-800/50 p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0 relative">
              <CharacterSprite id="chamber" className="w-full h-full rounded-xl object-cover" glow={true} />
            </div>

            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-cyan-200 font-serif">小雪 (好感度: {stats.affinityWithXiaoxue}%)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  {currentRealm.stage} 侍道
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-cyan-900/30">
                「{XIAOXUE_DIALOGUES[dialogueIndex].text}」
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleNextDialogue}
                  className="text-xs px-3 py-1 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700/40 text-cyan-200 flex items-center gap-1 transition-all active:scale-95"
                >
                  <MessageCircle className="w-3 h-3" />
                  再聊兩句
                </button>
                <button
                  onClick={handleGiftXiaoxue}
                  className="text-xs px-3 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-700/40 text-rose-200 flex items-center gap-1 transition-all active:scale-95"
                >
                  <Heart className="w-3 h-3 text-rose-400" />
                  贈送靈草
                </button>
                <button
                  onClick={() => setShowModelSheet(true)}
                  className="text-xs px-3 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900/70 border border-teal-600/50 text-teal-200 flex items-center gap-1 transition-all active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  小雪原型圖鑑
                </button>
              </div>
            </div>
          </div>

          {/* Social Channels Hub (REPLACED MEDITATION BLOCK AS REQUESTED) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#09111e] to-[#0d1628] border border-cyan-800/50 space-y-3">
            <div className="text-center pb-2 border-b border-cyan-950">
              <h4 className="text-sm font-bold text-amber-300 font-serif tracking-wider">仙緣 · 官方社群頻道</h4>
              <p className="text-[10px] text-cyan-300 mt-0.5">Xiaoxue AI World · Official Social Channels</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {socialChannels.map((ch) => (
                <div
                  key={ch.name}
                  className={`p-3 rounded-xl bg-gradient-to-r ${ch.color} border transition-all duration-300 shadow-md flex flex-col justify-between space-y-2 group ${
                    ch.fullWidth ? 'col-span-1 sm:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ch.icon}</span>
                      <div>
                        <h5 className="text-xs font-bold font-serif text-white tracking-wide group-hover:text-amber-200 transition-colors">
                          {ch.name}
                        </h5>
                        <p className="text-[10px] text-slate-300 leading-snug mt-0.5">{ch.desc}</p>
                      </div>
                    </div>

                    {ch.isOfficial && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-medium">
                        官方頻道
                      </span>
                    )}
                  </div>

                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sounds.playChime(523.25, 0.3)}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#080d17]/90 hover:bg-[#0c1424] border border-cyan-500/30 hover:border-amber-400/80 text-cyan-200 hover:text-amber-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                  >
                    <span>前往 {ch.name} 頻道</span>
                    <ExternalLink className="w-3 h-3 opacity-75 group-hover:opacity-100" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Official Xiaoxue Reference Model Sheet Overlay */}
        {showModelSheet && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative max-w-4xl w-full bg-[#0b121e] border-2 border-cyan-400/60 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❄️</span>
                  <div>
                    <h4 className="text-base font-bold text-white font-serif">小雪 · 官方原型設定圖鑑</h4>
                    <p className="text-xs text-cyan-300">天青冰藍仙裙 · 珠翠花鈿 · 角色三視圖與細節原型</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModelSheet(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex items-center justify-center flex-1">
                <img
                  src="/assets/character/xiaoxue_reference.png"
                  alt="小雪原型設定"
                  className="max-h-[75vh] object-contain rounded-2xl border border-cyan-800/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/character/xiaoxue_avatar.jpg'; }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

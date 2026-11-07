import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, Volume2, HelpCircle, ArrowRight } from 'lucide-react';
import { PlayerStats } from '../../types/cultivation';
import { ENGLISH_SPELLS, EnglishSpell } from '../../data/cultivationData';
import { sounds } from '../../utils/audio';

interface EnglishSpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

export const EnglishSpellModal: React.FC<EnglishSpellModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const [spellIndex, setSpellIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  const currentSpell: EnglishSpell = ENGLISH_SPELLS[spellIndex];

  if (!isOpen) return null;

  const handleInputLetter = (missingIdx: number, char: string) => {
    sounds.playChime(440, 0.15);
    setUserInputs((prev) => ({
      ...prev,
      [missingIdx]: char.toUpperCase(),
    }));
  };

  const handleCheckAnswer = () => {
    // Verify each missing index matches the target letter
    let allCorrect = true;
    for (const idx of currentSpell.missingIndex) {
      if ((userInputs[idx] || '').toUpperCase() !== currentSpell.word[idx].toUpperCase()) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      sounds.playBreakthrough();
      setIsSuccess(true);
      onUpdateStats({
        currentExp: stats.currentExp + currentSpell.spiritReward,
        spiritStones: stats.spiritStones + 20,
        englishVocabularyMastered: stats.englishVocabularyMastered + 1,
      });
    } else {
      sounds.playChime(220, 0.3);
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    }
  };

  const handleNextSpell = () => {
    setIsSuccess(false);
    setUserInputs({});
    setSpellIndex((prev) => (prev + 1) % ENGLISH_SPELLS.length);
  };

  // Letters keypad options
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#141d2f] via-[#0d1627] to-[#070c17] border border-cyan-400/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#17253d]/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">英文咒語習得 · 仙訣填空</h3>
              <p className="text-xs text-cyan-300">參悟上古西域真言 · 頓悟神識</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Spell Card Body */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-6 overflow-y-auto">
          {/* Spell info container */}
          <div className="rounded-2xl bg-[#091220] border border-cyan-800/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 font-medium">
                真言第 {spellIndex + 1} / {ENGLISH_SPELLS.length} 式
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                悟道獎勵: +{currentSpell.spiritReward} 靈氣
              </span>
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-xl font-bold text-amber-200 font-serif tracking-wider">
                【{currentSpell.spellName}】
              </h4>
              <p className="text-xs text-slate-400">
                奧義解讀：{currentSpell.chinese} · <span className="font-mono text-cyan-300">{currentSpell.phonetic}</span>
              </p>
            </div>

            {/* Word Blank display */}
            <div
              className={`flex items-center justify-center gap-2 py-4 select-none ${
                errorShake ? 'animate-shake' : ''
              }`}
            >
              {currentSpell.word.split('').map((char, idx) => {
                const isMissing = currentSpell.missingIndex.includes(idx);
                const userVal = userInputs[idx] || '';

                if (!isMissing) {
                  return (
                    <div
                      key={idx}
                      className="w-10 h-12 rounded-xl bg-slate-800/80 border border-slate-600 flex items-center justify-center text-xl font-black text-white font-mono shadow"
                    >
                      {char}
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-black font-mono shadow-md transition-all ${
                      isSuccess
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                        : userVal
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                        : 'bg-[#121c2e] border-dashed border-cyan-500/70 text-transparent animate-pulse'
                    }`}
                  >
                    {userVal || '?'}
                  </div>
                );
              })}
            </div>

            {/* Hint */}
            <p className="text-xs text-slate-300/80 text-center italic bg-black/20 p-2.5 rounded-lg border border-slate-800">
              💡 仙家天機提示：{currentSpell.hint}
            </p>
          </div>

          {/* Keypad or Success */}
          {!isSuccess ? (
            <div className="space-y-4">
              <div className="text-xs text-cyan-400 font-medium text-center">
                請在下方符文鍵盤中點選補齊缺失字母：
              </div>

              {/* Runic Letter Buttons */}
              <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#080e18] rounded-2xl border border-cyan-950">
                {alphabet.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => {
                      // Find first empty missing slot
                      const targetSlot = currentSpell.missingIndex.find((idx) => !userInputs[idx]);
                      if (targetSlot !== undefined) {
                        handleInputLetter(targetSlot, letter);
                      }
                    }}
                    className="h-9 rounded-lg bg-slate-800/90 hover:bg-cyan-700 active:bg-cyan-500 text-slate-200 font-mono font-bold text-xs transition-colors flex items-center justify-center shadow"
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setUserInputs({})}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  清除填空
                </button>
                <button
                  onClick={handleCheckAnswer}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-98"
                >
                  結印引動真言！
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-emerald-200 font-serif">
                天道轟鳴！真言【{currentSpell.word}】參悟圓滿！
              </h4>
              <p className="text-xs text-emerald-300">
                獲得靈氣 +{currentSpell.spiritReward}，靈石 +20，道悟修為精進一階！
              </p>
              <button
                onClick={handleNextSpell}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950"
              >
                <span>研習下一道真言</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

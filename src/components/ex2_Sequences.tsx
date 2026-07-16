/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Clock, ArrowLeft, Trophy, CheckCircle2, XCircle, ArrowRight, CornerDownLeft, Trash2 } from 'lucide-react';

interface Ex2SequencesProps {
  onComplete: (score: number, correctRounds: number) => void;
  onBackToMenu: () => void;
}

const EMOJI_POOL = ["🍎", "🚗", "🐶", "🌙", "⭐", "🍕", "🎈", "🍀", "⚽", "🚀", "🍦", "🎸", "🐬", "🍟", "🌈", "👑", "🦁", "🍉", "🚗", "🚲"];

export default function Ex2Sequences({ onComplete, onBackToMenu }: Ex2SequencesProps) {
  const [round, setRound] = useState(1); // 1 to 5
  const [stage, setStage] = useState<'showing' | 'recalling' | 'round_result' | 'finished'>('showing');
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [gridOptions, setGridOptions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [roundHistory, setRoundHistory] = useState<{ round: number; target: string[]; user: string[]; correct: boolean }[]>([]);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start round
  useEffect(() => {
    startNewRound(round);
    return () => stopCountdown();
  }, [round]);

  const stopCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const startNewRound = (roundNum: number) => {
    stopCountdown();
    setUserSequence([]);
    setStage('showing');

    // Number of emojis is roundNum + 3 (Round 1: 4, Round 2: 5, etc.)
    const len = roundNum + 3;
    
    // Select unique emojis for this round
    const sequence: string[] = [];
    const available = [...EMOJI_POOL];
    for (let i = 0; i < len; i++) {
      const idx = Math.floor(Math.random() * available.length);
      sequence.push(available[idx]);
      available.splice(idx, 1); // Avoid duplicates in the same sequence
    }
    setCurrentSequence(sequence);

    // Duration is number of emojis * 3 seconds
    const duration = len * 3;
    setCountdown(duration);

    // Create selection grid options: correct ones + some decoys to fill a nice grid
    const decoysNeeded = Math.max(6, 12 - len);
    const decoys: string[] = [];
    const poolDecoy = EMOJI_POOL.filter((e) => !sequence.includes(e));
    while (decoys.length < decoysNeeded && poolDecoy.length > 0) {
      const rIdx = Math.floor(Math.random() * poolDecoy.length);
      decoys.push(poolDecoy[rIdx]);
      poolDecoy.splice(rIdx, 1);
    }
    
    // Combine and shuffle options
    const options = [...sequence, ...decoys].sort(() => Math.random() - 0.5);
    setGridOptions(options);

    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopCountdown();
          setStage('recalling');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSkipShow = () => {
    stopCountdown();
    setStage('recalling');
  };

  const handleOptionClick = (emoji: string) => {
    if (userSequence.length >= currentSequence.length) return;
    setUserSequence([...userSequence, emoji]);
  };

  const handleRemoveLast = () => {
    if (userSequence.length === 0) return;
    setUserSequence(userSequence.slice(0, -1));
  };

  const handleClear = () => {
    setUserSequence([]);
  };

  const handleSubmit = () => {
    if (userSequence.length < currentSequence.length) return;

    // Check correctness
    const isCorrect = currentSequence.every((emoji, idx) => emoji === userSequence[idx]);
    if (isCorrect) {
      setCorrectRounds((c) => c + 1);
    }

    setRoundHistory([
      ...roundHistory,
      {
        round,
        target: currentSequence,
        user: userSequence,
        correct: isCorrect
      }
    ]);

    setStage('round_result');
  };

  const handleNextRound = () => {
    if (round < 5) {
      setRound((r) => r + 1);
    } else {
      setStage('finished');
    }
  };

  const totalScore = correctRounds * 20; // 0 to 100

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tornar al menú</span>
        </button>

        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-bold">
            Exercici 2 — Retenció de Seqüències
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold">
          <span>Ronda {Math.min(5, round)} / 5</span>
        </div>
      </div>

      {stage === 'showing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-md text-center max-w-xl mx-auto space-y-8"
        >
          <div className="space-y-2">
            <span className="text-xs font-semibold text-sky-500 dark:text-sky-400 uppercase tracking-widest">
              Memoritza la seqüència
            </span>
            <h3 className="text-xl font-bold">
              Ronda {round}: Memoritza aquests {currentSequence.length} emojis!
            </h3>
          </div>

          {/* Sequence display */}
          <div className="flex justify-center items-center gap-4 py-8 overflow-x-auto min-h-24 select-none">
            {currentSequence.map((emoji, idx) => (
              <motion.span
                key={idx}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
                className="text-4xl sm:text-5xl md:text-6xl p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm"
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          {/* Timer Circle/Gauge */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">
              <Clock className="w-4 h-4 text-sky-500 animate-pulse" />
              <span>Temps restant: {countdown}s</span>
            </div>
            
            <button
              onClick={handleSkipShow}
              className="px-6 py-2 bg-sky-500/10 hover:bg-sky-500/20 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold rounded-xl text-sm transition-colors border border-sky-200/50 dark:border-sky-800/30 cursor-pointer"
            >
              Estic a punt (Omet el temporitzador)
            </button>
          </div>
        </motion.div>
      )}

      {stage === 'recalling' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md max-w-xl mx-auto space-y-6"
        >
          <div className="text-center">
            <span className="text-xs font-semibold text-sky-500 dark:text-sky-400 uppercase tracking-widest">
              Reconstrueix la seqüència
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Selecciona els {currentSequence.length} emojis en l'ordre correcte:
            </h3>
          </div>

          {/* User composition view */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-4 min-h-20 flex justify-center items-center gap-2.5 overflow-x-auto">
            {userSequence.length === 0 ? (
              <span className="text-slate-400 dark:text-slate-600 text-sm italic">
                Prem els emojis de sota per introduir...
              </span>
            ) : (
              <AnimatePresence>
                {userSequence.map((emoji, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-3xl p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative group"
                  >
                    {emoji}
                    <span className="absolute -top-1.5 -right-1.5 bg-sky-500 text-white w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </motion.span>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleRemoveLast}
              disabled={userSequence.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-xs text-slate-600 dark:text-slate-300 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Desfer</span>
            </button>
            <button
              onClick={handleClear}
              disabled={userSequence.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-xs text-slate-600 dark:text-slate-300 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              <span>Netejar-ho tot</span>
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {gridOptions.map((emoji, idx) => {
              // Count how many times this option was selected so we can visually fade if appropriate
              const isSelected = userSequence.includes(emoji);
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOptionClick(emoji)}
                  disabled={userSequence.length >= currentSequence.length}
                  className={`text-3xl p-3.5 rounded-xl border flex items-center justify-center focus:outline-none shadow-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {emoji}
                </motion.button>
              );
            })}
          </div>

          {/* Submit Action */}
          <button
            onClick={handleSubmit}
            disabled={userSequence.length < currentSequence.length}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <CornerDownLeft className="w-5 h-5" />
            <span>Confirmar la seqüència</span>
          </button>
        </motion.div>
      )}

      {stage === 'round_result' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-md text-center max-w-md mx-auto space-y-6"
        >
          {roundHistory[roundHistory.length - 1].correct ? (
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 rounded-full">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                Correcte!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Has emparellat perfectament la seqüència de la ronda {round}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-full">
                <XCircle className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400">
                Seqüència incorrecta
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hi ha hagut un error en el teu record de la seqüència.
              </p>
            </div>
          )}

          {/* Comparison table */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-mono text-left mb-1">SEQÜÈNCIA ESPERADA:</span>
              <div className="flex gap-1.5 justify-center">
                {currentSequence.map((e, i) => (
                  <span key={i} className="text-2xl p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">{e}</span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-mono text-left mb-1">LA TEVA SEQÜÈNCIA:</span>
              <div className="flex gap-1.5 justify-center">
                {userSequence.map((e, i) => {
                  const isMatch = e === currentSequence[i];
                  return (
                    <span key={i} className={`text-2xl p-1 bg-white dark:bg-slate-800 border rounded-md ${isMatch ? 'border-emerald-300 dark:border-emerald-850' : 'border-red-300 dark:border-red-850'}`}>{e}</span>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleNextRound}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-xl text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{round < 5 ? 'Comença la següent ronda' : 'Compilar resultats'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {stage === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center max-w-md mx-auto space-y-6"
          id="sequence-finished-card"
        >
          <div className="inline-flex p-4 bg-sky-100 dark:bg-sky-950/40 text-sky-500 rounded-full">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Retenció de seqüències finalitzada!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              S'han completat les 5 rondes de seqüència cognitiva.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">RONDES CORRECTES</span>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {correctRounds} / 5
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">PUNTUACIÓ</span>
              <span className="text-2xl font-extrabold text-sky-500 dark:text-sky-400 font-mono">
                {totalScore}
              </span>
            </div>
          </div>

          {/* Compact history summary */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 text-left space-y-2">
            <span className="text-xs text-slate-400 font-bold block mb-1 font-mono">AUDITORIA RONDA A RONDA:</span>
            {roundHistory.map((h, i) => (
              <div key={i} className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                <span>Ronda {h.round} ({h.target.length} emojis)</span>
                <span className={h.correct ? 'text-emerald-500 font-bold' : 'text-red-500'}>
                  {h.correct ? '✔️ Correcte' : '❌ Incorrecte'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onComplete(totalScore, correctRounds)}
            id="finish-sequence-btn"
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-xl text-base transition-colors shadow-md cursor-pointer"
          >
            Finalitzar i tornar al menú
          </button>
        </motion.div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid, Clock, ArrowLeft, Trophy, CheckCircle2, XCircle, ArrowRight, Check } from 'lucide-react';

interface Ex5PositionsProps {
  onComplete: (score: number, correctRounds: number) => void;
  onBackToMenu: () => void;
}

export default function Ex5Positions({ onComplete, onBackToMenu }: Ex5PositionsProps) {
  const [round, setRound] = useState(1); // 1 to 6
  const [stage, setStage] = useState<'showing' | 'recalling' | 'feedback' | 'finished'>('showing');
  const [targetPositions, setTargetPositions] = useState<number[]>([]);
  const [userPositions, setUserPositions] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [roundHistory, setRoundHistory] = useState<{ round: number; target: number[]; user: number[]; correct: boolean }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get n positions for current round: Round 1=3, 2=4, 3=5, 4=6, 5=7, 6=8
  const getTargetCount = (roundNum: number) => roundNum + 2;

  useEffect(() => {
    startRound(round);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [round]);

  const startRound = (roundNum: number) => {
    setUserPositions([]);
    setStage('showing');
    
    const count = getTargetCount(roundNum);
    
    // Select count random unique positions between 0 and 15
    const positions: number[] = [];
    while (positions.length < count) {
      const pos = Math.floor(Math.random() * 16);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    setTargetPositions(positions);
    setCountdown(3);

    // Countdown 3 seconds
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStage('recalling');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSquareClick = (index: number) => {
    if (stage !== 'recalling') return;

    const maxSelect = getTargetCount(round);

    if (userPositions.includes(index)) {
      // Toggle off
      setUserPositions(userPositions.filter((p) => p !== index));
    } else {
      // Toggle on if we haven't hit the limit
      if (userPositions.length < maxSelect) {
        setUserPositions([...userPositions, index]);
      }
    }
  };

  const handleConfirmSelection = () => {
    const requiredCount = getTargetCount(round);
    if (userPositions.length < requiredCount) return;

    // Check if user matches target exactly (order-independent)
    const isCorrect = targetPositions.every((p) => userPositions.includes(p)) &&
                      userPositions.every((p) => targetPositions.includes(p));

    if (isCorrect) {
      setCorrectRounds((c) => c + 1);
    }

    setRoundHistory([
      ...roundHistory,
      {
        round,
        target: targetPositions,
        user: userPositions,
        correct: isCorrect,
      }
    ]);

    setStage('feedback');
  };

  const handleNextRound = () => {
    if (round < 6) {
      setRound((r) => r + 1);
    } else {
      setStage('finished');
    }
  };

  // Score is percentage of correct rounds: (correctRounds / 6) * 100
  const score = Math.round((correctRounds / 6) * 100);

  const activeTargetCount = getTargetCount(round);

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
          <Grid className="w-5 h-5 text-teal-500" />
          <h2 className="text-lg font-bold">
            Exercici 5 — Posicions Espacials
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold">
          <span>Ronda {Math.min(6, round)} / 6</span>
        </div>
      </div>

      {stage === 'showing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md text-center max-w-md mx-auto space-y-6"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-teal-500 uppercase tracking-wider">
              Fase d'estudi — Posicions
            </span>
            <h3 className="text-lg font-bold">
              Memoritza els quadrats blaus ({activeTargetCount} quadrats)
            </h3>
          </div>

          {/* Grid showing */}
          <div className="grid grid-cols-4 gap-3 aspect-square max-w-[280px] mx-auto select-none">
            {Array.from({ length: 16 }).map((_, idx) => {
              const isBlue = targetPositions.includes(idx);
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl border transition-all duration-300 ${
                    isBlue
                      ? 'bg-sky-500 border-sky-400 shadow-md scale-102'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-mono font-bold text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <Clock className="w-4.5 h-4.5 text-teal-500 animate-pulse" />
            <span>Mostrant: {countdown}s</span>
          </div>
        </motion.div>
      )}

      {stage === 'recalling' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md max-w-md mx-auto space-y-6"
        >
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-teal-500 uppercase tracking-wider">
              Fase de record
            </span>
            <h3 className="text-lg font-bold">
              Selecciona les mateixes {activeTargetCount} posicions
            </h3>
            <p className="text-xs text-slate-400">
              Seleccionats: {userPositions.length} de {activeTargetCount}
            </p>
          </div>

          {/* Grid interactive */}
          <div className="grid grid-cols-4 gap-3 aspect-square max-w-[280px] mx-auto select-none" id="positions-grid">
            {Array.from({ length: 16 }).map((_, idx) => {
              const isSelected = userPositions.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleSquareClick(idx)}
                  className={`aspect-square rounded-xl border transition-all cursor-pointer flex items-center justify-center text-white ${
                    isSelected
                      ? 'bg-sky-500 border-sky-400 shadow-md scale-95'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-5 h-5 shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmSelection}
            disabled={userPositions.length < activeTargetCount}
            id="confirm-positions-btn"
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-base transition-colors shadow-md cursor-pointer"
          >
            Confirmar posicions
          </button>
        </motion.div>
      )}

      {stage === 'feedback' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md text-center max-w-md mx-auto space-y-6"
        >
          {roundHistory[roundHistory.length - 1].correct ? (
            <div className="space-y-2">
              <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 rounded-full">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                Coincidència perfecta!
              </h3>
              <p className="text-xs text-slate-500">
                Has seleccionat correctament tots els quadrats blaus.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="inline-flex p-3 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-full">
                <XCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                Discrepància de posicions
              </h3>
              <p className="text-xs text-slate-500">
                Algunes posicions seleccionades eren incorrectes.
              </p>
            </div>
          )}

          {/* Grid feedback */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 font-mono block mb-2 text-left">MAPA DE RETROALIMENTACIÓ VISUAL:</span>
            <div className="grid grid-cols-4 gap-2.5 aspect-square max-w-[220px] mx-auto select-none">
              {Array.from({ length: 16 }).map((_, idx) => {
                const wasTarget = targetPositions.includes(idx);
                const wasClicked = userPositions.includes(idx);

                let bgClass = 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800';
                let iconEl = null;

                if (wasTarget && wasClicked) {
                  // Hit
                  bgClass = 'bg-emerald-500 border-emerald-400 text-white';
                  iconEl = <Check className="w-3.5 h-3.5 stroke-[3]" />;
                } else if (wasTarget && !wasClicked) {
                  // Missed target
                  bgClass = 'bg-sky-50 dark:bg-sky-950/20 border-sky-400/80 border-dashed text-sky-500';
                } else if (!wasTarget && wasClicked) {
                  // Wrong click
                  bgClass = 'bg-red-500 border-red-400 text-white font-extrabold';
                  iconEl = <span className="text-[10px]">✕</span>;
                }

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-lg border flex items-center justify-center transition-all ${bgClass}`}
                  >
                    {iconEl}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-semibold pt-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
              <span>Encert</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-400 border-dashed rounded-sm"></div>
              <span>No trobat</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
              <span>Incorrecte</span>
            </div>
          </div>

          <button
            onClick={handleNextRound}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold rounded-xl text-base transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{round < 6 ? 'Començar la següent ronda' : 'Recopilar resultats'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {stage === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center max-w-md mx-auto space-y-6"
          id="positions-finished-card"
        >
          <div className="inline-flex p-4 bg-sky-100 dark:bg-sky-950/40 text-sky-500 rounded-full">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Graella de posicions completada!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              S'han completat 6 rondes de memòria espacial ascendent.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">RONDES CORRECTES</span>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {correctRounds} / 6
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">PUNTUACIÓ</span>
              <span className="text-2xl font-extrabold text-teal-500 dark:text-teal-400 font-mono">
                {score}%
              </span>
            </div>
          </div>

          {/* Audit trail */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 text-left space-y-2">
            <span className="text-xs text-slate-400 font-bold block mb-1 font-mono font-bold">AUDITORIA RONDA PER RONDA:</span>
            {roundHistory.map((h, i) => (
              <div key={i} className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                <span>Ronda {h.round} ({h.target.length} nodes)</span>
                <span className={h.correct ? 'text-emerald-500 font-bold' : 'text-red-500'}>
                  {h.correct ? '✔️ Correcte' : '❌ Incorrecte'}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onComplete(score, correctRounds)}
            id="finish-positions-btn"
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-xl text-base transition-colors shadow-md cursor-pointer"
          >
            Finalitzar i tornar al menú
          </button>
        </motion.div>
      )}
    </div>
  );
}

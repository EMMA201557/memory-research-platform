/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Workflow, Clock, ArrowLeft, Trophy, Check, ArrowRight, CornerDownLeft, XCircle, CheckCircle2 } from 'lucide-react';
import { getSetFromCode, normalizeWord } from '../data/words';
import { ASSOCIATION_POOLS, AssociationPair } from '../data/associations';
import { AssociationDetail } from '../types';

interface Ex4AssociationsProps {
  participantCode: string;
  onComplete: (score: number, hits: number, errors: number, details: AssociationDetail[]) => void;
  onBackToMenu: () => void;
}

export default function Ex4Associations({ participantCode, onComplete, onBackToMenu }: Ex4AssociationsProps) {
  const setIndex = getSetFromCode(participantCode);
  const associationPool = ASSOCIATION_POOLS[setIndex] || ASSOCIATION_POOLS[1];

  const [targetPairs, setTargetPairs] = useState<AssociationPair[]>([]);
  const [stage, setStage] = useState<'study' | 'test' | 'result'>('study');
  const [countdown, setCountdown] = useState(30);
  const [testIndex, setTestIndex] = useState(0); // 0 to 9
  const [currentInput, setCurrentInput] = useState('');
  const [testHistory, setTestHistory] = useState<AssociationDetail[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Select 10 random pairs from pool
    const selected = [...associationPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    setTargetPairs(selected);

    // Setup 30s countdown
    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStage('test');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSkipStudy = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStage('test');
  };

  const handleAnswerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentPair = targetPairs[testIndex];
    const got = currentInput.trim();
    const correct = normalizeWord(got) === normalizeWord(currentPair.word2);

    const detail: AssociationDetail = {
      word: currentPair.word1,
      expected: currentPair.word2,
      got: got,
      correct: correct,
    };

    const nextHistory = [...testHistory, detail];
    setTestHistory(nextHistory);
    setCurrentInput('');

    if (testIndex < 9) {
      setTestIndex((idx) => idx + 1);
    } else {
      // Completed all 10
      setStage('result');
    }
  };

  const hits = testHistory.filter((item) => item.correct).length;
  const errors = 10 - hits;
  const score = hits * 10; // 0 to 100

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
          <Workflow className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-bold">
            Exercici 4 — Associacions Verbals
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold">
          <span>Conjunt {setIndex}</span>
        </div>
      </div>

      {stage === 'study' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md text-center max-w-2xl mx-auto space-y-6"
        >
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">
              Fase d'estudi — Associacions de Parelles
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Recorda aquestes 10 parelles de paraules
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Dedica 30 segons a relacionar aquestes associacions.
            </p>
          </div>

          {/* Pairs grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4" id="association-study-grid">
            {targetPairs.map((pair, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className="p-3 bg-violet-50/40 dark:bg-slate-800/80 border border-violet-100/50 dark:border-slate-700/80 rounded-xl flex items-center justify-between text-sm shadow-sm"
              >
                <span className="font-bold text-slate-700 dark:text-slate-300">{pair.word1}</span>
                <span className="text-violet-400 dark:text-violet-600 font-bold font-mono">→</span>
                <span className="font-bold text-violet-700 dark:text-violet-400">{pair.word2}</span>
              </motion.div>
            ))}
          </div>

          {/* Countdown & skip */}
          <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-500">
              <Clock className="w-5 h-5 text-violet-500 animate-pulse" />
              <span>TEMPS RESTANT: {countdown}s</span>
            </div>
            <button
              onClick={handleSkipStudy}
              className="px-6 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-semibold rounded-xl text-sm transition-colors border border-violet-200/40 dark:border-violet-900/30 cursor-pointer"
            >
              Estic a punt (Omet l'estudi)
            </button>
          </div>
        </motion.div>
      )}

      {stage === 'test' && targetPairs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md max-w-md mx-auto space-y-6"
        >
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">
              Fase de record de parelles
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Recorda la segona paraula
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Escriu la paraula aparellada per a la paraula clau de sota.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-850 flex justify-between items-center text-xs font-mono text-slate-400 font-bold mb-4">
            <span>PROGRÉS DE PARELLES:</span>
            <span>{testIndex + 1} DE 10</span>
          </div>

          {/* Prompt card */}
          <div className="p-6 bg-violet-50/20 dark:bg-slate-800/50 rounded-2xl border border-violet-100/50 dark:border-slate-700/80 text-center space-y-4">
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest block font-mono">PARAULA CLAU:</span>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white block">
              {targetPairs[testIndex].word1}
            </span>
            <span className="text-violet-400 font-bold text-xl block">↓</span>
          </div>

          {/* Input field */}
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <div>
              <label htmlFor="assoc-input" className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                La teva resposta:
              </label>
              <input
                type="text"
                id="assoc-input"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-base"
                placeholder="Escriu la paraula aparellada..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>

            <button
              type="submit"
              id="assoc-submit-btn"
              className="w-full py-3.5 bg-violet-500 hover:bg-violet-600 text-white font-semibold rounded-xl text-base shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CornerDownLeft className="w-5 h-5" />
              <span>{testIndex < 9 ? 'Següent parella' : 'Comprovar respostes'}</span>
            </button>
          </form>
        </motion.div>
      )}

      {stage === 'result' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center max-w-xl mx-auto space-y-6"
          id="associations-result-card"
        >
          <div className="inline-flex p-4 bg-violet-100 dark:bg-violet-950/40 text-violet-500 rounded-full">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Record d'associacions finalitzat!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              S'han posat a prova i avaluat automàticament 10 camins associatius.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">ENCERTS</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {hits} / 10
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">ERRORS</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {errors}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">PUNTUACIÓ</span>
              <span className="text-xl font-extrabold text-violet-500 dark:text-violet-400 font-mono">
                {score}%
              </span>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="text-left pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono block mb-1">AUDITORIA DEL REGISTRE D'ASSOCIACIONS:</span>
            
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {testHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                    item.correct
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/20'
                      : 'bg-red-50/40 dark:bg-red-950/10 border-red-100/50 dark:border-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.word}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-violet-600 dark:text-violet-400">{item.expected}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-400">Introduït:</span>
                    <span className={`font-mono font-semibold ${item.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 line-through'}`}>
                      {item.got || '[buit]'}
                    </span>
                    {item.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onComplete(score, hits, errors, testHistory)}
            id="finish-associations-btn"
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-xl text-base transition-colors shadow-md cursor-pointer"
          >
            Finalitzar i tornar al menú
          </button>
        </motion.div>
      )}
    </div>
  );
}

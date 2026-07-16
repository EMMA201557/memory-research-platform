/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Clock, ArrowLeft, Trophy, Check, Plus, Trash2, HelpCircle, X } from 'lucide-react';
import { getSetFromCode, WORD_POOLS, normalizeWord } from '../data/words';

interface Ex3WordsProps {
  participantCode: string;
  onComplete: (score: number, hits: number, forgotten: string[], entered: string[]) => void;
  onBackToMenu: () => void;
}

export default function Ex3Words({ participantCode, onComplete, onBackToMenu }: Ex3WordsProps) {
  const setIndex = getSetFromCode(participantCode);
  const wordPool = WORD_POOLS[setIndex] || WORD_POOLS[1];

  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [stage, setStage] = useState<'study' | 'recall' | 'result'>('study');
  const [countdown, setCountdown] = useState(30);
  const [inputValue, setInputValue] = useState('');
  const [enteredWords, setEnteredWords] = useState<string[]>([]);
  const [results, setResults] = useState<{
    correctCount: number;
    recalled: string[];
    forgotten: string[];
    extraEntered: string[];
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Select 12 random words from pool
    const selected = [...wordPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
    setTargetWords(selected);

    // Setup 30s countdown
    setCountdown(30);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStage('recall');
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
    setStage('recall');
  };

  const handleAddWord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const word = inputValue.trim();
    if (!word) return;

    // Check if word already added
    const normalizedNew = normalizeWord(word);
    const alreadyExists = enteredWords.some((w) => normalizeWord(w) === normalizedNew);

    if (!alreadyExists) {
      setEnteredWords([...enteredWords, word]);
    }
    setInputValue('');
  };

  const handleRemoveWord = (index: number) => {
    setEnteredWords(enteredWords.filter((_, i) => i !== index));
  };

  const handleFinishRecall = () => {
    // Compile results
    const recalled: string[] = [];
    const forgotten: string[] = [];
    const extraEntered: string[] = [];

    const targetNormalized = targetWords.map((w) => normalizeWord(w));
    const enteredNormalized = enteredWords.map((w) => normalizeWord(w));

    // Determine correct (recalled) and forgotten
    targetWords.forEach((word) => {
      const norm = normalizeWord(word);
      if (enteredNormalized.includes(norm)) {
        recalled.push(word);
      } else {
        forgotten.push(word);
      }
    });

    // Find any extra entries that don't match any target
    enteredWords.forEach((word) => {
      const norm = normalizeWord(word);
      if (!targetNormalized.includes(norm)) {
        extraEntered.push(word);
      }
    });

    setResults({
      correctCount: recalled.length,
      recalled,
      forgotten,
      extraEntered,
    });

    setStage('result');
  };

  // Score is percentage of hits: (recalled.length / 12) * 100
  const score = results ? Math.round((results.correctCount / 12) * 100) : 0;

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
          <FileText className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold">
            Exercici 3 — Memòria de Paraules
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
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
              Fase d'estudi — Memoritza
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Memoritza aquestes 12 paraules
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Tens 30 segons per memoritzar el màxim de paraules possible.
            </p>
          </div>

          {/* Words list 4x3 grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-6" id="word-study-grid">
            {targetWords.map((word, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 bg-indigo-50/40 dark:bg-slate-800/80 border border-indigo-100/50 dark:border-slate-700/80 rounded-xl font-semibold text-lg text-indigo-800 dark:text-indigo-300 shadow-sm flex items-center justify-center select-none"
              >
                {word}
              </motion.div>
            ))}
          </div>

          {/* Countdown & skip */}
          <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-slate-500">
              <Clock className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>TEMPS RESTANT: {countdown}s</span>
            </div>
            <button
              onClick={handleSkipStudy}
              className="px-6 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-sm transition-colors border border-indigo-200/40 dark:border-indigo-900/30 cursor-pointer"
            >
              Estic a punt (Omet l'estudi)
            </button>
          </div>
        </motion.div>
      )}

      {stage === 'recall' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md max-w-xl mx-auto space-y-6"
        >
          <div className="text-center space-y-1">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
              Fase de record
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Escriu totes les paraules que recordis
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              S'ignoren els accents i les majúscules no importen. Prem Retorn per enviar cada paraula.
            </p>
          </div>

          {/* Add word form */}
          <form onSubmit={handleAddWord} className="flex gap-2">
            <input
              type="text"
              id="word-recall-input"
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Escriu la paraula aquí..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
            />
            <button
              type="submit"
              className="px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              title="Afegeix paraula a la llista"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Entered words lists */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              PARAULES RECORDADES ({enteredWords.length}):
            </span>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 p-4 min-h-24 flex flex-wrap gap-2 content-start">
              {enteredWords.length === 0 ? (
                <div className="text-slate-400 dark:text-slate-600 text-sm italic w-full text-center py-6 flex flex-col items-center justify-center gap-1">
                  <HelpCircle className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                  <span>Encara no s'ha introduït cap paraula. Escriu a dalt i prem Retorn.</span>
                </div>
              ) : (
                <AnimatePresence>
                  {enteredWords.map((word, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100/50 dark:border-slate-700 text-sm font-semibold"
                    >
                      <span>{word}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWord(idx)}
                        className="text-indigo-400 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Done and review button */}
          <button
            onClick={handleFinishRecall}
            id="submit-words-btn"
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Finalitzar i comprovar respostes</span>
          </button>
        </motion.div>
      )}

      {stage === 'result' && results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-center max-w-xl mx-auto space-y-6"
          id="words-result-card"
        >
          <div className="inline-flex p-4 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 rounded-full">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Record de paraules completat!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Resultats calculats mitjançant normalitzadors d'equivalència automatitzats.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">RESPOSTES CORRECTES</span>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {results.correctCount} / 12
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">PUNTUACIÓ FINAL</span>
              <span className="text-2xl font-extrabold text-indigo-500 dark:text-indigo-400 font-mono">
                {score}%
              </span>
            </div>
          </div>

          {/* Recalled lists */}
          <div className="text-left space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Correct recalled words */}
            <div>
              <span className="text-xs font-bold text-emerald-500 font-mono block mb-2">RECORDADES CORRECTAMENT:</span>
              {results.recalled.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Cap</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.recalled.map((w, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-100/50 dark:border-emerald-900/30 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{w}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Forgotten words */}
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono block mb-2">PARAULES OBLIDADES:</span>
              {results.forgotten.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Cap! Excel·lent treball!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.forgotten.map((w, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-lg border border-amber-100/50 dark:border-amber-900/30 flex items-center gap-1">
                      <X className="w-3 h-3 text-amber-500" />
                      <span>{w}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Extras */}
            {results.extraEntered.length > 0 && (
              <div>
                <span className="text-xs font-bold text-red-400 font-mono block mb-2">EXTRA RECORDADES (SENSE COINCIDÈNCIA):</span>
                <div className="flex flex-wrap gap-2">
                  {results.extraEntered.map((w, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-100/50 dark:border-red-950/20">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onComplete(score, results.correctCount, results.forgotten, enteredWords)}
            id="finish-words-btn"
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-xl text-base transition-colors shadow-md cursor-pointer"
          >
            Finalitzar i tornar al menú
          </button>
        </motion.div>
      )}
    </div>
  );
}

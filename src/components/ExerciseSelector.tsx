/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Brain,
  Hash,
  FileText,
  Workflow,
  Grid,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  PartyPopper
} from 'lucide-react';
import { ExerciseStatus, ExerciseScores } from '../types';

interface ExerciseSelectorProps {
  status: ExerciseStatus;
  scores: ExerciseScores;
  onSelectExercise: (exId: 'ex1' | 'ex2' | 'ex3' | 'ex4' | 'ex5') => void;
  onBackToDashboard: () => void;
  onViewStats: () => void;
}

export default function ExerciseSelector({
  status,
  scores,
  onSelectExercise,
  onBackToDashboard,
  onViewStats
}: ExerciseSelectorProps) {
  const completedCount = Object.values(status).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 5) * 100);
  const isAllCompleted = completedCount === 5;

  const exerciseDetails = [
    {
      id: 'ex1' as const,
      title: "Exercici 1 — Targetes de Memòria",
      description: "Emparella targetes en una quadrícula de 5 × 4 en el menor temps possible.",
      icon: Brain,
      color: "from-blue-400 to-blue-500",
      bgLight: "bg-blue-50/50 dark:bg-blue-950/10",
      textCol: "text-blue-600 dark:text-blue-400"
    },
    {
      id: 'ex2' as const,
      title: "Exercici 2 — Retenció de Seqüències",
      description: "Memoritza i reprodueix una seqüència d'emojis en creixement.",
      icon: Hash,
      color: "from-sky-400 to-sky-500",
      bgLight: "bg-sky-50/50 dark:bg-sky-950/10",
      textCol: "text-sky-600 dark:text-sky-400"
    },
    {
      id: 'ex3' as const,
      title: "Exercici 3 — Memòria de Llista de Paraules",
      description: "Memoritza 12 paraules aleatòries durant 30 segons i escriu totes les que recordis.",
      icon: FileText,
      color: "from-indigo-400 to-indigo-500",
      bgLight: "bg-indigo-50/50 dark:bg-indigo-950/10",
      textCol: "text-indigo-600 dark:text-indigo-400"
    },
    {
      id: 'ex4' as const,
      title: "Exercici 4 — Associacions Verbals",
      description: "Recorda 10 parelles de paraules i després troba la parella que falta.",
      icon: Workflow,
      color: "from-violet-400 to-violet-500",
      bgLight: "bg-violet-50/50 dark:bg-violet-950/10",
      textCol: "text-violet-600 dark:text-violet-400"
    },
    {
      id: 'ex5' as const,
      title: "Exercici 5 — Posicions Espacials",
      description: "Recorda els quadrats de la quadrícula pintats de blau al llarg de 6 rondes de dificultat creixent.",
      icon: Grid,
      color: "from-teal-400 to-teal-500",
      bgLight: "bg-teal-50/50 dark:bg-teal-950/10",
      textCol: "text-teal-600 dark:text-teal-400"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back navigation */}
        {!isAllCompleted && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Avorta l'entrenament i torna al tauler</span>
          </button>
        )}

        {/* Progress header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                 Progrés de l'entrenament d'avui
               </h2>
               <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                 Completa els cinc exercicis cognitius en qualsevol ordre per desar la sessió d'avui.
               </p>
             </div>
             <div className="text-right shrink-0">
               <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400" id="progress-indicator">
                 {completedCount} / 5
               </span>
               <span className="text-xs text-slate-400 dark:text-slate-500 block">Completat</span>
             </div>
          </div>

          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-blue-600 h-full rounded-full"
            ></motion.div>
          </div>
        </div>

        {/* Main selector body */}
        {isAllCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/30 dark:border-blue-500/20 p-8 shadow-xl text-center space-y-6"
            id="training-complete-banner"
          >
            <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-full">
              <PartyPopper className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Entrenament completat!
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Ens veiem al proper entrenament.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto mt-2">
                Les teves mètriques de rendiment han estat recopilades i estan a punt per ser registrades al repositori segur de recerca de Google Sheets.
              </p>
            </div>

            <button
              onClick={onViewStats}
              id="view-results-btn"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-xl text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
            >
              <span>Veure resultats i desar entrenament</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {exerciseDetails.map((ex, index) => {
              const isDone = status[ex.id];
              return (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`group relative overflow-hidden rounded-2xl border transition-all p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 opacity-80'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/40 hover:shadow-md'
                  }`}
                  id={`exercise-card-${ex.id}`}
                >
                  <div className="flex gap-4 items-start sm:items-center">
                    <div className={`p-3 rounded-xl shrink-0 ${ex.bgLight} ${ex.textCol} transition-colors group-hover:scale-105 duration-200`}>
                      <ex.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        {ex.title}
                        {isDone && (
                          <span className="text-emerald-500 text-sm font-semibold flex items-center gap-1 shrink-0" id={`exercise-done-label-${ex.id}`}>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Fet</span>
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {ex.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectExercise(ex.id)}
                    id={`exercise-btn-${ex.id}`}
                    disabled={isDone}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shrink-0 w-full sm:w-auto ${
                      isDone
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white cursor-pointer font-bold'
                    }`}
                  >
                    {isDone ? 'Completat' : 'Comença'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

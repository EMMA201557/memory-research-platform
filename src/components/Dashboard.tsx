/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Brain,
  CheckCircle,
  Clock,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { Participant, SessionResult, ParticipantStats } from '../types';
import { getSetFromCode } from '../data/words';
import { MEMORY_THEMES } from '../data/memoryCards';

interface DashboardProps {
  participant: Participant;
  isBlockedToday: boolean;
  sessionHistory: SessionResult[];
  onStartTraining: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  googleScriptUrl: string;
}

export default function Dashboard({
  participant,
  isBlockedToday,
  sessionHistory,
  onStartTraining,
  onLogout,
  theme,
  onToggleTheme,
  googleScriptUrl
}: DashboardProps) {
  // Filter sessions for this participant
  const mySessions = sessionHistory.filter(
    (s) => s.code.toUpperCase() === participant.code.toUpperCase()
  );

  // Calculate stats
  const uniqueDates = Array.from(new Set(mySessions.map((s) => s.date))).sort();
  const totalSessions = mySessions.length;

  const averageScore = totalSessions
    ? Math.round(mySessions.reduce((acc, s) => acc + s.totalScore, 0) / totalSessions)
    : 0;

  const bestScore = totalSessions
    ? Math.max(...mySessions.map((s) => s.totalScore))
    : 0;

  // Streak calculation
  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    // Sort descending (newest first)
    const sortedDesc = [...dates].sort((a, b) => b.localeCompare(a));
    const uniqueSorted = Array.from(new Set(sortedDesc));

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If the newest date is neither today nor yesterday, streak is broken
    if (uniqueSorted[0] !== todayStr && uniqueSorted[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    let currentCheck = new Date(uniqueSorted[0]);

    for (let i = 1; i < uniqueSorted.length; i++) {
      const d = new Date(uniqueSorted[i]);
      const diffTime = Math.abs(currentCheck.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentCheck = d;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak(uniqueDates);
  const targetSessions = 18; // 3 sessions/wk * 6 wks
  const percentageCompleted = Math.min(
    100,
    Math.round((totalSessions / targetSessions) * 100)
  );

  // Get active set mapping details
  const setIndex = getSetFromCode(participant.code);
  const themeInfo = MEMORY_THEMES[setIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col justify-between">
      <div>
        {/* Header Navigation */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
              <Brain className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Laboratori d'Entrenament <span className="text-blue-600 dark:text-blue-500">Cognitiu</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Participant</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {participant.name} · {participant.code}
              </p>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors cursor-pointer"
                title="Canviar el tema"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                Tancar la sessió
              </button>
            </div>
          </div>
        </header>

        {/* Main 12-Column Layout */}
        <main className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-12 gap-8 items-start">
          {/* Left Column: Personal Progress Stats */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Program Completion Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Progrés del programa</h2>
              <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentageCompleted}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                ></motion.div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400" id="stats-program-percentage">
                  {totalSessions} de {targetSessions} sessions completades
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{percentageCompleted}%</span>
              </div>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase mb-1">Ratxa actual</p>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100" id="stats-streak">
                  {currentStreak} <span className="text-sm font-medium text-slate-500">Dies</span>
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase mb-1">Puntuació mitjana</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400" id="stats-avg-score">
                  {averageScore}<span className="text-sm font-medium">%</span>
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center col-span-2 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Millor marca personal</p>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-0.5" id="stats-best-score">{bestScore}% de precisió</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Sessions totals</p>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-0.5" id="stats-total-sessions">{totalSessions}</p>
                </div>
              </div>
            </div>

            {/* Weekly Schedule Card */}
            <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-lg shadow-blue-200/50 dark:shadow-none">
              <h3 className="font-bold text-lg mb-2">Planificació setmanal</h3>
              <p className="text-blue-100 text-sm mb-6">Completa 3 sessions per setmana per mantenir una fidelitat d'entrenament òptima.</p>
              <div className="flex justify-between">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    mySessions.some(s => {
                      const d = new Date(s.date).getDay();
                      return d === 1; // Mon
                    }) ? 'bg-white text-blue-600' : 'bg-blue-700 text-blue-200'
                  }`}>
                    {mySessions.some(s => new Date(s.date).getDay() === 1) ? '✓' : 'L'}
                  </div>
                  <span className="text-xs font-bold uppercase font-mono">Dilluns</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    mySessions.some(s => {
                      const d = new Date(s.date).getDay();
                      return d === 3; // Wed
                    }) ? 'bg-white text-blue-600' : 'bg-blue-700 text-blue-200'
                  }`}>
                    {mySessions.some(s => new Date(s.date).getDay() === 3) ? '✓' : 'C'}
                  </div>
                  <span className="text-xs font-bold uppercase font-mono">Dimecres</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    mySessions.some(s => {
                      const d = new Date(s.date).getDay();
                      return d === 5; // Fri
                    }) ? 'bg-white text-blue-600' : 'bg-blue-700 text-blue-200'
                  }`}>
                    {mySessions.some(s => new Date(s.date).getDay() === 5) ? '✓' : 'V'}
                  </div>
                  <span className="text-xs font-bold uppercase font-mono">Divendres</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Exercises & Training */}
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white" id="dashboard-title">
                  Entrenament diari
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 capitalize">
                  Sessió #{totalSessions + 1} · {new Date().toLocaleDateString('ca-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-850 px-4 py-2 rounded-full text-slate-700 dark:text-slate-300">
                <span className="text-xs font-bold uppercase tracking-wide">Estat:</span>
                <span className="text-sm font-black" id="blocked-alert">
                  {isBlockedToday ? '100% Completat' : '0/5 Completat'}
                </span>
              </div>
            </div>

            {/* Main Welcome/Information Area */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-base relative z-10">
                <p className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                  Benvingut/da, {participant.name}!
                </p>
                <p>
                  Aquesta aplicació forma part d'un Projecte de Recerca sobre la memòria humana.
                  L'entrenament consta de 5 exercicis de memòria cognitiva. Es triga aproximadament 10 minuts a completar-se, i recomanem fer-lo <strong>3 dies a la setmana</strong> durant 6 setmanes.
                </p>

                <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/60 dark:border-blue-900/30 rounded-xl p-4 flex gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-850 dark:text-blue-300">
                      Assignació de balanç experimental: Conjunt del Grup {setIndex}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      El teu codi ({participant.code}) està enllaçat amb la baralla de memòria <strong>\"{themeInfo.name}\"</strong>, amb col·leccions de paraules controlades per preservar la precisió dels paràmetres de dificultat.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                {isBlockedToday ? (
                  <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-semibold text-amber-800 dark:text-amber-400">
                        Ja has completat el teu entrenament d'avui.
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        Per preservar la integritat científica de la planificació de recerca de 6 setmanes, només es permet una sessió d'entrenament al dia. Si us plau, torna demà!
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={onStartTraining}
                    id="start-training-btn"
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <Brain className="w-6 h-6" />
                    <span>Començar la sessió d'entrenament d'avui</span>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </section>
        </main>
      </div>

      {/* Footer Message Bar */}
      <footer className="bg-slate-800 dark:bg-slate-900 text-white px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-700 dark:border-slate-800 mt-12">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Emmagatzematge local actiu · A punt</span>
        </div>
        <div className="text-xs text-slate-400 text-center sm:text-right">
          La sessió se sincronitzarà automàticament amb Google Sheets en completar-se.
        </div>
      </footer>
    </div>
  );
}

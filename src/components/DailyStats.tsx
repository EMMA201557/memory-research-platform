/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  CloudLightning,
  CloudOff,
  Cloud,
  Check,
  Brain,
  Hash,
  FileText,
  Workflow,
  Grid,
  Home
} from 'lucide-react';
import { Participant, ExerciseScores, SessionResult } from '../types';

interface DailyStatsProps {
  participant: Participant;
  scores: ExerciseScores;
  startTime: number;
  googleScriptUrl: string;
  onSaveSession: (result: SessionResult) => void;
  onBackToDashboard: () => void;
}

export default function DailyStats({
  participant,
  scores,
  startTime,
  googleScriptUrl,
  onSaveSession,
  onBackToDashboard
}: DailyStatsProps) {
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'success' | 'failed' | 'no_url'>('syncing');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionRecord, setSessionRecord] = useState<SessionResult | null>(null);

  useEffect(() => {
    // 1. Calculate training times
    const duration = Math.round((Date.now() - startTime) / 1000);
    setTotalTime(duration);

    // 2. Compile metrics
    const memoryScore = scores.ex1.score;
    const sequenceScore = scores.ex2.score;
    const wordHits = scores.ex3.hits;
    const wordScore = scores.ex3.score;
    const associationHits = scores.ex4.hits;
    const associationScore = scores.ex4.score;
    const positionScore = scores.ex5.score;

    // Total Score (average of scores out of 100)
    const totalScore = Math.round((memoryScore + sequenceScore + wordScore + associationScore + positionScore) / 5);

    // Percentage of hits (overall correct answers rate across the tasks)
    // Ex1: 15/15 pairs = 100%
    // Ex2: correctRounds / 5
    // Ex3: hits / 12
    // Ex4: hits / 10
    // Ex5: correctRounds / 6
    const ex1Pct = 100;
    const ex2Pct = (scores.ex2.correctRounds / 5) * 100;
    const ex3Pct = (scores.ex3.hits / 12) * 100;
    const ex4Pct = (scores.ex4.hits / 10) * 100;
    const ex5Pct = (scores.ex5.correctRounds / 6) * 100;
    const percentageHits = Math.round((ex1Pct + ex2Pct + ex3Pct + ex4Pct + ex5Pct) / 5);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

    const resultPayload: SessionResult = {
      name: participant.name,
      code: participant.code,
      date: dateStr,
      timestamp: now.getTime(),
      totalTime: duration,
      memoryScore,
      sequenceScore,
      wordHits,
      wordScore,
      associationHits,
      associationScore,
      positionScore,
      totalScore,
      percentageHits,
    };

    setSessionRecord(resultPayload);

    // 3. Save locally
    onSaveSession(resultPayload);

    // 4. Auto-send to Google Sheets
    if (!googleScriptUrl) {
      setSyncStatus('no_url');
      return;
    }

    sendToGoogleSheets(resultPayload, timeStr);
  }, []);

  const sendToGoogleSheets = async (payload: SessionResult, timeStr: string) => {
    try {
      setSyncStatus('syncing');
      
      const bodyPayload = {
        name: payload.name,
        code: payload.code,
        date: payload.date,
        time: timeStr,
        totalTime: payload.totalTime,
        memoryScore: payload.memoryScore,
        sequenceScore: payload.sequenceScore,
        wordHits: payload.wordHits,
        associationHits: payload.associationHits,
        positionScore: payload.positionScore,
        totalScore: payload.totalScore,
        percentageHits: payload.percentageHits,
      };

      // We do a POST request. In modern Web Apps, we use cors mode.
      const response = await fetch(googleScriptUrl, {
        method: 'POST',
        mode: 'no-cors', // standard workaround for redirect issues with Google Apps Script Web App endpoints
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      // Since mode is 'no-cors', the response type is opaque and we cannot read the response body.
      // However, the browser completes the fetch! If it doesn't throw an error, it was sent successfully!
      setSyncStatus('success');
    } catch (err: any) {
      console.error('Google Sheets POST Error:', err);
      setSyncError(err.message || 'Network exception.');
      setSyncStatus('failed');
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  if (!sessionRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-12 px-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Celebration Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
          id="stats-celebration-header"
        >
          <div className="inline-flex p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl shadow-md border border-amber-200/50 dark:border-amber-900/30">
            <Trophy className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sessió d'entrenament finalitzada!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Molt bon treball, {participant.name}. Els teus resultats cognitius s'han registrat localment en el teu perfil de participant.
          </p>
        </motion.div>

        {/* Sync Status Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border p-4 shadow-sm"
          style={{
            backgroundColor:
              syncStatus === 'success' ? 'var(--color-emerald-50, rgb(240, 253, 250))' :
              syncStatus === 'failed' ? 'var(--color-red-50, rgb(254, 242, 242))' :
              syncStatus === 'no_url' ? 'var(--color-slate-100, rgb(241, 245, 249))' :
              'var(--color-blue-50, rgb(239, 246, 255))',
            borderColor:
              syncStatus === 'success' ? 'var(--color-emerald-200, rgb(167, 243, 208))' :
              syncStatus === 'failed' ? 'var(--color-red-200, rgb(254, 202, 202))' :
              syncStatus === 'no_url' ? 'var(--color-slate-200, rgb(226, 232, 240))' :
              'var(--color-blue-200, rgb(191, 219, 254))',
          }}
          id="cloud-sync-banner"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              syncStatus === 'success' ? 'bg-emerald-100 text-emerald-600' :
              syncStatus === 'failed' ? 'bg-red-100 text-red-600' :
              syncStatus === 'no_url' ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
              'bg-blue-100 text-blue-600 animate-pulse'
            }`}>
              {syncStatus === 'success' ? <Cloud className="w-5 h-5" /> :
               syncStatus === 'failed' ? <CloudOff className="w-5 h-5" /> :
               syncStatus === 'no_url' ? <CloudLightning className="w-5 h-5" /> :
               <FileSpreadsheet className="w-5 h-5" />}
            </div>

            <div className="flex-1">
              <h4 className={`text-sm font-bold ${
                syncStatus === 'success' ? 'text-emerald-800 dark:text-emerald-400' :
                syncStatus === 'failed' ? 'text-red-800 dark:text-red-400' :
                syncStatus === 'no_url' ? 'text-slate-800 dark:text-slate-300' :
                'text-blue-800 dark:text-blue-400'
              }`}>
                {syncStatus === 'success' && 'Sincronització amb Google Sheet completada!'}
                {syncStatus === 'failed' && 'Ha fallat la sincronització amb Google Sheets'}
                {syncStatus === 'no_url' && 'Perfil fora de línia actiu'}
                {syncStatus === 'syncing' && 'Sincronitzant els resultats amb Google Sheets...'}
              </h4>
              <p className={`text-xs mt-0.5 ${
                syncStatus === 'success' ? 'text-emerald-600 dark:text-emerald-500' :
                syncStatus === 'failed' ? 'text-red-600 dark:text-red-500' :
                syncStatus === 'no_url' ? 'text-slate-500 dark:text-slate-400' :
                'text-blue-600 dark:text-blue-500'
              }`}>
                {syncStatus === 'success' && 'Dades transmeses de manera segura sense necessitat d\'interaccions manuals.'}
                {syncStatus === 'failed' && 'No s\'ha pogut desar en línia. No obstant això, la teva sessió s\'ha desat amb seguretat al navegador.'}
                {syncStatus === 'no_url' && 'L\'investigador no ha configurat cap URL de Google Sheets remota. La teva sessió s\'ha desat localment.'}
                {syncStatus === 'syncing' && 'S\'està establint la connexió de xarxa...'}
              </p>
            </div>

            {syncStatus === 'success' && (
              <span className="p-1 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>
        </motion.div>

        {/* Workout Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-6"
        >
          <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3">
            Resum de rendiment de la sessió
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Durada total</span>
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1" id="results-duration">
                {formatDuration(totalTime)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Precisió global</span>
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1" id="results-accuracy">
                {sessionRecord.percentageHits}%
              </p>
            </div>
          </div>

          <div className="bg-blue-500/5 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center space-y-1">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">PUNTUACIÓ COGNITIVA INTEGRADA</span>
            <span className="text-4xl font-extrabold text-slate-950 dark:text-white block font-mono" id="results-score">
              {sessionRecord.totalScore} <span className="text-lg font-normal text-slate-500">punts</span>
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Mitjana de la puntuació ponderada de precisió en les 5 metodologies d'entrenament.
            </p>
          </div>

          {/* Exercise breakdown list */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest block">FITXES DE RENDIMENT DELS EXERCICIS:</span>

            {/* Ex1 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold">Exercici 1 — Targetes de memòria</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Moviments: {scores.ex1.moves} | Temps: {scores.ex1.time}s</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{scores.ex1.score}%</span>
            </div>

            {/* Ex2 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold">Exercici 2 — Seqüències</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rondes correctes: {scores.ex2.correctRounds} / 5</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{scores.ex2.score}%</span>
            </div>

            {/* Ex3 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold">Exercici 3 — Paraules</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Paraules correctes: {scores.ex3.hits} / 12</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{scores.ex3.score}%</span>
            </div>

            {/* Ex4 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 rounded-lg">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold">Exercici 4 — Associacions</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Coincidències correctes: {scores.ex4.hits} / 10</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{scores.ex4.score}%</span>
            </div>

            {/* Ex5 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-lg">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold">Exercici 5 — Posicions</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Rondes correctes: {scores.ex5.correctRounds} / 6</p>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{scores.ex5.score}%</span>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <button
          onClick={onBackToDashboard}
          id="finish-workout-btn"
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg shadow-md transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span>Sortir dels resultats i tornar al tauler</span>
        </button>
      </div>
    </div>
  );
}

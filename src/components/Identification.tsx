/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Key, AlertCircle } from 'lucide-react';
import { Participant, SessionResult } from '../types';

interface IdentificationProps {
  onLoginSuccess: (participant: Participant, isBlocked: boolean) => void;
  sessionHistory: SessionResult[];
}

export default function Identification({ onLoginSuccess, sessionHistory }: IdentificationProps) {
  const [nameInput, setNameInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchParticipants() {
      try {
        const res = await fetch('/participants.csv');
        if (!res.ok) throw new Error('Could not fetch participants CSV');
        const text = await res.text();
        const lines = text.split('\n');
        const parsedList: Participant[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(',');
          if (parts.length >= 2) {
            parsedList.push({
              name: parts[0].trim(),
              code: parts[1].trim(),
            });
          }
        }
        setParticipants(parsedList);
      } catch (err) {
        console.error('Error loading participants.csv:', err);
        // Fallback authorized users if network is blocked
        setParticipants([
          { name: 'Emma', code: 'A014' },
          { name: 'Lucas', code: 'A001' },
          { name: 'Sophia', code: 'A002' },
          { name: 'Oliver', code: 'A003' },
          { name: 'Amelia', code: 'A004' },
          { name: 'Mia', code: 'A005' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchParticipants();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const nameTrimmed = nameInput.trim();
    const codeTrimmed = codeInput.trim().toUpperCase();

    if (!nameTrimmed || !codeTrimmed) {
      setErrorMsg('Si us plau, introduïu tant el nom com el codi del participant.');
      return;
    }

    // Verify against participants list (case insensitive name check, exact code check)
    const matched = participants.find(
      (p) =>
        p.name.toLowerCase() === nameTrimmed.toLowerCase() &&
        p.code.toUpperCase() === codeTrimmed
    );

    if (!matched) {
      setErrorMsg('Nom o codi incorrectes.');
      return;
    }

    // Check if they already did a session today (local YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    const hasTrainedToday = sessionHistory.some(
      (s) => s.code.toUpperCase() === codeTrimmed && s.date === todayStr
    );

    // Pass the participant details upwards
    onLoginSuccess(matched, hasTrainedToday);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 p-8"
        id="login-card"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" id="login-title">
            Portal del Projecte de Recerca
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Estudi d'Entrenament de la Memòria Humana
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-slate-500 mt-2">S'estan carregant les credencials...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nom del participant
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="name"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-colors duration-200"
                  placeholder="ex. Emma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Codi del participant
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="code"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-colors duration-200"
                  placeholder="ex. A014"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              id="login-btn"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              Iniciar sessió
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-150 dark:border-slate-800/60 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Només per a ús acadèmic. La llista de participants autoritzats es gestiona a `participants.csv`.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

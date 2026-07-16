/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Identification from './components/Identification';
import Dashboard from './components/Dashboard';
import ExerciseSelector from './components/ExerciseSelector';
import Ex1Memory from './components/ex1_Memory';
import Ex2Sequences from './components/ex2_Sequences';
import Ex3Words from './components/ex3_Words';
import Ex4Associations from './components/ex4_Associations';
import Ex5Positions from './components/ex5_Positions';
import DailyStats from './components/DailyStats';

import { Participant, SessionResult, ExerciseStatus, ExerciseScores } from './types';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('research_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Participant auth states
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isBlockedToday, setIsBlockedToday] = useState(false);

  // Router view state
  const [view, setView] = useState<'login' | 'dashboard' | 'menu' | 'ex1' | 'ex2' | 'ex3' | 'ex4' | 'ex5' | 'results'>('login');

  // Overall workout tracking
  const [sessionHistory, setSessionHistory] = useState<SessionResult[]>([]);
  const [workoutStartTime, setWorkoutStartTime] = useState<number>(0);

  // Exercises states
  const [exerciseStatus, setExerciseStatus] = useState<ExerciseStatus>({
    ex1: false,
    ex2: false,
    ex3: false,
    ex4: false,
    ex5: false,
  });

  const [exerciseScores, setExerciseScores] = useState<ExerciseScores>({
    ex1: { score: 0, moves: 0, time: 0 },
    ex2: { score: 0, correctRounds: 0 },
    ex3: { score: 0, hits: 0, forgotten: [], entered: [] },
    ex4: { score: 0, hits: 0, errors: 0, details: [] },
    ex5: { score: 0, correctRounds: 0 },
  });

  // Google Script webhook URL (hardcoded and not configurable)
  const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbw_9IpTDRoTpPvhYgY3MUyaOQ1b9eVqrxbO8MR_AVQ7HI0_VSsVTqSW7-B0RtK-3W4w8A/exec';

  // Load session history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('research_memory_session_history');
    if (savedHistory) {
      try {
        setSessionHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Error parsing session history:', err);
      }
    }
  }, []);

  // Sync theme changes to the document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('research_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLoginSuccess = (user: Participant, isBlocked: boolean) => {
    setParticipant(user);
    setIsBlockedToday(isBlocked);
    setView('dashboard');
  };

  const handleLogout = () => {
    setParticipant(null);
    setIsBlockedToday(false);
    setView('login');
  };

  const handleStartTraining = () => {
    setWorkoutStartTime(Date.now());
    setExerciseStatus({
      ex1: false,
      ex2: false,
      ex3: false,
      ex4: false,
      ex5: false,
    });
    setExerciseScores({
      ex1: { score: 0, moves: 0, time: 0 },
      ex2: { score: 0, correctRounds: 0 },
      ex3: { score: 0, hits: 0, forgotten: [], entered: [] },
      ex4: { score: 0, hits: 0, errors: 0, details: [] },
      ex5: { score: 0, correctRounds: 0 },
    });
    setView('menu');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  const handleSelectExercise = (exId: 'ex1' | 'ex2' | 'ex3' | 'ex4' | 'ex5') => {
    setView(exId);
  };

  const handleBackToMenu = () => {
    setView('menu');
  };

  // Complete callbacks for each exercise
  const handleEx1Complete = (score: number, moves: number, timeInSeconds: number) => {
    setExerciseScores((prev) => ({
      ...prev,
      ex1: { score, moves, time: timeInSeconds },
    }));
    setExerciseStatus((prev) => ({ ...prev, ex1: true }));
    setView('menu');
  };

  const handleEx2Complete = (score: number, correctRounds: number) => {
    setExerciseScores((prev) => ({
      ...prev,
      ex2: { score, correctRounds },
    }));
    setExerciseStatus((prev) => ({ ...prev, ex2: true }));
    setView('menu');
  };

  const handleEx3Complete = (score: number, hits: number, forgotten: string[], entered: string[]) => {
    setExerciseScores((prev) => ({
      ...prev,
      ex3: { score, hits, forgotten, entered },
    }));
    setExerciseStatus((prev) => ({ ...prev, ex3: true }));
    setView('menu');
  };

  const handleEx4Complete = (score: number, hits: number, errors: number, details: any[]) => {
    setExerciseScores((prev) => ({
      ...prev,
      ex4: { score, hits, errors, details },
    }));
    setExerciseStatus((prev) => ({ ...prev, ex4: true }));
    setView('menu');
  };

  const handleEx5Complete = (score: number, correctRounds: number) => {
    setExerciseScores((prev) => ({
      ...prev,
      ex5: { score, correctRounds },
    }));
    setExerciseStatus((prev) => ({ ...prev, ex5: true }));
    setView('menu');
  };

  const handleViewStats = () => {
    setView('results');
  };

  const handleSaveSession = (result: SessionResult) => {
    const updatedHistory = [...sessionHistory, result];
    setSessionHistory(updatedHistory);
    localStorage.setItem('research_memory_session_history', JSON.stringify(updatedHistory));
    
    // Once they complete and save, lock them from training again today
    setIsBlockedToday(true);
  };

  // Renderer
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {view === 'login' && (
        <Identification
          onLoginSuccess={handleLoginSuccess}
          sessionHistory={sessionHistory}
        />
      )}

      {view === 'dashboard' && participant && (
        <Dashboard
          participant={participant}
          isBlockedToday={isBlockedToday}
          sessionHistory={sessionHistory}
          onStartTraining={handleStartTraining}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          googleScriptUrl={googleScriptUrl}
        />
      )}

      {view === 'menu' && (
        <ExerciseSelector
          status={exerciseStatus}
          scores={exerciseScores}
          onSelectExercise={handleSelectExercise}
          onBackToDashboard={handleBackToDashboard}
          onViewStats={handleViewStats}
        />
      )}

      {view === 'ex1' && participant && (
        <Ex1Memory
          participantCode={participant.code}
          onComplete={handleEx1Complete}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {view === 'ex2' && (
        <Ex2Sequences
          onComplete={handleEx2Complete}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {view === 'ex3' && participant && (
        <Ex3Words
          participantCode={participant.code}
          onComplete={handleEx3Complete}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {view === 'ex4' && participant && (
        <Ex4Associations
          participantCode={participant.code}
          onComplete={handleEx4Complete}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {view === 'ex5' && (
        <Ex5Positions
          onComplete={handleEx5Complete}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {view === 'results' && participant && (
        <DailyStats
          participant={participant}
          scores={exerciseScores}
          startTime={workoutStartTime}
          googleScriptUrl={googleScriptUrl}
          onSaveSession={handleSaveSession}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}

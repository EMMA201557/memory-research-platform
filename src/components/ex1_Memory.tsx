/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Brain, Clock, HelpCircle, RotateCcw, ArrowLeft, Trophy } from 'lucide-react';
import { getSetFromCode } from '../data/words';
import { MEMORY_THEMES } from '../data/memoryCards';

interface Ex1MemoryProps {
  participantCode: string;
  onComplete: (score: number, moves: number, timeInSeconds: number) => void;
  onBackToMenu: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Ex1Memory({ participantCode, onComplete, onBackToMenu }: Ex1MemoryProps) {
  const setIndex = getSetFromCode(participantCode);
  const theme = MEMORY_THEMES[setIndex];

  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and shuffle cards
  useEffect(() => {
    initGame();
    return () => stopTimer();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isActive && !isDone) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isActive, isDone]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const initGame = () => {
    // Select 10 emojis from theme
    const emojis = [...theme.emojis].slice(0, 10);
    // Duplicate emojis to make 10 pairs
    const pairs = [...emojis, ...emojis];
    
    // Shuffle pairs
    const shuffledPairs = pairs
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffledPairs);
    setSelectedIndices([]);
    setMoves(0);
    setSeconds(0);
    setIsActive(false);
    setIsDone(false);
  };

  const handleCardClick = (index: number) => {
    // If game is completed or card is already flipped/matched, ignore
    if (isDone || cards[index].isFlipped || cards[index].isMatched || selectedIndices.length >= 2) {
      return;
    }

    // Start timer on first flip
    if (!isActive) {
      setIsActive(true);
    }

    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newSelected;

      // Check for match
      if (updatedCards[firstIdx].emoji === updatedCards[secondIdx].emoji) {
        // Matched
        setTimeout(() => {
          setCards((prevCards) => {
            const nextCards = [...prevCards];
            nextCards[firstIdx].isMatched = true;
            nextCards[secondIdx].isMatched = true;
            
            // Check if all matched
            const allMatched = nextCards.every((c) => c.isMatched);
            if (allMatched) {
              setIsDone(true);
              setIsActive(false);
            }
            return nextCards;
          });
          setSelectedIndices([]);
        }, 300);
      } else {
        // No match - flip back after 1s
        setTimeout(() => {
          setCards((prevCards) => {
            const nextCards = [...prevCards];
            nextCards[firstIdx].isFlipped = false;
            nextCards[secondIdx].isFlipped = false;
            return nextCards;
          });
          setSelectedIndices([]);
        }, 1000);
      }
    }
  };

  // Score algorithm:
  // Standard moves to flip 20 cards perfectly: 10 moves.
  // Standard time: 25 seconds.
  // Base score is 100.
  // Deduct 3 points for each move above 10, and 0.5 points for each second above 25. Minimum score of 10.
  const calculateScore = () => {
    const baseScore = 100;
    const movesOverPerfect = Math.max(0, moves - 10);
    const timeOverTarget = Math.max(0, seconds - 25);
    const finalScore = baseScore - (movesOverPerfect * 3) - (timeOverTarget * 0.5);
    return Math.max(10, Math.min(100, Math.round(finalScore)));
  };

  const finalScore = calculateScore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
      {/* Exercise header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tornar al menú</span>
        </button>

        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Exercici 1 — Targetes de Memòria
          </h2>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold">
            <Clock className="w-4 h-4 text-sky-500" />
            <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold">
            <RotateCcw className="w-4 h-4 text-sky-500 hover:rotate-185 transition-transform duration-300 cursor-pointer" onClick={initGame} />
            <span>Moviments: {moves}</span>
          </div>
        </div>
      </div>

      {isDone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl text-center max-w-md mx-auto space-y-4"
          id="memory-congrats-card"
        >
          <div className="inline-flex p-3 bg-sky-100 dark:bg-sky-950/40 text-sky-500 rounded-full">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Parelles completades!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Has trobat les 10 parelles de targetes.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 py-1">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block">TEMPS</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">
                {seconds}s
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block">MOVIMENTS</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">
                {moves}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 dark:text-slate-500 block">PUNTUACIÓ</span>
              <span className="text-lg font-bold text-sky-500 dark:text-sky-400 font-mono">
                {finalScore}
              </span>
            </div>
          </div>

          <button
            onClick={() => onComplete(finalScore, moves, seconds)}
            id="finish-memory-btn"
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold rounded-xl text-base transition-colors shadow-md cursor-pointer"
          >
            Finalitzar i tornar al menú
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Temàtica: {theme.name}
            </span>
          </div>

          {/* Cards 5x4 grid */}
          <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto" id="memory-cards-grid">
            {cards.map((card, idx) => {
              const isRevealed = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={`aspect-[3/4] rounded-xl border flex items-center justify-center text-xl sm:text-2xl focus:outline-none transition-all duration-300 ${
                    isRevealed
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 rotate-0 shadow-inner'
                      : 'bg-white dark:bg-slate-800 hover:bg-sky-50/50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer [transform:rotateY(180deg)]'
                  }`}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="select-none pointer-events-none"
                    style={{ backfaceVisibility: 'hidden', transform: isRevealed ? 'none' : 'rotateY(180deg)' }}
                  >
                    {isRevealed ? card.emoji : <HelpCircle className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

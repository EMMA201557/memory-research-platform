/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Participant {
  name: string;
  code: string;
}

export interface ExerciseScores {
  ex1: { score: number; moves: number; time: number }; // Memory
  ex2: { score: number; correctRounds: number };       // Sequences
  ex3: { score: number; hits: number; forgotten: string[]; entered: string[] }; // Words
  ex4: { score: number; hits: number; errors: number; details: AssociationDetail[] }; // Associations
  ex5: { score: number; correctRounds: number };       // Positions
}

export interface AssociationDetail {
  word: string;
  expected: string;
  got: string;
  correct: boolean;
}

export interface SessionResult {
  name: string;
  code: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  totalTime: number; // in seconds
  memoryScore: number; // 0-100
  sequenceScore: number; // 0-100
  wordHits: number; // 0-12
  wordScore: number; // 0-100
  associationHits: number; // 0-10
  associationScore: number; // 0-100
  positionScore: number; // 0-100
  totalScore: number; // average score 0-100
  percentageHits: number; // overall percentage correct
}

export interface ExerciseStatus {
  ex1: boolean;
  ex2: boolean;
  ex3: boolean;
  ex4: boolean;
  ex5: boolean;
}

export type ThemeType = 'light' | 'dark';

export interface ParticipantStats {
  daysTrained: string[]; // List of YYYY-MM-DD dates trained
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  percentageCompleted: number; // 0 to 100 based on completed sessions vs target (18 sessions: 3 sessions/wk * 6 wks)
  targetSessions: number; // 18
}

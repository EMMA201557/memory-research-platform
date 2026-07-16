/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 150 simple words divided into 3 sets of 50 words each
// Includes some words with accents to demonstrate the accent-insensitive validation.
export const WORD_POOLS: Record<number, string[]> = {
  1: [
    "casa", "arbre", "sol", "ocell", "cadira", "taula", "flor", "rellotge", "verd", "blau",
    "poma", "plàtan", "aigua", "pa", "llet", "formatge", "cançó", "gat", "gos", "ratolí",
    "llapis", "llibre", "paper", "escola", "música", "telèfon", "finestra", "porta", "riu", "muntanya",
    "sabata", "camisa", "pantalons", "barret", "futbol", "tren", "avió", "vaixell", "carretera", "carrer",
    "jardí", "núvol", "pluja", "neu", "vent", "foc", "gel", "terra", "lluna", "estel"
  ],
  2: [
    "llar", "bosc", "llum", "camió", "escriptori", "sofà", "planta", "temps", "groc", "vermell",
    "pera", "taronja", "suc", "mantega", "ou", "guitarra", "càmera", "colom", "conill", "lleó",
    "retolador", "quadern", "bossa", "classe", "joc", "ordinador", "paret", "tanca", "llac", "turó",
    "bota", "jaqueta", "mitjons", "gorra", "tennis", "furgoneta", "metro", "barca", "pont", "camí",
    "parc", "cel", "tempesta", "fred", "calor", "carbó", "vidre", "pedra", "planeta", "galàxia"
  ],
  3: [
    "habitació", "selva", "foscor", "helicòpter", "armari", "llit", "arbust", "època", "blanc", "negre",
    "raïm", "llimona", "cafè", "sal", "sucre", "violí", "cinema", "peix", "cavall", "tigre",
    "raspall", "carpeta", "arxivador", "institut", "teatre", "televisió", "teulada", "tanca", "oceà", "vall",
    "sandàlia", "abric", "guant", "cinturó", "bàsquet", "motor", "bicicleta", "iot", "túnel", "autopista",
    "prat", "espai", "boira", "estiu", "hivern", "metall", "plàstic", "totxo", "cometa", "univers"
  ]
};

// Returns the set index (1, 2, or 3) for a participant code
export function getSetFromCode(code: string): number {
  if (!code) return 1;
  // Match any digits in the code
  const match = code.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return ((num - 1) % 3) + 1; // Maps A001 -> 1, A002 -> 2, A003 -> 3, A004 -> 1, etc.
  }
  // Fallback hash
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 3) + 1;
}

// Normalizes a word by removing accents, converting to lowercase, and trimming whitespace
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // removes accents
    .trim();
}

/*
 * words.js
 * -----------------------------------------------------------------------
 * Word database for Exercise 3 (Paraules / Words).
 * ~150 simple, concrete Catalan nouns split into 3 balanced sets.
 *
 * Each participant is deterministically assigned to one set (see
 * core/storage.js -> getAssignedSetIndex) based on their participant code,
 * so the same participant always sees words from the same set across all
 * of their sessions (avoids difficulty drift), while different
 * participants may get different sets (avoids identical material being
 * shared/discussed between participants).
 *
 * Each session, 12 words are picked at random from the participant's set.
 */

const WORD_SETS = [
  // Set 0
  [
    "gos", "peix", "ovella", "gallina", "lleó", "girafa", "guineu",
    "pa", "ou", "plàtan", "pera", "patata", "carn", "sal",
    "taula", "porta", "llum", "coixí", "sabó", "cullera", "olla",
    "sol", "núvol", "vent", "muntanya", "fulla", "sorra", "cel",
    "mà", "orella", "dent", "peu", "coll",
    "camisa", "mitjó", "guant", "vestit",
    "cotxe", "avió", "moto", "metro",
    "llibre", "clau", "caixa", "moneda", "escala",
    "jardí", "poble", "bosc", "torre", "escola", "botiga", "aeroport"
  ],
  // Set 1
  [
    "gat", "cavall", "porc", "conill", "tigre", "mico", "llop",
    "llet", "poma", "raïm", "préssec", "ceba", "arròs", "oli",
    "cadira", "finestra", "sofà", "manta", "forquilla", "plat", "calaix",
    "lluna", "pluja", "mar", "arbre", "herba", "foc", "illa",
    "cap", "nas", "braç", "cor", "esquena",
    "pantalons", "jaqueta", "bufanda",
    "autobús", "bicicleta", "camió",
    "llapis", "rellotge", "cistella", "anell", "martell",
    "parc", "carrer", "camp", "castell", "hospital", "restaurant", "estació"
  ],
  // Set 2
  [
    "ocell", "vaca", "ànec", "ratolí", "elefant", "ós",
    "formatge", "taronja", "maduixa", "tomàquet", "all", "sucre",
    "llit", "mirall", "armari", "tovallola", "ganivet", "got",
    "estel", "neu", "riu", "flor", "pedra", "terra",
    "ull", "boca", "cama", "dit", "pell",
    "sabata", "barret", "cinturó",
    "tren", "vaixell", "taxi",
    "paper", "telèfon", "ampolla", "corda", "mapa",
    "ciutat", "platja", "pont", "església", "mercat", "hotel"
  ]
];

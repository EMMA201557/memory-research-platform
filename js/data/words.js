/*
 * words.js
 * -----------------------------------------------------------------------
 * Word database for Exercise 3 (Paraules / Words).
 *
 * WORD_SETS[track][sessionIndex] is a fixed list of exactly 12 Catalan
 * words for one participant track on one planned session day (18 planned
 * sessions - see PROGRAM_TOTAL_SESSIONS in app.js). A participant's track
 * (0-2) is assigned deterministically from their code (see
 * storage.js#getAssignedSetIndex), and which day it is comes from how many
 * sessions they've already completed (see currentSessionIndex in app.js).
 *
 * This is deliberately NOT random sampling from a small shared pool: with
 * a small pool re-sampled every session, participants would very quickly
 * see (and start memorizing) the same words over and over, which defeats
 * the point of a repeated memory-training protocol. Instead each of the 18
 * sessions gets its own fixed, never-repeated-within-that-track word list,
 * so content genuinely advances session to session. If a participant keeps
 * training past session 18, content cycles back to session 1's list (see
 * the `% track.length` wrap in exercises/words.js) rather than erroring.
 *
 * Words are common, simple, concrete Catalan nouns and deliberately don't
 * overlap with the baseline/final assessment word lists (see
 * data/assessmentWords.js), so daily practice never rehearses the exact
 * words used to measure pre/post improvement.
 */

const WORD_SETS = [
  // Track 0
  [
    ["pell", "grapa", "croqueta", "timó", "galeta", "tomàquet", "poltre", "cigne", "reixa", "aeroport", "cartera", "alicates"], // session 0
    ["taxi", "estrella", "diccionari", "estadi", "calendari", "vedella", "satèl·lit", "vent", "rosa", "penya", "palmell", "ànec"], // session 1
    ["comandament", "ovella", "altaveu", "esquirol", "iceberg", "pulmó", "carn", "taula", "senglar", "ou", "bota", "paella"], // session 2
    ["pany", "llavor", "casc", "sabateria", "nota", "peixateria", "raïm", "mango", "farmàcia", "amic", "manta", "camisa"], // session 3
    ["àguila", "tren", "sofà", "òptica", "correu", "ametlla", "ordinador", "fil", "costella", "pot", "bou", "cotó"], // session 4
    ["nuvi", "llimona", "jaqueta", "cova", "tovallola", "canell", "plat", "xoriço", "escàner", "porta", "plata", "ren"], // session 5
    ["tractor", "glaç", "cendrer", "ascensor", "sorpresa", "sal", "dit", "múscul", "llapis", "cadell", "grua", "meteorit"], // session 6
    ["muntanya", "calaixera", "tempesta", "nadó", "monopatí", "meló", "vedell", "capella", "xancleta", "girafa", "avinguda", "fideus"], // session 7
    ["estómac", "mà", "llibreria", "armari", "fusta", "martell", "trompeta", "clau", "plom", "vermell", "cassola", "llit"], // session 8
    ["tapadora", "bossa", "faisà", "sol", "marbre", "núvia", "hospital", "planta", "xec", "cadena", "pantalons", "galàxia"], // session 9
    ["groc", "banqueta", "entrepà", "cansalada", "forn", "lluna", "castell", "cargol", "metall", "memòria", "rosada", "linx"], // session 10
    ["telèfon", "arbre", "ferro", "llavi", "matalàs", "lludriga", "dau", "pluja", "careta", "braç", "pilota", "escombra"], // session 11
    ["boca", "ronyó", "agenda", "aniversari", "túnel", "isard", "calamar", "salsitxa", "xip", "pastanaga", "mes", "tia"], // session 12
    ["cosí", "nena", "clip", "pinzell", "església", "sobre", "gavina", "padrí", "cuc", "bròquil", "carnisseria", "bufanda"], // session 13
    ["sandàlia", "abella", "bebè", "kiwi", "torrent", "mercat", "setmana", "planxa", "plàstic", "germà", "moneder", "vaixell"], // session 14
    ["goma", "botifarra", "cama", "panda", "marró", "marmota", "coixí", "nina", "regle", "cuir", "corró", "gamba"], // session 15
    ["estora", "oncle", "mico", "veler", "bitllet", "cementiri", "duna", "conill", "patins", "plàtan", "xandall", "vespre"], // session 16
    ["guatlla", "indiot", "fletxa", "armariet", "suc", "veta", "galleda", "falcó", "trofeu", "codony", "gall", "festa"], // session 17
  ],
  // Track 1
  [
    ["teixó", "diana", "ventall", "vaca", "escala", "xocolata", "fleca", "cella", "cacauet", "llet", "moto", "veïna"], // session 0
    ["tauró", "samarreta", "branca", "rentadora", "mapa", "helicòpter", "bicicleta", "raqueta", "despertador", "préssec", "merla", "desert"], // session 1
    ["camió", "canoa", "armilla", "nivell", "nebot", "blau", "cigró", "cable", "herba", "palau", "catedral", "formatge"], // session 2
    ["roca", "amiga", "hotel", "eclipsi", "sabó", "mar", "xarxa", "àvia", "gespa", "magrana", "disc", "nas"], // session 3
    ["barret", "oli", "corb", "arbust", "núvol", "càntir", "balcó", "cotxet", "sorra", "ull", "projector", "butaca"], // session 4
    ["bressol", "huracà", "monitor", "ratolí", "ciutat", "paper", "corbata", "rem", "cavall", "llop", "volcà", "finestra"], // session 5
    ["gat", "cometa", "cabana", "oceà", "examen", "escarabat", "flassada", "joieria", "maluc", "platja", "visó", "flor"], // session 6
    ["panxa", "perdiu", "delta", "gruta", "prestatge", "coet", "vàter", "glacera", "botiga", "taulell", "planeta", "lleó"], // session 7
    ["cotxe", "xicota", "cactus", "vespa", "sac", "escurçó", "furgoneta", "violí", "coure", "roser", "sabata", "xicot"], // session 8
    ["làmpada", "bolet", "cim", "regal", "cinema", "cala", "olla", "turmell", "abric", "quiosc", "palmera", "encenedor"], // session 9
    ["tinta", "ganivet", "ajuntament", "illot", "porteria", "tronc", "llibre", "tovalló", "cervell", "tiquet", "regadora", "jove"], // session 10
    ["truita", "vall", "televisor", "brusa", "morsa", "hort", "pinta", "verd", "piano", "taronja", "papallona", "carta"], // session 11
    ["foc", "sardina", "genoll", "foguera", "bata", "safata", "molsa", "civada", "retolador", "pollet", "peix", "toro"], // session 12
    ["arxivador", "port", "serp", "batedora", "xai", "biblioteca", "llima", "esquena", "piscina", "poble", "pa", "maletí"], // session 13
    ["melic", "bombeta", "cinta", "cartolina", "espinacs", "avió", "segell", "pollastre", "granja", "tetera", "tornavís", "lila"], // session 14
    ["llentia", "tarda", "paleta", "carrer", "llana", "porc", "monestir", "remolc", "gelat", "peu", "escola", "barba"], // session 15
    ["taló", "argila", "falguera", "carpeta", "caramel", "síndria", "atles", "talp", "ciment", "xinxeta", "torre", "cafetera"], // session 16
    ["parc", "mel", "arpa", "cremallera", "bolígraf", "riu", "amanida", "gebre", "llamp", "espàtula", "llanterna", "impressora"], // session 17
  ],
  // Track 2
  [
    ["ós", "medalla", "sang", "hivernacle", "got", "assecadora", "plaça", "colom", "banc", "llum", "mitjó", "gratacel"], // session 0
    ["pètal", "nit", "mocador", "vestit", "veí", "torradora", "refugi", "nen", "pala", "bassa", "pera", "mussol"], // session 1
    ["mòbil", "sucre", "pedra", "poma", "blat", "aspiradora", "perruqueria", "seda", "llebre", "pantalla", "parpella", "cocodril"], // session 2
    ["rajola", "sabatilla", "restaurant", "gorra", "ram", "càmera", "consola", "avi", "sogre", "any", "selva", "moll"], // session 3
    ["acer", "cinturó", "cor", "rebut", "sopa", "colze", "colador", "ceba", "bateria", "paraigües", "negre", "guant"], // session 4
    ["escaire", "tonyina", "globus", "caixa", "metro", "cola", "roure", "micròfon", "neu", "orella", "estel", "cranc"], // session 5
    ["serra", "didal", "tambor", "autopista", "cérvol", "calculadora", "teclat", "cullera", "guitarra", "front", "gos", "camell"], // session 6
    ["carretó", "microones", "heura", "badia", "elefant", "neboda", "eriçó", "néta", "ratllador", "gallina", "espelma", "dofí"], // session 7
    ["far", "gris", "pila", "arracada", "bandera", "mirall", "patata", "macarrons", "estoig", "botó", "joguina", "arròs"], // session 8
    ["collaret", "polsera", "pop", "maduixa", "bosc", "rellotge", "flauta", "sogra", "ampolla", "carregador", "blanc", "tap"], // session 9
    ["aparcament", "gerro", "bol", "musclo", "carnet", "penjador", "pont", "papereria", "quadern", "nét", "pinya", "tornado"], // session 10
    ["avellana", "cadira", "dutxa", "vidre", "calamarsa", "xampú", "pernil", "tigre", "galta", "carbassa", "tauleta", "raspall"], // session 11
    ["paraigua", "grapadora", "pingüí", "factura", "gerra", "pardal", "calaix", "motxilla", "coco", "davantal", "excavadora", "zebra"], // session 12
    ["telefèric", "pastisseria", "teula", "bronze", "estació", "arrel", "cap", "remolí", "farina", "jardí", "forquilla", "cabrit"], // session 13
    ["disfressa", "submarí", "prat", "matí", "illa", "maleta", "terra", "morter", "pissarra", "moneda", "cortina", "faldilla"], // session 14
    ["barnús", "camp", "ulleres", "cistella", "passaport", "avantbraç", "oliva", "foca", "bastó", "fetge", "esponja", "cangur"], // session 15
    ["guineu", "clauer", "daurat", "drogueria", "enciam", "cubell", "targeta", "salamandra", "videojoc", "cel", "granit", "germana"], // session 16
    ["cafè", "cogombre", "anell", "dent", "coll", "fàbrica", "platejat", "autobús", "terrassa", "ocell", "corda", "mongeta"], // session 17
  ]
];

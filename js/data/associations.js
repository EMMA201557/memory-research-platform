/*
 * associations.js
 * -----------------------------------------------------------------------
 * Word-pair database for Exercise 4 (Associacions / Associations).
 * 3 balanced sets of semantically-linked pairs (profession -> related
 * object/place), e.g. "Metge -> Hospital".
 *
 * Same set-assignment logic as words.js: a participant always studies
 * pairs from the same set. Each session, 10 pairs are picked at random
 * from the participant's assigned set.
 */

const ASSOCIATION_SETS = [
  // Set 0
  [
    ["Metge", "Hospital"],
    ["Cotxe", "Garatge"],
    ["Peix", "Mar"],
    ["Mestre", "Escola"],
    ["Cuiner", "Restaurant"],
    ["Pilot", "Avió"],
    ["Granger", "Granja"],
    ["Bomber", "Camió"],
    ["Jardiner", "Jardí"],
    ["Pintor", "Quadre"],
    ["Músic", "Guitarra"],
    ["Nedador", "Piscina"],
    ["Fuster", "Fusta"],
    ["Pastor", "Ovella"],
    ["Llibreter", "Llibre"]
  ],
  // Set 1
  [
    ["Infermera", "Xeringa"],
    ["Policia", "Comissaria"],
    ["Fotògraf", "Càmera"],
    ["Perruquer", "Tisores"],
    ["Forner", "Pa"],
    ["Lleter", "Vaca"],
    ["Carter", "Carta"],
    ["Sastre", "Agulla"],
    ["Pescador", "Canya"],
    ["Apicultor", "Abella"],
    ["Rellotger", "Rellotge"],
    ["Enginyer", "Pont"],
    ["Astronauta", "Coet"],
    ["Advocat", "Jutjat"],
    ["Actor", "Teatre"]
  ],
  // Set 2
  [
    ["Dentista", "Dent"],
    ["Veterinari", "Gos"],
    ["Xofer", "Autobús"],
    ["Electricista", "Cable"],
    ["Lampista", "Aixeta"],
    ["Cambrer", "Safata"],
    ["Florista", "Flor"],
    ["Sabater", "Sabata"],
    ["Traductor", "Idioma"],
    ["Escultor", "Marbre"],
    ["Arquitecte", "Edifici"],
    ["Comptable", "Diners"],
    ["Capità", "Vaixell"],
    ["Costurera", "Roba"],
    ["Jutge", "Jutjat"]
  ]
];

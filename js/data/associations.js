/*
 * associations.js
 * -----------------------------------------------------------------------
 * Word-pair database for Exercise 4 (Associacions / Associations), e.g.
 * "Metge -> Hospital".
 *
 * ASSOCIATION_SETS[track][sessionIndex] is a fixed list of exactly 10
 * pairs for one participant track on one planned session day (18 planned
 * sessions - see PROGRAM_TOTAL_SESSIONS in app.js). Same rationale as
 * WORD_SETS (see data/words.js): a small pool re-sampled every session
 * would quickly become memorized outright, so instead each of the 18
 * sessions gets its own fixed, never-repeated-within-that-track pair
 * list. Content cycles back to session 1 if a participant keeps training
 * past session 18 (see the `% track.length` wrap in
 * exercises/associations.js).
 *
 * Pairs span several kinds of everyday association (profession -> tool/
 * workplace, animal -> habitat, object -> use, food -> origin, place ->
 * typical item, ...) rather than only professions, so there was enough
 * room to generate this many pairs without straining plausibility. Every
 * cue word (the first element) is unique across the whole file, so a
 * participant is never shown the same cue with two different answers on
 * different days.
 */

const ASSOCIATION_SETS = [
  // Track 0
  [
    [["Estadi", "Partit"], ["Ase", "Càrrega"], ["Surf", "Onada"], ["Cirurgià", "Hospital"], ["Tornavís", "Cargol"], ["Zoòleg", "Animal"], ["Geòleg", "Roca"], ["Alegria", "Somriure"], ["Xofer", "Autobús"], ["Roda", "Cotxe"]], // session 0
    [["Carnisser", "Carn"], ["Calor", "Estiu"], ["Sastre", "Agulla"], ["Pissarra", "Guix"], ["Suport", "Llibre"], ["Butaca", "Cinema"], ["Empresari", "Empresa"], ["Laboratori", "Microscopi"], ["Fisioterapeuta", "Massatge"], ["Escurçó", "Verí"]], // session 1
    [["Flauta", "Alè"], ["Apicultor", "Abella"], ["Termòmetre", "Temperatura"], ["Història", "Museu"], ["Pengeu-robes", "Roba"], ["Groc", "Llimona"], ["Gimnàstica", "Anelles"], ["Ampit", "Finestra"], ["Guineu", "Cova"], ["Actriu", "Teatre"]], // session 2
    [["Baldes", "Finestra"], ["Convidat", "Boda"], ["Saler", "Sal"], ["Manegot", "Camisa"], ["Got", "Aigua"], ["Vi", "Raïm"], ["Idiomes", "Diccionari"], ["Illa", "Platja"], ["Cuc", "Poma"], ["Balcó", "Planta"]], // session 3
    [["Arpa", "Corda"], ["Rellotge", "Hora"], ["Xarxa", "Peix"], ["Àrbitre", "Xiulet"], ["Voleibol", "Xarxa"], ["Sucrera", "Sucre"], ["Fotògraf", "Càmera"], ["Bicicleta", "Carril"], ["Farmacèutic", "Farmàcia"], ["Carter", "Carta"]], // session 4
    [["Rugbi", "Casc"], ["Terratrèmol", "Sacseig"], ["Tennis", "Raqueta"], ["Hotel", "Habitació"], ["Semàfor", "Cotxe"], ["Vestuari", "Actor"], ["Cinema", "Pel·lícula"], ["Farmàcia", "Medicines"], ["Matemàtiques", "Calculadora"], ["Cames", "Pantalons"]], // session 5
    [["Escalada", "Corda"], ["Maleta", "Roba"], ["Planxa", "Roba"], ["Regal", "Aniversari"], ["Gelosia", "Cor"], ["Pintor", "Quadre"], ["Banquer", "Banc"], ["Volcà", "Lava"], ["Fruitera", "Fruita"], ["Cova", "Ratpenat"]], // session 6
    [["Pot", "Confitura"], ["Marró", "Xocolata"], ["Camell", "Desert"], ["Te", "Tetera"], ["Psicòleg", "Divan"], ["Forner", "Pa"], ["Tren", "Estació"], ["Cocodril", "Riu"], ["Cullera", "Sopa"], ["Colom", "Missatge"]], // session 7
    [["Detectiu", "Lupa"], ["Pescador", "Canya"], ["Xumet", "Nadó"], ["Marbre", "Pedrera"], ["Cistella", "Fruita"], ["Martell", "Clau"], ["Espatlla", "Motxilla"], ["Actor", "Teatre"], ["Armari", "Roba"], ["Jardiner", "Jardí"]], // session 8
    [["Mapa", "Camí"], ["Cervesa", "Ordi"], ["Caixer", "Supermercat"], ["Microscopi", "Cèl·lula"], ["Esport", "Xandall"], ["Coet", "Espai"], ["Cabell", "Pinta"], ["Gat", "Coixí"], ["Fusta", "Arbre"], ["Cantant", "Micròfon"]], // session 9
    [["Llop", "Ramat"], ["Fruiter", "Fruita"], ["Universitat", "Diploma"], ["Targeta", "Felicitació"], ["Estisora", "Cartolina"], ["Mercat", "Fruites"], ["Arquitecte", "Edifici"], ["Professor", "Universitat"], ["Bàsquet", "Cistella"], ["Anemone", "Roca"]], // session 10
    [["Estiu", "Platja"], ["Aquari", "Peix"], ["Huracà", "Vent"], ["Conserge", "Escola"], ["Rentadora", "Roba"], ["Bastidor", "Tela"], ["Esborrador", "Pissarra"], ["Institut", "Examen"], ["Nutria", "Riu"], ["Rinoceront", "Banya"]], // session 11
    [["Museu", "Quadres"], ["Gallina", "Ou"], ["Faristol", "Partitura"], ["Fuster", "Fusta"], ["Cola", "Paper"], ["Economista", "Banc"], ["Advocat", "Jutjat"], ["Vestidor", "Armariet"], ["Rotonda", "Cotxe"], ["Àncora", "Vaixell"]], // session 12
    [["Bombeta", "Llum"], ["Persiana", "Finestra"], ["Ciclisme", "Bicicleta"], ["Ratolí", "Formatge"], ["Fred", "Hivern"], ["Ala", "Avió"], ["Hipopòtam", "Riu"], ["Peixater", "Peix"], ["Verd", "Herba"], ["Perruquer", "Tisores"]], // session 13
    [["Venedor", "Botiga"], ["Gall", "Matinada"], ["Trompeta", "Vàlvula"], ["Pebre", "Pasta"], ["Bandera", "Nació"], ["Autobús", "Parada"], ["Filosofia", "Llibre"], ["Micròfon", "Veu"], ["Portaretrats", "Fotografia"], ["Tetera", "Te"]], // session 14
    [["Esgrima", "Espasa"], ["Plàstica", "Pinzell"], ["Cérvol", "Banyes"], ["Truita", "Ou"], ["Sorpresa", "Crit"], ["Boxa", "Guants"], ["Trona", "Nadó"], ["Violí", "Arc"], ["Granja", "Animals"], ["Dofí", "Mar"]], // session 15
    [["Bany", "Vàter"], ["Aspiradora", "Catifa"], ["Llamp", "Tro"], ["Escut", "Cavaller"], ["Ferrer", "Metall"], ["Policia", "Comissaria"], ["Vidre", "Sorra"], ["Informàtica", "Ordinador"], ["Guixaire", "Guix"], ["Teatre", "Escenari"]], // session 16
    [["Rellotger", "Rellotge"], ["Músic", "Guitarra"], ["Sonall", "Nadó"], ["Pagès", "Camp"], ["Objectiu", "Càmera"], ["Cavallet", "Pintura"], ["Pantera", "Selva"], ["Escaire", "Angle"], ["Castor", "Presa"], ["Negre", "Carbó"]], // session 17
  ],
  // Track 1
  [
    [["Bossa", "Compra"], ["Camaleó", "Colors"], ["Padrí", "Bateig"], ["Cadena", "Bicicleta"], ["Oli", "Oliva"], ["Bressol", "Nadó"], ["Pesebre", "Xai"], ["Model", "Passarel·la"], ["Tristesa", "Llàgrima"], ["Pati", "Gronxador"]], // session 0
    [["Aeroport", "Maletes"], ["Cava", "Raïm"], ["Ninot", "Neu"], ["Cotxe", "Garatge"], ["Pingüí", "Gel"], ["Àbac", "Número"], ["Saxòfon", "Canya"], ["Cuiner", "Restaurant"], ["Balena", "Oceà"], ["Vaixell", "Port"]], // session 1
    [["Maquillatge", "Actriu"], ["Amplificador", "Guitarra"], ["Corona", "Rei"], ["Motor", "Vaixell"], ["Trapezista", "Corda"], ["Mel", "Abella"], ["Girafa", "Coll"], ["Cigne", "Llac"], ["Paisatgista", "Jardí"], ["Garatge", "Bicicleta"]], // session 2
    [["Mag", "Barreta"], ["Infermera", "Xeringa"], ["Xocolata", "Cacau"], ["Torradora", "Pa"], ["Rebosteria", "Forn"], ["Vaca", "Llet"], ["Corretja", "Gos"], ["Paper", "Arbre"], ["Zebra", "Ratlles"], ["Brúixola", "Nord"]], // session 3
    [["Focus", "Escenari"], ["Elefant", "Selva"], ["Domador", "Xurriaques"], ["Batuta", "Orquestra"], ["Duaner", "Frontera"], ["Bomber", "Camió"], ["Mariner", "Vaixell"], ["Cinturó", "Seient"], ["Lleopard", "Taques"], ["Anell", "Compromís"]], // session 4
    [["Rem", "Barca"], ["Popcorn", "Cinema"], ["Cordó", "Sabata"], ["Interruptor", "Llum"], ["Guarderia", "Bressol"], ["Avi", "Bastó"], ["Àguila", "Cim"], ["Full", "Llapis"], ["Prat", "Herba"], ["Mestre", "Escola"]], // session 5
    [["Pilot", "Avió"], ["Vergonya", "Rubor"], ["Submarí", "Periscopi"], ["Ovella", "Llana"], ["Blanc", "Neu"], ["Traginer", "Camió"], ["Taxi", "Ciutat"], ["Pizza", "Formatge"], ["Formiga", "Formiguer"], ["Fotografia", "Objectiu"]], // session 6
    [["Nevera", "Menjar"], ["Ren", "Neu"], ["Lludrigó", "Riu"], ["Mussol", "Nit"], ["Escombra", "Pols"], ["Muntanya", "Excursió"], ["Orgull", "Medalla"], ["Recambrera", "Roba"], ["Astrònom", "Telescopi"], ["Recepcionista", "Hotel"]], // session 7
    [["Comerciant", "Mercat"], ["Gàbia", "Ocell"], ["Aula", "Pissarra"], ["Metro", "Túnel"], ["Pala", "Terra"], ["Jutge", "Jutjat"], ["Clau", "Pany"], ["Vela", "Vaixell"], ["Missatger", "Carta"], ["Globus", "Aire"]], // session 8
    [["Confitura", "Fruita"], ["Corda", "Nus"], ["Careta", "Disfressa"], ["Biblioteca", "Llibres"], ["Espia", "Prismàtics"], ["Motxilla", "Llibres"], ["Nen", "Joguina"], ["Piscina", "Banyador"], ["Cambrera", "Restaurant"], ["Serra", "Fusta"]], // session 9
    [["Botànic", "Planta"], ["Camió", "Càrrega"], ["Sopa", "Verdura"], ["Escola", "Alumnes"], ["Joier", "Anell"], ["Telescopi", "Estrelles"], ["Circ", "Pallasso"], ["Ganivet", "Tallar"], ["Blau", "Cel"], ["Tisores", "Paper"]], // session 10
    [["Croqueta", "Pernil"], ["Tauró", "Aigua"], ["Furgoneta", "Repartiment"], ["Cavall", "Estable"], ["Fanal", "Carrer"], ["Llibreter", "Llibre"], ["Mà", "Guant"], ["Estenedor", "Roba"], ["Orella", "Arracada"], ["Ecologista", "Bosc"]], // session 11
    [["Fontaner", "Aixeta"], ["Sivella", "Cinturó"], ["Ocell", "Niu"], ["Regle", "Línia"], ["Coll", "Bufanda"], ["Falcó", "Cel"], ["Tempesta", "Refugi"], ["Guitarra", "Corda"], ["Judo", "Quimono"], ["Paleta", "Maó"]], // session 12
    [["Paraigua", "Pluja"], ["Satèl·lit", "Òrbita"], ["Càmera", "Foto"], ["Futbol", "Pilota"], ["Granota", "Estany"], ["Bibliotecari", "Biblioteca"], ["Panda", "Bambú"], ["Plat", "Menjar"], ["Estació", "Bitllet"], ["Piano", "Tecla"]], // session 13
    [["Corredor", "Cursa"], ["Calculadora", "Número"], ["Atletisme", "Pista"], ["Transportador", "Angle"], ["Panera", "Pa"], ["Primavera", "Flors"], ["Agricultor", "Camp"], ["Ceràmica", "Fang"], ["Serp", "Verí"], ["Hiena", "Riure"]], // session 14
    [["Por", "Tremolor"], ["Futbolista", "Pilota"], ["Costurera", "Roba"], ["Esquirol", "Nou"], ["Neu", "Trineu"], ["Trineu", "Neu"], ["Tramvia", "Rails"], ["Sol", "Bronzejat"], ["Retolador", "Full"], ["Poeta", "Vers"]], // session 15
    [["Nostàlgia", "Fotografia"], ["Xacal", "Ramat"], ["Cap", "Barret"], ["Motlle", "Pastís"], ["Tigre", "Jungla"], ["Vinya", "Raïm"], ["Boxejador", "Guants"], ["Compàs", "Cercle"], ["Església", "Campana"], ["Vorera", "Vianant"]], // session 16
    [["Florista", "Flor"], ["Pastor", "Ovella"], ["Dit", "Anell"], ["Ordinador", "Internet"], ["Dissenyador", "Ordinador"], ["Golf", "Forat"], ["Pom", "Porta"], ["Suc", "Fruita"], ["Metge", "Hospital"], ["Programador", "Teclat"]], // session 17
  ],
  // Track 2
  [
    [["Enginyer", "Pont"], ["Galeta", "Farina"], ["Vermell", "Maduixa"], ["Director", "Pel·lícula"], ["Miner", "Mina"], ["Timó", "Vaixell"], ["Pastisser", "Pastís"], ["Lampista", "Aixeta"], ["Arqueòleg", "Excavació"], ["Ràbia", "Punys"]], // session 0
    [["Foguera", "Fum"], ["Caixa", "Sabates"], ["Pantalla", "Cinema"], ["Guarda", "Bosc"], ["Canya", "Riu"], ["Regadora", "Planta"], ["Cortina", "Escenari"], ["Imant", "Metall"], ["Pa", "Farina"], ["Viaducte", "Riu"]], // session 1
    [["Música", "Partitura"], ["Astronauta", "Coet"], ["Geografia", "Mapa"], ["Supermercat", "Carro"], ["Platja", "Sorra"], ["Nas", "Ulleres"], ["Tardor", "Fulles"], ["Castell", "Torre"], ["Punxó", "Full"], ["Bou", "Arada"]], // session 2
    [["Formatge", "Llet"], ["Setrill", "Oli"], ["Altaveu", "Música"], ["Esquí", "Neu"], ["Iguana", "Sol"], ["Ram", "Núvia"], ["Peix", "Mar"], ["Porc", "Cort"], ["Tortuga", "Closca"], ["Secretari", "Ordinador"]], // session 3
    [["Amanida", "Enciam"], ["Vent", "Cometa"], ["Granger", "Granja"], ["Abella", "Mel"], ["Restaurant", "Menú"], ["Dormitori", "Llit"], ["Rebedor", "Penjador"], ["Repartidor", "Bicicleta"], ["Capità", "Vaixell"], ["Guepard", "Velocitat"]], // session 4
    [["Apicultora", "Mel"], ["Balança", "Pes"], ["Correus", "Cartes"], ["Ulleres", "Vista"], ["Forn", "Pastís"], ["Nuvia", "Vel"], ["Gasolinera", "Cotxe"], ["Espelma", "Aniversari"], ["Fre", "Cotxe"], ["Nutricionista", "Fruita"]], // session 5
    [["Ànec", "Estany"], ["Tambor", "Baqueta"], ["Manguera", "Aigua"], ["Ermità", "Closca"], ["Espeleòleg", "Cova"], ["Prestatgeria", "Llibres"], ["Literatura", "Novel·la"], ["Ham", "Pescar"], ["Rasclet", "Fulles"], ["Àlbum", "Fotografia"]], // session 6
    [["Handbol", "Porteria"], ["Científic", "Laboratori"], ["Marmota", "Cau"], ["Pallasso", "Nas"], ["Òptic", "Ulleres"], ["Dentista", "Dent"], ["Tro", "Espant"], ["Confeti", "Festa"], ["Cintura", "Cinturó"], ["Salvavides", "Piscina"]], // session 7
    [["Ampolla", "Aigua"], ["Moto", "Carretera"], ["Nedador", "Piscina"], ["Agulla", "Fil"], ["Morat", "Raïm"], ["Escala", "Alçada"], ["Plàstic", "Petroli"], ["Conill", "Cau"], ["Flaix", "Fosca"], ["Llanterna", "Fosca"]], // session 8
    [["Banc", "Diners"], ["Mantega", "Nata"], ["Pastís", "Boda"], ["Guilla", "Galliner"], ["Àvia", "Ganxet"], ["Serpentina", "Festa"], ["Veterinari", "Gos"], ["Electricista", "Cable"], ["Zoo", "Animals"], ["Oficina", "Ordinador"]], // session 9
    [["Helicòpter", "Hèlix"], ["Cargol", "Bava"], ["Partitura", "Piano"], ["Grillons", "Presó"], ["Cambrer", "Safata"], ["Avió", "Aeroport"], ["Menjador", "Taula"], ["Projector", "Pantalla"], ["Gebre", "Fred"], ["Paella", "Arròs"]], // session 10
    [["Forquilla", "Menjar"], ["Fàbrica", "Màquines"], ["Alicates", "Filferro"], ["Eriçó", "Punxes"], ["Cotxet", "Nadó"], ["Portallapis", "Llapis"], ["Vel", "Núvia"], ["Sucre", "Canya"], ["Acordió", "Manxa"], ["Bruixa", "Poció"]], // session 11
    [["Escultor", "Marbre"], ["Parc", "Gronxador"], ["Lleter", "Vaca"], ["Cafetera", "Cafè"], ["Núvol", "Pluja"], ["Rosa", "Flamenc"], ["Notari", "Signatura"], ["Tovalloler", "Tovallola"], ["Estibador", "Port"], ["Explorador", "Mapa"]], // session 12
    [["Batedora", "Ou"], ["Hivern", "Nadal"], ["Pel·lícula", "Popcorn"], ["Sabater", "Sabata"], ["Peu", "Sabata"], ["Guix", "Pissarra"], ["Casc", "Moto"], ["Selva", "Mico"], ["Pinzell", "Pintura"], ["Peatge", "Autopista"]], // session 13
    [["Boira", "Far"], ["Natació", "Piscina"], ["Cangur", "Bossa"], ["Farina", "Blat"], ["Comptable", "Diners"], ["Talp", "Túnel"], ["Parvulari", "Joguina"], ["Nadó", "Bressol"], ["Entrada", "Cinema"], ["Trípode", "Càmera"]], // session 14
    [["Lleó", "Sabana"], ["Entrepà", "Pa"], ["Sidra", "Poma"], ["Ciències", "Laboratori"], ["Taronja", "Pastanaga"], ["Tassa", "Cafè"], ["Molinet", "Cafè"], ["Marc", "Quadre"], ["Assecadora", "Roba"], ["Escriptor", "Llibre"]], // session 15
    [["Locutor", "Micròfon"], ["Biòleg", "Microscopi"], ["Patinatge", "Gel"], ["Endoll", "Corrent"], ["Xef", "Cuina"], ["Telèfon", "Trucada"], ["Canell", "Rellotge"], ["Aranya", "Teranyina"], ["Gos", "Ossos"], ["Reixa", "Presó"]], // session 16
    [["Iogurt", "Llet"], ["Papallona", "Crisàlide"], ["Taxista", "Taxi"], ["Hèlix", "Avió"], ["Mecànic", "Cotxe"], ["Soterrani", "Vi"], ["Periodista", "Diari"], ["Paracaigudes", "Salt"], ["Ós", "Bosc"], ["Compositor", "Piano"]], // session 17
  ]
];

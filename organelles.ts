export interface Question {
  text: string;
  options: string[];
  answer: number;
  explanation: string;
  hint: string;
}

export interface Organelle {
  id: string;
  order: number;
  name: string;
  short: string;
  color: string;
  emoji: string;
  description: string;
  func: string;
  fact: string;
  /** Posición del checkpoint en el suelo (x, y, z) */
  checkpoint: [number, number, number];
  /** Posición de la etiqueta flotante en el mundo */
  label: [number, number, number];
  question: Question;
}

export const ORGANELLES: Organelle[] = [
  {
    id: "pared",
    order: 1,
    name: "Pared celular",
    short: "Pared",
    color: "#7cb342",
    emoji: "🧱",
    description:
      "Es la capa más externa de la célula vegetal. Está formada principalmente por celulosa, un carbohidrato muy resistente que forma fibras entrecruzadas como una malla.",
    func: "Da rigidez, forma y protección a la célula. Evita que la célula estalle cuando absorbe mucha agua.",
    fact: "La madera y el papel están hechos, en gran parte, de las paredes celulares de células vegetales muertas.",
    checkpoint: [7, 0, 24.5],
    label: [7, 6.2, 30.6],
    question: {
      text: "¿Cuál es la función principal de la pared celular?",
      options: [
        "Producir energía para la célula",
        "Dar rigidez, forma y protección a la célula",
        "Fabricar proteínas",
        "Guardar el material genético",
      ],
      answer: 1,
      explanation:
        "La pared celular está hecha de celulosa y actúa como un armazón rígido que protege y da forma a la célula vegetal.",
      hint: "Piensa en para qué sirve una muralla alrededor de una ciudad.",
    },
  },
  {
    id: "membrana",
    order: 2,
    name: "Membrana plasmática",
    short: "Membrana",
    color: "#d4e157",
    emoji: "🫧",
    description:
      "Es una capa delgada y flexible situada justo por dentro de la pared celular. Está formada por una doble capa de fosfolípidos (bicapa lipídica) con proteínas incrustadas.",
    func: "Controla de manera selectiva qué sustancias entran y salen de la célula. Por eso se dice que es semipermeable.",
    fact: "La membrana es tan delgada (unos 7 nanómetros) que harían falta 10.000 apiladas para alcanzar el grosor de un cabello.",
    checkpoint: [-23, 0, 14],
    label: [-28.5, 5, 14],
    question: {
      text: "¿Qué característica describe mejor a la membrana plasmática?",
      options: [
        "Es rígida y está formada por celulosa",
        "Es un líquido que llena toda la célula",
        "Es una bicapa de lípidos con proteínas que regula lo que entra y sale",
        "Almacena agua y nutrientes",
      ],
      answer: 2,
      explanation:
        "La membrana plasmática es una bicapa de fosfolípidos con proteínas. Su permeabilidad selectiva regula el paso de sustancias.",
      hint: "Es como un portero que decide quién entra y quién sale.",
    },
  },
  {
    id: "citoplasma",
    order: 3,
    name: "Citoplasma",
    short: "Citoplasma",
    color: "#fff59d",
    emoji: "💧",
    description:
      "Es todo el contenido de la célula entre la membrana y el núcleo. Está formado por el citosol (un líquido gelatinoso con agua, sales y proteínas) y los orgánulos que flotan en él, sostenidos por el citoesqueleto.",
    func: "Es el medio donde ocurren muchas reacciones químicas y donde se mueven y se sostienen los orgánulos.",
    fact: "En muchas células vegetales el citoplasma fluye en círculos constantemente. A este movimiento se le llama ciclosis.",
    checkpoint: [-15, 0, 11],
    label: [-15, 4.2, 11],
    question: {
      text: "¿Qué es el citoplasma?",
      options: [
        "Un orgánulo que produce energía",
        "El líquido gelatinoso donde flotan los orgánulos",
        "La capa externa y rígida de la célula",
        "El material genético de la célula",
      ],
      answer: 1,
      explanation:
        "El citoplasma es el medio gelatinoso (citosol) que llena la célula y donde se encuentran suspendidos los orgánulos.",
      hint: "Fíjate en las partículas que flotan a tu alrededor.",
    },
  },
  {
    id: "rel",
    order: 4,
    name: "Retículo endoplasmático liso",
    short: "RE liso",
    color: "#ffcc80",
    emoji: "🧬",
    description:
      "Es una red de túbulos membranosos conectados entre sí. A diferencia del rugoso, NO tiene ribosomas pegados, por eso se ve liso.",
    func: "Sintetiza lípidos (grasas), almacena calcio y ayuda a eliminar (desintoxicar) sustancias dañinas.",
    fact: "En las células que producen mucha grasa o aceite, como las semillas oleaginosas, el RE liso es especialmente abundante.",
    checkpoint: [-10, 0, 6],
    label: [-14, 5, 2],
    question: {
      text: "¿Cuál es una función del retículo endoplasmático liso?",
      options: [
        "Sintetizar lípidos y desintoxicar sustancias",
        "Realizar la fotosíntesis",
        "Fabricar ribosomas",
        "Almacenar agua para la planta",
      ],
      answer: 0,
      explanation:
        "El RE liso fabrica lípidos, almacena calcio y participa en la desintoxicación. No tiene ribosomas, por eso es «liso».",
      hint: "Piensa en grasas y aceites.",
    },
  },
  {
    id: "nucleo",
    order: 5,
    name: "Núcleo",
    short: "Núcleo",
    color: "#90a4ae",
    emoji: "🎯",
    description:
      "Es una gran esfera rodeada por la envoltura nuclear, una doble membrana con poros. Dentro está el ADN (en forma de cromatina) y el nucléolo, una zona densa donde se fabrican los ribosomas.",
    func: "Es el centro de control de la célula: guarda la información genética y dirige todas las actividades celulares.",
    fact: "Si estiraras todo el ADN de una sola célula, mediría unos 2 metros de largo, ¡y cabe en un núcleo de 0,005 milímetros!",
    checkpoint: [-19, 0, -5.5],
    label: [-19, 11.2, -13],
    question: {
      text: "¿Por qué el núcleo se considera el «centro de control» de la célula?",
      options: [
        "Porque produce toda la energía de la célula",
        "Porque contiene el ADN con las instrucciones genéticas",
        "Porque almacena agua y sales minerales",
        "Porque digiere los desechos celulares",
      ],
      answer: 1,
      explanation:
        "El núcleo contiene el ADN, que tiene las instrucciones para fabricar proteínas y controlar el funcionamiento de la célula.",
      hint: "¿Dónde se guardan las instrucciones de la célula?",
    },
  },
  {
    id: "rer",
    order: 6,
    name: "Retículo endoplasmático rugoso",
    short: "RE rugoso",
    color: "#66bb6a",
    emoji: "📚",
    description:
      "Es un conjunto de membranas aplanadas (cisternas) conectadas con la envoltura nuclear. Su superficie está cubierta de ribosomas, lo que le da un aspecto rugoso.",
    func: "Sintetiza y pliega proteínas que serán enviadas a la membrana, a otros orgánulos o al exterior de la célula.",
    fact: "Las proteínas fabricadas aquí viajan en pequeñas vesículas hasta el aparato de Golgi, como paquetes en un sistema de correo.",
    checkpoint: [-6, 0, -13],
    label: [-9, 5.4, -13],
    question: {
      text: "¿Qué hace que el retículo endoplasmático rugoso se vea «rugoso»?",
      options: [
        "Los cloroplastos pegados a su superficie",
        "Sus pliegues internos llamados crestas",
        "Los ribosomas adheridos a sus membranas",
        "Los granos de almidón que almacena",
      ],
      answer: 2,
      explanation:
        "Los ribosomas adheridos a la superficie del RE rugoso le dan ese aspecto granulado y le permiten sintetizar proteínas.",
      hint: "Observa los puntitos morados sobre las membranas verdes.",
    },
  },
  {
    id: "ribosomas",
    order: 7,
    name: "Ribosomas",
    short: "Ribosomas",
    color: "#ab47bc",
    emoji: "🔮",
    description:
      "Son diminutas estructuras formadas por ARN y proteínas. No tienen membrana. Pueden estar libres en el citoplasma o unidos al retículo endoplasmático rugoso.",
    func: "Fabrican proteínas «leyendo» las instrucciones del ARN mensajero que viene del núcleo.",
    fact: "Una sola célula puede tener millones de ribosomas trabajando al mismo tiempo, como una fábrica gigantesca.",
    checkpoint: [1, 0, -16],
    label: [1, 4.4, -20],
    question: {
      text: "¿Cuál es la función de los ribosomas?",
      options: [
        "Sintetizar proteínas",
        "Producir ATP (energía)",
        "Almacenar pigmentos verdes",
        "Transportar agua",
      ],
      answer: 0,
      explanation:
        "Los ribosomas son las «fábricas de proteínas» de la célula. Traducen la información del ARN mensajero en cadenas de aminoácidos.",
      hint: "Son las fábricas de la célula… ¿qué producen?",
    },
  },
  {
    id: "mitocondrias",
    order: 8,
    name: "Mitocondrias",
    short: "Mitocondrias",
    color: "#ff8a65",
    emoji: "🔋",
    description:
      "Orgánulos con forma de alubia rodeados por dos membranas. La membrana interna forma pliegues llamados crestas, que aumentan la superficie de trabajo.",
    func: "Realizan la respiración celular: usan oxígeno y glucosa para producir ATP, la «moneda de energía» de la célula.",
    fact: "Las plantas también tienen mitocondrias. Los cloroplastos fabrican azúcar, pero son las mitocondrias las que la convierten en energía utilizable.",
    checkpoint: [14, 0, -12],
    label: [12, 3.9, -17],
    question: {
      text: "¿Qué proceso ocurre en las mitocondrias?",
      options: [
        "La fotosíntesis",
        "La síntesis de proteínas",
        "La digestión de la pared celular",
        "La respiración celular, que produce ATP",
      ],
      answer: 3,
      explanation:
        "En las mitocondrias ocurre la respiración celular: la glucosa se «quema» con oxígeno para obtener ATP.",
      hint: "Se les llama «las centrales energéticas» de la célula.",
    },
  },
  {
    id: "cloroplastos",
    order: 9,
    name: "Cloroplastos",
    short: "Cloroplastos",
    color: "#43a047",
    emoji: "🌿",
    description:
      "Orgánulos verdes exclusivos de las células vegetales y de las algas. Contienen clorofila organizada en pilas de discos llamados grana, dentro de un líquido llamado estroma.",
    func: "Realizan la fotosíntesis: transforman la luz solar, el agua y el dióxido de carbono en glucosa y oxígeno.",
    fact: "Casi todo el oxígeno que respiras fue producido por cloroplastos de plantas y algas.",
    checkpoint: [16, 0, -1],
    label: [20, 4, -1],
    question: {
      text: "¿Qué proceso realizan los cloroplastos?",
      options: [
        "La respiración celular",
        "La fotosíntesis: convierten luz, agua y CO₂ en glucosa y oxígeno",
        "La síntesis de lípidos",
        "La división celular",
      ],
      answer: 1,
      explanation:
        "Los cloroplastos captan la luz con la clorofila y realizan la fotosíntesis, produciendo glucosa y liberando oxígeno.",
      hint: "Su color verde tiene mucho que ver con la luz del sol.",
    },
  },
  {
    id: "golgi",
    order: 10,
    name: "Aparato de Golgi",
    short: "Golgi",
    color: "#ffab91",
    emoji: "📦",
    description:
      "Es un conjunto de sacos membranosos aplanados y apilados, como una pila de panes de pita. Recibe vesículas del retículo endoplasmático.",
    func: "Modifica, clasifica, empaqueta y distribuye proteínas y lípidos hacia su destino final, dentro o fuera de la célula.",
    fact: "En las células vegetales, el aparato de Golgi también fabrica los componentes de la pared celular (excepto la celulosa).",
    checkpoint: [11, 0, 10],
    label: [15, 5.2, 13],
    question: {
      text: "¿Cuál es la función principal del aparato de Golgi?",
      options: [
        "Modificar, empaquetar y distribuir proteínas y lípidos",
        "Producir energía en forma de ATP",
        "Captar la luz del sol",
        "Contener el ADN de la célula",
      ],
      answer: 0,
      explanation:
        "El aparato de Golgi funciona como una oficina de correos: recibe, modifica, empaqueta y envía moléculas a su destino.",
      hint: "Piensa en una oficina de correos o un centro de reparto.",
    },
  },
  {
    id: "peroxisomas",
    order: 11,
    name: "Peroxisomas",
    short: "Peroxisomas",
    color: "#f06292",
    emoji: "🧪",
    description:
      "Pequeñas vesículas esféricas rodeadas por una membrana. Contienen enzimas (como la catalasa) y a veces se observa un núcleo cristalino en su interior.",
    func: "Descomponen sustancias tóxicas, en especial el peróxido de hidrógeno (agua oxigenada), transformándolo en agua y oxígeno.",
    fact: "En las hojas, los peroxisomas colaboran con los cloroplastos y las mitocondrias en un proceso llamado fotorrespiración.",
    checkpoint: [5, 0, 14],
    label: [6, 3.4, 17],
    question: {
      text: "¿Qué hacen los peroxisomas?",
      options: [
        "Fabrican celulosa para la pared",
        "Almacenan agua y sales",
        "Descomponen sustancias tóxicas como el peróxido de hidrógeno",
        "Producen clorofila",
      ],
      answer: 2,
      explanation:
        "Los peroxisomas contienen enzimas como la catalasa, que descompone el peróxido de hidrógeno en agua y oxígeno.",
      hint: "Su nombre viene de «peróxido».",
    },
  },
  {
    id: "vacuola",
    order: 12,
    name: "Vacuola central",
    short: "Vacuola",
    color: "#4fc3f7",
    emoji: "💠",
    description:
      "Es el orgánulo más grande de la célula vegetal: puede ocupar hasta el 90 % de su volumen. Está rodeada por una membrana llamada tonoplasto y llena de un líquido llamado jugo celular.",
    func: "Almacena agua, nutrientes, pigmentos y desechos. Al llenarse de agua empuja al citoplasma contra la pared y mantiene la planta firme (turgencia).",
    fact: "Cuando una planta se marchita es porque sus vacuolas han perdido agua y las células ya no están turgentes.",
    checkpoint: [0, 0, 8],
    label: [0, 19.4, 0],
    question: {
      text: "¿Cuál es una función de la vacuola central en las células vegetales?",
      options: [
        "Producir proteínas",
        "Almacenar agua y mantener la turgencia (firmeza) de la planta",
        "Realizar la respiración celular",
        "Fabricar ribosomas",
      ],
      answer: 1,
      explanation:
        "La vacuola central almacena agua y sustancias. Su presión mantiene las células firmes, lo que sostiene a la planta erguida.",
      hint: "¿Qué le pasa a una planta cuando no la riegas?",
    },
  },
];

export const ORDER = ORGANELLES.map((o) => o.id);
export const BY_ID: Record<string, Organelle> = Object.fromEntries(
  ORGANELLES.map((o) => [o.id, o])
);

export const FINAL_QUIZ: Question[] = [
  {
    text: "¿Qué estructura tiene la célula vegetal pero NO la célula animal?",
    options: ["Mitocondria", "Pared celular", "Ribosoma", "Membrana plasmática"],
    answer: 1,
    explanation:
      "La pared celular (y también los cloroplastos y la gran vacuola central) son características de las células vegetales.",
    hint: "",
  },
  {
    text: "Una planta se marchita cuando le falta agua. ¿Qué orgánulo está directamente relacionado con esto?",
    options: ["Vacuola central", "Núcleo", "Aparato de Golgi", "Peroxisoma"],
    answer: 0,
    explanation:
      "La vacuola central almacena agua y mantiene la turgencia. Al perder agua, las células pierden firmeza y la planta se marchita.",
    hint: "",
  },
  {
    text: "Una proteína que será exportada fuera de la célula se fabrica en… y luego se empaqueta en…",
    options: [
      "Núcleo → Vacuola",
      "Cloroplasto → Mitocondria",
      "Ribosomas del RE rugoso → Aparato de Golgi",
      "Peroxisoma → Membrana plasmática",
    ],
    answer: 2,
    explanation:
      "Los ribosomas del RE rugoso sintetizan la proteína; luego viaja en vesículas al aparato de Golgi, que la modifica y empaqueta.",
    hint: "",
  },
  {
    text: "¿Qué orgánulo es verde y contiene clorofila?",
    options: ["Mitocondria", "Núcleo", "Ribosoma", "Cloroplasto"],
    answer: 3,
    explanation:
      "Los cloroplastos contienen clorofila, el pigmento verde que capta la luz para la fotosíntesis.",
    hint: "",
  },
  {
    text: "¿Dónde se encuentra la mayor parte del ADN de la célula vegetal?",
    options: ["En la vacuola", "En el núcleo", "En la pared celular", "Libre en el citoplasma"],
    answer: 1,
    explanation:
      "El ADN se encuentra en el núcleo, protegido por la envoltura nuclear (también hay un poco en cloroplastos y mitocondrias).",
    hint: "",
  },
  {
    text: "¿Qué orgánulo produce la mayor parte del ATP (energía utilizable) de la célula?",
    options: ["Aparato de Golgi", "Retículo endoplasmático liso", "Mitocondria", "Vacuola"],
    answer: 2,
    explanation:
      "Las mitocondrias realizan la respiración celular y producen la mayor parte del ATP que usa la célula.",
    hint: "",
  },
];

export const POINTS_FIRST_TRY = 100;
export const POINTS_SECOND_TRY = 50;
export const POINTS_LATER = 25;
export const POINTS_FINAL = 100;
export const MAX_SCORE =
  ORGANELLES.length * POINTS_FIRST_TRY + FINAL_QUIZ.length * POINTS_FINAL;

/** Posición inicial del jugador */
export const START_POSITION = { x: 0, z: 22 };

/** Colisionadores circulares (x, z, radio) en el plano del suelo */
export const COLLIDERS: [number, number, number][] = [
  [0, 0, 5.2], // vacuola
  [-19, -13, 5.6], // núcleo
  [15, 13, 3.4], // golgi
  [-14, 2, 3.2], // RE liso
  // RE rugoso (arco)
  [-11.4, -7.2, 1.3],
  [-9.6, -10.4, 1.3],
  [-9.2, -13, 1.3],
  [-9.6, -15.6, 1.3],
  [-11.4, -18.8, 1.3],
  // cloroplastos
  [20, -1, 2.3],
  [16, 5, 2.3],
  [22, -13, 2.3],
  [-5, 20, 2.3],
  [10, 21, 2.3],
  // mitocondrias
  [12, -17, 2.2],
  [19, -9, 2.2],
  [-7, 19, 2.2],
  [-22, 4, 2.2],
  // peroxisomas
  [6, 17, 1.1],
  [9, 19.5, 1.1],
  [4, 21, 1.0],
];

export const CHLOROPLASTS: { position: [number, number, number]; rotation: number }[] = [
  { position: [20, 1.4, -1], rotation: 0.3 },
  { position: [16, 1.4, 5], rotation: -0.9 },
  { position: [22, 1.6, -13], rotation: 1.2 },
  { position: [-5, 1.4, 20], rotation: 0.6 },
  { position: [10, 1.4, 21], rotation: -0.4 },
];

export const MITOCHONDRIA: { position: [number, number, number]; rotation: number }[] = [
  { position: [12, 1.2, -17], rotation: 0.5 },
  { position: [19, 1.2, -9], rotation: -0.7 },
  { position: [-7, 1.2, 19], rotation: 1.1 },
  { position: [-22, 1.2, 4], rotation: 0.2 },
];

export const PEROXISOMES: [number, number, number][] = [
  [6, 1, 17],
  [9, 0.9, 19.5],
  [4, 0.8, 21],
];

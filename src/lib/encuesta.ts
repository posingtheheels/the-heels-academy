/**
 * Definición del cuestionario de satisfacción que se envía por WhatsApp.
 *
 * Vive en un único sitio porque lo consumen tres piezas: el formulario público
 * (/encuesta), la validación del endpoint que lo guarda y el panel de admin que
 * lo muestra. Si las etiquetas se duplicaran, el panel acabaría enseñando la
 * pregunta antigua junto a la respuesta nueva.
 */

/** Valoraciones de 1 a 5. El orden es el que ve la alumna en el formulario. */
export const VALORACIONES = [
  {
    campo: "ratingClasses",
    titulo: "Las clases de posing",
    ayuda: "Contenido, ritmo y lo que te llevas de cada sesión",
  },
  {
    campo: "ratingTeacher",
    titulo: "Yo como coach",
    ayuda: "Cómo explico, cómo te motivo y cómo te trato",
  },
  {
    campo: "ratingTechnique",
    titulo: "Las correcciones técnicas",
    ayuda: "Lo concretas y útiles que son las correcciones que recibes",
  },
  {
    campo: "ratingFollowUp",
    titulo: "El seguimiento entre clases",
    ayuda: "Si notas que estoy ahí también cuando no hay clase",
  },
  {
    campo: "ratingBooking",
    titulo: "Reservas y organización",
    ayuda: "Facilidad para reservar, horarios y comunicación",
  },
  {
    campo: "ratingValue",
    titulo: "Relación calidad-precio",
    ayuda: "Lo que recibes comparado con lo que pagas",
  },
  {
    campo: "ratingProgress",
    titulo: "Tu progreso",
    ayuda: "Cuánto sientes que has mejorado desde que empezaste",
  },
  {
    campo: "ratingOverall",
    titulo: "The Heels en general",
    ayuda: "Tu nota global a la academia",
  },
] as const;

/**
 * Preguntas abiertas agrupadas en pantallas.
 *
 * Van repartidas a propósito: son catorce y juntas en una sola pantalla
 * parecen deberes. En bloques de tres o cuatro con un titular delante, la
 * alumna ve el final de cada tramo y sigue.
 */
export const BLOQUES_ABIERTOS = [
  {
    id: "llegada",
    titulo: "Cómo llegaste hasta aquí",
    ayuda: "Lo que me cuentes aquí me ayuda a encontrar a las próximas.",
    preguntas: [
      {
        campo: "whyStarted",
        titulo: "¿Qué te hizo decidirte a dar el paso?",
        ayuda: "Ese momento en el que dijiste «va, lo hago»",
        placeholder: "Me decidí cuando…",
      },
      {
        campo: "whyUs",
        titulo: "¿Miraste otras opciones antes? ¿Por qué me elegiste a mí?",
        ayuda: "Sin filtros, aunque fuera por cercanía o por precio",
        placeholder: "Te elegí porque…",
      },
      {
        campo: "surprise",
        titulo: "¿Qué te sorprendió de The Heels que no esperabas?",
        ayuda: "Para bien o para mal",
        placeholder: "No me esperaba que…",
      },
    ],
  },
  {
    id: "experiencia",
    titulo: "Tu experiencia en clase",
    ayuda: "No hace falta que contestes a todas. Con las que te salgan solas me vale.",
    preguntas: [
      {
        campo: "bestPart",
        titulo: "¿Qué es lo que más te engancha de las clases?",
        ayuda: "Eso por lo que vuelves cada semana",
        placeholder: "Lo que más me engancha es…",
      },
      {
        campo: "proudMoment",
        titulo: "Cuéntame un momento en el que te sentiste orgullosa de ti",
        ayuda: "Una pose que por fin te salió, una tarima, un vídeo tuyo que te sorprendió…",
        placeholder: "Me acuerdo del día que…",
      },
      {
        campo: "firstStageVsNow",
        titulo: "¿Cómo te sentías la primera vez que te subiste a una tarima y cómo te sientes ahora?",
        ayuda: "Si todavía no has competido, cuéntame cómo te sentías el primer día de clase",
        placeholder: "La primera vez… y ahora…",
      },
      {
        campo: "howChanged",
        titulo: "¿En qué notas que has cambiado desde que empezaste?",
        ayuda: "En la técnica, en el cuerpo, en cómo te plantas delante de la gente",
        placeholder: "Antes… y ahora…",
      },
    ],
  },
  {
    id: "llevas",
    titulo: "Lo que te llevas",
    ayuda: "Esta parte es la que más me emociona leer.",
    preguntas: [
      {
        campo: "beyondStage",
        titulo: "¿Hay algo que hayas conseguido fuera de la tarima gracias a las clases?",
        ayuda: "En el trabajo, con la gente, delante del espejo…",
        placeholder: "Desde que empecé, fuera de la tarima…",
      },
      {
        campo: "peopleSay",
        titulo: "¿Qué te dice la gente cuando te ve posar ahora?",
        ayuda: "Familia, amigas, gente del gimnasio",
        placeholder: "Me dicen que…",
      },
      {
        campo: "toPastSelf",
        titulo: "¿Qué le dirías a la que eras el día que entraste por primera vez?",
        ayuda: "Como si pudieras mandarle un mensaje",
        placeholder: "Le diría que…",
      },
      {
        campo: "oneLiner",
        titulo: "Si tuvieras que convencer a una amiga en una sola frase, ¿qué le dirías?",
        ayuda: "Esta es la que suelo compartir en la web y en redes",
        placeholder: "Ve, porque…",
      },
      {
        campo: "inOneWord",
        titulo: "Si The Heels fuera una palabra o una canción, ¿cuál sería?",
        ayuda: "Lo primero que te venga a la cabeza",
        placeholder: "Sería…",
      },
    ],
  },
] as const;

/** Las mismas preguntas en plano: lo que necesitan la API y el panel. */
export const PREGUNTAS_ABIERTAS = BLOQUES_ABIERTOS.reduce(
  (todas, bloque) => todas.concat(bloque.preguntas as any),
  [] as { campo: string; titulo: string; ayuda: string; placeholder: string }[]
);

/** Va sola en su pantalla, justo antes del vídeo. */
export const PREGUNTA_COACH = {
  campo: "coachFeedback",
  titulo: "Para terminar, háblame de mí como coach",
  ayuda:
    "Qué te aporto, cómo te hago sentir en clase y en qué crees que podría ayudarte todavía más. Sin miedo: esto lo leo yo y es lo que mejor me hace mejorar.",
  placeholder: "Contigo…",
} as const;

/** Pregunta de mejora. Separada porque cierra el bloque de «qué te gustaría». */
export const PREGUNTA_MEJORA = {
  campo: "improvement",
  titulo: "¿Qué pequeño detalle haría tus clases todavía mejores?",
  ayuda: "Sin filtros: esto es lo que más me ayuda a mejorar",
  placeholder: "Me encantaría que…",
} as const;

/** Todo el texto libre que guarda la encuesta, para validar y para el panel. */
export const CAMPOS_TEXTO = PREGUNTAS_ABIERTAS.concat([
  PREGUNTA_MEJORA as any,
  PREGUNTA_COACH as any,
]);

export const ANTIGUEDADES = [
  { valor: "NUEVA", etiqueta: "Acabo de empezar" },
  { valor: "MESES_1_3", etiqueta: "Entre 1 y 3 meses" },
  { valor: "MESES_3_6", etiqueta: "Entre 3 y 6 meses" },
  { valor: "MESES_6_12", etiqueta: "Entre 6 meses y 1 año" },
  { valor: "MAS_1_ANO", etiqueta: "Más de un año" },
  { valor: "ANTIGUA", etiqueta: "Estuve una temporada, ahora no voy" },
] as const;

export const MODALIDADES = [
  { valor: "PRESENCIAL", etiqueta: "Presencial" },
  { valor: "ONLINE", etiqueta: "Online" },
  { valor: "AMBAS", etiqueta: "Las dos" },
] as const;

/** De dónde vino. Una sola opción: es la que te dice dónde invertir. */
export const CANALES = [
  { valor: "INSTAGRAM", etiqueta: "Instagram" },
  { valor: "AMIGA", etiqueta: "Me lo recomendó una amiga" },
  { valor: "ENTRENADOR", etiqueta: "Mi entrenador o preparador" },
  { valor: "GOOGLE", etiqueta: "Buscando en Google" },
  { valor: "CAMPEONATO", etiqueta: "Te vi en un campeonato" },
  { valor: "OTRO", etiqueta: "Otro" },
] as const;

/** Selección múltiple: qué quiere trabajar más en clase. */
export const TRABAJAR_MAS = {
  campo: "wantMore",
  titulo: "¿Qué te gustaría trabajar más en clase?",
  ayuda: "Marca todo lo que quieras. Con esto planifico el trimestre.",
  opciones: [
    { valor: "OBLIGATORIAS", etiqueta: "Poses obligatorias" },
    { valor: "CAMINAR", etiqueta: "Caminar y giros" },
    { valor: "BRAZOS", etiqueta: "Brazos y manos" },
    { valor: "EXPRESION", etiqueta: "Expresión y mirada" },
    { valor: "RUTINA", etiqueta: "Rutina libre" },
    { valor: "PRESENCIA", etiqueta: "Presencia en tarima" },
    { valor: "NERVIOS", etiqueta: "Confianza y nervios" },
    { valor: "FOTOS", etiqueta: "Posado para fotos y redes" },
  ],
} as const;

/** Selección múltiple: interés en lo que estamos preparando. */
export const INTERESES = {
  campo: "interests",
  titulo: "¿Qué te interesaría que lanzara?",
  ayuda: "Marca a lo que te apuntarías. Me dice qué preparo primero.",
  opciones: [
    { valor: "PACKS_INTENSIVOS", etiqueta: "Packs intensivos de preparación para campeonato" },
    { valor: "FORMACIONES_GRABADAS", etiqueta: "Formaciones grabadas para ver en casa" },
    { valor: "TALLERES", etiqueta: "Talleres de fin de semana" },
    { valor: "INDIVIDUALES", etiqueta: "Sesiones individuales" },
    { valor: "POR_CATEGORIA", etiqueta: "Grupos por categoría (Bikini, Wellness…)" },
  ],
} as const;

export const MULTIPLES = [TRABAJAR_MAS, INTERESES];

/** Bucket privado de Supabase donde aterrizan los vídeos. */
export const BUCKET_VIDEOS = "encuestas";

/**
 * Tope de subida.
 *
 * Son los 50 MB del límite global del proyecto en Supabase, no una cifra
 * elegida: el vídeo viaja del móvil al bucket sin pasar por el servidor, así
 * que si aquí pusiéramos más, la subida reventaría al final en vez de avisar
 * antes de empezar. Da de sobra para 30-40 s en 1080p; en 4K se queda corto, y
 * por eso el formulario pide que no graben en 4K.
 */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/**
 * Tope por foto. Una foto de movil ronda los 2-5 MB; 15 MB deja margen para
 * las de camara buena sin acercarse al limite de 50 MB del bucket.
 */
export const MAX_FOTO_BYTES = 15 * 1024 * 1024;

/**
 * HEIC y HEIF entran a proposito aunque el navegador no sepa dibujarlos: son
 * el formato por defecto del iPhone y rechazarlos dejaria fuera a media clase.
 * El panel intenta mostrarlos y, si no puede, ofrece descargarlos.
 */
export const TIPOS_FOTO = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

/** Las dos ranuras de la comparativa, en el orden en que se ven. */
export const FOTOS = [
  {
    campo: "beforePhotoPath",
    titulo: "Antes",
    ayuda: "Cuando empezaste, o lo más cerca que tengas de aquel momento",
  },
  {
    campo: "afterPhotoPath",
    titulo: "Ahora",
    ayuda: "Una foto actual",
  },
] as const;

export const TIPOS_VIDEO = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
  "video/3gpp",
];

export type CampoValoracion = (typeof VALORACIONES)[number]["campo"];

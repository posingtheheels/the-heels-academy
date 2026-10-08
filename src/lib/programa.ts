/**
 * Definición de Camino a la Tarima, el programa en directo de doce semanas.
 *
 * Lo consumen la página de solicitud, la validación del endpoint que la guarda,
 * los dos correos y el panel de admin. Las cohortes viven aquí y no en
 * `masterclass.ts` porque son del programa: la masterclass sólo las usa para
 * decir a qué grupo iría cada inscrita.
 */

export const PROGRAMA = {
  nombre: "Camino a la Tarima",
  promesa:
    "Doce semanas para subir a tarima sabiendo exactamente qué hacer con tu cuerpo, tu cara y tus pies desde que se enciende el foco hasta que sales del escenario.",
  plazasPorGrupo: 8,
  semanas: 12,
  horasDeDirecto: 16.5,
} as const;

/** Las dos modalidades. No hay más, y eso es deliberado. */
export const MODALIDADES = [
  {
    valor: "GRUPO",
    etiqueta: "Grupo",
    precioMes: 89,
    precioUnico: 249,
    resumen: "Grupo reducido de máximo 8 atletas",
    incluye: [
      "1 sesión grupal en directo de 75 min por semana",
      "1 sesión individual de 30 min al mes",
      "Revisión de vídeo semanal de tu ensayo",
      "Diseño de tu rutina individual en la fase 2",
      "Simulacro de juzgamiento con hoja de puntuación",
      "Dossier de Posing y checklist del día D",
      "Grupo de WhatsApp con tu cohorte",
    ],
  },
  {
    valor: "INDIVIDUAL",
    etiqueta: "Individual",
    precioMes: 149,
    precioUnico: 399,
    resumen: "Para quien necesita horario propio",
    incluye: [
      "3 sesiones 1:1 de 45 min al mes",
      "Revisión de vídeo semanal",
      "Rutina individual con guion y vídeo de referencia",
      "2 simulacros de juzgamiento",
      "Todos los entregables y sesión post-competición",
      "Entrada libre a las sesiones grupales",
    ],
  },
] as const;

/**
 * Cohortes abiertas. La asigna la fecha de competición de la atleta, no su
 * preferencia de horario: un grupo son doce semanas atadas a una temporada.
 */
export const COHORTES = {
  ENERO: {
    etiqueta: "Enero",
    arranca: "25 de enero",
    termina: "18 de abril",
    para: "compites entre abril y mayo",
  },
  FEBRERO: {
    etiqueta: "Febrero",
    arranca: "22 de febrero",
    termina: "16 de mayo",
    para: "compites entre junio y julio",
  },
} as const;

export type Cohorte = keyof typeof COHORTES;

/** Toma un valor de `CUANDO_COMPITES`. Devuelve null si no le toca cohorte. */
export function cohorteDe(competeWhen: string): Cohorte | null {
  if (competeWhen === "ABRIL_MAYO") return "ENERO";
  if (competeWhen === "JUNIO_JULIO") return "FEBRERO";
  return null;
}

/** Experiencia en tacón. Separa niveles mejor que preguntar por competiciones. */
export const EXPERIENCIA_TACON = [
  { valor: "NINGUNA", etiqueta: "Ninguna, empiezo de cero" },
  { valor: "POCA", etiqueta: "Poca: me cuesta andar con ellos" },
  { valor: "MEDIA", etiqueta: "Me defiendo" },
  { valor: "MUCHA", etiqueta: "Mucha, voy cómoda" },
] as const;

/** Franjas en las que puede estar en una videollamada. Selección múltiple. */
export const FRANJAS = [
  { valor: "MANANA", etiqueta: "Mañanas" },
  { valor: "MEDIODIA", etiqueta: "Mediodía" },
  { valor: "TARDE", etiqueta: "Tardes" },
  { valor: "NOCHE", etiqueta: "A partir de las 20:00" },
  { valor: "FINDE", etiqueta: "Fines de semana" },
] as const;

/**
 * Estados de una solicitud. Es el embudo de la llamada de valoración, y el
 * orden es el que sigue de verdad: entra, se le escribe, se habla, se decide.
 */
export const ESTADOS_SOLICITUD = [
  { valor: "NUEVA", etiqueta: "Nueva" },
  { valor: "CONTACTADA", etiqueta: "Contactada" },
  { valor: "LLAMADA", etiqueta: "Llamada hecha" },
  { valor: "ADMITIDA", etiqueta: "Admitida" },
  { valor: "PAGADA", etiqueta: "Pagada" },
  { valor: "DESCARTADA", etiqueta: "Descartada" },
] as const;

/**
 * Carpeta dentro del bucket privado que ya existe para las encuestas.
 *
 * Se reutiliza ese bucket a propósito: ya está creado, ya es privado y ya tiene
 * las políticas puestas. Si algún día conviene separarlos, es cambiar esta
 * constante y mover los archivos.
 */
export const CARPETA_SOLICITUDES = "solicitudes";

/** Busca la etiqueta visible de un valor guardado. */
export function etiquetaDe(
  lista: readonly { valor: string; etiqueta: string }[],
  valor: string | null | undefined
): string {
  if (!valor) return "—";
  return lista.find((o) => o.valor === valor)?.etiqueta ?? valor;
}

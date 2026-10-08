/**
 * Definición de la masterclass gratuita que abre el embudo.
 *
 * Vive en un único sitio porque lo consumen cuatro piezas: la landing pública
 * (/masterclass), la validación del endpoint que guarda la inscripción, el email
 * de confirmación y el panel de admin. Si las listas se duplicaran, el panel
 * acabaría enseñando una etiqueta y la base de datos otra.
 *
 * Para la siguiente edición se cambia este fichero y nada más: la fecha, el
 * identificador de edición y los textos están todos aquí.
 */

/** Datos de la edición vigente. El resto de la app no conoce ninguna fecha. */
export const MASTERCLASS = {
  /** Identificador de edición, en AAAA-MM-DD. Es lo que separa las listas. */
  edicion: "2027-01-14",
  titulo: "Lo que ven los jueces",
  subtitulo: "Masterclass de posing de competición",
  fechaTexto: "jueves 14 de enero",
  fechaCorta: "14 ene",
  hora: "19:30",
  zona: "hora peninsular (CET)",
  duracion: "90 minutos + preguntas",
  replayTexto: "hasta el domingo 17 a las 23:59",
  replayHoras: 72,
  plazasCamara: 5,
  /** Con zona horaria explícita: en enero España es UTC+1. */
  empiezaEn: "2027-01-14T19:30:00+01:00",
  /** Cierra a la vez el replay y el precio de lanzamiento de Fundamentos. */
  replayCierraEn: "2027-01-17T23:59:00+01:00",
} as const;

/**
 * Los cuatro entregables. Son el pago por los 90 minutos de quien asiste, así
 * que se entregan igual en directo que en el replay.
 *
 * Los PDF viven en public/masterclass/. Si falta alguno, su enlace da 404: es
 * contenido, no código, y se sube aparte.
 */
export const DESCARGABLES = [
  { nombre: "Checklist de los siete puntos de la pose", archivo: "checklist-siete-puntos.pdf" },
  { nombre: "Plantilla de mapa musical", archivo: "mapa-musical.pdf" },
  { nombre: "Cronograma del día D con la lista de maleta", archivo: "dia-d-y-maleta.pdf" },
  { nombre: "Tu hoja de puntuación sobre 45", archivo: "hoja-de-puntuacion.pdf" },
] as const;

/**
 * La oferta de la ventana de 72 horas.
 *
 * El enlace de compra es una variable de entorno a propósito: mientras el
 * checkout multiproducto no esté desplegado, aquí se pega un Payment Link de
 * Stripe y el embudo funciona igual. Sin la variable, el bloque no se muestra
 * en lugar de enseñar un botón roto.
 */
export const OFERTA = {
  titulo: "Fundamentos del Posing",
  descripcion:
    "La base entera: qué puntúa un juez, los cuatro cuartos de giro, tus poses obligatorias adaptadas a tu cuerpo, manos y cara, la caminata y un plan de práctica de doce semanas.",
  precio: 39,
  precioTachado: 59,
  detalle: "6 módulos · 20 lecciones · 2 h · acceso de por vida",
} as const;

/** Momento de la edición. Lo calcula siempre el servidor: el reloj del móvil miente. */
export function estadoDeLaEdicion(ahora: Date = new Date()) {
  const empieza = new Date(MASTERCLASS.empiezaEn);
  const cierra = new Date(MASTERCLASS.replayCierraEn);

  if (ahora < empieza) return "ANTES" as const;
  if (ahora <= cierra) return "REPLAY" as const;
  return "CERRADO" as const;
}

/** Federación. Lista corta: si no está la suya, "otra" no estorba el alta. */
export const FEDERACIONES = [
  { valor: "IFBB", etiqueta: "IFBB" },
  { valor: "NAC", etiqueta: "NAC" },
  { valor: "WABBA", etiqueta: "WABBA" },
  { valor: "WNBF", etiqueta: "WNBF" },
  { valor: "UIBBN", etiqueta: "UIBBN" },
  { valor: "OTRA", etiqueta: "Otra" },
  { valor: "NO_LO_SE", etiqueta: "Todavía no lo sé" },
] as const;

export const CATEGORIAS = [
  { valor: "BIKINI", etiqueta: "Bikini" },
  { valor: "WELLNESS", etiqueta: "Wellness" },
  { valor: "FIGURE", etiqueta: "Figure" },
  { valor: "BODYFITNESS", etiqueta: "Bodyfitness" },
  { valor: "NO_LO_SE", etiqueta: "Todavía no lo sé" },
] as const;

/**
 * La pregunta que decide el embudo entero.
 *
 * Las opciones siguen el calendario español real: la temporada arranca en abril
 * y las preparaciones empiezan en enero. Quien compite en abril tiene delante
 * justo las doce semanas del programa y entra en la cohorte que arranca en
 * enero; quien compite en junio cabe todavía en la de febrero; quien apunta a
 * otoño no tiene nada que comprar hoy y se cultiva hasta la campaña de mayo.
 */
export const CUANDO_COMPITES = [
  { valor: "ABRIL_MAYO", etiqueta: "Entre abril y mayo" },
  { valor: "JUNIO_JULIO", etiqueta: "Entre junio y julio" },
  { valor: "OTONO", etiqueta: "En la temporada de otoño" },
  { valor: "NO_LO_SE", etiqueta: "Todavía no tengo fecha" },
  { valor: "NUNCA_HE_COMPETIDO", etiqueta: "Todavía no he competido nunca" },
] as const;

export const ESTADOS = [
  { valor: "INSCRITA", etiqueta: "Inscrita" },
  { valor: "ASISTIO", etiqueta: "Asistió en directo" },
  { valor: "REPLAY", etiqueta: "Vio el replay" },
  { valor: "COMPRO", etiqueta: "Compró" },
  { valor: "DESCARTADA", etiqueta: "Descartada" },
] as const;

export type ValorCuando = (typeof CUANDO_COMPITES)[number]["valor"];

/**
 * Los tres destinos del embudo después de la sesión.
 *
 * No son niveles de interés, son momentos de temporada. Mandarle a una el email
 * de la otra quema las dos listas, así que la separación se calcula aquí y no
 * a ojo en cada envío.
 */
export const SEGMENTOS = {
  ENERO: {
    etiqueta: "Compite en abril-mayo",
    oferta: "Camino a la Tarima · cohorte de enero",
    descripcion:
      "Tiene delante justo las doce semanas. Es la que hay que cerrar en la ventana.",
  },
  FEBRERO: {
    etiqueta: "Compite en junio-julio",
    oferta: "Camino a la Tarima · cohorte de febrero",
    descripcion:
      "Le sobran cuatro semanas: entra en la segunda cohorte sin prisa.",
  },
  FRIO: {
    etiqueta: "Sin fecha de esta temporada",
    oferta: "Fundamentos del Posing + lista de otoño",
    descripcion:
      "No tiene tarima a la vista. Se cultiva con la grabada, no se le vende el programa hoy.",
  },
} as const;

export type Segmento = keyof typeof SEGMENTOS;

/** A qué lista va cada inscrita según cuándo compite. */
export function segmentar(competeWhen: string): Segmento {
  if (competeWhen === "ABRIL_MAYO") return "ENERO";
  if (competeWhen === "JUNIO_JULIO") return "FEBRERO";
  return "FRIO";
}

// Las cohortes son del programa, no de la masterclass: viven en `programa.ts`.
// Se reexportan porque el panel de inscritas enseña a qué grupo iría cada una.
export { COHORTES, cohorteDe } from "@/lib/programa";

/** Busca la etiqueta visible de un valor guardado. Para el panel y los emails. */
export function etiquetaDe(
  lista: readonly { valor: string; etiqueta: string }[],
  valor: string | null | undefined
): string {
  if (!valor) return "—";
  return lista.find((o) => o.valor === valor)?.etiqueta ?? valor;
}

/**
 * Nombre de la cookie de un solo uso que protege la conexión con Google Calendar.
 *
 * Vive aquí y no en el route.ts porque el App Router de Next solo admite
 * manejadores (GET, POST...) como exports de una ruta.
 */
export const COOKIE_ESTADO_GOOGLE = "google_oauth_state";

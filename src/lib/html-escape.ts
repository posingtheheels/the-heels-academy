/**
 * Escapa texto que va a incrustarse en el HTML de un correo.
 *
 * Los datos que escribe un desconocido (nombre, mensaje del formulario de
 * contacto) se metían tal cual en la plantilla, así que cualquiera podía colar
 * enlaces o maquetación en la bandeja de entrada de la academia.
 */
export function escaparHtml(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

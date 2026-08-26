/**
 * Normaliza un email a la forma canónica con la que se guarda en base de datos.
 *
 * El registro y el login deben aplicar esto SIEMPRE. Sin ello, quien se apuntara
 * como "Ana@Gmail.com" no podía recuperar su contraseña (la búsqueda en Postgres
 * distingue mayúsculas) y además podían acabar creándose cuentas duplicadas.
 */
export function normalizarEmail(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().toLowerCase() : "";
}

/** Validación deliberadamente laxa: solo descarta lo que no puede ser un email. */
export function pareceEmail(valor: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
}

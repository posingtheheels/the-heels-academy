import { NextRequest } from "next/server";

/**
 * Limitador de peticiones en memoria.
 *
 * No usa Redis a propósito: para el volumen de The Heels no compensa añadir una
 * dependencia externa. La contrapartida es que el contador vive en cada instancia
 * de la función, así que un atacante muy repartido podría colarse. Aun así corta
 * el caso real que nos importa: alguien machacando un formulario público desde
 * una misma conexión para reventar la cuota de correo del dominio.
 */

type Registro = { veces: number; expira: number };

const contadores = new Map<string, Registro>();

// Evita que el Map crezca sin límite si el proceso vive mucho tiempo.
function limpiar(ahora: number) {
  if (contadores.size < 5000) return;
  // forEach en lugar de for..of: el proyecto compila a ES5 y ahí iterar un Map
  // requiere downlevelIteration.
  const caducadas: string[] = [];
  contadores.forEach((r, clave) => {
    if (r.expira <= ahora) caducadas.push(clave);
  });
  caducadas.forEach((clave) => contadores.delete(clave));
}

/** Identifica al peticionario. Vercel pone la IP real en x-forwarded-for. */
export function identificar(req: NextRequest): string {
  const reenviada = req.headers.get("x-forwarded-for");
  if (reenviada) return reenviada.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "desconocida";
}

/**
 * Devuelve true si la petición debe dejarse pasar, false si excede el límite.
 *
 * @param clave    identificador del cubo (normalmente "ruta:ip")
 * @param maximo   peticiones permitidas dentro de la ventana
 * @param ventanaMs duración de la ventana en milisegundos
 */
export function permitir(clave: string, maximo: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  limpiar(ahora);

  const actual = contadores.get(clave);

  if (!actual || actual.expira <= ahora) {
    contadores.set(clave, { veces: 1, expira: ahora + ventanaMs });
    return true;
  }

  if (actual.veces >= maximo) return false;

  actual.veces += 1;
  return true;
}

/** Atajo para las rutas: aplica el límite usando la IP del peticionario. */
export function permitirPorIp(
  req: NextRequest,
  ruta: string,
  maximo: number,
  ventanaMs: number
): boolean {
  return permitir(`${ruta}:${identificar(req)}`, maximo, ventanaMs);
}

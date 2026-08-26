import { NextRequest } from "next/server";

/**
 * Comprueba que la petición viene del cron de Vercel (o de un script con el secreto).
 *
 * Vercel manda automáticamente `Authorization: Bearer $CRON_SECRET` en los crons
 * definidos en vercel.json, siempre que la variable exista en el proyecto.
 *
 * Si CRON_SECRET no está configurada devolvemos false: sin secreto el endpoint
 * queda cerrado, nunca abierto.
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

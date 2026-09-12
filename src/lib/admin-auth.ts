import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Devuelve una respuesta 401 si quien llama no es ADMIN, o null si puede pasar.
 *
 * Uso en una ruta:
 *   const noAutorizado = await bloquearSiNoEsAdmin();
 *   if (noAutorizado) return noAutorizado;
 */
export async function bloquearSiNoEsAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return null;
}

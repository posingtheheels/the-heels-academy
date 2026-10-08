import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { bloquearSiNoEsAdmin } from "@/lib/admin-auth";
import { BUCKET_VIDEOS } from "@/lib/encuesta";
import { COHORTES, ESTADOS_SOLICITUD } from "@/lib/programa";

export const dynamic = "force-dynamic";

/**
 * Enlace temporal a un vídeo del bucket privado.
 *
 * Caduca en una hora: son vídeos de una atleta en bikini y no pueden acabar
 * siendo una URL permanente que circule por ahí.
 */
async function firmar(ruta: string | null): Promise<string | null> {
  if (!ruta) return null;
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_VIDEOS)
    .createSignedUrl(ruta, 60 * 60);
  if (error) console.error("Error firmando " + ruta + ":", error);
  return data?.signedUrl || null;
}

/** Listado con los vídeos ya firmados y las métricas del embudo de la llamada. */
export async function GET() {
  const noAutorizado = await bloquearSiNoEsAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const solicitudes = await (prisma as any).application.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    const conVideos = await Promise.all(
      solicitudes.map(async (s: any) => ({
        ...s,
        semanas: semanasHasta(s.competitionDate),
        videoUrl: await firmar(s.videoPath),
        competitionVideoUrl: await firmar(s.competitionVideoPath),
      }))
    );

    return NextResponse.json({
      solicitudes: conVideos,
      metricas: calcularMetricas(solicitudes),
    });
  } catch (error) {
    console.error("Error listando solicitudes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

const esquemaPatch = z.object({
  id: z.string().min(1),
  status: z
    .enum(ESTADOS_SOLICITUD.map((e) => e.valor) as [string, ...string[]])
    .optional(),
  cohort: z
    .enum(Object.keys(COHORTES) as [string, ...string[]])
    .nullable()
    .optional(),
  callNotes: z.string().trim().max(4000).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
});

/** Mover de estado, asignar cohorte y guardar las notas de la llamada. */
export async function PATCH(req: NextRequest) {
  const noAutorizado = await bloquearSiNoEsAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const parseado = esquemaPatch.safeParse(await req.json());
    if (!parseado.success) {
      return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
    }

    const { id, ...cambios } = parseado.data;

    const solicitud = await (prisma as any).application.update({
      where: { id },
      data: cambios,
    });

    return NextResponse.json(solicitud);
  } catch (error) {
    console.error("Error actualizando la solicitud:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/** Semanas que le quedan. El primer número que se mira al abrir una ficha. */
function semanasHasta(fecha: Date | null): number | null {
  if (!fecha) return null;
  const dias = (new Date(fecha).getTime() - Date.now()) / 86_400_000;
  return Math.max(0, Math.round(dias / 7));
}

function calcularMetricas(solicitudes: any[]) {
  const porEstado = Object.fromEntries(
    ESTADOS_SOLICITUD.map((e) => [
      e.valor,
      solicitudes.filter((s) => s.status === e.valor).length,
    ])
  );

  const llamadas = solicitudes.filter((s) =>
    ["LLAMADA", "ADMITIDA", "PAGADA"].includes(s.status)
  ).length;
  const pagadas = porEstado.PAGADA || 0;

  // Plazas que quedan por cohorte. Es el número que se dice en voz alta en la
  // campaña, así que conviene que salga de la base y no de la memoria.
  const plazas = Object.fromEntries(
    Object.keys(COHORTES).map((c) => [
      c,
      solicitudes.filter((s) => s.cohort === c && s.status === "PAGADA").length,
    ])
  );

  return {
    total: solicitudes.length,
    porEstado,
    plazas,
    sinVideo: solicitudes.filter((s) => !s.videoPath).length,
    // De las que llegan a la llamada, cuántas entran. Por debajo del 50 % el
    // problema está en la llamada, no en la captación.
    cierreLlamada: llamadas ? Math.round((pagadas / llamadas) * 100) : null,
  };
}

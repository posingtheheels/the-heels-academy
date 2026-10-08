import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { bloquearSiNoEsAdmin } from "@/lib/admin-auth";
import {
  MASTERCLASS,
  CUANDO_COMPITES,
  ESTADOS,
  segmentar,
} from "@/lib/masterclass";

export const dynamic = "force-dynamic";

/** Listado de inscritas de la edición vigente más las métricas del panel. */
export async function GET() {
  const noAutorizado = await bloquearSiNoEsAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const inscritas = await (prisma as any).lead.findMany({
      where: { edition: MASTERCLASS.edicion },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      inscritas,
      metricas: calcularMetricas(inscritas),
    });
  } catch (error) {
    console.error("Error listando inscripciones:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

const esquemaPatch = z.object({
  id: z.string().min(1),
  status: z.enum(ESTADOS.map((e) => e.valor) as [string, ...string[]]).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

/** Marcar asistencia o dejar una nota. Es todo lo que se edita a mano. */
export async function PATCH(req: NextRequest) {
  const noAutorizado = await bloquearSiNoEsAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const parseado = esquemaPatch.safeParse(await req.json());
    if (!parseado.success) {
      return NextResponse.json({ error: "Datos no válidos" }, { status: 400 });
    }

    const { id, ...cambios } = parseado.data;

    const inscrita = await (prisma as any).lead.update({
      where: { id },
      data: cambios,
    });

    return NextResponse.json(inscrita);
  } catch (error) {
    console.error("Error actualizando inscripción:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * Los números que deciden algo.
 *
 * La facturación de la semana no es el indicador: lo son el tamaño de la lista
 * segmentada por fecha de competición, la asistencia y qué canal la trajo.
 */
function calcularMetricas(inscritas: any[]) {
  const total = inscritas.length;

  const porSegmento = { ENERO: 0, FEBRERO: 0, FRIO: 0 };
  inscritas.forEach((i) => porSegmento[segmentar(i.competeWhen)]++);

  const porCuando = CUANDO_COMPITES.map((c) => ({
    etiqueta: c.etiqueta,
    veces: inscritas.filter((i) => i.competeWhen === c.valor).length,
  })).filter((c) => c.veces > 0);

  // Agrupado por utm_source: es lo que dice dónde volver a invertir el esfuerzo.
  const canales = new Map<string, number>();
  inscritas.forEach((i) => {
    const canal = i.utmSource || "directo";
    canales.set(canal, (canales.get(canal) || 0) + 1);
  });

  const asistieron = inscritas.filter((i) => i.status === "ASISTIO").length;
  const vistos = inscritas.filter((i) => i.status === "REPLAY").length;

  return {
    total,
    porSegmento,
    porCuando,
    canales: Array.from(canales.entries())
      .map(([etiqueta, veces]) => ({ etiqueta, veces }))
      .sort((a, b) => b.veces - a.veces),
    asistieron,
    vistos,
    // En directo por debajo del 35 % el problema son los recordatorios, no el
    // contenido. Se calcula aquí para no tener que hacerlo a mano cada vez.
    tasaAsistencia: total ? Math.round((asistieron / total) * 100) : null,
    compraron: inscritas.filter((i) => i.status === "COMPRO").length,
    conWhatsapp: inscritas.filter((i) => !!i.phone).length,
  };
}

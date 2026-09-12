import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bloquearSiNoEsAdmin } from "@/lib/admin-auth";
import { VALORACIONES, CANALES, MULTIPLES } from "@/lib/encuesta";

export const dynamic = "force-dynamic";

/** Listado completo de respuestas más las métricas agregadas del panel. */
export async function GET() {
  const noAutorizado = await bloquearSiNoEsAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const encuestas = await (prisma as any).survey.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      encuestas,
      metricas: calcularMetricas(encuestas),
    });
  } catch (error) {
    console.error("Error listando encuestas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

function media(valores: number[]): number | null {
  if (!valores.length) return null;
  const suma = valores.reduce((a, b) => a + b, 0);
  return Math.round((suma / valores.length) * 10) / 10;
}

function calcularMetricas(encuestas: any[]) {
  const medias: Record<string, number | null> = {};
  VALORACIONES.forEach((v) => {
    medias[v.campo] = media(
      encuestas.map((e) => e[v.campo]).filter((n: any) => typeof n === "number")
    );
  });

  const notasNps: number[] = encuestas
    .map((e) => e.nps)
    .filter((n: any) => typeof n === "number");

  // NPS clásico: % promotores (9-10) menos % detractores (0-6).
  const promotores = notasNps.filter((n) => n >= 9).length;
  const detractores = notasNps.filter((n) => n <= 6).length;
  const nps = notasNps.length
    ? Math.round(((promotores - detractores) / notasNps.length) * 100)
    : null;

  // Recuentos de las preguntas cerradas: son las que se leen de un vistazo
  // y las que de verdad deciden (donde anunciar, que lanzar primero).
  const canales = CANALES.map((c) => ({
    etiqueta: c.etiqueta,
    veces: encuestas.filter((e) => e.discovery === c.valor).length,
  })).filter((c) => c.veces > 0);

  const seleccionesMultiples = MULTIPLES.map((m) => ({
    titulo: m.titulo,
    opciones: m.opciones
      .map((o) => ({
        etiqueta: o.etiqueta,
        veces: encuestas.filter((e) => (e[m.campo] || []).indexOf(o.valor) !== -1).length,
      }))
      .filter((o) => o.veces > 0)
      .sort((a, b) => b.veces - a.veces),
  })).filter((m) => m.opciones.length > 0);

  return {
    total: encuestas.length,
    sinLeer: encuestas.filter((e) => e.status === "NUEVA").length,
    conVideo: encuestas.filter((e) => !!e.videoPath).length,
    conFotos: encuestas.filter((e) => !!e.beforePhotoPath || !!e.afterPhotoPath).length,
    publicables: encuestas.filter((e) => e.allowPublish).length,
    medias,
    nps,
    npsRespuestas: notasNps.length,
    promotores,
    detractores,
    canales,
    seleccionesMultiples,
  };
}

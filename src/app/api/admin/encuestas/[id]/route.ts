import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { bloquearSiNoEsAdmin } from "@/lib/admin-auth";
import { BUCKET_VIDEOS } from "@/lib/encuesta";

export const dynamic = "force-dynamic";

/** Una respuesta concreta, con enlace firmado al vídeo si lo hay. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const noAutorizado = await bloquearSiNoEsAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const encuesta = await (prisma as any).survey.findUnique({
      where: { id: params.id },
    });

    if (!encuesta) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    let videoUrl: string | null = null;
    if (encuesta.videoPath) {
      // El bucket es privado: el enlace caduca en una hora para que no acabe
      // circulando por ahí un vídeo personal de una alumna.
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_VIDEOS)
        .createSignedUrl(encuesta.videoPath, 60 * 60);
      if (error) console.error("Error firmando el vídeo:", error);
      videoUrl = data?.signedUrl || null;
    }

    return NextResponse.json({ ...encuesta, videoUrl });
  } catch (error) {
    console.error("Error obteniendo encuesta:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * Marca como leída o publica la respuesta como testimonio de la web.
 *
 * Publicar crea un Feedback aparte en vez de reutilizar la fila: la encuesta es
 * un dato interno con teléfono y quejas incluidas, y el testimonio es texto
 * público editable. Mezclarlos acabaría enseñando en la portada cosas que la
 * alumna escribió en privado.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const noAutorizado = await bloquearSiNoEsAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const { accion, status, message, role } = await req.json();

    const encuesta = await (prisma as any).survey.findUnique({
      where: { id: params.id },
    });
    if (!encuesta) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    if (accion === "publicar") {
      if (!encuesta.allowPublish) {
        return NextResponse.json(
          { error: "Esta alumna no ha dado permiso para publicar su respuesta." },
          { status: 400 }
        );
      }

      const texto = String(message || encuesta.oneLiner || encuesta.bestPart || "").trim();
      if (!texto) {
        return NextResponse.json(
          { error: "No hay texto que publicar. Escribe el testimonio a mano." },
          { status: 400 }
        );
      }

      const feedback = await (prisma as any).feedback.create({
        data: {
          name: encuesta.name || null,
          message: texto,
          role: role || null,
          rating: encuesta.ratingOverall || 5,
          active: true,
        },
      });

      const actualizada = await (prisma as any).survey.update({
        where: { id: params.id },
        data: { status: "PUBLICADA", publishedFeedbackId: feedback.id },
      });

      return NextResponse.json(actualizada);
    }

    if (status && !["NUEVA", "LEIDA", "PUBLICADA"].includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    const actualizada = await (prisma as any).survey.update({
      where: { id: params.id },
      data: { status: status || encuesta.status },
    });

    return NextResponse.json(actualizada);
  } catch (error) {
    console.error("Error actualizando encuesta:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const noAutorizado = await bloquearSiNoEsAdmin();
  if (noAutorizado) return noAutorizado;

  try {
    const encuesta = await (prisma as any).survey.findUnique({
      where: { id: params.id },
    });
    if (!encuesta) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    // Primero el vídeo: si se borrase sólo la fila, el archivo se quedaría
    // huérfano en el bucket sin nadie que sepa a quién pertenece.
    if (encuesta.videoPath) {
      const { error } = await supabaseAdmin.storage
        .from(BUCKET_VIDEOS)
        .remove([encuesta.videoPath]);
      if (error) console.error("Error borrando el vídeo:", error);
    }

    await (prisma as any).survey.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error borrando encuesta:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

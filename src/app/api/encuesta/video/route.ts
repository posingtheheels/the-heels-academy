import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { permitirPorIp } from "@/lib/rate-limit";
import { BUCKET_VIDEOS, MAX_VIDEO_BYTES, TIPOS_VIDEO } from "@/lib/encuesta";

export const dynamic = "force-dynamic";

const EXTENSIONES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/3gpp": "3gp",
};

/**
 * Devuelve una URL firmada para que el navegador suba el vídeo directamente a
 * Supabase Storage.
 *
 * El vídeo no pasa por el servidor a propósito: las funciones de Vercel cortan
 * el cuerpo de la petición en 4,5 MB y un vídeo de móvil de 40 segundos ya se
 * come varias veces ese límite. Firmando la subida, el archivo viaja del móvil
 * a Supabase sin escalas y el bucket puede seguir siendo privado.
 */
export async function POST(req: NextRequest) {
  try {
    if (!permitirPorIp(req, "encuesta-video", 8, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiados intentos de subida. Prueba de nuevo en un rato." },
        { status: 429 }
      );
    }

    const { contentType, size } = await req.json();

    if (!TIPOS_VIDEO.includes(String(contentType))) {
      return NextResponse.json(
        { error: "Ese formato de vídeo no me sirve. Graba con la cámara del móvil y vuelve a intentarlo." },
        { status: 400 }
      );
    }

    if (typeof size !== "number" || size <= 0 || size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: `El vídeo pesa demasiado (máximo ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB). Graba uno más corto, o baja la calidad de la cámara si la tienes en 4K.` },
        { status: 400 }
      );
    }

    const extension = EXTENSIONES[String(contentType)] || "mp4";
    // El nombre lo pone el servidor: si viniera del cliente, podría apuntar a
    // otra carpeta del bucket o pisar el vídeo de otra alumna.
    const ruta = `videos/${Date.now()}-${randomUUID()}.${extension}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_VIDEOS)
      .createSignedUploadUrl(ruta);

    if (error || !data) {
      console.error("Error firmando la subida del vídeo:", error);
      return NextResponse.json(
        { error: "No he podido preparar la subida. Inténtalo de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      path: data.path,
      token: data.token,
      bucket: BUCKET_VIDEOS,
    });
  } catch (error) {
    console.error("Error en /api/encuesta/video:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

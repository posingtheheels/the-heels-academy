import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { permitirPorIp } from "@/lib/rate-limit";
import {
  BUCKET_VIDEOS,
  MAX_VIDEO_BYTES,
  TIPOS_VIDEO,
  MAX_FOTO_BYTES,
  TIPOS_FOTO,
} from "@/lib/encuesta";

export const dynamic = "force-dynamic";

const EXTENSIONES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-matroska": "mkv",
  "video/3gpp": "3gp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

/** Reglas de cada tipo de archivo. La carpeta separa vídeos de fotos. */
const REGLAS = {
  video: {
    carpeta: "videos",
    tipos: TIPOS_VIDEO,
    maximo: MAX_VIDEO_BYTES,
    errorTipo:
      "Ese formato de vídeo no me sirve. Graba con la cámara del móvil y vuelve a intentarlo.",
    errorPeso:
      "El vídeo pesa demasiado (máximo %d MB). Graba uno más corto, o baja la calidad de la cámara si la tienes en 4K.",
  },
  foto: {
    carpeta: "fotos",
    tipos: TIPOS_FOTO,
    maximo: MAX_FOTO_BYTES,
    errorTipo:
      "Ese formato de foto no me sirve. Sube una imagen normal (JPG o PNG) desde tu galería.",
    errorPeso: "La foto pesa demasiado (máximo %d MB). Prueba con otra.",
  },
};

/**
 * Devuelve una URL firmada para que el navegador suba el archivo directamente a
 * Supabase Storage.
 *
 * El archivo no pasa por el servidor a propósito: las funciones de Vercel cortan
 * el cuerpo de la petición en 4,5 MB y un vídeo de móvil de 40 segundos ya se
 * come varias veces ese límite. Firmando la subida, el archivo viaja del móvil
 * a Supabase sin escalas y el bucket puede seguir siendo privado.
 */
export async function POST(req: NextRequest) {
  try {
    if (!permitirPorIp(req, "encuesta-subida", 20, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiados intentos de subida. Prueba de nuevo en un rato." },
        { status: 429 }
      );
    }

    const { tipo, contentType, size } = await req.json();

    const regla = REGLAS[tipo as keyof typeof REGLAS];
    if (!regla) {
      return NextResponse.json({ error: "Petición no válida" }, { status: 400 });
    }

    if (!regla.tipos.includes(String(contentType))) {
      return NextResponse.json({ error: regla.errorTipo }, { status: 400 });
    }

    if (typeof size !== "number" || size <= 0 || size > regla.maximo) {
      const mb = Math.round(regla.maximo / (1024 * 1024));
      return NextResponse.json(
        { error: regla.errorPeso.replace("%d", String(mb)) },
        { status: 400 }
      );
    }

    const extension = EXTENSIONES[String(contentType)] || "bin";
    // El nombre lo pone el servidor: si viniera del cliente, podría apuntar a
    // otra carpeta del bucket o pisar el archivo de otra alumna.
    const ruta = `${regla.carpeta}/${Date.now()}-${randomUUID()}.${extension}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_VIDEOS)
      .createSignedUploadUrl(ruta);

    if (error || !data) {
      console.error("Error firmando la subida:", error);
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
    console.error("Error en /api/encuesta/subida:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

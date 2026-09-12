import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { permitirPorIp } from "@/lib/rate-limit";
import { escaparHtml } from "@/lib/html-escape";
import { resend } from "@/lib/resend";
import {
  VALORACIONES,
  CAMPOS_TEXTO,
  ANTIGUEDADES,
  MODALIDADES,
  CANALES,
  MULTIPLES,
} from "@/lib/encuesta";

export const dynamic = "force-dynamic";

const valoracion = z.coerce.number().int().min(1).max(5).optional().nullable();
const texto = z.string().trim().max(3000).optional().nullable();

/** Lista cerrada: sólo se guardan los valores que existen en el formulario. */
const multiple = (opciones: readonly { valor: string }[]) =>
  z
    .array(z.enum(opciones.map((o) => o.valor) as [string, ...string[]]))
    .max(opciones.length)
    .optional();

const esquema = z.object({
  name: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  seniority: z.enum(ANTIGUEDADES.map((a) => a.valor) as [string, ...string[]]).optional().nullable(),
  modality: z.enum(MODALIDADES.map((m) => m.valor) as [string, ...string[]]).optional().nullable(),
  discovery: z.enum(CANALES.map((c) => c.valor) as [string, ...string[]]).optional().nullable(),
  nps: z.coerce.number().int().min(0).max(10).optional().nullable(),
  // La ruta del vídeo la firma /api/encuesta/video, así que aquí sólo aceptamos
  // el formato que genera ese endpoint y nunca una URL arbitraria.
  videoPath: z
    .string()
    .regex(/^videos\/[A-Za-z0-9._-]{1,120}$/)
    .optional()
    .nullable(),
  allowPublish: z.boolean().optional(),
  ...Object.fromEntries(VALORACIONES.map((v) => [v.campo, valoracion])),
  ...Object.fromEntries(CAMPOS_TEXTO.map((p) => [p.campo, texto])),
  ...Object.fromEntries(MULTIPLES.map((m) => [m.campo, multiple(m.opciones)])),
});

/** Convierte "" en null para no llenar la tabla de cadenas vacías. */
function limpiar(valor: unknown) {
  if (typeof valor !== "string") return valor ?? null;
  const v = valor.trim();
  return v.length ? v : null;
}

export async function POST(req: NextRequest) {
  try {
    // Formulario público sin login: sin freno cualquiera puede inundar la tabla
    // y la bandeja de la academia con respuestas falsas.
    if (!permitirPorIp(req, "encuesta", 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Ya he recibido tu respuesta. ¡Gracias! Si necesitas corregir algo, escríbeme por WhatsApp." },
        { status: 429 }
      );
    }

    const cuerpo = await req.json();
    const parseado = esquema.safeParse(cuerpo);

    if (!parseado.success) {
      return NextResponse.json(
        { error: "Hay algún dato que no he entendido. Revisa el formulario." },
        { status: 400 }
      );
    }

    const d = parseado.data as Record<string, any>;

    // Una encuesta sin ninguna valoración, ningún texto y ningún vídeo es ruido.
    const tieneContenido =
      VALORACIONES.some((v) => d[v.campo]) ||
      CAMPOS_TEXTO.some((p) => limpiar(d[p.campo])) ||
      MULTIPLES.some((m) => (d[m.campo] || []).length) ||
      d.nps !== undefined ||
      !!d.videoPath;

    if (!tieneContenido) {
      return NextResponse.json(
        { error: "Contesta al menos una pregunta antes de enviar." },
        { status: 400 }
      );
    }

    const datos: Record<string, any> = {
      name: limpiar(d.name),
      phone: limpiar(d.phone),
      seniority: d.seniority ?? null,
      modality: d.modality ?? null,
      discovery: d.discovery ?? null,
      nps: d.nps ?? null,
      videoPath: d.videoPath ?? null,
      allowPublish: d.allowPublish === true,
    };
    VALORACIONES.forEach((v) => (datos[v.campo] = d[v.campo] ?? null));
    CAMPOS_TEXTO.forEach((p) => (datos[p.campo] = limpiar(d[p.campo])));
    MULTIPLES.forEach((m) => (datos[m.campo] = d[m.campo] ?? []));

    const encuesta = await (prisma as any).survey.create({ data: datos });

    await avisarPorEmail(datos);

    return NextResponse.json({ success: true, id: encuesta.id });
  } catch (error) {
    console.error("Error guardando encuesta:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * Aviso al correo de la academia. Va después de guardar y con su propio
 * try/catch: si Resend falla, la respuesta ya está en la base de datos y sería
 * absurdo devolverle un error a la alumna.
 */
async function avisarPorEmail(datos: Record<string, any>) {
  if (!process.env.RESEND_API_KEY) return;

  const destinatario = process.env.ADMIN_EMAIL || "posingtheheels@gmail.com";
  const nombre = datos.name || "Anónima";

  const filasValoracion = VALORACIONES.filter((v) => datos[v.campo])
    .map(
      (v) =>
        `<tr><td style="padding:6px 0;color:#555;">${escaparHtml(v.titulo)}</td>` +
        `<td style="padding:6px 0;text-align:right;font-weight:600;">${datos[v.campo]}/5</td></tr>`
    )
    .join("");

  const bloquesTexto = CAMPOS_TEXTO.filter((p) => datos[p.campo])
    .map(
      (p) =>
        `<p style="margin:16px 0 4px;font-weight:600;color:#333;">${escaparHtml(p.titulo)}</p>` +
        `<div style="background:#fdf2f4;padding:12px;border-radius:8px;color:#555;white-space:pre-wrap;">${escaparHtml(datos[p.campo])}</div>`
    )
    .join("");

  try {
    await resend.emails.send({
      from: "Encuestas The Heels <soporte@posingtheheels.com>",
      to: destinatario,
      subject: `⭐ Nueva encuesta de ${escaparHtml(nombre)}${datos.videoPath ? " (con vídeo)" : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:620px;margin:0 auto;padding:24px;border:1px solid #f0f0f0;border-radius:12px;">
          <h2 style="color:#333;border-bottom:2px solid #ffccd5;padding-bottom:10px;">Nueva respuesta al cuestionario</h2>
          <p style="margin:12px 0;color:#555;">
            <strong>${escaparHtml(nombre)}</strong>
            ${datos.phone ? ` · ${escaparHtml(datos.phone)}` : ""}
            ${datos.nps !== null ? ` · Recomendación: <strong>${datos.nps}/10</strong>` : ""}
          </p>
          ${filasValoracion ? `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${filasValoracion}</table>` : ""}
          ${bloquesTexto}
          ${datos.videoPath ? `<p style="margin:20px 0 0;color:#B8436F;font-weight:600;">🎥 Ha grabado un vídeo. Míralo en el panel de admin.</p>` : ""}
          <p style="margin:8px 0 0;font-size:13px;color:#777;">
            Permiso para publicarlo: <strong>${datos.allowPublish ? "SÍ" : "no"}</strong>
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="font-size:12px;color:#999;">Panel completo en /admin/encuestas</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("No se pudo avisar de la encuesta por email:", error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { permitirPorIp } from "@/lib/rate-limit";
import { escaparHtml } from "@/lib/html-escape";
import { normalizarEmail, pareceEmail } from "@/lib/email-normalize";
import { resend } from "@/lib/resend";
import { FEDERACIONES, CATEGORIAS } from "@/lib/masterclass";
import {
  PROGRAMA,
  MODALIDADES,
  EXPERIENCIA_TACON,
  FRANJAS,
  CARPETA_SOLICITUDES,
  etiquetaDe,
} from "@/lib/programa";

export const dynamic = "force-dynamic";

const opcionDe = (lista: readonly { valor: string }[]) =>
  z.enum(lista.map((o) => o.valor) as [string, ...string[]]);

/** Un `<select>` sin elegir manda "", que no está en la lista cerrada. */
const opcionOpcionalDe = (lista: readonly { valor: string }[]) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    opcionDe(lista).nullable()
  );

const texto = (max: number) => z.string().trim().max(max).optional().nullable();

/**
 * Sólo acepta rutas con la forma exacta que genera el endpoint de subida: sin
 * esto, un `../` en el campo apuntaría a otra carpeta del bucket.
 *
 * El "" va delante porque el segundo vídeo es opcional y el formulario manda
 * cadena vacía cuando no se sube: sin convertirlo a null, la regex lo rechaza
 * y la ficha entera se cae por no haber adjuntado algo que no era obligatorio.
 */
const rutaDeVideo = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z
    .string()
    .regex(new RegExp("^" + CARPETA_SOLICITUDES + "/[A-Za-z0-9._-]{1,120}$"))
    .nullable()
);

const esquema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(160),
  phone: z.string().trim().min(6).max(40),
  // Un campo numérico vacío manda "", y `coerce` lo convierte en 0, que no pasa
  // el mínimo. Hay que anularlo antes de intentar leerlo como número.
  age: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.coerce.number().int().min(14).max(80).nullable()
  ),
  federation: opcionOpcionalDe(FEDERACIONES),
  category: opcionOpcionalDe(CATEGORIAS),
  modality: opcionOpcionalDe(MODALIDADES),
  // Fecha en ISO corta desde un <input type="date">. Sin ella no se puede
  // asignar cohorte ni ordenar el temario, que es de lo que va la llamada.
  competitionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  competitionVenue: texto(160),
  previousCompetitions: texto(2000),
  preparedBy: texto(160),
  injuries: texto(2000),
  heelExperience: opcionOpcionalDe(EXPERIENCIA_TACON),
  availability: z
    .array(opcionDe(FRANJAS))
    .max(FRANJAS.length)
    .optional(),
  biggestFear: texto(2000),
  seasonGoal: texto(2000),
  videoPath: rutaDeVideo,
  competitionVideoPath: rutaDeVideo,
  utmSource: texto(80),
  utmCampaign: texto(80),
});

function limpiar(valor: unknown) {
  if (typeof valor !== "string") return valor ?? null;
  const v = valor.trim();
  return v.length ? v : null;
}

/** Semanas que le quedan. Es el primer número que se mira al abrir la ficha. */
function semanasHasta(fecha: Date | null): number | null {
  if (!fecha) return null;
  const dias = (fecha.getTime() - Date.now()) / 86_400_000;
  return Math.max(0, Math.round(dias / 7));
}

export async function POST(req: NextRequest) {
  try {
    // Formulario público que además dispara dos correos. Más laxo que el de la
    // masterclass porque rellenarlo cuesta diez minutos: quien llega aquí no
    // está jugando, pero el freno sigue cortando el abuso automatizado.
    if (!permitirPorIp(req, "solicitud", 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        {
          error:
            "Ya he recibido tu solicitud. Si necesitas cambiar algo, escríbeme por WhatsApp.",
        },
        { status: 429 }
      );
    }

    const parseado = esquema.safeParse(await req.json());

    if (!parseado.success) {
      return NextResponse.json(
        { error: "Revisa el formulario: hay algún dato que no he entendido." },
        { status: 400 }
      );
    }

    const d = parseado.data as Record<string, any>;
    const email = normalizarEmail(d.email);

    if (!pareceEmail(email)) {
      return NextResponse.json(
        { error: "Ese email no parece válido. Revísalo, es por donde te contesto." },
        { status: 400 }
      );
    }

    // Mediodía UTC para que el cambio de huso no mueva la fecha un día atrás.
    const competitionDate = d.competitionDate
      ? new Date(`${d.competitionDate}T12:00:00Z`)
      : null;

    const datos = {
      name: d.name.trim(),
      email,
      phone: d.phone.trim(),
      age: d.age ?? null,
      federation: d.federation ?? null,
      category: d.category ?? null,
      modality: d.modality ?? "NO_LO_SE",
      competitionDate,
      competitionVenue: limpiar(d.competitionVenue),
      previousCompetitions: limpiar(d.previousCompetitions),
      preparedBy: limpiar(d.preparedBy),
      injuries: limpiar(d.injuries),
      heelExperience: d.heelExperience ?? null,
      availability: d.availability ?? [],
      biggestFear: limpiar(d.biggestFear),
      seasonGoal: limpiar(d.seasonGoal),
      videoPath: d.videoPath ?? null,
      competitionVideoPath: d.competitionVideoPath ?? null,
      utmSource: limpiar(d.utmSource),
      utmCampaign: limpiar(d.utmCampaign),
    };

    const solicitud = await (prisma as any).application.create({ data: datos });

    // Los dos correos van después de guardar y con su propio try/catch: si
    // Resend falla, la solicitud ya está a salvo y sería absurdo devolver error
    // a quien acaba de dedicarle diez minutos.
    await confirmarALaAtleta(datos);
    await avisarALaAcademia(datos);

    return NextResponse.json({ success: true, id: solicitud.id });
  } catch (error) {
    console.error("Error guardando la solicitud:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

async function confirmarALaAtleta(datos: Record<string, any>) {
  if (!process.env.RESEND_API_KEY) return;

  const nombre = escaparHtml(datos.name.split(" ")[0]);

  try {
    await resend.emails.send({
      from: "The Heels <soporte@posingtheheels.com>",
      to: datos.email,
      subject: `Tengo tu solicitud — ${PROGRAMA.nombre}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #f0f0f0;border-radius:12px;">
          <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#999;margin:0;">Posing · The Heels</p>
          <h1 style="font-size:26px;color:#2D2D2D;margin:8px 0 20px;">${escaparHtml(PROGRAMA.nombre)}</h1>

          <p style="color:#4A4A4A;line-height:1.6;">${nombre}, ya tengo tu ficha.</p>

          <p style="color:#4A4A4A;line-height:1.6;">
            Ahora me veo tu vídeo con calma y te escribo para cuadrar la llamada
            de quince minutos. En esa llamada te digo tres cosas concretas que veo
            en tu posing, te sitúo en el grupo de tu nivel y decides. Sin
            compromiso: si no te encaja, te lo digo yo misma.
          </p>

          <div style="background:#FFF5F7;border-radius:10px;padding:16px;margin:24px 0;">
            <p style="margin:0;color:#4A4A4A;font-size:14px;line-height:1.6;">
              Las plazas se reservan por <strong>orden de pago</strong>, no de
              solicitud. Son ${PROGRAMA.plazasPorGrupo} por grupo porque más no
              caben en una clase donde tengo que verte posar a ti.
            </p>
          </div>

          <p style="color:#4A4A4A;line-height:1.6;">
            Si mientras tanto te surge cualquier duda, respóndeme a este correo.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />
          <p style="font-size:12px;color:#999;line-height:1.5;">
            Este programa cubre exclusivamente posing y presentación escénica. No
            incluye pautas de entrenamiento, dieta ni suplementación, ni sustituye
            a tu preparador.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("No se pudo confirmar la solicitud por email:", error);
  }
}

async function avisarALaAcademia(datos: Record<string, any>) {
  if (!process.env.RESEND_API_KEY) return;

  const destinatario = process.env.ADMIN_EMAIL || "posingtheheels@gmail.com";
  const semanas = semanasHasta(datos.competitionDate);

  const fila = (titulo: string, valor: string) =>
    `<tr><td style="padding:5px 0;color:#777;">${titulo}</td>` +
    `<td style="padding:5px 0;text-align:right;font-weight:600;color:#333;">${escaparHtml(valor)}</td></tr>`;

  const fecha = datos.competitionDate
    ? datos.competitionDate.toLocaleDateString("es-ES")
    : "sin fecha";

  try {
    await resend.emails.send({
      from: "Solicitudes The Heels <soporte@posingtheheels.com>",
      to: destinatario,
      replyTo: datos.email,
      subject:
        `🎯 Solicitud de ${escaparHtml(datos.name)}` +
        (semanas !== null ? ` · a ${semanas} semanas de su tarima` : ""),
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #f0f0f0;border-radius:12px;">
          <h2 style="color:#333;border-bottom:2px solid #ffccd5;padding-bottom:10px;">Nueva solicitud del programa</h2>
          <p style="margin:12px 0;color:#555;">
            <strong>${escaparHtml(datos.name)}</strong> · ${escaparHtml(datos.email)} · ${escaparHtml(datos.phone)}
          </p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${fila("Modalidad", etiquetaDe(MODALIDADES, datos.modality))}
            ${fila("Categoría", etiquetaDe(CATEGORIAS, datos.category))}
            ${fila("Federación", etiquetaDe(FEDERACIONES, datos.federation))}
            ${fila("Competición", `${fecha}${datos.competitionVenue ? " · " + datos.competitionVenue : ""}`)}
            ${semanas !== null ? fila("Semanas que faltan", String(semanas)) : ""}
            ${fila("Experiencia en tacón", etiquetaDe(EXPERIENCIA_TACON, datos.heelExperience))}
            ${datos.preparedBy ? fila("La prepara", datos.preparedBy) : ""}
            ${fila("Disponibilidad", (datos.availability || []).map((f: string) => etiquetaDe(FRANJAS, f)).join(", ") || "—")}
          </table>

          ${bloque("Competiciones anteriores", datos.previousCompetitions)}
          ${bloque("Lesiones o limitaciones", datos.injuries)}
          ${bloque("Qué le da más miedo de la tarima", datos.biggestFear)}
          ${bloque("Objetivo de esta temporada", datos.seasonGoal)}

          <p style="margin:24px 0 0;color:${datos.videoPath ? "#B8436F" : "#999"};font-weight:600;">
            ${datos.videoPath ? "🎥 Ha subido su vídeo de posing." : "Sin vídeo de posing."}
            ${datos.competitionVideoPath ? " Y el de su última competición." : ""}
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="font-size:12px;color:#999;">Ficha completa en /admin/solicitudes</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("No se pudo avisar de la solicitud por email:", error);
  }
}

function bloque(titulo: string, valor: string | null): string {
  if (!valor) return "";
  return (
    `<p style="margin:16px 0 4px;font-weight:600;color:#333;">${escaparHtml(titulo)}</p>` +
    `<div style="background:#fdf2f4;padding:12px;border-radius:8px;color:#555;white-space:pre-wrap;">${escaparHtml(valor)}</div>`
  );
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { permitirPorIp } from "@/lib/rate-limit";
import { escaparHtml } from "@/lib/html-escape";
import { normalizarEmail, pareceEmail } from "@/lib/email-normalize";
import { resend } from "@/lib/resend";
import {
  MASTERCLASS,
  FEDERACIONES,
  CATEGORIAS,
  CUANDO_COMPITES,
  SEGMENTOS,
  etiquetaDe,
  segmentar,
} from "@/lib/masterclass";

export const dynamic = "force-dynamic";

/** Lista cerrada: sólo entra en la tabla lo que existe en el formulario. */
const opcionDe = (lista: readonly { valor: string }[]) =>
  z.enum(lista.map((o) => o.valor) as [string, ...string[]]);

/**
 * Igual que la anterior pero para los desplegables que se pueden dejar sin
 * elegir. Un `<select>` vacío manda "", que no está en la lista: sin convertirlo
 * antes, el formulario entero se rechazaba por no haber elegido federación.
 */
const opcionOpcionalDe = (lista: readonly { valor: string }[]) =>
  z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    opcionDe(lista).nullable()
  );

const esquema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(160),
  phone: z.string().trim().max(40).optional().nullable(),
  federation: opcionOpcionalDe(FEDERACIONES),
  category: opcionOpcionalDe(CATEGORIAS),
  competeWhen: opcionDe(CUANDO_COMPITES),
  hasCompeted: z.boolean().optional(),
  // Obligatorio por RGPD: sin esto no se le puede escribir, y escribirle es todo
  // el sentido de la inscripción.
  consentMarketing: z.literal(true),
  consentRecording: z.boolean().optional(),
  utmSource: z.string().trim().max(80).optional().nullable(),
  utmMedium: z.string().trim().max(80).optional().nullable(),
  utmCampaign: z.string().trim().max(80).optional().nullable(),
});

/** Convierte "" en null para no llenar la tabla de cadenas vacías. */
function limpiar(valor: unknown) {
  if (typeof valor !== "string") return valor ?? null;
  const v = valor.trim();
  return v.length ? v : null;
}

export async function POST(req: NextRequest) {
  try {
    // Formulario público sin login que además dispara un correo: sin freno es un
    // buzón de spam y se come la cuota de envío del dominio.
    if (!permitirPorIp(req, "masterclass", 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        {
          error:
            "Ya tengo tu inscripción. Si necesitas cambiar algún dato, escríbeme por WhatsApp.",
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

    const d = parseado.data;
    const email = normalizarEmail(d.email);

    if (!pareceEmail(email)) {
      return NextResponse.json(
        { error: "Ese email no parece válido. Revísalo, es donde te mando el enlace." },
        { status: 400 }
      );
    }

    const datos = {
      name: d.name.trim(),
      email,
      phone: limpiar(d.phone),
      federation: d.federation ?? null,
      category: d.category ?? null,
      competeWhen: d.competeWhen,
      hasCompeted: d.hasCompeted === true,
      consentMarketing: true,
      consentRecording: d.consentRecording === true,
      utmSource: limpiar(d.utmSource),
      utmMedium: limpiar(d.utmMedium),
      utmCampaign: limpiar(d.utmCampaign),
    };

    // Reinscribirse con el mismo correo corrige los datos en lugar de duplicar la
    // fila. Pasa más de lo que parece: se apuntan desde el móvil, se equivocan de
    // categoría y vuelven a enviar.
    const lead = await (prisma as any).lead.upsert({
      where: {
        email_edition: { email, edition: MASTERCLASS.edicion },
      },
      update: datos,
      create: { ...datos, edition: MASTERCLASS.edicion },
    });

    // Los dos envíos van después de guardar y con su propio try/catch: si Resend
    // falla, la inscripción ya está en la base de datos y sería absurdo
    // devolverle un error a quien acaba de apuntarse.
    await confirmarALaAtleta(datos);
    await avisarALaAcademia(datos);

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    console.error("Error guardando inscripción a la masterclass:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/** Confirmación a la inscrita. Es el email que decide si se acuerda el día 12. */
async function confirmarALaAtleta(datos: Record<string, any>) {
  if (!process.env.RESEND_API_KEY) return;

  const nombre = escaparHtml(datos.name.split(" ")[0]);

  try {
    await resend.emails.send({
      from: "The Heels <soporte@posingtheheels.com>",
      to: datos.email,
      subject: `Estás dentro — ${MASTERCLASS.fechaTexto} a las ${MASTERCLASS.hora}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #f0f0f0;border-radius:12px;">
          <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#999;margin:0;">Posing · The Heels</p>
          <h1 style="font-size:26px;color:#2D2D2D;margin:8px 0 4px;">${escaparHtml(MASTERCLASS.titulo)}</h1>
          <p style="color:#6B6B6B;margin:0 0 24px;font-style:italic;">${escaparHtml(MASTERCLASS.subtitulo)}</p>

          <p style="color:#4A4A4A;line-height:1.6;">${nombre}, tienes tu plaza guardada.</p>

          <div style="background:#FFF5F7;border-radius:10px;padding:16px;margin:20px 0;">
            <p style="margin:0 0 6px;color:#2D2D2D;"><strong>${escaparHtml(MASTERCLASS.fechaTexto)}</strong> a las <strong>${escaparHtml(MASTERCLASS.hora)}</strong> (${escaparHtml(MASTERCLASS.zona)})</p>
            <p style="margin:0;color:#6B6B6B;font-size:14px;">Online · ${escaparHtml(MASTERCLASS.duracion)}</p>
          </div>

          <p style="color:#4A4A4A;line-height:1.6;">
            Te mando el enlace de la sala el mismo día por email y por WhatsApp.
            Mientras tanto, apúntatelo en el calendario: el recordatorio de última
            hora es el que más gente se pierde.
          </p>

          <p style="color:#2D2D2D;font-weight:600;margin:24px 0 8px;">Ven preparada</p>
          <ul style="color:#4A4A4A;line-height:1.7;padding-left:18px;margin:0;">
            <li>Tacones de competición, o unos de altura parecida.</li>
            <li>Ropa que deje ver la línea del cuerpo.</li>
            <li>Un hueco despejado de unos 2 × 1,5 m.</li>
            <li>El móvil o el portátil a unos 2,5 m, a la altura del ombligo.</li>
          </ul>

          <p style="color:#4A4A4A;line-height:1.6;margin-top:20px;">
            Las ${MASTERCLASS.plazasCamara} primeras en encender la cámara entran en la ronda de
            corrección en directo. Si no puedes a esa hora, no pasa nada: tendrás el
            replay ${escaparHtml(MASTERCLASS.replayTexto)}.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />
          <p style="font-size:12px;color:#999;line-height:1.5;">
            Recibes este correo porque te has inscrito en la masterclass de The Heels.
            Si no has sido tú, responde a este email y te saco de la lista.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("No se pudo confirmar la inscripción por email:", error);
  }
}

/** Aviso a la academia, con el segmento ya calculado para no tener que mirarlo. */
async function avisarALaAcademia(datos: Record<string, any>) {
  if (!process.env.RESEND_API_KEY) return;

  const destinatario = process.env.ADMIN_EMAIL || "posingtheheels@gmail.com";
  const segmento = SEGMENTOS[segmentar(datos.competeWhen)];

  const fila = (titulo: string, valor: string) =>
    `<tr><td style="padding:5px 0;color:#777;">${titulo}</td>` +
    `<td style="padding:5px 0;text-align:right;font-weight:600;color:#333;">${escaparHtml(valor)}</td></tr>`;

  try {
    await resend.emails.send({
      from: "Masterclass The Heels <soporte@posingtheheels.com>",
      to: destinatario,
      replyTo: datos.email,
      subject: `👠 Inscripción de ${escaparHtml(datos.name)} · ${segmento.etiqueta}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #f0f0f0;border-radius:12px;">
          <h2 style="color:#333;border-bottom:2px solid #ffccd5;padding-bottom:10px;">Nueva inscripción a la masterclass</h2>
          <p style="margin:12px 0;color:#555;">
            <strong>${escaparHtml(datos.name)}</strong> · ${escaparHtml(datos.email)}
            ${datos.phone ? ` · ${escaparHtml(datos.phone)}` : ""}
          </p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${fila("Federación", etiquetaDe(FEDERACIONES, datos.federation))}
            ${fila("Categoría", etiquetaDe(CATEGORIAS, datos.category))}
            ${fila("Cuándo compite", etiquetaDe(CUANDO_COMPITES, datos.competeWhen))}
            ${fila("Ha competido antes", datos.hasCompeted ? "Sí" : "No")}
            ${datos.utmSource ? fila("Canal", `${datos.utmSource}${datos.utmCampaign ? " / " + datos.utmCampaign : ""}`) : ""}
          </table>
          <div style="background:#FFF5F7;border-radius:10px;padding:14px;">
            <p style="margin:0 0 4px;color:#B8436F;font-weight:600;">${escaparHtml(segmento.etiqueta)} → ${escaparHtml(segmento.oferta)}</p>
            <p style="margin:0;color:#777;font-size:13px;">${escaparHtml(segmento.descripcion)}</p>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="font-size:12px;color:#999;">Lista completa en /admin/masterclass</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("No se pudo avisar de la inscripción por email:", error);
  }
}

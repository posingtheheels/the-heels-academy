import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { permitirPorIp } from "@/lib/rate-limit";
import { normalizarEmail, pareceEmail } from "@/lib/email-normalize";
import {
  MASTERCLASS,
  DESCARGABLES,
  OFERTA,
  estadoDeLaEdicion,
} from "@/lib/masterclass";

export const dynamic = "force-dynamic";

const esquema = z.object({ email: z.string().trim().max(160) });

/**
 * Abre el replay a quien se inscribió.
 *
 * No es un muro de seguridad y no pretende serlo: el vídeo es material de
 * captación, no producto de pago. Lo que hace es que la URL no viaje en el HTML
 * antes de pedir el correo, y sobre todo que quede registrado quién lo ve, que
 * es el dato que separa a las que hay que volver a tocar de las que no.
 */
export async function POST(req: NextRequest) {
  try {
    // Un formulario que acepta correos a ciegas se puede usar para comprobar
    // quién está en la lista. Con el freno, tantear deja de salir a cuenta.
    if (!permitirPorIp(req, "replay", 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Prueba dentro de un rato." },
        { status: 429 }
      );
    }

    const parseado = esquema.safeParse(await req.json());
    if (!parseado.success) {
      return NextResponse.json({ error: "Falta el email." }, { status: 400 });
    }

    const email = normalizarEmail(parseado.data.email);
    if (!pareceEmail(email)) {
      return NextResponse.json(
        { error: "Ese email no parece válido." },
        { status: 400 }
      );
    }

    const estado = estadoDeLaEdicion();

    if (estado === "ANTES") {
      return NextResponse.json(
        {
          error: `Todavía no se ha dado. La sesión es el ${MASTERCLASS.fechaTexto} a las ${MASTERCLASS.hora}, y el replay se abre aquí mismo al terminar.`,
        },
        { status: 409 }
      );
    }

    if (estado === "CERRADO") {
      return NextResponse.json(
        {
          error:
            "El replay ya se ha cerrado. Apúntate a la lista y te aviso de la siguiente sesión.",
          cerrado: true,
        },
        { status: 410 }
      );
    }

    const lead = await (prisma as any).lead.findUnique({
      where: { email_edition: { email, edition: MASTERCLASS.edicion } },
    });

    if (!lead) {
      return NextResponse.json(
        {
          error:
            "No encuentro ese email en la lista. Revisa que sea el mismo con el que te apuntaste.",
          noInscrita: true,
        },
        { status: 404 }
      );
    }

    // Sólo se sube de INSCRITA a REPLAY. Quien vino en directo o ya compró no
    // pierde su estado por volver a ver el vídeo.
    if (lead.status === "INSCRITA") {
      await (prisma as any).lead.update({
        where: { id: lead.id },
        data: { status: "REPLAY" },
      });
    }

    const urlOferta = process.env.MASTERCLASS_OFERTA_URL || null;

    return NextResponse.json({
      nombre: lead.name.split(" ")[0],
      videoUrl: process.env.MASTERCLASS_REPLAY_URL || null,
      descargables: DESCARGABLES.map((d) => ({
        nombre: d.nombre,
        url: `/masterclass/${d.archivo}`,
      })),
      // Sin enlace de compra configurado no se enseña el bloque: mejor nada que
      // un botón que no lleva a ninguna parte.
      oferta: urlOferta ? { ...OFERTA, url: urlOferta } : null,
      cierraEn: MASTERCLASS.replayCierraEn,
    });
  } catch (error) {
    console.error("Error abriendo el replay:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

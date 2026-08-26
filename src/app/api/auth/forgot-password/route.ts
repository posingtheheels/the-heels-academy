import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import crypto from "crypto";
import { normalizarEmail } from "@/lib/email-normalize";
import { permitirPorIp } from "@/lib/rate-limit";

// Respuesta identica pase lo que pase: si variara segun el email exista o no,
// cualquiera podria averiguar desde fuera quien tiene cuenta en la academia.
const RESPUESTA_GENERICA = {
  message: "Si el email está registrado, recibirás un enlace de recuperación pronto.",
};

export async function POST(req: NextRequest) {
  try {
    if (!permitirPorIp(req, "forgot-password", 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    const email = normalizarEmail((await req.json()).email);

    if (!email) {
      return NextResponse.json({ error: "Email es obligatorio" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // No se revela que la cuenta no existe; tampoco se envía nada.
      return NextResponse.json(RESPUESTA_GENERICA);
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Save token using a more defensive approach
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: expires,
        },
      });
    } catch (err) {
      console.warn("Prisma update failed, attempting raw update:", err);
      // Fallback for when Prisma Client is out of sync but DB is updated
      await prisma.$executeRawUnsafe(
        'UPDATE "User" SET "resetToken" = $1, "resetTokenExpires" = $2::timestamp WHERE "id" = $3',
        token,
        expires.toISOString(),
        user.id
      );
    }

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    try {
      const { data, error } = await resend.emails.send({
        from: "The Heels <soporte@posingtheheels.com>",
        to: email,
        subject: "🔒 Restablecer tu contraseña - The Heels",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; color: #333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #BA9D81; font-style: italic;">The Heels</h1>
            </div>
            <h2 style="color: #333; text-align: center;">Recupera tu acceso</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" style="background-color: #BA9D81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">Restablecer mi contraseña</a>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #666;">
              Este enlace es válido por 1 hora. Si no has solicitado este cambio, por favor ignora este email.
            </p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
            <p style="font-size: 11px; color: #999; text-align: center;">
              Enviado desde The Heels Academy - Tu espacio de confianza.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend delivery failed:", error);
      }
    } catch (emailErr: any) {
      // Un fallo de envío se registra, pero la respuesta no cambia: si devolviera
      // un 500 solo para los emails existentes, seguiria delatandolos.
      console.error("Error in email sending process:", emailErr);
    }

    return NextResponse.json(RESPUESTA_GENERICA);
  } catch (error: any) {
    console.error("Forgot password error:", error.message || error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizarEmail, pareceEmail } from "@/lib/email-normalize";
import { permitirPorIp } from "@/lib/rate-limit";
import { escaparHtml } from "@/lib/html-escape";

export async function POST(req: NextRequest) {
  try {
    // Registrarse manda dos correos, así que es un buen sitio para hacer spam.
    if (!permitirPorIp(req, "register", 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiados intentos de registro. Inténtalo de nuevo más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, phone, password, category, federation } = body;
    const email = normalizarEmail(body.email);

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (!pareceEmail(email)) {
      return NextResponse.json(
        { error: "Ese email no parece válido" },
        { status: 400 }
      );
    }

    // El mismo mínimo que exige el formulario de recuperar contraseña.
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: "USER",
        category: category || null,
        federation: federation || null,
      },
    });

    try {
      const { resend } = await import("@/lib/resend");
      await Promise.allSettled([
        resend.emails.send({
          from: "The Heels Academy <notificaciones@posingtheheels.com>",
          to: "posingtheheels@gmail.com",
          subject: `👤 Nueva alumna registrada: ${escaparHtml(user.name)}`,
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #ed8796; text-align: center;">¡Nueva Alumna Registrada!</h1>
              <p>Se ha creado una cuenta nueva en The Heels App:</p>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="margin:0;"><strong>Nombre:</strong> ${escaparHtml(user.name)}</p>
                <p style="margin:5px 0 0 0;"><strong>Email:</strong> ${escaparHtml(user.email)}</p>
                <p style="margin:5px 0 0 0;"><strong>Teléfono:</strong> ${escaparHtml(user.phone || 'No indica')}</p>
                <p style="margin:5px 0 0 0;"><strong>Categoría:</strong> ${escaparHtml(user.category || 'No indica')}</p>
              </div>
              <p style="text-align: center; margin-top:30px;">
                <a href="https://posingtheheels.com/admin/alumnos" style="background-color: #333; color: white; padding: 12px 25px; border-radius: 20px; font-weight:bold; text-decoration: none;">Ver Alumnas matriculadas</a>
              </p>
            </div>
          `,
        }),
        resend.emails.send({
          from: "The Heels Academy <soporte@posingtheheels.com>",
          to: user.email,
          subject: `¡Bienvenida a The Heels Academy! 👠`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 10px; color: #333;">
              <h1 style="color: #BA9D81; text-align: center; font-style: italic;">The Heels Posing Academy</h1>
              <h2 style="text-align: center;">¡Bienvenida, ${escaparHtml(user.name)}!</h2>
              <p style="text-align: center;">Felicidades, has dado el primer paso hacia tu mejor versión en tarima.</p>
              <div style="background-color: #fdf2f4; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #ffccd5;">
                <p>En tu panel de alumna ya puedes:</p>
                <ul style="line-height: 1.8;">
                  <li>Comprar tu <strong>primer bono</strong> y ver tus sesiones disponibles.</li>
                  <li>Explorar huecos y <strong>agendar tus clases</strong> de posing.</li>
                  <li>Acceder gratis a la sección <strong>Blog Pro</strong> para leer nuestros artículos técnicos.</li>
                </ul>
              </div>
              <p style="text-align: center; margin-top:30px;">
                <a href="https://posingtheheels.com/dashboard" style="background-color: #BA9D81; color: white; padding: 12px 25px; border-radius: 10px; font-weight:bold; text-decoration: none;">Entrar a Mi Panel</a>
              </p>
            </div>
          `,
        })
      ]);
    } catch (e) {
      console.error("Error enviando email registro", e);
    }

    return NextResponse.json(
      {
        message: "Cuenta creada correctamente",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

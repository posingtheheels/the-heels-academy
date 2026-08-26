import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTokensFromCode } from "@/lib/google-calendar";
import { COOKIE_ESTADO_GOOGLE } from "@/lib/google-oauth-state";

export async function GET(req: NextRequest) {
  // Esta ruta guarda el refresh token del calendario de la academia. Antes
  // aceptaba cualquier "code" de cualquiera, así que un desconocido podía
  // sustituir el token por el suyo. Ahora exige dos cosas: sesión de ADMIN y
  // que el "state" coincida con el que se emitió al empezar la conexión.
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const estadoRecibido = searchParams.get("state");
  const estadoEsperado = req.cookies.get(COOKIE_ESTADO_GOOGLE)?.value;

  if (!code) {
    return NextResponse.json({ error: "Falta el código de autorización" }, { status: 400 });
  }

  if (!estadoEsperado || !estadoRecibido || estadoRecibido !== estadoEsperado) {
    return NextResponse.json(
      { error: "La conexión con Google no se inició desde aquí. Vuelve a intentarlo desde el panel." },
      { status: 400 }
    );
  }

  try {
    const tokens = await getTokensFromCode(code);

    // Auto-save the token to the database using an AdminTask with a special title
    // This avoids having to manually update Vercel environment variables
    const { prisma } = await import("@/lib/prisma");
    if (tokens.refresh_token) {
      const configTitle = "SYSTEM_CONFIG_GOOGLE_REFRESH_TOKEN";
      await prisma.adminTask.upsert({
        where: { id: "google-calendar-config" }, // Fixed ID for the config task
        update: {
          title: configTitle,
          description: tokens.refresh_token,
          completed: true,
          date: new Date()
        },
        create: {
          id: "google-calendar-config",
          title: configTitle,
          description: tokens.refresh_token,
          completed: true,
          date: new Date()
        }
      });
    }

    const html = `
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fdf2f4; color: #333;">
          <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 600px; width: 100%;">
            <h1 style="color: #ed8796; margin-bottom: 20px;">✓ Conexión con Google Exitosa</h1>
            <p>¡Fantástico! Tu cuenta de Google se ha vinculado correctamente.</p>
            <p><b>He guardado el token automáticamente en la base de datos</b>, así que no necesitas configurar nada más.</p>
            <div style="background: #fdf2f4; padding: 15px; border-radius: 10px; word-break: break-all; font-family: monospace; margin: 20px 0; border: 1px solid #ed8796;">
              Refresco automático activado ✓
            </div>
            <p style="font-size: 13px; color: #666;">Ya puedes cerrar esta ventana y volver a tu panel de administración.</p>
            <a href="/admin/calendario" style="display: inline-block; background: #ed8796; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; margin-top: 20px;">Volver al Panel Admin</a>
          </div>
        </body>
      </html>
    `;

    const respuesta = new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });

    // El state es de un solo uso.
    respuesta.cookies.delete(COOKIE_ESTADO_GOOGLE);

    return respuesta;
  } catch (error: any) {
    console.error("Token Exchange Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

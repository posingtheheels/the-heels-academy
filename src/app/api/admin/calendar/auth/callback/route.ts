import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Falta el código de autorización" }, { status: 400 });
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

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: any) {
    console.error("Token Exchange Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

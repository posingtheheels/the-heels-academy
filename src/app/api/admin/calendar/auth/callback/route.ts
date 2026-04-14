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
    
    // We display the tokens so the admin can copy the refresh token to environment variables
    // In a more automated system we would save this to DB
    const html = `
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fdf2f4; color: #333;">
          <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 600px; width: 100%;">
            <h1 style="color: #ed8796; margin-bottom: 20px;">✓ Conexión con Google Exitosa</h1>
            <p>Copia este <b>Refresh Token</b> y añádelo a tus variables de entorno en Vercel como <code>GOOGLE_REFRESH_TOKEN</code>:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; word-break: break-all; font-family: monospace; margin: 20px 0; border: 1px solid #ddd;">
              ${tokens.refresh_token}
            </div>
            <p style="font-size: 13px; color: #666;">Este token es secreto. No lo compartas con nadie. Una vez lo guardes, el calendario empezará a sincronizarse solo.</p>
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

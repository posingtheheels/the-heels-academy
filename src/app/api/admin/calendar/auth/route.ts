import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getGoogleAuthUrl } from "@/lib/google-calendar";
import crypto from "crypto";
import { COOKIE_ESTADO_GOOGLE } from "@/lib/google-oauth-state";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Valor de un solo uso que viaja a Google y vuelve en el callback.
    const estado = crypto.randomBytes(32).toString("hex");

    const respuesta = NextResponse.redirect(getGoogleAuthUrl(estado));

    respuesta.cookies.set(COOKIE_ESTADO_GOOGLE, estado, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // 'lax' para que sobreviva a la vuelta desde Google
      path: "/api/admin/calendar/auth",
      maxAge: 10 * 60, // 10 minutos: lo que puede tardar el consentimiento
    });

    return respuesta;
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

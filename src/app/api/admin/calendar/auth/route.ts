import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getGoogleAuthUrl } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = getGoogleAuthUrl();
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

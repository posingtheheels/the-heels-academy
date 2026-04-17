import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { syncBookingToGoogleCalendar } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Falta el ID de la reserva" }, { status: 400 });
    }

    await syncBookingToGoogleCalendar(bookingId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in manual sync:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

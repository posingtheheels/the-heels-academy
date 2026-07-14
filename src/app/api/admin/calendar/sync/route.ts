import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { syncBookingToGoogleCalendar } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { bookingId, syncAll } = await req.json();

    if (syncAll) {
      // Find all upcoming active bookings that do not have a googleCalendarEventId
      const unsyncedBookings = await prisma.booking.findMany({
        where: {
          status: { in: ["CONFIRMADA", "REALIZADA"] },
          dateTime: { gte: new Date() },
          googleCalendarEventId: null,
        },
      });

      console.log(`Auto-syncing ${unsyncedBookings.length} unsynced upcoming bookings.`);
      
      let successCount = 0;
      let errorCount = 0;
      for (const booking of unsyncedBookings) {
        try {
          await syncBookingToGoogleCalendar(booking.id);
          successCount++;
        } catch (syncErr) {
          console.error(`Failed to sync booking ${booking.id} during bulk sync:`, syncErr);
          errorCount++;
        }
      }

      return NextResponse.json({ success: true, syncedCount: successCount, failedCount: errorCount });
    }

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


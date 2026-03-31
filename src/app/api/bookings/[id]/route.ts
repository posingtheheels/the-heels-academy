import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET: Booking details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        slot: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // Only owner or admin can see it
    if (booking.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH: Cancel or update booking
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { action, status } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { slot: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // Only owner or admin
    const isAdmin = (session.user as any).role === "ADMIN";
    if (booking.userId !== (session.user as any).id && !isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (action === "CANCEL") {
      // 24 Hour Restriction (only for users, not admins)
      if (!isAdmin) {
        const now = new Date();
        const bookingTime = new Date(booking.dateTime);
        const diffMs = bookingTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
          return NextResponse.json(
            { error: "No se puede cancelar con menos de 24h de antelación" },
            { status: 400 }
          );
        }
      }

      // Perform cancellation in transaction
      const cancelledBooking = await prisma.$transaction(async (tx: any) => {
        const updated = await tx.booking.update({
          where: { id: params.id },
          data: { status: "CANCELADA" },
        });

        // Free up the slot
        await tx.slot.update({
          where: { id: booking.slotId },
          data: { available: true },
        });

        // Return session to user plan
        if (booking.userPlanId) {
          await tx.userPlan.update({
            where: { id: booking.userPlanId },
            data: { usedSessions: { decrement: 1 } },
          });
        }

        return updated;
      });

      return NextResponse.json(cancelledBooking);
    }

    // Other updates (admin only)
    if (isAdmin && status) {
       const updated = await prisma.$transaction(async (tx: any) => {
         const up = await tx.booking.update({
           where: { id: params.id },
           data: { status },
         });

         if (status === "CANCELADA") {
           // Free up the slot
           await tx.slot.update({
             where: { id: booking.slotId },
             data: { available: true },
           });

           // Return session to user plan
           if (booking.userPlanId) {
             await tx.userPlan.update({
               where: { id: booking.userPlanId },
               data: { usedSessions: { decrement: 1 } },
             });
           }
         }
         return up;
       });
       return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("Booking patch error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

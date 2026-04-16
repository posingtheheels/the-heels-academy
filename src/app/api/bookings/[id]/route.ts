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
      include: { slot: true, user: true },
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
        // ... (transaction code)
        const updated = await tx.booking.update({
          where: { id: params.id },
          data: { status: "CANCELADA" },
        });

        await tx.slot.update({
          where: { id: booking.slotId },
          data: { available: true },
        });

        if (booking.userPlanId) {
          await tx.userPlan.update({
            where: { id: booking.userPlanId },
            data: { usedSessions: { decrement: 1 } },
          });
        }

        return updated;
      });

      // Background task: delete from Google Calendar
      const formattedDate = new Date(booking.dateTime).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
      
      import("@/lib/resend").then(({ resend }) => {
        Promise.allSettled([
          resend.emails.send({
            from: "The Heels Academy <notificaciones@posingtheheels.com>",
            to: "posingtheheels@gmail.com",
            subject: `❌ Reserva Cancelada: ${booking.user?.name}`,
            html: `<p><strong>${booking.user?.name}</strong> ha cancelado la reserva del <strong>${formattedDate}</strong>.</p><p>Ese hueco ahora vuelve a estar libre y disponible en el calendario.</p>`,
          }),
          resend.emails.send({
            from: "The Heels Academy <soporte@posingtheheels.com>",
            to: booking.user?.email || "",
            subject: `Tu reserva ha sido cancelada`,
            html: `<p>Hola ${booking.user?.name}, confirmamos que tu clase del <strong>${formattedDate}</strong> ha sido cancelada con éxito.</p><p>Tu sesión ha sido devuelta a tu bono y puedes volver a agendar cuando quieras desde la web.</p>`,
          })
        ]);
      }).catch(console.error);

      import("@/lib/google-calendar").then(({ deleteGoogleCalendarEvent }) => {
        deleteGoogleCalendarEvent(params.id);
      }).catch(console.error);

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
           await tx.slot.update({
             where: { id: booking.slotId },
             data: { available: true },
           });

           if (booking.userPlanId) {
             await tx.userPlan.update({
               where: { id: booking.userPlanId },
               data: { usedSessions: { decrement: 1 } },
             });
           }
         }
         return up;
       });

       // Background task: delete from Google Calendar if cancelled
       if (status === "CANCELADA") {
          const formattedDate = new Date(booking.dateTime).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
          import("@/lib/resend").then(({ resend }) => {
             resend.emails.send({
                from: "The Heels Academy <soporte@posingtheheels.com>",
                to: booking.user?.email || "",
                subject: `Aviso: Tu clase ha sido cancelada`,
                html: `<p>Hola ${booking.user?.name}, te informamos que por motivos de agenda nos hemos visto obligadas a cancelar tu sesión del <strong>${formattedDate}</strong>.</p><p>La sesión intacta ha vuelto a tu bono. Disculpa las molestias, te esperamos en tu próximo horario disponible.</p>`,
             });
          }).catch(console.error);

          import("@/lib/google-calendar").then(({ deleteGoogleCalendarEvent }) => {
            deleteGoogleCalendarEvent(params.id);
          }).catch(console.error);
       }

       return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("Booking patch error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

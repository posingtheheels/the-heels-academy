import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/bookings: Fetch current user's bookings or all bookings (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    // Admin gets all bookings, user gets their own
    const isAdmin = (session.user as any)?.role === "ADMIN";
    const where = isAdmin ? {} : { userId: (session.user as any)?.id };
    
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        slot: { select: { id: true, dateTime: true, type: true } },
      },
      orderBy: { dateTime: "desc" },
    });
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

// POST /api/bookings: Create a new booking
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const { slotId, modality, paymentMethod, targetUserId, isAdminForce, userPlanId } = await req.json();
    
    if (!slotId) {
      return NextResponse.json({ error: "Slot ID requerido" }, { status: 400 });
    }
    
    const isAdmin = (session.user as any)?.role === "ADMIN";
    const userId = (isAdmin && targetUserId) ? targetUserId : (session.user as any)?.id;

    // Check if slot exists
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
    });
    
    if (!slot) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });
    }

    if (!slot.available && !isAdmin) {
      return NextResponse.json({ error: "El horario ya no está disponible" }, { status: 400 });
    }

    // Restriction: At least 24 hours in advance (only for students)
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (!isAdmin && slot.dateTime < minDate) {
      return NextResponse.json({ 
        error: "Debes reservar las clases con 24 horas de antelación" 
      }, { status: 400 });
    }
    
    const bookingStatus = (paymentMethod === "EN_CLASE" || (isAdmin && !userPlanId)) ? "PENDIENTE_PAGO" : "CONFIRMADA";
    
    const booking = await prisma.$transaction(async (tx: any) => {
      // 1. DEDUCT & GET MODALITY
      let finalUserPlanId = userPlanId;
      const slotType = slot.type; // Modality required by the slot

      // Determine requested modality (or default to slot type if not specified)
      let targetModality = modality || (slotType === "AMBAS" ? "PRESENCIAL" : slotType);

      // Case A: Plan specified by admin 
      // Case B: Automatic selection for student (not EN_CLASE)
      if (!finalUserPlanId && paymentMethod !== "EN_CLASE") {
        // FILTER PLANS BY MODALITY COMPATIBILITY
        const userPlan = await tx.userPlan.findFirst({
          where: {
            userId,
            paymentStatus: "PAGADO",
            usedSessions: { lt: prisma.userPlan.fields.totalSessions },
            plan: {
              OR: [
                { type: "AMBAS" },
                { type: targetModality }
              ]
            }
          },
          include: { plan: true },
          orderBy: { createdAt: "asc" },
        });

        if (userPlan) {
          finalUserPlanId = userPlan.id;
        } else {
          // No compatible plan found
          if (targetModality === "PRESENCIAL") {
            // It's allowed to request EN_CLASE if no plan, but if they didn't explicitly select it, we inform them
            if (paymentMethod !== "EN_CLASE") {
              throw new Error("ERROR: No tienes un bono compatible con esta modalidad (Presencial). Puedes reservar y pagar directamente en la clase eligiendo esa opción.");
            }
          } else {
            throw new Error("ERROR: No tienes un bono activo compatible con sesiones Online. Por favor, adquiere uno para reservar.");
          }
        }
      }

      if (finalUserPlanId) {
        const selectedPlan = await tx.userPlan.findUnique({
          where: { id: finalUserPlanId },
          include: { plan: true },
        });

        if (!selectedPlan || selectedPlan.userId !== userId) {
          throw new Error("Bono no válido para esta alumna.");
        }

        // COMPATIBILITY CHECK WITH SLOT
        const planType = selectedPlan.plan.type;
        const isCompatible = planType === "AMBAS" || planType === targetModality;

        if (!isCompatible && !isAdmin) {
          throw new Error("ERROR: Tu bono no cumple con las características de esta modalidad.");
        }

        // Update modality from plan if specialized
        if (targetModality === "AMBAS" && planType !== "AMBAS") {
          targetModality = planType;
        }

        await tx.userPlan.update({
          where: { id: finalUserPlanId },
          data: { usedSessions: { increment: 1 } },
        });
      }

      // Default modality for non-plan bookings
      if (!targetModality || targetModality === "AMBAS") {
        targetModality = slotType === "AMBAS" ? "PRESENCIAL" : slotType;
      }

      // 2. Create the booking
      const newBooking = await tx.booking.create({
        data: {
          userId,
          slotId,
          dateTime: slot.dateTime,
          modality: targetModality,
          status: finalUserPlanId ? "CONFIRMADA" : (paymentMethod === "EN_CLASE" ? "PENDIENTE_PAGO" : "CONFIRMADA"),
          userPlanId: finalUserPlanId,
        },
      });
      
      // 3. Mark slot as unavailable
      await tx.slot.update({
        where: { id: slotId },
        data: { available: false },
      });
      
      return newBooking;
    });

    // 4. Send Email Notification to Instructor (Async - don't block response)
      try {
        const { resend } = await import("@/lib/resend");
        const { syncBookingToGoogleCalendar } = await import("@/lib/google-calendar");
        
        const date = new Date(booking.dateTime);
        const formattedDate = new Intl.DateTimeFormat("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Madrid"
        }).format(date);

        // Send Email and Sync Calendar in parallel
        await Promise.allSettled([
          resend.emails.send({
            from: "The Heels Academy <notifications@posingtheheels.com>",
            to: "posingtheheels@gmail.com",
            subject: `Nueva Reserva: ${session.user.name}`,
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 20px;">
                <h1 style="color: #ed8796; text-align: center; font-size: 24px; margin-bottom: 30px;">¡Nueva reserva recibida!</h1>
                <p>Hola Alejandra,</p>
                <p>Se ha nueva reserva en <strong>The Heels Academy</strong>:</p>
                <div style="background-color: #fce7eb; padding: 25px; border-radius: 15px; margin: 30px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>Alumna:</strong> ${session.user.name} (${session.user.email})</p>
                  <p style="margin: 0 0 10px 0;"><strong>Fecha y Hora:</strong> ${formattedDate} (Hora España)</p>
                  <p style="margin: 0;"><strong>Modalidad:</strong> ${booking.modality}</p>
                </div>
                <p style="text-align: center; margin-top: 40px;">
                  <a href="https://posingtheheels.com/admin/agenda" style="background-color: #ed8796; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold;">Ver mi agenda</a>
                </p>
              </div>
            `,
          }),
          resend.emails.send({
            from: "The Heels Academy <soporte@posingtheheels.com>",
            to: session.user.email,
            subject: `✅ Reserva Confirmada: Clase de Posing`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; color: #333;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #BA9D81; font-style: italic; margin: 0;">The Heels</h1>
                  <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #999; margin-top: 5px;">Posing Academy</p>
                </div>
                <h2 style="color: #333; text-align: center; font-size: 20px;">¡Reserva guardada con éxito, ${session.user.name}!</h2>
                <p style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px;">
                  Tu clase ha quedado apuntada en nuestra agenda correctamente. ¡Nos vemos súper pronto en la plataforma o en el gimnasio!
                </p>
                <div style="background: #fdf2f4; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; border: 1px solid #ffccd5;">
                  <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #BA9D81; font-weight: bold;">Tu cita</p>
                  <p style="margin: 15px 0 5px 0; font-size: 18px; color: #333; font-weight: bold;">${formattedDate}</p>
                  <p style="margin: 0; font-size: 10px; color: #BA9D81; text-transform: uppercase;">Hora de España (Madrid)</p>
                  <div style="margin-top: 15px; font-size: 13px; color: #777;">
                     Modo: <span style="color: #333; font-weight: bold;">${booking.modality === 'ONLINE' ? 'Videollamada (WhatsApp)' : 'Presencial (Apex Power Gym)'}</span>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://posingtheheels.com/dashboard" style="background-color: #BA9D81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Acceder a mi App</a>
                </div>
              </div>
            `,
          }),
          syncBookingToGoogleCalendar(booking.id)
        ]);
      } catch (emailError) {
        console.error("Error in post-booking background tasks:", emailError);
      }
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    // Determine if it was an intentionally thrown error (like a status 400)
    const isBusinessError = error.message.includes("ERROR") || 
                           error.message.includes("disponibles") || 
                           error.message.includes("disponible");
    
    return NextResponse.json(
      { error: error?.message || "Error interno" },
      { status: isBusinessError ? 400 : 500 }
    );
  }
}

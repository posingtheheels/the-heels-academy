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
      let targetModality = modality;

      // Case A: Plan specified by admin 
      // Case B: Automatic selection for student (not EN_CLASE)
      if (!finalUserPlanId && paymentMethod !== "EN_CLASE" && !isAdmin) {
        const userPlan = await tx.userPlan.findFirst({
          where: {
            userId,
            paymentStatus: "PAGADO",
            usedSessions: { lt: prisma.userPlan.fields.totalSessions },
          },
          include: { plan: true },
          orderBy: { createdAt: "asc" },
        });
        if (userPlan) finalUserPlanId = userPlan.id;
        else throw new Error("No tienes sesiones disponibles en tu bono.");
      }

      if (finalUserPlanId) {
        const selectedPlan = await tx.userPlan.findUnique({
          where: { id: finalUserPlanId },
          include: { plan: true },
        });

        if (!selectedPlan || selectedPlan.userId !== userId) {
          throw new Error("Bono no válido para esta alumna.");
        }

        // If no modality provided, infer from plan
        if (!targetModality) {
          if (selectedPlan.plan.type !== "AMBAS") {
            targetModality = selectedPlan.plan.type;
          } else {
            // If plan is AMBAS, default to slot default
            targetModality = slot.type === "AMBAS" ? "PRESENCIAL" : slot.type;
          }
        }

        // COMPATIBILITY CHECK
        if (selectedPlan.plan.type !== "AMBAS" && selectedPlan.plan.type !== targetModality && !isAdmin) {
          throw new Error("ERROR: el bono seleccionado no es compatible con esta modalidad.");
        }

        await tx.userPlan.update({
          where: { id: finalUserPlanId },
          data: { usedSessions: { increment: 1 } },
        });
      }

      // Default modality for non-plan bookings (EN_CLASE or Manual)
      if (!targetModality) {
        targetModality = slot.type === "AMBAS" ? "PRESENCIAL" : slot.type;
      }

      // 2. Create the booking
      const newBooking = await tx.booking.create({
        data: {
          userId,
          slotId,
          dateTime: slot.dateTime,
          modality: targetModality,
          status: bookingStatus,
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

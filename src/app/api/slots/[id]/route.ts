import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// DELETE: Delete a specific slot
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const slotId = params.id;

    // Check if slot has bookings
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { bookings: true },
    });

    if (!slot) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });
    }

    const activeBooking = slot.bookings.find((b: any) => b.status === "CONFIRMADA" || b.status === "PENDIENTE_PAGO");
    
    if (activeBooking) {
      return NextResponse.json({ 
        error: "No se puede borrar un horario con una reserva activa. Por favor, cancela la reserva primero." 
      }, { status: 400 });
    }

    // Delete all bookings associated with this slot (cancelled, etc.)
    // Active ones are already checked above
    await prisma.booking.deleteMany({
      where: { slotId: slotId },
    });

    // Delete the slot 
    await prisma.slot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({ message: "Horario eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH: Update a specific slot (e.g., change modality or duration)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { type, durationMinutes, available } = await req.json();

    const updatedSlot = await prisma.slot.update({
      where: { id: params.id },
      data: {
        type,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        available,
      },
    });

    return NextResponse.json(updatedSlot);
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

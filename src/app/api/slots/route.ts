import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/slots: Fetch available slots (user) or all slots (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const availableOnly = req.nextUrl.searchParams.get("available") === "true";
    
    const now = new Date();
    const isAdmin = session && (session.user as any)?.role === "ADMIN";
    
    const where: any = {};
    if (availableOnly) {
      where.available = true;
      // If not admin, must be at least 24h in advance
      const minDate = isAdmin ? now : new Date(now.getTime() + 24 * 60 * 60 * 1000);
      where.dateTime = { gte: minDate };
    }
    
    const slots = await prisma.slot.findMany({
      where,
      orderBy: { dateTime: "asc" },
    });
    
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

// POST /api/slots: Create one or multiple slots (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Handle array of slots (bulk creation)
    if (Array.isArray(body)) {
      const slotsData = body.map((item) => ({
        dateTime: new Date(item.dateTime),
        durationMinutes: parseInt(item.durationMinutes) || (item.type === "ONLINE" ? 30 : 60),
        type: item.type || "AMBAS",
        available: true,
      }));

      const slots = await prisma.slot.createMany({
        data: slotsData,
      });

      return NextResponse.json({ count: slots.count }, { status: 201 });
    }
    
    // Handle single slot
    const { dateTime, durationMinutes, type } = body;
    
    if (!dateTime) {
      return NextResponse.json({ error: "Fecha y hora requeridas" }, { status: 400 });
    }
    
    const slot = await prisma.slot.create({
      data: {
        dateTime: new Date(dateTime),
        durationMinutes: parseInt(durationMinutes) || (type === "ONLINE" ? 30 : 60),
        type: type || "AMBAS",
        available: true,
      },
    });
    
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("Error creating slot(s):", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

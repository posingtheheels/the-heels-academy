import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");

    const where: any = {};
    if (!isNaN(month) && !isNaN(year)) {
       const startDate = new Date(year, month - 1, 1);
       const endDate = new Date(year, month, 0, 23, 59, 59);
       where.dateTime = {
         gte: startDate,
         lte: endDate,
       };
    }

    const slots = await prisma.slot.findMany({
      where,
      include: {
        bookings: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          }
        },
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching admin calendar data:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

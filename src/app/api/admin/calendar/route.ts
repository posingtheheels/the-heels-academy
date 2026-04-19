import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    let startDate, endDate;
    if (startStr && endStr) {
      startDate = new Date(startStr);
      endDate = new Date(endStr);
    } else if (!isNaN(month) && !isNaN(year)) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    }

    const where: any = {};
    if (startDate && endDate) {
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

    const tasks = await prisma.adminTask.findMany({
      where: startDate && endDate ? {
        date: {
          gte: startDate,
          lte: endDate,
        }
      } : {},
      orderBy: { date: "asc" }
    });

    return NextResponse.json({ slots, tasks });
  } catch (error) {
    console.error("Error fetching admin calendar data:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

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
    
    // 1. Total users (excluding self)
    const userCount = await prisma.user.count({
      where: { role: "USER" },
    });
    
    // Dates for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 2. Reservations today
    const reservationsTodayList = await prisma.booking.findMany({
      where: {
        dateTime: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ["CONFIRMADA", "REALIZADA", "PENDIENTE_PAGO"] },
      },
      include: { user: { select: { id: true, name: true, phone: true, category: true, federation: true } } },
      orderBy: { dateTime: "asc" },
    });
    
    // 3. Revenue this month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const paidPlans = await prisma.userPlan.findMany({
      where: {
        paymentStatus: "PAGADO",
        createdAt: { gte: firstDayOfMonth },
      },
      include: { plan: true },
    });
    
    const monthlyRevenue = paidPlans.reduce((acc: number, up: any) => acc + up.plan.price, 0);
    
    // 4. Pending payments
    const pendingBookingsList = await prisma.booking.findMany({
      where: { status: "PENDIENTE_PAGO" },
      include: { user: { select: { id: true, name: true, phone: true, category: true, federation: true } } },
      orderBy: { dateTime: "asc" },
    });
    
    // 5. Recent notifications/activity
    const recentActivity = await prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
    
    const googleCalendarEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
    
    return NextResponse.json({
      userCount,
      reservationsToday: reservationsTodayList.length,
      todayBookings: reservationsTodayList,
      monthlyRevenue,
      pendingPayments: pendingBookingsList.length,
      pendingBookings: pendingBookingsList,
      recentActivity,
      googleCalendarEnabled,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

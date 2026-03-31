import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    
    const userId = (session.user as any)?.id;
    
    // 1. Available sessions (sum of unused sessions in all active plans)
    const userPlans = await prisma.userPlan.findMany({
      where: {
        userId,
        paymentStatus: "PAGADO",
      },
    });
    
    const availableSessions = userPlans.reduce(
      (acc: number, plan: any) => acc + (plan.totalSessions - plan.usedSessions), 
      0
    );
    
    // 2. Upcoming classes
    const upcomingClasses = await prisma.booking.count({
      where: {
        userId,
        dateTime: { gte: new Date() },
        status: { in: ["CONFIRMADA", "PENDIENTE_PAGO"] },
      },
    });
    
    // 3. Completed classes
    const completedClasses = await prisma.booking.count({
      where: {
        userId,
        status: "REALIZADA",
      },
    });
    
    // 4. Most recent active plan
    const activePlan = await prisma.userPlan.findFirst({
      where: {
        userId,
        paymentStatus: "PAGADO",
        usedSessions: { lt: prisma.userPlan.fields.totalSessions },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({
      availableSessions,
      upcomingClasses,
      completedClasses,
      activePlan,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST /api/admin/user-plans: Assign a plan to a user manually
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { userId, planId } = await req.json();

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90); // Default validity

    const userPlan = await prisma.userPlan.create({
      data: {
        userId,
        planId,
        totalSessions: plan.totalSessions,
        usedSessions: 0,
        paymentStatus: "PAGADO", // Admin manually assigning means it's set as paid
        expiresAt,
      },
    });

    return NextResponse.json(userPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating manual user plan:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

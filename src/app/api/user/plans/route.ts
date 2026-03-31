import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/user/plans: Fetch all available official plans
export async function GET(req: NextRequest) {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    });
    
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/user/plans: Buy a plan (simulated for now, should integrate Stripe later)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "Plan ID requerido" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    // In a real app, this is where we'd create a Stripe checkout session.
    // For now, we'll directly create the UserPlan to "simulate" a successful purchase.
    
    const userPlan = await prisma.userPlan.create({
      data: {
        userId: (session.user as any).id,
        planId: plan.id,
        totalSessions: plan.totalSessions,
        usedSessions: 0,
        paymentStatus: "PAGADO", // Simulated success
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days validity
      },
    });

    return NextResponse.json(userPlan, { status: 201 });
  } catch (error) {
    console.error("Error buying plan:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

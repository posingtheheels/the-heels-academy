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
    
    // Campos explícitos: con `include` viajaban al navegador el hash de la
    // contraseña y el token de recuperación de cada alumna.
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        category: true,
        federation: true,
        notes: true,
        createdAt: true,
        userPlans: {
          where: {
            usedSessions: { lt: prisma.userPlan.fields.totalSessions }
          }
        }
      }
    });

    // Map to simplify for frontend if needed, though include is fine
    const usersWithPlanStatus = users.map((u: any) => ({
      ...u,
      activePlansCount: u.userPlans.length
    }));
    
    return NextResponse.json(usersWithPlanStatus);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

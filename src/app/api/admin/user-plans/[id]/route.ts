import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { usedSessions, totalSessions } = await req.json();

    const updated = await prisma.userPlan.update({
      where: { id: params.id },
      data: {
        usedSessions: usedSessions !== undefined ? parseInt(usedSessions) : undefined,
        totalSessions: totalSessions !== undefined ? parseInt(totalSessions) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user plan sessions:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

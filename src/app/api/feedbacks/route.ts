import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Public/Admin: GET feedbacks
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session && (session.user as any)?.role === "ADMIN";

    const feedbacks = await (prisma as any).feedback.findMany({
      where: isAdmin ? {} : { active: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Admin: POST feedback
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, message, role, rating, imageUrl, active } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "El mensaje es obligatorio" }, { status: 400 });
    }

    const feedback = await (prisma as any).feedback.create({
      data: {
        name,
        message,
        role: role || null,
        rating: rating !== undefined ? parseInt(rating.toString()) : 5,
        imageUrl: imageUrl || null,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    const now = new Date();
    const posts = await prisma.blogPost.findMany({
      where: isAdmin ? {} : { 
        published: true,
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: now } }
        ]
      },
      orderBy: [
        { scheduledAt: "desc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Solo artículos ya publicados y cuya fecha programada haya llegado.
    // Este endpoint alimenta la landing pública: los borradores generados por
    // IA no pueden asomar aquí antes de que Alejandra los revise.
    const now = new Date();
    const posts = await (prisma as any).blogPost.findMany({
      where: {
        published: true,
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    console.log(`API Latest: Found ${posts.length} posts`);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching latest blog posts:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error
  }
}

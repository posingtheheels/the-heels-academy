import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch latest 3 published posts
    const posts = await (prisma as any).blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching latest blog posts:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array instead of error
  }
}

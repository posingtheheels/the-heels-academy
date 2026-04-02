import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/blog/[slug]: Fetch a single post by slug
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
    });

    if (!post) {
       return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/blog/[slug]: Update a post
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { published, title, content, excerpt, category } = body;

    let updateData: any = { published, title, content, excerpt, category };

    // Automatic Scheduling Logic: If being published and doesn't have a date yet
    if (published === true) {
      const currentPost = await prisma.blogPost.findUnique({
        where: { slug: params.slug },
        select: { scheduledAt: true }
      });

      if (!currentPost?.scheduledAt) {
        // Find next available Monday (1) or Thursday (4)
        const lastPost = await prisma.blogPost.findFirst({
          where: { 
            published: true,
            scheduledAt: { not: null }
          },
          orderBy: { scheduledAt: "desc" }
        });

        let baseDate = new Date();
        if (lastPost?.scheduledAt && lastPost.scheduledAt > baseDate) {
          baseDate = new Date(lastPost.scheduledAt);
        }

        let nextDate = new Date(baseDate);
        nextDate.setHours(10, 0, 0, 0);
        
        let found = false;
        for (let i = 1; i < 30; i++) {
          nextDate.setDate(nextDate.getDate() + 1);
          const day = nextDate.getDay();
          if (day === 1 || day === 4) { // Monday or Thursday
            found = true;
            break;
          }
        }
        if (found) {
          updateData.scheduledAt = nextDate;
        }
      }
    } else if (published === false) {
      // If moving back to draft, we clear scheduling
      updateData.scheduledAt = null;
    }

    const post = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return NextResponse.json({ error: error?.message || "Error interno" }, { status: 500 });
  }
}

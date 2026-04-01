import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/blog: Fetch all posts (unfiltered for troubleshooting)
export async function GET(req: NextRequest) {
  try {
    const client = (prisma as any);
    const blogModel = client.blogPost || client.BlogPost || client.blogpost;
    
    if (!blogModel) {
      console.log("CRITICAL: BlogPost model not found in Prisma Client");
      const models = Object.keys(client).filter(k => !k.startsWith("_") && !k.startsWith("$"));
      return NextResponse.json({ 
        error: "Modelo de Blog no encontrado en el sistema",
        availableModels: models
      }, { status: 500 });
    }

    const posts = await blogModel.findMany({
      orderBy: { createdAt: "desc" },
    });

    const dbUrl = process.env.DATABASE_URL || "";
    const dbHost = dbUrl.split("@")[1]?.split(":")[0] || "unknown";

    return NextResponse.json({
      posts,
      dbStatus: {
        host: dbHost,
        count: posts.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: error?.message || "Error interno del servidor" }, { status: 500 });
  }
}

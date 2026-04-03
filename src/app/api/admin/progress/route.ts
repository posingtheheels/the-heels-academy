import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ADMIN: Add or get logs for a specific user
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, title, content, category, imageUrl, date } = await req.json();
    
    if (!userId || !title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const log = await (prisma as any).progressLog.create({
      data: {
        userId,
        title,
        content,
        category: category || "GENERAL",
        imageUrl,
        date: date ? new Date(date) : new Date()
      }
    });

    return NextResponse.json(log);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const logs = await (prisma as any).progressLog.findMany({
      where: { userId },
      orderBy: { date: "desc" }
    });
    return NextResponse.json(logs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find to check for image
    const log = await (prisma as any).progressLog.findUnique({
      where: { id }
    });

    if (!log) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete image from storage if applicable
    if (log.imageUrl && log.imageUrl.includes("supabase.co")) {
      try {
        const parts = log.imageUrl.split("/");
        const fileName = parts[parts.length - 1];
        await supabaseAdmin.storage.from("feedbacks").remove([fileName]);
      } catch (err) {
        console.error("Error deleting image from storage:", err);
      }
    }

    await (prisma as any).progressLog.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error) {
    console.error("Error deleting progress log:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const { name, message, role, rating, imageUrl, active } = await req.json();

    const feedback = await (prisma as any).feedback.update({
      where: { id },
      data: {
        name,
        message,
        role,
        rating: rating !== undefined ? parseInt(rating.toString()) : undefined,
        imageUrl,
        active,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    // First find to get the imageUrl
    const feedback = await (prisma as any).feedback.findUnique({ where: { id } });

    if (feedback?.imageUrl && feedback.imageUrl.includes("supabase.co")) {
      const parts = feedback.imageUrl.split("/");
      const fileName = parts[parts.length - 1];
      await supabaseAdmin.storage.from("feedbacks").remove([fileName]);
    }

    await (prisma as any).feedback.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Feedback eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow if logged in as ADMIN
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const newEmail = "posingtheheels@gmail.com";
    
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!admin) {
        return NextResponse.json({ error: "No se encuentra usuario ADMIN" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: admin.id },
      data: { email: newEmail }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Email de admin actualizado correctamente a ${newEmail}`,
      note: "Deberás cerrar sesión e iniciar sesión de nuevo con el nuevo email."
    });
  } catch (error) {
    console.error("Error al actualizar email de admin:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

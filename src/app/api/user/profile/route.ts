import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        category: true,
        federation: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, email, phone, category, federation } = await req.json();

    // Check if email already exists for another user
    if (email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing && existing.id !== (session.user as any).id) {
        return NextResponse.json({ error: "Este email ya está en uso" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        name,
        email,
        phone,
        category,
        federation
      },
    });

    return NextResponse.json({
      message: "Perfil actualizado",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        category: updatedUser.category,
        federation: updatedUser.federation
      }
    });
  } catch (error: any) {
    console.error("Error updating profile:", error.message || error);
    return NextResponse.json({ 
      error: "Error interno", 
      details: error.message 
    }, { status: 500 });
  }
}

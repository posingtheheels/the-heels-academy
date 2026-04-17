import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        userPlans: {
          include: {
            plan: true,
          },
        },
        bookings: {
          include: {
            slot: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Exclude password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user details in /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { email, name, phone, password: newPassword } = await req.json();
    
    // Hash password if provided
    let hashedPassword;
    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, 12);
    }
    
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(email && { email }),
        ...(name && { name }),
        ...(phone && { phone }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    const { password, ...userWithoutPassword } = updated;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

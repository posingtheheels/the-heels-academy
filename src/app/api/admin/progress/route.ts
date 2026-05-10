import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resend } from "@/lib/resend";

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

    try {
      // Fetch user for email notification
      const user = await (prisma as any).user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (user?.email) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #BA9D81; font-style: italic; margin: 0;">The Heels</h1>
              <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #999; margin-top: 5px;">Posing Academy</p>
            </div>
            
            <h2 style="color: #333; text-align: center; font-size: 20px;">¡Hola, ${user.name}!</h2>
            <p style="text-align: center; line-height: 1.6; color: #666;">
              Se ha añadido un nuevo <strong>registro de evolución</strong> a tu dossier.
            </p>
            
            <div style="background: #fdf2f4; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; border: 1px solid #ffccd5;">
              <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #BA9D81; font-weight: bold;">${category || 'General'}</p>
              <p style="margin: 15px 0 5px 0; font-size: 18px; color: #333; font-weight: bold;">${title}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL || 'https://posingtheheels.com'}/dashboard/historial" style="background-color: #BA9D81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Ver mi Dossier</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
            
            <p style="font-size: 11px; color: #ccc; text-align: center; margin: 0;">
              The Heels Academy - Alejandra Sanchis<br/>
              Badalona, Barcelona
            </p>
          </div>
        `;

        await resend.emails.send({
          from: 'Academia The Heels <soporte@posingtheheels.com>',
          to: user.email,
          subject: \`✨ Nuevo registro de evolución: \${title}\`,
          html: emailHtml,
        });
      }
    } catch (emailErr) {
      console.error("Error sending email notification for progress log:", emailErr);
      // We don't block the request if the email fails.
    }

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

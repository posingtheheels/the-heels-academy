import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { planId } = await req.json();
    console.log("🛒 Checkout requested for plan:", planId);
    
    if (!planId) {
      console.error("❌ No planId provided");
      return NextResponse.json({ error: "Plan ID requerido" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    console.log("📄 Plan found in DB:", plan ? "YES" : "NO", plan?.name);

    if (!plan || !plan.stripePriceId) {
      console.error("❌ Plan not found or has no stripePriceId:", planId);
      return NextResponse.json({ error: "Plan o ID de Stripe no encontrado" }, { status: 404 });
    }

    console.log("💳 Creating Stripe Session with Price ID:", plan.stripePriceId);

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/planes?payment=cancelled`,
      customer_email: session.user.email!,
      metadata: {
        userId: (session.user as any).id,
        planId: plan.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message || "Error al crear la sesión de pago" }, { status: 500 });
  }
}

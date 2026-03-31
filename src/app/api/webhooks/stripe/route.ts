import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error("Missing signature or endpoint secret");
    }
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Extract metadata
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (userId && planId) {
      console.log(`Payment confirmed for user ${userId} and plan ${planId}`);
      
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (plan) {
        // Add classes to the user
        await prisma.userPlan.create({
          data: {
            userId,
            planId,
            totalSessions: plan.totalSessions,
            usedSessions: 0,
            paymentStatus: "PAGADO",
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          }
        });
        console.log(`Plan ${planId} activated for user ${userId}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}

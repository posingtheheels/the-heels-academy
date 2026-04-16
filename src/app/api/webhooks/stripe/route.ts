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
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (plan && user) {
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

        try {
          const { resend } = await import("@/lib/resend");
          
          await Promise.allSettled([
            // Avisar a la Academia
            resend.emails.send({
              from: "The Heels Academy <notificaciones@posingtheheels.com>",
              to: "posingtheheels@gmail.com",
              subject: `💰 Nueva compra de bono: ${user.name}`,
              html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                  <h1 style="color: #ed8796; text-align: center;">¡Nueva venta de Bono!</h1>
                  <p><strong>${user.name}</strong> (${user.email}) acaba de comprar el siguiente bono a través de la web:</p>
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin:0;"><strong>Plan adquirido:</strong> ${plan.name}</p>
                    <p style="margin:5px 0 0 0;"><strong>Sesiones añadidas a su saldo:</strong> ${plan.totalSessions}</p>
                  </div>
                  <p>La alumna ya puede entrar a la app y empezar a canjear sus sesiones en el calendario.</p>
                  <p style="text-align: center; margin-top:30px;">
                    <a href="https://posingtheheels.com/admin/alumnos" style="background-color: #ed8796; color: white; padding: 12px 25px; border-radius: 20px; font-weight:bold; text-decoration: none;">Ver saldo de alumnas</a>
                  </p>
                </div>
              `,
            }),
            // Avisar a la Alumna
            resend.emails.send({
              from: "The Heels Academy <soporte@posingtheheels.com>",
              to: user.email,
              subject: `👠 Has adquirido el ${plan.name} correctamente`,
              html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #BA9D81; font-style: italic; margin: 0;">The Heels</h1>
                    <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #999; margin-top: 5px;">Posing Academy</p>
                  </div>
                  <h2 style="text-align: center;">¡Gracias por tu compra, ${user.name}!</h2>
                  <p style="text-align: center;">Hemos añadido tu nuevo bono a tu saldo. En tu panel de alumna verás que tienes <strong>${plan.totalSessions} nuevas sesiones disponibles</strong>.</p>
                  <div style="background-color: #fdf2f4; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border: 1px solid #ffccd5;">
                    <p style="margin:0; font-size: 18px; font-weight: bold; color: #BA9D81;">${plan.name}</p>
                  </div>
                  <p style="text-align: center;">Ya puedes entrar y empezar a agendar tu próxima clase de posing directamente desde tu calendario.</p>
                  <p style="text-align: center; margin-top:30px;">
                    <a href="https://posingtheheels.com/dashboard/reservar" style="background-color: #BA9D81; color: white; padding: 12px 25px; border-radius: 10px; font-weight:bold; text-decoration: none;">Ir a Reservar Clase</a>
                  </p>
                </div>
              `,
            })
          ]);
        } catch (e) {
          console.error("Error enviando email webhook webhook Stripe", e);
        }

        console.log(`Plan ${planId} activated for user ${userId}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}

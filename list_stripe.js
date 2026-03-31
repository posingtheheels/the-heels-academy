const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
const prisma = new PrismaClient();

async function sync() {
  console.log('--- START ---');
  try {
    const prices = await stripe.prices.list({ active: true, expand: ['data.product'] });
    
    for (const price of prices.data) {
      const product = price.product;
      console.log(`METADATA:${product.name}|${price.id}`);
      
      const plan = await prisma.plan.findFirst({
        where: { name: { contains: product.name, mode: 'insensitive' } }
      });

      if (plan) {
        await prisma.plan.update({
          where: { id: plan.id },
          data: { stripePriceId: price.id }
        });
        console.log(`UPDATED:${product.name}`);
      }
    }
  } catch (err) {
    console.error('ERROR:', err.message);
  }
  console.log('--- END ---');
}

sync().finally(() => prisma.$disconnect());

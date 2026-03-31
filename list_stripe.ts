import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any });
const prisma = new PrismaClient();

async function sync() {
  console.log('--- START ---');
  const prices = await stripe.prices.list({ active: true, expand: ['data.product'] });
  
  for (const price of prices.data) {
    const product = price.product as Stripe.Product;
    console.log(`METADATA:${product.name}|${price.id}`);
  }
  console.log('--- END ---');
}

sync().catch(console.error);

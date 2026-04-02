import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STRIPE_MAPPING = {
  'clase-individual-online': 'price_1THfQhF0S6rjvcaWUstspP1m',
  'bono-5-clases-online': 'price_1THfRQF0S6rjvcaWBbvrfmWq',
  'bono-10-clases-online': 'price_1THfSDF0S6rjvcaWGLEyI05H',
  'clase-individual-presencial': 'price_1THfR0F0S6rjvcaWMVecKdYt',
  'bono-5-clases-presencial': 'price_1THfRrF0S6rjvcaWxfvKykxB',
  'bono-10-clases-presencial': 'price_1THfSfF0S6rjvcaWkkmaa5LT',
};

async function main() {
  console.log('Updating plans with Stripe Price IDs...');

  for (const [planId, stripePriceId] of Object.entries(STRIPE_MAPPING)) {
    await prisma.plan.update({
      where: { id: planId },
      data: { stripePriceId },
    });
    console.log(`✅ Updated ${planId} with ${stripePriceId}`);
  }

  console.log('All plans updated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

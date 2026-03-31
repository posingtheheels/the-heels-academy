import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STRIPE_MAPPING = {
  'clase-individual-online': 'price_1TH461F0S6rjvcaWuXe1TIGi',
  'bono-5-clases-online': 'price_1TH46jF0S6rjvcaWkBnaumrN',
  'bono-10-clases-online': 'price_1TH47VF0S6rjvcaWbuM70zdQ',
  'clase-individual-presencial': 'price_1TH45dF0S6rjvcaWWGsERHEF',
  'bono-5-clases-presencial': 'price_1TH46TF0S6rjvcaW433UiPMO',
  'bono-10-clases-presencial': 'price_1TH47BF0S6rjvcaWyhSH5Ggn',
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

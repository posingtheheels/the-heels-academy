/**
 * Subida de tarifas de septiembre de 2026.
 *
 * Los Precios de Stripe son INMUTABLES: no se puede editar el importe de uno ya
 * creado. Y el checkout cobra por `plan.stripePriceId`, no por `plan.price`
 * (ver src/app/api/checkout/route.ts). Si se cambia el precio solo en la base de
 * datos, la alumna ve el importe nuevo y se le cobra el viejo, sin ningún error.
 *
 * Los Precios nuevos YA ESTAN CREADOS A MANO en Stripe (2026-09-01), sobre
 * productos nuevos terminados en "2026". Este script NO crea nada en Stripe:
 * comprueba que cada Precio cobra exactamente lo acordado y apunta los planes a
 * él, actualizando `price` y `stripePriceId` en la misma transacción para que no
 * exista ni un instante en el que el mostrado y el cobrado no coincidan.
 *
 * Uso:
 *   node scripts/subida-precios-septiembre.js                    # simulacro, no escribe nada
 *   node scripts/subida-precios-septiembre.js --apply            # ejecuta de verdad
 *   node scripts/subida-precios-septiembre.js --archivar-antiguos --apply
 *
 * El archivado de los Precios viejos se deja aparte a propósito: conviene
 * esperar unos días por si queda alguna sesión de checkout a medias.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const APLICAR = process.argv.includes('--apply');
const ARCHIVAR = process.argv.includes('--archivar-antiguos');
const VIGENCIA = '2026-09';

// `antes` es una salvaguarda: si el precio en base de datos no es el esperado,
// alguien ya tocó la tarifa y el script se para en vez de pisar su cambio.
// `priceId` es el Precio creado a mano en Stripe el 2026-09-01. Cuelgan de
// productos distintos a los antiguos, así que no se pueden buscar por producto:
// van escritos aquí y el script verifica uno a uno que cobran lo acordado.
const TARIFA = [
  { id: 'clase-individual-online',     antes: 20,  ahora: 25,  priceId: 'price_1UAqOmF0S6rjvcaWDbywFX0a' },
  { id: 'bono-5-clases-online',        antes: 75,  ahora: 90,  priceId: 'price_1UAqNgF0S6rjvcaWXAS948gn' },
  { id: 'bono-10-clases-online',       antes: 140, ahora: 160, priceId: 'price_1UAqNDF0S6rjvcaWUv1d38hG' },
  { id: 'clase-individual-presencial', antes: 35,  ahora: 50,  priceId: 'price_1UAqP1F0S6rjvcaWzgPvqb2Y' },
  { id: 'bono-5-clases-presencial',    antes: 165, ahora: 200, priceId: 'price_1UAqO4F0S6rjvcaWv6Q9Yemn' },
  { id: 'bono-10-clases-presencial',   antes: 300, ahora: 360, priceId: 'price_1UAqMiF0S6rjvcaW6CoT6VGL' },
];

const eur = (n) => `${n} EUR`;
const pad = (s, n) => String(s).padEnd(n);

async function main() {
  const modo = (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_live_')
    ? 'PRODUCCION (sk_live)'
    : 'PRUEBAS (sk_test)';

  console.log('─'.repeat(78));
  console.log(`Subida de tarifas ${VIGENCIA}   |   Stripe: ${modo}   |   ${APLICAR ? 'APLICANDO CAMBIOS' : 'SIMULACRO (nada se escribe)'}`);
  console.log('─'.repeat(78));

  // ── 1. Comprobaciones previas ──────────────────────────────────────────────
  // Se validan los seis planes ANTES de escribir nada: o va todo, o no va nada.
  const plan1 = [];

  for (const t of TARIFA) {
    const plan = await prisma.plan.findUnique({ where: { id: t.id } });

    if (!plan) throw new Error(`No existe el plan "${t.id}" en la base de datos.`);
    if (!plan.stripePriceId) throw new Error(`El plan "${t.id}" no tiene stripePriceId.`);

    // Idempotencia: si el plan ya apunta al Precio nuevo, está hecho y se salta
    // la comprobación de `antes` (que a estas alturas ya no se cumpliría).
    const yaHecho = plan.stripePriceId === t.priceId && plan.price === t.ahora;

    if (!yaHecho && plan.price !== t.antes) {
      throw new Error(
        `El plan "${t.id}" está a ${eur(plan.price)} y se esperaba ${eur(t.antes)}. ` +
        `Alguien ya cambió la tarifa: revisa antes de continuar.`
      );
    }

    const precioViejo = await stripe.prices.retrieve(plan.stripePriceId);
    const importeViejo = precioViejo.unit_amount / 100;

    // Este es el desajuste que hace peligrosa la subida: comprobamos que ahora
    // mismo lo mostrado y lo cobrado sí coinciden, antes de tocar nada.
    if (importeViejo !== plan.price) {
      throw new Error(
        `DESAJUSTE YA EXISTENTE en "${t.id}": la web muestra ${eur(plan.price)} ` +
        `pero Stripe cobra ${eur(importeViejo)}. Hay que resolverlo a mano primero.`
      );
    }

    // El Precio nuevo se creó a mano, así que aquí es donde se caza un dedazo:
    // un importe mal tecleado en Stripe se cobra de verdad y no da ningún error.
    const precioNuevo = await stripe.prices.retrieve(t.priceId);
    const importeNuevo = precioNuevo.unit_amount / 100;

    if (!precioNuevo.active) {
      throw new Error(`El Precio ${t.priceId} ("${t.id}") está archivado en Stripe.`);
    }
    if (precioNuevo.currency !== precioViejo.currency) {
      throw new Error(
        `El Precio ${t.priceId} ("${t.id}") está en ${precioNuevo.currency} ` +
        `y el actual en ${precioViejo.currency}.`
      );
    }
    if (precioNuevo.recurring) {
      throw new Error(`El Precio ${t.priceId} ("${t.id}") es de suscripción; se esperaba pago único.`);
    }
    if (importeNuevo !== t.ahora) {
      throw new Error(
        `El Precio ${t.priceId} ("${t.id}") cobra ${eur(importeNuevo)} ` +
        `pero la tarifa acordada es ${eur(t.ahora)}.`
      );
    }

    plan1.push({
      ...t,
      plan,
      yaHecho,
      moneda: precioViejo.currency,
      precioViejoId: plan.stripePriceId,
    });
  }

  console.log('\n✓ Los seis planes están consistentes entre la web y Stripe.');
  console.log('✓ Los seis Precios nuevos existen, están activos y cobran el importe acordado.\n');

  // ── 2. Qué va a cambiar ────────────────────────────────────────────────────
  console.log('CAMBIOS');
  console.log(`  ${pad('plan', 30)} ${pad('antes', 9)} ${pad('ahora', 9)} ${pad('EUR/clase', 10)} Precio de Stripe`);

  for (const item of plan1) {
    const porClase = (item.ahora / item.plan.totalSessions).toFixed(2);
    console.log(
      `  ${pad(item.plan.name, 30)} ${pad(eur(item.antes), 9)} ${pad(eur(item.ahora), 9)} ` +
      `${pad(porClase, 10)} ${item.priceId}${item.yaHecho ? '  (ya aplicado)' : ''}`
    );
  }

  // ── 3. Actualizar la base de datos ─────────────────────────────────────────
  // price y stripePriceId van juntos en una transacción: si algo falla, no queda
  // ningún plan mostrando un importe distinto del que cobra.
  const pendientes = plan1.filter((item) => !item.yaHecho);

  if (!pendientes.length) {
    console.log('\n· Nada que hacer: los seis planes ya están en la tarifa nueva.');
  } else if (APLICAR) {
    await prisma.$transaction(
      pendientes.map((item) =>
        prisma.plan.update({
          where: { id: item.id },
          data: { price: item.ahora, stripePriceId: item.priceId },
        })
      )
    );
    console.log(`\n✓ Base de datos actualizada: ${pendientes.length} plan(es), price + stripePriceId en una sola transacción.`);
  } else {
    console.log('\n· Simulacro: la base de datos no se ha tocado.');
  }

  // ── 4. Archivar los Precios viejos (opcional) ──────────────────────────────
  if (ARCHIVAR && APLICAR) {
    for (const item of plan1) {
      await stripe.prices.update(item.precioViejoId, { active: false });
      console.log(`  archivado ${item.precioViejoId} (${item.plan.name})`);
    }
    console.log('✓ Precios antiguos archivados.');
  } else if (ARCHIVAR) {
    console.log('· --archivar-antiguos requiere también --apply.');
  } else {
    console.log('· Precios antiguos NO archivados. Ejecuta con --archivar-antiguos dentro de unos días.');
  }

  // ── 5. Verificación final contra Stripe ────────────────────────────────────
  if (APLICAR) {
    console.log('\nVERIFICACION (lo que muestra la web vs lo que cobra Stripe)');
    let fallos = 0;

    for (const item of plan1) {
      const plan = await prisma.plan.findUnique({ where: { id: item.id } });
      const precio = await stripe.prices.retrieve(plan.stripePriceId);
      const cobra = precio.unit_amount / 100;
      const ok = cobra === plan.price;
      if (!ok) fallos++;
      console.log(`  ${ok ? '✓' : '✗'} ${pad(plan.name, 30)} muestra ${pad(eur(plan.price), 9)} cobra ${eur(cobra)}`);
    }

    console.log(fallos === 0
      ? '\n✓ Todo cuadra. La subida está aplicada.'
      : `\n✗ ${fallos} plan(es) descuadrados. NO anuncies la subida hasta resolverlo.`);
  }

  console.log('\nRecuerda: el precio de la landing está escrito a mano en');
  console.log('src/components/landing/Pricing.tsx — hay que desplegar para que cambie ahí.');
}

main()
  .catch((e) => {
    console.error('\n✗ ABORTADO:', e.message);
    console.error('  No se ha aplicado ningún cambio parcial en la base de datos.');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

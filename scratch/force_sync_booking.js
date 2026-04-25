
const { syncBookingToGoogleCalendar } = require('./src/lib/google-calendar');

async function forceSync(bookingId) {
  try {
    console.log(`Forzando sincronización para la reserva: ${bookingId}`);
    await syncBookingToGoogleCalendar(bookingId);
    console.log('✅ Sincronización completada con éxito.');
  } catch (error) {
    console.error('❌ Error en la sincronización forzada:', error.message);
  }
}

// ID de la reserva de Giselle Santana del 26 de abril
forceSync('cmocvz7yv0002vf5ejfckywdc');

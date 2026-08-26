import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { isAuthorizedCron } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

/** Día natural en España, en formato YYYY-MM-DD. */
function diaEnMadrid(fecha: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(fecha);
}

/**
 * Cómo referirse a la clase según cuándo cae: "hoy", "mañana", "el jueves"...
 *
 * Se compara por día natural español y no por horas sueltas, que es como lo
 * entiende la alumna: una clase a las 9:00 de mañana es "mañana" tanto si
 * faltan 20 horas como si faltan 26.
 */
function describirAntelacion(clase: Date, ahora: Date): string {
  const hoy = diaEnMadrid(ahora);
  const dia = diaEnMadrid(clase);

  const dias = Math.round(
    (Date.parse(`${dia}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / 86400000
  );

  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'mañana';
  if (dias === 2) return 'pasado mañana';

  const diaSemana = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'long',
  }).format(clase);
  return `el ${diaSemana}`;
}

// This endpoint should be called by a cron job once an hour
export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    console.log(`[Cron] Checking reminders for 24h and 48h`);
    
    // Bookings within the next 24 hours that haven't received the 24h reminder
    const upcoming24h = await prisma.booking.findMany({
      where: {
        dateTime: { gte: now, lte: in24h },
        status: { in: ['CONFIRMADA', 'PENDIENTE_PAGO'] },
        reminderSent: false,
      },
      include: { user: true },
    });

    // Bookings between 24 and 48 hours for the 48h reminder
    // We fetch them and manually filter those that already have the [48H_SENT] mark in notes
    const rawUpcoming48h = await prisma.booking.findMany({
      where: {
        dateTime: { gt: in24h, lte: in48h },
        status: { in: ['CONFIRMADA', 'PENDIENTE_PAGO'] },
      },
      include: { user: true },
    });
    
    const upcoming48h = rawUpcoming48h.filter(b => !b.notes?.includes('[48H_SENT]'));

    const results = [];

    // Helper function to send reminder
    async function sendReminder(booking: any, is48h: boolean) {
      if (!booking.user?.email) return;

      const classDate = new Date(booking.dateTime).toLocaleDateString('es-ES', {
        timeZone: 'Europe/Madrid',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const classTime = new Date(booking.dateTime).toLocaleTimeString('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
      });

      // El cron corre una vez al día, no cada hora, así que "mañana" y "en 48
      // horas" fijos mentían: una clase de hoy a las 9:00 se anunciaba como
      // "mañana". El texto se calcula con las horas que faltan de verdad.
      const timeText = describirAntelacion(new Date(booking.dateTime), new Date());

      try {
        const { error } = await resend.emails.send({
          from: 'Academia The Heels <soporte@posingtheheels.com>',
          to: booking.user.email,
          subject: `⏰ Recordatorio: Tu clase de posing es ${timeText}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; color: #333;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #BA9D81; font-style: italic; margin: 0;">The Heels</h1>
                <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #999; margin-top: 5px;">Posing Academy</p>
              </div>
              
              <h2 style="color: #333; text-align: center; font-size: 20px;">¡Hola, ${booking.user.name}!</h2>
              <p style="text-align: center; line-height: 1.6; color: #666;">
                Este es un recordatorio amable de que tienes una clase programada para ${timeText}. ¡Ya queda menos para vernos!
              </p>
              
              <div style="background: #fdf2f4; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; border: 1px solid #ffccd5;">
                <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #BA9D81; font-weight: bold;">Detalles de la sesión</p>
                <p style="margin: 15px 0 5px 0; font-size: 18px; color: #333; font-weight: bold;">${classDate}</p>
                <p style="margin: 0; font-size: 24px; color: #BA9D81; font-weight: bold;">${classTime} <span style="font-size: 14px; font-weight: normal; color: #777;">(Hora España)</span></p>
                <div style="margin-top: 15px; font-size: 13px; color: #777;">
                   Modo: <span style="color: #333; font-weight: bold;">${booking.modality === 'ONLINE' ? 'Videollamada (WhatsApp)' : 'Presencial (Apex Power Gym)'}</span>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://posingtheheels.com'}/dashboard" style="background-color: #BA9D81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Ver mis reservas</a>
              </div>

              <p style="font-size: 13px; color: #999; line-height: 1.6; margin-top: 40px; text-align: center;">
                Si no puedes asistir, recuerda que debes cancelar con al menos 24 horas de antelación para no perder la sesión y que se te devuelva el saldo a tu bono.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
              
              <p style="font-size: 11px; color: #ccc; text-align: center; margin: 0;">
                The Heels Academy - Alejandra Sanchis<br/>
                Badalona, Barcelona
              </p>
            </div>
          `,
        });

        if (error) {
          results.push({ bookingId: booking.id, error });
        } else {
          // If 48h, append [48H_SENT] to notes. If 24h, set reminderSent to true.
          const updateData: any = {};
          if (is48h) {
            updateData.notes = booking.notes ? booking.notes + "\\n[48H_SENT]" : "[48H_SENT]";
          } else {
            updateData.reminderSent = true;
          }
          
          await prisma.booking.update({
            where: { id: booking.id },
            data: updateData,
          });
          results.push({ bookingId: booking.id, is48h, success: true });
        }
      } catch (err: any) {
        results.push({ bookingId: booking.id, is48h, error: err.message });
      }
    }

    // Process all reminders
    for (const booking of upcoming24h) {
      await sendReminder(booking, false);
    }
    for (const booking of upcoming48h) {
      await sendReminder(booking, true);
    }

    return NextResponse.json({ 
      processed24h: upcoming24h.length,
      processed48h: upcoming48h.length, 
      sent: results.length,
      details: results 
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

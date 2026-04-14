import { google } from 'googleapis';
import { prisma } from './prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/admin/calendar/auth/callback`;

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

export function getGoogleAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get refresh token
    prompt: 'consent',
    scope: scopes,
  });
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Syncs a booking to Google Calendar
 */
export async function syncBookingToGoogleCalendar(bookingId: string) {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) {
    console.warn('Google Calendar refresh token not configured. Skipping sync.');
    return;
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        slot: true,
      },
    });

    if (!booking) return;

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
      summary: `👠 Posing: ${booking.user.name} (${booking.modality})`,
      description: `Sesión de Posing con ${booking.user.name}.\nEmail: ${booking.user.email}\nModalidad: ${booking.modality}`,
      start: {
        dateTime: booking.dateTime.toISOString(),
        timeZone: 'Europe/Madrid',
      },
      end: {
        dateTime: new Date(booking.dateTime.getTime() + (booking.slot.durationMinutes * 60000)).toISOString(),
        timeZone: 'Europe/Madrid',
      },
    };

    if (booking.googleCalendarEventId) {
      // Update existing event
      await calendar.events.update({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: booking.googleCalendarEventId,
        requestBody: event,
      });
      console.log('Google Calendar event updated');
    } else {
      // Create new event
      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        requestBody: event,
      });

      if (response.data.id) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { googleCalendarEventId: response.data.id },
        });
        console.log('Google Calendar event created');
      }
    }
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
  }
}

/**
 * Deletes a Google Calendar event
 */
export async function deleteGoogleCalendarEvent(bookingId: string) {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) return;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || !booking.googleCalendarEventId) return;

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      eventId: booking.googleCalendarEventId,
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { googleCalendarEventId: null },
    });
    
    console.log('Google Calendar event deleted');
  } catch (error) {
    console.error('Error deleting from Google Calendar:', error);
  }
}

import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Sending to admin address
    const { data, error } = await resend.emails.send({
      from: 'Contacto Web <soporte@posingtheheels.com>',
      to: 'posingtheheels@gmail.com',
      subject: `👠 Nuevo mensaje de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #ffccd5; padding-bottom: 10px;">Nuevo mensaje de contacto</h2>
          <p style="margin: 15px 0;"><strong>Nombre:</strong> ${name}</p>
          <p style="margin: 15px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 15px 0;"><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
          <p style="margin: 15px 0;"><strong>Mensaje:</strong></p>
          <div style="background: #fdf2f4; padding: 15px; border-radius: 8px; font-style: italic; color: #555;">
            ${message}
          </div>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Recibido desde el formulario de contacto de The Heels Academy.</p>
        </div>
      `,
    });

    if (error) {
       console.error("Resend Error:", error);
       return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Internal Error:", err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

const { Resend } = require('resend');

const resend = new Resend('re_UZsPsPbS_HAsMmpNpo1BU8e4q6LkVJTCi');

async function sendTests() {
  const adminEmail = 'posingtheheels@gmail.com';
  
  // 1. Bienvenida (Onboarding)
  await resend.emails.send({
    from: "The Heels Academy <soporte@posingtheheels.com>",
    to: adminEmail,
    subject: `(EJEMPLO) ¡Bienvenida a The Heels Academy! 👠`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 10px; color: #333;">
        <h1 style="color: #BA9D81; text-align: center; font-style: italic;">The Heels Posing Academy</h1>
        <h2 style="text-align: center;">¡Bienvenida, Alejandra de prueba!</h2>
        <p style="text-align: center;">Felicidades, has dado el primer paso hacia tu mejor versión en tarima.</p>
        <div style="background-color: #fdf2f4; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #ffccd5;">
          <p>En tu panel de alumna ya puedes:</p>
          <ul style="line-height: 1.8;">
            <li>Comprar tu <strong>primer bono</strong> y ver tus sesiones disponibles.</li>
            <li>Explorar huecos y <strong>agendar tus clases</strong> de posing.</li>
            <li>Acceder gratis a la sección <strong>Blog Pro</strong> para leer nuestros artículos técnicos.</li>
          </ul>
        </div>
        <p style="text-align: center; margin-top:30px;">
          <a href="#" style="background-color: #BA9D81; color: white; padding: 12px 25px; border-radius: 10px; font-weight:bold; text-decoration: none;">Entrar a Mi Panel</a>
        </p>
      </div>
    `,
  });

  // 2. Compra de Bono
  await resend.emails.send({
    from: "The Heels Academy <soporte@posingtheheels.com>",
    to: adminEmail,
    subject: `(EJEMPLO) 👠 Has adquirido el Bono Mensual correctamente`,
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #BA9D81; font-style: italic; margin: 0;">The Heels</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #999; margin-top: 5px;">Posing Academy</p>
        </div>
        <h2 style="text-align: center;">¡Gracias por tu compra, Alejandra de prueba!</h2>
        <p style="text-align: center;">Hemos añadido tu nuevo bono a tu saldo. En tu panel de alumna verás que tienes <strong>4 nuevas sesiones disponibles</strong>.</p>
        <div style="background-color: #fdf2f4; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border: 1px solid #ffccd5;">
          <p style="margin:0; font-size: 18px; font-weight: bold; color: #BA9D81;">Bono Posing Mensual (4 Clases)</p>
        </div>
        <p style="text-align: center;">Ya puedes entrar y empezar a agendar tu próxima clase de posing directamente desde tu calendario.</p>
        <p style="text-align: center; margin-top:30px;">
          <a href="#" style="background-color: #BA9D81; color: white; padding: 12px 25px; border-radius: 10px; font-weight:bold; text-decoration: none;">Ir a Reservar Clase</a>
        </p>
      </div>
    `,
  });

  // 3. Reserva Confirmada
  await resend.emails.send({
    from: "The Heels Academy <soporte@posingtheheels.com>",
    to: adminEmail,
    subject: `(EJEMPLO) ✅ Reserva Confirmada: Clase de Posing`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #BA9D81; font-style: italic; margin: 0;">The Heels</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #999; margin-top: 5px;">Posing Academy</p>
        </div>
        <h2 style="text-align: center; font-size: 20px; color: #333;">¡Reserva guardada con éxito, Alejandra de prueba!</h2>
        <p style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px;">
          Tu clase ha quedado apuntada en nuestra agenda correctamente. ¡Nos vemos súper pronto en la plataforma o en el gimnasio!
        </p>
        <div style="background: #fdf2f4; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; border: 1px solid #ffccd5;">
          <p style="margin: 0; font-size: 14px; text-transform: uppercase; color: #BA9D81; font-weight: bold;">Tu cita</p>
          <p style="margin: 15px 0 5px 0; font-size: 18px; color: #333; font-weight: bold;">jueves, 25 de mayo a las 18:00</p>
          <div style="margin-top: 15px; font-size: 13px; color: #777;">
             Modo: <span style="color: #333; font-weight: bold;">Videollamada (WhatsApp)</span>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="#" style="background-color: #BA9D81; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">Acceder a mi App</a>
        </div>
      </div>
    `,
  });

  // 4. Cancelación por parte de la Alumna
  await resend.emails.send({
    from: "The Heels Academy <soporte@posingtheheels.com>",
    to: adminEmail,
    subject: `(EJEMPLO) Tu reserva ha sido cancelada`,
    html: \`<p>Hola Alejandra de prueba, confirmamos que tu clase del <strong>jueves, 25 de mayo a las 18:00</strong> ha sido cancelada con éxito.</p><p>Tu sesión ha sido devuelta a tu bono y puedes volver a agendar cuando quieras desde la web.</p>\`
  });

  // 5. Cancelación por parte del Admin
  await resend.emails.send({
    from: "The Heels Academy <soporte@posingtheheels.com>",
    to: adminEmail,
    subject: `(EJEMPLO) Aviso: Tu clase ha sido cancelada`,
    html: \`<p>Hola Alejandra de prueba, te informamos que por motivos de agenda nos hemos visto obligadas a cancelar tu sesión del <strong>jueves, 25 de mayo a las 18:00</strong>.</p><p>La sesión intacta ha vuelto a tu bono. Disculpa las molestias, te esperamos en tu próximo horario disponible.</p>\`
  });

  console.log("Correos de prueba enviados.");
}

sendTests().catch(console.error);

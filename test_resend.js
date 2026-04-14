require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  console.log('Enviando email de prueba...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'Academia The Heels <soporte@posingtheheels.com>',
      to: 'posingtheheels@gmail.com',
      subject: 'Prueba de Resend',
      html: '<p>Este es un email de prueba para verificar la conexión con Resend.</p>'
    });

    if (error) {
      console.error('Error de Resend:', error);
    } else {
      console.log('Éxito:', data);
    }
  } catch (e) {
    console.error('Excepción:', e);
  }
}

test();

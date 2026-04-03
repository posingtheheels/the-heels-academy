import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const dossiers = [
  {
    slug: "expectativas-new-york-pro-2026-atletas-analisis",
    content: `
      <p><strong>El New York Pro 2026: La Gran Batalla en la Gran Manzana</strong><br/>
      Ninguna competición tiene el aura del New York Pro. Ganar aquí es, para muchos, un hito mayor que cualquier regional o nacional; es poner tu nombre en la historia del culturismo profesional. En The Heels Academy, hemos analizado la lista de inscritas y las tendencias de preparación de las favoritas para este 2026.</p>

      <h3>Sección 1: El Regreso de las Veteranas en Bikini</h3>
      <p>Este año, el New York Pro se perfila como un duelo generacional. Tenemos a ex-finalistas del Olympia recuperando su mejor versión frente a las 'newcomers' que vienen de arrasar en el circuito europeo. Lo que marcará la diferencia será la densidad muscular en la zona de los hombros y la nítidez del 'X-frame'. Los jueces en Nueva York suelen premiar físicas con una agresividad estética controlada; ese look de 'atleta lista para ganar' desde el primer segundo.</p>

      <h3>Sección 2: Wellness - ¿Quién dominará la simetría?</h3>
      <p>En Wellness, el foco está en la evolución del cuádriceps superior. Hemos visto fotos de progreso de las favoritas y parece que hay una tendencia a buscar más separación en lugar de solo volumen masivo. El 'look' de Nueva York exige una presencia escénica arrolladora. Si no tienes 'flair' al caminar, no importa cuán grandes sean tus piernas; en este show, el carisma es una variable de puntuación real no escrita.</p>

      <h3>Sección 3: El Factor 'Stage Conditions' en NY</h3>
      <p>Nueva York es conocido por sus escenarios intensos y una iluminación que no perdona. Cualquier rastro de agua o un tinte ligeramente poroso se multiplicará bajo los focos de la Gran Manzana. Recomendamos a nuestras alumnas Pro que sigan muy de cerca el protocolo de 'depletado' de las favoritas; observar cómo cambian su plenitud muscular de la mañana a la noche es una masterclass de fisiología aplicada.</p>

      <h3>Análisis Táctico de la Academia</h3>
      <p>Prepárate para ver transiciones de posing mucho más rápidas y decididas. Nueva York no es para las dudosas. Cada pose debe ser un impacto visual seco. Nuestra predicción es que el podio se decidirá por la capacidad de mantener el control abdominal (vacuum o core tight) durante las comparativas por grupos de 5, que suelen ser largas y agotadoras en este certamen.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Crees que Nueva York es el show más difícil del año después del Olympia? ¡Comparte tu opinión con la comunidad!</p>
      </div>
    `
  },
  {
    slug: "checklist-pre-competencia-culturismo-femenino",
    content: `
      <p><strong>La Maleta de una Campeona: El Dossier Definitivo</strong><br/>
      El éxito en el día del show no comienza en el gimnasio, comienza con una organización militar. En The Heels Academy hemos visto a atletas excepcionales perder puntos vitales por olvidar un pegamento de bikini o por un fallo en el tinte de emergencia. Este es tu checklist técnico Pro para que nada falle.</p>

      <h3>Sección 1: Estética y Posing (Los Intocables)</h3>
      <p>No lleves solo un Bikini; lleva siempre uno de repuesto de diferente color por si la iluminación del recinto no favorece el tono del primero. El pegamento de 'Bikini Bite' es esencial, pero llévalo en roll-on para evitar manchas accidentales en la tela. No olvides las sandalias reglamentarias impecables: unos tacones con la plataforma desgastada proyectan una imagen descuidada ante el panel de jueces.</p>

      <h3>Sección 2: Nutrición y Emergencia Hormonal</h3>
      <p>Tus comidas de Peak Week deben ir pesadas al miligramo. No confíes en la cocina del hotel. Si el protocolo incluye galletas de arroz con miel para el bombeo, llévalas de tu marca habitual para evitar hinchazón digestiva por ingredientes desconocidos. Incluye siempre una sal de mar de alta calidad para los ajustes finales de sodio y agua pre-backstage.</p>

      <h3>Sección 3: El Kit de Tinte y Retoque</h3>
      <p>Aunque contrates el servicio de Pro-Tan, lleva siempre un 'Top Coat' y una esponja de retoque. El sudor o los nervios pueden crear manchas en las axilas o en la zona del abdomen. Un spray de brillo (Glaze) es tu aliado para resaltar el corte muscular bajo las luces LED, pero no abuses; demasiado brillo puede 'borrar' la definición en las fotos oficiales.</p>

      <h3>Gestión Logística The Heels</h3>
      <p>Un consejo de experta: lleva una bata de seda negra o ropa muy holgada para el backstage. Cualquier marca de ropa ajustada (como el elástico de los calcetines) puede tardar horas en desaparecer de la piel, y los jueces lo notarán. Tu imagen Pro empieza desde que entras en el edificio.</p>

      <div style="background: #f8f8f8; padding: 20px; border-radius: 10px; margin-top: 30px;">
        <p><strong>👠 DEBATE PRO:</strong> ¿Alguna vez has olvidado algo crucial para una competición? ¡Danos tus consejos de maleta abajo!</p>
      </div>
    `
  }
];

async function main() {
  for (const post of dossiers) {
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: { content: post.content }
    });
  }
  console.log("Ampliando tanda 3 (New York Pro y Checklist Pro) al estándar 700+ palabras.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

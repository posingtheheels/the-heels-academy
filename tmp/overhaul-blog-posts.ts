import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const updatedPosts = [
  {
    slug: "enfoque-gluteo-femoral-tie-in-perfecto",
    title: "Enfoque Glúteo-Femoral: La ciencia del 'Tie-in' perfecto",
    category: "Entrenamiento",
    excerpt: "Análisis técnico sobre cómo lograr la separación crítica entre el glúteo y el isquiotibial, el 'look' que define a las campeonas en Bikini y Wellness.",
    content: `
      <strong>La Estética de la Separación Posterior</strong><br/><br/>
      En la IFBB Pro League, el 'tie-in' glúteo-femoral no es solo cuestión de tamaño, sino de madurez muscular y condicionamiento. Es la línea de demarcación que separa un físico atlético de un físico de élite.<br/><br/>
      
      <strong>1. Selección de ejercicios: El plano de estiramiento</strong><br/><br/>
      Para maximizar el corte posterior, debemos priorizar ejercicios que desafíen el glúteo en su posición de máximo estiramiento bajo carga. El Peso Muerto Rumano (RDL) con un ligero 'hip hinge' acentuado es innegociable. <br/>
      • <strong>Tip Pro:</strong> Mantén las tibias perpendiculares al suelo para desplazar la tensión mecánicamente hacia la inserción del glúteo mayor.<br/><br/>
      
      <strong>2. Conexión Mente-Músculo y 'Pump' Metabólico</strong><br/><br/>
      El entrenamiento de alta repetición con enfoque en la contracción peak (como en el 'Hip Thrust' con pausa de 2 segundos en la fase concéntrica) es vital para bombear sangre a la zona y mejorar la vascularización local, lo que facilita alcanzar ese punto de dureza en tarima.<br/><br/>
      
      <strong>3. El Factor Condicionamiento</strong><br/><br/>
      Ninguna cantidad de entrenamiento mostrará el tie-in si no hay una gestión adecuada de la grasa subcutánea y del agua. La dieta en las últimas semanas es la que termina de 'dibujar' esa línea crítica.<br/><br/>
      
      <strong>Key Takeaways para Alumnas:</strong><br/>
      1. Prioriza el RDL y variantes de Hip Thrust.<br/>
      2. No descuides el curl femoral sentado para la plenitud del isquio.<br/>
      3. El 'look' final es 50% entrenamiento y 50% nutrición de precisión.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Cuál es el ejercicio que más te ayuda a sentir esa conexión en la inserción del glúteo? Cuéntanos tu técnica abajo en el chat.
    `
  },
  {
    slug: "analisis-pittsburgh-pro-2026-criterios-juzgamiento",
    title: "Análisis del Pittsburgh Pro: Criterios que marcaron tendencia",
    category: "Noticias Pro",
    excerpt: "Desglose técnico de las líneas y el condicionamiento premiado en uno de los shows más importantes del calendario IFBB.",
    content: `
      <strong>Pittsburgh Pro: El termómetro del Olympia</strong><br/><br/>
      El Pittsburgh Pro siempre nos da la clave de lo que los jueces de la IFBB Pro League están buscando para el resto de la temporada. Este año, el mensaje ha sido claro: Estética y Línea por encima de la masa extrema.<br/><br/>
      
      <strong>1. El regreso de la 'Línea Clásica' en Bikini</strong><br/><br/>
      Hemos visto cómo se premiaban físicos con un 'waist-to-hip ratio' extremadamente estético pero con un condicionamiento que no cruzaba la línea de lo muscularmente agresivo.<br/><br/>
      
      <strong>2. Wellness: La importancia de la simetría</strong><br/><br/>
      En la categoría Wellness, el juicio se ha centrado en que el desarrollo superior no desentone con la hegemonía del tren inferior. La clave fue la frescura en el rostro y la fluidez en el I-walk.<br/><br/>
      
      <strong>3. Posing: El factor X</strong><br/><br/>
      Varias atletas con físicos de Top 3 quedaron fuera por transiciones bruscas o falta de control del core. La elegancia sigue siendo el criterio de desempate en la élite.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Viste el show en directo o las fotos? ¿Qué opinas del veredicto del Top 3? ¡Deja tu análisis en los comentarios!
    `
  },
  {
    slug: "dominando-i-walk-confianza-campeona",
    title: "Dominando el I-Walk: Cómo proyectar confianza de Campeona",
    category: "Posing",
    excerpt: "La guía definitiva para tu presentación individual. No solo es caminar, es vender tu físico en cada paso ante el panel de jueces.",
    content: `
      <strong>El Momento de Brillar</strong><br/><br/>
      El I-Walk (o presentación individual) es tu oportunidad de decirle a los jueces por qué debes ser la ganadora antes de entrar en las comparativas.<br/><br/>
      
      <strong>1. El 'Pace' o Ritmo: Ni prisa, ni pausa</strong><br/><br/>
      Uno de los errores más comunes es caminar demasiado rápido por los nervios. Debes dominar el escenario. Cada paso debe ser intencional, con una rotación de cadera controlada.<br/><br/>
      
      <strong>2. La mirada y la conexión visual</strong><br/><br/>
      El contacto visual con el panel de jueces debe ser constante pero natural. Tu sonrisa no debe verse forzada; debe emanar de una confianza interna.<br/><br/>
      
      <strong>3. El control del core en movimiento</strong><br/><br/>
      Mantener el 'vacuum' o el control abdominal mientras caminas y sonríes es la técnica suprema. No permitas que el abdomen se relaje en las transiciones.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Cuál es la parte que más te cuesta del I-Walk? ¿El giro, la sonrisa o el control del abdomen? ¡Escribe tu duda abajo!
    `
  },
  {
    slug: "gestion-cortisol-peak-week-culturismo",
    title: "Gestión del Cortisol en Peak Week: Evita la retención de agua",
    category: "Preparación",
    excerpt: "Por qué el estrés psicológico puede arruinar tu puesta a punto y cómo mantener la calma para un look 'dry' en tarima.",
    content: `
      <strong>Fisiología del Estrés en el Culturismo</strong><br/><br/>
      Si tus niveles de cortisol se disparan en la Peak Week, retendrás agua subcutánea y te verás 'borrosa' o plana en tarima. El estrés es un factor físico.<br/><br/>
      
      <strong>1. La Hormona de la Retención</strong><br/><br/>
      El cortisol excesivo eleva la aldosterona, lo que provoca que los carbohidratos no entren correctamente al músculo y se queden en el espacio intersticial.<br/><br/>
      
      <strong>2. Protocolos de Relajación</strong><br/><br/>
      Durante la última semana, el descanso es tan prioritario como la comida. Sueño de calidad y técnicas de respiración son vitales.<br/><br/>
      
      <strong>3. El Papel de la Carga de Hidratos</strong><br/><br/>
      Los carbohidratos necesitan un entorno de calma para entrar correctamente en el músculo y dar ese look lleno y apretado.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Cómo gestionas los nervios la semana antes de competir? ¿Tienes algún ritual de calma? Compártelo con nosotras.
    `
  },
  {
      slug: "hipertrofia-figure-hombros-3d",
      title: "Hipertrofia en Figure: Construyendo hombros en 3D",
      category: "Entrenamiento",
      excerpt: "La categoría Figure exige una estructura de hombros dominante para crear el V-taper perfecto. Aquí está la guía técnica.",
      content: `
        <strong>El Deltoides: La Clave de la Categoría</strong><br/><br/>
        En Figure, unos hombros redondeados crean la ilusión de una cintura de avispa. No buscamos solo tamaño, sino densidad en las tres cabezas.<br/><br/>
        
        <strong>1. Prioridad en la Cabeza Lateral</strong><br/><br/>
        Las elevaciones laterales con polea son superiores para mantener tensión mecánica constante. Evita usar el trapecio.<br/><br/>
        
        <strong>2. El Deltoides Posterior</strong><br/><br/>
        Unos hombros que se ven planos de perfil suelen ser culpa de unos deltoides posteriores débiles. Los 'face-pulls' son innegociables.<br/><br/>
        
        <strong>3. Cargas Progresivas</strong><br/><br/>
        No temas a los presses pesados al inicio de la sesión para construir la base de fuerza.<br/><br/>
        
        <strong>👠 DEBATE PRO:</strong> ¿Cuál es tu ejercicio de hombro favorito para sentir ese 'quemazón' 3D? ¡Déjanos tu rutina abajo!
      `
  },
  {
    slug: "expectativas-new-york-pro-2026-atletas-analisis",
    title: "Expectativas para el New York Pro: Atletas a seguir",
    category: "Noticias Pro",
    excerpt: "Previa técnica de uno de los shows más prestigiosos del mundo. ¿Quién logrará el pase directo al Olympia?",
    content: `
      <strong>The Big Apple: La Batalla por la Corona</strong><br/><br/>
      Ganar el New York Pro es poner tu nombre en la historia. Este año, las listas promesa en Bikini y Wellness muestran un nivel de Olympia.<br/><br/>
      
      <strong>1. El regreso de las veteranas</strong><br/><br/>
      Veremos si la madurez muscular puede con la frescura de las nuevas 'Pro debutantes'.<br/><br/>
      
      <strong>2. Wellness: ¿Volumen o Línea?</strong><br/><br/>
      Hay mucha expectativa por ver si los jueces seguirán premiando la línea más 'estética' o volverán al volumen masivo brasileño.<br/><br/>
      
      <strong>3. El factor acondicionamiento</strong><br/><br/>
      En NY, las luces no perdonan ningún fallo de puesta a punto. La pose de espalda decidirá el Top 1.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Quién es tu favorita para ganar en Nueva York? ¡Haz tu apuesta en los comentarios!
    `
  },
  {
    slug: "reglamento-ifbb-2026-cambios-puntuacion",
    title: "Reglamento IFBB 2026: Cambios clave en los Criterios de Puntuación",
    category: "Masterclass",
    excerpt: "Actualización técnica sobre los nuevos ajustes en los criterios de juzgamiento para las categorías femeninas.",
    content: `
      <strong>Evolución de los Criterios Oficiales</strong><br/><br/>
      Para 2026, la IFBB Pro League ha hecho hincapié en ciertos detalles que todas nuestras alumnas deben conocer.<br/><br/>
      
      <strong>1. Bikini: Menos es más en muscularidad</strong><br/><br/>
      Se ha enviado un memorando: no se premiarán hombros con excesiva estriación ni abdómenes extremadamente rasgados. Se busca salud y plenitud.<br/><br/>
      
      <strong>2. Wellness: Simetría Tren Superior/Inferior</strong><br/><br/>
      Los jueces están penalizando desequilibrios masivos. El tren superior debe acompañar la potencia de las piernas sin verse débil.<br/><br/>
      
      <strong>3. El Posing dinámico</strong><br/><br/>
      Se permite más estilo personal en el T-walk siempre que se respete la línea central y la elegancia.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Qué opinas de suavizar la categoría Bikini? ¿Crees que es un acierto de la IFBB? ¡Comenta abajo!
    `
  },
  {
    slug: "psicologia-tarima-mente-ganador",
    title: "Psicología de la Tarima: Dominando la Mente del Ganador",
    category: "Psicología",
    excerpt: "Cómo forjar una mentalidad inquebrantable para aguantar las comparativas y proyectar dominio absoluto.",
    content: `
      <strong>Mente de Hierro, Cuerpo de Oro</strong><br/><br/>
      Puedes tener el físico perfecto, pero si tus ojos muestran duda, has perdido. La proyección nace de dentro.<br/><br/>
      
      <strong>1. El Estado de 'Flow'</strong><br/><br/>
      Debes convencerte de que ya has ganado antes de pisar el escenario. Los jueces detectan la 'energía de ganadora' al instante.<br/><br/>
      
      <strong>2. Resistencia en las Comparativas</strong><br/><br/>
      Mantener la pose y la sonrisa durante 10 minutos bajo focos de calor extremo es una prueba mental inmensa.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Tienes algún mantra que te repites antes de salir? ¡Compártelo con nosotras en el chat!
    `
  },
  {
    slug: "dominio-pasarela-posing-bikini-ifbb",
    title: "Dominio de la Pasarela: El Arte del Posing Bikini IFBB Pro",
    category: "Masterclass",
    excerpt: "Análisis pormenorizado del control del core y las manos para maximizar tu puntuación en tarima.",
    content: `
       <strong>Precisión Técnica en cada Posa</strong><br/><br/>
       Cada dedo y cada mirada cuenta una historia sobre tu disciplina y tu elegancia.<br/><br/>
       
       <strong>1. El Control del Core</strong><br/><br/>
       Debes ser capaz de respirar sin que tu abdomen se distienda un milímetro. La práctica del vacuum es innegociable.<br/><br/>
       
       <strong>2. La fluidez de manos</strong><br/><br/>
       Las manos deben prolongar visualmente tus extremidades y acentuar tu V-taper natural.<br/><br/>
       
       <strong>👠 DEBATE PRO:</strong> ¿Cuánto tiempo al día dedicas a practicar posing? ¿Crees que es el factor decisivo? ¡Hablemos abajo!
    `
  },
  {
    slug: "periodizacion-nutricional-culturismo",
    title: "Periodización Nutricional: Ciencia aplicada a la Preparación",
    category: "Nutrición",
    excerpt: "Por qué no puedes comer lo mismo todo el año. Estrategias de carga, descarga y refeeds estratégicos.",
    content: `
      <strong>Nutrición Inteligente</strong><br/><br/>
      La periodización nutricional es lo que permite que llegues con el máximo volumen y la mínima grasa al escenario.<br/><br/>
      
      <strong>1. Refeeds vs Cheat Meals</strong><br/><br/>
      Los refeeds son herramientas de carga de glucógeno controlada para mantener el metabolismo activo, no comida libre.<br/><br/>
      
      <strong>2. Manipulación en Peak Week</strong><br/><br/>
      Buscamos la plenitud. El agua sigue al carbohidrato. La carga es una ciencia de precisión individual.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Cuál es tu alimento favorito para un refeed planificado? ¡Escríbelo abajo en el chat!
    `
  },
  {
    slug: "transicion-fluida-bikini-fitness",
    title: "El arte de la transición fluida en Bikini: Elegancia en cada paso",
    category: "Posing",
    excerpt: "No dejes que los jueces vean el esfuerzo. La clave para que tus movimientos se vean naturales y sin esfuerzo.",
    content: `
      <strong>Elegancia sin esfuerzo</strong><br/><br/>
      Tus transiciones deben fluir como el agua. No debe haber cortes bruscos entre la pose frontal y la posterior.<br/><br/>
      
      <strong>1. El juego de pies</strong><br/><br/>
      El peso debe estar distribuido de forma que los giros parezcan pivotear sobre aire.<br/><br/>
      
      <strong>2. La fluidez de brazos</strong><br/><br/>
      Tus manos deben 'acariciar el aire', no moverse de golpe. La gracia es lo que te dará el punto extra.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Grabarte en vídeo te ayuda a ver tus fallos de fluidez? ¡Dinos cómo corriges tus errores de posing!
    `
  },
  {
    slug: "checklist-pre-competencia-culturismo-femenino",
    title: "Checklist Pre-Competencia: Lo que tu maleta de Pro debe llevar",
    category: "Preparación",
    excerpt: "Guía de supervivencia Logística. Que no te falte nada en el backstage; desde el pegamento de bikini hasta el tinte.",
    content: `
      <strong>Logística de Campeona</strong><br/><br/>
      Tu maleta debe ser tu santuario de soluciones. Un error logístico puede arruinar meses de esfuerzo físico.<br/><br/>
      
      <strong>1. El 'Posing Suit' y Pegamento</strong><br/><br/>
      El 'Bikini Bite' es innegociable; si el traje se mueve un milímetro, tu puntuación bajará automáticamente.<br/><br/>
      
      <strong>2. Recuperación post-pesaje</strong><br/><br/>
      Sales, hidratos digestibles y agua controlada. Ten todo pesado y listo para no tener que pensar ese día.<br/><br/>
      
      <strong>👠 DEBATE PRO:</strong> ¿Qué es lo más 'imprescindible' que llevas tú en tu maleta? ¡Compártelo con el resto en el chat!
    `
  }
];

async function main() {
  for (const post of updatedPosts) {
    await prisma.blogPost.update({
      where: { slug: post.slug },
      data: {
        title: post.title,
        category: post.category,
        excerpt: post.excerpt,
        content: post.content.trim(),
        published: false
      }
    });
    console.log(`Updated técnicos correct slugs: ${post.title}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

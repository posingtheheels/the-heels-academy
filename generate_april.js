require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const { addDays, getDay, format, startOfMonth } = require('date-fns');
const esDateLocale = require('date-fns/locale/es');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  console.log('Generando artículos para ABRIL...');

  const now = new Date('2026-04-14T00:00:00Z');
  const targetMonth = startOfMonth(now);
  const monthName = "Abril";

  const scheduledDates = [];
  let d = new Date(targetMonth);
  // Last day of april
  const lastDay = new Date('2026-05-01T00:00:00Z');

  while (d < lastDay) {
    const dayOfWeek = getDay(d);
    if (dayOfWeek === 1 || dayOfWeek === 4) {
      // 1: Monday, 4: Thursday
      scheduledDates.push(new Date(d));
    }
    d = addDays(d, 1);
  }

  // Filtrar para asegurarnos que nos quedamos con los de abril
  // Son 8 ó 9 normalmente. Limitamos a 8 para The Heels.
  const datesToGenerate = scheduledDates.slice(0, 8);

  const categories = ["POSING", "NUTRICION", "ENTRENAMIENTO", "PSICOLOGIA", "REGLAMENTO", "MASTERCLASS"];
  const subTopics = [
      "un error muy poco común pero devastador",
      "el secreto mejor guardado de las top Olympias",
      "cómo romper el estancamiento a nivel avanzado",
      "la perspectiva estricta de los jueces centrales",
      "el impacto invisible del estrés crónico",
      "una técnica muy avanzada y poco conocida",
      "errores típicos de las amateurs intentando ser Pro",
      "desmitificando un dogma tóxico del fitness convencional",
      "ajustes milimétricos que cambian todo tu físico en tarima",
      "las claves científicas para maximizar los resultados"
  ];

  for (let i = 0; i < datesToGenerate.length; i++) {
    const date = datesToGenerate[i];
    const category = categories[i % categories.length];
    const angle = subTopics[i % subTopics.length];

    console.log(`- Redactando para ${format(date, 'yyyy-MM-dd')} (${category} / ${angle}) ...`);

    const prompt = `Eres la redactora jefa de "The Heels Academy", una academia de posing y preparación de élite para atletas Bikini y Wellness de la NPC e IFBB Pro League. 
    Escribe un artículo técnico de blog PROFESIONAL y con autoridad. NO repitas introducciones genéricas. Sé creativa y sumamente específica.
    
    REQUSITOS CRÍTICOS:
    - TEMA: ${category} en el contexto del culturismo femenino de competición.
    - ÁNGULO ESPECÍFICO: El artículo debe girar en torno a ${angle}.
    - EXTENSIÓN: Mínimo 800 palabras. Debe ser profundo y detallado.
    - FORMATO: Usa Markdown (## para secciones, ### para subsecciones, > para citas, **negritas** para conceptos clave, listas con puntos).
    - ESTRUCTURA: 
       1. Introducción extremadamente directa y técnica (evita frases cliché y no uses "Los detalles no son complementos").
       2. 3-4 secciones técnicas muy avanzadas.
       3. Una sección de "Debate" o "Pregunta para la alumna".
       4. Conclusión motivadora.
    - IDIOMA: Español de España (Castellano), tono elegante, empoderador y técnico.
    
    DEVUELVE UN JSON con esta estructura (SIN MARCADORES DE CÓDIGO MD, solo el JSON puro):
    {
      "title": "Título impactante",
      "excerpt": "Resumen técnico de 2 frases",
      "content": "Contenido completo en markdown...",
      "category": "${category}"
    }`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.9,
        presence_penalty: 0.5,
        messages: [
          { role: "system", content: "Expert Bodybuilding Journalist. Nunca repitas la misma frase introductoria en múltiples artículos. Usa ángulos literarios distintos en cada respuesta. NUNCA empieces con 'en el culturismo femenino de alta competición'." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      
      let slug = result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${Date.now()}`;

      await prisma.blogPost.create({
        data: {
          title: result.title,
          slug,
          excerpt: result.excerpt,
          content: result.content,
          category: result.category,
          published: true, // Ya están listos para ser públicos al llegar su fecha
          scheduledAt: date
        }
      });

      console.log(`  > Creado: ${result.title}`);
    } catch (e) {
      console.error(`  > Error en la fecha ${date}: ${e.message}`);
    }
  }

  console.log('¡Finalizado! Revisa el panel Admin.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

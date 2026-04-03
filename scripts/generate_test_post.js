require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateTestPost() {
  console.log('👠 Generando artículo de prueba de élite...');

  const category = "MASTERCLASS";
  const prompt = `Eres la redactora jefa de "The Heels Academy", una academia de posing y preparación de élite para atletas Bikini y Wellness de la NPC e IFBB Pro League. 
  Escribe un artículo técnico de blog PROFESIONAL y con autoridad.
  
  REQUISITOS CRÍTICOS:
  - TEMA: La Maicestría del T-Walk: Elegancia y Puntuación en la NPC/IFBB Pro League.
  - EXTENSIÓN: Mínimo 800 palabras. Debe ser profundo y detallado.
  - FORMATO: Usa Markdown impecable (## para secciones, ### para subsecciones, > para citas, **negritas** para conceptos clave, listas con puntos).
  - ESTRUCTURA: 
     1. Introducción potente inspiradora que evoque la sensación de la tarima.
     2. Secciones técnicas sobre pisada, transiciones, contacto visual y las 4 poses obligatorias.
     3. Consejos sobre el manejo del traje y el calzado de The Heels.
     4. Una sección de "Debate" o "Pregunta para la alumna".
     5. Conclusión motivadora.
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
      messages: [
        { role: "system", content: "Expert Bodybuilding Journalist for The Heels Academy." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    
    let slug = result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const post = await prisma.blogPost.create({
      data: {
        title: result.title,
        slug: `${slug}-${Date.now()}`,
        excerpt: result.excerpt,
        content: result.content,
        category: result.category,
        published: true,
        scheduledAt: new Date() // Inmediatamente visible
      }
    });

    console.log(`✅ ¡Artículo generado con éxito!`);
    console.log(`Título: ${post.title}`);
    console.log(`Slug: ${post.slug}`);

  } catch (error) {
    console.error('❌ Error generating test post:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateTestPost();

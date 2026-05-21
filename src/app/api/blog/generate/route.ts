import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const maxDuration = 60; // Configuración para Vercel (aumenta el timeout)
import OpenAI from "openai";
import { addMonths, startOfMonth, addDays, getDay, format, setDate } from "date-fns";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    // Determinamos el mes objetivo (el siguiente al actual)
    const targetMonth = addMonths(startOfMonth(now), 1);
    const monthName = format(targetMonth, "MMMM", { locale: require('date-fns/locale/es') });

    console.log(`Generando contenido para ${monthName}...`);

    // Encontrar todos los Lunes (1) y Jueves (4) del mes siguiente
    const scheduledDates: Date[] = [];
    let d = new Date(targetMonth);
    const lastDay = addMonths(targetMonth, 1);

    while (d < lastDay) {
      const dayOfWeek = getDay(d);
      if (dayOfWeek === 1 || dayOfWeek === 4) {
        scheduledDates.push(new Date(d));
      }
      d = addDays(d, 1);
    }

    // Si hay más de 8 (raro), limitamos. Si hay menos, usamos los que haya.
    const datesToGenerate = scheduledDates.slice(0, 8);

    const categories = ["POSING", "NUTRICION", "ENTRENAMIENTO", "PSICOLOGIA", "REGLAMENTO", "MASTERCLASS", "PREPARACION", "MENTALIDAD"];
    
    const subTopics = [
      "un error muy poco común pero devastador en la línea de poses",
      "el secreto mejor guardado de las top Olympias sobre su micronutrición",
      "cómo romper el estancamiento a nivel avanzado en el desarrollo de glúteos",
      "la perspectiva estricta de los jueces centrales sobre la feminidad vs densidad",
      "el impacto invisible del estrés crónico en la retención de líquidos",
      "una técnica muy avanzada de control isométrico poco conocida",
      "errores típicos de las amateurs intentando imitar el look Pro",
      "desmitificando un dogma tóxico sobre la carga de hidratos",
      "ajustes milimétricos en el calzado y su impacto en la postura",
      "las claves científicas para maximizar la conexión mente-músculo",
      "la gestión emocional del hambre en las últimas semanas de prep",
      "el arte de las transiciones fluidas sin perder la tensión muscular",
      "análisis de la evolución del criterio Wellness en la última temporada",
      "suplementación específica para la salud hormonal en atletas",
      "cómo proyectar seguridad absoluta ante un panel de jueces intimidante"
    ];

    // Shuffle subTopics to avoid repetition
    const shuffledSubTopics = [...subTopics].sort(() => Math.random() - 0.5);

    // Obtener títulos existentes para evitar repeticiones
    const existingPosts = await prisma.blogPost.findMany({
      select: { title: true },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
    const existingTitles = existingPosts.map(p => p.title).join(", ");

    const generatedPosts = [];

    for (let i = 0; i < datesToGenerate.length; i++) {
      const date = datesToGenerate[i];
      const category = categories[i % categories.length];
      const angle = shuffledSubTopics[i % shuffledSubTopics.length];
      
      const prompt = `Eres la redactora jefa de "The Heels Academy", una academia de posing y preparación de élite para atletas Bikini y Wellness de la NPC e IFBB Pro League. 
      Escribe un artículo técnico de blog PROFESIONAL y con autoridad. NO repitas introducciones genéricas. Sé creativa y sumamente específica.
      
      IMPORTANTE: NO repitas temas ni títulos que ya hemos publicado recientemente: ${existingTitles}.
      
      REQUISITOS CRÍTICOS:
      - TEMA: ${category} en el contexto del culturismo femenino de competición.
      - ÁNGULO ESPECÍFICO: El artículo debe girar en torno a ${angle}.
      - EXTENSIÓN: Mínimo 800 palabras. Debe ser profundo y detallado.
      - FORMATO: Usa Markdown (## para secciones, ### para subsecciones, > para citas, **negritas** para conceptos clave, listas con puntos).
      - ESTRUCTURA: 
         1. Introducción extremadamente directa y técnica (evita frases como "en el culturismo femenino los detalles no son complementos").
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

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.9,
        presence_penalty: 0.5,
        messages: [
          { role: "system", content: "Expert Bodybuilding Journalist. Nunca repitas la misma frase introductoria en múltiples artículos. Usa ángulos literarios distintos en cada respuesta." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      
      // Crear el slug
      let slug = result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      // Check if slug exists
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${Date.now()}`;

      const post = await prisma.blogPost.create({
        data: {
          title: result.title,
          slug,
          excerpt: result.excerpt,
          content: result.content,
          category: result.category,
          published: false,
          scheduledAt: date
        }
      });

      generatedPosts.push(post.title);
    }

    return NextResponse.json({ 
      message: `¡Éxito! Se han generado ${generatedPosts.length} artículos para el mes de ${monthName}.`,
      articles: generatedPosts
    });

  } catch (error: any) {
    console.error("Error generating monthly blogs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

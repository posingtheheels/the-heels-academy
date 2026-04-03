import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const categories = ["POSING", "NUTRICION", "ENTRENAMIENTO", "PSICOLOGIA", "REGLAMENTO", "MASTERCLASS"];

    const generatedPosts = [];

    for (let i = 0; i < datesToGenerate.length; i++) {
      const date = datesToGenerate[i];
      const category = categories[i % categories.length];
      
      const prompt = `Eres la redactora jefa de "The Heels Academy", una academia de posing y preparación de élite para atletas Bikini y Wellness de la NPC e IFBB Pro League. 
      Escribe un artículo técnico de blog PROFESIONAL y con autoridad.
      
      REQUSITOS CRÍTICOS:
      - TEMA: Relacionado con ${category} en el contexto del culturismo femenino de alta competición.
      - EXTENSIÓN: Mínimo 800 palabras. Debe ser profundo y detallado.
      - FORMATO: Usa Markdown (## para secciones, ### para subsecciones, > para citas, **negritas** para conceptos clave, listas con puntos).
      - ESTRUCTURA: 
         1. Introducción potente inspiradora.
         2. 3-4 secciones técnicas con consejos aplicables.
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
        messages: [{ role: "system", content: "Expert Bodybuilding Journalist for The Heels Academy." }, { role: "user", content: prompt }],
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
          published: true,
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

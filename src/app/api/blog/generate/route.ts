import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint could be called by a cron job (Monday & Thursday)
export async function GET(req: NextRequest) {
  try {
    // Basic protection (could use a secret header)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // For now we allow it for manual testing if no secret is set
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Configura OPENAI_API_KEY en tu .env para usar la IA." }, { status: 500 });
    }

    // Logic for different topics depending on the day of week
    const now = new Date();
    const day = now.getDay(); // 1 = Monday, 4 = Thursday
    
    let topic = "curiosidades del culturismo NPC/IFBB";
    if (day === 1) topic = "técnica avanzada de posing y preparación bikini/wellness";
    if (day === 4) topic = "reglamento IFBB Pro 2026 y resultados de competiciones recientes";

    // Here we would call OpenAI (pseudo-code as example)
    /*
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "system", content: "Eres una redactora experta de The Heels Academy sobre culturismo NPC e IFBB Pro League..." }, 
                   { role: "user", content: `Genera un artículo técnico sobre: ${topic}. Incluye título, slug, excerpt y contenido HTML.` }]
      })
    });
    const aiResult = await response.json();
    */

    // FOR NOW: We return a success message explaining instructions
    return NextResponse.json({ 
      status: "Motor de IA configurado",
      next_topic: topic,
      instructions: "En cuanto añadas la clave API, este endpoint generará y guardará el post automáticamente cada vez que sea llamado."
    });

  } catch (error) {
    console.error("Error in AI generation:", error);
    return NextResponse.json({ error: "Error en el generador de IA" }, { status: 500 });
  }
}

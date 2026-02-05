// src/pages/api/submit.ts
import type { APIRoute } from 'astro';
import { SubmissionInputSchema } from '@/lib/domain/schemas/submission.schema';
import { saveSubmission } from '@/lib/services/persistence/submissions';
import { buildPedagogicalPrompt } from '@/lib/ai/prompt-builder';
// import { DeepSeekClient } from '@/lib/ai/providers/deepseek'; // Descomentar cuando integres el cliente real

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.json();

    // 1. Validación Estricta con Zod (Fails fast)
    const parseResult = SubmissionInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(JSON.stringify({ 
        error: "Datos inválidos", 
        details: parseResult.error.format() 
      }), { status: 400 });
    }

    const data = parseResult.data;

    // 2. Orquestación del Feedback (Simulada por ahora, lista para conectar)
    // const prompt = await buildPedagogicalPrompt(data.level, data.week, data.content);
    // const aiFeedback = await DeepSeekClient.evaluate(prompt); 
    
    // Mock temporal para mantener funcionalidad mientras conectas el prompt-builder real
    const aiFeedback = `Feedback preliminar para ${data.firstName}: Buen trabajo con el texto. (IA pendiente de conexión final)`;

    // 3. Persistencia (Guardamos nombre y apellido por separado)
    const savedRecord = await saveSubmission({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      level: data.level,
      week: data.week,
      content: data.content,
      aiFeedback: aiFeedback
    });

    if (!savedRecord) {
      throw new Error("Error al guardar en base de datos");
    }

    return new Response(JSON.stringify({
      message: "Actividad recibida correctamente",
      feedback: aiFeedback
    }), { status: 200 });

  } catch (error) {
    console.error("Error en submit:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};
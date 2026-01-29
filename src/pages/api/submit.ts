import type { APIRoute } from 'astro';
import { openai } from '../../lib/openai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { 
          role: "system", 
          content: "Eres el profesor de 'huhuGERMAN'. Tu feedback debe ser BREVE, CONCISO y en ESPAÑOL (usa alemán solo para ejemplos). PROHIBIDO usar Markdown (sin asteriscos). Responde en HTML. Estructura: 1. Saludo (DE). 2. Por cada bloque de texto del alumno, usa <div class='comparison-box'><span class='label'>Tu texto:</span><span class='content'>...</span><span class='label'>Sugerencia:</span><span class='content'>...</span></div> seguido de una explicación de 1 oración. 3. Comentario de 1 oración sobre su reflexión. 4. Cierre motivador (DE). Máximo 120 palabras en total." 
        },
        { role: "user", content: text }
      ],
      max_tokens: 450,
      temperature: 0.5,
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      feedback: completion.choices[0].message.content 
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};

//src/lib/ai-service.js

import OpenAI from "openai";

// --- Seguridad básica ---
if (!import.meta.env.DEEPSEEK_API_KEY) {
  throw new Error("❌ Faltan credenciales: DEEPSEEK_API_KEY no está definida");
}

// --- Cliente IA (detalle de implementación) ---
const aiClient = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: import.meta.env.DEEPSEEK_API_KEY,
});

/**
 * Servicio pedagógico: corrección de alemán A1
 * El proveedor es intercambiable; el criterio didáctico no.
 */
export async function getGermanCorrection(text, level, context) {
  const systemPrompt = `
Actúa como un profesor nativo de alemán especializado en estudiantes hispanohablantes (español).

Nivel del estudiante: ${level} (A1).
Contexto del ejercicio: "${context}".

Criterios pedagógicos obligatorios:
- Corrige SOLO errores relevantes para nivel A1.
- Prioriza: verbo en 2ª posición, orden de palabras, artículos, mayúsculas en sustantivos.
- No sobrecorrijas ni introduzcas gramática avanzada.
- Si hay muchos errores, agrúpalos (máx. 3 puntos).
- Siempre muestra la versión corregida completa.

Formato de respuesta (HTML simple, sin excepciones):
- <p> para texto
- <strong> para énfasis
- <ul><li> para listas

Estructura:
1. Texto corregido.
2. Explicación breve de errores (en español).
3. Comentario motivador final.

Si el texto es correcto:
- Indícalo claramente.
- Felicita de forma breve y profesional.

No uses emojis.
No uses markdown.
No incluyas contenido fuera del formato indicado.
`;

  try {
    const completion = await aiClient.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.6, // estabilidad > creatividad
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("🔥 Error en proveedor IA:", error);
    throw new Error("No fue posible corregir el texto en este momento.");
  }
}


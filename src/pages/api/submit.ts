import type { APIRoute } from "astro";
import { getGermanCorrection } from "@lib/ai-service";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const text = formData.get("text")?.toString().trim();
    const level = formData.get("level")?.toString();
    const context =
      formData.get("context")?.toString() || "Práctica general";

    // --- Validación humana ---
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Por favor escribe una frase en alemán." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!level) {
      return new Response(
        JSON.stringify({ error: "No se pudo identificar el nivel del ejercicio." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Llamada al servicio pedagógico ---
    const correction = await getGermanCorrection(text, level, context);

    return new Response(
      JSON.stringify({ correction }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ API Error:", error);

    return new Response(
      JSON.stringify({
        error:
          error.message ||
          "Ocurrió un error al procesar tu ejercicio. Intenta de nuevo.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};


import OpenAI from 'openai';

const apiKey = import.meta.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: DEEPSEEK_API_KEY no encontrada en .env");
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy_key', // Evita que la librería explote al inicio
  baseURL: "https://api.deepseek.com",
});

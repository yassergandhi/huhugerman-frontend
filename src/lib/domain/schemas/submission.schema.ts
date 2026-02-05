// src/lib/domain/schemas/submission.schema.ts
import { z } from "zod";

export const SubmissionInputSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  level: z.enum(["aleman1", "aleman2"]), // Asegura coherencia con los slugs
  week: z.string().regex(/^w\d{2}$/, "El formato de la semana debe ser 'w01', 'w02', etc."),
  content: z.string().min(10, "La respuesta es muy corta. ¡Intenta explayarte un poco más!"),
  sessionId: z.string().optional(), // Para vincular con la sesión de Supabase si existe
});

export type SubmissionInput = z.infer<typeof SubmissionInputSchema>;
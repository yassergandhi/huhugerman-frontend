import { z } from "zod";

export const SubmissionInputSchema = z.object({
  firstName: z.string().min(2, "El nombre es muy corto"),
  lastName: z.string().min(2, "El apellido es muy corto"),
  email: z.string().email().optional().or(z.literal("")),
  level: z.enum(["aleman1", "aleman2"]),
  // 🔄 Ajuste: Permite w1, w01, etc.
  week: z.string().regex(/^w\d{1,2}$/, "Formato inválido (ej: w1 o w01)"),
  content: z.string().min(10, "Tu respuesta es muy corta"),
});

export type SubmissionInput = z.infer<typeof SubmissionInputSchema>;
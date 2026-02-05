// src/lib/services/persistence/submissions.ts
import { supabase } from '@/lib/supabase';
import type { SubmissionInput } from '@/lib/domain/schemas/submission.schema';

// Extendemos el tipo base del input con los datos generados por el servidor (Feedback e IA)
interface SaveSubmissionOptions extends SubmissionInput {
  aiFeedback: string;
  pedagogicalContext?: any; // Contexto opcional para auditoría futura
}

/**
 * Guarda la entrega del estudiante en Supabase.
 * Asume que los datos ya fueron validados por Zod en el API route.
 */
export async function saveSubmission({
  firstName,
  lastName,
  level,
  week,
  content,
  aiFeedback,
  pedagogicalContext = {},
}: SaveSubmissionOptions) {
  
  // 1. Obtener usuario autenticado (Requerido por la tabla 'submissions' campo user_id)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Intento de envío sin sesión activa");
    throw new Error('Debes iniciar sesión para guardar tu progreso.');
  }

  // 2. Construcción de datos derivados
  // Normalizamos nombres (Trim y mayúscula inicial opcional si quisieras)
  const cleanFirstName = firstName.trim();
  const cleanLastName = lastName.trim();
  const fullName = `${cleanFirstName} ${cleanLastName}`;
  
  // Generamos el ID de sesión consistente (Ej: 'aleman1-w01')
  // Aseguramos que 'week' tenga formato wXX por si acaso viene como número
  const formattedWeek = week.startsWith('w') ? week : `w${week.toString().padStart(2, '0')}`;
  const sessionId = `${level}-${formattedWeek}`;

  // 3. Inserción en Base de Datos
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      // -- Vinculación de Usuario --
      user_id: user.id,
      user_email: user.email,

      // -- Datos del Estudiante (Nuevos campos atomizados + Legacy) --
      first_name: cleanFirstName,
      last_name: cleanLastName,
      student_name: fullName, // Mantenemos para compatibilidad visual rápida en dashboard

      // -- Contexto de la Lección --
      level: level,       // 'aleman1' | 'aleman2'
      week_id: formattedWeek, // 'w01'
      session_id: sessionId,

      // -- Contenido y Feedback --
      content_text: content,
      ai_feedback: aiFeedback,
      pedagogical_context: pedagogicalContext, // JSONB para guardar qué se evaluó

      // -- Metadatos fijos --
      submission_type: 'written',
      activity_mode: 'guided',
    })
    .select()
    .single();

  if (error) {
    console.error('Error crítico guardando submission en Supabase:', error);
    throw new Error(`Error al guardar: ${error.message}`);
  }

  return { success: true, data };
}
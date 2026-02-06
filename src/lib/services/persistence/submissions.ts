import { supabaseAdmin } from '@/lib/supabase-admin';
import type { SubmissionInput } from '@/lib/domain/schemas/submission.schema';
import { getWeekContext } from '@/lib/domain/weeks/week-registry';

/**
 * Guarda o actualiza la entrega del estudiante.
 * Implementa la lógica de normalización de IDs para cumplir con la integridad referencial.
 */
export async function saveSubmission(data: SubmissionInput & { aiFeedback: string }) {
  // 1. Normalización estricta de Session ID
  // "w1" o "w01" -> "01"
  const weekNum = data.week.replace(/\D/g, '').padStart(2, '0');
  
  // Mapeo consistente con la tabla 'sessions' (a1-w01, a2-w01)
  const levelPrefix = data.level === 'aleman1' ? 'a1' : 'a2';
  const sessionId = `${levelPrefix}-w${weekNum}`;

  // 2. Recuperar el contexto pedagógico para guardar una instantánea (pedagogical_context)
  // Esto es vital para auditorías: saber qué reglas de corrección se aplicaron en ese momento.
  const kursKey = data.level === 'aleman1' ? 'A1' : 'A2';
  const context = getWeekContext(kursKey, parseInt(weekNum));

  // 3. Obtención del usuario
  // NOTA: En producción, es mejor pasar el userId directamente desde el middleware de auth
  const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(data.email || "");
  
  if (!userData?.user) {
    throw new Error(`No se encontró un usuario con el email: ${data.email}`);
  }

  const payload = {
    user_id: userData.user.id,
    session_id: sessionId,
    content_text: data.content,
    ai_feedback: data.aiFeedback,
    submission_type: 'written',
    activity_mode: 'guided',
    // Guardamos el contexto pedagógico actual como JSONB
    pedagogical_context: context ? {
      title: context.title,
      darf_korrigieren: context.korrektur.darf_korrigieren,
      max_fehler: context.korrektur.max_fehler
    } : null
  };

  // 4. UPSERT con integridad referencial
  // Requiere que 'session_id' exista en la tabla 'sessions'
  const { data: result, error } = await supabaseAdmin
    .from('submissions')
    .upsert(payload, { 
      onConflict: 'user_id, session_id', // Definido en nuestro script SQL anterior
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) {
    console.error("Error en persistencia Supabase:", error.message);
    throw new Error(`Error al guardar: ${error.message}`);
  }

  return result;
}
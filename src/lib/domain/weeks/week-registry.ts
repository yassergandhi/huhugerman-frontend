// src/lib/domain/weeks/week-registry.ts
import type { WochenKontext } from '../schemas/week-context.schema';
import { A1_WOCHE_02 } from './a1-woche-02';
import { A2_WOCHE_01 } from './a2-woche-01';
import { A2_WOCHE_02 } from './a2-woche-02';

/**
 * Registro centralizado de todos los contextos semanales
 * 
 * Este registro sirve como única fuente de verdad para obtener
 * el contexto pedagógico de cualquier semana de cualquier curso.
 */

export type Kurs = "A1" | "A2";
export type Woche = number;

/**
 * Estructura del registro de semanas
 */
interface WeekRegistry {
  A1: Record<number, WochenKontext>;
  A2: Record<number, WochenKontext>;
}

/**
 * Registro completo de contextos semanales
 */
export const WEEK_CONTEXTS: WeekRegistry = {
  A1: {
    // Semana 1 pendiente de implementación
    2: A1_WOCHE_02,
    // Semanas 3-12 pendientes de implementación
  },
  A2: {
    1: A2_WOCHE_01,
    2: A2_WOCHE_02,
    // Semanas 3-12 pendientes de implementación
  }
};

/**
 * Obtiene el contexto de una semana específica
 * 
 * @param kurs - Nivel del curso (A1 o A2)
 * @param woche - Número de semana
 * @returns El contexto de la semana o null si no existe
 * 
 * @example
 * ```typescript
 * const context = getWeekContext("A1", 2);
 * if (context) {
 *   console.log(context.title); // "Woche 2: W-Fragen und Verbzweistellung"
 * }
 * ```
 */
export function getWeekContext(kurs: Kurs, woche: Woche): WochenKontext | null {
  const courseWeeks = WEEK_CONTEXTS[kurs];
  if (!courseWeeks) {
    console.warn(`Curso no encontrado: ${kurs}`);
    return null;
  }
  
  const weekContext = courseWeeks[woche];
  if (!weekContext) {
    console.warn(`Semana no encontrada: ${kurs} - Woche ${woche}`);
    return null;
  }
  
  return weekContext;
}

/**
 * Verifica si existe un contexto para una semana específica
 * 
 * @param kurs - Nivel del curso (A1 o A2)
 * @param woche - Número de semana
 * @returns true si existe el contexto, false si no
 */
export function hasWeekContext(kurs: Kurs, woche: Woche): boolean {
  return getWeekContext(kurs, woche) !== null;
}

/**
 * Obtiene todas las semanas disponibles para un curso
 * 
 * @param kurs - Nivel del curso (A1 o A2)
 * @returns Array de números de semana disponibles
 * 
 * @example
 * ```typescript
 * const availableWeeks = getAvailableWeeks("A2");
 * console.log(availableWeeks); // [1, 2]
 * ```
 */
export function getAvailableWeeks(kurs: Kurs): number[] {
  const courseWeeks = WEEK_CONTEXTS[kurs];
  if (!courseWeeks) {
    return [];
  }
  
  return Object.keys(courseWeeks)
    .map(Number)
    .sort((a, b) => a - b);
}

/**
 * Obtiene todos los cursos disponibles
 * 
 * @returns Array de cursos disponibles
 */
export function getAvailableCourses(): Kurs[] {
  return Object.keys(WEEK_CONTEXTS) as Kurs[];
}

/**
 * Obtiene información de resumen de un contexto
 * 
 * @param kurs - Nivel del curso
 * @param woche - Número de semana
 * @returns Objeto con información resumida o null
 */
export function getWeekSummary(kurs: Kurs, woche: Woche) {
  const context = getWeekContext(kurs, woche);
  if (!context) return null;
  
  return {
    kurs: context.kurs,
    woche: context.woche,
    title: context.title,
    schwerpunkt: context.notizen?.schwerpunkt,
    temas: context.gelernt.wortschatz.themen,
    maxFehler: context.korrektur.max_fehler,
  };
}

/**
 * Valida que un curso y semana sean válidos
 * 
 * @param kurs - Nivel del curso
 * @param woche - Número de semana
 * @throws Error si el curso o semana no son válidos
 */
export function validateCourseAndWeek(kurs: string, woche: number): void {
  const validCourses: Kurs[] = ["A1", "A2"];
  
  if (!validCourses.includes(kurs as Kurs)) {
    throw new Error(`Curso inválido: ${kurs}. Cursos válidos: ${validCourses.join(", ")}`);
  }
  
  if (woche < 1 || woche > 12) {
    throw new Error(`Semana inválida: ${woche}. Debe estar entre 1 y 12`);
  }
  
  if (!hasWeekContext(kurs as Kurs, woche)) {
    throw new Error(`Contexto no implementado para ${kurs} - Woche ${woche}`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default WEEK_CONTEXTS;
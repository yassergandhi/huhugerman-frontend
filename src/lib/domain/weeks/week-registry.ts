// src/lib/domain/weeks/week-registry.ts
import type { WochenKontext } from '../schemas/week-context.schema';
import { A1_WOCHE_01 } from './a1-woche-01';
import { A1_WOCHE_02 } from './a1-woche-02';
import { A2_WOCHE_01 } from './a2-woche-01';
import { A2_WOCHE_02 } from './a2-woche-02';

export type Kurs = "A1" | "A2";
export type Woche = number;

interface WeekRegistry {
  A1: Record<number, WochenKontext>;
  A2: Record<number, WochenKontext>;
}

/**
 * Registro consolidado (Única declaración)
 */
export const WEEK_CONTEXTS: WeekRegistry = {
  A1: {
    1: A1_WOCHE_01,
    2: A1_WOCHE_02,
  },
  A2: {
    1: A2_WOCHE_01,
    2: A2_WOCHE_02,
  }
};

/**
 * Obtiene el contexto normalizando el nivel si viene del frontend (ej. 'aleman1' -> 'A1')
 */
export function getWeekContext(kursInput: string, woche: number): WochenKontext | null {
  const kursMap: Record<string, Kurs> = {
    'aleman1': 'A1',
    'aleman2': 'A2',
    'A1': 'A1',
    'A2': 'A2'
  };

  const kurs = kursMap[kursInput];
  if (!kurs || !WEEK_CONTEXTS[kurs]) return null;
  
  return WEEK_CONTEXTS[kurs][woche] || null;
}

export function hasWeekContext(kurs: Kurs, woche: Woche): boolean {
  return getWeekContext(kurs, woche) !== null;
}

export default WEEK_CONTEXTS;
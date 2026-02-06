// src/lib/ai/prompt-builder.ts
import type { WochenKontext } from '../domain/schemas/week-context.schema';

export function buildPedagogicalPrompt(
  text: string,
  context: WochenKontext,
  studentName: string
): string {
  // Extraktion basierend auf der neuen Nomenklatur des Schemas
  const darfKorrigieren = context.korrektur.darf_korrigieren.join(', ');
  const darfNichtKorrigieren = context.korrektur.darf_nicht_korrigieren.join(', ');
  
  // Zugriff auf das neue 'gelernt' Objekt statt 'gesehen'
  const themen = context.gelernt.wortschatz.themen.join(', ');
  
  // Da 'kasus' im Schema ein optionales Objekt ist, behandeln wir es sicher
  const kasusVisto = context.gelernt.grammatik.kasus 
    ? Object.keys(context.gelernt.grammatik.kasus).filter(k => (context.gelernt.grammatik.kasus as any)[k]?.gelernt)
    : ['Basiskonstruktionen'];

  return `
Actúa como profesor de alemán para ${studentName}.
Nivel: ${context.kurs}, Woche: ${context.woche}
Título de la lección: ${context.title}

EN CLASE SE HA VISTO (GELERNT):
- Temas: ${themen}
- Gramática: ${kasusVisto.join(', ')}
- Pragmática: ${context.gelernt.soziopragmatik.join(', ')}

LO QUE EL ESTUDIANTE AÚN NO HA VISTO (NICHT GELERNT):
- Gramática: ${context.nicht_gelernt.grammatik.join(', ')}
- Pragmática: ${context.nicht_gelernt.soziopragmatik.join(', ')}

INSTRUCCIONES DE CORRECCIÓN PARA LA IA:
- PUEDES CORREGIR: ${darfKorrigieren}
- NO DEBES CORREGIR (Ignora estos errores): ${darfNichtKorrigieren}

REGLAS DE SALIDA:
- Cantidad de errores: Máximo ${context.korrektur.max_fehler} puntos de corrección.
- Estilo: Evitar sobre-corrección (${context.korrektur.ueberkorrektur_vermeiden}).
- Tono: Formativo, empático y motivador (no punitivo).
- Idioma del Feedback: Explicaciones en español con ejemplos claros en alemán.
- Formato técnico: HTML simple (usar solo <p>, <ul>, <li>, <strong>).

TEXTO DEL ESTUDIANTE A EVALUAR:
"${text}"
`;
}
// src/lib/domain/weeks/a2-woche-02.ts
import type { WochenKontext } from '../schemas/week-context.schema';

/**
 * Alemán 2 - Semana 2
 * Tema: Uhrzeit und Trennbare Verben
 * 
 * Enfoque pedagógico:
 * - Uhrzeit formal e informal
 * - Introducción a verbos separables
 * - Consolidación de Akkusativ
 * - Actividades cotidianas y rutinas
 */
export const A2_WOCHE_02: WochenKontext = {
  kurs: "A2",
  woche: 2,
  title: "Woche 2: Uhrzeit und Trennbare Verben",
  
  gelernt: {
    grammatik: {
      // Estructura de oración
      verbzweistellung: true,
      aussagesatz: true,
      
      // Preguntas
      wFragen: [
        "Wie spät ist es?",
        "Wie viel Uhr ist es?",
        "Wann...?",
        "Um wie viel Uhr...?"
      ],
      jaNeinfragen: false,
      
      // Casos
      kasus: {
        nominativ: {
          gelernt: true,
          verwendung: ["Subjekt", "sein", "heissen"]
        },
        akkusativ: {
          gelernt: true,
          artikel: ["den", "einen"], // Solo cambios en masculino
          verwendung: ["Direktes Objekt"]
        }
      },
      
      // Artículos
      artikel: {
        bestimmter: {
          gelernt: true,
          formen: ["der", "die", "das"]
        },
        unbestimmter: {
          gelernt: true,
          formen: ["ein", "eine"]
        },
        negativer: {
          gelernt: true,
          formen: ["kein", "keine"]
        }
      },
      
      // Verbos
      konjugation: {
        verben: [
          "sehen", "fahren", "lesen", "kommen", "gehen",
          "aufstehen", "einkaufen gehen", "vorlesen", "auskommen"
        ],
        personalpronomen: ["ich", "du", "er/sie/es", "wir", "ihr", "sie","Sie"],
        regelmäßig: ["kommen", "gehen", "wohnen", "kochen"],
        unregelmäßig: ["sehen", "fahren", "lesen", "schlafen", "sein"]
      },
      
      // Verbos separables (NUEVO en A2)
      trennbareVerben: {
        gelernt: true,
        prefixe: ["vor-", "ein-", "aus-", "auf-"],
        beispiele: [
          "aufstehen",
          "ausgehen",
          "vorlesen"
        ]
      },
      
      personalpronomen: ["ich", "du", "er", "sie", "es", "wir", "ihr", "sie", "Sie"],
      
      // Adverbios temporales
      adverbien: {
        temporal: {
          gelernt: false,
          beispiele: [
            "heute", "morgen", "gestern",
            "jetzt", "später", "früh", "spät",
            "um ... Uhr"
          ]
        }
      },
      
      // Números (se asume conocimiento de A1)
      zahlen: {
        kardinale: {
          gelernt: true,
          range: {
            von: 0,
            bis: 100
          }
        }
      }
    },
    
    wortschatz: {
      themen: [
        "Uhrzeit",
      ],
      
      // Uhrzeit (EXPLÍCITO)
      uhrzeit: {
        gelernt: true,
        formal: [
          "Wie spät ist es?",
          "Es ist ... Uhr",
          "Es ist zehn Uhr zwanzig"
        ],
        informal: [
          "Wie viel Uhr ist es?",
          "Es ist halb drei",
          "Es ist Viertel vor/nach"
        ]
      },
      
      // Actividades diarias
      aktivitäten: {
        gelernt: true,
        tagesablauf: [
          "aufstehen",
          "frühstücken",
          "einkaufen gehen",
          "nach Hause kommen"
        ]
      },
      
      // Días de la semana (básico)
      wochentage: {
        gelernt: true,
        alle: true
      },
      
      // Expresiones útiles
      ausdrücke: {
        begrüßung: [
          "Guten Tag",
          "Hallo",
          "Moin",
          "Servus",
          "Wie geht es Ihnen?",
          "Wie geht's?"
        ],
        verabschiedung: [
          "Auf Wiedersehen",
          "Tschüss",
          "Servus"
          "Bis später",
          "Bis morgen"
        ]
      }
    },
    
    soziopragmatik: [
      "du/Sie",
      "formelle Situation",
      "informelle Situation",
      "Zeitangaben"
    ]
  },
  
  nicht_gelernt: {
    grammatik: [
      "Dativ",
      "Genitiv",
      "Perfekt mit haben/sein",
      "Präteritum",
      "Modalverben (mögen, können)",
      "Possessivartikel im Akkusativ",
      "Nebensätze",
      "Konjunktiv"
    ],
    wortschatz: [
      "Gefühle (detallado)",
      "Wetter",
      "Essen im Restaurant (detallado)",
      "Reisen",
      "Lebensmittel (detallado)"
    ],
    soziopragmatik: [
      "nonverbale Kommunikation",
      "Umgangssprache",
      "Regionalismen"
    ]
  },
  
  korrektur: {
    darf_korrigieren: [
      "Wortstellung",
      "Verbformen",
      "W-Fragen",
      "Stundenangabe",
      "Akkusativ",
      "Trennbare Verben"
    ],
    darf_nicht_korrigieren: [
      "Großschreibung",
      "Dativ",
      "Genitiv",
      "Reflexivpronomen",
      "Nebensätze",
      "Perfekt",
      "Modalverben",
      "Vokabular nicht gelernt"
    ],
    max_fehler: 4, // Aumentado para A2 (más complejidad)
    ueberkorrektur_vermeiden: true,
    fokus: [
      "Separación correcta de verbos trennbares",
      "Uso correcto de Uhrzeit formal vs informal",
      "Uso correcto preposición um para horas",
      "Uso correcto preposición am para días de la semana",
      "Akkusativ en contextos cotidianos"
    ],
    toleranz: "mittel" // Nivel intermedio
  },
  
  notizen: {
    schwerpunkt: "Estudiantes deben poder describir acciones cotidianas en primera o tercera persona y expresar la hora correctamente",
    warnung: [
      "Verbos separables son nuevos - ser paciente con errores de separación",
      "Enfocarse en la estructura de separación, no en vocabulario avanzado"
    ],
    tipps: [
      "Practicar verbos separables con ejemplos visuales",
      "Memorizar expresiones de tiempo formales e informales",
      "Crear un horario diario en alemán como práctica"
    ]
  }
};
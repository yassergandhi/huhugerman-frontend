// src/lib/domain/weeks/a1-woche-02.ts
import type { WochenKontext } from '../schemas/week-context.schema';

/**
 * Alemán 1 - Semana 2
 * Tema: W-Fragen und Verbzweistellung
 * 
 * Enfoque pedagógico:
 * - Consolidación de presentaciones formales e informales
 * - Introducción a preguntas W (Wie, Woher, Wo, Wie alt)
 * - Números cardinales del 0 al 12
 * - Verbzweistellung en preguntas
 */
export const A1_WOCHE_02: WochenKontext = {
  kurs: "A1",
  woche: 2,
  title: "Woche 2: W-Fragen und Verbzweistellung",
  
  gelernt: {
    grammatik: {
      // Estructura de oración
      verbzweistellung: true,
      aussagesatz: true,
      
      // Preguntas
      wFragen: [
        "Wie heißt du?",
        "Wie heißt er/sie?",
        "Wie heißen Sie?",
        "Woher kommst du?",
        "Woher kommen Sie?",
        "Wo wohnst du?",
        "Wo wohnen Sie?",
        "Wie alt bist du?",
        "Wie alt sind Sie?",
        "Wie ist dein Vorname?",
        "Wie ist dein Familienname?",
        "Was bist du von Beruf?",
        "Was sind Sie von Beruf?"
      ],
      jaNeinfragen: false,
      
      // Casos (solo Nominativ hasta ahora)
      kasus: {
        nominativ: {
          gelernt: false,
          verwendung: ["Subjekt", "nach sein"]
        }
      },
      
      // Verbos
      konjugation: {
        verben: ["sein", "heißen", "kommen", "wohnen"],
        personalpronomen: ["ich", "du", "er", "sie", "es", "wir", "ihr", "sie", "Sie",],
        regelmäßig: ["heißen", "kommen", "wohnen"],
        unregelmäßig: ["sein"]
      },
      
      personalpronomen: ["ich", "du", "er", "sie", "es", "wir", "ihr", "sie", "Sie",],
      
      // Números cardinales 0-12 (EXPLÍCITO)
      zahlen: {
        kardinale: {
          gelernt: true,
          range: {
            von: 0,
            bis: 12
          }
        }
      }
    },
    
    wortschatz: {
      themen: [
        "Personalinformationen",
        "Identität",
        "Ortsangaben",
        "Alter",
        "Namen"
      ],
      
      // Alfabeto y deletreo
      alphabet: {
        gelernt: false,
        buchstabieren: false
      },
      
      // Países (básico)
      länder: {
        gelernt: true,
        beispiele: ["Deutschland", "Mexiko", "Österreich"]
      },
      
      // Expresiones básicas
      ausdrücke: {
        begrüßung: [
          "Guten Tag",
          "Hallo",
          "Guten Morgen",
          "Moin",
          "Servus"
        ],
        verabschiedung: [
          "Auf Wiedersehen",
          "Tschüss",
          "Bis bald", 
          "Tschüssi"
        ]
      }
    },
    
    soziopragmatik: [
      "du/Sie",
      "formelle Situation",
      "informelle Situation"
    ]
  },
  
  nicht_gelernt: {
    grammatik: [
      "Akkusativ",
      "Dativ",
      "Genitiv",
      "Plural",
      "Adjektive",
      "Perfekt",
      "Präteritum",
      "Modalverben",
      "Trennbare Verben",
      "Possessivartikel",
      "Nebensätze"
    ],
    wortschatz: [
      "Berufe (detallado)",
      "Familie (detallado)",
      "Hobbys",
      "Kleidung",
      "Essen",
      "Haushaltsachen",
      "Schulsachen"
    ],
    soziopragmatik: [
      "nonverbale Kommunikation",
      "Umgangssprache",
      "Regionalismen"
    ]
  },
  
  korrektur: {
    darf_korrigieren: [
      "Begrüßung",
      "Abschied",
      "Verbformen",
      "Wortstellung",
      "W-Fragen",
      "Zahlen"
    ],
    darf_nicht_korrigieren: [
      "Großschreibung",
      "Nebensätze",
      "Perfekt",
      "Artikeldeklination",
      "Akkusativ",
      "Dativ",
      "Genitiv",
      "Vokabular nicht gelernt"
    ],
    max_fehler: 3,
    ueberkorrektur_vermeiden: true,
    fokus: [
      "Korrekte Verwendung von W-Fragen",
      "Unterscheidung du/Sie",
      "Verbzweistellung in W-Fragen"
    ],
    toleranz: "hoch" // Primera semana con W-Fragen
  },
  
  notizen: {
    schwerpunkt: "Estudiantes deben poder hacer preguntas básicas de presentación y responderlas correctamente",
    warnung: [
      "No corregir el uso de números mayores a 12 si aparecen",
      "Ser tolerante con errores de mayúsculas (nicht gelernt formalmente)",
      "Enfocarse en la estructura de las preguntas, no en la ortografía perfecta"
    ],
    tipps: [
      "Practicar W-Fragen con compañeros",
      "Memorizar números 0-12",
      "Distinguir siempre entre du y Sie según el contexto"
    ]
  }
};
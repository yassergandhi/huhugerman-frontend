// src/lib/domain/schemas/week-context.schema.ts
import { z } from "zod";

/**
 * Wochenkontext Schema
 * Absolute Quelle der Wahrheit für den Unterricht
 * 
 * Este schema cubre el programa completo institucional de Alemán 1 y Alemán 2
 * de la Universidad Autónoma Metropolitana - Azcapotzalco
 */

// ============================================================================
// SUB-SCHEMAS REUTILIZABLES
// ============================================================================

/**
 * Schema para números cardinales
 */
const ZahlenSchema = z.object({
  kardinale: z.object({
    gelernt: z.boolean(),
    range: z.object({
      von: z.number().int().min(0).optional(),
      bis: z.number().int().optional()
    }).optional()
  }).optional()
});

/**
 * Schema para artículos (bestimmt, unbestimmt, negativ)
 */
const ArtikelSchema = z.object({
  bestimmter: z.object({
    gelernt: z.boolean(),
    formen: z.array(z.enum(["der", "die", "das"])).optional()
  }).optional(),
  unbestimmter: z.object({
    gelernt: z.boolean(),
    formen: z.array(z.enum(["ein", "eine"])).optional()
  }).optional(),
  negativer: z.object({
    gelernt: z.boolean(),
    formen: z.array(z.enum(["kein", "keine"])).optional()
  }).optional()
});

/**
 * Schema para conjugación de verbos
 */
const KonjugationSchema = z.object({
  verben: z.array(z.string()), // Lista de verbos vistos
  personalpronomen: z.array(z.string()).optional(),
  regelmäßig: z.array(z.string()).optional(),
  unregelmäßig: z.array(z.string()).optional()
});

/**
 * Schema para verbos trennbares
 */
const TrennbareVerbenSchema = z.object({
  gelernt: z.boolean(),
  prefixe: z.array(z.string()).optional(),
  beispiele: z.array(z.string()).optional() // Ej: "aufstehen", "einkaufen"
});

/**
 * Schema para casos (Kasus)
 */
const KasusSchema = z.object({
  nominativ: z.object({
    gelernt: z.boolean(),
    verwendung: z.array(z.string()).optional() // ["Subjekt", "nach sein"]
  }).optional(),
  akkusativ: z.object({
    gelernt: z.boolean(),
    artikel: z.array(z.string()).optional(), // ["den", "einen"]
    verwendung: z.array(z.string()).optional() // ["Direktes Objekt"]
  }).optional(),
  dativ: z.object({
    gelernt: z.boolean(),
    artikel: z.array(z.string()).optional(),
    verwendung: z.array(z.string()).optional()
  }).optional(),
  genitiv: z.object({
    gelernt: z.boolean(),
    artikel: z.array(z.string()).optional()
  }).optional()
});

/**
 * Schema para Modalverben
 */
const ModalverbenSchema = z.object({
  gelernt: z.boolean(),
  verben: z.array(z.enum(["mögen", "möchten", "können", "müssen", "dürfen", "wollen", "sollen"])).optional(),
  konjugiert: z.boolean().optional() // Si se vieron conjugados
});

/**
 * Schema para Adverbien
 */
const AdverbienSchema = z.object({
  temporal: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional() // ["heute", "morgen", "jetzt"]
  }).optional(),
  modal: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional() // ["gern", "lieber", "am liebsten"]
  }).optional(),
  häufigkeit: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional() // ["immer", "oft", "manchmal", "nie"]
  }).optional()
});

/**
 * Schema para Possessivartikel
 */
const PossessivartikelSchema = z.object({
  gelernt: z.boolean(),
  formen: z.array(z.string()).optional(), // ["mein", "dein", "sein", "ihr", "unser", "euer", "ihr", "Ihr"]
  nurNominativ: z.boolean().optional() // Si solo se vieron en nominativo
});

/**
 * Schema para Negation
 */
const NegationSchema = z.object({
  nicht: z.object({
    gelernt: z.boolean(),
    verwendung: z.array(z.string()).optional()
  }).optional(),
  kein: z.object({
    gelernt: z.boolean(),
    verwendung: z.array(z.string()).optional()
  }).optional()
});

/**
 * Schema para Plural
 */
const PluralSchema = z.object({
  gelernt: z.boolean(),
  endungen: z.array(z.string()).optional(), // ["-e", "-en", "-er", "-s", "¨-e"]
  beispiele: z.array(z.object({
    singular: z.string(),
    plural: z.string()
  })).optional()
});

/**
 * Schema para gramática completa
 */
const GrammatikSchema = z.object({
  // Estructura de oración
  verbzweistellung: z.boolean(),
  aussagesatz: z.boolean().optional(),
  
  // Preguntas
  wFragen: z.array(z.string()).optional(), // Campo específico para W-Fragen
  jaNeinfragen: z.boolean().optional(),
  
  // Casos y artículos
  kasus: KasusSchema.optional(),
  artikel: ArtikelSchema.optional(),
  
  // Verbos
  konjugation: KonjugationSchema.optional(),
  trennbareVerben: TrennbareVerbenSchema.optional(),
  modalverben: ModalverbenSchema.optional(),
  
  // Pronombres y posesivos
  personalpronomen: z.array(z.string()).optional(),
  possessivartikel: PossessivartikelSchema.optional(),
  indefinitpronomen: z.object({
    gelernt: z.boolean(),
    formen: z.array(z.enum(["man"])).optional()
  }).optional(),
  
  // Números y plural
  zahlen: ZahlenSchema.optional(),
  plural: PluralSchema.optional(),
  
  // Negación
  negation: NegationSchema.optional(),
  
  // Adverbios
  adverbien: AdverbienSchema.optional()
});

/**
 * Schema para vocabulario (Wortschatz)
 */
const WortschatzSchema = z.object({
  // Temas generales
  themen: z.array(z.string()),
  
  // Vocabulario específico por categorías
  alphabet: z.object({
    gelernt: z.boolean(),
    buchstabieren: z.boolean().optional()
  }).optional(),
  
  länder: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional()
  }).optional(),
  
  sprachen: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional()
  }).optional(),
  
  berufe: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional()
  }).optional(),
  
  familie: z.object({
    gelernt: z.boolean(),
    mitglieder: z.array(z.string()).optional()
  }).optional(),
  
  haushaltsachen: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional()
  }).optional(),
  
  schulsachen: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional()
  }).optional(),
  
  lebensmittel: z.object({
    gelernt: z.boolean(),
    kategorien: z.array(z.string()).optional(), // ["Obst", "Gemüse", "Fleisch"]
    beispiele: z.array(z.string()).optional()
  }).optional(),
  
  getränke: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional()
  }).optional(),
  
  verpackungen: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional() // ["Flasche", "Dose", "Packung"]
  }).optional(),
  
  maßnamen: z.object({
    gelernt: z.boolean(),
    beispiele: z.array(z.string()).optional() // ["Liter", "Gramm", "Kilo"]
  }).optional(),
  
  wochentage: z.object({
    gelernt: z.boolean(),
    alle: z.boolean().optional()
  }).optional(),
  
  uhrzeit: z.object({
    gelernt: z.boolean(),
    formal: z.array(z.string()).optional(), // ["Wie spät ist es?", "Es ist... Uhr"]
    informal: z.array(z.string()).optional() // ["Wie viel Uhr ist es?"]
  }).optional(),
  
  aktivitäten: z.object({
    gelernt: z.boolean(),
    wochenende: z.array(z.string()).optional(),
    tagesablauf: z.array(z.string()).optional()
  }).optional(),
  
  // Expresiones útiles
  ausdrücke: z.object({
    begrüßung: z.array(z.string()).optional(),
    verabschiedung: z.array(z.string()).optional(),
    restaurant: z.array(z.string()).optional(), // ["Ich möchte bestellen", "Die Rechnung, bitte"]
    einkaufen: z.array(z.string()).optional()
  }).optional()
});

/**
 * Schema para aspectos sociopragmáticos
 */
const SoziopragmatikSchema = z.array(
  z.enum([
    // Registro formal/informal
    "du/Sie",
    "formelle Situation",
    "informelle Situation",
    
    // Comunicación
    "nonverbale Kommunikation",
    "Umgangssprache",
    "Regionalismen",
    
    // Aspectos gramaticales con implicaciones pragmáticas
    "Präpositionen",
    "Zeitangaben",
    
    // Contextos específicos
    "Restaurant",
    "Einkaufen",
    "Familienstand"
  ])
);

/**
 * Schema para reglas de corrección pedagógica
 */
const KorrekturSchema = z.object({
  darf_korrigieren: z.array(
    z.enum([
      // Saludos y despedidas
      "Begrüßung",
      "Abschied",
      
      // Gramática vista
      "Verbformen",
      "Wortstellung",
      "W-Fragen",
      "Ja/Nein-Fragen",
      "Stundenangabe",
      "Nominativ",
      "Akkusativ",
      "Trennbare Verben",
      "Possessivartikel",
      "Artikel",
      "Plural",
      "Negation",
      "Modalverben",
      "Zahlen",
      
      // Vocabulario
      "Vokabular gelernt"
    ])
  ),
  darf_nicht_korrigieren: z.array(
    z.enum([
      // Ortografía y puntuación
      "Großschreibung",
      "Interpunktion",
      
      // Gramática no vista
      "Nebensätze",
      "Perfekt",
      "Präteritum",
      "Plusquamperfekt",
      "Futur",
      "Konjunktiv",
      "Passiv",
      "Artikeldeklination",
      "Dativ",
      "Genitiv",
      "Reflexivpronomen",
      "Relativsätze",
      "Infinitiv mit zu",
      
      // Temas no vistos
      "Vokabular nicht gelernt"
    ])
  ),
  max_fehler: z.number().int().min(1).max(5),
  ueberkorrektur_vermeiden: z.boolean(),
  
  // Estrategia pedagógica
  fokus: z.array(z.string()).optional(), // En qué enfocarse esta semana
  toleranz: z.enum(["niedrig", "mittel", "hoch"]).optional() // Nivel de tolerancia a errores
});

// ============================================================================
// SCHEMA PRINCIPAL
// ============================================================================

export const WochenKontextSchema = z.object({
  // Metadatos
  kurs: z.enum(["A1", "A2"]),
  woche: z.number().int().positive(),
  title: z.string(),
  
  // Contenido visto
  gelernt: z.object({
    grammatik: GrammatikSchema,
    wortschatz: WortschatzSchema,
    soziopragmatik: SoziopragmatikSchema
  }),
  
  // Contenido NO visto (para evitar correcciones prematuras)
  nicht_gelernt: z.object({
    grammatik: z.array(z.string()),
    wortschatz: z.array(z.string()).optional(),
    soziopragmatik: z.array(z.string())
  }),
  
  // Reglas de corrección pedagógica
  korrektur: KorrekturSchema,
  
  // Notas adicionales opcionales
  notizen: z.object({
    schwerpunkt: z.string().optional(), // Punto focal de la semana
    warnung: z.array(z.string()).optional(), // Advertencias pedagógicas
    tipps: z.array(z.string()).optional() // Tips para el estudiante
  }).optional()
});

// ============================================================================
// TYPES
// ============================================================================

export type WochenKontext = z.infer<typeof WochenKontextSchema>;
export type Grammatik = z.infer<typeof GrammatikSchema>;
export type Wortschatz = z.infer<typeof WortschatzSchema>;
export type Korrektur = z.infer<typeof KorrekturSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Valida un contexto semanal contra el schema
 * @param context - Contexto a validar
 * @returns Objeto parseado y validado
 * @throws ZodError si la validación falla
 */
export function validateWochenKontext(context: unknown): WochenKontext {
  return WochenKontextSchema.parse(context);
}

/**
 * Valida un contexto semanal de forma segura
 * @param context - Contexto a validar
 * @returns { success: true, data } o { success: false, error }
 */
export function safeValidateWochenKontext(context: unknown) {
  return WochenKontextSchema.safeParse(context);
}
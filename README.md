# huhugerman-portal — feature/dynamic-lessons

> **"El sistema solo permite feedback alineado con lo que fue enseñado, usando un dominio pedagógico tipado como fuente única de verdad."**

**Estado:** RAMA DE PRODUCTO · Evolución post-MVP  
**Contexto:** Refactorización arquitectónica desde MVP no gobernable hacia sistema Domain-Driven  
**Stack:** Astro · TypeScript · Zod · Supabase · DeepSeek AI · Vercel

---

## Qué es esta rama y por qué importa

Esta rama representa el momento exacto en que el proyecto dejó de ser un experimento y se convirtió en un producto gobernable. No es una feature más: es la implementación de la decisión arquitectónica central que define cómo el dominio pedagógico gobierna el sistema completo.

Si el repositorio principal muestra **dónde llegamos**, esta rama muestra **cómo llegamos y por qué**.

---

## El problema que esta rama resuelve

El MVP tenía un endpoint `/api/submit` que recibía texto y generaba feedback de IA. Funcionaba. Pero no era gobernable:

- El contexto pedagógico vivía en el prompt construido a mano
- Escalar de semana 2 a semana 3 significaba copiar y modificar prompts
- La IA corregía gramática que los estudiantes no habían visto
- No había "fuente de verdad" que representara qué se había enseñado
- Añadir un nuevo nivel (Alemán 2) requería duplicar toda la lógica

El sistema dependía del criterio del profesor para no romperse. Eso no es un producto.

---

## La decisión de dominio (DDD aplicado sin teoría)

La fricción decisiva no fue técnica: fue pedagógica.

**Cambio mental que forzó la refactorización:**

```
Antes: "¿Qué texto manda el frontend?"
Ahora: "¿Qué reglas del dominio pedagógico permiten esta acción?"
```

Esto se traduce en una regla estructural que no se negocia:

> **Si algo es pedagógico, vive en `/domain`. Si algo es UI o infraestructura, no vive ahí.**

---

## Estructura del dominio

```
src/lib/
├── domain/
│   ├── schemas/
│   │   ├── week-context.schema.ts  ← contrato Zod (corazón del sistema)
│   │   └── submission.schema.ts    ← validación de entrada
│   ├── weeks/
│   │   ├── a1-woche-01.ts          ← instancia: Alemán 1, semana 1
│   │   ├── a1-woche-02.ts
│   │   ├── a2-woche-01.ts
│   │   ├── a2-woche-02.ts
│   │   └── week-registry.ts        ← loader dinámico: map, no if
│   └── index.ts                    ← exportaciones del dominio
├── ai/
│   ├── providers/
│   │   └── deepseek.ts             ← proveedor de IA aislado
│   └── prompt-builder.ts           ← construye prompts DESDE el dominio
├── courses/
│   ├── aleman1/sessions/           ← 10 sesiones por nivel
│   └── aleman2/sessions/
└── services/
    └── persistence/                ← persistencia separada del dominio
```

### El WochenKontextSchema

El corazón del sistema. Define explícitamente qué existe y qué no existe en cada semana:

```typescript
const WochenKontextSchema = z.object({
  weekId: z.string(),
  level: z.enum(['aleman1', 'aleman2']),
  
  gesehen: z.object({
    grammatik: z.array(z.string()),    // gramática vista hasta esta semana
    lexikon: z.array(z.string()),      // vocabulario visto
    soziopragmatik: z.array(z.string()), // pragmática vista
  }),
  
  nicht_gesehen: z.array(z.string()), // lo que NO se debe tocar
  
  korrektur: z.object({
    erlaubt: z.array(z.string()),      // qué puede corregir la IA
    verboten: z.array(z.string()),     // qué tiene prohibido corregir
    fehlertoleranz: z.string(),
    anti_overcorrection: z.boolean(),  // protección contra sobrecorrección
  }),
});
```

**Lo que este schema elimina:** prompts mágicos, lógica dispersa en múltiples archivos, interpretaciones ambiguas de qué debe corregirse. La IA no decide: obedece al dominio.

### El week-registry: escalabilidad sin `if`

```typescript
// week-registry.ts
// Antes: if (kurs === 'aleman1' && woche === 'w01') return a1Woche01;
// Ahora: el registry hace el map dinámico

export const weekRegistry: Record<string, WochenKontext> = {
  'aleman1-w01': a1Woche01,
  'aleman1-w02': a1Woche02,
  'aleman2-w01': a2Woche01,
  // Añadir una semana = añadir una línea
};

export function getWeekContext(kurs: string, woche: string): WochenKontext {
  const key = `${kurs}-${woche}`;
  const context = weekRegistry[key];
  if (!context) throw new Error(`Semana no encontrada: ${key}`);
  return context;
}
```

Antes de esta rama, añadir una semana nueva requería modificar el archivo de lógica central. Ahora requiere crear un archivo de semana y una línea en el registry.

---

## El prompt-builder: de prompt mágico a contrato ejecutable

```typescript
// prompt-builder.ts
export function buildPrompt(
  studentText: string,
  context: WochenKontext
): string {
  return `
Eres un tutor de alemán A1/A2 para hispanohablantes en México.

NIVEL: ${context.level} | SEMANA: ${context.weekId}

GRAMÁTICA VISTA (puedes corregir):
${context.gesehen.grammatik.join(', ')}

GRAMÁTICA NO VISTA (PROHIBIDO corregir):
${context.korrektur.verboten.join(', ')}

REGLA ABSOLUTA: No menciones ni corrijas ${context.nicht_gesehen.join(', ')} bajo ninguna circunstancia.

TOLERANCIA AL ERROR: ${context.korrektur.fehlertoleranz}

TEXTO DEL ESTUDIANTE:
${studentText}
  `.trim();
}
```

Este prompt no es creativo. Es un contrato. El profesor es quien definió las reglas; el prompt-builder las ejecuta.

---

## Componentes UI notables

### GuidedActivity.astro

Componente central de la actividad semanal. Maneja:
- Instrucciones pedagógicas contextuales por semana
- Video embebido del episodio de Y-Kollektiv correspondiente
- Formulario con las tres partes de la entrega
- Estado de carga con mensajes rotantes en alemán (`"Analysiere Nominativ..."`)
- Persistencia de respuestas via Supabase upsert

### CourseList.astro

Renderiza la lista de semanas disponibles por nivel, marcando sesiones activas y próximas. La disponibilidad viene del dominio — no del componente.

---

## Flujo backend completo

```
POST /api/submit
{
  text: "...",
  studentName: "...",
  kurs: "aleman1",
  woche: "w02"
}
    ↓
1. getWeekContext('aleman1', 'w02')  ← carga desde registry
    ↓
2. SubmissionSchema.parse(payload)  ← validación Zod
    ↓
3. buildPrompt(text, context)       ← prompt gobernado por dominio
    ↓
4. deepseekClient.complete(prompt)  ← IA dentro de límites
    ↓
5. persistence.save({               ← snapshot completo
     text, feedback,
     pedagogical_context: context   ← JSONB: auditoría futura
   })
    ↓
6. { success: true, feedback }      ← respuesta al frontend
```

---

## Deudas técnicas al momento de archivarse

Registradas como backlog explícito, no como errores:

- `saveSubmission` sin contrato Zod completo (tipado parcial)
- Loader dinámico con un `if` residual en una ruta de fallback
- Migración formal del campo `student_name` → referencia a `profiles.id` pendiente
- Integración con proveedor de IA alternativo sin completar

---

## Lecciones que este repo enseña

**Sobre ADRs:** Este ADR se escribió después del MVP, no antes. El MVP validó el flujo. El ADR vino del descubrimiento de que el flujo era correcto pero el modelo era ingobernable. Escribir el ADR tarde es costoso. No escribirlo nunca es catastrófico: significa que el sistema crecerá sin saber por qué tomó las decisiones que tomó.

**Sobre el dominio pedagógico como código:** El conocimiento pedagógico del profesor estaba en su cabeza. Convertirlo en schemas tipados fue un acto de ingeniería — traducir conocimiento humano a contratos ejecutables. Esta es la habilidad central de un Learning Systems Architect.

**Sobre la IA como ejecutora, no como árbitro:** La IA no sabe qué gramática ha visto el estudiante. No puede saberlo. Sin dominio explícito, la IA ejerce su propio criterio — y ese criterio es pedagógicamente inconsistente. El dominio no limita la IA: la hace útil.

---

## Repositorios relacionados

→ **[cse-student-portal-german-edu](https://github.com/yassergandhi/cse-student-portal-german-edu)** — Portal estudiantil (estado anterior)  
→ **[cse-identity-engine-german-edu](https://github.com/yassergandhi/cse-identity-engine-german-edu)** — Motor de identidad y normalización  
→ **[huhugerman.com](https://huhugerman.com)** — Plataforma en producción

---

## Sobre el autor

Yasser Gandhi Hernández Esquivel — Learning Systems Architect · AI-Driven Instructional Designer · German Language Expert C1. 15 años enseñando alemán. Creador del método huhuGERMAN. Licenciado en Letras Alemanas (UNAM), Maestría en Pedagogía (UNAM, beca CONACYT), Licenciado en Desarrollo de Sistemas Web (UdeG, 98.5).

→ [yassergandhi.dev](https://yassergandhi.dev) · [LinkedIn](https://linkedin.com/in/yassergandhi)

---

*Licencia: Uso educativo. Todos los derechos reservados.*

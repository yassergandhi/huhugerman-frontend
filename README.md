# cse-student-portal-german-edu

> **"La IA ya no decide: obedece al dominio."**

**Estado:** ARCHIVADO · Artefacto de aprendizaje · Implementación con usuarios reales  
**Período de producción:** 2024–2025 · UAM Azcapotzalco, Ciudad de México  
**Stack:** Astro · TypeScript · Supabase · DeepSeek AI · Vercel

---

## Por qué existe este repositorio

Este repositorio documenta la **evolución del portal estudiantil** del sistema huhuGERMAN, desde un formulario con feedback de IA sin restricciones hasta un sistema donde el dominio pedagógico gobierna explícitamente lo que la IA puede y no puede corregir.

El problema central no era técnico. Era pedagógico. Y resolverlo requirió arquitectura.

---

## El problema que causó la refactorización

La primera versión del portal generaba feedback de IA sin restricciones. Un estudiante de Alemán 1 en la semana 2 recibía correcciones de Perfekt, Akkusativ y subordinadas — estructuras que no vería hasta el tercer mes de clase.

Resultado pedagógico: confusión, frustración, percepción de insuficiencia. El estudiante no entendía qué había hecho mal porque el sistema lo estaba corrigiendo con reglas que nadie le había enseñado.

> **"La IA corrige cosas que no he enseñado todavía."**  
> — Fricción real documentada, 2024

Esta es la friccón que forzó la transición de MVP a producto.

---

## El ADR que cambió todo

### Decisión central

**Separar explícitamente el dominio pedagógico del resto del sistema y convertirlo en la fuente única de verdad.**

Esto significa que antes de escribir una sola línea de prompt para la IA, el sistema ya sabe:

- Qué gramática se ha visto (`gesehen`)
- Qué vocabulario se ha visto (`gesehen`)
- Qué temas están prohibidos corregir (`nicht_gesehen`)
- Qué puede y qué no puede tocar la IA (`korrektur`)
- Bajo qué condiciones pragmáticas opera el estudiante

**Consecuencias aceptadas de esta decisión:**
- Más código upfront
- Menos "flexibilidad creativa" de la IA
- Mayor disciplina de naming y estructura

**Consecuencias ganadas:**
- IA con feedback pedagógicamente coherente
- Correcciones controladas y predecibles
- Escalabilidad real: añadir una semana = añadir un archivo, no reescribir prompts

---

## Evolución de la arquitectura

### Antes (MVP): configuración implícita

```javascript
// roadmap.js — La lógica pedagógica vivía aquí
// Pero "roadmap" no es "dominio"
// Era UI + configuración + contexto mezclados
export const COURSE_CONFIG = {
  aleman1: { weeks: [...] }
};
```

El contexto pedagógico vivía en la cabeza del profesor. El sistema lo recibía a través del texto del prompt, construido a mano, semana por semana. Escalar significaba copiar prompts.

### Después (Producto): dominio explícito y tipado

```
src/lib/
├── domain/
│   ├── schemas/
│   │   └── week-context.schema.ts  ← contrato Zod: fuente de verdad
│   └── weeks/
│       ├── a1-woche-01.ts          ← instancia concreta de la semana 1
│       ├── a1-woche-02.ts
│       └── week-registry.ts        ← loader dinámico
├── ai/
│   ├── ai-client.ts
│   └── prompt-builder.ts          ← construye prompts DESDE el dominio
└── roadmap.ts                     ← navegación, NO dominio
```

**Regla estructural que no se negocia:** Si algo es pedagógico, vive en `/domain`. Si es UI o infraestructura, no vive ahí. `roadmap.ts ≠ /domain/weeks/*`.

---

## El WochenKontextSchema: corazón del sistema

```typescript
// week-context.schema.ts
const WochenKontextSchema = z.object({
  weekId: z.string(),
  level: z.enum(['aleman1', 'aleman2']),
  gesehen: z.object({
    grammatik: z.array(z.string()),   // ['Verbzweistellung', 'Nominativ']
    lexikon: z.array(z.string()),
    soziopragmatik: z.array(z.string()),
  }),
  nicht_gesehen: z.array(z.string()), // lo que está prohibido corregir
  korrektur: z.object({
    erlaubt: z.array(z.string()),     // qué puede corregir la IA
    verboten: z.array(z.string()),    // qué NO debe tocar
    fehlertoleranz: z.string(),       // nivel de tolerancia al error
    anti_overcorrection: z.boolean(),
  }),
});
```

Este schema elimina: prompts mágicos, lógica dispersa, interpretaciones ambiguas. La IA no decide qué corregir — obedece lo que el dominio declara.

---

## El flujo del sistema (producto)

```
1. Frontend envía: { text, studentName, kurs, woche }
          ↓
2. Backend carga week-context por (kurs, woche)
          ↓
3. Zod valida el contrato
          ↓
4. prompt-builder construye el prompt DESDE el dominio
   (lo que se vio, lo que no se vio, límites de corrección)
          ↓
5. IA genera feedback dentro de los límites del dominio
          ↓
6. Supabase persiste: texto + feedback + pedagogical_context JSONB
          ↓
7. Dashboard muestra feedback al estudiante
```

El campo `pedagogical_context` en Supabase es clave: guarda un snapshot del contexto pedagógico en el momento de la entrega. Permite auditoría futura. Si las reglas cambian en la semana 5, las entregas de la semana 2 siguen auditables con las reglas que estaban vigentes cuando se entregaron.

---

## Desafíos técnicos reales resueltos

### OAuth con Supabase en Vercel Preview

**Síntoma:** Login con Google redirigía siempre a producción (`huhugerman.com`), rompiendo el flujo en deployments de preview.

**Causa raíz (diagnosticada via HAR file):** Supabase Auth (PKCE flow) inyecta `site_url` hardcodeado en el state token, ignorando el parámetro dinámico `redirectTo` en entornos de preview estrictos.

**Decisión tomada:** Aceptar que los preview deployments tienen funcionalidad de auth limitada. Enfocarse en estabilidad de producción. Documentar el tradeoff.

Este es un ejemplo de madurez de sistema: no todos los problemas se resuelven; algunos se documentan y se acotan.

### Gestión de latencia de IA

Los tiempos de respuesta de 3-8 segundos del proveedor de IA generaban percepción de sistema roto en el estudiante. Solución: spinners con mensajes que rotan mencionando explícitamente lo que se está analizando (`"Analizando Nominativ..."`, `"Revisando Akkusativ..."`). Los estudiantes percibían progreso en lugar de espera.

### Routing perdonador para slugs de semana

Estudiantes accedían a `/w1`, `/W01`, `/w01` indistintamente. El sistema normaliza todos al formato canónico antes de buscar la sesión, sin errores 404.

---

## Deudas técnicas documentadas (no errores: backlog)

Un sistema maduro distingue entre errores y deuda técnica consciente. Las deudas de este sistema al momento de archivar:

- `saveSubmission` sin tipar completamente con Zod
- Loader dinámico de semanas aún con lógica `if` en lugar de `map` en algunas rutas
- Migración formal del campo `student_name` pendiente
- Mock de IA en lugar de proveedor real en algunos entornos de prueba

> **La deuda documentada es una decisión, no una falla.**

---

## Por qué esto no era MVP al momento de archivarse

| Dimensión | MVP | Producto |
|-----------|-----|---------|
| Contexto pedagógico | Implícito (en la cabeza del profesor) | Explícito y tipado con Zod |
| Comportamiento de IA | "Inteligente" (sin límites) | Gobernada por dominio |
| Escalabilidad | Copiar prompts por semana | Añadir un archivo de semana |
| Corrección | Inconsistente | Controlada y predecible |
| Onboarding | Difícil | Guiado por estructura de dominio |
| Auditoría | Imposible | Snapshot en JSONB por entrega |

---

## Por qué el ADR llegó tarde (y qué enseña eso)

El ADR se escribió **después** del MVP, por descubrimiento posterior. No fue una decisión de arquitectura proactiva, fue una respuesta a fricciones reales que revelaron que el sistema no era gobernable.

Esto es honesto de admitir — y es exactamente lo que convierte este proyecto en evidencia de madurez técnica. Un desarrollador junior hubiera seguido parcheando prompts. La decisión de parar, reconocer el problema de dominio, y refactorizar hacia DDD requiere comprensión de por qué los sistemas se rompen.

El costo de no escribir un ADR desde el inicio: deuda técnica que se acumula silenciosamente hasta que el sistema depende del criterio humano para no romperse.

---

## Repositorio relacionado

Este portal es la contraparte del motor de identidad:

→ **[cse-identity-engine-german-edu](https://github.com/yassergandhi/cse-identity-engine-german-edu)**

---

## Sobre el autor

Yasser Gandhi Hernández Esquivel — Learning Systems Architect · AI-Driven Instructional Designer · German Language Expert C1. 15 años enseñando alemán en instituciones públicas mexicanas. Creador del método huhuGERMAN. 

→ [yassergandhi.dev](https://yassergandhi.dev) · [LinkedIn](https://linkedin.com/in/yassergandhi) · [huhugerman.com](https://huhugerman.com)

---

*Licencia: Uso educativo. Todos los derechos reservados.*

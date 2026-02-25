# feature/dynamic-lessons

**Domain-Driven Design refactoring branch for the huhuGERMAN platform.**

This branch marks the moment the project became a governable product. Not a technical upgrade — a mental shift in how the codebase models pedagogical knowledge.

---

## The Mental Shift

| Before | After |
|--------|-------|
| "What text does the frontend send to the AI?" | "What rules in the pedagogical domain allow this action?" |
| Working system | Pedagogically correct system |
| AI operates on full capability | AI operates within curriculum scope |

The first question produces a working system. The second produces a system where *working* means pedagogically correct, not just technically functional.

---

## What Triggered This Branch

Student feedback in 2024 Q2 surfaced a consistent pattern: **AI responses were correcting German grammar structures that had not yet been introduced in the course.**

Week 2 A1 students received corrections for:
- **Perfekt constructions** (not introduced until Week 5)
- **Akkusativ case** (not introduced until Week 7)

**The system was not broken.** Submissions arrived, feedback was saved, the student flow was uninterrupted. But the feedback was **pedagogically harmful** — it introduced anxiety about structures the student had no framework to understand.

**Root cause:** The AI had no domain. It operated on its full German language model capability. Nothing in the codebase told it:
- What week it was
- What had been taught
- What corrections were off-limits

This is the moment the project shifted from "technically functional" to "pedagogically coherent."

---

## Domain Structure: Single Source of Truth

```
src/lib/domain/
├── schemas/
│   └── week-context.schema.ts    ← Zod contract (single source of truth)
└── weeks/
    ├── a1-woche-01.ts            ← Week instance (validated at build)
    ├── a1-woche-02.ts
    ├── a1-woche-03.ts
    └── ...
```

### WochenKontextSchema: The Pedagogical Contract

```typescript
const WochenKontextSchema = z.object({
  woche: z.number().min(1).max(52),
  niveau: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']),
  
  gesehen: z.object({
    grammatik: z.array(z.string()),   // Grammar structures introduced so far
    vokabular: z.array(z.string()),   // Vocabulary domains active
    pragmatik: z.array(z.string()),   // Pragmatic functions covered
  }),
  
  nicht_gesehen: z.array(z.string()), // Structures FORBIDDEN from correction
  
  korrektur: z.object({
    erlaubt: z.array(z.string()),              // AI may correct these
    verboten: z.array(z.string()),             // AI must ignore these
    toleranz: z.array(z.string()),             // AI notes but doesn't penalize
    anti_ueberkorrektion: z.array(z.string()), // Anti-overcorrection directives
  }),
});

type WochenKontext = z.infer<typeof WochenKontextSchema>;
```

Week instances are TypeScript objects validated against this schema **at build time.** Malformed domain data fails loudly — not a runtime exception, not silent incorrect behavior.

Example week instance:

```typescript
// a1-woche-02.ts
export const A1_WOCHE_02: WochenKontext = {
  woche: 2,
  niveau: 'A1',
  gesehen: {
    grammatik: ['Nominativ', 'Präsens (regular verbs)', 'Artikel (bestimmt)'],
    vokabular: ['Familie', 'Beruf', 'Wohnen'],
    pragmatik: ['Sich vorstellen', 'Fragen stellen'],
  },
  nicht_gesehen: ['Perfekt', 'Akkusativ', 'Dativ', 'Konjunktiv'],
  korrektur: {
    erlaubt: ['Nominativ article agreement', 'Präsens conjugation'],
    verboten: ['Perfekt', 'Akkusativ', 'Dativ'],
    toleranz: ['Minor spelling variations'],
    anti_ueberkorrektion: [
      'Do not correct word order variations that are semantically correct',
      'Do not introduce structures not in gesehen.grammatik',
    ],
  },
};
```

---

## The Prompt-Builder Is Not Creative

The value is not in writing clever prompts. The value is in having a **typed domain that makes clever prompts unnecessary.**

```typescript
export function buildPrompt(
  studentText: string,
  context: WochenKontext
): string {
  return `
You are a German language instructor for a student at level ${context.niveau}, Week ${context.woche}.

STRUCTURES INTRODUCED SO FAR:
${context.gesehen.grammatik.map(g => `- ${g}`).join('\n')}

STRUCTURES NOT YET INTRODUCED (do NOT correct):
${context.nicht_gesehen.map(g => `- ${g}`).join('\n')}

CORRECTION RULES:
You may correct: ${context.korrektur.erlaubt.join(', ')}
You must NOT correct: ${context.korrektur.verboten.join(', ')}
You may note but not penalize: ${context.korrektur.toleranz.join(', ')}

ANTI-OVERCORRECTION:
${context.korrektur.anti_ueberkorrektion.map(r => `- ${r}`).join('\n')}

STUDENT TEXT:
${studentText}

Provide feedback in Spanish (L1). Be specific about what was corrected and why.
  `.trim();
}
```

The professor defined the rules. The builder executes them. The AI obeys.

---

## API Flow: Domain Governs AI

```
POST /api/submit
  ↓
getWeekContext(woche)
  ↓ Load pedagogical domain
WochenKontextSchema.parse(context)
  ↓ Zod validation (throws if invalid)
buildPrompt(text, context)
  ↓ Domain rules → AI prompt
deepseekClient.complete(prompt)
  ↓ AI executes domain rules
persistence.save({
  submission,
  feedback,
  pedagogical_context: context  ← JSONB snapshot (research audit trail)
})
  ↓
Student receives feedback aligned with what was taught
```

Every feedback response is permanently linked to the exact pedagogical context that produced it. This enables:

- **Reproducibility:** Given the same submission and context, feedback is deterministic (modulo AI variance)
- **Auditability:** Researchers can verify that feedback was pedagogically appropriate
- **Iteration:** Future versions can analyze which feedback patterns correlate with student learning

---

## Documented Debts: Known, Tracked, Intentional

Not silent. Not hidden. Documented.

| Debt | Location | Status | Plan |
|------|----------|--------|------|
| Partial TypeScript typing on some fields | `saveSubmission()` | Known | Migrate to full strict mode |
| Residual `if` in fallback route | Unauthenticated preview path | Known | Apply registry pattern |
| Legacy `student_name` column | Supabase schema | Known | Migrate to UUID-only reference |

**Documented debt is a decision.** Undocumented debt is a liability.

---

## Why This Branch Demonstrates Learning Systems Architecture

Converting pedagogical knowledge into typed domain schemas is the core competency of a Learning Systems Architect. Anyone can write an AI prompt. Encoding years of curriculum design into a type-safe contract that governs AI behavior — that requires both domains simultaneously.

This branch demonstrates:

**Pedagogy as constraint:** The AI is not maximally capable — it is pedagogically appropriate. This is harder to design than "let the AI do everything it can."

**Type safety as governance:** Zod schemas are not just for data validation. They are the codification of pedagogical decisions. A malformed schema fails loudly, preventing silent pedagogical errors.

**Domain-driven error handling:** When the AI receives a prompt built from the domain, it is not receiving generic instructions. It is receiving the specific rules of this week's curriculum. The error handling is domain-aware.

**Observability for research:** The JSONB context snapshot is not a log — it is research data. Every feedback instance is permanently linked to its pedagogical context, enabling future analysis of what feedback correlates with learning.

**Debt as decision:** Documented debts show that the system is mature enough to acknowledge imperfection. An immature system hides debt. A mature system documents it and plans for it.

---

## Stack

| Category | Technologies |
|----------|---------------|
| **Language** | TypeScript |
| **Validation** | Zod |
| **Frontend** | Astro |
| **Backend / Data** | Supabase · PostgreSQL |
| **AI** | DeepSeek API |
| **Patterns** | Domain-Driven Design · Type-driven development |

---

## Related Repositories

→ **[huhugerman.com](https://huhugerman.com)** — Production system  
→ **[huhugerman-frontend](https://github.com/yassergandhi/huhugerman-frontend)** — Student portal (Astro + DeepSeek AI)  
→ **[huhugerman-backend](https://github.com/yassergandhi/huhugerman-backend)** — Identity resolution engine  
→ **[resilient-api-integration-demo](https://github.com/yassergandhi/resilient-api-integration-demo)** — Chaos engineering diagnostic

---

## About the Author

**Yasser Gandhi Hernández Esquivel** — The Purple Squirrel of EdTech

Learning Systems Architect · AI-Driven Instructional Designer · German Language Expert C1

This branch is the manifestation of a core principle: **pedagogy is not a constraint on engineering — it is the foundation of engineering.** The moment the codebase began to model pedagogical knowledge explicitly, the system became governable. Before that moment, it was a tool. After that moment, it was a system.

15 years of teaching in Mexican public institutions taught me that the best systems are the ones where the domain is visible in the code, not hidden in comments or spreadsheets.

→ [yassergandhi.dev](https://yassergandhi.dev) · [LinkedIn](https://linkedin.com/in/yassergandhi)

---

*License: Educational use. All rights reserved.*

*HIER DARFST DU FEHLER MACHEN.*

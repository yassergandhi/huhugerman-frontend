# huhugerman-frontend

**Student-facing portal for the huhuGERMAN platform.**

An Astro + Supabase application that delivers AI-powered feedback on German writing exercises — constrained by a typed pedagogical domain so the AI only corrects what has actually been taught.

---

## The Core Problem This Solves

Early versions of the portal used DeepSeek AI without explicit pedagogical context. The AI was technically capable of correcting Perfekt constructions, Akkusativ case, and subordinate clauses. The problem: Week 2 A1 students had not been introduced to any of those structures.

**Real feedback from a student, 2024:**

> *"La IA corrige cosas que no he enseñado todavía."*
>
> — Documented classroom friction that triggered the DDD refactoring sprint

A technically functional system was producing **pedagogically incoherent feedback.** Students were receiving corrections for mistakes they couldn't yet understand. The AI had no domain — it was operating on its full German linguistic capability rather than on the week's curriculum.

**The fix was not prompt engineering. It was domain separation.**

---

## How the Domain Governs the AI

The portal loads a `WochenKontextSchema` (Week Context Schema) before constructing any prompt. The schema is a Zod-typed contract that specifies exactly what the AI may and may not correct:

```typescript
interface WochenKontext {
  woche: number;
  niveau: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  
  gesehen: {
    grammatik: string[];    // Grammar structures taught this week
    vokabular: string[];    // Vocabulary domains introduced
    pragmatik: string[];    // Pragmatic functions covered
  };
  
  nicht_gesehen: string[];  // Structures FORBIDDEN from correction
  
  korrektur: {
    erlaubt: string[];      // What AI may correct
    verboten: string[];     // What AI must ignore
    toleranz: string[];     // What AI notes but doesn't penalize
    anti_ueberkorrektion: string[];  // Anti-overcorrection directives
  };
}
```

The `prompt-builder` receives this schema and constructs the AI prompt from it. **The AI does not decide what to correct.** The schema decides. The AI executes.

This is the difference between:
- **Without domain:** AI corrects everything it can detect
- **With domain:** AI corrects only what the schema permits

---

## Architecture: Before and After

### Before (MVP)

```
src/
├── lib/
│   ├── roadmap.js         ← implicit curriculum context
│   └── ai-service.ts      ← prompt constructed ad-hoc
```

The prompt was built from a flat roadmap object with no type enforcement. If the roadmap was wrong, the AI would silently produce incorrect feedback. No validation. No audit trail.

### After (Product)

```
src/
├── lib/
│   ├── domain/
│   │   ├── schemas/
│   │   │   └── week-context.schema.ts    ← Zod contract (source of truth)
│   │   └── weeks/
│   │       ├── a1-woche-01.ts            ← Week instance
│   │       ├── a1-woche-02.ts            ← (validated at build time)
│   │       └── ...
│   ├── ai/
│   │   ├── ai-client.ts
│   │   └── prompt-builder.ts             ← builds from domain, not free text
│   └── roadmap.ts
```

The schema is the **single source of truth.** Week instances are validated against it at build time. Incorrect domain data fails loudly rather than silently producing wrong AI behavior.

---

## Submission Flow: Domain-Constrained Feedback

```
Student submits exercise text
        ↓
Frontend sends to POST /api/submit
        ↓
Backend loads WochenKontext for current week
        ↓
Zod validates the context (fail-fast if malformed)
        ↓
prompt-builder constructs AI prompt from schema
        ↓
DeepSeek API returns pedagogically scoped feedback
        ↓
Supabase persists: submission + feedback + JSONB context snapshot
        ↓
Student receives feedback aligned with what was taught
```

The **JSONB context snapshot** is the audit trail for the research layer. Every feedback response is permanently linked to the exact pedagogical context that produced it. This enables:

- **Reproducibility:** Given the same submission and context, the feedback is deterministic (modulo AI variance)
- **Auditability:** Researchers can verify that feedback was pedagogically appropriate
- **Iteration:** Future versions can analyze which feedback patterns correlate with student learning

---

## Technical Decisions and Trade-offs

### OAuth / Supabase Auth

The PKCE flow hardcodes `site_url` in the Supabase project configuration. This breaks authentication on Vercel preview deployments.

**Decision:** Accept limited auth capability in preview environments, prioritize production stability. Preview deployments are for layout QA, not functional testing.

### Latency Management

DeepSeek responses take 2–8 seconds. The portal displays rotating German messages during the wait:

- "Analysiere Nominativ..."
- "Überprüfe Artikel..."
- "Prüfe Wortstellung..."

This is not cosmetic. It reinforces that something linguistically specific is happening, which is consistent with the pedagogical framing of the method. The student sees that the system is thinking about *their* German, not just generating generic feedback.

### Why the ADR Arrived Late

The MVP validated the user flow, not the pedagogical model. The system worked — students submitted, feedback arrived, the classroom flow was not disrupted. The domain debt became visible only when real friction appeared at scale.

**Documented debt is a decision, not a failure.** The moment the friction appeared ("La IA corrige cosas que no he enseñado todavía"), the refactoring was inevitable and justified.

---

## Why This Demonstrates Learning Systems Architecture

A developer builds a feature that works. A learning systems architect ensures that what works is also pedagogically coherent.

This frontend demonstrates:

**Pedagogical domain as constraint:** The AI is not maximally capable — it is pedagogically appropriate. This is harder to design than "let the AI do everything it can."

**Type safety as pedagogy:** Zod schemas are not just for data validation. They are the codification of pedagogical decisions. A malformed schema fails loudly, preventing silent pedagogical errors.

**Observability for research:** The JSONB context snapshot is not a log — it is research data. Every feedback instance is permanently linked to its pedagogical context, enabling future analysis of what feedback correlates with learning.

**Latency as communication:** The rotating German messages during AI processing are not UX filler. They are part of the pedagogical framing — they communicate that the system understands the student's German and is responding to it specifically.

---

## Stack

| Category | Technologies |
|----------|---------------|
| **Frontend** | Astro · TypeScript · Tailwind CSS |
| **Backend / Data** | Supabase · PostgreSQL · Zod |
| **AI** | DeepSeek API |
| **Infrastructure** | Vercel |
| **Patterns** | Domain-Driven Design · Type-driven development |

---

## Related Repositories

→ **[huhugerman.com](https://huhugerman.com)** — Production system  
→ **[huhugerman-backend](https://github.com/yassergandhi/huhugerman-backend)** — Identity engine (SHA-256, UUID, normalization)  
→ **[feature/dynamic-lessons](https://github.com/yassergandhi/huhugerman)** — DDD refactoring branch  
→ **[resilient-api-integration-demo](https://github.com/yassergandhi/resilient-api-integration-demo)** — Chaos engineering diagnostic

---

## About the Author

**Yasser Gandhi Hernández Esquivel** — The Purple Squirrel of EdTech

Learning Systems Architect · AI-Driven Instructional Designer · German Language Expert C1

This frontend is the manifestation of a core principle: **the AI is not the system. The pedagogy is the system.** The AI is a tool that the pedagogy constrains. This distinction is the difference between a platform that generates feedback and a platform that generates learning.

→ [yassergandhi.dev](https://yassergandhi.dev) · [LinkedIn](https://linkedin.com/in/yassergandhi)

---

*License: Educational use. All rights reserved.*

*HIER DARFST DU FEHLER MACHEN.*

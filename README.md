# huhugerman-frontend

**Student-facing portal for the huhuGERMAN platform.**

An Astro + Supabase application that delivers AI-powered feedback on German writing exercises, scoped by a per-activity system prompt so the AI corrects only what's been taught in that week's lesson.

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

In `main`, domain scoping is not schema-driven. `src/pages/api/submit.ts` hardcodes a single system prompt (Spanish, ~60 lines) that describes both tracked activities — Alemán 1 (A1: W-Fragen, verbs *heißen/wohnen/kommen/sein*) and Alemán 2 (A1+/A2: Tagesablauf, separable verbs) — and instructs the model to infer from the student's text which one applies before responding. There is no `WochenKontextSchema`, no Zod validation, and no `prompt-builder`. See [Architecture: Before and After](#architecture-before-and-after) below for what was designed to replace this and why it isn't running.

---

## Architecture: Before and After

### Before (MVP) — this is what's running in `main`
```
src/
├── lib/
│   ├── roadmap.js          ← implicit curriculum context
│   └── openai.js           ← DeepSeek client
└── pages/
    └── api/
        └── submit.ts        ← hardcoded system prompt, no schema
```

The prompt is a fixed string with no type enforcement. If it's wrong, the AI silently produces incorrect feedback. No validation, no audit trail. This is not a simplified description — it is the exact code path `main` runs today.

### After (Product) — designed, not shipped

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

This design exists only on the `feature/dynamic-lessons` branch, which has never been merged into `main` (`git merge-base --is-ancestor origin/feature/dynamic-lessons main` fails). The branch is inactive. `zod` is not a dependency in `main`'s `package.json`, and nothing under `src/lib/domain/` exists in `main`. Treat this section as the intended architecture, not the current one.

---

## Submission Flow: What Actually Runs (main)
```
Student submits exercise text
        ↓
Frontend sends to POST /api/submit
        ↓
submit.ts sends the hardcoded system prompt + student text to DeepSeek
        ↓
DeepSeek API returns feedback
        ↓
Frontend upserts to Supabase `submissions`:
  user_id, user_email, session_id, content_text, ai_feedback
        ↓
Student receives feedback
```

There's no context-loading step, no schema validation, and no JSONB snapshot — the upsert above is the entire persisted record. Reproducibility, auditability, and correlating feedback with learning outcomes are goals the `feature/dynamic-lessons` design was meant to serve, not capabilities this flow has today.

---

## Technical Decisions and Trade-offs

### OAuth / Supabase Auth

The PKCE flow hardcodes `site_url` in the Supabase project configuration. This breaks authentication on Vercel preview deployments.

**Decision:** Accept limited auth capability in preview environments, prioritize production stability. Preview deployments are for layout QA, not functional testing.

### Latency Management

DeepSeek responses take 2–8 seconds. The portal displays rotating German messages during the wait:

- *"Analysiere Nominativ..."*
- *"Überprüfe Artikel..."*
- *"Prüfe Wortstellung..."*

This is not cosmetic. It reinforces that something linguistically specific is happening — consistent with the pedagogical framing of the h.u.h.u. method. The student sees that the system is responding to *their* German, not generating generic feedback.

### Why the ADR Arrived Late

The MVP validated the user flow, not the pedagogical model. The system worked — students submitted, feedback arrived, the classroom flow was not disrupted. The domain debt became visible only when real friction appeared at scale.

**Documented debt is a decision, not a failure.** The moment the friction appeared ("La IA corrige cosas que no he enseñado todavía"), the refactoring was inevitable and justified. That quote is in the research data for the article targeting *Die Unterrichtspraxis* (May 2026).

---

## Why This Demonstrates Learning Systems Architecture

A developer builds a feature that works. A learning systems architect ensures that what works is also pedagogically coherent.

**Pedagogical domain as constraint:** The AI is not maximally capable — it is pedagogically appropriate. This is harder to design than "let the AI do everything it can."

**Type safety as pedagogy (designed, not shipped):** the `feature/dynamic-lessons` branch codifies pedagogical decisions as Zod schemas so a malformed one fails loudly instead of producing silent pedagogical errors. `main` has none of this — the domain lives entirely inside the hardcoded prompt in `submit.ts`.

**What's actually persisted:** each submission's `user_id`, `user_email`, `session_id`, `content_text`, and `ai_feedback` land in Supabase. There's no context snapshot to analyze — correlating feedback with learning outcomes would require the unshipped domain layer.

**Latency as communication:** The rotating German messages during AI processing are not UX filler. They communicate that the system understands the student's German and is responding to it specifically.

---

## Stack

| Category | Technologies |
|----------|---------------|
| **Frontend** | Astro · TypeScript · Tailwind CSS |
| **Backend / Data** | Supabase · PostgreSQL |
| **AI** | DeepSeek API |
| **Infrastructure** | Vercel |

---

## Related

→ **[huhugerman.com](https://huhugerman.com)** — Production system (input auténtico desde A1 · 2011→)  
→ **[huhugerman-backend](https://github.com/yassergandhi/huhugerman-backend)** — Identity engine (SHA-256, UUID, normalization)  
→ **[huhugerman-mvp-notes](https://github.com/yassergandhi/huhugerman-mvp-notes)** — PRD, MVP contract, type definitions  
→ **[resilient-api-integration-demo](https://github.com/yassergandhi/resilient-api-integration-demo)** — Chaos engineering diagnostic

---

## About

**Yasser Gandhi Hernández Esquivel**

Profesor-investigador de alemán · Desarrollador web (Lic. UdeG) · Fundador de huhuGERMAN

Lic. Letras Alemanas UNAM (2012) · MEd Pedagogía UNAM (2020) · Lic. Desarrollo de Sistemas Web UdeG (2025, GPA 98.5) · C1 Hochschule Offenburg (2019)

This frontend is the manifestation of a core principle: **the AI is not the system. The pedagogy is the system.** The AI is a tool that the pedagogy constrains. This distinction is the difference between a platform that generates feedback and a platform that generates learning.

→ [yassergandhi.dev](https://yassergandhi.dev) · [LinkedIn](https://linkedin.com/in/yassergandhi)

---

*HIER DARFST DU FEHLER MACHEN.*
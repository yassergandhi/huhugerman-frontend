# huhugerman-frontend

**Experimental student-facing portal for the huhuGERMAN project.**

This repository contains two different states of the application that should not be conflated:

- `main` — the working Astro portal that submits student text to an AI API and persists the resulting feedback;
- `feature/dynamic-lessons` — an unmerged refactoring branch that explores a typed pedagogical domain with Zod.

The branch is important engineering evidence, but it is not production functionality.

## The problem that became visible

Early portal experiments could produce feedback that was linguistically valid but inappropriate for the student's current course context. A model capable of correcting German broadly does not automatically know what a particular student has already been taught.

That distinction matters:

> Technically valid output can still be wrong for the domain in which it is used.

The initial implementation handled this through a fixed system prompt. The later branch explored moving those constraints into typed code.

## What runs in `main`

The current `main` branch uses:

- Astro;
- TypeScript;
- Supabase client integration;
- an OpenAI-compatible client pointed at DeepSeek;
- a server-side submission endpoint.

The high-level flow is:

```text
Student submits text
        ↓
POST /api/submit
        ↓
fixed pedagogical system prompt + submission
        ↓
DeepSeek API
        ↓
feedback returned
        ↓
submission / feedback persisted through Supabase
```

The pedagogical context in `main` is prompt-based. There is no Zod-backed weekly domain model in the default branch.

## What the `feature/dynamic-lessons` branch adds

The branch introduces a different architectural idea:

```text
curriculum/domain data
        ↓
Zod schema validation
        ↓
allowed / forbidden / tolerated correction rules
        ↓
prompt built from validated domain context
        ↓
AI response
```

The branch contains a substantial `WochenKontextSchema` that models curriculum state and correction constraints explicitly.

This branch is useful because it turns an informal rule — "do not correct material that has not been introduced" — into data that code can validate.

It remains experimental and unmerged.

## Domain > AI

The lesson from the branch is not that a longer prompt is always better.

It is that an AI integration becomes more governable when the application owns the rules that matter to the domain.

In this experiment:

- the model may generate language feedback;
- the application defines the curriculum boundaries;
- validation occurs before those rules are sent to the model;
- unsupported capabilities are not treated as automatically desirable behavior.

This principle is transferable beyond education: model capability and application authority are not the same thing.

## Known boundaries

This repository should not be used to claim that:

- the typed domain branch is deployed in production;
- every AI response is reproducible;
- a complete research audit trail is stored for each response;
- the portal represents the private production data-collection pipeline;
- huhuGERMAN software has been running since the beginning of the teaching trajectory.

The private production workflow is `huhugerman-instrument`, a separate Google Apps Script system.

## Stack by branch

| Branch / status | Technologies |
|---|---|
| `main` | Astro · TypeScript · Supabase client · DeepSeek API · Vercel adapter |
| `feature/dynamic-lessons` | Astro · TypeScript · Zod · Supabase client · DeepSeek API |
| Private production workflow | Google Apps Script · Google Forms · Google Sheets (`huhugerman-instrument`) |

## Related repositories

- [huhugerman-backend](https://github.com/yassergandhi/huhugerman-backend) — identity-normalization prototype
- [huhugerman_mvp_notes](https://github.com/yassergandhi/huhugerman_mvp_notes) — pre-implementation design history
- [resilient-api-integration-demo](https://github.com/yassergandhi/resilient-api-integration-demo) — controlled API failure demo
- `huhugerman-instrument` — private production Form/submission pipeline

## About

**Yasser Gandhi Hernández Esquivel**

Software Developer · German lecturer and researcher

B.S. Web Systems Development (UdeG, 2025) · M.Ed. Pedagogy (UNAM, 2020) · German Studies (UNAM, 2012)

[LinkedIn](https://linkedin.com/in/yassergandhi)

# feature/dynamic-lessons

**Experimental domain-modeling branch for `huhugerman-frontend`.**

This branch explores a specific engineering question:

> How can an application constrain AI behavior using explicit domain rules instead of relying on a free-form prompt alone?

It is not merged into `main`, and it should not be described as production functionality.

## Why this branch exists

The portal reached a point where a model could produce feedback that was linguistically valid but outside the student's current instructional context.

The important failure was not transport, persistence or rendering. The application could work technically while still producing the wrong kind of feedback for the situation.

That exposed a domain problem:

- the model knew more German than the student had been taught;
- the application did not yet encode those curricular boundaries as data;
- the prompt alone was carrying rules that the codebase could not validate.

This branch moves those constraints toward a typed domain model.

## The domain contract

The central artifact is:

`src/lib/domain/schemas/week-context.schema.ts`

It uses Zod to model curriculum state and correction policy, including:

- course and week;
- grammar already introduced;
- vocabulary domains;
- sociopragmatic content;
- structures that have not yet been introduced;
- rules for what may be corrected;
- rules for what must not be corrected;
- tolerance settings and anti-overcorrection constraints.

A simplified view is:

```text
weekly curriculum context
        ↓
Zod validation
        ↓
what was learned / not learned
        ↓
allowed / forbidden / tolerated correction behavior
        ↓
AI prompt constructed from domain data
```

The value is not a clever prompt. The value is making important rules inspectable and validatable before the model receives them.

## Example principle: domain > AI

A general-purpose model may be capable of correcting a structure.

That does not mean the application should authorize that correction.

This branch separates:

```text
model capability
        ≠
application authority
```

That distinction is useful beyond language education. In any domain-sensitive AI integration, the application should own the constraints that define acceptable behavior.

## What is implemented on this branch

The branch includes:

- TypeScript;
- Astro;
- Zod as a dependency;
- `WochenKontextSchema` and related sub-schemas;
- typed curriculum data;
- correction-policy structures;
- helper functions for schema validation.

These are real branch artifacts.

## What should not be claimed

This branch does **not** prove that:

- the refactor is deployed;
- every weekly context is complete;
- every AI response is deterministic;
- every response is stored with a permanent context snapshot;
- the design has been validated as a commercial product;
- the author has senior software-engineering tenure.

The branch is evidence of an architectural experiment and learning process, not of a production migration.

## Relationship to `main`

`main` currently uses a fixed system prompt inside the submission flow. It does not use this Zod-backed weekly domain model.

The branch therefore represents an intended architectural direction that was implemented experimentally but never merged.

That difference is part of the repository history and should remain visible.

## Stack

| Category | Technologies |
|---|---|
| Language | TypeScript |
| Framework | Astro |
| Validation | Zod |
| Data / API clients | Supabase client · OpenAI-compatible client / DeepSeek |
| Pattern explored | Typed domain constraints for AI behavior |

## Related repositories

- [huhugerman-frontend](https://github.com/yassergandhi/huhugerman-frontend) — current default branch
- [huhugerman-backend](https://github.com/yassergandhi/huhugerman-backend) — identity-normalization prototype
- [huhugerman_mvp_notes](https://github.com/yassergandhi/huhugerman_mvp_notes) — pre-implementation design history
- [resilient-api-integration-demo](https://github.com/yassergandhi/resilient-api-integration-demo) — public failure-handling demo
- `huhugerman-instrument` — private production Forms/submission workflow

## About

**Yasser Gandhi Hernández Esquivel**

Software Developer · German lecturer and researcher

B.S. Web Systems Development (UdeG, 2025) · M.Ed. Pedagogy (UNAM, 2020) · German Studies (UNAM, 2012)

[LinkedIn](https://linkedin.com/in/yassergandhi)

---

*HIER DARFST DU FEHLER MACHEN.*

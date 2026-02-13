# Domain Driven Pedagogy Demo

> **[ARCHIVED · Post-Mortem · Learning Artifact]**

A case study in **tolerant identity resolution**, **domain-driven constraints**, and **operational transparency** for educational environments where user behavior is imperfect but learning must continue uninterrupted.

This repository demonstrates how to design systems that **correct instead of punish**, with explicit contracts between pedagogy and technology.

---

## 🎯 What Problem Did This Solve?

### Real-World Context

University students (UAM/UNAM) submitted German writing assignments asynchronously via mobile devices. The friction was real:

| User Behavior | System Constraint |
|---------------|-------------------|
| Google Forms opened with **personal Gmail** instead of institutional account | Authentication was unreliable on mobile |
| Email typos: `gamil.com`, `hotmal.com`, missing dots | No validation at form level |
| Incomplete names: "Ana", "Carlos G.", "Profesor" | No enforced structure |
| Same person, different emails across submissions | No persistent session |

**Traditional systems would block these users.**
This system chose to **observe, flag, and continue**.

---

## 📊 Before: Google Sheets + Apps Script (The Audit Trail)

### Raw Submission Structure

When students submitted via Google Forms, this is what the intake sheet looked like:

| timestamp | email | firstName | lastName | matricula | week | content | email_normalized | name_normalized | identity_hash | flags |
|-----------|-------|-----------|----------|-----------|------|---------|------------------|-----------------|---------------|-------|
| 2026-01-15 14:23:11 | ana.gamil.com | Ana | García | 12345678 | w01 | Hallo! Ich... | ana@gmail.com | Ana García | `a3f5...` | `EMAIL_CORRECTED` |
| 2026-01-15 14:25:44 | ana@gmail.com | Ana | Garcia | 12345678 | w01 | Hallo! Ich... | ana@gmail.com | Ana García | `a3f5...` | `DUPLICATED_USER` |
| 2026-01-16 09:12:03 | carlos.hotmal.com | Carlos | G. | 87654321 | w01 | Guten Tag... | carlos@hotmail.com | Carlos G. | `b7e2...` | `EMAIL_CORRECTED`, `INCOMPLETE_NAME` |
| 2026-01-16 09:15:22 | carlos@hotmail.com | Carlos | Gómez | 87654321 | w01 | Guten Tag... | carlos@hotmail.com | Carlos Gómez | `c9d1...` | `POSSIBLE_MATCH` |
| 2026-01-17 16:44:09 | maria@azc.uam.mx | María | López | 23456789 | w01 | Ich heiße... | maria@azc.uam.mx | María López | `d4f8...` | `INSTITUTIONAL_EMAIL` |
| 2026-01-18 11:33:55 | external.user@gmail.com | Juan | Pérez | (blank) | w01 | Hello... | external.user@gmail.com | Juan Pérez | `e2a7...` | `EXTERNAL_STUDENT` |

### Flag Taxonomy

| Flag | Trigger | Action |
|------|---------|--------|
| `EMAIL_CORRECTED` | Heuristic domain fix (`gamil` → `gmail`) | Log correction, continue |
| `DUPLICATED_USER` | Same `identity_hash` but different submission | Mark for audit, allow resubmission |
| `INCOMPLETE_NAME` | Last name missing or abbreviated | Flag for manual review |
| `POSSIBLE_MATCH` | Similar hash but not exact match | Suggest merge to admin |
| `EXTERNAL_STUDENT` | No institutional email or matrícula | Allow, but track separately |
| `INSTITUTIONAL_EMAIL` | `@azc.uam.mx` or `@correo.unam.mx` | High trust identity |

### The Identity Fingerprinting Algorithm

```javascript
// Google Apps Script — identity-normalization.gs
function generateIdentityHash(email, matricula, fullName) {
  // Normalize inputs
  const cleanEmail = email
    .toLowerCase()
    .replace(/gamil\.com$/, 'gmail.com')
    .replace(/hotmal\.com$/, 'hotmail.com');
  
  const cleanName = fullName
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
  
  // Composite key: email + matricula + name
  const identityString = [cleanEmail, matricula || '', cleanName].join('|');
  
  // SHA-256 hash as system-owned UUID
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    identityString
  );
  
  return digest.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}
```

**Key insight**: The system never blocked a submission. It only **annotated** it for later audit.

---

## 🚀 Why We Migrated to Supabase

### The Breaking Constraint: POST Requests

Google Apps Script **cannot receive POST requests** from external frontends. This became a hard limit when we needed to:

1. Send student submissions from an Astro frontend
2. Call DeepSeek API for AI feedback
3. Persist the AI response in the backend
4. Return structured feedback to the student

```javascript
// ❌ GAS limitation
// No way to receive this from Astro frontend
fetch('https://script.google.com/macros/...', {
  method: 'POST', // ← GAS only supports GET
  body: JSON.stringify(submission)
});
```

### The Supabase Advantage

| Requirement | GAS + Sheets | Supabase |
|-------------|--------------|----------|
| **POST endpoints** | ❌ Impossible | ✅ Native |
| **Relational data** | ❌ Flat tables | ✅ PostgreSQL |
| **Type safety** | ❌ Dynamic | ✅ Zod schemas |
| **Auth integration** | ❌ Manual | ✅ OAuth Google built-in |
| **RLS policies** | ❌ None | ✅ Row-level security |
| **API latency** | ⚠️ Variable | ✅ Predictable |

---

## 🗄️ After: Normalized Database Schema

### Entity-Relationship Overview

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles (academic identity)
    ↓ (1:N)
submissions (student work)
    ↓ (1:1)
feedback (AI response)
```

### Table: `profiles`

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  matricula TEXT,
  assigned_level TEXT DEFAULT 'aleman1',
  identity_hash TEXT UNIQUE NOT NULL,
  flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

### Table: `submissions`

```sql
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  week_id TEXT NOT NULL, -- e.g., 'a1-w01'
  content TEXT NOT NULL,
  context_snapshot JSONB NOT NULL, -- Pedagogical constraints at time of submission
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_user_week 
  ON submissions(user_id, week_id);
```

### Table: `feedback`

```sql
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  ai_response JSONB NOT NULL, -- { corrections: [...], suggestions: [...], tone: '...' }
  processing_time_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Sample Normalized Record

```json
{
  "profile": {
    "id": "uuid-abc123",
    "email": "ana@gmail.com",
    "first_name": "Ana",
    "last_name": "García",
    "matricula": "12345678",
    "identity_hash": "a3f5e8d2c7b9...",
    "flags": ["EMAIL_CORRECTED"]
  },
  "submission": {
    "id": "uuid-def456",
    "week_id": "a1-w01",
    "content": "Hallo! Ich heiße Ana. Ich wohne in Mexiko-Stadt.",
    "context_snapshot": {
      "gelernt": ["ich", "heißen", "wohnen", "in"],
      "nicht_gelernt": ["wo", "wie", "alt"],
      "darf_korrigieren": ["ich heiße", "ich wohne"],
      "darf_nicht_korrigieren": ["wohnst du", "wie alt"]
    }
  },
  "feedback": {
    "id": "uuid-ghi789",
    "ai_response": {
      "corrections": [
        {
          "original": "Mexiko-Stadt",
          "suggested": "Mexiko-Stadt",
          "explanation": "Correct! Note the hyphen."
        }
      ],
      "suggestions": [
        "Try adding a greeting: 'Hallo!'"
      ],
      "tone": "encouraging"
    },
    "processing_time_ms": 3245
  }
}
```

---

## 🧠 Domain-Driven Design: The Pedagogical Contract

### The Core Insight

The AI (DeepSeek) initially corrected **everything**—including grammar not yet taught. This confused students.

**Solution**: Encode the curriculum as explicit constraints in Zod schemas.

### Schema: `week-context.schema.ts`

```typescript
import { z } from 'zod';

export const WeekContextSchema = z.object({
  week_id: z.string().regex(/^a[12]-w\d{2}$/),
  level: z.enum(['A1', 'A2']),
  
  // What has been taught (allowed to correct)
  gelernt: z.object({
    vocabulary: z.array(z.string()),
    grammar: z.array(z.string()),
    structures: z.array(z.string())
  }),
  
  // What has NOT been taught (forbidden to correct)
  nicht_gelernt: z.object({
    vocabulary: z.array(z.string()),
    grammar: z.array(z.string()),
    structures: z.array(z.string())
  }),
  
  // Explicit correction boundaries
  darf_korrigieren: z.array(z.string()),
  darf_nicht_korrigieren: z.array(z.string()),
  
  // Pedagogical parameters
  max_fehler: z.number().default(5),
  ueberkorrektur_vermeiden: z.boolean().default(true),
  feedback_tone: z.enum(['encouraging', 'neutral', 'direct']).default('encouraging')
});

// Example: Week 1, A1
export const A1_W01_CONTEXT = WeekContextSchema.parse({
  week_id: 'a1-w01',
  level: 'A1',
  gelernt: {
    vocabulary: ['hallo', 'ich', 'heißen', 'wohnen', 'in'],
    grammar: ['ich + verb', 'basic greetings'],
    structures: ['Ich heiße...', 'Ich wohne in...']
  },
  nicht_gelernt: {
    vocabulary: ['wo', 'wie', 'alt', 'kommen'],
    grammar: ['interrogatives', 'wohnst/wohnt'],
    structures: ['Wo wohnst du?', 'Wie alt bist du?']
  },
  darf_korrigieren: ['ich heiße', 'ich wohne', 'capitalization'],
  darf_nicht_korrigieren: ['wohnst du', 'interrogatives', 'verb conjugation (2nd/3rd)'],
  max_fehler: 3,
  ueberkorrektur_vermeiden: true,
  feedback_tone: 'encouraging'
});
```

### How It Works

```typescript
// api/submit.ts
import { A1_W01_CONTEXT } from '@/lib/domain/schemas/week-context.schema';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate against pedagogical contract
  const validated = WeekContextSchema.parse(A1_W01_CONTEXT);
  
  // Call AI with explicit constraints
  const aiResponse = await callDeepSeek({
    text: body.content,
    constraints: {
      correct_only: validated.darf_korrigieren,
      ignore: validated.darf_nicht_korrigieren,
      max_corrections: validated.max_fehler
    }
  });
  
  // Persist with context snapshot
  await supabase.from('submissions').insert({
    user_id: userId,
    week_id: 'a1-w01',
    content: body.content,
    context_snapshot: validated // ← Immutable pedagogical contract
  });
  
  return new Response(JSON.stringify(aiResponse));
}
```

---

## ⚡ User Experience: Handling Latency

### The Problem

DeepSeek API responses took 3–8 seconds. A frozen UI would feel broken.

### The Solution: Contextual Spinners

```javascript
// components/FeedbackSpinner.astro
const feedbackMessages = [
  "Analizando Nominativ...",
  "Preparando Feedback...",
  "Revisando Akkusativ...",
  "Generando correcciones...",
  "Validando tu texto...",
  "Consultando Grammatik...",
  "Fast fertig..."
];

let currentMessage = feedbackMessages[0];
let messageIndex = 0;

// Rotate every 2 seconds
setInterval(() => {
  messageIndex = (messageIndex + 1) % feedbackMessages.length;
  currentMessage = feedbackMessages[messageIndex];
}, 2000);
```

**Result**: Users perceived progress, not failure.

---

## 📝 Architectural Decision Record (ADR)

### Why an ADR Was Indispensable

With competing sources of truth (DB schema, code, frontend, Sheets), we needed an explicit contract.

```markdown
# ADR-001: Migrate from GAS to Supabase

## Status
Accepted — 2026-01-15

## Context
- GAS cannot receive POST requests
- Relational data needed for submissions + feedback
- Type safety required for pedagogical constraints
- OAuth Google needed for institutional login

## Decision
Migrate backend to Supabase (PostgreSQL + Auth + Storage)

## Consequences
### Positive
- Clear separation: frontend (Astro) vs backend (Supabase)
- Type-safe API contracts with Zod
- Row-level security for student data
- Scalable relational model

### Negative
- Increased complexity vs Sheets
- Learning curve for RLS policies
- Auth redirect issues in Vercel Preview (known limitation)

## References
- https://supabase.com/docs
- https://github.com/colinhacks/zod
```

---

## 🔄 Migration Timeline

| Date | Milestone | Key Decision |
|------|-----------|--------------|
| 2025-11 | MVP with Google Forms + Sheets | Optimize for speed, accept technical debt |
| 2025-12 | Identity normalization script | Tolerate ambiguity, don't block users |
| 2026-01-10 | First AI integration (DeepSeek) | POST limitation discovered |
| 2026-01-15 | Decision: migrate to Supabase | ADR-001 documented |
| 2026-01-25 | Supabase schema designed | Normalized profiles + submissions |
| 2026-02-01 | Zod schemas implemented | Pedagogical constraints formalized |
| 2026-02-10 | Production deploy (Vercel) | SSR + Supabase Auth working |

---

## 🎓 Transferable Patterns

| Pattern | Evidence | Transferable To |
|---------|----------|-----------------|
| **Tolerant Identity Resolution** | `identity-normalization.gs`, SHA-256 fingerprinting | Onboarding flows, public forms, data migration |
| **Domain-Driven Constraints** | `week-context.schema.ts`, Zod validation | Fintech (compliance), Healthtech (regulations), Edtech (curriculum) |
| **Observability over Blocking** | Flags (`DUPLICATED_USER`, `EMAIL_CORRECTED`) | Fraud detection, user moderation, audit trails |
| **Contextual UX for Latency** | Rotating spinner messages | AI apps, batch processing, async workflows |
| **ADR as Source of Truth** | `ARCHITECTURAL_DECISIONS.md` | Any team needing explicit design rationale |
| **Pedagogical Snapshot** | `context_snapshot` JSONB field | Versioned business rules, compliance archiving |

---

## 💡 Key Learnings

### 1. Identity ≠ Authentication

In hybrid university environments, **tolerance beats perfection**. Students will use the wrong account, misspell emails, and submit incomplete names. The system's job is to **observe and adapt**, not to enforce purity.

### 2. Constraints Are Features

Encoding "what has been taught" as explicit schema constraints prevented AI over-correction. This is **domain-driven design** in practice: the business rule (pedagogy) became the technical contract.

### 3. Flags Enable Audit Without Friction

Instead of rejecting invalid submissions, we flagged them for later review. This reduced support tickets to **zero** for authentication issues.

### 4. Latency Must Be Acknowledged

A 5-second AI response feels broken if the UI is frozen. Contextual spinners ("Analizando Nominativ...") transformed perceived latency into **engagement**.

### 5. Documentation Is Code

The ADR became the single source of truth for architectural decisions. Without it, tribal knowledge would have created ambiguity.

---

## 🔗 Related Repositories

| Repository | Purpose | Status |
|------------|---------|--------|
| **[huhugerman-portal](https://github.com/yassergandhi/huhugerman-portal)** | Student-facing UI (Astro) | Archived |
| **Domain Driven Pedagogy Demo** | Backend, identity, schemas | Archived |
| **[yassergandhi.dev](https://yassergandhi.dev)** | Professional landing page | Active |

---

## 📜 License

Educational artifact. All code is documented for learning purposes.

---

## 🙏 Acknowledgments

This project served real students at UAM during the 26-P trimester. Their imperfect submissions taught more about system design than any theoretical exercise.

**The best systems are built for humans, not for ideal users.**
# cse-student-portal-german-edu

## 🏛️ Post-Mortem: Frontend Implementation & Pedagogical Constraints

**Status:** ARCHIVED · Learning Artifact · Real-World Implementation

This repository documents the **frontend evolution** of a German language education platform, showcasing how **Domain-Driven Design** and **defensive programming** were applied to create a frictionless student experience.

Originally used by real students at Universidad Autónoma Metropolitana (UAM), this portal solved **real pedagogical challenges** through technical constraints.

---

## 🎯 Problem Statement

### The Feedback Scope Problem

When integrating DeepSeek AI for automated writing feedback, a critical issue emerged:

> **The AI corrected grammar and vocabulary that students hadn't learned yet.**

This created confusion and undermined the pedagogical progression.

---

## 🗺️ From Roadmap.js to Domain-Driven Schemas

### Initial Approach: Roadmap Configuration

```javascript
// src/lib/roadmap.js (Initial version)

export const COURSE_CONFIG = {
  aleman1: {
    title: 'Alemán 1: Fundamentos',
    weeks: [
      { id: 'a1-w1', title: 'Woche 1: Begrüßungen', active: true },
      { id: 'a1-w2', title: 'Woche 2: Zahlen & Uhrzeit', active: false },
      // ...
    ]
  },
  aleman2: {
    title: 'Alemán 2: Erweiterung',
    weeks: [
      { id: 'a2-w1', title: 'Woche 1: Perfekt', active: true },
      // ...
    ]
  }
};
```

**Problem:** This was **configuration only**. No enforcement of pedagogical constraints.

---

### Evolution: Zod Schemas with Pedagogical Constraints

```typescript
// src/lib/domain/schemas/submission.schema.ts

import { z } from 'zod';

/**
 * Week Context Schema
 * Defines what has been taught and what is forbidden to correct
 */
export const WeekContextSchema = z.object({
  weekId: z.string().regex(/^[aw]\d{2}$/, 'Format: w01, w02, etc.'),
  level: z.enum(['aleman1', 'aleman2']),
  taughtGrammar: z.array(z.string()).describe('Grammar topics covered this week'),
  taughtVocabulary: z.array(z.string()).describe('Vocabulary introduced this week'),
  forbiddenCorrections: z.array(z.string()).describe('DO NOT correct these topics yet')
});

/**
 * Submission Input Schema
 * Enforces pedagogical constraints at the API boundary
 */
export const SubmissionInputSchema = z.object({
  // Identity fields (normalized by backend)
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  
  // Academic context
  week: z.string().regex(/^w\d{2}$/, {
    message: 'Week must be in format w01, w02, etc.'
  }),
  level: z.enum(['aleman1', 'aleman2']),
  
  // Content validation
  content: z.string()
    .min(50, 'Submission must be at least 50 characters')
    .max(2000, 'Submission cannot exceed 2000 characters'),
  
  // Pedagogical constraints (snapshot at submission time)
  pedagogicalContext: WeekContextSchema
});

// Example: Week 1 constraints for A1
export const A1_W01_CONTEXT = {
  weekId: 'a1-w01',
  level: 'aleman1' as const,
  taughtGrammar: ['Nominativ', 'Artikel (der/die/das)', 'Präsens'],
  taughtVocabulary: ['Begrüßungen', 'Zahlen 1-10', 'Familie'],
  forbiddenCorrections: [
    'Akkusativ',
    'Dativ',
    'Perfekt',
    'Adjektivdeklination',
    'Relativsätze'
  ]
} satisfies z.infer<typeof WeekContextSchema>;
```

### Key Innovation: Constraint Propagation

The professor (who was also the developer) could update the roadmap, and those constraints **automatically propagated** to:

1. **Frontend validation** (fail fast)
2. **AI prompt engineering** (scope feedback)
3. **Database audit trail** (pedagogical_context JSONB)

---

## 🤖 DeepSeek AI Integration

### The Feedback Pipeline

```typescript
// src/lib/ai-service.ts

import { A1_W01_CONTEXT, WeekContextSchema } from './domain/schemas/submission.schema';

export async function generateFeedback(
  content: string, 
  context: z.infer<typeof WeekContextSchema>
) {
  // Build prompt with explicit constraints
  const prompt = `
You are a German language tutor. Provide constructive feedback on this student's writing.

CONTENT:
${content}

PEDAGOGICAL CONTEXT:
- Level: ${context.level}
- Week: ${context.weekId}
- Taught grammar: ${context.taughtGrammar.join(', ')}
- Taught vocabulary: ${context.taughtVocabulary.join(', ')}
- FORBIDDEN CORRECTIONS: ${context.forbiddenCorrections.join(', ')}

RULES:
1. ONLY correct grammar and vocabulary that has been taught
2. DO NOT mention or correct forbidden topics
3. Be encouraging and specific
4. Provide 2-3 actionable suggestions maximum
5. Respond in Spanish (student's native language)

FEEDBACK:
`;
  
  // Call DeepSeek API
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

### Latency Management: Contextual Spinners

```typescript
// src/components/FeedbackSpinner.astro

const feedbackMessages = [
  "Analizando Nominativ...",
  "Preparando Feedback...",
  "Revisando Akkusativ...",
  "Generando correcciones...",
  "Validando tu texto...",
  "Consultando gramática...",
  "Preparando sugerencias..."
];

// Rotate messages during AI processing
let currentIndex = 0;
setInterval(() => {
  currentIndex = (currentIndex + 1) % feedbackMessages.length;
  document.getElementById('spinner-text').textContent = feedbackMessages[currentIndex];
}, 2000);
```

**Result:** Students perceived progress instead of waiting.

---

## 🔐 OAuth Challenges with Supabase Auth

### The Redirect Loop Problem

**Symptom:**
- Login with Google redirected to production (`huhugerman.com`)
- Vercel Preview deployments couldn't complete authentication
- Logout button would freeze

**Root Cause (Diagnosed via HAR file):**
Supabase Auth (PKCE flow) injected `site_url: https://huhugerman.com` into the state token, ignoring the dynamic `redirectTo` parameter in strict preview environments.

### Mitigation Strategy

```typescript
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true
  }
});

// Handle auth redirects
export async function handleOAuthRedirect() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Auth session error:', error);
    // Fallback to manual login
    return { session: null, error };
  }
  
  return { session: data.session, error: null };
}
```

**Decision:** Accept that Preview deployments would have limited auth functionality. Focus on production stability.

---

## 🛣️ Dynamic Routes with Forgiving Parsing

### Route Structure

```
/aleman1/w01
/aleman2/w03
```

### Forgiving Week Slug Normalization

```typescript
// src/pages/[level]/[week]/index.astro

import { COURSE_CONFIG } from '../../../lib/roadmap';

// Normalize week slug (handle typos: w1, W01, w01, etc.)
function normalizeWeekSlug(slug: string): string {
  // Remove leading 'w' or 'W'
  let normalized = slug.replace(/^[wW]/, '');
  
  // Pad with zero if single digit
  if (normalized.length === 1) {
    normalized = '0' + normalized;
  }
  
  // Re-add 'w' prefix
  return `w${normalized}`;
}

// Get session data
export async function getStaticPaths() {
  const paths = [];
  
  for (const [levelKey, levelConfig] of Object.entries(COURSE_CONFIG)) {
    for (const week of levelConfig.weeks) {
      if (week.active) {
        paths.push({
          params: { level: levelKey, week: week.slug },
          props: { session: week }
        });
      }
    }
  }
  
  return paths;
}

// Handle route requests
export async function get({ params }: any) {
  const { level, week } = params;
  const normalizedWeek = normalizeWeekSlug(week);
  
  // Find session (forgiving match)
  const levelConfig = COURSE_CONFIG[level as keyof typeof COURSE_CONFIG];
  const session = levelConfig?.weeks.find(w => 
    w.slug === normalizedWeek || w.id.includes(normalizedWeek)
  );
  
  if (!session) {
    return {
      status: 404,
      body: `Session not found: ${level}/${normalizedWeek}`
    };
  }
  
  return {
    body: { session, normalizedWeek }
  };
}
```

**Result:** Students could type `w1`, `W01`, or `w01` and still reach the correct session.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Student Portal                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   Astro      │    │   Zod        │    │  Supabase │ │
│  │   Pages      │───▶│   Schemas    │───▶│   Client  │ │
│  │   (SSR)      │    │   (DDD)      │    │           │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   DeepSeek   │◀───│   AI Service │                  │
│  │   API        │    │   (Prompt    │                  │
│  │              │    │   Engineering)│                  │
│  └──────────────┘    └──────────────┘                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 Related Repository

This frontend implementation is coupled with the identity resolution backend:

👉 **[cse-identity-engine-german-edu](https://github.com/yassergandhi/cse-identity-engine-german-edu)**

---

## 📚 Learning Outcomes

This repository demonstrates:

- ✅ **Domain-Driven Design** applied to pedagogical constraints
- ✅ **Defensive programming** with Zod schemas at API boundary
- ✅ **Progressive enhancement** (forgiving route parsing)
- ✅ **Latency management** with contextual UX feedback
- ✅ **OAuth integration challenges** and mitigation strategies
- ✅ **Constraint propagation** from configuration to AI prompts

---

## 🛠️ Local Development

```bash
# Clone repository
git clone https://github.com/yassergandhi/cse-student-portal-german-edu.git

# Install dependencies
npm install

# Run local dev server
npm run dev

# Build for production
npm run build
```

---

## 📄 License

Educational use. All rights reserved.

---

## 📝 Summary: What These Repositories Demonstrate

| Capability | Evidence | Transferable To |
|------------|----------|-----------------|
| **Identity Resolution** | SHA-256 fingerprinting, non-blocking flags | SaaS onboarding, form processing |
| **Progressive Migration** | Sheets → Supabase with zero downtime | Legacy system modernization |
| **Domain-Driven Design** | Zod schemas with pedagogical constraints | Complex business logic systems |
| **Defensive Programming** | Validation at API boundary (fail fast) | API development, microservices |
| **Observability** | Flags, audit trails, JSONB snapshots | Operational diagnostics |
| **Customer Success Mindset** | Friction reduction over perfection | CSE, Implementation Engineering |

These repositories are **not toy projects**. They solved **real problems for real users** under real constraints.
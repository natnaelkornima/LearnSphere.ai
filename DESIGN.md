# LearnSphere AI — Scholarly Editorial Design System (DESIGN.md)

## 1. Persona & Product Direction
- **Primary Audience**: University students, graduate researchers, and bar/medical examinees engaging with dense, multi-hundred-page academic texts.
- **Tone & Mood**: *Scholarly Editorial* — calm, authoritative, high-density, and disciplined. Replaces generic SaaS cards and cartoonish gamification with the feel of an Oxford reading room, high-end journal typography, and precision research tools.
- **Product Truth**: Every AI interaction is strictly grounded in primary-source literature with explicit page, chunk, and citation coordinates.

---

## 2. Color Palette & Substrates

### Warm Paper Substrates (Light Mode)
- **Primary Page Canvas**: `#f7f4ee` (Warm parchment tone)
- **Card Substrates**: `#faf8f5` (Crisp bookplate cream)
- **Deep Insets & Interactive Inputs**: `#ffffff` (Clear reading focus)
- **Hairline Borders**: `#e6dfd1` (Muted paper edge)
- **Secondary Hairlines**: `#efe9dc` / `#dfd7c5`

### Dark Academic Substrates (Dark Mode)
- **Dark Page Canvas**: `#12110f` (Carbon black)
- **Card Substrates**: `#171614` / `#1c1b18` (Warm slate soot)
- **Inputs & Focused Cards**: `#1f1d1a` / `#23211d`
- **Hairlines**: `#2a2723` / `#2e2a25`

### Typographic Inks & Accents
- **Oxford Ink (Headings & Primary Text)**: `#141b24` / `#1c2533` (Light mode), `#f7f4ee` / `#f0eee6` (Dark mode)
- **Body Ink**: `#3d4d65` / `#4a5568` (Light mode), `#d0dbe9` (Dark mode)
- **Citation & Emphasis Accent**: Terracotta (`#9e3722` / `#c2410c`) — used deliberately for citations, verifiable sources, and subtle markers.
- **Status Inks**: Muted academic emerald for correct answers / ready states, muted terracotta/amber for alerts.

---

## 3. Typographic Hierarchy & Craft Rules

```
Headings:    font-serif tracking-tight font-medium / font-semibold
Numerals:    font-mono tabular-nums
Body:        font-sans leading-relaxed text-neutral-800 dark:text-neutral-200
Captions:    font-serif italic text-xs / font-mono text-[10px] uppercase
```

### Craft Floor Violations (Strictly Prohibited)
1. **No Kickers / Eyebrows**: Never place small uppercase tags (e.g., `CURRICULUM`, `FEATURE`) directly above a heading. Hierarchy is established purely through scale, weight, and editorial white space.
2. **No Gradient Text**: Never apply `bg-clip-text text-transparent bg-gradient-to-...`. Headings must have authoritative ink density.
3. **No Emoji Icons**: All iconography must use clean SVG outlines (`Lucide` / `@/components/ui/Icons`).
4. **No Identical Icon-in-Circle Grids**: Feature matrices must feel differentiated (interactive consoles, metric ledgers, dual-pane inspectors).

---

## 4. UI-SDK Integration (`@ui-sdk/react` & `@ui-sdk/core`)

The application integrates `@ui-sdk/react` and `@ui-sdk/core` under Next.js 16 (React 19).

### CSS Layering (`src/app/globals.css`)
```css
@layer ui-sdk;
@import "tailwindcss";
@import "@ui-sdk/core/web.css" layer(components);
```
This guarantees that Tailwind CSS reset rules do not overwrite `@ui-sdk` component primitives.

### Adopted Primitives:
- **`@ui-sdk/react/tabs`**: Powers the Interactive Grounded Console on the landing page (`page.tsx`) and the global `src/components/ui/Tabs.tsx` component.
  - Exposes accessible keyboard tab navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
  - Styled via `data-selected:bg-white data-selected:shadow-xs`.
- **`@ui-sdk/react/dialog`**: Rebuilt `src/components/ui/Modal.tsx` using `Dialog`, `DialogBackdrop`, `DialogContent`, `DialogTitle`, and `DialogDescription`.
  - Accessible modal focus trapping, Escape key listener, and backdrop transition.

---

## 5. Architectural Suite Overview

1. **Landing Page (`/`)**:
   - Scholarly Editorial hero with serif title and directional primary actions.
   - Interactive `@ui-sdk/react` console demonstrating live Socratic chat, citation inspection, active recall flashcards, and evaluative quizzes.
   - Tabular metrics ledger and academic syllabus breakdown.
2. **Dashboard Overview (`/dashboard`)**:
   - Academic KPI ledger (`font-mono tabular-nums`).
   - Quick-access studio suite launches (Tutor, Flashcards, Quizzes, Summaries).
   - Recent indexed readings table with inline actions.
3. **Socratic AI Tutor (`/tutor`)**:
   - Dual-pane research desk: Left-hand Socratic dialogue, Right-hand citation coordinate inspector.
   - Citation pills directly open source text chunks with page numbers and confidence indicators.
4. **Spaced Retrieval Flashcards (`/studio/flashcards`)**:
   - Physical card simulation with 3D flip animation (`Space` key).
   - Spaced repetition rating tiers (`[1] Again`, `[2] Hard`, `[3] Good`, `[4] Easy`).
   - Session completion ledger with repeat review flows.
5. **Evaluative Assessments (`/studio/quizzes`)**:
   - Deterministic exam generation by cognitive rigor (Foundational, Standard, Advanced).
   - Timed multiple-choice assessment runner with quick-jump pagination pills.
   - Server-evaluated diagnostic breakdown with pedagogical rationales.
6. **Syntheses & Reading Digests (`/studio/summaries`)**:
   - 6 academic presentation formats (Core Propositions, Executive Digest, Academic Synthesis, Exam Revision Sheet, Socratic Q&A, Ontological Hierarchy).
   - High-contrast reader with one-click Markdown export and RAG grounding verification.
7. **Document Vault (`/library`)**:
   - Monograph card grid with status indicators (`ready`, `extracting`, `chunking`, `embedding`, `failed`).
   - File size, page count, and upload timestamp ledger.
   - Quick studio launch dock for each reading.
8. **Curricular Study Milestones (`/planner`)**:
   - Milestone tracking calibrated toward user's target examination date.
   - Interactive task completion checkmarks and daily study goal meters.
9. **Mastery Analytics (`/analytics`)**:
   - Thematic concept mastery profile based on server-scored quiz outcomes.
   - Curricular remediation recommendations and consecutive study streak tracking.
10. **Scholar Profile & Settings (`/settings`)**:
    - Account credentials, daily study quotas, and verified runtime status (pgvector, Gemini 2.5 Flash, PyMuPDF).
11. **Authentication Screens (`/login`, `/register`)**:
    - Academic credentials portal with one-click verified student demonstration bypass.

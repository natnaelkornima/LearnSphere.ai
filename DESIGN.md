# LearnSphere AI — Production Frontend Design System (DESIGN.md)

## 1. Product Identity & Point of View
- **Product**: LearnSphere AI — high-performance, citation-grounded study engine for students and researchers tackling dense technical and academic coursework.
- **Audience**: University undergraduates, graduate students, and professional examinees (law, medicine, engineering) who must retain and synthesize complex texts under time pressure.
- **Visual Direction**: Modern, high-craft, production-grade interface. Avoids common AI-generated design clichés (no fake parchment `#faf8f5`, no terracotta clay accents `#9e3722`, no faux-broadsheet hairline grids, no random monospace tags on prose, no middle-dot list clutter).
- **Core Principle**: Clear visual hierarchy, deliberate spacing, and immediate interactive utility over decorative ornament.

---

## 2. Color System

### Base Palette
| Token | Hex Value | Role |
|---|---|---|
| **Canvas Light** | `#f8fafc` (Slate 50) | Neutral, cool, clean page background |
| **Surface White** | `#ffffff` | Primary container surface for cards and panels |
| **Surface Secondary** | `#f1f5f9` (Slate 100) | Insets, secondary actions, and subtle table rows |
| **Slate Ink** | `#0f172a` (Slate 900) | High-contrast, sharp typographic ink |
| **Slate Muted** | `#64748b` (Slate 500) | Secondary labels and helper text |
| **Border Crisp** | `#e2e8f0` (Slate 200) | 1px architectural hairline dividers |
| **Brand Accent** | `#2563eb` (Blue 600) | Primary actions, focused tabs, and active state highlights |
| **Success Emerald** | `#059669` (Emerald 600) | Verified answers, 100% completion indicators |

### Dark Canvas Palette
- **Canvas Dark**: `#090d16` (Deep slate midnight)
- **Surface Dark**: `#0f172a` (Slate 900)
- **Surface Inset**: `#1e293b` (Slate 800)
- **Border Dark**: `#1e293b`
- **Brand Accent Dark**: `#3b82f6` (Blue 500)

---

## 3. Typographic Hierarchy & Spacing Rhythm

### Typography
- **Primary Font Stack**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
- **Headings**: `font-semibold tracking-[-0.025em] text-slate-900 dark:text-slate-100`
- **Body**: `text-sm leading-relaxed text-slate-600 dark:text-slate-300` (line length kept under 75 characters)
- **Metrics & Numbers**: `tabular-nums font-semibold`

### Spacing Cadence
- **Containers**: Unified `max-w-6xl` or `max-w-7xl` centered with `px-6 md:px-8`.
- **Card Padding**: Standardized to `p-5` or `p-6` for internal components.
- **Card Grids**: Standardized to `gap-4` or `gap-6`.
- **Interactive Controls**: Standardized heights (`h-8` compact, `h-9` standard, `h-10` primary CTA, `rounded-xl` for cards, `rounded-lg` for inputs/buttons).

---

## 4. Component Inventory & @ui-sdk/react Integration

- **`@ui-sdk/react/tabs`**:
  - Powers the interactive study console on the landing page (`/`).
  - Powers backward-compatible tab switches in `src/components/ui/Tabs.tsx`.
  - Accessible keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
- **`@ui-sdk/react/dialog`**:
  - Powers `src/components/ui/Modal.tsx` with accessible focus traps, background backdrops, and escape key handling.
- **Layered Styles (`src/app/globals.css`)**:
  ```css
  @layer ui-sdk;
  @import "tailwindcss";
  @import "@ui-sdk/core/web.css" layer(components);
  ```

---

## 5. Architectural Map of Surfaces

1. **Landing Page (`/`)**: High-conviction hero with live multi-tab interactive study console, capability matrix, cognitive progression, and pricing tiers.
2. **Dashboard Overview (`/dashboard`)**: Unified 4-metric ledger, recent course readings table, and direct study studio links.
3. **Socratic AI Tutor (`/tutor`)**: Real-time dual-pane reading desk. User dialog on the left, verbatim primary-source citation inspector on the right.
4. **Active Recall Flashcards (`/studio/flashcards`)**: 3D card flip engine (`Space` shortcut) with 4-tier retrieval scoring (`[1] Again`, `[2] Hard`, `[3] Good`, `[4] Easy`).
5. **Practice Assessments (`/studio/quizzes`)**: Difficulty tiering, responsive multiple-choice runner with numbered jump pills, and server-evaluated explanations.
6. **Structured Summaries (`/studio/summaries`)**: 6 academic frameworks with one-click Markdown copy and vector citation counts.
7. **Document Vault (`/library`)**: Clean grid with vector status pills (`ready`, `extracting`, `chunking`, `embedding`, `failed`) and quick-launch tools.
8. **Study Planner (`/planner`)**: Target exam milestone tracker with interactive task checkboxes and daily study meters.
9. **Retention Analytics (`/analytics`)**: Thematic concept mastery breakdown, consecutive study streak counter, and actionable suggestions.
10. **Account & Preferences (`/settings`)**: Profile details, daily commitment target, and runtime status (pgvector, Gemini 2.5 Flash, PyMuPDF).
11. **Authentication (`/login`, `/register`)**: Fast login with one-click demo student bypass.

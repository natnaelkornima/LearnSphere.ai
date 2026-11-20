# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

University and graduate students in demanding programs (STEM, Medicine, Law, Economics, Humanities) managing heavy reading loads, synthesizing dense textbooks, and preparing for high-stakes exams.

## Product Purpose

Transform passive, overwhelming educational documents (textbooks, notes, syllabi) into an active, measurable, grounded learning workspace. Success means students master complex subjects faster with deep retention, validated recall, and lower study fatigue.

## Positioning

Unlike generic AI chat tools that hallucinate or sever knowledge from primary texts, LearnSphere AI is strictly grounded in the student's ingested documents with page-boundary tracking and clickable citation pills (e.g., `[Page 4]`), combined with server-authoritative active recall tooling (quizzes, 3D flashcards, multi-format summaries, milestone planners).

## Operating Context

Focused study sessions on desktop and laptop screens (with fluid mobile review), often alongside PDF readers or lecture slides. Workflows require dual-pane reference, high information density, clear typographic hierarchies, and distraction-free environments.

## Capabilities and Constraints

- **Document Pipeline**: PDF drag-and-drop ingestion, page-by-page extraction via PyMuPDF, pgvector semantic indexing.
- **Understand**: Scoped RAG tutor with multi-document cross-synthesis and citation pills.
- **Practice (Studio)**: 6 summary formats, server-authoritative quizzes with post-submission explanations, 3D interactive flip flashcards with spaced repetition ratings.
- **Improve**: Syllabus-driven milestone planning, persistent streak and mastery analytics.
- **Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, `@ui-sdk/react`, `@ui-sdk/core`.

## Brand Commitments

- **Name**: LearnSphere AI
- **Aesthetic World**: Scholarly Editorial — warm paper tones, refined academic typography, crisp hairline borders, high-contrast ink text, and calm focus.
- **Voice**: Rigorous, clear, supportive, intellectually serious without fluff.

## Evidence on Hand

- Live FastAPI backend in `backend/` with 27 models, RAG chunking, and deterministic scoring.
- Working Next.js 16 frontend with 15 routes in `frontend/src/app/`.

## Product Principles

1. **Grounded Over Generative**: Prioritize verified textual evidence over ungrounded chat responses.
2. **Cognitive Serenity**: Replace chaotic dashboard clutter with intentional typography, quiet paper tones, and focused micro-interactions.
3. **Active Retrieval**: Center learning around active recall (quizzes, flashcards, concept maps) rather than passive reading.
4. **Accessible Precision**: Use `@ui-sdk/react` primitives to ensure accessible tabs, dialogs, toggles, menus, and keyboard-first navigation.

## Accessibility & Inclusion

WCAG AA compliance. High contrast ratios on paper surfaces, visible focus rings, full keyboard traversal for study cards, tabs, and modals.

# LearnSphere AI

> **Turn Your Documents Into Knowledge.**  
> An AI-powered EdTech responsive web application transforming static educational documents (textbooks, syllabi, notes) into an active, measurable learning workspace.

---

## 🌟 The Core 4-Stage Learning Cycle

$$\text{UPLOAD / CONVERT} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PRACTICE} \longrightarrow \text{IMPROVE}$$

1. **Upload / Convert (Document Vault & Extraction Pipeline):**
   - Drag-and-drop PDF ingestion with client and server file-size/type validation.
   - Page-by-page text extraction powered by PyMuPDF (`fitz`), preserving physical page boundaries.
   - Semantic chunking with page range tracking and vector indexing via `pgvector`.
2. **Understand (Grounded AI Tutor):**
   - Context-grounded RAG chat scoped strictly to user-selected documents.
   - Inline citation pills (e.g. `[Page 4]`) linking directly to source excerpts.
   - Multi-document cross-synthesis and conversation persistence.
3. **Practice (AI Learning Studio):**
   - **Summaries:** 6 structured formats (Executive, Bullet Points, Comprehensive, Concept Map, Study Guide, FAQ).
   - **Quizzes:** Server-authoritative deterministic scoring (answer keys withheld pre-submission; explanations revealed post-submission).
   - **Flashcards:** 3D CSS interactive flip card recall engine with spaced repetition feedback (Again, Hard, Good, Easy) and keyboard navigation.
4. **Improve (Personalized Planner & Analytics):**
   - AI Study Planner that breaks syllabi into daily scheduled milestones.
   - Persisted SQL aggregation analytics: mastery progress, study streaks, weak-topic detection, and adaptive recommendations.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router, Strict TypeScript), Tailwind CSS, Custom SVG Iconography, Lucide React, Motion |
| **Backend** | FastAPI (Python 3.12), SQLAlchemy 2.0 (AsyncIO), Alembic, Pydantic v2, PyMuPDF, pgvector |
| **Database** | PostgreSQL with pgvector (production/staging) / SQLite with shared cache (zero-config local dev) |
| **Auth & Storage** | Supabase Auth (JWT bearer verification + demo student bypass), Supabase Storage / Local fallback |
| **AI Engine** | Google Gemini API via provider abstraction layer (`gemini-2.5-flash`, `text-embedding-004`) |

---

## 📁 Repository Layout

```text
learnsphere-ai/
├── backend/                        # FastAPI REST Application
│   ├── app/
│   │   ├── api/                    # REST routes (auth, documents, chat, summaries, quizzes, flashcards, planner, analytics)
│   │   ├── core/                   # Config, database engine, security JWT, exceptions
│   │   ├── models/                 # 27 normalized SQLAlchemy 2.0 ORM models
│   │   ├── rag/                    # Vector retrieval, semantic chunking, prompt engineering
│   │   ├── schemas/                # Pydantic v2 validation models
│   │   └── services/               # Document ingestion, RAG chat, studio generation, analytics
│   ├── tests/                      # Automated test suite (Pytest + HTTPX + aiosqlite)
│   └── pyproject.toml              # Python dependencies & metadata
├── frontend/                       # Next.js 16 App Router Application
│   ├── src/
│   │   ├── app/                    # 15 App Router pages & routes
│   │   ├── components/             # Layout (AppShell, Sidebar, TopBar), Documents, UI Design Tokens
│   │   ├── lib/                    # API client, Auth provider, TypeScript types
│   │   └── styles/                 # Global Tailwind CSS and design tokens
│   └── package.json
└── learnsphere-document/           # Product Requirements, Architecture, Design Brief, and Schemas
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** >= 18.18 (recommended: Node 20+)
- **Python** >= 3.12 with `venv`
- *(Optional for production)* PostgreSQL >= 15 with `pgvector` extension

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .

# Configure environment variables
# Copy template or use defaults (SQLite zero-config is enabled for development)
cp .env.example .env

# Run automated test suite
PYTHONPATH=. pytest -v

# Start FastAPI development server (runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```

> **API Documentation:**
> - Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
> - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
> - Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (use IPv4 resolution flag if on restricted DNS hosts)
NODE_OPTIONS="--dns-result-order=ipv4first" npm install

# Build static production bundle
NODE_OPTIONS="--dns-result-order=ipv4first" npm run build

# Start Next.js development server (runs on http://localhost:3000)
NODE_OPTIONS="--dns-result-order=ipv4first" npm run dev
```

---

## 🧪 Test Suite

The backend contains automated tests verifying the complete learning workflow:

```bash
cd backend
PYTHONPATH=. .venv/bin/pytest -v
```

### Test Coverage Highlights:
- `test_pdf_extraction`: PDF text and metadata extraction using PyMuPDF.
- `test_chunking_preserves_page_numbers`: Sentence-aware sliding chunker maintaining strict page boundary tracking.
- `test_auth_and_profile`: Supabase JWT verification and student profile auto-provisioning.
- `test_complete_learning_cycle`: End-to-end integration test across all 4 stages:
  1. Ingestion of educational documents and chunk vector embeddings.
  2. Grounded AI Tutor chat with verified page citation pill outputs.
  3. AI Summary generation across 6 styles.
  4. Practice Quiz generation and server-authoritative submission with hidden answer validation.
  5. Flashcard deck review lifecycle.
  6. Study Planner milestone management.
  7. Analytics dashboard computation reflecting persisted student activities.
- `test_quiz_authoritative_grading`: 100% server-authoritative scoring with exact percentage, revealed explanations post-submission, and security withholding.
- `test_flashcard_review_lifecycle`: Flashcard review ratings and repetition persistence.

---

## 🛡️ Security & Privacy Guarantees
- **Strict User Scoping:** Every document, chunk, vector query, chat message, quiz attempt, and flashcard is strictly scoped by `user_id`. Multi-tenant cross-contamination is prevented at the database level.
- **Server-Authoritative Quizzing:** Quiz correct answers and explanations are never transmitted to the browser client before submission.
- **Grounded Verification:** Every AI Tutor answer strictly cites verified document page numbers and chunk IDs, mitigating LLM hallucinations.

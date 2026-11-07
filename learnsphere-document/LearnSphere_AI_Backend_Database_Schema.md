# LEARNSPHERE AI

# BACKEND & DATABASE SCHEMA DOCUMENT {#backend--database-schema-document}

**Project:** LearnSphere AI\
**Document:** Backend & Database Schema Specification\
**Version:** 1.0\
**Status:** Proposed Technical Specification\
**Backend:** Python + FastAPI\
**Database:** PostgreSQL\
**Vector Database:** pgvector\
**ORM:** SQLAlchemy 2.0\
**Migration Tool:** Alembic\
**Validation:** Pydantic\
**Authentication:** Supabase Auth or JWT-based authentication

------------------------------------------------------------------------

# 1. INTRODUCTION {#1-introduction}

## 1.1 Purpose {#11-purpose}

This document defines the backend data architecture and database schema
for LearnSphere AI.

It establishes the structure of the information stored, processed,
retrieved, and managed throughout the application.

The schema must support:

-   User accounts and authentication.
-   Student profiles and preferences.
-   Subjects and learning organization.
-   Educational document uploads.
-   PDF extraction and processing.
-   Document chunks and vector embeddings.
-   AI-powered document question answering.
-   Conversation history.
-   AI-generated summaries.
-   Quiz generation and assessment.
-   Quiz attempts and scoring.
-   Flashcard generation and review.
-   Personalized study plans.
-   Study tasks and scheduling.
-   Learning activity tracking.
-   Learning analytics and recommendations.

## 1.2 Schema Design Objectives {#12-schema-design-objectives}

The database must be:

1.  **Normalized:** Avoid unnecessary duplication of data.
2.  **Secure:** Students must only access their own protected resources.
3.  **Scalable:** Support increasing document and learning activity
    volumes.
4.  **AI-ready:** Store embeddings and source metadata for
    retrieval-augmented generation.
5.  **Traceable:** Preserve the relationship between generated learning
    content and its source documents.
6.  **Maintainable:** Use clear naming conventions and predictable
    relationships.
7.  **Consistent:** Enforce data integrity through constraints and
    transactions.

## 1.3 Core Architecture {#13-core-architecture}

The backend follows a modular monolithic architecture for the hackathon
MVP.

``` text
                 FRONTEND
                Next.js App
                     |
                     v
               FASTAPI BACKEND
                     |
        +------------+-------------+
        |            |             |
        v            v             v
   AUTH MODULE   DOCUMENTS      LEARNING
                     |             |
                     v             |
               PDF PROCESSOR       |
                     |             |
                     v             |
               EMBEDDING ENGINE    |
                     |             |
                     v             |
                PGVECTOR           |
                     |             |
                     +------+------+
                            |
                            v
                     AI SERVICE LAYER
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
           AI TUTOR     GENERATION     PERSONALIZATION
                            |
                            v
                       ANALYTICS
                            |
                            v
                       POSTGRESQL
```

The application should begin as one deployable backend with clearly
separated modules. Avoid introducing microservices for the initial MVP.

------------------------------------------------------------------------

# 2. DATABASE TECHNOLOGY {#2-database-technology}

## 2.1 PostgreSQL {#21-postgresql}

PostgreSQL is the primary relational database.

It stores:

-   Users and profiles.
-   Documents and metadata.
-   Conversations and messages.
-   Summaries.
-   Quizzes and questions.
-   Quiz attempts.
-   Flashcards and review records.
-   Study plans and tasks.
-   Learning activity.

## 2.2 pgvector {#22-pgvector}

pgvector provides vector storage and similarity search inside
PostgreSQL.

It stores document embeddings and supports semantic retrieval for the AI
Tutor.

## 2.3 SQLAlchemy {#23-sqlalchemy}

Use SQLAlchemy 2.0 for:

-   Database models.
-   Relationships.
-   Queries.
-   Transactions.
-   Repository operations.

## 2.4 Alembic {#24-alembic}

Use Alembic to manage database migrations.

Every schema modification must be represented by a migration.

Never rely on manually modifying the production database.

## 2.5 Object Storage {#25-object-storage}

Do not store the actual PDF binary files directly in PostgreSQL.

Use object storage such as Supabase Storage or an S3-compatible service.

PostgreSQL stores the file metadata and storage key.

------------------------------------------------------------------------

# 3. DATABASE NAMING CONVENTIONS {#3-database-naming-conventions}

Use the following conventions consistently.

  Element              Convention            Example
  -------------------- --------------------- ----------------------
  Tables               snake_case, plural    documents
  Columns              snake_case            created_at
  Primary keys         id                    id
  Foreign keys         referenced_table_id   user_id
  Boolean columns      is\_ prefix           is_active
  Timestamps           \*\_at                updated_at
  Indexes              ix_table_column       ix_documents_user_id
  Unique constraints   uq_table_columns      uq_users_email
  Enum types           descriptive names     document_status

## 3.1 Common Data Types {#31-common-data-types}

-   UUID: Primary and foreign identifiers.
-   VARCHAR: Short textual values.
-   TEXT: Long textual content.
-   INTEGER: Counts and ordering.
-   NUMERIC: Precise numeric values where needed.
-   BOOLEAN: True/false fields.
-   TIMESTAMPTZ: Timezone-aware timestamps.
-   JSONB: Flexible structured metadata.
-   VECTOR(n): Embedding vectors.
-   BYTEA: Avoid for large uploaded documents.

Use UTC timestamps in the database.

------------------------------------------------------------------------

# 4. COMPLETE DATABASE MODULES {#4-complete-database-modules}

The proposed schema is divided into ten modules.

1.  Identity and user management.
2.  Subject and learning organization.
3.  Document management.
4.  AI retrieval and conversations.
5.  Summary generation.
6.  Quiz and assessment.
7.  Flashcard learning.
8.  Study planning.
9.  Learning activity and analytics.
10. AI recommendations and system operations.

------------------------------------------------------------------------

# 5. IDENTITY AND USER MANAGEMENT {#5-identity-and-user-management}

## 5.1 users {#51-users}

Purpose: Store the application\'s internal user identity.

If Supabase Auth is used, the internal user ID should correspond to the
authenticated provider\'s user ID.

  Column       Type           Constraints        Description
  ------------ -------------- ------------------ -----------------
  id           UUID           PK                 User identifier
  email        VARCHAR(255)   UNIQUE, NOT NULL   User email
  full_name    VARCHAR(150)   NOT NULL           Display name
  avatar_url   TEXT           NULL               Profile image
  is_active    BOOLEAN        DEFAULT TRUE       Account status
  created_at   TIMESTAMPTZ    NOT NULL           Creation time
  updated_at   TIMESTAMPTZ    NOT NULL           Last update

Authentication passwords should not be stored in this table when using
an external authentication provider.

## 5.2 user_preferences {#52-user_preferences}

Purpose: Store individual application preferences.

  Column                     Type           Constraints          Description
  -------------------------- -------------- -------------------- -------------------------
  id                         UUID           PK                   Preference identifier
  user_id                    UUID           FK, UNIQUE           User
  theme                      VARCHAR(20)    DEFAULT \'system\'   light, dark, system
  language                   VARCHAR(20)    DEFAULT \'en\'       Preferred language
  timezone                   VARCHAR(100)   DEFAULT \'UTC\'      User timezone
  daily_study_goal_minutes   INTEGER        DEFAULT 60           Daily study target
  notifications_enabled      BOOLEAN        DEFAULT TRUE         Notification preference
  created_at                 TIMESTAMPTZ    NOT NULL             Creation time
  updated_at                 TIMESTAMPTZ    NOT NULL             Last update

## 5.3 user_settings {#53-user_settings}

Optional extension for account-level settings that do not belong in
user_preferences.

Do not create this table unless actual settings require it.

------------------------------------------------------------------------

# 6. SUBJECT AND LEARNING ORGANIZATION {#6-subject-and-learning-organization}

## 6.1 subjects {#61-subjects}

Purpose: Organize documents and learning materials into subjects.

  Column        Type           Constraints    Description
  ------------- -------------- -------------- --------------------
  id            UUID           PK             Subject identifier
  user_id       UUID           FK, NOT NULL   Owner
  name          VARCHAR(150)   NOT NULL       Subject name
  description   TEXT           NULL           Description
  color         VARCHAR(20)    NULL           Display color
  icon          VARCHAR(50)    NULL           Subject icon
  created_at    TIMESTAMPTZ    NOT NULL       Creation time
  updated_at    TIMESTAMPTZ    NOT NULL       Last update

Examples:

-   Computer Science.
-   Biology.
-   Mathematics.
-   Psychology.
-   History.

A subject belongs to one user in the initial MVP.

Unique constraint: `(user_id, name)`.

------------------------------------------------------------------------

# 7. DOCUMENT MANAGEMENT MODULE {#7-document-management-module}

This module is responsible for uploaded educational files and their
processing lifecycle.

## 7.1 documents {#71-documents}

Purpose: Store document metadata.

  Column              Type           Constraints      Description
  ------------------- -------------- ---------------- -------------------------
  id                  UUID           PK               Document ID
  user_id             UUID           FK, NOT NULL     Owner
  subject_id          UUID           FK, NULL         Associated subject
  title               VARCHAR(255)   NOT NULL         Document title
  original_filename   VARCHAR(255)   NOT NULL         Uploaded filename
  storage_key         TEXT           NOT NULL         Object storage key
  mime_type           VARCHAR(100)   NOT NULL         File MIME type
  file_size_bytes     BIGINT         NOT NULL         File size
  page_count          INTEGER        NULL             Number of pages
  status              VARCHAR(30)    NOT NULL         Processing state
  processing_error    TEXT           NULL             Error description
  extracted_text      TEXT           NULL             Optional extracted text
  metadata            JSONB          DEFAULT \'{}\'   Additional metadata
  uploaded_at         TIMESTAMPTZ    NOT NULL         Upload time
  processed_at        TIMESTAMPTZ    NULL             Processing completion
  created_at          TIMESTAMPTZ    NOT NULL         Creation time
  updated_at          TIMESTAMPTZ    NOT NULL         Last update

Allowed document statuses:

-   uploaded
-   extracting
-   chunking
-   embedding
-   ready
-   failed
-   deleting

The application must validate file type and size before accepting
uploads.

`storage_key` must not be treated as a publicly accessible URL.

## 7.2 document_chunks {#72-document_chunks}

Purpose: Store extracted text segments for retrieval.

  Column        Type          Constraints      Description
  ------------- ------------- ---------------- ---------------------
  id            UUID          PK               Chunk ID
  document_id   UUID          FK, NOT NULL     Parent document
  user_id       UUID          FK, NOT NULL     Owner
  chunk_index   INTEGER       NOT NULL         Position
  content       TEXT          NOT NULL         Extracted text
  page_start    INTEGER       NULL             First source page
  page_end      INTEGER       NULL             Last source page
  token_count   INTEGER       NULL             Estimated tokens
  metadata      JSONB         DEFAULT \'{}\'   Extraction metadata
  created_at    TIMESTAMPTZ   NOT NULL         Creation time

Constraints:

-   Unique `(document_id, chunk_index)`.
-   Index on `document_id`.
-   Index on `user_id`.

Chunking configuration should initially target approximately 500--800
tokens per chunk, with overlap. The final values should be evaluated
against retrieval quality.

Page numbers must be preserved during extraction so that citations can
be generated accurately.

## 7.3 document_processing_jobs {#73-document_processing_jobs}

Purpose: Track processing operations and failures.

  Column          Type          Constraints    Description
  --------------- ------------- -------------- ----------------------
  id              UUID          PK             Job ID
  document_id     UUID          FK, NOT NULL   Related document
  user_id         UUID          FK, NOT NULL   Owner
  job_type        VARCHAR(40)   NOT NULL       Processing operation
  status          VARCHAR(30)   NOT NULL       Job status
  attempts        INTEGER       DEFAULT 0      Retry count
  error_message   TEXT          NULL           Failure reason
  started_at      TIMESTAMPTZ   NULL           Start time
  completed_at    TIMESTAMPTZ   NULL           Completion time
  created_at      TIMESTAMPTZ   NOT NULL       Creation time

Possible job types:

-   extract_pdf
-   chunk_document
-   generate_embeddings

Possible statuses:

-   pending
-   processing
-   completed
-   failed

This table allows processing failures to be inspected and retried
without losing the original document record.

------------------------------------------------------------------------

# 8. VECTOR EMBEDDING SCHEMA {#8-vector-embedding-schema}

## 8.1 document_embeddings {#81-document_embeddings}

Purpose: Store vector representations of document chunks.

For the initial implementation, embeddings may be stored directly on
document_chunks instead of a separate table.

A separate table is recommended when supporting multiple embedding
models or versions.

  Column          Type           Constraints    Description
  --------------- -------------- -------------- -----------------------
  id              UUID           PK             Embedding ID
  chunk_id        UUID           FK, NOT NULL   Associated chunk
  document_id     UUID           FK, NOT NULL   Parent document
  user_id         UUID           FK, NOT NULL   Owner
  embedding       VECTOR(1536)   NOT NULL       Vector representation
  model_name      VARCHAR(150)   NOT NULL       Embedding model
  model_version   VARCHAR(100)   NULL           Model version
  created_at      TIMESTAMPTZ    NOT NULL       Creation time

**Important:** `VECTOR(1536)` is only an example dimension. The actual
vector dimension must match the selected embedding model. Never insert
vectors with a different dimension.

Create an appropriate vector index after selecting the embedding model
and measuring the expected data volume.

For example, pgvector supports HNSW indexes for cosine-distance
retrieval.

------------------------------------------------------------------------

# 9. AI TUTOR AND CONVERSATION MODULE {#9-ai-tutor-and-conversation-module}

## 9.1 conversations {#91-conversations}

Purpose: Store AI Tutor conversations.

  Column       Type           Constraints          Description
  ------------ -------------- -------------------- ---------------------
  id           UUID           PK                   Conversation ID
  user_id      UUID           FK, NOT NULL         Owner
  title        VARCHAR(255)   NULL                 Conversation title
  status       VARCHAR(20)    DEFAULT \'active\'   Conversation status
  created_at   TIMESTAMPTZ    NOT NULL             Creation time
  updated_at   TIMESTAMPTZ    NOT NULL             Last activity

## 9.2 conversation_documents {#92-conversation_documents}

Purpose: Associate one conversation with one or more documents.

  Column            Type          Constraints    Description
  ----------------- ------------- -------------- -------------------
  conversation_id   UUID          PK, FK         Conversation
  document_id       UUID          PK, FK         Selected document
  user_id           UUID          FK, NOT NULL   Owner
  created_at        TIMESTAMPTZ   NOT NULL       Association time

Composite primary key: `(conversation_id, document_id)`.

This enables document-specific conversations and conversations that use
multiple selected documents.

## 9.3 messages {#93-messages}

Purpose: Store user and AI messages.

  Column            Type          Constraints             Description
  ----------------- ------------- ----------------------- -------------------
  id                UUID          PK                      Message ID
  conversation_id   UUID          FK, NOT NULL            Conversation
  user_id           UUID          FK, NOT NULL            Owner
  role              VARCHAR(20)   NOT NULL                user or assistant
  content           TEXT          NOT NULL                Message content
  status            VARCHAR(20)   DEFAULT \'completed\'   Message status
  metadata          JSONB         DEFAULT \'{}\'          Additional data
  created_at        TIMESTAMPTZ   NOT NULL                Message time

Roles:

-   user
-   assistant

System instructions should be maintained by the backend, not exposed as
user-editable conversation messages.

## 9.4 message_sources {#94-message_sources}

Purpose: Store the retrieved source chunks supporting an AI answer.

  Column            Type          Constraints    Description
  ----------------- ------------- -------------- ---------------------
  id                UUID          PK             Source reference ID
  message_id        UUID          FK, NOT NULL   AI message
  chunk_id          UUID          FK, NOT NULL   Retrieved chunk
  document_id       UUID          FK, NOT NULL   Source document
  page_start        INTEGER       NULL           Source page
  page_end          INTEGER       NULL           Source page range
  relevance_score   FLOAT         NULL           Retrieval score
  citation_order    INTEGER       NOT NULL       Display order
  created_at        TIMESTAMPTZ   NOT NULL       Creation time

This table allows the application to display citations such as:

\"Biology Fundamentals --- Page 24\"

The source relationship must be retained so that citations remain
traceable.

## 9.5 ai_generation_logs {#95-ai_generation_logs}

Purpose: Record AI generation operations for troubleshooting and usage
monitoring.

  Column          Type           Constraints    Description
  --------------- -------------- -------------- --------------------
  id              UUID           PK             Log ID
  user_id         UUID           FK, NOT NULL   User
  feature         VARCHAR(50)    NOT NULL       AI feature
  provider        VARCHAR(100)   NULL           AI provider
  model           VARCHAR(150)   NULL           Model name
  input_tokens    INTEGER        NULL           Input token count
  output_tokens   INTEGER        NULL           Output token count
  latency_ms      INTEGER        NULL           Response time
  status          VARCHAR(20)    NOT NULL       Success/failure
  error_code      VARCHAR(100)   NULL           Failure code
  created_at      TIMESTAMPTZ    NOT NULL       Operation time

Do not store API keys, secrets, or unnecessary sensitive prompt data in
logs.

------------------------------------------------------------------------

# 10. SUMMARY GENERATION MODULE {#10-summary-generation-module}

## 10.1 summaries {#101-summaries}

Purpose: Store AI-generated summaries.

  Column          Type           Constraints             Description
  --------------- -------------- ----------------------- -------------------
  id              UUID           PK                      Summary ID
  user_id         UUID           FK, NOT NULL            Owner
  document_id     UUID           FK, NOT NULL            Source document
  title           VARCHAR(255)   NOT NULL                Summary title
  summary_type    VARCHAR(40)    NOT NULL                Summary category
  content         TEXT           NOT NULL                Generated summary
  key_takeaways   JSONB          DEFAULT \'\[\]\'        Key points
  status          VARCHAR(20)    DEFAULT \'completed\'   Generation status
  model_name      VARCHAR(150)   NULL                    Model used
  created_at      TIMESTAMPTZ    NOT NULL                Creation time
  updated_at      TIMESTAMPTZ    NOT NULL                Last update

Summary types:

-   quick_overview
-   detailed
-   exam_revision
-   key_concepts
-   chapter_summary

## 10.2 summary_sources {#102-summary_sources}

Purpose: Preserve the source material used to generate a summary.

  Column        Type          Constraints    Description
  ------------- ------------- -------------- ---------------
  id            UUID          PK             Source ID
  summary_id    UUID          FK, NOT NULL   Summary
  chunk_id      UUID          FK, NOT NULL   Source chunk
  document_id   UUID          FK, NOT NULL   Document
  created_at    TIMESTAMPTZ   NOT NULL       Creation time

This supports traceability between generated summaries and original
educational content.

------------------------------------------------------------------------

# 11. QUIZ AND ASSESSMENT MODULE {#11-quiz-and-assessment-module}

## 11.1 quizzes {#111-quizzes}

Purpose: Store generated quizzes.

  Column           Type           Constraints         Description
  ---------------- -------------- ------------------- ---------------------
  id               UUID           PK                  Quiz ID
  user_id          UUID           FK, NOT NULL        Owner
  document_id      UUID           FK, NULL            Source document
  subject_id       UUID           FK, NULL            Subject
  title            VARCHAR(255)   NOT NULL            Quiz title
  description      TEXT           NULL                Description
  difficulty       VARCHAR(20)    NOT NULL            Difficulty
  question_count   INTEGER        NOT NULL            Number of questions
  status           VARCHAR(20)    DEFAULT \'draft\'   Quiz status
  settings         JSONB          DEFAULT \'{}\'      Generation settings
  created_at       TIMESTAMPTZ    NOT NULL            Creation time
  updated_at       TIMESTAMPTZ    NOT NULL            Last update

Difficulty:

-   easy
-   medium
-   hard
-   mixed

## 11.2 quiz_questions {#112-quiz_questions}

Purpose: Store individual quiz questions.

  Column            Type          Constraints        Description
  ----------------- ------------- ------------------ -----------------
  id                UUID          PK                 Question ID
  quiz_id           UUID          FK, NOT NULL       Parent quiz
  question_text     TEXT          NOT NULL           Question
  question_type     VARCHAR(30)   NOT NULL           Question type
  options           JSONB         DEFAULT \'\[\]\'   Answer options
  correct_answer    JSONB         NOT NULL           Correct answer
  explanation       TEXT          NULL               Explanation
  points            INTEGER       DEFAULT 1          Question points
  order_index       INTEGER       NOT NULL           Question order
  source_chunk_id   UUID          FK, NULL           Source chunk
  created_at        TIMESTAMPTZ   NOT NULL           Creation time

Question types:

-   multiple_choice
-   true_false
-   short_answer

Example options:

``` json
[
  {
    "id": "A",
    "text": "Mitochondria"
  },
  {
    "id": "B",
    "text": "Ribosome"
  }
]
```

**Security requirement:** `correct_answer` must never be returned to the
student before quiz submission.

## 11.3 quiz_attempts {#113-quiz_attempts}

Purpose: Store individual quiz attempts.

  Column            Type           Constraints    Description
  ----------------- -------------- -------------- -------------------
  id                UUID           PK             Attempt ID
  quiz_id           UUID           FK, NOT NULL   Quiz
  user_id           UUID           FK, NOT NULL   Student
  score             NUMERIC(6,2)   NULL           Earned score
  total_points      NUMERIC(6,2)   NOT NULL       Maximum score
  percentage        NUMERIC(5,2)   NULL           Percentage
  correct_count     INTEGER        DEFAULT 0      Correct answers
  incorrect_count   INTEGER        DEFAULT 0      Incorrect answers
  status            VARCHAR(20)    NOT NULL       Attempt status
  started_at        TIMESTAMPTZ    NOT NULL       Start time
  submitted_at      TIMESTAMPTZ    NULL           Submission time
  created_at        TIMESTAMPTZ    NOT NULL       Creation time

## 11.4 quiz_attempt_answers {#114-quiz_attempt_answers}

Purpose: Store answers submitted by students.

  Column             Type           Constraints    Description
  ------------------ -------------- -------------- -------------------------
  id                 UUID           PK             Answer ID
  attempt_id         UUID           FK, NOT NULL   Quiz attempt
  question_id        UUID           FK, NOT NULL   Question
  submitted_answer   JSONB          NULL           Student answer
  is_correct         BOOLEAN        NULL           Evaluation result
  awarded_points     NUMERIC(6,2)   DEFAULT 0      Points earned
  feedback           TEXT           NULL           Explanation or feedback
  created_at         TIMESTAMPTZ    NOT NULL       Submission time

Unique constraint: `(attempt_id, question_id)`.

Quiz scoring must be performed on the backend using the stored answer
key.

The frontend must never calculate authoritative results.

------------------------------------------------------------------------

# 12. FLASHCARD MODULE {#12-flashcard-module}

## 12.1 flashcard_sets {#121-flashcard_sets}

Purpose: Group flashcards by document or topic.

  Column        Type           Constraints    Description
  ------------- -------------- -------------- -----------------
  id            UUID           PK             Set ID
  user_id       UUID           FK, NOT NULL   Owner
  document_id   UUID           FK, NULL       Source document
  subject_id    UUID           FK, NULL       Subject
  title         VARCHAR(255)   NOT NULL       Set title
  description   TEXT           NULL           Description
  card_count    INTEGER        DEFAULT 0      Number of cards
  created_at    TIMESTAMPTZ    NOT NULL       Creation time
  updated_at    TIMESTAMPTZ    NOT NULL       Last update

## 12.2 flashcards {#122-flashcards}

Purpose: Store individual flashcards.

  Column            Type          Constraints    Description
  ----------------- ------------- -------------- --------------------
  id                UUID          PK             Flashcard ID
  set_id            UUID          FK, NOT NULL   Parent set
  user_id           UUID          FK, NOT NULL   Owner
  front_content     TEXT          NOT NULL       Question or prompt
  back_content      TEXT          NOT NULL       Answer
  source_chunk_id   UUID          FK, NULL       Source chunk
  order_index       INTEGER       NOT NULL       Card order
  created_at        TIMESTAMPTZ   NOT NULL       Creation time
  updated_at        TIMESTAMPTZ   NOT NULL       Last update

## 12.3 flashcard_reviews {#123-flashcard_reviews}

Purpose: Track how students review individual cards.

  Column           Type          Constraints    Description
  ---------------- ------------- -------------- -----------------------
  id               UUID          PK             Review ID
  flashcard_id     UUID          FK, NOT NULL   Flashcard
  user_id          UUID          FK, NOT NULL   Reviewer
  rating           VARCHAR(20)   NOT NULL       Review result
  reviewed_at      TIMESTAMPTZ   NOT NULL       Review time
  next_review_at   TIMESTAMPTZ   NULL           Suggested next review
  created_at       TIMESTAMPTZ   NOT NULL       Creation time

Ratings:

-   again
-   difficult
-   good
-   easy

The initial MVP can use simple review scheduling. Advanced
spaced-repetition algorithms can be introduced later.

------------------------------------------------------------------------

# 13. STUDY PLANNER MODULE {#13-study-planner-module}

## 13.1 study_plans {#131-study_plans}

Purpose: Store personalized study plans.

  Column               Type           Constraints          Description
  -------------------- -------------- -------------------- --------------------
  id                   UUID           PK                   Plan ID
  user_id              UUID           FK, NOT NULL         Owner
  subject_id           UUID           FK, NULL             Subject
  title                VARCHAR(255)   NOT NULL             Plan title
  description          TEXT           NULL                 Description
  start_date           DATE           NULL                 Starting date
  target_date          DATE           NULL                 Completion target
  daily_goal_minutes   INTEGER        NULL                 Daily study target
  status               VARCHAR(20)    DEFAULT \'active\'   Plan status
  created_at           TIMESTAMPTZ    NOT NULL             Creation time
  updated_at           TIMESTAMPTZ    NOT NULL             Last update

Statuses:

-   active
-   completed
-   paused
-   archived

## 13.2 study_tasks {#132-study_tasks}

Purpose: Store tasks within a study plan.

  Column              Type           Constraints           Description
  ------------------- -------------- --------------------- -------------------
  id                  UUID           PK                    Task ID
  plan_id             UUID           FK, NOT NULL          Parent plan
  user_id             UUID           FK, NOT NULL          Owner
  document_id         UUID           FK, NULL              Related document
  title               VARCHAR(255)   NOT NULL              Task title
  description         TEXT           NULL                  Task description
  scheduled_date      DATE           NULL                  Planned date
  estimated_minutes   INTEGER        NULL                  Expected duration
  completed_at        TIMESTAMPTZ    NULL                  Completion time
  status              VARCHAR(20)    DEFAULT \'pending\'   Task status
  priority            VARCHAR(20)    DEFAULT \'medium\'    Priority
  order_index         INTEGER        DEFAULT 0             Task order
  created_at          TIMESTAMPTZ    NOT NULL              Creation time
  updated_at          TIMESTAMPTZ    NOT NULL              Last update

Statuses:

-   pending
-   in_progress
-   completed
-   skipped

Priorities:

-   low
-   medium
-   high

## 13.3 study_plan_documents {#133-study_plan_documents}

Optional junction table associating multiple documents with one study
plan.

  Column        Type          Constraints    Description
  ------------- ------------- -------------- ------------------
  plan_id       UUID          PK, FK         Study plan
  document_id   UUID          PK, FK         Document
  user_id       UUID          FK, NOT NULL   Owner
  created_at    TIMESTAMPTZ   NOT NULL       Association time

------------------------------------------------------------------------

# 14. LEARNING ACTIVITY AND ANALYTICS {#14-learning-activity-and-analytics}

## 14.1 learning_activities {#141-learning_activities}

Purpose: Record meaningful learning events.

  Column             Type          Constraints      Description
  ------------------ ------------- ---------------- --------------------
  id                 UUID          PK               Activity ID
  user_id            UUID          FK, NOT NULL     Owner
  activity_type      VARCHAR(50)   NOT NULL         Activity type
  document_id        UUID          FK, NULL         Related document
  quiz_id            UUID          FK, NULL         Related quiz
  attempt_id         UUID          FK, NULL         Related attempt
  flashcard_set_id   UUID          FK, NULL         Related set
  study_task_id      UUID          FK, NULL         Related task
  duration_seconds   INTEGER       NULL             Activity duration
  metadata           JSONB         DEFAULT \'{}\'   Additional details
  occurred_at        TIMESTAMPTZ   NOT NULL         Activity time
  created_at         TIMESTAMPTZ   NOT NULL         Record creation

Activity types:

-   document_uploaded
-   document_opened
-   question_asked
-   summary_generated
-   quiz_started
-   quiz_completed
-   flashcard_reviewed
-   study_task_completed

Avoid recording every minor UI click as a learning activity.

## 14.2 learning_recommendations {#142-learning_recommendations}

Purpose: Store recommendations generated from actual student activity.

  Column                Type           Constraints          Description
  --------------------- -------------- -------------------- -------------------------
  id                    UUID           PK                   Recommendation ID
  user_id               UUID           FK, NOT NULL         Owner
  recommendation_type   VARCHAR(50)    NOT NULL             Recommendation category
  title                 VARCHAR(255)   NOT NULL             Recommendation title
  description           TEXT           NOT NULL             Explanation
  related_document_id   UUID           FK, NULL             Related document
  related_subject_id    UUID           FK, NULL             Related subject
  action_data           JSONB          DEFAULT \'{}\'       Suggested action
  status                VARCHAR(20)    DEFAULT \'active\'   Recommendation state
  expires_at            TIMESTAMPTZ    NULL                 Expiration
  created_at            TIMESTAMPTZ    NOT NULL             Creation time

Recommendation statuses:

-   active
-   accepted
-   dismissed
-   completed
-   expired

Recommendations must be supported by real activity or clearly identified
as general suggestions.

------------------------------------------------------------------------

# 15. ENTITY RELATIONSHIP OVERVIEW {#15-entity-relationship-overview}

The primary relationships are:

``` text
USERS
  |
  +---- USER_PREFERENCES
  |
  +---- SUBJECTS
  |       |
  |       +---- DOCUMENTS
  |
  +---- DOCUMENTS
  |       |
  |       +---- DOCUMENT_CHUNKS
  |       |       |
  |       |       +---- DOCUMENT_EMBEDDINGS
  |       |
  |       +---- DOCUMENT_PROCESSING_JOBS
  |       |
  |       +---- SUMMARIES
  |       |
  |       +---- FLASHCARD_SETS
  |       |
  |       +---- QUIZZES
  |
  +---- CONVERSATIONS
  |       |
  |       +---- CONVERSATION_DOCUMENTS
  |       |
  |       +---- MESSAGES
  |               |
  |               +---- MESSAGE_SOURCES
  |
  +---- QUIZ_ATTEMPTS
  |       |
  |       +---- QUIZ_ATTEMPT_ANSWERS
  |
  +---- FLASHCARD_REVIEWS
  |
  +---- STUDY_PLANS
  |       |
  |       +---- STUDY_TASKS
  |
  +---- LEARNING_ACTIVITIES
  |
  +---- LEARNING_RECOMMENDATIONS
```

A user owns their documents, conversations, learning activities,
quizzes, flashcards, and study plans.

All user-owned resources must have ownership checks.

------------------------------------------------------------------------

# 16. CORE DATABASE CONSTRAINTS {#16-core-database-constraints}

The following constraints are mandatory.

## 16.1 Referential Integrity {#161-referential-integrity}

-   Every document must reference an existing user.
-   Every conversation must reference an existing user.
-   Every message must reference an existing conversation.
-   Every quiz question must reference an existing quiz.
-   Every quiz attempt must reference an existing quiz and user.
-   Every flashcard must reference an existing flashcard set.
-   Every study task must reference an existing study plan.

## 16.2 Ownership Integrity {#162-ownership-integrity}

The backend must verify that related records belong to the same user.

For example:

-   A user cannot attach another user\'s document to a conversation.
-   A user cannot submit answers to another user\'s quiz attempt.
-   A user cannot access another user\'s flashcard set.

Where appropriate, enforce composite ownership constraints in PostgreSQL
in addition to application checks.

## 16.3 Data Validation {#163-data-validation}

Examples:

-   File size must be positive.
-   Page count cannot be negative.
-   Quiz question count must be positive.
-   Study duration cannot be negative.
-   Score must not exceed total points.
-   Percentage must be between 0 and 100.
-   Status values must be restricted to supported values.

Use database constraints for critical invariants and Pydantic validation
for request data.

------------------------------------------------------------------------

# 17. INDEXING STRATEGY {#17-indexing-strategy}

Indexes are important for frequently queried tables.

Recommended indexes:

  Table                 Index                         Purpose
  --------------------- ----------------------------- ----------------------
  documents             user_id                       User library
  documents             subject_id                    Subject filtering
  documents             status                        Processing status
  document_chunks       document_id                   Chunk lookup
  document_chunks       user_id                       Ownership filtering
  document_embeddings   embedding                     Vector retrieval
  conversations         user_id, updated_at           Recent conversations
  messages              conversation_id, created_at   Chat history
  message_sources       message_id                    Citation retrieval
  summaries             user_id, created_at           Summary listing
  quizzes               user_id, created_at           Quiz listing
  quiz_attempts         user_id, submitted_at         Performance history
  flashcards            set_id                        Card retrieval
  flashcard_reviews     user_id, reviewed_at          Review history
  study_tasks           user_id, scheduled_date       Planner
  learning_activities   user_id, occurred_at          Analytics

Use composite indexes where query patterns justify them.

Avoid creating unnecessary indexes on every column because indexes
increase write and storage costs.

------------------------------------------------------------------------

# 18. SECURITY AND ROW-LEVEL ACCESS {#18-security-and-row-level-access}

Security is a fundamental part of the schema.

## 18.1 Authentication {#181-authentication}

Use Supabase Auth or another trusted authentication provider.

The backend must validate the authentication token before processing
protected requests.

Never trust a `user_id` supplied by the frontend as proof of identity.

## 18.2 Authorization {#182-authorization}

The authenticated user ID must be obtained from the verified token.

Every protected query must enforce ownership.

Example:

``` sql
SELECT *
FROM documents
WHERE id = :document_id
AND user_id = :authenticated_user_id;
```

Never retrieve a document by ID alone.

## 18.3 Row-Level Security {#183-row-level-security}

If Supabase is used, enable RLS on user-owned tables.

Example policy concept:

``` sql
CREATE POLICY "Users access their own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);
```

Equivalent policies are required for other user-owned resources.

If the FastAPI backend uses a privileged database service role, it must
enforce ownership itself because privileged access may bypass RLS.

## 18.4 Storage Security {#184-storage-security}

-   Store PDFs in private storage buckets.
-   Use short-lived signed URLs where needed.
-   Verify file ownership before generating download links.
-   Validate file extensions and actual file content.
-   Set file-size limits.
-   Avoid publicly exposing storage keys.

## 18.5 AI Security {#185-ai-security}

Uploaded documents are untrusted input.

The AI system must:

-   Treat document text as reference material, not system instructions.
-   Ignore instructions embedded inside uploaded documents that attempt
    to override system behavior.
-   Restrict retrieval to the authenticated user\'s authorized
    documents.
-   Avoid leaking content from other users.
-   Avoid exposing secrets in model prompts or responses.

## 18.6 Deletion {#186-deletion}

When a document is deleted:

1.  Mark it as deleting.
2.  Prevent new operations on it.
3.  Remove associated vectors and chunks.
4.  Remove or handle generated content according to the product\'s
    retention policy.
5.  Delete the object from storage.
6.  Mark the deletion complete or record a retryable failure.

Use a transactional and retryable deletion workflow.

------------------------------------------------------------------------

# 19. API REQUEST AND RESPONSE CONTRACTS {#19-api-request-and-response-contracts}

The database schema must be reflected in stable API contracts.

## 19.1 Documents {#191-documents}

### Upload

POST `/api/v1/documents`

Request: multipart form data containing:

-   file
-   title (optional)
-   subject_id (optional)

Response:

``` json
{
  "id": "uuid",
  "title": "Biology Fundamentals",
  "status": "uploaded",
  "created_at": "2026-11-07T10:00:00Z"
}
```

### List

GET `/api/v1/documents`

Response:

``` json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20
}
```

### Details

GET `/api/v1/documents/{document_id}`

### Processing status

GET `/api/v1/documents/{document_id}/status`

### Delete

DELETE `/api/v1/documents/{document_id}`

## 19.2 AI Tutor {#192-ai-tutor}

POST `/api/v1/chat/ask`

Request:

``` json
{
  "conversation_id": "uuid",
  "document_ids": ["uuid"],
  "question": "Explain cellular respiration."
}
```

Response:

``` json
{
  "message_id": "uuid",
  "conversation_id": "uuid",
  "answer": "Cellular respiration is...",
  "sources": [
    {
      "document_id": "uuid",
      "chunk_id": "uuid",
      "page_start": 24,
      "page_end": 25,
      "citation_label": "Biology Fundamentals - Page 24"
    }
  ]
}
```

The backend must validate that the conversation and every selected
document belong to the authenticated user.

## 19.3 Summaries {#193-summaries}

POST `/api/v1/summaries`

Request:

``` json
{
  "document_id": "uuid",
  "summary_type": "exam_revision"
}
```

GET `/api/v1/summaries`

GET `/api/v1/summaries/{summary_id}`

## 19.4 Quizzes {#194-quizzes}

POST `/api/v1/quizzes/generate`

Request:

``` json
{
  "document_id": "uuid",
  "difficulty": "medium",
  "question_count": 10,
  "question_types": ["multiple_choice"]
}
```

GET `/api/v1/quizzes/{quiz_id}`

POST `/api/v1/quizzes/{quiz_id}/attempts`

POST `/api/v1/quiz-attempts/{attempt_id}/submit`

The quiz response before submission must not expose correct answers.

## 19.5 Flashcards {#195-flashcards}

POST `/api/v1/flashcard-sets/generate`

GET `/api/v1/flashcard-sets`

GET `/api/v1/flashcard-sets/{set_id}`

POST `/api/v1/flashcards/{flashcard_id}/review`

## 19.6 Study Planner {#196-study-planner}

POST `/api/v1/study-plans`

GET `/api/v1/study-plans`

GET `/api/v1/study-plans/{plan_id}`

POST `/api/v1/study-plans/{plan_id}/tasks`

PATCH `/api/v1/study-tasks/{task_id}`

## 19.7 Analytics {#197-analytics}

GET `/api/v1/analytics/overview`

GET `/api/v1/analytics/activity`

GET `/api/v1/analytics/performance`

GET `/api/v1/analytics/recommendations`

------------------------------------------------------------------------

# 20. AI DOCUMENT PROCESSING DATA FLOW {#20-ai-document-processing-data-flow}

When a student uploads a PDF:

1.  Validate the file.
2.  Authenticate the user.
3.  Upload the file to private object storage.
4.  Create the documents record.
5.  Create a document_processing_jobs record.
6.  Extract text with page metadata.
7.  Normalize and clean extracted text.
8.  Split text into chunks.
9.  Store document_chunks.
10. Generate embeddings.
11. Store document_embeddings.
12. Mark the document as ready.

If processing fails:

-   Store an error message.
-   Update the job status.
-   Preserve the original uploaded file.
-   Allow retry where appropriate.

The frontend should receive processing status without needing direct
database access.

------------------------------------------------------------------------

# 21. AI TUTOR RETRIEVAL DATA FLOW {#21-ai-tutor-retrieval-data-flow}

When a student asks a question:

1.  Validate the authentication token.
2.  Validate conversation ownership.
3.  Validate selected document ownership and readiness.
4.  Store the student message.
5.  Generate a query embedding.
6.  Retrieve relevant chunks from authorized documents.
7.  Rank the retrieved content.
8.  Build the grounded AI prompt.
9.  Generate the answer.
10. Validate or reconcile citations against retrieved source chunks.
11. Store the assistant message.
12. Store message_sources.
13. Return the answer and citation metadata.

Important:

The retrieval query must be scoped to the selected authorized documents
and authenticated user.

An AI response should communicate when the available document content
does not adequately support an answer rather than inventing a source.

------------------------------------------------------------------------

# 22. BACKEND MODULE STRUCTURE {#22-backend-module-structure}

Suggested FastAPI project organization:

``` text
backend/
│
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── database.py
│   │   └── exceptions.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── subject.py
│   │   ├── document.py
│   │   ├── document_chunk.py
│   │   ├── conversation.py
│   │   ├── message.py
│   │   ├── summary.py
│   │   ├── quiz.py
│   │   ├── flashcard.py
│   │   ├── study_plan.py
│   │   └── learning_activity.py
│   │
│   ├── schemas/
│   │   ├── user.py
│   │   ├── document.py
│   │   ├── chat.py
│   │   ├── summary.py
│   │   ├── quiz.py
│   │   ├── flashcard.py
│   │   ├── study_plan.py
│   │   └── analytics.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── router.py
│   │       ├── documents.py
│   │       ├── chat.py
│   │       ├── summaries.py
│   │       ├── quizzes.py
│   │       ├── flashcards.py
│   │       ├── study_plans.py
│   │       └── analytics.py
│   │
│   ├── services/
│   │   ├── document_service.py
│   │   ├── pdf_service.py
│   │   ├── embedding_service.py
│   │   ├── retrieval_service.py
│   │   ├── ai_service.py
│   │   ├── summary_service.py
│   │   ├── quiz_service.py
│   │   ├── flashcard_service.py
│   │   ├── planner_service.py
│   │   └── analytics_service.py
│   │
│   ├── repositories/
│   │   ├── document_repository.py
│   │   ├── chat_repository.py
│   │   ├── quiz_repository.py
│   │   └── learning_repository.py
│   │
│   ├── workers/
│   │   └── document_processing.py
│   │
│   └── utils/
│       ├── pagination.py
│       └── file_validation.py
│
├── migrations/
├── tests/
├── requirements.txt
├── alembic.ini
└── .env.example
```

Keep database models, API schemas, business services, and repository
operations separate.

------------------------------------------------------------------------

# 23. DATABASE MIGRATION AND INITIALIZATION ORDER {#23-database-migration-and-initialization-order}

Create tables in dependency order.

1.  Enable required PostgreSQL extensions.
2.  users.
3.  user_preferences.
4.  subjects.
5.  documents.
6.  document_processing_jobs.
7.  document_chunks.
8.  document_embeddings.
9.  conversations.
10. conversation_documents.
11. messages.
12. message_sources.
13. ai_generation_logs.
14. summaries.
15. summary_sources.
16. quizzes.
17. quiz_questions.
18. quiz_attempts.
19. quiz_attempt_answers.
20. flashcard_sets.
21. flashcards.
22. flashcard_reviews.
23. study_plans.
24. study_tasks.
25. study_plan_documents.
26. learning_activities.
27. learning_recommendations.

Use Alembic migrations to create and modify these tables.

------------------------------------------------------------------------

# 24. MVP IMPLEMENTATION PRIORITY {#24-mvp-implementation-priority}

Do not implement every table and feature simultaneously.

## Phase 1: Foundation

Required tables:

-   users
-   user_preferences
-   subjects

Implement:

-   Authentication.
-   Database connection.
-   User ownership.
-   Initial migrations.

## Phase 2: Document Intelligence

Required tables:

-   documents
-   document_processing_jobs
-   document_chunks
-   document_embeddings

Implement:

-   PDF upload.
-   Extraction.
-   Chunking.
-   Embeddings.
-   Vector retrieval.

## Phase 3: AI Tutor

Required tables:

-   conversations
-   conversation_documents
-   messages
-   message_sources

Implement:

-   Document-grounded questions.
-   Citation support.
-   Conversation history.

## Phase 4: Learning Studio

Required tables:

-   summaries
-   summary_sources
-   quizzes
-   quiz_questions
-   quiz_attempts
-   quiz_attempt_answers
-   flashcard_sets
-   flashcards
-   flashcard_reviews

Implement:

-   Summary generation.
-   Quiz generation and scoring.
-   Flashcard generation and review.

## Phase 5: Personalization

Required tables:

-   study_plans
-   study_tasks
-   learning_activities
-   learning_recommendations

Implement:

-   Study planning.
-   Activity tracking.
-   Basic analytics.
-   Learning recommendations.

------------------------------------------------------------------------

# 25. DATA RETENTION AND DELETION POLICY {#25-data-retention-and-deletion-policy}

The application should define explicit retention behavior.

When a user deletes a document:

-   Delete its file from object storage.
-   Delete its chunks and embeddings.
-   Delete associated processing records where appropriate.
-   Preserve or delete generated summaries, quizzes, and flashcards
    according to the chosen product policy.
-   Remove or invalidate citations that reference deleted source
    content.

When a user deletes an account:

-   Revoke access immediately.
-   Delete or anonymize owned records according to the retention policy.
-   Remove stored files.
-   Remove associated embeddings.
-   Ensure deletion jobs can be retried safely.

Do not assume that deleting a PostgreSQL row automatically deletes its
object storage file.

------------------------------------------------------------------------

# 26. TESTING REQUIREMENTS {#26-testing-requirements}

## Database Testing

Verify:

-   Primary keys.
-   Foreign keys.
-   Unique constraints.
-   Not-null constraints.
-   Cascade and restrict behavior.
-   Transaction rollback.

## Security Testing

Verify:

-   User A cannot access User B\'s documents.
-   User A cannot read User B\'s conversations.
-   User A cannot submit User B\'s quiz attempt.
-   User A cannot retrieve User B\'s vectors.
-   Unauthorized users cannot access protected endpoints.

## AI Data Testing

Verify:

-   Chunk page metadata is preserved.
-   Embedding dimensions match the configured model.
-   Retrieved chunks belong to authorized documents.
-   Citations point to valid chunks.
-   Failed processing can be retried.
-   Quiz answer keys are not exposed before submission.

## Functional Testing

Verify:

-   Upload and process a PDF.
-   Ask a question about the PDF.
-   Retrieve an answer with citations.
-   Generate a summary.
-   Generate and complete a quiz.
-   Review flashcards.
-   Create and complete a study task.
-   Display analytics from actual activity.

------------------------------------------------------------------------

# 27. FINAL TECHNICAL DECISIONS {#27-final-technical-decisions}

The following decisions are recommended for the first LearnSphere AI
implementation.

  Area             Decision
  ---------------- ------------------------------------
  Backend          FastAPI
  Language         Python
  Database         PostgreSQL
  Vector search    pgvector
  ORM              SQLAlchemy 2.0
  Migrations       Alembic
  Validation       Pydantic
  File storage     Private object storage
  PDF extraction   PyMuPDF
  AI integration   Provider-independent service layer
  Authentication   Supabase Auth or verified JWT
  API versioning   /api/v1
  Architecture     Modular monolith
  Timestamps       UTC
  IDs              UUID
  AI retrieval     Document-scoped RAG

------------------------------------------------------------------------

# 28. FINAL ARCHITECTURAL PRINCIPLE {#28-final-architectural-principle}

The LearnSphere AI backend must maintain one important relationship
throughout the entire application:

**Every learning experience should be traceable to the student, their
learning activity, and---where applicable---the educational material
that produced it.**

A student uploads a document.

The document produces chunks and embeddings.

Those chunks support AI Tutor answers.

The same material produces summaries, quizzes, and flashcards.

The student\'s interactions produce learning activity.

That activity informs analytics and future study recommendations.

This connected data architecture is what turns LearnSphere AI from a
collection of AI tools into a coherent personalized learning platform.

**Final principle: One student. One connected learning environment.
Traceable knowledge from document to understanding.**

export interface UserPreference {
  id: string;
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  daily_study_goal_minutes: number;
  notifications_enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  preferences?: UserPreference;
  created_at: string;
}

export type DocumentStatus =
  | "uploaded"
  | "extracting"
  | "chunking"
  | "embedding"
  | "ready"
  | "failed"
  | "deleting";

export interface DocumentItem {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  original_filename: string;
  storage_key: string;
  mime_type: string;
  file_size_bytes: number;
  page_count?: number;
  status: DocumentStatus;
  processing_error?: string;
  uploaded_at: string;
  processed_at?: string;
}

export interface Citation {
  document_id: string;
  document_title?: string;
  chunk_id: string;
  page_start?: number;
  page_end?: number;
  excerpt?: string;
  relevance_score?: number;
  citation_order: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  status?: string;
  created_at?: string;
  citations?: Citation[];
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  status: string;
  created_at: string;
  updated_at: string;
  document_ids: string[];
}

export type SummaryFormat =
  | "quick_overview"
  | "detailed"
  | "exam_revision"
  | "key_concepts"
  | "chapter_summary"
  | "bullet_points"
  | "executive"
  | "comprehensive"
  | "study_guide"
  | "faqs"
  | "concept_map";

export interface SummarySource {
  id: string;
  chunk_id: string;
  page_start?: number;
  page_end?: number;
  relevance_score?: number;
}

export interface Summary {
  id: string;
  user_id: string;
  document_id: string;
  title: string;
  summary_type: string;
  format?: string;
  content: string;
  key_takeaways: string[];
  status: string;
  created_at: string;
  sources?: SummarySource[];
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  prompt?: string;
  question_type: string;
  options: QuizOption[] | Record<string, string>;
  points?: number;
  order_index?: number;
  correct_answer?: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  question_count: number;
  questions: QuizQuestion[];
}

export interface QuestionResult {
  question_id: string;
  question_text: string;
  submitted_answer?: string;
  correct_answer: string;
  is_correct: boolean;
  explanation?: string;
  points_awarded: number;
}

export interface QuizAttemptAnswer {
  question_id: string;
  selected_option?: string;
  is_correct: boolean;
  correct_answer?: string;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score?: number;
  total_points: number;
  percentage?: number;
  score_percentage?: number;
  correct_count: number;
  correct_answers_count?: number;
  incorrect_count: number;
  total_questions_count?: number;
  status: string;
  started_at: string;
  submitted_at?: string;
  results?: QuestionResult[];
  answers?: QuizAttemptAnswer[];
}

export interface Flashcard {
  id: string;
  set_id: string;
  front_content: string;
  back_content: string;
  front?: string;
  back?: string;
  order_index: number;
}

export interface FlashcardSet {
  id: string;
  user_id: string;
  document_id?: string;
  title: string;
  description?: string;
  card_count: number;
  cards: Flashcard[];
  created_at: string;
}

export interface StudyTask {
  id: string;
  plan_id: string;
  title: string;
  description?: string;
  scheduled_date?: string;
  estimated_minutes?: number;
  status: "pending" | "in_progress" | "completed" | "skipped";
  priority: "low" | "medium" | "high";
  is_completed?: boolean;
  completed_at?: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date?: string;
  target_date?: string;
  target_exam_date?: string;
  daily_goal_minutes?: number;
  daily_minutes_goal?: number;
  status: string;
  tasks: StudyTask[];
  created_at: string;
}

export interface OverviewMetrics {
  total_documents: number;
  quizzes_completed: number;
  average_quiz_score: number;
  flashcards_reviewed: number;
  study_tasks_completed: number;
}

export interface WeeklyActivity {
  day: string;
  date: string;
  events_count: number;
}

export interface TopicPerformance {
  topic: string;
  total_questions: number;
  correct_count: number;
  accuracy_percentage: number;
  accuracy?: number;
  is_weak: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  recommendation_type: string;
  related_document_id?: string;
}

export interface AnalyticsDashboardData {
  metrics: OverviewMetrics;
  weekly_activity: WeeklyActivity[];
  topic_performance: TopicPerformance[];
  weak_topics: (string | { topic: string; accuracy: number })[];
  recommendations: (string | Recommendation)[];
  total_documents?: number;
  total_questions_attempted?: number;
  accuracy_rate?: number;
  study_streak_days?: number;
}

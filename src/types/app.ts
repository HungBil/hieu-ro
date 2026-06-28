export type UserRole = "learner" | "contributor" | "reviewer" | "admin";

export type ContextType =
  | "general"
  | "personal_message"
  | "school"
  | "work"
  | "family"
  | "travel"
  | "money"
  | "warning"
  | "community"
  | "other";

export type ToneType = "neutral" | "polite" | "friendly" | "formal" | "short";

export type FeedbackRating =
  | "correct"
  | "wrong_meaning"
  | "missing_meaning"
  | "too_verbose"
  | "too_hard"
  | "hallucinated"
  | "other";

export type LearningItemType =
  | "clarity"
  | "grammar"
  | "word_order"
  | "connector"
  | "time_specificity"
  | "politeness"
  | "sentence_pattern";

export type RepetitionGrade = "again" | "hard" | "good" | "easy";

export type ConsentScope = "public" | "anonymous" | "internal_only";
export type SampleStatus = "draft" | "pending_review" | "approved" | "rejected" | "needs_changes";
export type CommunityPostType = "ask_meaning" | "share_sample" | "feedback" | "discussion";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_deaf_community_member: boolean;
  knows_sign_language: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  user_id: string;
  save_history: boolean;
  allow_learning_suggestions: boolean;
  allow_notifications: boolean;
  daily_learning_target: number;
  timezone: string | null;
  created_at: string;
  updated_at: string;
};

export type Ambiguity = {
  phrase: string;
  why_unclear?: string;
  question: string;
};

export type LearningPoint = {
  type: LearningItemType;
  title: string;
  rule_text: string;
  unclear_example?: string | null;
  clear_example?: string | null;
};

export type RewriteResult = {
  rewritten_text: string;
  meaning_guess?: string;
  confidence_score: number;
  ambiguity_level?: "low" | "medium" | "high";
  ambiguities: Ambiguity[];
  rewrite_reasons: string[];
  learning_points: LearningPoint[];
  safety_notes?: string[];
  should_ask_user?: boolean;
};

export type CoachSession = {
  id: string;
  user_id: string;
  input_text: string;
  context_type: ContextType;
  tone: ToneType;
  result_json: RewriteResult | null;
  rewritten_text: string | null;
  confidence_score: number | null;
  saved: boolean;
  feedback_summary: string | null;
  quality_status: string;
  created_at: string;
  updated_at: string;
};

export type SavedPhrase = {
  id: string;
  user_id: string;
  coach_session_id: string | null;
  original_text: string;
  rewritten_text: string;
  context_type: ContextType;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type LearningItem = {
  id: string;
  user_id: string;
  source_session_id: string | null;
  item_type: LearningItemType;
  title: string;
  rule_text: string;
  unclear_example: string | null;
  clear_example: string | null;
  next_review_at: string | null;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  lapses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WritingSample = {
  id: string;
  user_id: string;
  original_text: string;
  context_note: string | null;
  intended_meaning: string | null;
  standard_vietnamese_text: string | null;
  consent_scope: ConsentScope;
  status: SampleStatus;
  is_anonymized: boolean;
  contains_sensitive_info: boolean;
  reviewer_id: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunityPost = {
  id: string;
  user_id: string;
  post_type: CommunityPostType;
  title: string;
  body: string;
  is_anonymous: boolean;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  reply_count?: number;
};

export type CommunityReply = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  is_anonymous: boolean;
  is_helpful: boolean;
  created_at: string;
  updated_at: string;
};

export type Rating = "again" | "hard" | "good" | "easy";

export type Topic = { key: string; label: string; description: string };

export type TopicStat = {
  topic: string;
  label: string;
  answered: number;
  correct: number;
  accuracy: number;
};

export type Account = {
  id: string;
  email: string | null;
  name: string | null;
  photo_url: string | null;
  is_guest: boolean;
  stats: {
    xp_total: number;
    xp_week: number;
    week_rank: number | null;
    streak_days: number;
    due_cards: number;
    total_cards: number;
    quizzes_completed: number;
    questions_answered: number;
    accuracy: number | null;
    topics: TopicStat[];
  };
};

export type Question = {
  id: string;
  position: number;
  topic: string;
  topic_label: string;
  source: "ai" | "bank";
  prompt: string;
  options: string[];
  selected_index: number | null;
  correct_index: number | null;
  is_correct: boolean | null;
  explanation: string | null;
  reference: string | null;
  reference_url: string | null;
};

export type QuizSummary = {
  id: string;
  topic: string | null;
  topic_label: string;
  status: "in_progress" | "completed";
  total: number;
  score: number | null;
  xp_earned: number | null;
  cards_created: number | null;
  created_at: string;
  completed_at: string | null;
};

export type Quiz = QuizSummary & { questions: Question[] };

export type Flashcard = {
  id: string;
  topic: string;
  topic_label: string;
  front: string;
  back: string;
  explanation: string | null;
  reference: string | null;
  reference_url: string | null;
  interval_days: number;
  repetitions: number;
  lapses: number;
  due_at: string;
  last_reviewed_at: string | null;
  created_at: string;
  next_intervals: Record<Rating, number>;
};

export type ReviewResult = { card: Flashcard; xp_earned: number; remaining_due: number };

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  name: string;
  photo_url: string | null;
  xp: number;
  is_me: boolean;
};

export type Leaderboard = {
  period: "week" | "all";
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
};

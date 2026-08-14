// ─── Types ────────────────────────────────────────────────────────────────────

export interface Language {
  id: number;
  code: string;
  name: string;
  flag_emoji: string;
}

export interface Exercise {
  id: number;
  order: number;
  type: 'multiple_choice' | 'translate' | 'match_pairs' | 'fill_blank' | 'type_answer';
  question: string;
  correct_answer: string;
  options: string[];
  word_bank: string[];
  hint: string | null;
  character_animation: string | null;
}

export interface Skill {
  id: number;
  order: number;
  name: string;
  description: string;
  icon: string;
  total_lessons: number;
  is_unlocked: boolean;
  is_completed: boolean;
  completed_lessons: number;
  crown_level: number;
}

export interface Unit {
  id: number;
  order: number;
  name: string;
  description: string;
  color: string;
  skills: Skill[];
}

export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  xp_total: number;
  streak: number;
  longest_streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  daily_xp_goal: number;
  last_activity_date: string;
  league: string;
}

export interface UserStats {
  user: User & {
    daily_xp_earned: number;
    created_at: string;
  };
  total_lessons_completed: number;
  total_skills_completed: number;
  achievements: Achievement[];
}

export interface Achievement {
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface LessonData {
  lesson_id: number;
  title: string;
  xp_reward: number;
  exercises: Exercise[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  xp_total: number;
  streak: number;
  league: string;
}

export interface LessonCompleteResponse {
  xp_earned: number;
  new_xp_total: number;
  streak: number;
  hearts_remaining: number;
  skill_completed: boolean;
  skill_id: number;
  achievements_earned: Array<{ name: string; description: string; icon: string }>;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

const BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const api = {
  getLanguages: () => apiFetch<Language[]>('/languages'),

  getLearningPath: (langCode = 'es', userId = 1) =>
    apiFetch<Unit[]>(`/course/${langCode}/path?user_id=${userId}`),

  getSkillLessons: (skillId: number, userId = 1) =>
    apiFetch<Array<{ id: number; order: number; title: string; xp_reward: number; is_completed: boolean; xp_earned: number }>>(
      `/skills/${skillId}/lessons?user_id=${userId}`
    ),

  getLessonExercises: (lessonId: number) =>
    apiFetch<LessonData>(`/lessons/${lessonId}/exercises`),

  completeLesson: (data: { user_id: number; lesson_id: number; mistakes: number; xp_earned: number }) =>
    apiFetch<LessonCompleteResponse>('/lessons/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUser: (userId = 1) => apiFetch<User>(`/users/${userId}`),

  getUserStats: (userId = 1) => apiFetch<UserStats>(`/users/${userId}/stats`),

  updateUser: (userId: number, data: { display_name?: string; daily_xp_goal?: number }) =>
    apiFetch<User>(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  refillHearts: (userId = 1) =>
    apiFetch<{ hearts: number; gems: number }>(`/users/${userId}/hearts/refill`, { method: 'POST' }),

  buyGems: (userId = 1, amount: number) =>
    apiFetch<{ gems: number }>(`/users/${userId}/gems/add`, { 
      method: 'POST', 
      body: JSON.stringify({ amount }) 
    }),

  deductHeart: (userId = 1) =>
    apiFetch<{ hearts: number }>(`/users/${userId}/hearts/deduct`, { method: 'POST' }),

  getLeaderboard: () => apiFetch<LeaderboardEntry[]>('/leaderboard'),
};

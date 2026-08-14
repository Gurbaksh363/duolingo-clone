from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Language / Course ─────────────────────────────────────────────────────────

class LanguageOut(BaseModel):
    id: int
    code: str
    name: str
    flag_emoji: str
    model_config = {"from_attributes": True}


class ExerciseOut(BaseModel):
    id: int
    order: int
    type: str
    question: str
    correct_answer: str
    options: str        # JSON string
    word_bank: str      # JSON string
    hint: Optional[str]
    character_animation: Optional[str]
    model_config = {"from_attributes": True}


class LessonOut(BaseModel):
    id: int
    order: int
    title: str
    xp_reward: int
    exercises: List[ExerciseOut] = []
    model_config = {"from_attributes": True}


class SkillOut(BaseModel):
    id: int
    order: int
    name: str
    description: str
    icon: str
    total_lessons: int
    model_config = {"from_attributes": True}


class SkillWithProgressOut(BaseModel):
    id: int
    order: int
    name: str
    description: str
    icon: str
    total_lessons: int
    is_unlocked: bool
    is_completed: bool
    completed_lessons: int
    crown_level: int
    model_config = {"from_attributes": True}


class UnitOut(BaseModel):
    id: int
    order: int
    name: str
    description: str
    color: str
    skills: List[SkillOut] = []
    model_config = {"from_attributes": True}


class UnitWithProgressOut(BaseModel):
    id: int
    order: int
    name: str
    description: str
    color: str
    skills: List[SkillWithProgressOut] = []
    model_config = {"from_attributes": True}


# ─── User ──────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: str
    xp_total: int
    streak: int
    longest_streak: int
    hearts: int
    max_hearts: int
    gems: int
    daily_xp_goal: int
    last_activity_date: str
    league: str
    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    daily_xp_goal: Optional[int] = None
    avatar_url: Optional[str] = None


# ─── Progress ──────────────────────────────────────────────────────────────────

class LessonCompleteRequest(BaseModel):
    user_id: int
    lesson_id: int
    mistakes: int = 0
    xp_earned: int = 10


class LessonCompleteResponse(BaseModel):
    xp_earned: int
    new_xp_total: int
    streak: int
    hearts_remaining: int
    skill_completed: bool
    skill_id: int
    achievements_earned: List[Dict[str, Any]] = []


class HeartRefillResponse(BaseModel):
    hearts: int
    gems: int


# ─── Leaderboard ───────────────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    display_name: str
    avatar_url: str
    xp_total: int
    streak: int
    league: str
    model_config = {"from_attributes": True}

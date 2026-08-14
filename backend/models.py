from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


# ─── Course content ────────────────────────────────────────────────────────────

class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True)   # e.g. "es"
    name = Column(String(100))                            # e.g. "Spanish"
    flag_emoji = Column(String(10))
    units = relationship("Unit", back_populates="language")


class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    language_id = Column(Integer, ForeignKey("languages.id"))
    order = Column(Integer)
    name = Column(String(200))
    description = Column(Text)
    color = Column(String(20), default="#58CC02")      # hex for header
    language = relationship("Language", back_populates="units")
    skills = relationship("Skill", back_populates="unit", order_by="Skill.order")


class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"))
    order = Column(Integer)
    name = Column(String(200))
    description = Column(Text)
    icon = Column(String(200), default="⭐")
    total_lessons = Column(Integer, default=4)
    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", order_by="Lesson.order")


class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    order = Column(Integer)
    title = Column(String(200))
    xp_reward = Column(Integer, default=10)
    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", order_by="Exercise.order")


class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    order = Column(Integer)
    type = Column(String(50))          # multiple_choice | translate | match_pairs | fill_blank | type_answer
    question = Column(Text)
    correct_answer = Column(Text)
    options = Column(Text)             # JSON-encoded list of option strings
    word_bank = Column(Text)           # JSON-encoded list for translate/tap exercises
    hint = Column(Text, nullable=True)
    character_animation = Column(String(100), nullable=True)
    lesson = relationship("Lesson", back_populates="exercises")


# ─── User / progress ───────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    display_name = Column(String(200))
    avatar_url = Column(String(500), default="")
    xp_total = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    hearts = Column(Integer, default=5)
    max_hearts = Column(Integer, default=5)
    gems = Column(Integer, default=500)
    daily_xp_goal = Column(Integer, default=20)
    last_activity_date = Column(String(20), default="")   # ISO date string
    created_at = Column(DateTime, default=datetime.utcnow)
    league = Column(String(50), default="Bronze")
    skill_progress = relationship("UserSkillProgress", back_populates="user")
    lesson_progress = relationship("UserLessonProgress", back_populates="user")


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    completed_lessons = Column(Integer, default=0)
    is_unlocked = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    crown_level = Column(Integer, default=0)   # 0-5
    user = relationship("User", back_populates="skill_progress")
    skill = relationship("Skill")


class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    is_completed = Column(Boolean, default=False)
    xp_earned = Column(Integer, default=0)
    mistakes = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson")


class DailyProgress(Base):
    __tablename__ = "daily_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String(20))          # ISO date YYYY-MM-DD
    xp_earned = Column(Integer, default=0)


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200))
    description = Column(Text)
    icon = Column(String(10))
    condition_type = Column(String(50))   # streak | xp | lessons_completed
    condition_value = Column(Integer)
    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    earned_at = Column(DateTime, default=datetime.utcnow)
    achievement = relationship("Achievement", back_populates="user_achievements")

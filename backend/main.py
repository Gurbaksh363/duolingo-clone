from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from datetime import date, datetime
from typing import List, Optional
import json

from database import engine, get_db, Base
import models
import schemas
from seed import seed

# Create tables and seed on startup
Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(title="Duolingo Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_USER_ID = 1   # "learner" – the logged-in user for this demo


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "Duolingo Clone API"}


# ─── Languages ────────────────────────────────────────────────────────────────

@app.get("/api/languages", response_model=List[schemas.LanguageOut])
def get_languages(db: Session = Depends(get_db)):
    return db.query(models.Language).all()


# ─── Learning Path ────────────────────────────────────────────────────────────

@app.get("/api/course/{lang_code}/path")
def get_learning_path(lang_code: str, user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    """Return all units with skills enriched with the current user's progress."""
    lang = db.query(models.Language).filter(models.Language.code == lang_code).first()
    if not lang:
        raise HTTPException(404, "Language not found")

    units = (
        db.query(models.Unit)
        .filter(models.Unit.language_id == lang.id)
        .options(joinedload(models.Unit.skills))
        .order_by(models.Unit.order)
        .all()
    )

    # Fetch user's skill progress in one shot
    skill_progress = {
        sp.skill_id: sp
        for sp in db.query(models.UserSkillProgress)
        .filter(models.UserSkillProgress.user_id == user_id)
        .all()
    }

    result = []
    for unit in units:
        skills_out = []
        for skill in sorted(unit.skills, key=lambda s: s.order):
            sp = skill_progress.get(skill.id)
            skills_out.append({
                "id": skill.id,
                "order": skill.order,
                "name": skill.name,
                "description": skill.description,
                "icon": skill.icon,
                "total_lessons": skill.total_lessons,
                "is_unlocked": sp.is_unlocked if sp else False,
                "is_completed": sp.is_completed if sp else False,
                "completed_lessons": sp.completed_lessons if sp else 0,
                "crown_level": sp.crown_level if sp else 0,
            })
        result.append({
            "id": unit.id,
            "order": unit.order,
            "name": unit.name,
            "description": unit.description,
            "color": unit.color,
            "skills": skills_out,
        })
    return result


# ─── Skill / Lessons ──────────────────────────────────────────────────────────

@app.get("/api/skills/{skill_id}/lessons")
def get_skill_lessons(skill_id: int, user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(404, "Skill not found")

    sp = db.query(models.UserSkillProgress).filter(
        models.UserSkillProgress.user_id == user_id,
        models.UserSkillProgress.skill_id == skill_id,
    ).first()

    if not sp or not sp.is_unlocked:
        raise HTTPException(403, "Skill not yet unlocked")

    lessons = db.query(models.Lesson).filter(models.Lesson.skill_id == skill_id).order_by(models.Lesson.order).all()
    lesson_progress = {
        lp.lesson_id: lp
        for lp in db.query(models.UserLessonProgress)
        .filter(models.UserLessonProgress.user_id == user_id)
        .all()
    }

    result = []
    for lesson in lessons:
        lp = lesson_progress.get(lesson.id)
        result.append({
            "id": lesson.id,
            "order": lesson.order,
            "title": lesson.title,
            "xp_reward": lesson.xp_reward,
            "is_completed": lp.is_completed if lp else False,
            "xp_earned": lp.xp_earned if lp else 0,
        })
    return result


# ─── Lesson / Exercises ───────────────────────────────────────────────────────

@app.get("/api/lessons/{lesson_id}/exercises")
def get_lesson_exercises(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    exercises = (
        db.query(models.Exercise)
        .filter(models.Exercise.lesson_id == lesson_id)
        .order_by(models.Exercise.order)
        .all()
    )

    result = []
    for ex in exercises:
        result.append({
            "id": ex.id,
            "order": ex.order,
            "type": ex.type,
            "question": ex.question,
            "correct_answer": ex.correct_answer,
            "options": json.loads(ex.options) if ex.options else [],
            "word_bank": json.loads(ex.word_bank) if ex.word_bank else [],
            "hint": ex.hint,
            "character_animation": ex.character_animation,
        })
    return {"lesson_id": lesson_id, "title": lesson.title, "xp_reward": lesson.xp_reward, "exercises": result}


# ─── Complete Lesson ──────────────────────────────────────────────────────────

@app.post("/api/lessons/complete", response_model=schemas.LessonCompleteResponse)
def complete_lesson(req: schemas.LessonCompleteRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    lesson = db.query(models.Lesson).filter(models.Lesson.id == req.lesson_id).first()
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    # Heart deduction for mistakes
    # Hearts are now deducted instantly during the lesson

    # XP
    xp = req.xp_earned
    user.xp_total += xp

    # Streak
    today = str(date.today())
    if user.last_activity_date != today:
        from datetime import timedelta
        yesterday = str(date.today() - timedelta(days=1))
        if user.last_activity_date == yesterday:
            user.streak += 1
        else:
            user.streak = 1
        user.last_activity_date = today
        user.longest_streak = max(user.streak, user.longest_streak)

    # Daily progress
    dp = db.query(models.DailyProgress).filter(
        models.DailyProgress.user_id == req.user_id,
        models.DailyProgress.date == today,
    ).first()
    if dp:
        dp.xp_earned += xp
    else:
        db.add(models.DailyProgress(user_id=req.user_id, date=today, xp_earned=xp))

    # Lesson progress
    lp = db.query(models.UserLessonProgress).filter(
        models.UserLessonProgress.user_id == req.user_id,
        models.UserLessonProgress.lesson_id == req.lesson_id,
    ).first()
    if not lp:
        lp = models.UserLessonProgress(user_id=req.user_id, lesson_id=req.lesson_id)
        db.add(lp)
    lp.is_completed = True
    lp.xp_earned = xp
    lp.mistakes = req.mistakes
    lp.completed_at = datetime.utcnow()

    # Skill progress
    skill_id = lesson.skill_id
    sp = db.query(models.UserSkillProgress).filter(
        models.UserSkillProgress.user_id == req.user_id,
        models.UserSkillProgress.skill_id == skill_id,
    ).first()
    if not sp:
        sp = models.UserSkillProgress(user_id=req.user_id, skill_id=skill_id, is_unlocked=True)
        db.add(sp)

    sp.completed_lessons += 1
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    skill_completed = sp.completed_lessons >= skill.total_lessons
    if skill_completed:
        sp.is_completed = True
        sp.crown_level = min(sp.crown_level + 1, 5)
        # Unlock the next skill
        next_skill = (
            db.query(models.Skill)
            .filter(models.Skill.unit_id == skill.unit_id, models.Skill.order == skill.order + 1)
            .first()
        )
        if next_skill:
            next_sp = db.query(models.UserSkillProgress).filter(
                models.UserSkillProgress.user_id == req.user_id,
                models.UserSkillProgress.skill_id == next_skill.id,
            ).first()
            if not next_sp:
                next_sp = models.UserSkillProgress(user_id=req.user_id, skill_id=next_skill.id)
                db.add(next_sp)
            next_sp.is_unlocked = True

    # Achievements
    achievements_earned = []
    all_achievements = db.query(models.Achievement).all()
    user_achievement_ids = {
        ua.achievement_id
        for ua in db.query(models.UserAchievement).filter(models.UserAchievement.user_id == req.user_id).all()
    }
    total_lessons_completed = db.query(models.UserLessonProgress).filter(
        models.UserLessonProgress.user_id == req.user_id,
        models.UserLessonProgress.is_completed == True,
    ).count()

    for ach in all_achievements:
        if ach.id in user_achievement_ids:
            continue
        earned = False
        if ach.condition_type == "streak" and user.streak >= ach.condition_value:
            earned = True
        elif ach.condition_type == "xp" and user.xp_total >= ach.condition_value:
            earned = True
        elif ach.condition_type == "lessons_completed" and total_lessons_completed >= ach.condition_value:
            earned = True
        if earned:
            db.add(models.UserAchievement(user_id=req.user_id, achievement_id=ach.id))
            achievements_earned.append({"name": ach.name, "description": ach.description, "icon": ach.icon})

    db.commit()
    db.refresh(user)

    return schemas.LessonCompleteResponse(
        xp_earned=xp,
        new_xp_total=user.xp_total,
        streak=user.streak,
        hearts_remaining=user.hearts,
        skill_completed=skill_completed,
        skill_id=skill_id,
        achievements_earned=achievements_earned,
    )


# ─── User ─────────────────────────────────────────────────────────────────────

@app.get("/api/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
        
    # Check if streak was lost
    if user.last_activity_date:
        today = date.today()
        from datetime import timedelta
        yesterday = str(today - timedelta(days=1))
        today_str = str(today)
        
        # If the user hasn't played today AND didn't play yesterday, their streak is broken.
        if user.last_activity_date != today_str and user.last_activity_date != yesterday:
            user.streak = 0
            db.commit()
            
    return user


@app.get("/api/users/me", response_model=schemas.UserOut)
def get_me(db: Session = Depends(get_db)):
    return get_user(DEFAULT_USER_ID, db)


@app.put("/api/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, data: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if data.display_name is not None:
        user.display_name = data.display_name
    if data.daily_xp_goal is not None:
        user.daily_xp_goal = data.daily_xp_goal
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url
    db.commit()
    db.refresh(user)
    return user



@app.post("/api/users/{user_id}/hearts/deduct")
def deduct_heart(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.hearts > 0:
        user.hearts -= 1
        db.commit()
    return {"hearts": user.hearts}

@app.post("/api/users/{user_id}/hearts/refill")
def refill_hearts(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    cost = 350
    if user.gems < cost:
        raise HTTPException(400, "Not enough gems")
    user.gems -= cost
    user.hearts = user.max_hearts
    db.commit()
    db.refresh(user)
    return {"hearts": user.hearts, "gems": user.gems}

from pydantic import BaseModel
class AddGemsRequest(BaseModel):
    amount: int

@app.post("/api/users/{user_id}/gems/add")
def add_gems(user_id: int, req: AddGemsRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.gems += req.amount
    db.commit()
    db.refresh(user)
    return {"gems": user.gems}


@app.get("/api/users/{user_id}/stats")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # Check if streak was lost
    if user.last_activity_date:
        today = date.today()
        from datetime import timedelta
        yesterday = str(today - timedelta(days=1))
        today_str = str(today)
        
        # If the user hasn't played today AND didn't play yesterday, their streak is broken.
        if user.last_activity_date != today_str and user.last_activity_date != yesterday:
            user.streak = 0
            db.commit()

    total_lessons = db.query(models.UserLessonProgress).filter(
        models.UserLessonProgress.user_id == user_id,
        models.UserLessonProgress.is_completed == True,
    ).count()

    total_skills = db.query(models.UserSkillProgress).filter(
        models.UserSkillProgress.user_id == user_id,
        models.UserSkillProgress.is_completed == True,
    ).count()

    today = str(date.today())
    daily = db.query(models.DailyProgress).filter(
        models.DailyProgress.user_id == user_id,
        models.DailyProgress.date == today,
    ).first()

    achievements = (
        db.query(models.UserAchievement)
        .filter(models.UserAchievement.user_id == user_id)
        .options(joinedload(models.UserAchievement.achievement))
        .all()
    )

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "xp_total": user.xp_total,
            "streak": user.streak,
            "longest_streak": user.longest_streak,
            "hearts": user.hearts,
            "gems": user.gems,
            "daily_xp_goal": user.daily_xp_goal,
            "daily_xp_earned": daily.xp_earned if daily else 0,
            "league": user.league,
            "created_at": user.created_at.isoformat() if user.created_at else "",
        },
        "total_lessons_completed": total_lessons,
        "total_skills_completed": total_skills,
        "achievements": [
            {
                "name": ua.achievement.name,
                "description": ua.achievement.description,
                "icon": ua.achievement.icon,
                "earned_at": ua.earned_at.isoformat() if ua.earned_at else "",
            }
            for ua in achievements
        ],
    }


# ─── Leaderboard ──────────────────────────────────────────────────────────────

@app.get("/api/leaderboard", response_model=List[schemas.LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.xp_total.desc()).limit(20).all()
    result = []
    for rank, user in enumerate(users, 1):
        result.append(schemas.LeaderboardEntry(
            rank=rank,
            user_id=user.id,
            username=user.username,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            xp_total=user.xp_total,
            streak=user.streak,
            league=user.league,
        ))
    return result

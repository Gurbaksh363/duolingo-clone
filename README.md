# 🦜 Duolingo Clone – Full-Stack SDE Assignment

A production-grade clone of the Duolingo web application built with **Next.js + FastAPI + SQLite**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+

### 1. Start the Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be at `http://localhost:8000`. The database is auto-created and seeded on first run.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## 🏗️ Architecture Overview

```
duolingo-app/
├── backend/          # FastAPI Python backend
│   ├── main.py       # All API routes
│   ├── models.py     # SQLAlchemy ORM models
│   ├── schemas.py    # Pydantic request/response schemas
│   ├── database.py   # SQLite connection setup
│   ├── seed.py       # DB seeder (Spanish course + 5 users)
│   └── requirements.txt
│
└── frontend/         # Next.js 15 TypeScript frontend
    ├── app/
    │   ├── learn/     # Skill tree / learning path
    │   ├── lesson/[id]/  # Lesson player (exercise loop)
    │   ├── profile/   # User profile + achievements
    │   ├── leaderboard/  # XP rankings
    │   └── shop/      # Hearts/gems shop
    ├── components/
    │   ├── Sidebar.tsx   # Main navigation
    │   ├── TopBar.tsx    # Streak/XP/hearts bar
    │   └── SkillModal.tsx  # Skill start modal
    └── lib/
        ├── api.ts     # Typed API client
        └── store.ts   # Zustand global state
```

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `languages` | Language catalog (Spanish seeded) |
| `units` | Grouped skill sections (4 units) |
| `skills` | Individual skills within units (14 skills) |
| `lessons` | Lessons within each skill (3–4 per skill) |
| `exercises` | Individual questions (6 types per lesson) |
| `users` | Learner accounts (5 seeded) |
| `user_skill_progress` | Per-user skill unlock/completion state |
| `user_lesson_progress` | Per-user lesson completion + XP earned |
| `daily_progress` | Daily XP tracking for streak logic |
| `achievements` | Achievement definitions |
| `user_achievements` | Earned achievements per user |

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/languages` | List all languages |
| GET | `/api/course/{lang}/path` | Full learning path with user progress |
| GET | `/api/skills/{id}/lessons` | Lessons for a skill |
| GET | `/api/lessons/{id}/exercises` | All exercises for a lesson |
| POST | `/api/lessons/complete` | Complete lesson → awards XP, updates streak |
| GET | `/api/users/{id}` | Get user info |
| GET | `/api/users/{id}/stats` | Full stats + achievements |
| PUT | `/api/users/{id}` | Update user profile |
| POST | `/api/users/{id}/hearts/refill` | Refill hearts (costs 350 gems) |
| POST | `/api/users/{id}/hearts/deduct` | Deduct a heart instantly on mistake |
| GET | `/api/leaderboard` | XP-ranked leaderboard |

---

## ✨ Core Features Implemented

- **Skill Tree / Learning Path** – sinusoidal path with progress rings and lock/unlock states
- **5 Exercise Types** – Multiple choice, translate (tap words), fill-in-the-blank, type answer, match pairs
- **Feedback Bar** – Duolingo-style green/red animated feedback after each answer
- **Hearts System** – Lose hearts on wrong answers; refill via shop (350 gems)
- **XP & Streaks** – Earned on lesson completion; streak increments on daily activity
- **Lesson Complete Modal** – Stats + achievements earned display
- **Leaderboard** – 5 seeded users ranked by XP
- **Profile Page** – Stats, achievements, daily goal ring
- **Shop** – Heart refill, gem tiers, Super Duolingo placeholder
- **Progress Persistence** – All progress stored in SQLite via FastAPI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, CSS Modules |
| Backend | Python 3, FastAPI, Uvicorn |
| Database | SQLite via SQLAlchemy 2.0 |
| State | Zustand (client-side) |
| Assets | Official SVG icons & Lottie Animations (lottie-react) |

---

## Assumptions

- **Single user**: User ID 1 ("learner") is the logged-in user for this demo. Auth is mocked.
- **One language**: Spanish (ES) is seeded. The architecture supports multiple languages.
- **Audio**: Placeholder (no actual TTS).
- **Gems**: Earned via mocked initial balance; in-app purchases are "Coming Soon".

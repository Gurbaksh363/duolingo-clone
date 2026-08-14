# 🦜 Duolingo Clone — Full-Stack Web App

A production-grade clone of the Duolingo web app built with **Next.js 15 + FastAPI + SQLite**.  
Replicates core features: skill tree, lesson loop (5 exercise types), XP/streak/hearts, leaderboard, shop, and profile.

---

## 🚀 Quick Start (Local)

### Prerequisites
- **Node.js** v18+ and npm
- **Python** 3.10+

### 1 — Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be live at `http://localhost:8000`.  
The SQLite database is **auto-created and seeded** on first run — no manual setup needed.

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`**.

---

## 🌐 Self-Hosting on a VPS (Ubuntu)

```bash
# 1. Install dependencies
apt update && apt install -y git python3-pip nodejs npm nginx
npm install -g pm2

# 2. Clone repo
git clone https://github.com/Gurbaksh363/duolingo-clo
cd duolingo-clo/duolingo-app

# 3. Start backend
cd backend && pip3 install -r requirements.txt
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name backend

# 4. Build & start frontend
cd ../frontend && npm install && npm run build
pm2 start "npm start" --name frontend

# 5. Nginx config → proxy /  to :3000, /api to :8000
```

---

## 🏗️ Project Structure

```
duolingo-app/
├── backend/
│   ├── main.py          # All API routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── database.py      # SQLite connection
│   ├── seed.py          # DB seeder (Spanish course + 5 users)
│   ├── duolingo.db      # Pre-seeded SQLite database
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── learn/           # Skill tree / learning path
    │   ├── lesson/[id]/     # Lesson player (exercise loop)
    │   ├── profile/         # User stats + achievements
    │   ├── leaderboard/     # XP rankings
    │   └── shop/            # Hearts & gems shop
    ├── components/
    │   ├── Sidebar.tsx      # Main navigation + user stats
    │   ├── TopBar.tsx       # Streak / gems / hearts bar
    │   └── SkillModal.tsx   # Skill start modal
    ├── lib/
    │   ├── api.ts           # Typed API client
    │   └── store.ts         # Zustand global state
    └── public/
        ├── icons/           # SVG icons (Duolingo-style)
        ├── flags/           # Country flag SVGs
        ├── audio/           # Correct / wrong / complete sounds
        └── animations/      # Lottie + Rive animation files
```

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `languages` | Language catalog (Spanish seeded) |
| `units` | Grouped sections of the skill tree (4 units) |
| `skills` | Individual skills within units (14 skills) |
| `lessons` | Lessons within each skill (3–4 per skill) |
| `exercises` | Individual questions per lesson (5+ types) |
| `users` | Learner accounts (5 seeded users) |
| `user_skill_progress` | Skill unlock / completion state per user |
| `user_lesson_progress` | Lesson completion + XP earned per user |
| `daily_progress` | Daily XP tracking for streak logic |
| `achievements` | Achievement definitions |
| `user_achievements` | Earned achievements per user |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/languages` | List all languages |
| GET | `/api/course/{lang}/path` | Full learning path with user progress |
| GET | `/api/skills/{id}/lessons` | Lessons for a skill |
| GET | `/api/lessons/{id}/exercises` | Exercises for a lesson |
| POST | `/api/lessons/complete` | Complete lesson → award XP, update streak |
| GET | `/api/users/{id}` | Get user profile |
| GET | `/api/users/{id}/stats` | Full stats + achievements |
| PUT | `/api/users/{id}` | Update user profile |
| POST | `/api/users/{id}/hearts/refill` | Refill hearts (costs 350 gems) |
| POST | `/api/users/{id}/hearts/deduct` | Deduct a heart on mistake |
| GET | `/api/leaderboard` | XP-ranked leaderboard |

---

## ✨ Features

| Feature | Details |
|---|---|
| **Skill Tree** | Sinusoidal path with progress rings, lock/unlock states |
| **5 Exercise Types** | Multiple choice, word-bank translate, fill-blank, type answer, match pairs |
| **Hearts System** | Lose a heart on wrong answer; refill via Shop (350 gems) |
| **XP & Streaks** | Earned on lesson completion; streak increments on first lesson of the day |
| **Match Pairs** | Instant wrong-answer flash + sound; auto-advances when all pairs matched |
| **Lesson Complete Modal** | XP earned, streak, achievements unlocked |
| **Leaderboard** | 5 seeded users ranked by XP; live-updates after lesson completion |
| **Profile Page** | Stats grid, daily goal bar, achievements with official SVG icons |
| **Shop** | Heart refill, gem tiers, Super Duolingo placeholder |
| **Global State Sync** | Zustand store keeps XP/streak/hearts in sync across Sidebar, TopBar, and Leaderboard instantly |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, CSS Modules |
| Backend | Python 3, FastAPI, Uvicorn |
| Database | SQLite via SQLAlchemy 2.0 |
| State | Zustand (client-side global store) |
| Animations | Lottie (lottie-react), Rive (@rive-app/canvas) |
| Icons | Official Duolingo SVG assets |

---

## 📋 Assumptions & Mocked Data

- **Auth**: Single user (ID = 1) is auto-logged-in. No real authentication implemented.
- **Language**: Spanish (ES) is seeded. The architecture supports multiple languages.
- **Leaderboard**: Populated with 5 dummy AI-generated users for competitive context.
- **Audio**: Local sound files served from `public/audio/` (no TTS).
- **Gems**: Users start with 800 gems; in-app purchases are a UI placeholder ("Coming Soon").
- **Super Duolingo**: UI placeholder only — no payment gateway integrated.

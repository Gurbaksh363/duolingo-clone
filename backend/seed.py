import json
from datetime import datetime, date
from database import SessionLocal, engine, Base
import models

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Skip if already seeded
    if db.query(models.Language).first():
        print("Already seeded, skipping.")
        db.close()
        return

    # ── Language ────────────────────────────────────────────────────────────
    spanish = models.Language(code="es", name="Spanish", flag_emoji="🇪🇸")
    db.add(spanish)
    db.flush()

    # ── Units ───────────────────────────────────────────────────────────────
    unit_data = [
        {"order": 1, "name": "Greetings & Basics", "description": "Learn to say hello, introduce yourself and count", "color": "#58CC02"},
        {"order": 2, "name": "Family & Home",        "description": "Talk about your family and describe your home",    "color": "#CE82FF"},
        {"order": 3, "name": "Food & Drink",          "description": "Order food, drinks and describe meals",            "color": "#FF9600"},
        {"order": 4, "name": "Travel & Directions",   "description": "Navigate cities and ask for directions",           "color": "#1CB0F6"},
    ]
    units = []
    for ud in unit_data:
        u = models.Unit(language_id=spanish.id, **ud)
        db.add(u)
        db.flush()
        units.append(u)

    # ── Skills per unit ─────────────────────────────────────────────────────
    skills_data = [
        # Unit 1 – Greetings
        [
            {"order": 1, "name": "Basics 1",        "description": "Learn simple phrases",       "icon": "⭐", "total_lessons": 4},
            {"order": 2, "name": "Phrases",          "description": "Common conversational phrases","icon": "💬", "total_lessons": 4},
            {"order": 3, "name": "Alphabet",         "description": "Letters and pronunciation",  "icon": "🔤", "total_lessons": 3},
            {"order": 4, "name": "Numbers",          "description": "Counting from 1 to 100",     "icon": "🔢", "total_lessons": 4},
            {"order": 5, "name": "Colors",           "description": "Describing colors",          "icon": "🎨", "total_lessons": 3},
        ],
        # Unit 2 – Family
        [
            {"order": 1, "name": "Family",           "description": "Members of a family",        "icon": "👨‍👩‍👧", "total_lessons": 4},
            {"order": 2, "name": "Home",             "description": "Rooms and furniture",        "icon": "🏠", "total_lessons": 4},
            {"order": 3, "name": "Adjectives 1",     "description": "Describing people",          "icon": "📝", "total_lessons": 3},
        ],
        # Unit 3 – Food
        [
            {"order": 1, "name": "Food",             "description": "Eating and drinking",        "icon": "🍎", "total_lessons": 4},
            {"order": 2, "name": "Restaurant",       "description": "Ordering at a restaurant",   "icon": "🍽️", "total_lessons": 4},
            {"order": 3, "name": "Shopping",         "description": "Buying groceries",           "icon": "🛒", "total_lessons": 3},
        ],
        # Unit 4 – Travel
        [
            {"order": 1, "name": "Travel",           "description": "Getting around",             "icon": "✈️", "total_lessons": 4},
            {"order": 2, "name": "Directions",       "description": "Giving and following directions","icon": "🗺️", "total_lessons": 4},
            {"order": 3, "name": "Hotel",            "description": "Booking accommodation",      "icon": "🏨", "total_lessons": 3},
        ],
    ]

    # ── Exercises templates ──────────────────────────────────────────────────
    exercise_templates = {
        "Basics 1": [
            {"type": "multiple_choice", "question": "What does 'Hola' mean?", "correct_answer": "Hello", "options": json.dumps(["Hello", "Goodbye", "Thank you", "Sorry"]), "word_bank": json.dumps([]), "hint": "A common greeting"},
            {"type": "translate",       "question": "Translate: 'Buenos días'", "correct_answer": "Good morning", "options": json.dumps([]), "word_bank": json.dumps(["Good", "morning", "night", "evening", "day", "Bad"]), "hint": None},
            {"type": "multiple_choice", "question": "What does 'Gracias' mean?", "correct_answer": "Thank you", "options": json.dumps(["Please", "Thank you", "Sorry", "Excuse me"]), "word_bank": json.dumps([]), "hint": "Showing gratitude"},
            {"type": "type_answer",     "question": "How do you say 'Yes' in Spanish?", "correct_answer": "Sí", "options": json.dumps([]), "word_bank": json.dumps([]), "hint": "One syllable"},
            {"type": "match_pairs",     "question": "Match the words!", "correct_answer": json.dumps({"Hola": "Hello", "Adiós": "Goodbye", "Sí": "Yes", "No": "No"}), "options": json.dumps([]), "word_bank": json.dumps([]), "hint": None},
            {"type": "fill_blank",      "question": "_____ días! (Good morning)", "correct_answer": "Buenos", "options": json.dumps(["Buenos", "Buenas", "Mucho", "Poco"]), "word_bank": json.dumps([]), "hint": "Masculine form"},
        ],
        "Phrases": [
            {"type": "multiple_choice", "question": "What does '¿Cómo estás?' mean?", "correct_answer": "How are you?", "options": json.dumps(["How are you?", "What is your name?", "Where are you from?", "How old are you?"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "translate",       "question": "Translate: 'Me llamo Ana'", "correct_answer": "My name is Ana", "options": json.dumps([]), "word_bank": json.dumps(["My", "name", "is", "Ana", "I", "am", "called", "your"]), "hint": None},
            {"type": "multiple_choice", "question": "How do you say 'Please' in Spanish?", "correct_answer": "Por favor", "options": json.dumps(["Gracias", "Por favor", "De nada", "Lo siento"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "type_answer",     "question": "How do you say 'Excuse me' in Spanish?", "correct_answer": "Perdón", "options": json.dumps([]), "word_bank": json.dumps([]), "hint": "Asking forgiveness"},
            {"type": "fill_blank",      "question": "¿Cómo te _____? (What is your name?)", "correct_answer": "llamas", "options": json.dumps(["llamas", "llamo", "llama", "llamamos"]), "word_bank": json.dumps([]), "hint": "Second person"},
            {"type": "multiple_choice", "question": "What does 'De nada' mean?", "correct_answer": "You're welcome", "options": json.dumps(["You're welcome", "No problem", "Goodbye", "Good luck"]), "word_bank": json.dumps([]), "hint": None},
        ],
        "Numbers": [
            {"type": "multiple_choice", "question": "What is 'tres' in English?", "correct_answer": "Three", "options": json.dumps(["One", "Two", "Three", "Four"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "type_answer",     "question": "How do you say '5' in Spanish?", "correct_answer": "cinco", "options": json.dumps([]), "word_bank": json.dumps([]), "hint": None},
            {"type": "multiple_choice", "question": "What does 'diez' mean?", "correct_answer": "Ten", "options": json.dumps(["Six", "Seven", "Eight", "Ten"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "fill_blank",      "question": "Uno, dos, _____, cuatro (One, two, ___, four)", "correct_answer": "tres", "options": json.dumps(["tres", "seis", "ocho", "nueve"]), "word_bank": json.dumps([]), "hint": "Three"},
            {"type": "translate",       "question": "Translate: 'Tengo veinte años'", "correct_answer": "I am twenty years old", "options": json.dumps([]), "word_bank": json.dumps(["I", "am", "twenty", "years", "old", "have", "ten", "thirty"]), "hint": None},
            {"type": "multiple_choice", "question": "What is 'cien' in English?", "correct_answer": "One hundred", "options": json.dumps(["Ten", "Fifty", "One hundred", "One thousand"]), "word_bank": json.dumps([]), "hint": None},
        ],
        "Family": [
            {"type": "multiple_choice", "question": "What does 'madre' mean?", "correct_answer": "Mother", "options": json.dumps(["Father", "Mother", "Sister", "Brother"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "translate",       "question": "Translate: 'Mi hermano es alto'", "correct_answer": "My brother is tall", "options": json.dumps([]), "word_bank": json.dumps(["My", "brother", "is", "tall", "sister", "short", "old", "young"]), "hint": None},
            {"type": "multiple_choice", "question": "What does 'abuelo' mean?", "correct_answer": "Grandfather", "options": json.dumps(["Uncle", "Cousin", "Grandfather", "Father"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "fill_blank",      "question": "Mi _____ se llama Carlos. (My father's name is Carlos)", "correct_answer": "padre", "options": json.dumps(["padre", "madre", "hermano", "hijo"]), "word_bank": json.dumps([]), "hint": "Male parent"},
            {"type": "type_answer",     "question": "How do you say 'sister' in Spanish?", "correct_answer": "hermana", "options": json.dumps([]), "word_bank": json.dumps([]), "hint": "Feminine form of hermano"},
            {"type": "match_pairs",     "question": "Match family members!", "correct_answer": json.dumps({"padre": "father", "madre": "mother", "hijo": "son", "hija": "daughter"}), "options": json.dumps([]), "word_bank": json.dumps([]), "hint": None},
        ],
        "Food": [
            {"type": "multiple_choice", "question": "What does 'manzana' mean?", "correct_answer": "Apple", "options": json.dumps(["Orange", "Apple", "Banana", "Grape"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "translate",       "question": "Translate: 'Quiero un café'", "correct_answer": "I want a coffee", "options": json.dumps([]), "word_bank": json.dumps(["I", "want", "a", "coffee", "tea", "water", "juice", "need"]), "hint": None},
            {"type": "multiple_choice", "question": "What does 'agua' mean?", "correct_answer": "Water", "options": json.dumps(["Milk", "Juice", "Water", "Wine"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "fill_blank",      "question": "Me gusta el _____ (I like bread)", "correct_answer": "pan", "options": json.dumps(["pan", "leche", "arroz", "carne"]), "word_bank": json.dumps([]), "hint": "Bakery staple"},
            {"type": "type_answer",     "question": "How do you say 'chicken' in Spanish?", "correct_answer": "pollo", "options": json.dumps([]), "word_bank": json.dumps([]), "hint": "Also a name!"},
            {"type": "multiple_choice", "question": "What does 'verduras' mean?", "correct_answer": "Vegetables", "options": json.dumps(["Fruits", "Meat", "Vegetables", "Sweets"]), "word_bank": json.dumps([]), "hint": None},
        ],
        "Travel": [
            {"type": "multiple_choice", "question": "What does 'aeropuerto' mean?", "correct_answer": "Airport", "options": json.dumps(["Hotel", "Airport", "Train station", "Bus stop"]), "word_bank": json.dumps([]), "hint": None},
            {"type": "translate",       "question": "Translate: '¿Dónde está el hotel?'", "correct_answer": "Where is the hotel?", "options": json.dumps([]), "word_bank": json.dumps(["Where", "is", "the", "hotel", "airport", "station", "How", "far"]), "hint": None},
            {"type": "multiple_choice", "question": "What does 'pasaporte' mean?", "correct_answer": "Passport", "options": json.dumps(["Ticket", "Passport", "Visa", "Map"]), "word_bank": json.dumps([]), "hint": "Similar to English"},
            {"type": "fill_blank",      "question": "El _____ sale a las tres. (The train leaves at three)", "correct_answer": "tren", "options": json.dumps(["tren", "avión", "barco", "autobús"]), "word_bank": json.dumps([]), "hint": "Choo choo!"},
            {"type": "type_answer",     "question": "How do you say 'left' in Spanish?", "correct_answer": "izquierda", "options": json.dumps([]), "word_bank": json.dumps([]), "hint": "Opposite of derecha"},
            {"type": "match_pairs",     "question": "Match the transport words!", "correct_answer": json.dumps({"tren": "train", "avión": "plane", "barco": "boat", "autobús": "bus"}), "options": json.dumps([]), "word_bank": json.dumps([]), "hint": None},
        ],
    }

    # Default exercises for skills not in the template
    default_exercises = [
        {"type": "multiple_choice", "question": "What does 'bueno' mean?", "correct_answer": "Good", "options": json.dumps(["Good", "Bad", "Big", "Small"]), "word_bank": json.dumps([]), "hint": None},
        {"type": "translate",       "question": "Translate: 'La casa es grande'", "correct_answer": "The house is big", "options": json.dumps([]), "word_bank": json.dumps(["The", "house", "is", "big", "small", "old", "new", "beautiful"]), "hint": None},
        {"type": "fill_blank",      "question": "El gato es _____ (The cat is black)", "correct_answer": "negro", "options": json.dumps(["negro", "blanco", "rojo", "azul"]), "word_bank": json.dumps([]), "hint": "Dark color"},
        {"type": "type_answer",     "question": "How do you say 'beautiful' in Spanish?", "correct_answer": "hermoso", "options": json.dumps([]), "word_bank": json.dumps([]), "hint": "Also means brother-like..."},
        {"type": "multiple_choice", "question": "What does 'pequeño' mean?", "correct_answer": "Small", "options": json.dumps(["Large", "Small", "Old", "Young"]), "word_bank": json.dumps([]), "hint": None},
        {"type": "multiple_choice", "question": "What does 'rápido' mean?", "correct_answer": "Fast", "options": json.dumps(["Slow", "Fast", "Far", "Near"]), "word_bank": json.dumps([]), "hint": None},
    ]

    # ── Create all skills + lessons + exercises ──────────────────────────────
    all_skills = []
    for unit_idx, unit in enumerate(units):
        for sk_data in skills_data[unit_idx]:
            skill = models.Skill(unit_id=unit.id, **sk_data)
            db.add(skill)
            db.flush()
            all_skills.append(skill)

            exs = exercise_templates.get(sk_data["name"], default_exercises)
            for lesson_order in range(1, sk_data["total_lessons"] + 1):
                lesson = models.Lesson(
                    skill_id=skill.id,
                    order=lesson_order,
                    title=f"{sk_data['name']} – Lesson {lesson_order}",
                    xp_reward=10,
                )
                db.add(lesson)
                db.flush()
                for ex_order, ex_data in enumerate(exs, 1):
                    ex = dict(ex_data)
                    import random
                    rive_files = [
                        "oscar.riv",
                        "lily.riv",
                        "zari.riv",
                    ]
                    typ = ex["type"]
                    old_q = ex["question"]
                    
                    if typ == "multiple_choice":
                        word = old_q.split("'")[1] if "'" in old_q else old_q
                        ex["question"] = "Select the correct meaning"
                        ex["hint"] = word
                        ex["character_animation"] = random.choice(rive_files)
                    elif typ == "translate":
                        word = old_q.split("'")[1] if "'" in old_q else old_q
                        ex["question"] = "Write this in English"
                        ex["hint"] = word
                        ex["character_animation"] = random.choice(rive_files)
                    elif typ == "type_answer":
                        word = old_q.split("'")[1] if "'" in old_q else old_q
                        ex["question"] = "Write this in Spanish"
                        ex["hint"] = word
                        ex["character_animation"] = random.choice(rive_files)
                    elif typ == "fill_blank":
                        ex["question"] = "Complete the sentence"
                        ex["hint"] = old_q
                        ex["character_animation"] = random.choice(rive_files)
                    elif typ == "match_pairs":
                        ex["question"] = "Tap the matching pairs"
                        ex["hint"] = None
                        ex["character_animation"] = None

                    exercise = models.Exercise(
                        lesson_id=lesson.id,
                        order=ex_order,
                        **ex
                    )
                    db.add(exercise)

    # ── Users ────────────────────────────────────────────────────────────────
    users_data = [
        {"username": "learner",    "display_name": "Alex Chen",    "xp_total": 320,  "streak": 7,  "hearts": 5, "gems": 650,  "league": "Gold",   "last_activity_date": str(date.today())},
        {"username": "maria_pro",  "display_name": "Maria García", "xp_total": 1540, "streak": 31, "hearts": 4, "gems": 1200, "league": "Diamond","last_activity_date": str(date.today())},
        {"username": "john_doe",   "display_name": "John Smith",   "xp_total": 890,  "streak": 12, "hearts": 3, "gems": 800,  "league": "Silver", "last_activity_date": str(date.today())},
        {"username": "yuki_san",   "display_name": "Yuki Tanaka",  "xp_total": 2100, "streak": 55, "hearts": 5, "gems": 2500, "league": "Diamond","last_activity_date": str(date.today())},
        {"username": "bob_learns", "display_name": "Bob Williams", "xp_total": 210,  "streak": 3,  "hearts": 5, "gems": 300,  "league": "Bronze", "last_activity_date": str(date.today())},
    ]
    users = []
    for ud in users_data:
        u = models.User(**ud)
        db.add(u)
        db.flush()
        users.append(u)

    # Default learner progress – first skill unlocked
    learner = users[0]
    for idx, skill in enumerate(all_skills):
        sp = models.UserSkillProgress(
            user_id=learner.id,
            skill_id=skill.id,
            is_unlocked=(idx == 0),
            is_completed=False,
            completed_lessons=0,
            crown_level=0,
        )
        db.add(sp)

    # ── Achievements ─────────────────────────────────────────────────────────
    achievements = [
        {"name": "First Step",    "description": "Complete your first lesson", "icon": "🎯", "condition_type": "lessons_completed", "condition_value": 1},
        {"name": "On Fire",       "description": "Reach a 7-day streak",       "icon": "🔥", "condition_type": "streak",            "condition_value": 7},
        {"name": "XP Hunter",     "description": "Earn 100 XP",                "icon": "⚡", "condition_type": "xp",                "condition_value": 100},
        {"name": "Dedicated",     "description": "Reach a 30-day streak",      "icon": "💎", "condition_type": "streak",            "condition_value": 30},
        {"name": "XP Master",     "description": "Earn 1000 XP",               "icon": "🏆", "condition_type": "xp",                "condition_value": 1000},
    ]
    for ad in achievements:
        db.add(models.Achievement(**ad))

    db.commit()
    print("✅  Database seeded successfully!")
    db.close()


if __name__ == "__main__":
    seed()

import re

with open("backend/main.py", "r") as f:
    content = f.read()

content = content.replace("    hearts_lost = min(req.mistakes, user.hearts)\n    user.hearts = max(0, user.hearts - hearts_lost)", "    # Hearts are now deducted instantly during the lesson")

with open("backend/main.py", "w") as f:
    f.write(content)

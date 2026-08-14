import re

with open("backend/main.py", "r") as f:
    content = f.read()

endpoint = """
@app.post("/api/users/{user_id}/hearts/deduct")
def deduct_heart(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.hearts > 0:
        user.hearts -= 1
        db.commit()
    return {"hearts": user.hearts}
"""

if "/hearts/deduct" not in content:
    content = content.replace('@app.post("/api/users/{user_id}/hearts/refill")', endpoint + '\n@app.post("/api/users/{user_id}/hearts/refill")')
    with open("backend/main.py", "w") as f:
        f.write(content)

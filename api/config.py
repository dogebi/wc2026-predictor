import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")

# World Cup 2026 data
GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H"]

POINTS = {
    "exact_score": 10,
    "result_only": 3,
    "special": 15,
}

LEVELS = [
    (0, "🥉 새싹 예측가"),
    (50, "🥈 노련한 분석가"),
    (200, "🥇 월드컵 마스터"),
    (500, "💎 전설의 예측가"),
    (1000, "👑 월드컵의 신"),
]

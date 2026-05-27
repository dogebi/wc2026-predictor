from fastapi import APIRouter

router = APIRouter()

MOCK_RANKINGS = [
    {"id": "u1", "name": "김민수", "emoji": "👑", "score": 284, "accuracy": 92},
    {"id": "u2", "name": "박지연", "emoji": "🥈", "score": 251, "accuracy": 87},
    {"id": "u3", "name": "이철수", "emoji": "🥉", "score": 238, "accuracy": 81},
    {"id": "u4", "name": "최예진", "emoji": "⭐", "score": 201, "accuracy": 78},
    {"id": "u5", "name": "정민호", "emoji": "🔥", "score": 187, "accuracy": 74},
    {"id": "u6", "name": "강수진", "emoji": "🎯", "score": 165, "accuracy": 70},
    {"id": "user_1", "name": "중기린", "emoji": "🐯", "score": 142, "accuracy": 73},
    {"id": "u8", "name": "홍길동", "emoji": "⚡", "score": 98, "accuracy": 65},
]

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    return MOCK_RANKINGS[:limit]

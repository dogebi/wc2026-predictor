from fastapi import APIRouter

router = APIRouter()

MOCK_USER = {
    "id": "user_1",
    "name": "중기린",
    "emoji": "🐯",
    "level": 7,
    "title": "🥈 노련한 분석가",
    "score": 284,
    "xp_progress": 65,
    "next_level": 8,
    "predictions": 38,
    "correct": 31,
    "accuracy": 81,
    "badges": [
        {"id": "b1", "icon": "🥉", "name": "첫 예측", "owned": True},
        {"id": "b2", "icon": "🥈", "name": "5연속", "owned": True},
        {"id": "b3", "icon": "🥇", "name": "10연속", "owned": True},
        {"id": "b4", "icon": "⭐", "name": "분석가", "owned": True},
        {"id": "b5", "icon": "💎", "name": "마스터", "owned": False},
        {"id": "b6", "icon": "🔥", "name": "15연속", "owned": False},
        {"id": "b7", "icon": "👑", "name": "챔피언", "owned": False},
        {"id": "b8", "icon": "🎯", "name": "완벽예측", "owned": False},
        {"id": "b9", "icon": "🔮", "name": "예언자", "owned": False},
        {"id": "b10", "icon": "🌍", "name": "월드컵", "owned": False},
    ],
    "specials": [
        {"label": "🏆 우승팀", "value": "브라질"},
        {"label": "⚽ 득점왕", "value": "음바페"},
        {"label": "🌟 MVP", "value": None},
    ],
}

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    return MOCK_USER

@router.get("/users/me")
async def get_me():
    return MOCK_USER

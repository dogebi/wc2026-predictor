from fastapi import APIRouter

router = APIRouter()

# ── Mock data ──
MOCK_MATCHES = [
    {
        "id": "m1", "group_name": "조별리그 A조",
        "home_team": "브라질", "home_flag": "🇧🇷", "home_rank": 1,
        "away_team": "독일", "away_flag": "🇩🇪", "away_rank": 10,
        "kickoff": "2026-06-12T22:00:00", "status": "upcoming", "predictions_open": True,
        "predict_count": 47, "stats": {"home_win": 62, "away_win": 22, "draw": 16},
        "hot": True,
    },
    {
        "id": "m2", "group_name": "조별리그 B조",
        "home_team": "대한민국", "home_flag": "🇰🇷", "home_rank": 23,
        "away_team": "일본", "away_flag": "🇯🇵", "away_rank": 15,
        "kickoff": "2026-06-13T01:00:00", "status": "upcoming", "predictions_open": True,
        "predict_count": 128, "stats": {"home_win": 45, "away_win": 38, "draw": 17},
        "hot": True,
    },
    {
        "id": "m3", "group_name": "조별리그 C조",
        "home_team": "아르헨티나", "home_flag": "🇦🇷", "home_rank": 2,
        "away_team": "사우디아라비아", "away_flag": "🇸🇦", "away_rank": 56,
        "kickoff": "2026-06-11T22:00:00", "status": "finished", "predictions_open": False,
        "home_score": 3, "away_score": 1, "prediction_rate": 32, "predict_count": 141,
    },
    {
        "id": "m4", "group_name": "조별리그 D조",
        "home_team": "프랑스", "home_flag": "🇫🇷", "home_rank": 3,
        "away_team": "포르투갈", "away_flag": "🇵🇹", "away_rank": 6,
        "kickoff": "2026-06-13T19:00:00", "status": "upcoming", "predictions_open": True,
        "predict_count": 89, "stats": {"home_win": 55, "away_win": 25, "draw": 20},
    },
    {
        "id": "m5", "group_name": "조별리그 E조",
        "home_team": "스페인", "home_flag": "🇪🇸", "home_rank": 5,
        "away_team": "네덜란드", "away_flag": "🇳🇱", "away_rank": 8,
        "kickoff": "2026-06-14T04:00:00", "status": "upcoming", "predictions_open": True,
        "predict_count": 63, "stats": {"home_win": 40, "away_win": 35, "draw": 25},
    },
]

@router.get("/matches")
async def get_matches(date: str = None):
    if date:
        return [m for m in MOCK_MATCHES if date in m.get("kickoff", "")]
    return MOCK_MATCHES

@router.get("/matches/{match_id}")
async def get_match(match_id: str):
    for m in MOCK_MATCHES:
        if m["id"] == match_id:
            return m
    return {"error": "not found"}

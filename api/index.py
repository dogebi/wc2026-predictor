"""
WC2026 Predictor API — Vercel Serverless (Single File)
"""
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI(title="WC2026 Predictor API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════
# MATCH DATA
# ═══════════════════════════════════════════
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

# ═══════════════════════════════════════════
# USER DATA
# ═══════════════════════════════════════════
MOCK_USER = {
    "id": "user_1", "name": "중기린", "emoji": "🐯",
    "level": 7, "title": "🥈 노련한 분석가", "score": 284,
    "xp_progress": 65, "next_level": 8,
    "predictions": 38, "correct": 31, "accuracy": 81,
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

predictions_db = {}

class PredictionRequest(BaseModel):
    match_id: str
    home_score: int
    away_score: int
    user_id: str = "user_1"

class SpecialPredictionRequest(BaseModel):
    user_id: str = "user_1"
    category: str
    value: str

# ═══════════════════════════════════════════
# AI PREDICTION ENGINE
# ═══════════════════════════════════════════
TEAM_DB = {
    "브라질": {"rank": 1, "flag": "🇧🇷", "form": "WWWDW", "gf_avg": 2.4, "ga_avg": 0.7, "strength": 94, "style": "공격적", "key_player": "비니시우스"},
    "독일": {"rank": 10, "flag": "🇩🇪", "form": "WDWWL", "gf_avg": 2.1, "ga_avg": 0.9, "strength": 88, "style": "조직적", "key_player": "무시알라"},
    "대한민국": {"rank": 23, "flag": "🇰🇷", "form": "WLWDW", "gf_avg": 1.8, "ga_avg": 1.2, "strength": 78, "style": "역습", "key_player": "손흥민"},
    "일본": {"rank": 15, "flag": "🇯🇵", "form": "WWLWD", "gf_avg": 2.0, "ga_avg": 1.0, "strength": 82, "style": "기술적", "key_player": "미토마"},
    "아르헨티나": {"rank": 2, "flag": "🇦🇷", "form": "WWWWW", "gf_avg": 2.5, "ga_avg": 0.5, "strength": 96, "style": "균형적", "key_player": "메시"},
    "사우디아라비아": {"rank": 56, "flag": "🇸🇦", "form": "LDWLL", "gf_avg": 1.1, "ga_avg": 1.8, "strength": 64, "style": "수비적", "key_player": "알다우사리"},
    "프랑스": {"rank": 3, "flag": "🇫🇷", "form": "WWWDW", "gf_avg": 2.3, "ga_avg": 0.8, "strength": 92, "style": "역동적", "key_player": "음바페"},
    "포르투갈": {"rank": 6, "flag": "🇵🇹", "form": "WWWLW", "gf_avg": 2.0, "ga_avg": 0.9, "strength": 87, "style": "기술적", "key_player": "호날두"},
    "스페인": {"rank": 5, "flag": "🇪🇸", "form": "WWWDW", "gf_avg": 2.2, "ga_avg": 0.7, "strength": 89, "style": "티키타카", "key_player": "야말"},
    "네덜란드": {"rank": 8, "flag": "🇳🇱", "form": "WDLWW", "gf_avg": 1.9, "ga_avg": 1.0, "strength": 85, "style": "토탈풋볼", "key_player": "데파이"},
}

WEATHERS = [
    {"condition": "맑음 ☀️", "temp": "28°C", "effect_home": 1.0, "effect_away": 1.0},
    {"condition": "흐림 ⛅", "temp": "22°C", "effect_home": 1.0, "effect_away": 0.95},
    {"condition": "비 🌧️", "temp": "18°C", "effect_home": 1.05, "effect_away": 0.90},
    {"condition": "폭염 🔥", "temp": "35°C", "effect_home": 1.10, "effect_away": 0.85},
    {"condition": "강풍 💨", "temp": "20°C", "effect_home": 1.02, "effect_away": 0.92},
]

LUCK_GOOD = ["오늘은 🐯 호랑이 기운이 가득합니다!", "별자리가 상승세입니다! 🌟", "황금 물결이 당신을 감쌉니다 💛"]
LUCK_BAD = ["오늘은 수성 역행일지도... 🌑", "검은 고양이가 길을 건넜습니다 🐈‍⬛", "살짝 불운이 깃든 날입니다 💫"]

def _get_team(name):
    return TEAM_DB.get(name, {"rank": 30, "flag": "🏴", "form": "WDLWD", "gf_avg": 1.5, "ga_avg": 1.3, "strength": 75, "style": "균형적", "key_player": "N/A"})

def _power_score(team, opp):
    t, o = _get_team(team), _get_team(opp)
    return min(99, max(1,
        max(0, (o["rank"] - t["rank"]) / 55 * 30) +
        sum(1 if c == "W" else 0.5 if c == "D" else 0 for c in t["form"]) / 5 * 25 +
        t["strength"] / 100 * 25 +
        t["gf_avg"] / 3 * 20
    ))

def _ai_predict(match):
    home, away = match["home_team"], match["away_team"]
    hd, ad = _get_team(home), _get_team(away)
    hp, ap = _power_score(home, away), _power_score(away, home)

    hp += 5  # home advantage
    total_power = hp + ap
    h_skill = round((hp / total_power) * 100)
    a_skill = 100 - h_skill

    luck_seed = random.randint(1, 100)
    luck_val = random.randint(-8, 12)
    is_lucky = luck_seed > 50
    h_luck = luck_val if is_lucky else -luck_val
    luck_msg = random.choice(LUCK_GOOD) if h_luck > 0 else (random.choice(LUCK_BAD) if abs(h_luck) >= 3 else "운세는 평범합니다 😐")

    weather = random.choice(WEATHERS)
    h_wpct, a_wpct = round(weather["effect_home"] * 10), round(weather["effect_away"] * 10)

    h_total = h_skill * 0.8 + (h_luck + 50) * 0.1 + h_wpct * 0.1
    a_total = a_skill * 0.8 + (-h_luck + 50) * 0.1 + a_wpct * 0.1
    draw_b = 20
    total = h_total + a_total + draw_b
    h_pct, a_pct = round((h_total / total) * 100), round((a_total / total) * 100)
    d_pct = 100 - h_pct - a_pct

    hg = round((hp / 100) * random.uniform(1.5, 3.5))
    ag = round((ap / 100) * random.uniform(0.5, 2.5))
    if hg == ag:
        hg += 1 if random.random() > 0.5 else 0

    diff = hp - ap
    if diff > 15: verdict = f"🏆 {home}의 압도적 우세!"
    elif diff > 5: verdict = f"⭐ {home}이(가) 다소 유리합니다."
    elif abs(diff) <= 5: verdict = "⚖️ 초접전이 예상됩니다!"
    else: verdict = f"💪 {away}이(가) 객관적 전력에서 앞서지만, 변수가 많습니다."

    return {
        "match_id": match.get("id"),
        "home_team": home, "away_team": away,
        "predicted_score": {"home": hg, "away": ag},
        "winner": home if hg > ag else (away if ag > hg else "무승부"),
        "probabilities": {"home_win": h_pct, "draw": d_pct, "away_win": a_pct},
        "analysis": {
            "skill_80": {
                "home_power": round(hp), "away_power": round(ap),
                "home_attack": f"⚔️ {hd['gf_avg']:.1f} goals/match ({hd['style']})",
                "away_attack": f"⚔️ {ad['gf_avg']:.1f} goals/match ({ad['style']})",
                "home_defense": f"🛡️ {hd['ga_avg']:.1f} conceded/match",
                "away_defense": f"🛡️ {ad['ga_avg']:.1f} conceded/match",
                "home_form": f"최근 {hd['form']}", "away_form": f"최근 {ad['form']}",
                "key_player": f"⭐ {hd['key_player']} vs {ad['key_player']}",
                "rank_diff": f"FIFA 랭킹: {hd['rank']}위 vs {ad['rank']}위",
                "home_pct": h_skill, "away_pct": a_skill,
            },
            "luck_10": {"message": luck_msg, "value": round(abs(h_luck) * 2), "is_lucky": h_luck > 0},
            "weather_10": {"condition": weather["condition"], "temperature": weather["temp"],
                           "home_advantage": weather["effect_home"], "away_disadvantage": weather["effect_away"]},
        },
        "verdict": verdict,
        "confidence": "매우 높음" if abs(diff) > 20 else "높음" if abs(diff) > 10 else "보통" if abs(diff) > 5 else "낮음",
    }

# ═══════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

# ── Matches ──
@app.get("/api/matches")
async def get_matches(date: str = None):
    if date:
        return [m for m in MOCK_MATCHES if date in m.get("kickoff", "")]
    return MOCK_MATCHES

@app.get("/api/matches/{match_id}")
async def get_match(match_id: str):
    for m in MOCK_MATCHES:
        if m["id"] == match_id:
            return m
    return {"error": "not found"}

# ── Predictions ──
@app.post("/api/predictions")
async def create_prediction(req: PredictionRequest):
    if req.home_score < 0 or req.away_score < 0:
        raise HTTPException(400, "Invalid score")
    key = f"{req.user_id}:{req.match_id}"
    predictions_db[key] = {"user_id": req.user_id, "match_id": req.match_id,
                           "home_score": req.home_score, "away_score": req.away_score}
    return {"status": "ok", "message": "예측 완료!", "id": key}

@app.get("/api/predictions/{user_id}")
async def get_user_predictions(user_id: str):
    return [v for k, v in predictions_db.items() if v["user_id"] == user_id]

@app.post("/api/predictions/special")
async def create_special_prediction(req: SpecialPredictionRequest):
    return {"status": "ok", "category": req.category, "value": req.value}

# ── Users ──
@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    return MOCK_USER

@app.get("/api/users/me")
async def get_me():
    return MOCK_USER

# ── Leaderboard ──
@app.get("/api/leaderboard")
async def get_leaderboard(limit: int = 10):
    return MOCK_RANKINGS[:limit]

# ── AI Predictions ──
@app.get("/api/predict/ai/analyze")
async def analyze_all():
    upcoming = [m for m in MOCK_MATCHES if m["status"] != "finished"]
    return {"predictions": [_ai_predict(m) for m in upcoming]}

@app.get("/api/predict/ai/{match_id}")
async def analyze_match(match_id: str):
    for m in MOCK_MATCHES:
        if m["id"] == match_id:
            return _ai_predict(m)
    return {"error": "Match not found"}

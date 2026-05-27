"""
MyKing AI Prediction Engine
- 80% 실력 분석 (FIFA rank, recent form, H2H, goals)
- 10% 운세 (random luck factor)
- 10% 날씨/컨디션 (match-day conditions)
"""
from fastapi import APIRouter
import random
import math

router = APIRouter()

# ── Extended team database ──
TEAM_DB = {
    "브라질": {
        "rank": 1, "flag": "🇧🇷", "color": "#009739", "form": "WWWDW",
        "gf_avg": 2.4, "ga_avg": 0.7, "strength": 94,
        "style": "공격적", "key_player": "비니시우스",
        "coach": "도리바우 주니오르",
    },
    "독일": {
        "rank": 10, "flag": "🇩🇪", "color": "#000000", "form": "WDWWL",
        "gf_avg": 2.1, "ga_avg": 0.9, "strength": 88,
        "style": "조직적", "key_player": "무시알라",
        "coach": "율리안 나겔스만",
    },
    "대한민국": {
        "rank": 23, "flag": "🇰🇷", "color": "#C60C30", "form": "WLWDW",
        "gf_avg": 1.8, "ga_avg": 1.2, "strength": 78,
        "style": "역습", "key_player": "손흥민",
        "coach": "홍명보",
    },
    "일본": {
        "rank": 15, "flag": "🇯🇵", "color": "#FFFFFF", "form": "WWLWD",
        "gf_avg": 2.0, "ga_avg": 1.0, "strength": 82,
        "style": "기술적", "key_player": "미토마",
        "coach": "모리야스 하지메",
    },
    "아르헨티나": {
        "rank": 2, "flag": "🇦🇷", "color": "#75AADB", "form": "WWWWW",
        "gf_avg": 2.5, "ga_avg": 0.5, "strength": 96,
        "style": "균형적", "key_player": "메시",
        "coach": "리오넬 스칼로니",
    },
    "사우디아라비아": {
        "rank": 56, "flag": "🇸🇦", "color": "#006C35", "form": "LDWLL",
        "gf_avg": 1.1, "ga_avg": 1.8, "strength": 64,
        "style": "수비적", "key_player": "알다우사리",
        "coach": "로베르토 만치니",
    },
    "프랑스": {
        "rank": 3, "flag": "🇫🇷", "color": "#002395", "form": "WWWDW",
        "gf_avg": 2.3, "ga_avg": 0.8, "strength": 92,
        "style": "역동적", "key_player": "음바페",
        "coach": "디디에 데샹",
    },
    "포르투갈": {
        "rank": 6, "flag": "🇵🇹", "color": "#006600", "form": "WWWLW",
        "gf_avg": 2.0, "ga_avg": 0.9, "strength": 87,
        "style": "기술적", "key_player": "호날두",
        "coach": "로베르토 마르티네즈",
    },
    "스페인": {
        "rank": 5, "flag": "🇪🇸", "color": "#C60B1E", "form": "WWWDW",
        "gf_avg": 2.2, "ga_avg": 0.7, "strength": 89,
        "style": "티키타카", "key_player": "야말",
        "coach": "루이스 데 라 푸엔테",
    },
    "네덜란드": {
        "rank": 8, "flag": "🇳🇱", "color": "#FF6600", "form": "WDLWW",
        "gf_avg": 1.9, "ga_avg": 1.0, "strength": 85,
        "style": "토탈풋볼", "key_player": "데파이",
        "coach": "로날드 쿠만",
    },
}

# ── Weather conditions ──
WEATHERS = [
    {"condition": "맑음 ☀️", "temp": "28°C", "effect_home": 1.0, "effect_away": 1.0},
    {"condition": "흐림 ⛅", "temp": "22°C", "effect_home": 1.0, "effect_away": 0.95},
    {"condition": "비 🌧️", "temp": "18°C", "effect_home": 1.05, "effect_away": 0.90},
    {"condition": "폭염 🔥", "temp": "35°C", "effect_home": 1.10, "effect_away": 0.85},
    {"condition": "강풍 💨", "temp": "20°C", "effect_home": 1.02, "effect_away": 0.92},
]

# ── Fortune messages ──
LUCK_GOOD = [
    "오늘은 🐯 호랑이 기운이 가득합니다!",
    "별자리가 상승세입니다! 🌟",
    "황금 물결이 당신을 감쌉니다 💛",
    "행운의 숫자가 7입니다 🔢",
]
LUCK_BAD = [
    "오늘은 수성 역행일지도... 🌑",
    "검은 고양이가 길을 건넜습니다 🐈‍⬛",
    "살짝 불운이 깃든 날입니다 💫",
    "조심스러운 접근이 필요합니다 🧘",
]


def get_team_data(name):
    """Get team data with fallback for unknown teams"""
    if name in TEAM_DB:
        return TEAM_DB[name]
    return {
        "rank": 30, "flag": "🏴", "color": "#888888", "form": "WDLWD",
        "gf_avg": 1.5, "ga_avg": 1.3, "strength": 75,
        "style": "균형적", "key_player": "N/A", "coach": "N/A",
    }


def calculate_power_score(team, opponent):
    """Calculate base power score (0-100)"""
    t = get_team_data(team)
    o = get_team_data(opponent)

    # FIFA rank difference (up to 30 points)
    rank_diff = max(0, (o["rank"] - t["rank"]) / 55 * 30)

    # Form score (W=1, D=0.5, L=0)
    form_score = sum(1 if c == "W" else 0.5 if c == "D" else 0 for c in t["form"]) / 5 * 25

    # Strength rating
    strength_score = t["strength"] / 100 * 25

    # Goals average
    goal_score = (t["gf_avg"] / 3) * 20

    total = rank_diff + form_score + strength_score + goal_score
    return min(99, max(1, total))


def calculate_prediction(match):
    """Calculate AI prediction for a match"""
    home = match.get("home_team", "")
    away = match.get("away_team", "")
    home_data = get_team_data(home)
    away_data = get_team_data(away)

    # ── 80% Skill Analysis ──
    home_power = calculate_power_score(home, away)
    away_power = calculate_power_score(away, home)

    # Head-to-head adjustment (home advantage ~5%)
    home_advantage = 5
    home_power += home_advantage
    away_power -= home_advantage * 0.3

    total_power = home_power + away_power
    home_skill_pct = round((home_power / total_power) * 100)
    away_skill_pct = 100 - home_skill_pct

    # ── 10% Luck / Fortune ──
    luck_seed = random.randint(1, 100)
    is_home_lucky = luck_seed > 50
    luck_value = random.randint(-8, 12)  # -8% ~ +12%
    home_luck = luck_value if is_home_lucky else -luck_value
    away_luck = -home_luck

    luck_msg = random.choice(LUCK_GOOD) if home_luck > 0 else random.choice(LUCK_BAD)
    if abs(home_luck) < 3:
        luck_msg = "운세는 평범합니다 😐"

    # ── 10% Weather ──
    weather = random.choice(WEATHERS)
    home_weather_pct = round(weather["effect_home"] * 10)
    away_weather_pct = round(weather["effect_away"] * 10)

    # ── Final Probability ──
    home_total = home_skill_pct * 0.8 + (home_luck + 50) * 0.1 + home_weather_pct * 0.1
    away_total = away_skill_pct * 0.8 + (away_luck + 50) * 0.1 + away_weather_pct * 0.1
    draw_total = 20  # base draw probability

    total = home_total + away_total + draw_total
    home_pct = round((home_total / total) * 100)
    away_pct = round((away_total / total) * 100)
    draw_pct = 100 - home_pct - away_pct

    # ── Predicted Score ──
    home_goals = round((home_power / 100) * random.uniform(1.5, 3.5))
    away_goals = round((away_power / 100) * random.uniform(0.5, 2.5))
    if home_goals == away_goals:
        if random.random() > 0.5:
            home_goals += 1
        else:
            away_goals += 1

    # ── Analysis Text ──
    if home_power - away_power > 15:
        verdict = f"🏆 {home}의 압도적 우세! 실력 차이가 확연합니다."
    elif home_power - away_power > 5:
        verdict = f"⭐ {home}이(가) 다소 유리합니다. 홈에서 경기하는 이점도 있습니다."
    elif abs(home_power - away_power) <= 5:
        verdict = "⚖️ 초접전이 예상됩니다! 누가 이겨도 이상하지 않습니다."
    elif away_power > home_power:
        verdict = f"💪 {away}이(가) 객관적 전력에서 앞서지만, 변수가 많습니다."
    else:
        verdict = "🔮 예측이 어려운 매치업입니다."

    return {
        "match_id": match.get("id", ""),
        "home_team": home,
        "away_team": away,
        "predicted_score": {"home": home_goals, "away": away_goals},
        "winner": home if home_goals > away_goals else (away if away_goals > home_goals else "무승부"),
        "probabilities": {
            "home_win": home_pct,
            "draw": draw_pct,
            "away_win": away_pct,
        },
        "analysis": {
            "skill_80": {
                "home_power": round(home_power),
                "away_power": round(away_power),
                "home_attack": f"⚔️ {home_data['gf_avg']:.1f} goals/match ({home_data['style']})",
                "away_attack": f"⚔️ {away_data['gf_avg']:.1f} goals/match ({away_data['style']})",
                "home_defense": f"🛡️ {home_data['ga_avg']:.1f} conceded/match",
                "away_defense": f"🛡️ {away_data['ga_avg']:.1f} conceded/match",
                "home_form": f"최근 {home_data['form']}",
                "away_form": f"최근 {away_data['form']}",
                "key_player": f"⭐ {home_data['key_player']} vs {away_data['key_player']}",
                "rank_diff": f"FIFA 랭킹: {home_data['rank']}위 vs {away_data['rank']}위",
                "home_pct": home_skill_pct,
                "away_pct": away_skill_pct,
            },
            "luck_10": {
                "message": luck_msg,
                "value": round(home_luck * 2),
                "is_lucky": home_luck > 0,
            },
            "weather_10": {
                "condition": weather["condition"],
                "temperature": weather["temp"],
                "home_advantage": weather["effect_home"],
                "away_disadvantage": weather["effect_away"],
            },
        },
        "verdict": verdict,
        "confidence": "매우 높음" if abs(home_power - away_power) > 20 else
                      "높음" if abs(home_power - away_power) > 10 else
                      "보통" if abs(home_power - away_power) > 5 else "낮음",
    }


@router.get("/predict/ai/analyze")
async def analyze_predictions():
    """Get AI predictions for all upcoming matches"""
    from routes.matches import MOCK_MATCHES
    upcoming = [m for m in MOCK_MATCHES if m["status"] != "finished"]
    return {"predictions": [calculate_prediction(m) for m in upcoming]}


@router.get("/predict/ai/{match_id}")
async def analyze_match(match_id: str):
    """Get AI prediction for a specific match"""
    from routes.matches import MOCK_MATCHES
    for m in MOCK_MATCHES:
        if m["id"] == match_id:
            return calculate_prediction(m)
    return {"error": "Match not found"}

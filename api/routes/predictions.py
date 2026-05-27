from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class PredictionRequest(BaseModel):
    match_id: str
    home_score: int
    away_score: int
    user_id: str = "user_1"

class SpecialPredictionRequest(BaseModel):
    user_id: str = "user_1"
    category: str  # champion, top_scorer, mvp
    value: str

# In-memory store (replace with Supabase)
predictions_db = {}

@router.post("/predictions")
async def create_prediction(req: PredictionRequest):
    if req.home_score < 0 or req.away_score < 0:
        raise HTTPException(400, "Invalid score")
    key = f"{req.user_id}:{req.match_id}"
    predictions_db[key] = {
        "user_id": req.user_id,
        "match_id": req.match_id,
        "home_score": req.home_score,
        "away_score": req.away_score,
    }
    return {"status": "ok", "message": "예측 완료!", "id": key}

@router.get("/predictions/{user_id}")
async def get_user_predictions(user_id: str):
    return [v for k, v in predictions_db.items() if v["user_id"] == user_id]

@router.post("/predictions/special")
async def create_special_prediction(req: SpecialPredictionRequest):
    return {"status": "ok", "category": req.category, "value": req.value}

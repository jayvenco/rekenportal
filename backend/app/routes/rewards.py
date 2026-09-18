"""
routes/rewards.py
-----------------------------------------------------------------------------
Profielgebonden coins, badges en reward-historie.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.reward import RewardEvent
from app.reward_engine import event_naar_dict, reward_naar_dict, verwerk_sessie_rewards
from app.rewards_config import BADGES

router = APIRouter(prefix="/api/rewards", tags=["rewards"])


class SessionRewardIn(BaseModel):
    sessionId: str
    exerciseId: str
    totalQuestions: int
    correctAnswers: int
    firstAttemptCorrect: int
    secondAttemptCorrect: int = 0
    bestFirstAttemptStreak: int = 0


@router.get("/badges")
def badge_config():
    return {"badges": BADGES}


@router.get("/profiel/{profiel_id}")
def profiel_rewards(profiel_id: int, db: Session = Depends(get_db)):
    return reward_naar_dict(db, profiel_id)


@router.get("/profiel/{profiel_id}/history")
def reward_history(profiel_id: int, limit: int = 20, db: Session = Depends(get_db)):
    events = (
        db.query(RewardEvent)
        .filter(RewardEvent.profiel_id == profiel_id)
        .order_by(RewardEvent.created_at.desc())
        .limit(max(1, min(100, limit)))
        .all()
    )
    return {"events": [event_naar_dict(event) for event in events]}


@router.post("/profiel/{profiel_id}/session")
def verwerk_session_reward(profiel_id: int, payload: SessionRewardIn, db: Session = Depends(get_db)):
    try:
        return verwerk_sessie_rewards(db, profiel_id, payload.exerciseId, payload.model_dump())
    except ValueError as fout:
        raise HTTPException(status_code=404, detail=str(fout)) from fout

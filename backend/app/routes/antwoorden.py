"""
antwoorden.py
-----------------------------------------------------------------------------
Opslaan, opvragen en verwijderen van beantwoorde opgaven (statistiek-ruwdata).
"""

from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.antwoord import Antwoord
from app.models.profiel import Profiel

router = APIRouter(prefix="/api/antwoorden", tags=["antwoorden"])


# --- Pydantic schemas -------------------------------------------------------

class AntwoordCreate(BaseModel):
    profielId: int
    exerciseId: str
    correct: bool
    timeMs: int = Field(ge=0, default=0)
    meta: Optional[dict[str, Any]] = None


class AntwoordOut(BaseModel):
    id: int
    profiel_id: int
    exercise_id: str
    correct: bool
    time_ms: int
    meta: Optional[dict[str, Any]] = None
    tijdstip: datetime

    model_config = {"from_attributes": True}


# --- Routes ------------------------------------------------------------------

@router.post("", response_model=AntwoordOut, status_code=status.HTTP_201_CREATED)
def sla_antwoord_op(payload: AntwoordCreate, db: Session = Depends(get_db)):
    profiel = db.query(Profiel).filter(Profiel.id == payload.profielId).first()
    if profiel is None:
        raise HTTPException(status_code=404, detail="Profiel niet gevonden")

    antwoord = Antwoord(
        profiel_id=payload.profielId,
        exercise_id=payload.exerciseId,
        correct=payload.correct,
        time_ms=payload.timeMs,
        meta=payload.meta or {},
    )
    db.add(antwoord)
    db.commit()
    db.refresh(antwoord)
    return antwoord


@router.get("", response_model=list[AntwoordOut])
def lijst_antwoorden(
    profielId: int = Query(...),
    exerciseId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Antwoord).filter(Antwoord.profiel_id == profielId)
    if exerciseId:
        query = query.filter(Antwoord.exercise_id == exerciseId)
    return query.order_by(Antwoord.tijdstip).all()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def verwijder_alle_antwoorden(profielId: int = Query(...), db: Session = Depends(get_db)):
    db.query(Antwoord).filter(Antwoord.profiel_id == profielId).delete()
    db.commit()
    return None

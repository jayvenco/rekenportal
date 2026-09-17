"""
routes/sessies.py
-----------------------------------------------------------------------------
API-routes voor oefensessies met punten:
  POST /sessies — sla een voltooide sessie op
  GET /sessies/maand/<profiel_id> — maandoverzicht van punten
"""

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sessie import Sessie

router = APIRouter(prefix="/api/sessies", tags=["sessies"])


class SessieIn(BaseModel):
    profiel_id: int
    exercise_id: str
    aantal_goed: int
    aantal_totaal: int
    percentage: float
    punten: int


@router.post("")
def maak_sessie(sessie: SessieIn, db: Session = Depends(get_db)):
    """Slaat een voltooide oefensessie op."""
    db_sessie = Sessie(
        profiel_id=sessie.profiel_id,
        exercise_id=sessie.exercise_id,
        aantal_goed=sessie.aantal_goed,
        aantal_totaal=sessie.aantal_totaal,
        percentage=sessie.percentage,
        punten=sessie.punten,
    )
    db.add(db_sessie)
    db.commit()
    db.refresh(db_sessie)
    return {
        "id": db_sessie.id,
        "punten": db_sessie.punten,
        "tijdstip": db_sessie.tijdstip.isoformat(),
    }


@router.get("/maand/{profiel_id}")
def maand_overzicht(
    profiel_id: int,
    jaar: int = Query(default_factory=lambda: datetime.now().year),
    maand: int = Query(default_factory=lambda: datetime.now().month),
    db: Session = Depends(get_db),
):
    """Geeft het totaal aantal punten per dag in een maand voor een profiel."""
    rijen = (
        db.query(
            extract("day", Sessie.tijdstip).label("dag"),
            func.coalesce(func.sum(Sessie.punten), 0).label("punten"),
        )
        .filter(
            Sessie.profiel_id == profiel_id,
            extract("year", Sessie.tijdstip) == jaar,
            extract("month", Sessie.tijdstip) == maand,
        )
        .group_by(extract("day", Sessie.tijdstip))
        .order_by(extract("day", Sessie.tijdstip))
        .all()
    )

    return {
        "jaar": jaar,
        "maand": maand,
        "totaalPunten": sum(r.punten for r in rijen),
        "dagen": [{"dag": r.dag, "punten": r.punten} for r in rijen],
    }


@router.get("/totaal/{profiel_id}")
def totaal_punten(profiel_id: int, db: Session = Depends(get_db)):
    """Geeft het totaal aantal punten aller tijden voor een profiel."""
    totaal = (
        db.query(func.coalesce(func.sum(Sessie.punten), 0))
        .filter(Sessie.profiel_id == profiel_id)
        .scalar()
    )
    return {"profiel_id": profiel_id, "totaalPunten": totaal}
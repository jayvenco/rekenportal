"""
instellingen.py
-----------------------------------------------------------------------------
Opslaan en opvragen van instellingen per profiel: zowel oefening-specifieke
instellingen (sleutel = "exercise:<exercise_id>") als algemene instellingen
(sleutel = "algemeen").
"""

from typing import Any, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.instelling import Instelling

router = APIRouter(prefix="/api/instellingen", tags=["instellingen"])

STANDAARD_ALGEMENE_INSTELLINGEN: dict[str, Any] = {"geluid": False}


# --- Helpers -----------------------------------------------------------------

def _exercise_sleutel(exercise_id: str) -> str:
    return f"exercise:{exercise_id}"


ALGEMEEN_SLEUTEL = "algemeen"


def _haal_instelling(db: Session, profiel_id: int, sleutel: str) -> Optional[Instelling]:
    return (
        db.query(Instelling)
        .filter(Instelling.profiel_id == profiel_id, Instelling.sleutel == sleutel)
        .first()
    )


def _upsert_instelling(db: Session, profiel_id: int, sleutel: str, waarde: dict) -> Instelling:
    rij = _haal_instelling(db, profiel_id, sleutel)
    if rij is None:
        rij = Instelling(profiel_id=profiel_id, sleutel=sleutel, waarde=waarde)
        db.add(rij)
    else:
        rij.waarde = waarde
    db.commit()
    db.refresh(rij)
    return rij


# --- Routes: oefening-instellingen -----------------------------------------

@router.get("/{profiel_id}/exercise/{exercise_id}")
def haal_exercise_instellingen(
    profiel_id: int, exercise_id: str, db: Session = Depends(get_db)
):
    rij = _haal_instelling(db, profiel_id, _exercise_sleutel(exercise_id))
    if rij is None:
        return None
    return rij.waarde


@router.put("/{profiel_id}/exercise/{exercise_id}")
def sla_exercise_instellingen_op(
    profiel_id: int,
    exercise_id: str,
    payload: dict[str, Any],
    db: Session = Depends(get_db),
):
    rij = _upsert_instelling(db, profiel_id, _exercise_sleutel(exercise_id), payload)
    return rij.waarde


# --- Routes: algemene instellingen ------------------------------------------

@router.get("/{profiel_id}/algemeen")
def haal_algemene_instellingen(profiel_id: int, db: Session = Depends(get_db)):
    rij = _haal_instelling(db, profiel_id, ALGEMEEN_SLEUTEL)
    opgeslagen = rij.waarde if rij is not None else {}
    return {**STANDAARD_ALGEMENE_INSTELLINGEN, **opgeslagen}


@router.put("/{profiel_id}/algemeen")
def sla_algemene_instellingen_op(
    profiel_id: int, payload: dict[str, Any], db: Session = Depends(get_db)
):
    rij = _haal_instelling(db, profiel_id, ALGEMEEN_SLEUTEL)
    bestaand = rij.waarde if rij is not None else {}
    nieuw = {**STANDAARD_ALGEMENE_INSTELLINGEN, **bestaand, **payload}
    rij = _upsert_instelling(db, profiel_id, ALGEMEEN_SLEUTEL, nieuw)
    return rij.waarde

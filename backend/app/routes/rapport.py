"""
rapport.py
-----------------------------------------------------------------------------
Rapportage per profiel: opgaven die niet goed gingen in de afgelopen
RAPPORT_BEWAARDAGEN dagen (standaard 14), plus per oefening hoeveel er in die
periode zijn gemaakt.
"""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.antwoord import Antwoord
from app.models.fout import Fout, RAPPORT_BEWAARDAGEN
from app.models.profiel import Profiel

router = APIRouter(prefix="/api/rapport", tags=["rapport"])


@router.get("/{profiel_id}")
def rapport(profiel_id: int, db: Session = Depends(get_db)):
    if db.query(Profiel).filter(Profiel.id == profiel_id).first() is None:
        raise HTTPException(status_code=404, detail="Profiel niet gevonden")

    grens = datetime.utcnow() - timedelta(days=RAPPORT_BEWAARDAGEN)
    # Opruimen (ook bij lezen, zodat het ook werkt als er niet meer geoefend wordt).
    db.query(Fout).filter(Fout.tijdstip < grens).delete()
    db.commit()

    fouten = (
        db.query(Fout)
        .filter(Fout.profiel_id == profiel_id)
        .order_by(Fout.tijdstip.desc())
        .all()
    )
    gemaakt = dict(
        db.query(Antwoord.exercise_id, func.count(Antwoord.id))
        .filter(Antwoord.profiel_id == profiel_id, Antwoord.tijdstip >= grens)
        .group_by(Antwoord.exercise_id)
        .all()
    )
    return {
        "dagen": RAPPORT_BEWAARDAGEN,
        "gemaakt": gemaakt,
        "fouten": [
            {
                "id": f.id,
                "exerciseId": f.exercise_id,
                "vraag": f.vraag,
                "gegeven": f.gegeven,
                "juist": f.juist,
                "definitiefFout": f.definitief_fout,
                "tijdstip": f.tijdstip.isoformat() + "Z",
            }
            for f in fouten
        ],
    }

"""
profielen.py
-----------------------------------------------------------------------------
CRUD voor kindprofielen.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.profiel import Profiel
from app.security import hash_wachtwoord, verifieer_wachtwoord

router = APIRouter(prefix="/api/profielen", tags=["profielen"])


# --- Pydantic schemas -------------------------------------------------------

class ProfielCreate(BaseModel):
    naam: str
    avatar: str
    wachtwoord: str


class ProfielOut(BaseModel):
    id: int
    naam: str
    avatar: str
    aangemaakt_op: datetime
    laatste_activiteit_op: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProfielWachtwoordVerify(BaseModel):
    wachtwoord: str


class ProfielWachtwoordWijzig(BaseModel):
    wachtwoord: str


# --- Routes ------------------------------------------------------------------

@router.get("", response_model=list[ProfielOut])
def lijst_profielen(db: Session = Depends(get_db)):
    return db.query(Profiel).order_by(Profiel.id).all()


@router.post("", response_model=ProfielOut, status_code=status.HTTP_201_CREATED)
def maak_profiel(payload: ProfielCreate, db: Session = Depends(get_db)):
    if not payload.wachtwoord:
        raise HTTPException(status_code=400, detail="Wachtwoord is verplicht")
    profiel = Profiel(
        naam=payload.naam,
        avatar=payload.avatar,
        wachtwoord_hash=hash_wachtwoord(payload.wachtwoord),
    )
    db.add(profiel)
    db.commit()
    db.refresh(profiel)
    return profiel


@router.delete("/{profiel_id}", status_code=status.HTTP_204_NO_CONTENT)
def verwijder_profiel(profiel_id: int, db: Session = Depends(get_db)):
    profiel = db.query(Profiel).filter(Profiel.id == profiel_id).first()
    if profiel is None:
        raise HTTPException(status_code=404, detail="Profiel niet gevonden")
    db.delete(profiel)
    db.commit()
    return None


@router.post("/{profiel_id}/verify-wachtwoord")
def verifieer_profiel_wachtwoord(
    profiel_id: int, payload: ProfielWachtwoordVerify, db: Session = Depends(get_db)
):
    profiel = db.query(Profiel).filter(Profiel.id == profiel_id).first()
    if profiel is None:
        raise HTTPException(status_code=404, detail="Profiel niet gevonden")
    return {"ok": verifieer_wachtwoord(payload.wachtwoord, profiel.wachtwoord_hash)}


@router.put("/{profiel_id}/wachtwoord", status_code=status.HTTP_204_NO_CONTENT)
def wijzig_profiel_wachtwoord(
    profiel_id: int, payload: ProfielWachtwoordWijzig, db: Session = Depends(get_db)
):
    profiel = db.query(Profiel).filter(Profiel.id == profiel_id).first()
    if profiel is None:
        raise HTTPException(status_code=404, detail="Profiel niet gevonden")
    if not payload.wachtwoord:
        raise HTTPException(status_code=400, detail="Wachtwoord mag niet leeg zijn")
    profiel.wachtwoord_hash = hash_wachtwoord(payload.wachtwoord)
    db.commit()
    return None

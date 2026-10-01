"""
routes/appconfig.py
-----------------------------------------------------------------------------
App-brede instellingen (niet per profiel): op dit moment de ChatGPT
(OpenAI-compatibele) API-key voor de rekenhulp-hints. De key wordt nooit
teruggegeven aan de frontend — alleen of er wél of geen key is ingesteld.
"""

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.appconfig import AppConfig

router = APIRouter(prefix="/api/app-instellingen", tags=["app-instellingen"])

OPENAI_SLEUTEL = "openai_api_key"


class OpenAiSleutelIn(BaseModel):
    apiKey: str


def _haal_waarde(db: Session, sleutel: str) -> Optional[str]:
    rij = db.query(AppConfig).filter(AppConfig.sleutel == sleutel).first()
    return rij.waarde if rij else None


@router.get("/openai-key")
def haal_openai_sleutel_status(db: Session = Depends(get_db)):
    waarde = _haal_waarde(db, OPENAI_SLEUTEL)
    ingesteld = bool(waarde and waarde.strip())
    laatste_tekens = waarde.strip()[-4:] if ingesteld else None
    return {"ingesteld": ingesteld, "laatsteTekens": laatste_tekens}


@router.put("/openai-key", status_code=204)
def sla_openai_sleutel_op(payload: OpenAiSleutelIn, db: Session = Depends(get_db)):
    apiKey = payload.apiKey.strip()
    rij = db.query(AppConfig).filter(AppConfig.sleutel == OPENAI_SLEUTEL).first()
    if rij is None:
        rij = AppConfig(sleutel=OPENAI_SLEUTEL, waarde=apiKey)
        db.add(rij)
    else:
        rij.waarde = apiKey
    db.commit()
    return None


@router.delete("/openai-key", status_code=204)
def wis_openai_sleutel(db: Session = Depends(get_db)):
    rij = db.query(AppConfig).filter(AppConfig.sleutel == OPENAI_SLEUTEL).first()
    if rij is not None:
        db.delete(rij)
        db.commit()
    return None

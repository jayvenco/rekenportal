"""
statistieken.py
-----------------------------------------------------------------------------
Repliceert de statistiek-logica van de frontend (js/storage.js) op de backend,
gebaseerd op de antwoorden die voor een profiel zijn opgeslagen.
"""

from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.antwoord import Antwoord

router = APIRouter(prefix="/api/statistieken", tags=["statistieken"])


# --- Pydantic schemas -------------------------------------------------------

class OverzichtOut(BaseModel):
    totaal: int
    goed: int
    percentage: int
    gemiddeldeTijdMs: int
    besteStreak: int
    huidigeStreak: int


class DagelijksItemOut(BaseModel):
    dag: str
    totaal: int
    goed: int
    percentage: int


class VandaagOut(BaseModel):
    aantalGoed: int


class UitsplitsingItemOut(BaseModel):
    waarde: str
    totaal: int
    goed: int
    percentage: int
    gemiddeldeTijdMs: int


# --- Helpers -----------------------------------------------------------------

def _haal_antwoorden(db: Session, profiel_id: int, exercise_id: Optional[str] = None):
    query = db.query(Antwoord).filter(Antwoord.profiel_id == profiel_id)
    if exercise_id:
        query = query.filter(Antwoord.exercise_id == exercise_id)
    return query.order_by(Antwoord.tijdstip).all()


def _bereken_basis_statistiek(antwoorden) -> dict:
    totaal = len(antwoorden)
    goed = sum(1 for a in antwoorden if a.correct)
    percentage = 0 if totaal == 0 else round((goed / totaal) * 100)
    totale_tijd = sum((a.time_ms or 0) for a in antwoorden)
    gemiddelde_tijd_ms = 0 if totaal == 0 else round(totale_tijd / totaal)
    return {
        "totaal": totaal,
        "goed": goed,
        "percentage": percentage,
        "gemiddeldeTijdMs": gemiddelde_tijd_ms,
    }


def _bereken_streaks(antwoorden) -> dict:
    gesorteerd = sorted(antwoorden, key=lambda a: a.tijdstip)
    beste = 0
    lopend = 0
    for a in gesorteerd:
        if a.correct:
            lopend += 1
            beste = max(beste, lopend)
        else:
            lopend = 0
    huidig = 0
    for a in reversed(gesorteerd):
        if a.correct:
            huidig += 1
        else:
            break
    return {"besteStreak": beste, "huidigeStreak": huidig}


def _naar_dag_string(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


# --- Routes ------------------------------------------------------------------

@router.get("/{profiel_id}/overzicht", response_model=OverzichtOut)
def overzicht(
    profiel_id: int,
    exerciseId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    antwoorden = _haal_antwoorden(db, profiel_id, exerciseId)
    basis = _bereken_basis_statistiek(antwoorden)
    streaks = _bereken_streaks(antwoorden)
    return {**basis, **streaks}


@router.get("/{profiel_id}/dagelijks", response_model=list[DagelijksItemOut])
def dagelijks(
    profiel_id: int,
    dagen: int = Query(14, ge=1, le=366),
    exerciseId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    antwoorden = _haal_antwoorden(db, profiel_id, exerciseId)
    vandaag = datetime.now()
    dag_lijst = []
    for i in range(dagen - 1, -1, -1):
        dag = vandaag - timedelta(days=i)
        dag_lijst.append({"dag": _naar_dag_string(dag), "totaal": 0, "goed": 0})

    dag_index = {d["dag"]: idx for idx, d in enumerate(dag_lijst)}
    for antwoord in antwoorden:
        sleutel = _naar_dag_string(antwoord.tijdstip)
        idx = dag_index.get(sleutel)
        if idx is None:
            continue
        dag_lijst[idx]["totaal"] += 1
        if antwoord.correct:
            dag_lijst[idx]["goed"] += 1

    resultaat = []
    for d in dag_lijst:
        percentage = 0 if d["totaal"] == 0 else round((d["goed"] / d["totaal"]) * 100)
        resultaat.append({**d, "percentage": percentage})
    return resultaat


@router.get("/{profiel_id}/vandaag", response_model=VandaagOut)
def vandaag(
    profiel_id: int,
    exerciseId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    vandaag_sleutel = _naar_dag_string(datetime.now())
    antwoorden = _haal_antwoorden(db, profiel_id, exerciseId)
    aantal_goed = sum(
        1
        for a in antwoorden
        if a.correct and _naar_dag_string(a.tijdstip) == vandaag_sleutel
    )
    return {"aantalGoed": aantal_goed}


@router.get("/{profiel_id}/uitsplitsing", response_model=list[UitsplitsingItemOut])
def uitsplitsing(
    profiel_id: int,
    exerciseId: str = Query(...),
    veld: str = Query(...),
    db: Session = Depends(get_db),
):
    antwoorden = _haal_antwoorden(db, profiel_id, exerciseId)
    groepen: dict[str, list] = {}
    for antwoord in antwoorden:
        meta = antwoord.meta or {}
        waarde = meta.get(veld)
        if waarde is None:
            continue
        sleutel = str(waarde)
        groepen.setdefault(sleutel, []).append(antwoord)

    resultaat = []
    for sleutel, lijst in groepen.items():
        basis = _bereken_basis_statistiek(lijst)
        resultaat.append({"waarde": sleutel, **basis})

    def sorteer_key(item):
        try:
            return (0, float(item["waarde"]))
        except ValueError:
            return (1, item["waarde"])

    # Numeriek sorteren als alle waarden getallen zijn, anders alfabetisch.
    alle_numeriek = all(_is_getal(item["waarde"]) for item in resultaat)
    if alle_numeriek:
        resultaat.sort(key=lambda item: float(item["waarde"]))
    else:
        resultaat.sort(key=lambda item: item["waarde"])
    return resultaat


def _is_getal(waarde: str) -> bool:
    try:
        float(waarde)
        return True
    except (TypeError, ValueError):
        return False


@router.get("/{profiel_id}/gebruikte-oefeningen", response_model=list[str])
def gebruikte_oefeningen(profiel_id: int, db: Session = Depends(get_db)):
    rijen = (
        db.query(Antwoord.exercise_id)
        .filter(Antwoord.profiel_id == profiel_id)
        .distinct()
        .all()
    )
    return [r[0] for r in rijen]

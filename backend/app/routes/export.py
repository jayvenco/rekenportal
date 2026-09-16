"""
export.py
-----------------------------------------------------------------------------
Data-export per profiel of voor alle profielen samen, als JSON of CSV download.
"""

import csv
import io
import json
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.antwoord import Antwoord
from app.models.instelling import Instelling
from app.models.profiel import Profiel

router = APIRouter(prefix="/api/export", tags=["export"])


# --- Helpers -----------------------------------------------------------------

def _veilige_bestandsnaam(naam: str) -> str:
    return "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in naam).strip("_") or "profiel"


def _vandaag_datumstring() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def _profiel_naar_dict(profiel: Profiel) -> dict[str, Any]:
    return {
        "id": profiel.id,
        "naam": profiel.naam,
        "avatar": profiel.avatar,
        "aangemaakt_op": profiel.aangemaakt_op.isoformat(),
    }


def _antwoord_naar_dict(antwoord: Antwoord) -> dict[str, Any]:
    return {
        "id": antwoord.id,
        "exercise_id": antwoord.exercise_id,
        "correct": antwoord.correct,
        "time_ms": antwoord.time_ms,
        "meta": antwoord.meta or {},
        "tijdstip": antwoord.tijdstip.isoformat(),
    }


def _instelling_naar_dict(instelling: Instelling) -> dict[str, Any]:
    return {
        "id": instelling.id,
        "sleutel": instelling.sleutel,
        "waarde": instelling.waarde or {},
    }


def _profiel_export_data(db: Session, profiel: Profiel) -> dict[str, Any]:
    antwoorden = (
        db.query(Antwoord)
        .filter(Antwoord.profiel_id == profiel.id)
        .order_by(Antwoord.tijdstip)
        .all()
    )
    instellingen = (
        db.query(Instelling).filter(Instelling.profiel_id == profiel.id).all()
    )
    return {
        "profiel": _profiel_naar_dict(profiel),
        "antwoorden": [_antwoord_naar_dict(a) for a in antwoorden],
        "instellingen": [_instelling_naar_dict(i) for i in instellingen],
    }


def _antwoorden_naar_csv(rijen: list[dict[str, Any]], extra_kolommen: list[str] = None) -> str:
    extra_kolommen = extra_kolommen or []
    buffer = io.StringIO()
    kolommen = extra_kolommen + ["id", "exercise_id", "correct", "time_ms", "meta", "tijdstip"]
    schrijver = csv.DictWriter(buffer, fieldnames=kolommen)
    schrijver.writeheader()
    for rij in rijen:
        schrijver.writerow(rij)
    return buffer.getvalue()


def _json_response(data: dict, bestandsnaam: str) -> Response:
    inhoud = json.dumps(data, ensure_ascii=False, indent=2)
    return Response(
        content=inhoud,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{bestandsnaam}"'},
    )


def _csv_response(inhoud: str, bestandsnaam: str) -> Response:
    return Response(
        content=inhoud,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{bestandsnaam}"'},
    )


# --- Routes ------------------------------------------------------------------

@router.get("/profiel/{profiel_id}")
def export_profiel(
    profiel_id: int, formaat: str = Query("json"), db: Session = Depends(get_db)
):
    profiel = db.query(Profiel).filter(Profiel.id == profiel_id).first()
    if profiel is None:
        raise HTTPException(status_code=404, detail="Profiel niet gevonden")

    datum = _vandaag_datumstring()
    naam_veilig = _veilige_bestandsnaam(profiel.naam)

    if formaat == "csv":
        antwoorden = (
            db.query(Antwoord)
            .filter(Antwoord.profiel_id == profiel_id)
            .order_by(Antwoord.tijdstip)
            .all()
        )
        rijen = []
        for a in antwoorden:
            d = _antwoord_naar_dict(a)
            d["meta"] = json.dumps(d["meta"], ensure_ascii=False)
            rijen.append(d)
        inhoud = _antwoorden_naar_csv(rijen)
        bestandsnaam = f"rekenportal_export_{naam_veilig}_{datum}.csv"
        return _csv_response(inhoud, bestandsnaam)

    data = _profiel_export_data(db, profiel)
    bestandsnaam = f"rekenportal_export_{naam_veilig}_{datum}.json"
    return _json_response(data, bestandsnaam)


@router.get("/alle")
def export_alle(formaat: str = Query("json"), db: Session = Depends(get_db)):
    profielen = db.query(Profiel).order_by(Profiel.id).all()
    datum = _vandaag_datumstring()

    if formaat == "csv":
        rijen = []
        for profiel in profielen:
            antwoorden = (
                db.query(Antwoord)
                .filter(Antwoord.profiel_id == profiel.id)
                .order_by(Antwoord.tijdstip)
                .all()
            )
            for a in antwoorden:
                d = _antwoord_naar_dict(a)
                d["meta"] = json.dumps(d["meta"], ensure_ascii=False)
                d["profiel_id"] = profiel.id
                d["profiel_naam"] = profiel.naam
                rijen.append(d)
        inhoud = _antwoorden_naar_csv(rijen, extra_kolommen=["profiel_id", "profiel_naam"])
        bestandsnaam = f"rekenportal_export_alle_{datum}.csv"
        return _csv_response(inhoud, bestandsnaam)

    data = {"profielen": [_profiel_export_data(db, p) for p in profielen]}
    bestandsnaam = f"rekenportal_export_alle_{datum}.json"
    return _json_response(data, bestandsnaam)

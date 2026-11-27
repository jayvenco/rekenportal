"""
fout.py
-----------------------------------------------------------------------------
Rapportage-log: opgaven die niet goed gingen (fout, of pas bij de tweede
poging goed). Wordt na RAPPORT_BEWAARDAGEN dagen automatisch opgeruimd.
De gewone statistieken (tabel "antwoorden") blijven onaangetast.
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String

from app.database import Base

RAPPORT_BEWAARDAGEN = 14


class Fout(Base):
    __tablename__ = "fouten"

    id = Column(Integer, primary_key=True, index=True)
    profiel_id = Column(
        Integer, ForeignKey("profielen.id", ondelete="CASCADE"), nullable=False, index=True
    )
    exercise_id = Column(String, nullable=False)
    vraag = Column(String, nullable=False, default="")
    gegeven = Column(String, nullable=True)
    juist = Column(String, nullable=True)
    # True = uiteindelijk fout, False = pas bij de tweede poging goed
    definitief_fout = Column(Boolean, nullable=False, default=True)
    tijdstip = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

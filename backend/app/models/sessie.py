"""
sessie.py
-----------------------------------------------------------------------------
Model voor een voltooide oefensessie met punten.
Slaat per sessie op: welk profiel, welke oefening, aantal goed/totaal,
percentage, verdiende punten, en tijdstip.
Zodat we maandoverzichten kunnen genereren in het beheerscherm.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from app.database import Base


class Sessie(Base):
    __tablename__ = "sessies"

    id = Column(Integer, primary_key=True, index=True)
    profiel_id = Column(Integer, ForeignKey("profielen.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_id = Column(String, nullable=False)
    aantal_goed = Column(Integer, nullable=False)
    aantal_totaal = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    punten = Column(Integer, nullable=False, default=0)
    tijdstip = Column(DateTime, default=datetime.utcnow, nullable=False)
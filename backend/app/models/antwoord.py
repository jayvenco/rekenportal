"""
antwoord.py
-----------------------------------------------------------------------------
Eén beantwoorde opgave van een kind, voor een specifieke oefening.
"""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Antwoord(Base):
    __tablename__ = "antwoorden"

    id = Column(Integer, primary_key=True, index=True)
    profiel_id = Column(
        Integer, ForeignKey("profielen.id", ondelete="CASCADE"), nullable=False, index=True
    )
    exercise_id = Column(String, nullable=False, index=True)
    correct = Column(Boolean, nullable=False, default=False)
    time_ms = Column(Integer, nullable=False, default=0)
    meta = Column(JSON, nullable=True, default=dict)
    tijdstip = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    profiel = relationship("Profiel", back_populates="antwoorden")

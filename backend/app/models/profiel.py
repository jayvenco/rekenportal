"""
profiel.py
-----------------------------------------------------------------------------
Kindprofiel: naam + avatar, met cascade-relaties naar antwoorden en instellingen.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Profiel(Base):
    __tablename__ = "profielen"

    id = Column(Integer, primary_key=True, index=True)
    naam = Column(String, nullable=False)
    avatar = Column(String, nullable=False)
    aangemaakt_op = Column(DateTime, default=datetime.utcnow, nullable=False)

    antwoorden = relationship(
        "Antwoord",
        back_populates="profiel",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    instellingen = relationship(
        "Instelling",
        back_populates="profiel",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

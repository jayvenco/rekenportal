"""
instelling.py
-----------------------------------------------------------------------------
Instellingen per profiel, per sleutel. Sleutel is bv. "exercise:tafels" voor
oefening-specifieke instellingen, of "algemeen" voor globale instellingen
(zoals geluid aan/uit).
"""

from sqlalchemy import Column, ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Instelling(Base):
    __tablename__ = "instellingen"
    __table_args__ = (
        UniqueConstraint("profiel_id", "sleutel", name="uq_instelling_profiel_sleutel"),
    )

    id = Column(Integer, primary_key=True, index=True)
    profiel_id = Column(
        Integer, ForeignKey("profielen.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sleutel = Column(String, nullable=False, index=True)
    waarde = Column(JSON, nullable=False, default=dict)

    profiel = relationship("Profiel", back_populates="instellingen")

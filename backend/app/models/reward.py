"""
reward.py
-----------------------------------------------------------------------------
Persistente profielgebonden coins, badges en reward-events.
"""

from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class ProfielReward(Base):
    __tablename__ = "profiel_rewards"

    profiel_id = Column(Integer, ForeignKey("profielen.id", ondelete="CASCADE"), primary_key=True)
    coins = Column(Float, nullable=False, default=0)
    total_questions = Column(Integer, nullable=False, default=0)
    correct_answers = Column(Integer, nullable=False, default=0)
    attempts = Column(Integer, nullable=False, default=0)
    current_streak = Column(Integer, nullable=False, default=0)
    best_streak = Column(Integer, nullable=False, default=0)
    xp = Column(Integer, nullable=False, default=0)
    level = Column(Integer, nullable=False, default=1)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    profiel = relationship("Profiel", back_populates="reward")


class BadgeAward(Base):
    __tablename__ = "badge_awards"
    __table_args__ = (UniqueConstraint("profiel_id", "badge_id", name="uq_badge_profiel_badge"),)

    id = Column(Integer, primary_key=True, index=True)
    profiel_id = Column(Integer, ForeignKey("profielen.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = Column(String, nullable=False, index=True)
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    profiel = relationship("Profiel", back_populates="badges")


class RewardEvent(Base):
    __tablename__ = "reward_events"
    __table_args__ = (UniqueConstraint("profiel_id", "event_key", name="uq_reward_profiel_event"),)

    id = Column(Integer, primary_key=True, index=True)
    profiel_id = Column(Integer, ForeignKey("profielen.id", ondelete="CASCADE"), nullable=False, index=True)
    event_key = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False, default=0)
    description = Column(String, nullable=False, default="")
    meta = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    profiel = relationship("Profiel", back_populates="reward_events")

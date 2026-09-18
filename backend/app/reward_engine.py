"""
reward_engine.py
-----------------------------------------------------------------------------
Coinberekening en badge-checks voor afgeronde oefensessies.
"""

from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.profiel import Profiel
from app.models.reward import BadgeAward, ProfielReward, RewardEvent
from app.models.sessie import Sessie
from app.rewards_config import BADGE_BY_ID, BADGE_EXPIRATION_DAYS, BADGES


def _afronden_coin(waarde: float) -> float:
    return round(float(waarde) * 2) / 2


def bereken_session_rewards(resultaat: dict) -> dict:
    total = max(0, int(resultaat.get("totalQuestions") or 0))
    correct = max(0, int(resultaat.get("correctAnswers") or 0))
    first = max(0, int(resultaat.get("firstAttemptCorrect") or 0))
    second = max(0, int(resultaat.get("secondAttemptCorrect") or 0))
    best_first_streak = max(0, int(resultaat.get("bestFirstAttemptStreak") or first))
    wrong = max(0, total - correct)
    percentage = round((correct / total) * 100, 1) if total else 0
    base_coins = _afronden_coin(first + (second * 0.5))
    bonus_coins = 10 if total and percentage == 100 else 5 if percentage >= 70 else 0

    return {
        "totalQuestions": total,
        "correctAnswers": correct,
        "firstAttemptCorrect": first,
        "secondAttemptCorrect": second,
        "bestFirstAttemptStreak": best_first_streak,
        "wrongAnswers": wrong,
        "percentage": percentage,
        "baseCoins": base_coins,
        "bonusCoins": bonus_coins,
        "totalCoins": _afronden_coin(base_coins + bonus_coins),
    }


def _get_reward(db: Session, profiel_id: int) -> ProfielReward:
    reward = db.query(ProfielReward).filter(ProfielReward.profiel_id == profiel_id).first()
    if reward is None:
        reward = ProfielReward(profiel_id=profiel_id)
        db.add(reward)
        db.flush()
    return reward


def _ooit_verdiende_badge_ids(db: Session, profiel_id: int) -> set[str]:
    return {
        rij.badge_id
        for rij in db.query(BadgeAward).filter(BadgeAward.profiel_id == profiel_id).all()
    }


def _sessie_tellingen(db: Session, profiel_id: int) -> tuple[int, int]:
    sessies = db.query(Sessie).filter(Sessie.profiel_id == profiel_id).all()
    sessies_70 = sum(1 for sessie in sessies if sessie.percentage >= 70)
    perfect = sum(1 for sessie in sessies if sessie.percentage >= 100)
    return sessies_70, perfect


def check_badges(db: Session, profiel_id: int, reward: ProfielReward, session_result: dict) -> list[dict]:
    now = datetime.utcnow()
    bestaande = _ooit_verdiende_badge_ids(db, profiel_id)
    sessies_70, perfecte_sessies = _sessie_tellingen(db, profiel_id)
    nieuwe_ids = []

    if session_result["percentage"] >= 70:
        nieuwe_ids.append("spark_starter")
    if session_result["percentage"] >= 100:
        nieuwe_ids.append("power_core")
    if sessies_70 >= 3:
        nieuwe_ids.append("shadow_hunter")
    if perfecte_sessies >= 3:
        nieuwe_ids.append("demon_breaker")
    if reward.coins >= 25:
        nieuwe_ids.append("lightning_hero")
    if reward.coins >= 100:
        nieuwe_ids.append("crystal_master")
    if session_result["percentage"] >= 90:
        nieuwe_ids.append("unbreakable")
    if session_result["bestFirstAttemptStreak"] >= 5:
        nieuwe_ids.append("combo_hero")
    if perfecte_sessies >= 5:
        nieuwe_ids.append("power_legend")
    if reward.coins >= 250 or perfecte_sessies >= 10:
        nieuwe_ids.append("math_master")

    verdiend = []
    for badge_id in nieuwe_ids:
        if badge_id in bestaande or badge_id not in BADGE_BY_ID:
            continue
        award = BadgeAward(
            profiel_id=profiel_id,
            badge_id=badge_id,
            earned_at=now,
            expires_at=now + timedelta(days=BADGE_EXPIRATION_DAYS),
        )
        db.add(award)
        db.flush()
        bestaande.add(badge_id)
        badge = {**BADGE_BY_ID[badge_id]}
        badge["earnedAt"] = award.earned_at.isoformat()
        badge["expiresAt"] = award.expires_at.isoformat()
        verdiend.append(badge)
    return verdiend


def _voeg_event_toe(db: Session, profiel_id: int, event_key: str, event_type: str, amount: float, description: str, meta: dict):
    event = RewardEvent(
        profiel_id=profiel_id,
        event_key=event_key,
        event_type=event_type,
        amount=amount,
        description=description,
        meta=meta,
    )
    db.add(event)
    db.flush()
    return event


def verwerk_sessie_rewards(db: Session, profiel_id: int, exercise_id: str, payload: dict) -> dict:
    profiel = db.query(Profiel).filter(Profiel.id == profiel_id).first()
    if profiel is None:
        raise ValueError("Profiel niet gevonden")

    session_id = payload.get("sessionId") or str(uuid4())
    event_key = f"session:{session_id}:complete"
    bestaand = (
        db.query(RewardEvent)
        .filter(RewardEvent.profiel_id == profiel_id, RewardEvent.event_key == event_key)
        .first()
    )
    if bestaand is not None:
        reward = _get_reward(db, profiel_id)
        return {
            "duplicate": True,
            "sessionId": session_id,
            "profile": reward_naar_dict(db, profiel_id),
            "sessionResult": bestaand.meta.get("sessionResult", {}),
            "badgesEarned": [],
            "events": [],
        }

    session_result = bereken_session_rewards(payload)
    reward = _get_reward(db, profiel_id)
    reward.coins = _afronden_coin(reward.coins + session_result["totalCoins"])
    reward.total_questions += session_result["totalQuestions"]
    reward.correct_answers += session_result["correctAnswers"]
    reward.attempts += session_result["totalQuestions"] + max(0, session_result["secondAttemptCorrect"]) + max(0, session_result["wrongAnswers"])
    reward.current_streak = reward.current_streak + session_result["firstAttemptCorrect"]
    if session_result["wrongAnswers"] > 0 or session_result["secondAttemptCorrect"] > 0:
        reward.current_streak = 0
    reward.best_streak = max(reward.best_streak, session_result["firstAttemptCorrect"], reward.current_streak)
    reward.xp = int(reward.coins * 10)
    reward.level = max(1, int(reward.coins // 25) + 1)
    reward.updated_at = datetime.utcnow()
    profiel.laatste_activiteit_op = reward.updated_at

    sessie = Sessie(
        profiel_id=profiel_id,
        exercise_id=exercise_id,
        aantal_goed=session_result["correctAnswers"],
        aantal_totaal=session_result["totalQuestions"],
        percentage=session_result["percentage"],
        punten=int(session_result["totalCoins"]),
    )
    db.add(sessie)
    db.flush()

    events = []
    if session_result["baseCoins"] > 0:
        events.append(_voeg_event_toe(
            db,
            profiel_id,
            f"session:{session_id}:base",
            "coins",
            session_result["baseCoins"],
            "Coins voor goede antwoorden",
            {"sessionId": session_id},
        ))
    if session_result["bonusCoins"] > 0:
        events.append(_voeg_event_toe(
            db,
            profiel_id,
            f"session:{session_id}:bonus",
            "bonus",
            session_result["bonusCoins"],
            "PERFECT bonus" if session_result["percentage"] == 100 else "70% bonus",
            {"sessionId": session_id},
        ))
    _voeg_event_toe(
        db,
        profiel_id,
        event_key,
        "session",
        session_result["totalCoins"],
        "Oefensessie voltooid",
        {"sessionId": session_id, "exerciseId": exercise_id, "sessionResult": session_result},
    )

    badges = check_badges(db, profiel_id, reward, session_result)
    for badge in badges:
        events.append(_voeg_event_toe(
            db,
            profiel_id,
            f"session:{session_id}:badge:{badge['id']}",
            "badge",
            0,
            f"Nieuwe badge: {badge['name']}",
            {"sessionId": session_id, "badgeId": badge["id"]},
        ))

    db.commit()

    return {
        "duplicate": False,
        "sessionId": session_id,
        "profile": reward_naar_dict(db, profiel_id),
        "sessionResult": {**session_result, "badgesEarned": badges},
        "badgesEarned": badges,
        "events": [event_naar_dict(event) for event in events],
    }


def event_naar_dict(event: RewardEvent) -> dict:
    return {
        "id": event.id,
        "type": event.event_type,
        "amount": event.amount,
        "description": event.description,
        "createdAt": event.created_at.isoformat(),
        "meta": event.meta or {},
    }


def badge_award_naar_dict(award: BadgeAward, now: datetime) -> dict:
    config = BADGE_BY_ID.get(award.badge_id, {"id": award.badge_id, "name": award.badge_id, "icon": "🏆", "rarity": "COMMON", "description": ""})
    resterend = max(0, (award.expires_at.date() - now.date()).days)
    return {
        **config,
        "earned": award.expires_at > now,
        "earnedAt": award.earned_at.isoformat(),
        "expiresAt": award.expires_at.isoformat(),
        "daysRemaining": resterend,
    }


def reward_naar_dict(db: Session, profiel_id: int) -> dict:
    now = datetime.utcnow()
    reward = _get_reward(db, profiel_id)
    awards = db.query(BadgeAward).filter(BadgeAward.profiel_id == profiel_id).all()
    award_map = {award.badge_id: award for award in awards}
    badges = []
    for config in BADGES:
        award = award_map.get(config["id"])
        if award and award.expires_at > now:
            badges.append(badge_award_naar_dict(award, now))
        else:
            badges.append({**config, "earned": False, "earnedAt": None, "expiresAt": None, "daysRemaining": 0})

    earned_count = sum(1 for badge in badges if badge["earned"])
    return {
        "profielId": profiel_id,
        "coins": reward.coins,
        "totalQuestions": reward.total_questions,
        "correctAnswers": reward.correct_answers,
        "attempts": reward.attempts,
        "currentStreak": reward.current_streak,
        "bestStreak": reward.best_streak,
        "xp": reward.xp,
        "level": reward.level,
        "updatedAt": reward.updated_at.isoformat(),
        "badges": badges,
        "earnedBadgeCount": earned_count,
        "totalBadgeCount": len(BADGES),
        "badgeExpirationDays": BADGE_EXPIRATION_DAYS,
    }

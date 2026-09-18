"""
rewards_config.py
-----------------------------------------------------------------------------
Centrale badge- en reward-configuratie voor Math Hero.
"""

BADGE_EXPIRATION_DAYS = 30

BADGES = [
    {
        "id": "spark_starter",
        "name": "Spark Starter",
        "description": "Behaal minimaal 70% in een oefensessie.",
        "icon": "⚡",
        "rarity": "COMMON",
    },
    {
        "id": "power_core",
        "name": "Power Core",
        "description": "Behaal 100% in een oefensessie.",
        "icon": "💎",
        "rarity": "RARE",
    },
    {
        "id": "shadow_hunter",
        "name": "Shadow Hunter",
        "description": "Behaal 70% of hoger in 3 verschillende sessies.",
        "icon": "🌑",
        "rarity": "RARE",
    },
    {
        "id": "demon_breaker",
        "name": "Demon Breaker",
        "description": "Behaal 100% in 3 verschillende sessies.",
        "icon": "🔥",
        "rarity": "EPIC",
    },
    {
        "id": "lightning_hero",
        "name": "Lightning Hero",
        "description": "Verdien minimaal 25 coins.",
        "icon": "⚡",
        "rarity": "COMMON",
    },
    {
        "id": "crystal_master",
        "name": "Crystal Master",
        "description": "Verdien minimaal 100 coins.",
        "icon": "💎",
        "rarity": "EPIC",
    },
    {
        "id": "unbreakable",
        "name": "Unbreakable",
        "description": "Behaal minimaal 90% in een sessie.",
        "icon": "🛡",
        "rarity": "RARE",
    },
    {
        "id": "combo_hero",
        "name": "Combo Hero",
        "description": "Beantwoord 5 vragen achter elkaar correct bij de eerste poging.",
        "icon": "🔥",
        "rarity": "EPIC",
    },
    {
        "id": "power_legend",
        "name": "Power Legend",
        "description": "Behaal 100% in 5 verschillende sessies.",
        "icon": "👑",
        "rarity": "LEGENDARY",
    },
    {
        "id": "math_master",
        "name": "Math Master",
        "description": "Verzamel minimaal 250 coins of behaal 10 keer 100%.",
        "icon": "🌟",
        "rarity": "LEGENDARY",
    },
]

BADGE_BY_ID = {badge["id"]: badge for badge in BADGES}

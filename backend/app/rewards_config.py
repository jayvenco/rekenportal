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
        "visual": "img/badges/spark-starter.svg",
        "rarity": "COMMON",
    },
    {
        "id": "power_core",
        "name": "Power Core",
        "description": "Behaal 100% in een oefensessie.",
        "icon": "💎",
        "visual": "img/badges/power-core.svg",
        "rarity": "RARE",
    },
    {
        "id": "shadow_hunter",
        "name": "Shadow Hunter",
        "description": "Behaal 70% of hoger in 3 verschillende sessies.",
        "icon": "🌑",
        "visual": "img/badges/shadow-hunter.svg",
        "rarity": "RARE",
    },
    {
        "id": "demon_breaker",
        "name": "Demon Breaker",
        "description": "Behaal 100% in 3 verschillende sessies.",
        "icon": "🔥",
        "visual": "img/badges/demon-breaker.svg",
        "rarity": "EPIC",
    },
    {
        "id": "lightning_hero",
        "name": "Lightning Hero",
        "description": "Verdien minimaal 25 coins.",
        "icon": "⚡",
        "visual": "img/badges/lightning-hero.svg",
        "rarity": "COMMON",
    },
    {
        "id": "crystal_master",
        "name": "Crystal Master",
        "description": "Verdien minimaal 100 coins.",
        "icon": "💎",
        "visual": "img/badges/crystal-master.svg",
        "rarity": "EPIC",
    },
    {
        "id": "unbreakable",
        "name": "Unbreakable",
        "description": "Behaal minimaal 90% in een sessie.",
        "icon": "🛡",
        "visual": "img/badges/unbreakable.svg",
        "rarity": "RARE",
    },
    {
        "id": "combo_hero",
        "name": "Combo Hero",
        "description": "Beantwoord 5 vragen achter elkaar correct bij de eerste poging.",
        "icon": "🔥",
        "visual": "img/badges/combo-hero.svg",
        "rarity": "EPIC",
    },
    {
        "id": "power_legend",
        "name": "Power Legend",
        "description": "Behaal 100% in 5 verschillende sessies.",
        "icon": "👑",
        "visual": "img/badges/power-legend.svg",
        "rarity": "LEGENDARY",
    },
    {
        "id": "math_master",
        "name": "Math Master",
        "description": "Verzamel minimaal 250 coins of behaal 10 keer 100%.",
        "icon": "🌟",
        "visual": "img/badges/math-master.svg",
        "rarity": "LEGENDARY",
    },
]

BADGE_BY_ID = {badge["id"]: badge for badge in BADGES}

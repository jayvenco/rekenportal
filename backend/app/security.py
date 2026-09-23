"""
security.py
-----------------------------------------------------------------------------
Lichtgewicht wachtwoord-hashing voor profielen. Geen bcrypt/passlib-dependency
nodig: dit is een gezinsapp zonder gevoelige data, het wachtwoord is puur een
speedbump zodat kinderen niet in elkaars profiel komen. Salted SHA-256 is
ruim voldoende voor dat doel.
"""

import hashlib
import os
from typing import Optional


def hash_wachtwoord(wachtwoord: str, salt: Optional[str] = None) -> str:
    """Hasht een wachtwoord met een (eventueel nieuwe) salt. Resultaat: "salt$hash"."""
    salt = salt or os.urandom(16).hex()
    digest = hashlib.sha256((salt + wachtwoord).encode("utf-8")).hexdigest()
    return f"{salt}${digest}"


def verifieer_wachtwoord(wachtwoord: str, opgeslagen: Optional[str]) -> bool:
    """Vergelijkt een ingevoerd wachtwoord met een opgeslagen "salt$hash"-string."""
    if not opgeslagen or "$" not in opgeslagen:
        return False
    salt, _ = opgeslagen.split("$", 1)
    return hash_wachtwoord(wachtwoord, salt) == opgeslagen

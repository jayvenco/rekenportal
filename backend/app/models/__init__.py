"""
models/__init__.py
-----------------------------------------------------------------------------
Importeert alle modellen zodat SQLAlchemy's Base.metadata ze kent
op het moment dat create_all() wordt aangeroepen.
"""

from app.models.profiel import Profiel  # noqa: F401
from app.models.antwoord import Antwoord  # noqa: F401
from app.models.instelling import Instelling  # noqa: F401

__all__ = ["Profiel", "Antwoord", "Instelling"]

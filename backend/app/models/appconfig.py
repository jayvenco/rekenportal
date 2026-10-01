"""
models/appconfig.py
-----------------------------------------------------------------------------
Kleine key/value-tabel voor app-brede instellingen die niet aan een profiel
hangen — op dit moment alleen de ChatGPT (OpenAI-compatibele) API-key voor
de rekenhulp-hints.
"""

from sqlalchemy import Column, String

from app.database import Base


class AppConfig(Base):
    __tablename__ = "app_config"

    sleutel = Column(String, primary_key=True)
    waarde = Column(String, nullable=True)

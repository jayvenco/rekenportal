"""
database.py
-----------------------------------------------------------------------------
SQLAlchemy engine + session setup voor de Rekenportal backend.
Gebruikt SQLite met een bestand in backend/data/rekenportal.db (sibling van app/).
"""

import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

# app/ ligt in backend/app/, dus data/ is backend/data/ (één niveau omhoog van app/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "rekenportal.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    """SQLite handhaaft foreign keys (en dus ON DELETE CASCADE) niet standaard.
    Zet de pragma aan op elke nieuwe connectie zodat cascade-deletes echt werken."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db() -> None:
    """Maakt de data-map aan (indien nodig) en alle tabellen op basis van de modellen."""
    os.makedirs(DATA_DIR, exist_ok=True)
    # Importeer alle modellen zodat Base.metadata ze kent voordat we create_all aanroepen.
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency die een DB-sessie levert en netjes weer sluit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

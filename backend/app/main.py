"""
main.py
-----------------------------------------------------------------------------
FastAPI app-instantie voor de Rekenportal backend: CORS, route-registratie,
database-initialisatie bij startup, en een health endpoint.

Draai met: uvicorn app.main:app --reload --port 8420 (vanuit backend/)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes import antwoorden, export, hint, instellingen, profielen, rewards, sessies, statistieken


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Rekenportal API", version="1.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Forceer revalidatie voor frontend-assets (.html/.js/.css) zodat wijzigingen
# direct zichtbaar zijn — ook de ES-module imports zonder versie-query.
# Voorkomt dat de browser een oude (gecachte) animatie/JS blijft tonen.
@app.middleware("http")
async def no_cache_assets(request, call_next):
    response = await call_next(request)
    if request.url.path.endswith((".html", ".js", ".css")):
        response.headers["Cache-Control"] = "no-cache"
    return response

app.include_router(profielen.router)
app.include_router(antwoorden.router)
app.include_router(statistieken.router)
app.include_router(instellingen.router)
app.include_router(export.router)
app.include_router(rewards.router)
app.include_router(sessies.router)
app.include_router(hint.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# -----------------------------------------------------------------------------
# Static files: serveert frontend via FastAPI's StaticFiles (betrouwbaar).
# Staat na alle API-routes zodat /api/* eerst matcht.
# html=True zorgt voor SPA-fallback naar index.html.
# -----------------------------------------------------------------------------
from pathlib import Path

from fastapi.staticfiles import StaticFiles

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

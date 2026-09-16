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
from app.routes import antwoorden, export, instellingen, profielen, statistieken


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Rekenportal API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profielen.router)
app.include_router(antwoorden.router)
app.include_router(statistieken.router)
app.include_router(instellingen.router)
app.include_router(export.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# -----------------------------------------------------------------------------
# Catch-all route: serveert frontend statische bestanden.
# API-routes (/api/...) zijn hierboven geregistreerd en hebben prioriteit
# omdat ze eerder in de route-tabel staan.
# -----------------------------------------------------------------------------
from pathlib import Path

from fastapi.responses import FileResponse, HTMLResponse

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent


@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serveert frontend statische bestanden.
    Als het bestand niet bestaat, valt het terug op index.html (voor SPA-routing).
    """
    # Lege path = root, serveer index.html direct
    if not full_path:
        return FileResponse(FRONTEND_DIR / "index.html")

    # Veiligheid: nooit backend/ of path traversal serveren
    if full_path.startswith("backend/") or ".." in full_path or full_path.startswith("/"):
        return HTMLResponse("Not Found", status_code=404)

    file_path = (FRONTEND_DIR / full_path).resolve()
    # Extra check: moet binnen FRONTEND_DIR blijven
    if not str(file_path).startswith(str(FRONTEND_DIR.resolve())):
        return HTMLResponse("Forbidden", status_code=403)

    if file_path.is_file():
        return FileResponse(file_path)

    # SPA fallback
    return FileResponse(FRONTEND_DIR / "index.html")

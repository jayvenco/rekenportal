"""
routes/hint.py
-----------------------------------------------------------------------------
Biedt rekenhulp/hints aan voor opgaven. Wanneer de env-var OPENAI_API_KEY is
gezet, wordt een OpenAI-compatibele chat-API gebruikt (ChatGPT of een andere
provider via OPENAI_BASE_URL / OPENAI_MODEL). Zonder key (of bij een fout)
wordt teruggevallen op een lokale strategie-hint per categorie — zo werkt de
knop altijd, ook offline. De API-key staat NOOIT hardcoded in de repo.
"""

import json
import os
import urllib.error
import urllib.request
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/hint", tags=["hint"])


class HintIn(BaseModel):
    opgave: str
    categorie: Optional[str] = None
    poging: Optional[int] = None


# Offline strategie-hints per categorie (geen antwoord, alleen aanpak).
OFFLINE_HINTS = {
    "optellen": "Tel de twee getallen bij elkaar op. Reken handig: splits in honderdtallen, tientallen en eenheden, en tel die apart op.",
    "aftrekken": "Trek het kleinere getal van het grotere af. Werk van rechts naar links en denk aan lenen bij de tientallen als dat nodig is.",
    "vermenigvuldigen": "Vermenigvuldig de aantallen. Splits een grote vermenigvuldiging in makkelijkere stappen, bijvoorbeeld in tientallen en eenheden.",
    "delen": "Verdeel eerlijk. Bepaal hoeveel in één groepje past, of deel in stapjes (eerst de tientallen, dan de rest).",
    "breuken": "Denk aan de breuk als 'een deel van het geheel'. Reken eerst uit hoeveel 1 deel is, en vermenigvuldig daarna met de teller.",
    "procenten": "Procent betekent 'per honderd'. Reken eerst 1% of 10% uit en vermenigvuldig dan. Bij korting: trek de korting van het origineel af.",
    "kommagetallen": "Reken met de komma erbij, alsof het geld is. Zet beide getallen onder elkaar en werk van rechts naar links. Je antwoord mag ook een komma bevatten.",
    "omrekenen": "Kijk welke vorm er wordt gevraagd. Gebruik het ezelsbruggetje: breuk = deel van 100, procent = per 100, en komma = honderdsten.",
    "oppervlakte": "Oppervlakte is lengte × breedte. Vermenigvuldig de twee getallen en zet er de juiste eenheid (m²) achter.",
    "meten": "Let op de eenheid (m, cm, km, kg, g, liter, minuten). Zet eerst alles om naar dezelfde eenheid en reken daarna.",
}

DEFAULT_OFFLINE = (
    "Lees de som rustig en kijk wat er precies wordt gevraagd. "
    "Bedenk welke bewerking je nodig hebt (optellen, aftrekken, vermenigvuldigen of delen) "
    "en reken daarna stap voor stap."
)

SYSTEEM_PROMPT = (
    "Je bent een geduldige rekenhulp voor een kind in groep 7 of 8. "
    "Geef een korte, vriendelijke hint in 1 tot 3 zinnen over hoe de opgave aan te pakken. "
    "Verklap nooit het antwoord of de uitkomst. Spreek het kind aan met 'je'. "
    "Schrijf in het Nederlands."
)


def _vraag_llm(opgave: str, categorie: str) -> Optional[str]:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        return None
    base = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip()
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEEM_PROMPT},
            {"role": "user", "content": f"Opgave: {opgave}\nCategorie: {categorie or 'onbekend'}"},
        ],
        "max_tokens": 120,
        "temperature": 0.6,
    }
    request = urllib.request.Request(
        f"{base}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        data = json.loads(response.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"].strip()


@router.post("")
def geef_hint(payload: HintIn):
    categorie = (payload.categorie or "").strip().lower()
    hint = None
    try:
        hint = _vraag_llm(payload.opgave, categorie)
    except Exception:
        hint = None
    if not hint:
        hint = OFFLINE_HINTS.get(categorie, DEFAULT_OFFLINE)
    return {"hint": hint}
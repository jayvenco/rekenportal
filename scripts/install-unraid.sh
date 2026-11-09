#!/usr/bin/env bash
# =============================================================================
# install-unraid.sh — Rekenportal installeren/updaten op Unraid
# -----------------------------------------------------------------------------
# - maakt de appdata-map aan en maakt een backup van de database bij een update
# - pullt de image van GHCR en start de container met de Unraid-labels
#   (icoon + WebUI-knop in de Docker-tab)
# - installeert het Unraid-template als gebruikers-template, zodat Edit,
#   Check for Updates en Apply Update in de Docker-tab werken
# - wacht op de Docker-healthstatus
#
# Gebruik (op Unraid, als root):
#   curl -fsSL https://raw.githubusercontent.com/jayvenco/rekenportal/staging/scripts/install-unraid.sh | bash
#
# Aanpassen via omgevingsvariabelen (allemaal optioneel):
#   PORT=8420                 poort op Unraid
#   APPDATA=/mnt/user/appdata/rekenportal
#   IMAGE_TAG=staging         tag van de image (bij een main-branch: latest)
#   BRANCH=staging            branch voor template en icoon op GitHub
#   GHCR_USER / GHCR_TOKEN    alleen nodig als de image privé is
#
# Het script is idempotent: opnieuw draaien werkt de container bij en laat de
# data op het volume staan. Er zijn geen geheimen of API-sleutels nodig; de app
# leest geen omgevingsvariabelen.
# =============================================================================

set -euo pipefail

APP_NAME="rekenportal"                       # moet gelijk zijn aan <Name> in het template
IMAGE_REPO="${IMAGE_REPO:-ghcr.io/jayvenco/rekenportal}"
IMAGE_TAG="${IMAGE_TAG:-staging}"
IMAGE="${IMAGE_REPO}:${IMAGE_TAG}"
PORT="${PORT:-8420}"
CONTAINER_PORT=8420
APPDATA="${APPDATA:-/mnt/user/appdata/${APP_NAME}}"
DATA_DIR="${APPDATA}/data"
BRANCH="${BRANCH:-staging}"
RAW_BASE="https://raw.githubusercontent.com/jayvenco/rekenportal/${BRANCH}"
TEMPLATE_URL="${TEMPLATE_URL:-${RAW_BASE}/unraid/${APP_NAME}.xml}"
ICON_URL="${ICON_URL:-${RAW_BASE}/unraid/icon.png}"
TEMPLATE_DIR="${TEMPLATE_DIR:-/boot/config/plugins/dockerMan/templates-user}"
WACHT_SECONDEN="${WACHT_SECONDEN:-90}"
SKIP_PULL="${SKIP_PULL:-0}"                  # 1 = niet pullen (voor lokaal testen)

ROOD='\033[0;31m'; GROEN='\033[0;32m'; GEEL='\033[1;33m'; BLAUW='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${BLAUW}[${APP_NAME}]${NC} $1"; }
ok()   { echo -e "${GROEN}  ✅ $1${NC}"; }
warn() { echo -e "${GEEL}  ⚠️  $1${NC}"; }
fout() { echo -e "${ROOD}  ❌ $1${NC}" >&2; }

echo ""
echo -e "${BLAUW}═══════════════════════════════════════════════${NC}"
echo -e "${BLAUW}  Rekenportal — installatie voor Unraid${NC}"
echo -e "${BLAUW}  Image: ${IMAGE}${NC}"
echo -e "${BLAUW}═══════════════════════════════════════════════${NC}"
echo ""

if ! command -v docker >/dev/null 2>&1; then
  fout "Docker niet gevonden. Draai dit script op de Unraid-server."
  exit 1
fi
if ! [[ "${PORT}" =~ ^[0-9]+$ ]] || [ "${PORT}" -lt 1 ] || [ "${PORT}" -gt 65535 ]; then
  fout "Ongeldige poort: ${PORT}"
  exit 1
fi

# --- 1. Appdata ---------------------------------------------------------------
log "1/6 Appdata-mappen..."
NIEUW=0
[ -d "${DATA_DIR}" ] || NIEUW=1
mkdir -p "${DATA_DIR}/backups"
if [ "${NIEUW}" = "1" ]; then
  # Unraid-gebruiker nobody:users; de container draait als root en kan altijd schrijven.
  chown 99:100 "${APPDATA}" "${DATA_DIR}" "${DATA_DIR}/backups" 2>/dev/null || warn "chown 99:100 niet gelukt (niet erg)"
fi
ok "Appdata: ${APPDATA}"

# --- 2. Geheimen --------------------------------------------------------------
log "2/6 Geheimen..."
ok "Niet nodig: Rekenportal gebruikt geen wachtwoorden of API-sleutels"

# --- 3. Database-backup bij een update ---------------------------------------
if [ -f "${DATA_DIR}/rekenportal.db" ]; then
  log "3/6 Database-backup..."
  BACKUP="${DATA_DIR}/backups/rekenportal_$(date +%Y%m%d_%H%M%S).db"
  cp "${DATA_DIR}/rekenportal.db" "${BACKUP}"
  ok "Backup: ${BACKUP}"
else
  log "3/6 Database-backup overgeslagen (nieuwe installatie)"
fi

# --- 4. Image ophalen ---------------------------------------------------------
log "4/6 Image ophalen..."
if [ -n "${GHCR_USER:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER}" --password-stdin >/dev/null
  ok "Ingelogd bij ghcr.io als ${GHCR_USER}"
fi
if [ "${SKIP_PULL}" = "1" ]; then
  warn "SKIP_PULL=1: image wordt niet gepulld"
else
  if ! docker pull "${IMAGE}" >/dev/null; then
    fout "Pullen mislukt. Is de image privé? Zet dan GHCR_USER en GHCR_TOKEN (token met read:packages)."
    exit 1
  fi
  ok "Image gepulld"
fi

# --- 5. Container (opnieuw) starten ------------------------------------------
log "5/6 Container starten..."
if docker inspect "${APP_NAME}" >/dev/null 2>&1; then
  docker stop "${APP_NAME}" >/dev/null 2>&1 || true
  docker rm "${APP_NAME}" >/dev/null 2>&1 || true
  ok "Oude container verwijderd (data staat op het volume)"
fi
docker run -d \
  --name "${APP_NAME}" \
  --restart unless-stopped \
  -p "${PORT}:${CONTAINER_PORT}" \
  -v "${DATA_DIR}:/app/backend/data" \
  --label "net.unraid.docker.managed=dockerman" \
  --label "net.unraid.docker.webui=http://[IP]:[PORT:${CONTAINER_PORT}]/" \
  --label "net.unraid.docker.icon=${ICON_URL}" \
  "${IMAGE}" >/dev/null
ok "Container gestart op poort ${PORT}"

# --- 6. Template voor de Docker-tab ------------------------------------------
log "6/6 Unraid-template..."
if [ -d "${TEMPLATE_DIR}" ]; then
  TMP="$(mktemp)"
  if curl -fsSL "${TEMPLATE_URL}" -o "${TMP}" && [ -s "${TMP}" ]; then
    # Vul jouw waarden in: image, poort en datamap. Alleen de waarde tussen de
    # <Config>-tags wordt aangepast, niet de standaardwaarden (Default).
    sed \
      -e "s|<Repository>.*</Repository>|<Repository>${IMAGE}</Repository>|" \
      -e "/Target=\"${CONTAINER_PORT}\"/ s|>[^<]*</Config>|>${PORT}</Config>|" \
      -e "/Target=\"\/app\/backend\/data\"/ s|>[^<]*</Config>|>${DATA_DIR}</Config>|" \
      "${TMP}" > "${TMP}.nieuw"
    mv "${TMP}.nieuw" "${TMP}"
    DOEL="${TEMPLATE_DIR}/my-${APP_NAME}.xml"
    mv "${TMP}" "${DOEL}"
    chmod 600 "${DOEL}"
    ok "Template opgeslagen: ${DOEL}"
  else
    rm -f "${TMP}"
    warn "Template downloaden mislukt (${TEMPLATE_URL}). De container draait, maar zonder template werkt Edit/Update in de Docker-tab niet."
  fi
else
  warn "${TEMPLATE_DIR} niet gevonden; template overgeslagen (geen Unraid?)"
fi

# --- Wachten op de gezondheid -------------------------------------------------
log "Wachten op de healthcheck (max ${WACHT_SECONDEN}s)..."
STATUS="starting"
for ((i = 0; i < WACHT_SECONDEN; i += 2)); do
  STATUS="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "${APP_NAME}" 2>/dev/null || echo "onbekend")"
  case "${STATUS}" in
    healthy|running) break ;;
    unhealthy|exited|dead) break ;;
  esac
  sleep 2
done

IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
IP="${IP:-<unraid-ip>}"
case "${STATUS}" in
  healthy|running)
    ok "Rekenportal draait (${STATUS})"
    echo ""
    log "🌐 Open: http://${IP}:${PORT}/"
    log "📁 Data: ${DATA_DIR}"
    log "ℹ️  Beheer de container voortaan via de Docker-tab van Unraid."
    ;;
  *)
    fout "Container is niet gezond (status: ${STATUS}). Bekijk de logs: docker logs ${APP_NAME}"
    exit 1
    ;;
esac

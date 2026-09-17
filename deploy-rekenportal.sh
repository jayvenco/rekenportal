#!/bin/bash
# =============================================================================
# deploy-rekenportal.sh
# -----------------------------------------------------------------------------
# Unraid deployment script voor Rekenportal (GHCR image).
# + First-run: maakt appdata directory, pullt image, start container
# + Update: backup DB, pull nieuwe image, restart container, health check
#
# Gebruik:
#   curl -sL https://raw.githubusercontent.com/jayvenco/rekenportal/staging/deploy-rekenportal.sh | bash
#   # of: bash deploy-rekenportal.sh (naar Unraid gekopieerd)
# =============================================================================

set -euo pipefail

# --- Config ---
APP_NAME="rekenportal"
IMAGE="ghcr.io/jayvenco/rekenportal:staging"
APP_DIR="/mnt/user/appdata/${APP_NAME}"
LOCAL_PORT=8420
LOG="${APP_DIR}/deploy-$(date +%Y%m%d_%H%M%S).log"

# --- Kleuren voor output ---
ROOD='\033[0;31m'
GROEN='\033[0;32m'
GEEL='\033[1;33m'
BLAUW='\033[0;34m'
NC='\033[0m' # Geen kleur

log()   { echo -e "${BLAUW}[${APP_NAME}]${NC} $1"; }
ok()    { echo -e "${GROEN}  ✅ $1${NC}"; }
warn()  { echo -e "${GEEL}  ⚠️  $1${NC}"; }
fout()  { echo -e "${ROOD}  ❌ $1${NC}"; }

# --- Fase 0: opstarten ---
echo ""
echo -e "${BLAUW}═══════════════════════════════════════════════${NC}"
echo -e "${BLAUW}  ${APP_NAME} — Deploy${NC}"
echo -e "${BLAUW}  Image: ${IMAGE}${NC}"
echo -e "${BLAUW}═══════════════════════════════════════════════${NC}"
echo ""

# --- Fase 1: appdata directory ---
log "FASE 1/5: Appdata directory..."
mkdir -p "${APP_DIR}/data/backups"
ok "Directory ${APP_DIR} klaar"

# --- Fase 2: database backup (alleen bij update) ---
if [ -f "${APP_DIR}/data/rekenportal.db" ]; then
  log "FASE 2/5: Database backup..."
  BACKUP_FILE="${APP_DIR}/data/backups/rekenportal_$(date +%Y%m%d_%H%M%S).db"
  cp "${APP_DIR}/data/rekenportal.db" "${BACKUP_FILE}"
  ok "Backup: ${BACKUP_FILE}"
else
  log "FASE 2/5: Database backup overgeslagen (nieuwe installatie)"
fi

# --- Fase 3: image pullen ---
log "FASE 3/5: Image pullen van GHCR..."
docker pull "${IMAGE}" 2>&1 | tail -1
ok "Image gepulled"

# --- Fase 4: container starten/herstarten ---
log "FASE 4/5: Container starten..."

# Remove existing container (if any)
if docker ps -a --format '{{.Names}}' | grep -q "^${APP_NAME}\$"; then
  log "  Bestaande container wordt vervangen..."
  docker stop "${APP_NAME}" >/dev/null 2>&1 || true
  docker rm "${APP_NAME}" >/dev/null 2>&1 || true
  ok "Oude container verwijderd"
fi

docker run -d \
  --name "${APP_NAME}" \
  --restart unless-stopped \
  -p ${LOCAL_PORT}:8420 \
  -v "${APP_DIR}/data":/app/backend/data \
  "${IMAGE}" 2>&1

ok "Container gestart op poort ${LOCAL_PORT}"

# --- Fase 5: health check ---
log "FASE 5/5: Gezondheidscheck..."
sleep 3

HEALTH=$(curl -sf http://localhost:${LOCAL_PORT}/api/health 2>&1 || echo "FAIL")
if echo "${HEALTH}" | grep -q '"ok"'; then
  ok "Rekenportal draait en is gezond!"
  echo ""
  log "🌐 Open in browser: http://<unraid-ip>:${LOCAL_PORT}"
  log "📁 SQLite data: ${APP_DIR}/data/"
  log ""
else
  fout "Health check mislukt! Check logs met: docker logs ${APP_NAME}"
fi
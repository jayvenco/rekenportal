FROM python:3.11-slim

WORKDIR /app

# Backend
COPY backend/ ./backend/
# Frontend
COPY index.html ./
COPY css/ ./css/
COPY js/ ./js/

# Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Data volume voor SQLite
RUN mkdir -p /app/backend/data
VOLUME /app/backend/data

EXPOSE 8420

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8420/api/health').read()" || exit 1

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8420"]
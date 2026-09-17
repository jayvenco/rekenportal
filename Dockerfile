FROM python:3.11-slim

# Kopieer alles naar /app/
WORKDIR /app
COPY backend/ /app/backend/
COPY index.html /app/
COPY css/ /app/css/
COPY js/ /app/js/

# Python dependencies
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Draai vanuit /app/backend zodat import app.* werkt
WORKDIR /app/backend

# Data volume voor SQLite
RUN mkdir -p /app/backend/data
VOLUME /app/backend/data

EXPOSE 8420

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8420/api/health').read()" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8420"]
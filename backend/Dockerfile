FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

# Expose port
EXPOSE 8000

# Set standard environment defaults
ENV APP_ENV=production
ENV LOG_LEVEL=INFO
ENV MAX_REQUEST_TEXT_CHARS=200000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

FROM python:3.11-slim

WORKDIR /app

COPY lib/embedding-service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.2.2 \
    && pip install --no-cache-dir -r /app/requirements.txt

COPY lib/embedding-service /app

RUN useradd --create-home --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/health', timeout=4).read()"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

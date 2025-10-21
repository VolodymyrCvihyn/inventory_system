    FROM python:3.11-slim

    # Встановлюємо пакет tzdata, який містить інформацію про часові пояси
    RUN apt-get update && apt-get install -y tzdata
    
    # --- ЗМІНА ТУТ: Використовуємо сучасну назву ---
    ENV TZ=Europe/Kyiv

    ENV PYTHONDONTWRITEBYTECODE 1
    ENV PYTHONUNBUFFERED 1

    WORKDIR /app

    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt

    COPY . .

    # Ця команда залишається без змін
    CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]


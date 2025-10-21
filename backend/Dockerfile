FROM python:3.11-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Kyiv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо ВЕСЬ наш код (включно з entrypoint.sh)
COPY . .

# Робимо наш стартовий скрипт виконуваним
RUN chmod +x /entrypoint.sh

# --- ЗМІНА ТУТ: Вказуємо, що наш скрипт є точкою входу ---
ENTRYPOINT ["/entrypoint.sh"]
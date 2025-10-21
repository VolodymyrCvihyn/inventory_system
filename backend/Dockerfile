FROM python:3.11-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Kyiv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо наш стартовий скрипт всередину образу
COPY entrypoint.sh /entrypoint.sh
# Робимо його виконуваним
RUN chmod +x /entrypoint.sh

COPY . .

# Вказуємо Docker, що /entrypoint.sh є головним скриптом, який запускається
ENTRYPOINT ["/entrypoint.sh"]

# Видаляємо стару команду CMD, оскільки тепер запуск Gunicorn відбувається всередині entrypoint.sh


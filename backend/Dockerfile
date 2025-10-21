FROM python:3.11-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Kyiv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- ЗМІНИ ТУТ ---
# Копіюємо наш стартовий скрипт
COPY entrypoint.sh /entrypoint.sh
# Робимо його виконуваним
RUN chmod +x /entrypoint.sh

COPY . .

# Вказуємо Docker запускати наш скрипт
ENTRYPOINT ["/entrypoint.sh"]

# Команда, яка буде передана в скрипт (в змінну "$@")
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
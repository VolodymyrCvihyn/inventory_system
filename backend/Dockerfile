# Використовуємо офіційний базовий образ Python
FROM python:3.11-slim

# Встановлюємо робочу директорію
WORKDIR /app

# Встановлюємо необхідні системні залежності
# (Цей список може відрізнятися, але зазвичай потрібні для Python)
RUN apt-get update && apt-get install -y \
    gcc \
    # Додайте сюди будь-які інші системні залежності, якщо вони потрібні
    && rm -rf /var/lib/apt/lists/*

# Копіюємо requirements.txt та встановлюємо залежності
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо решту коду застосунку
COPY . /app/

# Запускаємо Django. CMD приймає команду як масив, що забезпечує правильне виконання.
# ЦЕ КРИТИЧНО: Ми використовуємо ["bash", "-c", "КОМАНДА"], щоб Render міг виконати
# послідовність команд (з &&) і використовувати змінну $PORT.
CMD ["bash", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:$PORT core.wsgi:application"]

# Змінна $PORT буде надана Render автоматично
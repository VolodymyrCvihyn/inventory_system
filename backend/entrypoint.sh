#!/bin/sh

# Встановлюємо порт зі змінної середовища PORT, або 8000, якщо її немає (для локального Docker)
PORT="${PORT:-8000}"

# Застосовуємо міграції бази даних
echo "Applying database migrations..."
python manage.py migrate

# Створюємо початкового суперадміністратора (якщо він ще не існує)
echo "Creating initial superuser..."
python manage.py create_initial_superuser

# Запускаємо Gunicorn на правильному порту
echo "Starting Gunicorn server on port $PORT..."
exec gunicorn --bind "0.0.0.0:$PORT" core.wsgi:application

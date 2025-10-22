#!/bin/sh

# Виконуємо міграції бази даних
echo "Applying database migrations..."
python manage.py migrate --noinput

# Створюємо початкового суперадміністратора (тільки якщо він не існує)
echo "Creating initial superuser..."
python manage.py create_initial_superuser --noinput || echo "Superuser already exists or env vars not set."

# Запускаємо Gunicorn. $PORT буде автоматично переданий від Render.
# Якщо $PORT не встановлено, використовуємо 10000 за замовчуванням (стандарт Render).
PORT="${PORT:-10000}"
echo "Starting Gunicorn server on port $PORT..."
# `exec` замінює процес скрипта на процес gunicorn, що є правильним для Docker
exec gunicorn --bind "0.0.0.0:$PORT" core.wsgi:application
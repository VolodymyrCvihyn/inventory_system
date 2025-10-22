#!/bin/sh

# Виконуємо міграції бази даних
echo "Applying database migrations..."
python manage.py migrate --noinput # Додаємо --noinput для надійності

# Створюємо початкового суперадміністратора (тільки якщо він не існує)
# Використовуємо --noinput та змінні середовища
echo "Creating initial superuser..."
python manage.py create_initial_superuser --noinput || echo "Superuser already exists or env vars not set."

# Запускаємо Gunicorn. $PORT буде автоматично переданий від Render.
# Якщо $PORT не встановлено, використовуємо 8000 за замовчуванням.
PORT="${PORT:-8000}"
echo "Starting Gunicorn server on port $PORT..."
exec gunicorn --bind "0.0.0.0:$PORT" core.wsgi:application
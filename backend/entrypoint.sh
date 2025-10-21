#!/bin/sh

# Виконуємо міграції бази даних
echo "Applying database migrations..."
python manage.py migrate

# Створюємо початкового суперадміністратора (тільки якщо він не існує)
echo "Creating initial superuser..."
python manage.py create_initial_superuser

# Запускаємо Gunicorn. Змінна $PORT буде автоматично передана від Render.
echo "Starting Gunicorn server on port $PORT..."
exec gunicorn --bind "0.0.0.0:$PORT" core.wsgi:application
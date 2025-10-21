#!/bin/sh

# Застосовуємо міграції бази даних
echo "Applying database migrations..."
python manage.py migrate

# Створюємо початкового суперадміністратора (якщо він ще не існує)
echo "Creating initial superuser..."
python manage.py create_initial_superuser

# Запускаємо основний процес (веб-сервер Gunicorn)
exec "$@"
#!/bin/sh

# Жорстко вказуємо порт 8000, який Render очікує для перевірки
echo "Starting Gunicorn server on port 8000..."
exec gunicorn --bind "0.0.0.0:8000" core.wsgi:application
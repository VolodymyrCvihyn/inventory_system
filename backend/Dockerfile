# backend/Dockerfile (остаточна версія)
FROM python:3.11-slim
WORKDIR /app
# ... (встановлення системних залежностей)

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/


# Залишити порожнім, оскільки ми використовуємо "Docker Command" на Render
# CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "core.wsgi:application"]
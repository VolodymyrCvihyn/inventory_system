FROM python:3.11-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Kyiv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Ця змінна буде автоматично ПЕРЕЗАПИСАНА Render (зазвичай на 10000)
ENV PORT 10000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# --- ЗМІНА ТУТ: Гарантовано використовуємо $PORT ---
# Gunicorn тепер буде запускатися на порту, який вкаже Render
CMD python manage.py migrate && python manage.py create_initial_superuser && gunicorn --bind "0.0.0.0:$PORT" core.wsgi:application
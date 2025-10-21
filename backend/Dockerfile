FROM python:3.11-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Kyiv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Ця змінна буде автоматично підхоплена Render
ENV PORT 10000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Вся логіка запуску в одній команді
CMD python manage.py migrate && python manage.py create_initial_superuser && gunicorn --bind "0.0.0.0:$PORT" core.wsgi:application
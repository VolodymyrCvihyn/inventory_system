FROM python:3.11-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Kyiv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Ця змінна буде автоматично ПЕРЕЗАПИСАНА Render
ENV PORT 10000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Вся логіка запуску в одній команді, використовуємо змінну $PORT
CMD python manage.py migrate && python manage.py create_initial_superuser && gunicorn --bind "0.0.0.0:$PORT" core.wsgi:application
```

### ## Наступні кроки

1.  **Збережіть** зміни у `backend/Dockerfile`.
2.  **Завантажте зміни на GitHub:**
    ```bash
    git add .
    git commit -m "Remove extraneous line from Dockerfile"
    git push
    


FROM python:3.11-slim

RUN apt-get update && apt-get install -y tzdata
ENV TZ=Europe/Kyiv

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Ця змінна більше не потрібна, бо ми вкажемо порт жорстко
# ENV PORT 10000 

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# --- ЗМІНА ТУТ: Жорстко вказуємо порт 10000 ---
# Gunicorn тепер буде запускатися саме на порту 10000
CMD python manage.py migrate && python manage.py create_initial_superuser && gunicorn --bind "0.0.0.0:10000" core.wsgi:application
```

### ## Наступні кроки

1.  **Збережіть** зміни у `backend/Dockerfile`.
2.  **Завантажте зміни на GitHub:**
    ```bash
    git add .
    git commit -m "Force Gunicorn to bind to port 10000 for Render"
    git push
    


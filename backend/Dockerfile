# backend/Dockerfile

# Використовуємо офіційний образ Python 3.11 на базі Debian Slim (менший розмір)
FROM python:3.11-slim

# Встановлюємо робочу директорію всередині контейнера
WORKDIR /app

# Встановлюємо системні залежності, необхідні для компіляції деяких Python-пакетів (наприклад, psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    # Якщо ви використовуєте PostgreSQL, може знадобитися libpq-dev
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копіюємо файл залежностей та встановлюємо їх
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо решту коду застосунку у робочу директорію
COPY . /app/

# НІЯКОГО CMD чи ENTRYPOINT! 
# Це КРИТИЧНО: ми залишаємо цей файл без команди запуску. 
# Команду запуску (migrate, collectstatic, gunicorn) ми повністю 
# контролюємо в полі "Docker Command" на Render для максимальної надійності.
# Етап 1: Збірка React-додатку (без змін)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Етап 2: Створення сервера на Nginx з автогенерацією сертифіката
FROM nginx:1.25-alpine

# --- ЗМІНИ ТУТ ---
# 1. Встановлюємо openssl всередині контейнера
RUN apk add --no-cache openssl

# 2. Створюємо папку для сертифікатів
RUN mkdir -p /etc/nginx/ssl

# 3. Генеруємо самопідписаний сертифікат прямо всередині образу
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/localhost.key \
    -out /etc/nginx/ssl/localhost.crt \
    -subj "/C=UA/ST=Lviv/L=Lviv/O=InventoryApp/OU=Dev/CN=localhost"

# Копіюємо зібрані файли з першого етапу
COPY --from=builder /app/build /usr/share/nginx/html
# Видаляємо стандартну конфігурацію Nginx
RUN rm /etc/nginx/conf.d/default.conf
# Копіюємо нашу власну конфігурацію
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]

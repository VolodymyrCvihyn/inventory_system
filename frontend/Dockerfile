# frontend/Dockerfile
# Етап 1: Збірка React-додатку (без змін)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Етап 2: Створення сервера на Nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
# --- ЗМІНА ТУТ: Залишаємо тільки порт 80 ---
EXPOSE 80 
CMD ["nginx", "-g", "daemon off;"]
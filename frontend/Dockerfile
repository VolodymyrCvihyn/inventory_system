# frontend/Dockerfile
# Етап 1: Збірка React-додатку
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps 
COPY . .
RUN npm run build

# Етап 2: Створення сервера на Nginx
FROM nginx:1.25-alpine

# --- ЗМІНА ТУТ: Встановлюємо кореневі сертифікати ---
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf 
EXPOSE 80 
CMD ["nginx", "-g", "daemon off;"]
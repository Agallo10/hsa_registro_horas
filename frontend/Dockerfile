# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime (nginx) ----------
FROM nginx:1.27-alpine

# Valores por defecto (se pueden sobrescribir por variables de entorno)
ENV FRONTEND_PORT=81
ENV BACKEND_URL=http://backend:3000
ENV API_URL=/api

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.d/40-config-js.sh /docker-entrypoint.d/40-config-js.sh
RUN chmod +x /docker-entrypoint.d/40-config-js.sh

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 81

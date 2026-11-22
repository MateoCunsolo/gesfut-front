# Multi-stage para Easypanel: build de Angular en el subfolder gesfut/
# y nginx sirve el dist. Un solo origen: /api se proxea al back (hace falta para el XSRF).
# BACKEND_URL se configura en runtime (sin secretos y sin ARG; Easypanel pasa el env como build args).
FROM node:lts-bookworm-slim AS build
WORKDIR /src
COPY gesfut/package.json gesfut/package-lock.json ./
RUN npm ci
COPY gesfut/ ./
RUN npm run build -- --configuration production

FROM nginx:stable-alpine
# Default razonable: nombre interno del servicio back en Easypanel. Sobreescribir en runtime si el servicio se llama distinto.
ENV BACKEND_URL=http://gesfut-back:8080
# El filtro ^BACKEND_URL$ se exporta en 15-gesfut-envsubst-filter.envsh (BuildKit se come un $ de un ENV).
COPY --chmod=755 nginx/15-gesfut-envsubst-filter.envsh /docker-entrypoint.d/15-gesfut-envsubst-filter.envsh
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /src/dist/gesfut/browser /usr/share/nginx/html
EXPOSE 80

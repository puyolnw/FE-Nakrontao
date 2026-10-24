# syntax=docker/dockerfile:1.7
FROM node:22.18-alpine AS build
WORKDIR /web
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build && node scripts/caddyfile.mjs

FROM caddy:2.10-alpine
COPY --from=build /web/build /srv
COPY --from=build /web/Caddyfile /etc/caddy/Caddyfile
# PORT is provided by the host (Railway); API_URL points at the backend service.
ENV PORT=8080 API_URL=http://127.0.0.1:18080
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]

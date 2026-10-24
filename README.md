# เจ้าพ่อศรีนครเตา — Frontend (SvelteKit SPA)

Thai / Chinese / English faith-tourism site. It builds to static files that Caddy serves; Caddy also
forwards `/api` and `/uploads` to the backend ([BE-Nakrontao](https://github.com/puyolnw/BE-Nakrontao)),
so the browser talks to a single origin (cookies and CSP stay strict, no CORS).

## Develop

```bash
npm ci
API_URL=http://127.0.0.1:18080 npm run dev   # Vite proxies /api and /uploads to API_URL
npm run check
```

## Deploy on Railway

1. Add this repo as a service; it builds from `Dockerfile` (Node build, then Caddy). Railway injects `PORT`.
2. Set `API_URL` to the backend, e.g. `http://be-nakrontao.railway.internal:8080` on the private network.
3. Give this service the public domain.

The page CSP is generated at build time (`scripts/caddyfile.mjs`) from the hashes of the inline bootstrap
scripts, so no `'unsafe-inline'` is needed for scripts.

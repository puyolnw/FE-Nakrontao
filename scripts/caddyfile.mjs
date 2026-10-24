// Writes the Caddyfile for the production image. The page CSP allows the SvelteKit bootstrap by the
// SHA-256 of each inline <script> in build/index.html, so no 'unsafe-inline' is needed for scripts.
// Runtime settings stay in env: PORT (set by Railway) and API_URL (the backend, e.g. a private URL).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('build/index.html', 'utf8');
const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
	.map((m) => `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`)
	.join(' ');

const csp = [
	"default-src 'self'",
	"img-src 'self' data: https:",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	'frame-src https://www.youtube-nocookie.com',
	"connect-src 'self'",
	"object-src 'none'",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	'upgrade-insecure-requests',
	`script-src 'self' ${hashes}`
].join('; ');

const caddyfile = `{
	admin off
	auto_https off
	servers {
		# Railway's edge sits in front; take the client address from X-Forwarded-For, right to left.
		trusted_proxies static 0.0.0.0/0 ::/0
		trusted_proxies_strict
	}
}

:{$PORT:8080} {
	encode zstd gzip
	request_body {
		max_size 10MB
	}
	header {
		-Server
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
		X-Frame-Options DENY
		Strict-Transport-Security "max-age=63072000; includeSubDomains"
		Permissions-Policy "geolocation=(self), camera=(), microphone=(), payment=(), usb=()"
		Cross-Origin-Opener-Policy same-origin
		X-Permitted-Cross-Domain-Policies none
	}

	# The API answers with its own headers; the browser only ever sees this one origin.
	@backend path /api/* /uploads/*
	handle @backend {
		reverse_proxy {$API_URL} {
			header_up Host {upstream_hostport}
		}
	}

	handle {
		root * /srv
		@immutable path /_app/immutable/*
		header @immutable Cache-Control "public, max-age=31536000, immutable"
		@sw path /sw.js
		header @sw Cache-Control no-cache
		header Content-Security-Policy "${csp}"
		try_files {path} /index.html
		file_server
	}
}
`;

writeFileSync('Caddyfile', caddyfile);
console.log('Caddyfile written with', hashes.split(' ').length, 'script hash(es)');

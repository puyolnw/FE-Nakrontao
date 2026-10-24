// Minimal offline support. App shell and hashed assets are cached; API responses are never cached
// (content must stay fresh, and admin data must not persist on shared devices).
const CACHE = 'snt-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (e) => {
	const req = e.request;
	const url = new URL(req.url);
	if (req.method !== 'GET' || url.origin !== location.origin) return;
	if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;

	// Hashed build output never changes: cache first.
	if (url.pathname.startsWith('/_app/immutable/')) {
		e.respondWith(
			caches.match(req).then(
				(hit) =>
					hit ||
					fetch(req).then((res) => {
						const copy = res.clone();
						if (res.ok) caches.open(CACHE).then((c) => c.put(req, copy));
						return res;
					})
			)
		);
		return;
	}

	// Pages: network first, fall back to the cached shell when offline.
	if (req.mode === 'navigate') {
		e.respondWith(fetch(req).catch(() => caches.match('/')));
	}
});

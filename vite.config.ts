import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const api = process.env.API_URL ?? 'http://127.0.0.1:18080';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Single-page app served by the Go binary; index.html is the fallback for every route.
			adapter: adapter({ fallback: 'index.html', strict: false })
		})
	],
	server: {
		proxy: {
			'/api': api,
			'/uploads': api
		}
	}
});

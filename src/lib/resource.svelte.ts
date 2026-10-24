import { api } from './api';

/** Loads JSON once per URL change and exposes loading/error state for templates. */
export function resource<T>(url: () => string | null) {
	const state = $state<{ data: T | null; error: string | null; loading: boolean }>({
		data: null,
		error: null,
		loading: true
	});
	$effect(() => {
		const u = url();
		if (!u) return;
		let cancelled = false;
		state.loading = true;
		state.error = null;
		api
			.get<T>(u)
			.then((d) => {
				if (!cancelled) state.data = d;
			})
			.catch((e: Error) => {
				if (!cancelled) state.error = e.message;
			})
			.finally(() => {
				if (!cancelled) state.loading = false;
			});
		return () => {
			cancelled = true;
		};
	});
	return state;
}

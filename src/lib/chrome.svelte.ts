import { untrack } from 'svelte';

// Pages that open with a full-bleed photo register here so the header can sit transparently on top.
export const chrome = $state({ overPhoto: 0 });

/** Call from a component's script; returns the cleanup for $effect. */
export function useOverPhoto() {
	$effect(() => {
		// `++` reads the counter too; untracked so the effect does not re-run on its own write.
		untrack(() => chrome.overPhoto++);
		return () => {
			untrack(() => chrome.overPhoto--);
		};
	});
}

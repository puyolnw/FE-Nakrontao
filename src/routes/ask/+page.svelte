<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { openChat } from '#lib/chat.svelte.ts';

	// The assistant is a floating panel on every page now. Old /ask links and bookmarks open it on the
	// home page, asking the ?q= question if one was given.
	onMount(() => {
		const q = page.url.searchParams.get('q') ?? '';
		goto('/', { replaceState: true }).then(() => openChat(q));
	});
</script>

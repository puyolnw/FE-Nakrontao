<script lang="ts">
	// Incense smoke: soft blurred plumes that rise, sway and fade. Pure CSS.
	let { plumes = 5 }: { plumes?: number } = $props();
</script>

<div class="smoke" aria-hidden="true">
	{#each Array.from({ length: plumes }, (_, i) => i) as i (i)}
		<span style:--i={i} style:--x="{10 + ((i * 37) % 80)}%"></span>
	{/each}
</div>

<style>
	.smoke {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}
	span {
		position: absolute;
		bottom: -20%;
		left: var(--x);
		width: 38vmin;
		height: 38vmin;
		border-radius: 50%;
		background: radial-gradient(circle, rgb(251 246 238 / 0.16), transparent 65%);
		filter: blur(30px);
		animation: rise calc(14s + var(--i) * 3s) ease-in infinite;
		animation-delay: calc(var(--i) * -4s);
	}
	@keyframes rise {
		0% {
			transform: translate(0, 0) scale(0.6);
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		50% {
			transform: translate(6vw, -55vh) scale(1.2);
		}
		100% {
			transform: translate(-4vw, -120vh) scale(1.8);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		span {
			animation: none;
			opacity: 0.4;
		}
	}
</style>

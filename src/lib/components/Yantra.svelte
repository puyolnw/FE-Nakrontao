<script lang="ts">
	// Sacred-geometry wheel. It eases in and turns as one composited layer: animating the SVG's inner
	// layers (rotation, opacity, assembly) repainted the whole wheel every frame and made scrolling stutter.
	import { gsap } from 'gsap';

	let { size = '520px', speed = 1, text = '✦ ศรัทธา ✦ สักการะ ✦ ขอพร ✦ 祈福 ✦ 平安 ✦ 吉祥 ' }: { size?: string; speed?: number; text?: string } = $props();

	const uid = `y${Math.random().toString(36).slice(2, 8)}`;
	const ring = (n: number) => Array.from({ length: n }, (_, i) => (360 / n) * i);
	// [seconds per turn, direction, pointer depth]
	const L = {
		halo: [180, 1, 4],
		textRing: [120, -1, 7],
		diamonds: [70, 1, 10],
		petalsOuter: [90, -1, 14],
		petalsInner: [55, 1, 18],
		squareA: [45, 1, 22],
		squareB: [45, -1, 22],
		star: [30, 1, 28],
		rays: [20, -1, 32],
		core: [0, 1, 36]
	} as const;
	const dur = (k: keyof typeof L) => `${L[k][0] / speed}s`;
	const dir = (k: keyof typeof L) => (L[k][1] === 1 ? 'normal' : 'reverse');

	let svg: SVGSVGElement;
	$effect(() => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) return;
		// Fade the whole wheel in (the slow turn is CSS); animating each SVG layer repainted it every frame.
		gsap.set(svg, { opacity: 0 });
		const io = new IntersectionObserver(
			([e]) => {
				if (!e.isIntersecting) return;
				gsap.to(svg, { opacity: 1, duration: 1.2, ease: 'power2.out' });
				io.disconnect();
			},
			{ threshold: 0.2 }
		);
		io.observe(svg);
		return () => io.disconnect();
	});
</script>

<svg bind:this={svg} class="yantra" viewBox="-210 -210 420 420" style:width={size} aria-hidden="true">
	<defs>
		<linearGradient id="{uid}-g" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#fff1c2" />
			<stop offset="0.45" stop-color="#d4a341" />
			<stop offset="1" stop-color="#f6d88b" />
		</linearGradient>
		<radialGradient id="{uid}-core">
			<stop offset="0" stop-color="#fff6d6" />
			<stop offset="0.45" stop-color="#f1c66a" />
			<stop offset="1" stop-color="#b8862f" stop-opacity="0" />
		</radialGradient>
		<path id="{uid}-ring" d="M0,-168 a168,168 0 1,1 0,336 a168,168 0 1,1 0,-336" />
	</defs>

	<g stroke="url(#{uid}-g)" fill="none">
		<!-- 1 · halo: dotted outer rings -->
		<g class="depth" data-d={L.halo[2]}><g class="enter"><g class="spin" style:animation-duration={dur('halo')} style:animation-direction={dir('halo')}>
			<circle r="200" stroke-width="0.6" stroke-dasharray="1 7" />
			<circle r="190" stroke-width="1" />
			{#each ring(4) as a (a)}<circle cx="0" cy="-200" r="3" fill="url(#{uid}-g)" transform="rotate({a})" />{/each}
		</g></g></g>

		<!-- 2 · inscribed text -->
		<g class="depth" data-d={L.textRing[2]}><g class="enter"><g class="spin" style:animation-duration={dur('textRing')} style:animation-direction={dir('textRing')}>
			<text class="ring-text" fill="url(#{uid}-g)" stroke="none"><textPath href="#{uid}-ring">{text.repeat(3)}</textPath></text>
			<circle r="156" stroke-width="0.8" />
		</g></g></g>

		<!-- 3 · ring of diamonds -->
		<g class="depth" data-d={L.diamonds[2]}><g class="enter"><g class="spin" style:animation-duration={dur('diamonds')} style:animation-direction={dir('diamonds')}>
			{#each ring(24) as a, i (a)}
				<path d="M0,-148 L4,-142 L0,-136 L-4,-142 Z" fill={i % 3 === 0 ? `url(#${uid}-g)` : 'none'} stroke-width="0.8" transform="rotate({a})" />
			{/each}
		</g></g></g>

		<!-- 4 · outer lotus petals -->
		<g class="depth" data-d={L.petalsOuter[2]}><g class="enter"><g class="spin" style:animation-duration={dur('petalsOuter')} style:animation-direction={dir('petalsOuter')}>
			{#each ring(16) as a (a)}
				<path class="petal" d="M0,-130 C22,-108 22,-84 0,-66 C-22,-84 -22,-108 0,-130 Z" stroke-width="0.9" transform="rotate({a})" />
			{/each}
		</g></g></g>

		<!-- 5 · inner lotus petals, offset half a step -->
		<g class="depth" data-d={L.petalsInner[2]}><g class="enter"><g class="spin" style:animation-duration={dur('petalsInner')} style:animation-direction={dir('petalsInner')}>
			<circle r="66" stroke-width="0.8" />
			{#each ring(8) as a (a)}
				<path d="M0,-104 C16,-90 16,-74 0,-66 C-16,-74 -16,-90 0,-104 Z" stroke-width="1" transform="rotate({a + 22.5})" />
			{/each}
		</g></g></g>

		<!-- 6 · two squares turning against each other -->
		<g class="depth" data-d={L.squareA[2]}><g class="enter"><g class="spin" style:animation-duration={dur('squareA')} style:animation-direction={dir('squareA')}>
			<rect x="-60" y="-60" width="120" height="120" stroke-width="1" />
		</g></g></g>
		<g class="depth" data-d={L.squareB[2]}><g class="enter"><g class="spin" style:animation-duration={dur('squareB')} style:animation-direction={dir('squareB')}>
			<rect x="-60" y="-60" width="120" height="120" stroke-width="1" transform="rotate(45)" />
		</g></g></g>

		<!-- 7 · eight-point star -->
		<g class="depth" data-d={L.star[2]}><g class="enter"><g class="spin" style:animation-duration={dur('star')} style:animation-direction={dir('star')}>
			<circle r="46" stroke-width="0.8" />
			<path d="M0,-46 L10,-14 L44,-14 L16,6 L27,38 L0,18 L-27,38 L-16,6 L-44,-14 L-10,-14 Z" stroke-width="0.9" transform="rotate(18)" />
			<path d="M0,-46 L10,-14 L44,-14 L16,6 L27,38 L0,18 L-27,38 L-16,6 L-44,-14 L-10,-14 Z" stroke-width="0.6" opacity="0.6" transform="rotate(54)" />
		</g></g></g>

		<!-- 8 · rays -->
		<g class="depth" data-d={L.rays[2]}><g class="enter"><g class="spin" style:animation-duration={dur('rays')} style:animation-direction={dir('rays')}>
			{#each ring(12) as a (a)}<line class="ray" x1="0" y1="-14" x2="0" y2="-30" stroke-width="1.2" transform="rotate({a})" />{/each}
		</g></g></g>

		<!-- 9 · glowing core -->
		<g class="depth" data-d={L.core[2]}><g class="enter">
			<circle class="glow" r="22" fill="url(#{uid}-core)" stroke="none" />
			<circle r="7" fill="url(#{uid}-g)" stroke="none" />
		</g></g>

		<!-- 10 · sparks on their own orbits -->
		{#each [[178, 26], [118, 18], [84, 13]] as [r, s], i (i)}
			<g class="orbit" style:animation-duration="{s / speed}s" style:animation-direction={i % 2 ? 'reverse' : 'normal'}>
				<circle cx="0" cy={-r} r="2.6" fill="#fff1c2" stroke="none" class="spark" />
			</g>
		{/each}
	</g>
</svg>

<style>
	.yantra {
		display: block;
		max-width: 100%;
		height: auto;
		overflow: visible;
		filter: drop-shadow(0 0 16px rgb(233 190 98 / 0.35));
	}
	/* Every layer is drawn around user-space (0,0), the wheel's centre: rotate about exactly
	   that point. (fill-box would use each layer's bounding box, which is off-centre for
	   asymmetric shapes such as the star.) */
	.spin,
	.orbit {
		transform-box: view-box;
		transform-origin: 0 0;
		animation-name: turn;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}
	@keyframes turn {
		to {
			transform: rotate(360deg);
		}
	}
	.petal {
		animation: breathe 6s ease-in-out infinite;
	}
	@keyframes breathe {
		50% {
			stroke-opacity: 0.45;
		}
	}
	.ray {
		animation: flick 2.4s ease-in-out infinite;
	}
	@keyframes flick {
		50% {
			stroke-opacity: 0.25;
		}
	}
	.glow {
		transform-box: fill-box;
		transform-origin: center;
		animation: pulse 3.2s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			transform: scale(1.35);
			opacity: 0.7;
		}
	}
	.spark {
		filter: drop-shadow(0 0 6px #ffe7a0);
	}
	.ring-text {
		font: 13px var(--font-head);
		letter-spacing: 2px;
	}
	@media (prefers-reduced-motion: reduce) {
		.spin,
		.orbit,
		.petal,
		.ray,
		.glow {
			animation: none;
		}
	}
	/* Inner layers stay still; the wheel turns as a whole on the compositor. */
	.spin,
	.orbit,
	.petal,
	.ray,
	.glow {
		animation: none;
	}
	.yantra {
		animation: turn 240s linear infinite;
		will-change: transform;
	}
	@media (prefers-reduced-motion: reduce) {
		.yantra {
			animation: none;
		}
	}
</style>

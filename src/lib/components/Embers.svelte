<script lang="ts">
	// Gold dust and candle embers drifting upward. Canvas, ~60 particles, paused when off-screen
	// or when the visitor prefers reduced motion.
	let { count = 60, color = '233,190,98' }: { count?: number; color?: string } = $props();
	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		// Phones and low-end devices: no particles at all (battery, and the text matters more).
		if (matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		let w = 0;
		let h = 0;
		// Soft dots need no retina detail; a 1x canvas is a quarter of the pixels to clear and blend.
		const dpr = 1;
		// One pre-drawn glow per colour, stamped with drawImage: no gradient objects per particle per frame.
		const sprite = (rgb: string) => {
			const c = document.createElement('canvas');
			c.width = c.height = 32;
			const g = c.getContext('2d')!;
			const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
			grad.addColorStop(0, `rgba(${rgb},1)`);
			grad.addColorStop(1, `rgba(${rgb},0)`);
			g.fillStyle = grad;
			g.fillRect(0, 0, 32, 32);
			return c;
		};
		const gold = sprite(color);
		const ember = sprite('255,122,46');
		const resize = () => {
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(canvas);

		type P = { x: number; y: number; r: number; vy: number; vx: number; a: number; t: number; ember: boolean };
		const spawn = (initial = false): P => ({
			x: Math.random() * w,
			y: initial ? Math.random() * h : h + 10,
			r: Math.random() * 1.8 + 0.4,
			vy: Math.random() * 0.5 + 0.15,
			vx: (Math.random() - 0.5) * 0.25,
			a: Math.random() * 0.6 + 0.25,
			t: Math.random() * Math.PI * 2,
			ember: Math.random() < 0.18
		});
		const ps: P[] = Array.from({ length: count }, () => spawn(true));

		let visible = true;
		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
		io.observe(canvas);

		let raf = 0;
		let lastT = 0;
		const frame = (t: number) => {
			raf = requestAnimationFrame(frame);
			// ~30 fps is plenty for slow drifting dust and halves the work while scrolling.
			if (!visible || t - lastT < 32) return;
			lastT = t;
			ctx.clearRect(0, 0, w, h);
			for (const p of ps) {
				p.t += 0.06;
				p.y -= p.vy * 2;
				p.x += p.vx * 2 + Math.sin(p.t) * 0.4;
				if (p.y < -10) Object.assign(p, spawn());
				const flicker = 0.6 + Math.sin(p.t * 3) * 0.4;
				ctx.globalAlpha = Math.max(0, p.a * flicker * Math.min(1, p.y / (h * 0.25)));
				const d = p.r * 12;
				ctx.drawImage(p.ember ? ember : gold, p.x - d / 2, p.y - d / 2, d, d);
			}
			ctx.globalAlpha = 1;
		};
		raf = requestAnimationFrame(frame);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>

// Motion system: GSAP ScrollTrigger on native scrolling, plus Svelte actions
// for the reveal / parallax / text effects used across the site.
// Every effect is skipped when the visitor asks for reduced motion.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Trigger positions are measured once; content that loads later (API data, images) moves them.
// Re-measure whenever the page height changes so sections reveal when they are actually on screen.
let heightWatch: ResizeObserver | null = null;
function watchHeight() {
	if (heightWatch) return;
	let t: ReturnType<typeof setTimeout>;
	let last = 0;
	heightWatch = new ResizeObserver(() => {
		const h = document.body.scrollHeight;
		if (Math.abs(h - last) < 2) return;
		last = h;
		clearTimeout(t);
		t = setTimeout(() => ScrollTrigger.refresh(), 120);
	});
	heightWatch.observe(document.body);
	addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/** Keeps scroll-linked animations measured against the live page. Scrolling itself stays native. */
export function startSmoothScroll() {
	watchHeight();
	return () => {};
}

export function scrollTop() {
	window.scrollTo(0, 0);
}

export function refreshTriggers() {
	requestAnimationFrame(() => ScrollTrigger.refresh());
}

/**
 * Play `start` once when `el` actually enters the viewport. IntersectionObserver is evaluated by the
 * browser against live layout, so late-loading content, breakpoints and pinned sections can never
 * leave an element waiting off-cue the way pre-measured ScrollTrigger positions can.
 */
function whenVisible(el: Element, start: () => void) {
	const io = new IntersectionObserver(
		(entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				io.disconnect();
				start();
			}
		},
		{ rootMargin: '0px 0px -4% 0px' }
	);
	io.observe(el);
	return () => io.disconnect();
}

/** Headline settles in. Text is never split or hidden for long, so it can be read at once. */
export function splitReveal(el: HTMLElement, opts: { delay?: number; scroll?: boolean } = {}) {
	return reveal(el, { y: 16, delay: opts.delay });
}

/** Kept for call sites: long statements stay fully legible, so this only does a gentle reveal. */
export function scrubText(el: HTMLElement) {
	return reveal(el, { y: 12 });
}

/** Short fade + lift when the element (or each of its children) enters view. */
export function reveal(el: HTMLElement, opts: { children?: boolean; y?: number; delay?: number } = {}) {
	if (reduced()) return {};
	// Anything already on screen at load is simply shown: the first view must never be empty.
	if (el.getBoundingClientRect().top < innerHeight * 0.9) return {};
	const targets = opts.children ? Array.from(el.children) : [el];
	const tween = gsap.from(targets, {
		y: opts.y ?? 14,
		duration: 0.4,
		ease: 'power2.out',
		stagger: 0.04,
		delay: Math.min(opts.delay ?? 0, 0.15),
		paused: true
	});
	const stop = whenVisible(el, () => tween.play());
	// Safety net: if the observer never fires (fast jumps, hidden tabs, odd layouts), show it anyway.
	const late = setTimeout(() => tween.progress() === 0 && tween.play(), 2500);
	return { destroy: () => (stop(), clearTimeout(late), tween.kill()) };
}

/** Image wipes in from a clipped inset. */
export function clipReveal(el: HTMLElement) {
	if (reduced()) return {};
	const tween = gsap.fromTo(
		el,
		{ clipPath: 'inset(18% 18% 18% 18% round 32px)' },
		{ clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 35%', scrub: true } }
	);
	return { destroy: () => tween.scrollTrigger?.kill() };
}

/** Moves the element at a different speed from the page while scrolling. */
export function parallax(el: HTMLElement, speed = 0.2) {
	if (reduced()) return {};
	const tween = gsap.to(el, {
		yPercent: speed * 100,
		ease: 'none',
		scrollTrigger: { trigger: el.parentElement ?? el, start: 'top top', end: 'bottom top', scrub: true }
	});
	return { destroy: () => tween.scrollTrigger?.kill() };
}

/** Pins a section and scrolls its track sideways (desktop only). */
export function horizontal(el: HTMLElement) {
	if (reduced()) return {};
	const mm = gsap.matchMedia();
	mm.add('(min-width: 900px)', () => {
		const track = el.querySelector<HTMLElement>('[data-track]');
		if (!track) return;
		const distance = () => track.scrollWidth - el.clientWidth + 64;
		gsap.to(track, {
			x: () => -distance(),
			ease: 'none',
			scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, scrub: 0.6, pin: true, invalidateOnRefresh: true }
		});
	});
	return { destroy: () => mm.revert() };
}

/** Card spotlight: a soft glow follows the pointer (reads --mx/--my in CSS). */
export function spotlight(el: HTMLElement) {
	const move = (e: PointerEvent) => {
		const r = el.getBoundingClientRect();
		el.style.setProperty('--mx', `${e.clientX - r.left}px`);
		el.style.setProperty('--my', `${e.clientY - r.top}px`);
	};
	el.addEventListener('pointermove', move);
	return { destroy: () => el.removeEventListener('pointermove', move) };
}

/** Counts up to the element's numeric content when it scrolls into view. */
export function ticker(el: HTMLElement, value: number) {
	if (reduced()) {
		el.textContent = value.toLocaleString();
		return {};
	}
	const obj = { v: 0 };
	const tween = gsap.to(obj, {
		v: value,
		duration: 1.6,
		ease: 'power2.out',
		onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString()),
		scrollTrigger: { trigger: el, start: 'top 90%' }
	});
	return {
		update(v: number) {
			tween.vars.v = v;
			tween.invalidate().restart();
		},
		destroy: () => tween.scrollTrigger?.kill()
	};
}

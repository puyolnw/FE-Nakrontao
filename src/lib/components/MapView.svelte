<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import type { Map as LMap, LayerGroup } from 'leaflet';

	import type { Pin } from '#lib/types.ts';
	import { t } from '#lib/i18n.svelte.ts';
	let { pins, line = false, height = '360px' }: { pins: Pin[]; line?: boolean; height?: string } = $props();

	let el: HTMLDivElement;
	let map: LMap | null = null;
	let layer: LayerGroup | null = null;
	let L: typeof import('leaflet') | null = null;

	const colors = () => {
		const s = getComputedStyle(document.documentElement);
		return { accent: s.getPropertyValue('--accent').trim(), fg: s.getPropertyValue('--fg').trim(), date: s.getPropertyValue('--date').trim() };
	};

	$effect(() => {
		let disposed = false;
		// Tiles are laid out for the size at creation; re-measure when the box changes (fonts, reveals, breakpoints).
		const ro = new ResizeObserver(() => map?.invalidateSize());
		ro.observe(el);
		import('leaflet').then((mod) => {
			if (disposed) return;
			L = mod;
			map = L.map(el, { scrollWheelZoom: false, attributionControl: true, zoomAnimation: false, fadeAnimation: false });
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
			map.attributionControl.setPrefix(false);
			layer = L.layerGroup().addTo(map);
			draw();
		});
		return () => {
			disposed = true;
			ro.disconnect();
			map?.remove();
			map = null;
		};
	});

	$effect(() => {
		pins;
		draw();
	});

	function draw() {
		if (!map || !L || !layer) return;
		layer.clearLayers();
		const c = colors();
		void c;
		const pts: [number, number][] = [];
		for (const p of pins) {
			pts.push([p.lat, p.lon]);
			// Pin markup is a fixed string (no data in it); the label is attached as text below.
			const icon = L.divIcon({
				className: `pin pin-${p.kind ?? 'other'}`,
				html: '<span class="pin-dot"></span>',
				iconSize: p.kind === 'me' ? [18, 18] : [30, 38],
				iconAnchor: p.kind === 'me' ? [9, 9] : [15, 36]
			});
			const m = L.marker([p.lat, p.lon], { icon, keyboard: true, title: p.label });
			// Tooltip text is set as textContent, never HTML.
			const tip = document.createElement('span');
			tip.textContent = p.n ? `${p.n}. ${p.label}` : p.label;
			m.bindTooltip(tip, { direction: 'top', permanent: !!p.n, offset: [0, -30], className: 'pin-tip' });
			if (p.href) m.on('click', () => (location.href = p.href!));
			layer.addLayer(m);
		}
		if (line && pts.length > 1) layer.addLayer(L.polyline(pts, { color: c.accent, weight: 2, dashArray: '4 6' }));
		if (pts.length === 1) map.setView(pts[0], 16);
		else if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [32, 32], maxZoom: 16 });
		else map.setView([15.516, 103.194], 14);
	}
</script>

<div class="map" bind:this={el} style:height role="region" aria-label={t('a11y.map')}></div>

<style>
	.map {
		width: 100%;
		border: 0;
		background: var(--bg-sunken);
		z-index: 0;
	}
	:global(.leaflet-tooltip) {
		font-family: var(--font-body);
		border-radius: var(--radius-l);
		box-shadow: none;
		border: 0;
	}
	/* Night map on the dark public site: invert OSM tiles and warm them toward the palette. */
	:global(:not(.paper) .leaflet-tile-pane) {
		filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(0.95) sepia(0.25) saturate(0.8);
	}
	:global(.pin) {
		background: none;
		border: 0;
	}
	:global(.pin .pin-dot) {
		position: relative;
		display: block;
		width: 30px;
		height: 30px;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		background: linear-gradient(135deg, #fff1c2, #d4a341 60%, #a7731f);
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.5), 0 0 0 2px rgb(20 5 8 / 0.9);
	}
	:global(.pin .pin-dot::after) {
		content: '';
		position: absolute;
		inset: 9px;
		border-radius: 50%;
		background: #3a0b12;
	}
	:global(.pin-other .pin-dot) {
		background: linear-gradient(135deg, #f4e6c8, #b99a6a);
	}
	:global(.pin-me .pin-dot) {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		transform: none;
		background: #7ed19a;
		box-shadow: 0 0 0 4px rgb(126 209 154 / 0.3);
	}
	:global(.pin-me .pin-dot::after) {
		display: none;
	}
	:global(.leaflet-control-zoom a) {
		background: rgb(28 7 10 / 0.92) !important;
		color: var(--gold-300) !important;
		border-color: rgb(241 198 106 / 0.35) !important;
	}
	:global(.leaflet-control-zoom) {
		border: 1px solid rgb(241 198 106 / 0.35) !important;
		border-radius: 12px !important;
		overflow: hidden;
	}
	:global(.leaflet-tooltip.pin-tip) {
		background: rgb(28 7 10 / 0.95);
		color: var(--gold-200, #f6dc94);
		border: 1px solid rgb(241 198 106 / 0.45);
		border-radius: 10px;
		font: 600 14px var(--font-body);
		box-shadow: 0 6px 18px rgb(0 0 0 / 0.5);
	}
	:global(.leaflet-tooltip.pin-tip::before) {
		border-top-color: rgb(241 198 106 / 0.45);
	}
	:global(.leaflet-control-attribution) {
		background: rgb(20 5 8 / 0.7) !important;
		color: var(--fg-muted) !important;
	}
	:global(.leaflet-control-attribution a) {
		color: var(--gold-300) !important;
	}
	:global(.leaflet-bottom.leaflet-right .leaflet-control-attribution) {
		margin: 0 12px 10px 0 !important;
		border-radius: 6px;
		padding: 0 6px;
	}
</style>

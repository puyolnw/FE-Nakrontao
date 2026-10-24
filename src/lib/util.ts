import type { EventItem, Lang } from './types';
import { tr } from './i18n.svelte';

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const r = 6371;
	const rad = Math.PI / 180;
	const dLat = (lat2 - lat1) * rad;
	const dLon = (lon2 - lon1) * rad;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
	return 2 * r * Math.asin(Math.sqrt(a));
}

/** Google Maps directions deep link (scope 3.7). Coordinates are numbers, so nothing user-controlled is injected. */
export function directionsUrl(lat: number, lon: number, mode: 'walking' | 'driving'): string {
	return `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(6)},${lon.toFixed(6)}&travelmode=${mode}`;
}

/**
 * Only YouTube is embeddable, and only via a parsed 11-character id. The embed URL is rebuilt
 * from the id, so an editor cannot smuggle an arbitrary iframe source.
 */
export function youtubeId(url: string): string | null {
	try {
		const u = new URL(url);
		let id: string | null = null;
		if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
		else if (/(^|\.)youtube\.com$/.test(u.hostname)) id = u.searchParams.get('v') ?? u.pathname.split('/').pop() ?? null;
		return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
	} catch {
		return null;
	}
}

/** Only http(s) and same-site upload paths may be used as image sources or links. */
export function safeUrl(url: string | null | undefined): string | null {
	if (!url) return null;
	if (url.startsWith('/uploads/')) return url;
	try {
		const u = new URL(url);
		return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
	} catch {
		return null;
	}
}

function icsDate(iso: string): string {
	return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
function icsText(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Builds an .ics file so visitors get a reminder in their own calendar (stands in for push in v1). */
export function downloadIcs(e: EventItem) {
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//sinakhontao//events//TH',
		'BEGIN:VEVENT',
		`UID:event-${e.id}@sinakhontao`,
		`DTSTAMP:${icsDate(new Date().toISOString())}`,
		`DTSTART:${icsDate(e.starts_at)}`,
		`DTEND:${icsDate(e.ends_at)}`,
		`SUMMARY:${icsText(tr(e.title))}`,
		`DESCRIPTION:${icsText(tr(e.description))}`,
		'BEGIN:VALARM',
		'TRIGGER:-P1D',
		'ACTION:DISPLAY',
		`DESCRIPTION:${icsText(tr(e.title))}`,
		'END:VALARM',
		'END:VEVENT',
		'END:VCALENDAR'
	];
	const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = `event-${e.id}.ics`;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function share(url: string, title: string): Promise<'shared' | 'copied' | 'failed'> {
	try {
		if (navigator.share) {
			await navigator.share({ url, title });
			return 'shared';
		}
		await navigator.clipboard.writeText(url);
		return 'copied';
	} catch {
		return 'failed';
	}
}

/** Thai digits for the almanac-style numbering; other languages keep Arabic numerals. */
export function numeral(n: number, lang: Lang): string {
	const s = String(n).padStart(2, '0');
	return lang === 'th' ? s.replace(/\d/g, (d) => '๐๑๒๓๔๕๖๗๘๙'[+d]) : s;
}

export function paragraphs(text: string): string[] {
	return text
		.split(/\n+/)
		.map((p) => p.trim())
		.filter(Boolean);
}

// Visitor position, requested only on an explicit tap and never sent to the server.
export const geo = $state<{ lat: number | null; lon: number | null; error: string | null; busy: boolean }>({
	lat: null,
	lon: null,
	error: null,
	busy: false
});

export function locate() {
	if (!('geolocation' in navigator)) {
		geo.error = 'unsupported';
		return;
	}
	geo.busy = true;
	navigator.geolocation.getCurrentPosition(
		(p) => {
			geo.lat = p.coords.latitude;
			geo.lon = p.coords.longitude;
			geo.error = null;
			geo.busy = false;
		},
		(e) => {
			geo.error = e.message;
			geo.busy = false;
		},
		{ enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
	);
}

// Thai is written without spaces between words, so browsers break lines wherever their
// dictionary finds a word boundary, which splits compounds ("การ|งาน", "มาเยือนเมือง|เตา").
// Headings, leads and labels put spaces between phrases. For those elements we glue each
// phrase with WORD JOINER (U+2060) so lines break only at the spaces we wrote. If a glued
// element then overflows its box (a phrase longer than the line), it is un-glued and the
// browser's word-boundary breaking applies — text is never split inside a word.
const WJ = '\u2060';
const THAI = /[\u0E00-\u0E7F]/;
const SELECTOR =
	'h1, h2, h3, h4, .lead, .lede, .tagline, .eyebrow, .kicker, .chip, .btn, .sub, .mval, .val, .topic, .steps p, .steps h3, footer a, footer p, footer .fh, nav a, .tile p, .fact, .q';
const graphemes = new Intl.Segmenter('th', { granularity: 'grapheme' });
let loose = new WeakSet<Element>();

// Short fixed phrases glued even inside long body text.
const PHRASES = ['ให้ตกต้อง', 'ตามฤดูกาล', 'ถูกลบ', 'โดยชุมชน', 'แล้วจุดธูปสามดอก', 'ไม่ส่งเสียงดัง', 'โครงการวิจัย', 'จุดธูปสามดอก', 'คูน้ำคันดิน', 'คูน้ำ', 'ชุมชน', 'ขอฝน', 'บวงสรวง', 'ไม่ระบุตัวตน', 'บ้านเมืองเตา', 'มหาสารคาม', 'เจ้าพ่อศรีนครเตา', 'ความเชื่อ', 'ชั่วอายุคน'];
const joinPhrase = (s: string) => Array.from(graphemes.segment(s), (x) => x.segment).join(WJ);
const words = new Intl.Segmenter('th', { granularity: 'word' });
const ZWSP = '\u200B';
// Body text: each Thai word is glued (WJ between its characters) and a zero-width space marks
// the boundary between words, so a line can only break where the segmenter says a word ends.
// Fixed phrases stay whole on top of that.
function gluePhrases(text: string): string {
	const plain = text.replaceAll(WJ, '').replaceAll(ZWSP, '');
	if (!THAI.test(plain)) return text;
	let out = '';
	let prevThai = false;
	for (const { segment, isWordLike } of words.segment(plain)) {
		const thai = THAI.test(segment);
		if (thai && prevThai && isWordLike) out += ZWSP;
		out += thai ? Array.from(graphemes.segment(segment), (x) => x.segment).join(WJ) : segment;
		prevThai = thai && !!isWordLike;
	}
	// A fixed phrase may span several segmenter words: remove the word breaks inside it.
	for (const ph of PHRASES) {
		const parts = Array.from(graphemes.segment(ph), (x) => x.segment);
		const re = new RegExp(parts.join(`[${WJ}${ZWSP}]*`), 'g');
		out = out.replace(re, joinPhrase(ph));
	}
	return out;
}

function glue(text: string): string {
	const plain = text.replaceAll(WJ, '');
	if (!THAI.test(plain)) return text;
	return plain
		.split(/(\s+)/)
		.map((part) => (/^\s+$/.test(part) || !THAI.test(part) ? part : Array.from(graphemes.segment(part), (x) => x.segment).join(WJ)))
		.join('');
}

function texts(el: Element): Text[] {
	const out: Text[] = [];
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) out.push(n as Text);
	return out;
}

// The text's own extent, compared with its box: catches overflow in block, inline and flex items.
function overflows(el: Element): boolean {
	// Flex/grid children can grow to fit unbreakable text, so also compare with the parent's box.
	const own = el.getBoundingClientRect();
	if (own.width === 0) return false;
	const parent = el.parentElement?.getBoundingClientRect() ?? own;
	const box = { left: Math.max(own.left, parent.left), right: Math.min(own.right, parent.right) };
	const range = document.createRange();
	range.selectNodeContents(el);
	for (const r of range.getClientRects()) {
		if (r.right > box.right + 1 || r.left < box.left - 1 || r.right > innerWidth) return true;
	}
	return false;
}

function apply(root: ParentNode) {
	const els = [...root.querySelectorAll(SELECTOR)];
	for (const el of els) {
		if (loose.has(el)) continue;
		for (const t of texts(el)) {
			const next = glue(t.data);
			if (next !== t.data) t.data = next;
		}
	}
	// Body text: only the fixed phrases.
	for (const el of root.querySelectorAll('main p, main li, main dd')) {
		if (el.closest(SELECTOR)) continue;
		for (const t of texts(el)) {
			const next = gluePhrases(t.data);
			if (next !== t.data) t.data = next;
		}
	}
	// Measure after gluing: anything that no longer fits goes back to normal breaking.
	for (const el of els) {
		if (loose.has(el) || !overflows(el)) continue;
		loose.add(el);
		// Too long to keep whole: fall back to word-level breaking, as for body text.
		for (const t of texts(el)) if (t.data.includes(WJ)) t.data = gluePhrases(t.data.replaceAll(WJ, ''));
	}
}

/** Keeps short Thai phrases in headings/labels unbroken across the app, including later DOM updates. */
export function startThaiWrap() {
	let queued = false;
	const run = () => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => {
			queued = false;
			apply(document.body);
		});
	};
	// Re-glue everything when the viewport changes: an element that did not fit may fit now.
	const reset = () => {
		loose = new WeakSet<Element>();
		run();
	};
	run();
	document.fonts?.ready.then(reset);
	const mo = new MutationObserver(run);
	mo.observe(document.body, { subtree: true, childList: true, characterData: true });
	addEventListener('resize', reset, { passive: true });
	return () => (mo.disconnect(), removeEventListener('resize', reset));
}

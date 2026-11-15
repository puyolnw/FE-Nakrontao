// Global state of the floating assistant, so any page or link can open it.
export const chat = $state({ open: false, pending: '' });

/** Opens the assistant; a question, if given, is asked right away. */
export function openChat(question = '') {
	chat.pending = question.trim();
	chat.open = true;
}

export function closeChat() {
	chat.open = false;
}

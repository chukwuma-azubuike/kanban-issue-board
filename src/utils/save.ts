export const RECENT_ISSUES_KEY = 'recent_issues_v1';

export function saveRecentlyAccessed(id: string) {
	try {
		const raw = localStorage.getItem(RECENT_ISSUES_KEY);
		const list = raw ? (JSON.parse(raw) as string[]) : [];
		const next = [id, ...list.filter((x) => x !== id)].slice(0, 5);

		localStorage.setItem(RECENT_ISSUES_KEY, JSON.stringify(next));
	} catch (e) {
		// ignore
	}
}

import { Issue } from '../types';

const dedupeById = (items: Issue[]): Issue[] => {
	const map = new Map<string, Issue>();
	for (const it of items) {
		map.set(it.id, it); // later duplicates overwrite earlier ones (keeps the last occurrence)
	}
	return Array.from(map.values());
};

export default dedupeById;

import { Issue } from '../types';

const ranks = {
	low: 1,
	medium: 2,
	high: 3,
};

export function daysSinceCreated(createdAtIso: string, now = new Date()): number {
	const created = new Date(createdAtIso);
	const diffMs = now.getTime() - created.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Compute the priority score:
 * score = severity * 10 + (daysSinceCreated * -1) + userDefinedRank
 *
 * Higher score should come first.
 */
export function computeScore(issue: Issue, now = new Date()): number {
	const severityScore = issue.severity * 10;
	const days = daysSinceCreated(issue.createdAt, now);

	// use priority as user defined rank is `userDefinedRank` is undefined
	const userRank = issue.userDefinedRank ?? ranks[issue.priority] ?? 0;
	return severityScore + days * -1 + userRank;
}

/**
 * Stable sort by score descending. If equal scores, newer issues first (createdAt later).
 * Returns new array.
 */
export function sortIssuesByPriority(issues: Issue[], now = new Date()): Issue[] {
	// Attach computed score and original index to ensure stability if necessary
	const mapped = issues.map((it, idx) => ({
		it,
		idx,
		score: computeScore(it, now),
		createdTime: new Date(it.createdAt).getTime(),
	}));

	mapped.sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score; // higher score first
		if (b.createdTime !== a.createdTime) return b.createdTime - a.createdTime; // newer first
		return a.idx - b.idx; // stable fallback
	});

	return mapped.map((m) => m.it);
}

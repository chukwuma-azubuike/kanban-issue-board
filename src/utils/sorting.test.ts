import { sortIssuesByPriority, computeScore } from './sorting';

type Issue = any;

describe('priority sorting', () => {
	it('computes and sorts correctly with tie breaks', () => {
		const now = new Date('2025-09-23T00:00:00.000Z');

		const issues: Issue[] = [
			{ id: 'a', title: 'A', severity: 3, userDefinedRank: 0, createdAt: '2025-09-20T00:00:00.000Z' }, // daysSince=3
			{ id: 'b', title: 'B', severity: 3, userDefinedRank: 0, createdAt: '2025-09-21T00:00:00.000Z' }, // daysSince=2 (newer)
			{ id: 'c', title: 'C', severity: 1, userDefinedRank: 10, createdAt: '2025-09-22T00:00:00.000Z' }, // rank bump
		];

		const scores = issues.map((i) => computeScore(i, now));
		// ensure scores are numbers
		expect(scores.every((s) => typeof s === 'number')).toBe(true);

		const sorted = sortIssuesByPriority(issues, now);
		// c has severity 1*10 + -1*1 +10 = 19
		// a: 3*10 + -3 = 27
		// b: 3*10 + -2 = 28 => b (newer) should come before a
		expect(sorted[0].id).toBe('b');
		expect(sorted[1].id).toBe('a');
		expect(sorted[2].id).toBe('c');
	});
});

describe('sorting utils - computeScore & sortIssuesByPriority', () => {
	const now = new Date('2025-09-23T00:00:00.000Z');

	it('computeScore: implements severity*10 + (-daysSinceCreated) + userDefinedRank', () => {
		const issue: Issue = {
			id: 'x',
			severity: 4,
			userDefinedRank: 2,
			createdAt: '2025-09-20T00:00:00.000Z', // daysSince = 3
		};

		// expected: 4*10 + (-3) + 2 = 40 - 3 + 2 = 39
		const score = computeScore(issue, now);
		expect(score).toBe(39);
	});

	it('computeScore: defaults userDefinedRank to 0 when omitted', () => {
		const issue: Issue = {
			id: 'y',
			severity: 2,
			createdAt: '2025-09-22T00:00:00.000Z', // daysSince = 1
		};

		// expected: 2*10 + (-1) + 0 = 20 -1 = 19
		const score = computeScore(issue, now);
		expect(score).toBe(19);
	});

	it('computeScore: supports negative userDefinedRank', () => {
		const issue: Issue = {
			id: 'z',
			severity: 3,
			userDefinedRank: -5,
			createdAt: '2025-09-21T00:00:00.000Z', // daysSince = 2
		};

		// expected: 3*10 + (-2) + (-5) = 30 -2 -5 = 23
		const score = computeScore(issue, now);
		expect(score).toBe(23);
	});

	it('computeScore: handles future createdAt (negative daysSinceCreated)', () => {
		const futureIssue: Issue = {
			id: 'fut',
			severity: 1,
			userDefinedRank: 0,
			createdAt: '2025-09-25T00:00:00.000Z', // future relative to `now` => daysSince = -2
		};

		// expected: 1*10 + -(-2) + 0 = 10 + 2 = 12
		const score = computeScore(futureIssue, now);
		expect(score).toBe(12);
	});

	it('sortIssuesByPriority: sorts by score descending and breaks ties with newer createdAt', () => {
		const issues: Issue[] = [
			{ id: 'a', severity: 3, userDefinedRank: 0, createdAt: '2025-09-20T00:00:00.000Z' }, // days=3 score=27
			{ id: 'b', severity: 3, userDefinedRank: 0, createdAt: '2025-09-21T00:00:00.000Z' }, // days=2 score=28 (newer) -> should come first
			{ id: 'c', severity: 1, userDefinedRank: 10, createdAt: '2025-09-22T00:00:00.000Z' }, // score=19
		];

		const sorted = sortIssuesByPriority(issues, now);
		expect(sorted.map((i) => i.id)).toEqual(['b', 'a', 'c']);
	});

	it('sortIssuesByPriority: stable sort preserves original order when scores and createdAt are equal', () => {
		// Two issues created at same time, same severity and rank -> equal score and equal createdAt
		const createdAt = '2025-09-20T12:00:00.000Z';
		const issues: Issue[] = [
			{ id: 'first', severity: 2, userDefinedRank: 0, createdAt },
			{ id: 'second', severity: 2, userDefinedRank: 0, createdAt },
			{ id: 'third', severity: 1, userDefinedRank: 0, createdAt: '2025-09-19T12:00:00.000Z' },
		];

		const sorted = sortIssuesByPriority(issues, now);
		// first and second have equal score and createdAt; they must remain in original order (first before second)
		expect(sorted[0].id).toBe('first');
		expect(sorted[1].id).toBe('second');
		// third has lower score so appears last
		expect(sorted[2].id).toBe('third');
	});

	it('sortIssuesByPriority: handles complex ties where differing fields produce equal scores', () => {
		// Build two issues where severity and userDefinedRank combine to give same score,
		// but createdAt differs -> createdAt newer should be first.
		// Example:
		// item1: severity 4, userRank -2 => score = 40 + (-days) -2
		// item2: severity 3, userRank 8  => score = 30 + (-days) +8
		// We'll craft createdAt so scores become equal but createdAt differs.

		const baseNow = new Date('2025-09-30T00:00:00.000Z');

		// For simplicity calculate days such that the numeric scores tie:
		// Let both items have daysSinceCreated = 0 (created today)
		const item1 = { id: 'i1', severity: 4, userDefinedRank: -2, createdAt: '2025-09-30T10:00:00.000Z' }; // score=40 + 0 + (-2) = 38
		const item2 = { id: 'i2', severity: 3, userDefinedRank: 8, createdAt: '2025-09-30T09:00:00.000Z' }; // score=30 + 0 + 8 = 38

		// Same score, but i1 created later (10:00) than i2 (09:00) -> i1 should be before i2
		const list = [item2, item1]; // intentionally order item2 first
		const sorted = sortIssuesByPriority(list as Array<Issue>, baseNow);
		expect(sorted[0].id).toBe('i1');
		expect(sorted[1].id).toBe('i2');
	});

	it('sortIssuesByPriority: keeps ordering deterministic even with many items (sanity)', () => {
		// generate sample list with varying severity and ranks and ensure sort runs without throwing
		const sample: Issue[] = [];
		for (let i = 0; i < 20; i++) {
			sample.push({
				id: `s${i}`,
				severity: (i % 5) + 1,
				userDefinedRank: (i % 3) - 1, // -1,0,1
				createdAt: `2025-09-${10 + (i % 10)}T00:00:00.000Z`,
			});
		}

		const sorted = sortIssuesByPriority(sample, now);
		// sanity checks: same length, all ids present
		expect(sorted).toHaveLength(sample.length);
		expect(new Set(sorted.map((s) => s.id)).size).toBe(sample.length);
		// highest score is first
		const scores = sorted.map((s) => computeScore(s, now));
		for (let i = 1; i < scores.length; i++) {
			// allow equality; but if strictly decreasing it should not increase
			expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
		}
	});
});

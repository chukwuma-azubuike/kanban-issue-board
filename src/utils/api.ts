import type { Issue } from '../types';

const ASYNC_DELAY = 500;
export const mockFetchIssues = async (): Promise<Issue[]> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			import('../data/issues.json').then((module) => resolve(module.default as Issue[]));
		}, ASYNC_DELAY);
	});
};

export const mockUpdateIssue = async (issueId: string, updates: Partial<Issue>): Promise<Issue> => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() < 0.9) {
				resolve({ id: issueId, ...updates } as Issue);
			} else {
				reject(new Error('Failed to update issue'));
			}
		}, ASYNC_DELAY);
	});
};

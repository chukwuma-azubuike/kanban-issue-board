import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as api from '../utils/api';
import type { Issue, Issue as IssueType } from '../types';
import { currentUser } from '../constants/currentUser';

interface IssuesState {
	issues: IssueType[];
	loading: boolean;
	error: string | null;
	lastSync: Date | null;
	query: string;
	assigneeFilter: string | 'all';
	severityFilter: number | 'all';
	page: number;

	// selectors / helpers
	getIssue: (id: string) => IssueType | undefined;
	getIssues: () => Promise<void>;

	// actions
	updateIssue: (issue: Partial<Issue>) => Promise<void>;
	setQuery: (value: string) => void;
	setAssigneeFilter: (value: string | 'all') => void;
	setSeverityFilter: (value: number | 'all') => void;
}

export const useIssuesStore = create<IssuesState>()(
	devtools((set, get) => {
		// store initial state + actions
		return {
			issues: [],
			loading: false,
			error: null,
			lastSync: null,
			pending: {},
			query: '',
			assigneeFilter: 'all',
			severityFilter: 'all',
			page: 1,

			getIssue: (id: string) => {
				return get().issues.find((i) => i.id === id);
			},

			getIssues: async () => {
				set({ loading: true });
				try {
					const remote = await api.mockFetchIssues();
					set({ issues: remote, lastSync: new Date(), error: null });
				} catch (err: any) {
					set({ error: err?.message ?? 'Failed to fetch issues' });
				} finally {
					set({ loading: false });
				}
			},

			setQuery: (query) => {
				set({ query });
			},

			setAssigneeFilter: (assigneeFilter) => {
				set({ assigneeFilter });
			},

			setSeverityFilter: (severityFilter) => {
				set({ severityFilter });
			},

			updateIssue: async ({ id, ...patch }: Partial<Issue> & { id: string }) => {
				// client-side permission guard
				if (currentUser.role !== 'admin') throw new Error('Permission denied');

				const prev = get().issues.find((issue) => issue.id === id);
				if (!prev) throw new Error('Issue not found');

				// optimistic update: update local issues array
				set((state) => ({
					issues: state.issues.map((issue) => (issue.id === id ? { ...issue, ...patch } : issue)),
				}));

				// make update via api call
				try {
					await api.mockUpdateIssue(id, patch);
				} catch (err) {
					// failure: rollback locally and remove pending
					set((state) => ({
						issues: state.issues.map((issue) => (issue.id === id ? prev : issue)),
					}));
				}
			},
		};
	})
);

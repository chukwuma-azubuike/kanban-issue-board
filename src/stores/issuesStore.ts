import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as api from '../utils/api';
import type { IssueStatus, Issue as IssueType, Pagination, PendingUpdate } from '../types';
import { currentUser } from '../constants/currentUser';
import dedupeById from '../utils/dedupe';
import { toast } from 'react-toastify';
import renderUndoContent from '../components/UndoContent';

interface IssuesState {
	issue: IssueType;
	issues: IssueType[];
	loading: boolean;
	error: string | null;
	lastSync: Date | null;
	pending: Record<string, PendingUpdate>;
	query: string;
	assigneeFilter: string | 'all';
	severityFilter: number | 'all';
	page: number;
	limit: number;
	hasMore: boolean;

	// selectors / helpers
	getIssue: (id: string) => Promise<IssueType>;
	getPendingIds: () => string[];
	getIssues: (pagination?: Partial<Pagination>) => Promise<void>;

	// actions
	updateIssue: (issue: Partial<IssueType>) => Promise<void>;
	undoMove: (id: string) => Promise<boolean>;
	markResolved: (issue: Partial<IssueType>) => Promise<void>;
	setQuery: (value: string) => void;
	setAssigneeFilter: (value: string | 'all') => void;
	setSeverityFilter: (value: number | 'all') => void;
	setPage: (value: number) => void;
}

export const UNDO_DURATION_SEC = 5;

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
			limit: 10,

			getIssue: async (id: string) => {
				// hidrate state with issues on navigating to new page
				await get().getIssues();

				// try to get from cache
				const cached = get().issues.find((issue) => issue.id === id);

				if (cached) {
					set({ loading: false, error: null, issue: cached });
					return cached;
				}

				if (!cached) {
					set({ loading: true, error: null });
					try {
						const issues = await api.mockFetchIssues();
						const remoteIssue = issues.find((issue) => issue.id === id);

						set({ loading: false, error: null, issue: remoteIssue });

						return remoteIssue;
					} catch (err: any) {
						set({ error: err?.message ?? 'Failed to fetch issues' });
					} finally {
						set({ loading: false });
					}
				}
			},

			getPendingIds: () => Object.keys(get().pending),

			getIssues: async (pagination: Pagination) => {
				set({ loading: true });

				try {
					const { page, limit } = pagination ?? {};

					const remote = await api.mockFetchIssues();

					// return entire list if there is no pagination
					if (!page || !limit) {
						set({ issues: remote });
						return remote;
					}

					const cachedIssues = get().issues;

					set({ page, limit });

					// sanitize
					const pageNum = Math.max(1, Math.floor(page));
					const pageLimit = Math.max(1, Math.floor(limit));

					const start = (pageNum - 1) * pageLimit;
					const end = start + pageLimit;

					// slice safely to persist preloaded issues
					const slicedCache = cachedIssues.slice(start, end);
					const slicedRemote = remote.slice(start, end);
					const paginatedIssues: IssueType[] = slicedCache.length > 0 ? slicedCache : slicedRemote;

					// determine if there's more pages available
					const hasMore = end < remote.length;

					// update store: append on page > 1, replace on page === 1
					set((state) => {
						const merged =
							pageNum > 1
								? // append but dedupe by id (protects against overlapping slices)
								  dedupeById([...paginatedIssues, ...state.issues])
								: paginatedIssues;

						return {
							issues: merged,
							lastSync: new Date(),
							error: null,
							hasMore,
						};
					});

					return paginatedIssues;
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

			setPage: (page) => {
				set({ page });
			},

			updateIssue: async ({ id, ...patch }: Partial<IssueType> & { id: string }) => {
				// client-side permission guard
				if (currentUser.role !== 'admin') throw new Error('Permission denied');

				const prev = get().issues.find((issue) => issue.id === id);

				if (!prev) {
					return set({ error: 'Issue not found' });
				}

				// optimistic update: update local issues array
				set((state) => ({
					error: null,
					issues: state.issues.map((issue) => (issue.id === id ? { ...issue, ...patch } : issue)),
				}));

				// clear existing pending if present
				const existing = get().pending[id];

				if (existing) {
					if (existing.commitTimeoutId) clearTimeout(existing.commitTimeoutId);
					if (existing.cleanupTimeoutId) clearTimeout(existing.cleanupTimeoutId);
				}

				const undoDuration = Math.max(1, UNDO_DURATION_SEC);

				toast(({ closeToast }) => {
					return renderUndoContent(get().undoMove, closeToast, id);
				});

				// schedule commit (simulate network) after 500ms
				const commitTimeoutId = window.setTimeout(async () => {
					try {
						await api.mockUpdateIssue(id, patch);
						const p = get().pending[id];
						if (p) {
							// mark committed, keep pending metadata for undo window
							set((state) => ({
								pending: { ...state.pending, [id]: { ...state.pending[id], committed: true } },
							}));
						}
					} catch (err) {
						// failure: rollback locally and remove pending
						set((state) => ({
							issues: state.issues.map((issue) => (issue.id === id ? prev : issue)),
							pending: (() => {
								const copy = { ...state.pending };
								delete copy[id];
								return copy;
							})(),
						}));
					}
				}, 500);

				// schedule cleanup after undo duration seconds (remove pending metadata, ensure commit)
				const cleanupTimeoutId = window.setTimeout(async () => {
					const p = get().pending[id];
					if (!p) return;
					// if not committed yet, attempt commit now
					if (!p.committed) {
						try {
							await api.mockUpdateIssue(id, patch);
						} catch {
							// commit failed — rollback locally
							set((state) => ({
								issues: state.issues.map((issue) => (issue.id === id ? prev : issue)),
							}));
						}
					}
					// clear timeouts and remove pending
					if (p.commitTimeoutId) clearTimeout(p.commitTimeoutId);
					set((state) => {
						const copy = { ...state.pending };
						delete copy[id];
						return { pending: copy };
					});
				}, Math.max(1000, undoDuration * 1000));

				// save pending meta
				const pendingObj: PendingUpdate = {
					id,
					prev,
					commitTimeoutId,
					cleanupTimeoutId,
					committed: false,
					newStatus: patch.status as IssueStatus,
				};

				set((state) => ({ pending: { ...state.pending, [id]: pendingObj } }));
			},

			undoMove: async (id: string) => {
				const pending = get().pending[id];
				if (!pending) return false;

				// cancel cleanup
				if (pending.cleanupTimeoutId) clearTimeout(pending.cleanupTimeoutId);

				// if not committed yet: cancel commit and rollback locally
				if (!pending.committed) {
					if (pending.commitTimeoutId) clearTimeout(pending.commitTimeoutId);
					set((state) => ({
						issues: state.issues.map((issue) => (issue.id === id ? pending.prev : issue)),
						pending: (() => {
							const copy = { ...state.pending };
							delete copy[id];
							return copy;
						})(),
					}));
					return true;
				}

				// if committed already: perform compensating update to revert remote state
				try {
					await api.mockUpdateIssue(id, { status: pending.prev.status });
					set((state) => ({
						issues: state.issues.map((issue) => (issue.id === id ? pending.prev : issue)),
						pending: (() => {
							const copy = { ...state.pending };
							delete copy[id];
							return copy;
						})(),
					}));
					return true;
				} catch (err) {
					// if revert fails, still rollback locally and remove pending
					set((state) => ({
						error: 'Issue update failed',
						issues: state.issues.map((issue) => (issue.id === id ? pending.prev : issue)),
						pending: (() => {
							const copy = { ...state.pending };
							delete copy[id];
							return copy;
						})(),
					}));
					return false;
				}
			},

			markResolved: async (issue: IssueType) => {
				await get().updateIssue({ ...issue, status: 'Done' });
			},
		};
	})
);

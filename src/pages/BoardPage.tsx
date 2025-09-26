import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useIssuesStore } from '../stores/issuesStore';
import useUndoToast from '../hooks/useUndoToast';
import { currentUser } from '../constants/currentUser';
import RecentlyAccessed from '../components/RecentlyAccessed';

import { computeScore as computeScoreRaw } from '../utils/sorting';
import { Column, Issue, User } from '../types';
import { usePolling } from '../hooks/usePolling';
import KanbanColumn from '../components/KanbanColumn';
import { issueSeverities } from '../constants/issues';
import { useSettingsStore } from '../stores/settingsStore';

const columns = [
	{ key: 'Backlog', label: 'Backlog' },
	{ key: 'In Progress', label: 'In Progress' },
	{ key: 'Done', label: 'Done' },
] as const;

export function BoardPage() {
	const {
		issues,
		loading,
		error,
		lastSync,
		query,
		assigneeFilter,
		severityFilter,
		page,
		hasMore,
		updateIssue,
		getIssues: reload,
		setQuery,
		setAssigneeFilter,
		setSeverityFilter,
		setPage,
	} = useIssuesStore();

	const { pollingIntervalSec } = useSettingsStore();

	const onDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event;

			if (!over || !active) return;

			const issue = active.data.current;
			const [status] = (over.id as string).split(':');

			if (currentUser.role !== 'admin') return;

			try {
				await updateIssue({ ...issue, status } as Partial<Issue>);
			} catch (err) {
				// display error
			}
		},
		[updateIssue]
	);

	const filterAndSearch = useCallback(
		(list: typeof issues) => {
			const trimmedQuery = query.trim().toLowerCase();
			return list.filter((issue) => {
				if (trimmedQuery) {
					const inTitle = issue.title.toLowerCase().includes(trimmedQuery);
					const inTags = (issue.tags || []).some((t: string) => t.toLowerCase().includes(trimmedQuery));
					if (!(inTitle || inTags)) return false;
				}
				if (assigneeFilter !== 'all' && issue.assignee !== assigneeFilter) return false;
				if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;

				return true;
			});
		},
		[assigneeFilter, query, severityFilter]
	);

	const uniqueAssignees = useMemo(
		() => new Set(issues.map((issue) => issue.assignee)) as unknown as Array<string>,
		[issues]
	);

	const renderColumnWithSortedIssues = useCallback(
		(col: Column) => {
			// match issues with column
			const rawList = issues.filter((issue) => issue.status === col.key);
			const visibleList = filterAndSearch(rawList);

			// sort issues
			const sorted = [...visibleList].sort((a, b) => {
				const sA = computeScoreRaw(a);
				const sB = computeScoreRaw(b);
				if (sB !== sA) return sB - sA;
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			});

			return <KanbanColumn key={col.key} column={col} issues={sorted} currentUser={currentUser as User} />;
		},
		[issues, filterAndSearch]
	);

	const handleSeverityChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSeverityFilter(e.target.value !== 'all' ? Number(e.target.value) : e.target.value);
	};

	const handlePagination = () => {
		if (hasMore) {
			setPage(page + 1);
			reload({ page: page + 1, limit: 10 });
		}
	};

	const handleQuery = (e: ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	const handleAssigneeFilter = (e: ChangeEvent<HTMLSelectElement>) => {
		setAssigneeFilter(e.target.value as any);
	};

	// ensure polling uses the latest pagination params
	const pollingCallback = useCallback(() => reload({ page, limit: 10 }), [page, reload]);

	usePolling(pollingCallback, pollingIntervalSec);

	useUndoToast();

	// handle initial loading state
	if (loading && issues.length < 1) {
		return <div style={{ padding: 16 }}>Loading…</div>;
	}

	// handle error state
	if (error && issues.length < 1) {
		return <div style={{ color: 'red', padding: 16 }}>{error}</div>;
	}

	return (
		<div style={{ display: 'flex', gap: 16 }}>
			<div style={{ flex: 1 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
					<input placeholder="Search title or tags" value={query} onChange={handleQuery} />
					<select value={assigneeFilter} onChange={handleAssigneeFilter}>
						<option value="all">All assignees</option>

						{[...uniqueAssignees].map((a) => (
							<option key={a} value={a!}>
								{a}
							</option>
						))}
					</select>
					<select value={severityFilter} onChange={handleSeverityChange}>
						<option value="all">All severities</option>
						{issueSeverities.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					<div>Last sync: {lastSync ? lastSync.toLocaleTimeString() : '—'}</div>
				</div>

				<DndContext onDragEnd={onDragEnd}>
					<div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
						{columns.map((col) => {
							return renderColumnWithSortedIssues(col);
						})}
					</div>
				</DndContext>

				<div style={{ marginTop: 12 }}>
					<button disabled={!hasMore} onClick={handlePagination}>
						{hasMore ? 'Load more' : 'No more issues to load'}
					</button>
				</div>
			</div>

			<div style={{ width: '100%', paddingTop: 10 }}>
				<RecentlyAccessed />
				{loading && <div style={{ marginTop: 10 }}>Loading…</div>}
				{error && <div style={{ color: 'red' }}>{error}</div>}
			</div>
		</div>
	);
}

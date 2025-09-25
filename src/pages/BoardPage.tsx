import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useIssuesStore } from '../stores/issuesStore';
import { currentUser } from '../constants/currentUser';

import { computeScore as computeScoreRaw } from '../utils/sorting';
import { Column, Issue, User } from '../types';
import KanbanColumn from '../components/KanbanColumn';

const columns = [
	{ key: 'Backlog', label: 'Backlog' },
	{ key: 'In Progress', label: 'In Progress' },
	{ key: 'Done', label: 'Done' },
] as const;

const severities = [1, 2, 3, 4, 5];

export function BoardPage() {
	const issues = useIssuesStore((s) => s.issues);
	const loading = useIssuesStore((s) => s.loading);
	const error = useIssuesStore((s) => s.error);
	const lastSync = useIssuesStore((s) => s.lastSync);
	const query = useIssuesStore((s) => s.query);
	const assigneeFilter = useIssuesStore((s) => s.assigneeFilter);
	const severityFilter = useIssuesStore((s) => s.severityFilter);
	const updateIssue = useIssuesStore((s) => s.updateIssue);
	const reload = useIssuesStore((s) => s.getIssues);
	const setQuery = useIssuesStore((s) => s.setQuery);
	const setAssigneeFilter = useIssuesStore((s) => s.setAssigneeFilter);
	const setSeverityFilter = useIssuesStore((s) => s.setSeverityFilter);

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

			return (
				<KanbanColumn
					column={col}
					issues={sorted}
					moveIssue={updateIssue}
					currentUser={currentUser as User}
				/>
			);
		},
		[issues, filterAndSearch, updateIssue]
	);

	const handleSeverityChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSeverityFilter(e.target.value !== 'all' ? Number(e.target.value) : e.target.value);
	};

	const handleQuery = (e: ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	const handleAssigneeFilter = (e: ChangeEvent<HTMLSelectElement>) => {
		setAssigneeFilter(e.target.value as any);
	};

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
						{severities.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
					<div style={{ marginLeft: 'auto' }}>
						Last sync: {lastSync ? lastSync.toLocaleTimeString() : '—'}
						<button onClick={reload}>Sync now</button>
					</div>
				</div>

				<DndContext onDragEnd={onDragEnd}>
					<div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
						{columns.map((col) => {
							return renderColumnWithSortedIssues(col);
						})}
					</div>
				</DndContext>
			</div>

			<div style={{ width: 280 }}>
				{loading && <div>Loading…</div>}
				{error && <div style={{ color: 'red' }}>{error}</div>}
			</div>
		</div>
	);
}

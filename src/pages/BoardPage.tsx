import React, { useCallback, useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useIssuesStore } from '../stores/issuesStore';
import { currentUser } from '../constants/currentUser';
import RecentlyAccessed from '../components/RecentlyAccessed';

import { computeScore as computeScoreRaw } from '../utils/sorting';
import { Column, Issue, User } from '../types';
import { usePolling } from '../hooks/usePolling';
import KanbanColumn from '../components/KanbanColumn';
import { useSettingsStore } from '../stores/settingsStore';
import IssueCard from '../components/IssueCard';
import { BoardControls } from '../components/BoardControls';

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
		query,
		assigneeFilter,
		severityFilter,
		page,
		updateIssue,
		getIssues: reload,
	} = useIssuesStore();

	const { pollingIntervalSec } = useSettingsStore();

	// track active dragged item id for DragOverlay preview (prevents clipping)
	const [activeId, setActiveId] = useState<string | null>(null);

	const onDragStart = useCallback((event: DragStartEvent) => {
		// set the active id so DragOverlay can render a portal preview
		setActiveId(event.active.id as string);
	}, []);

	const onDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event;

			// clear overlay
			setActiveId(null);

			if (!over || !active) return;

			const issue = (active.data && (active.data.current as Issue)) || null;
			const [status] = (over.id as string).split(':');

			if (currentUser.role !== 'admin') return;

			if (!issue) return;

			// abort issue update if target status remains unchanged.
			if (issue.status !== status) {
				try {
					await updateIssue({ ...issue, status } as Partial<Issue>);
				} catch (err) {
					// display error
				}
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

	// ensure polling uses the latest pagination params
	const pollingCallback = useCallback(() => reload({ page, limit: 10 }), [page, reload]);

	usePolling(pollingCallback, pollingIntervalSec);

	// find active issue for overlay preview (rendered outside column overflow)
	const activeIssue = useMemo(
		() => (activeId ? issues.find((i) => i.id === activeId) ?? null : null),
		[activeId, issues]
	);

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
				<BoardControls />
				<DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
					<div className="kanban-wrap">
						{columns.map((col) => {
							return renderColumnWithSortedIssues(col);
						})}
					</div>

					{/* DragOverlay renders into a portal so it's not clipped by overflowing columns */}
					<DragOverlay>
						{activeIssue ? (
							<IssueCard
								issue={activeIssue}
								updateIssue={updateIssue}
								isAdmin={currentUser.role === 'admin'}
							/>
						) : null}
					</DragOverlay>
				</DndContext>
			</div>

			<div style={{ width: '100%', paddingTop: 10 }}>
				<RecentlyAccessed />
				{loading && <div style={{ marginTop: 10 }}>Loading…</div>}
				{error && <div style={{ color: 'red' }}>{error}</div>}
			</div>
		</div>
	);
}

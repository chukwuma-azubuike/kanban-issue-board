import React, { useCallback, useMemo } from 'react';
import { useIssuesStore } from '../stores/issuesStore';
import { currentUser } from '../constants/currentUser';

import { computeScore as computeScoreRaw } from '../utils/sorting';
import { Column, IssueStatus, User } from '../types';
import KanbanColumn from '../components/KanbanColumn';

const columns: Array<{ key: IssueStatus; label: IssueStatus }> = [
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
	const reload = useIssuesStore((s) => s.getIssues);

	const uniqueAssignees = useMemo(
		() => new Set(issues.map((i) => i.assignee)) as unknown as Array<string>,
		[issues]
	);

	const renderColumnWithSortedIssues = useCallback(
		(col: Column) => {
			const rawList = issues.filter((i) => i.status === col.key);

			const sorted = [...rawList].sort((a, b) => {
				const sA = computeScoreRaw(a);
				const sB = computeScoreRaw(b);
				if (sB !== sA) return sB - sA;
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			});

			return <KanbanColumn column={col} issues={sorted} currentUser={currentUser as User} />;
		},
		[issues]
	);

	if (loading && issues.length < 1) {
		return <div style={{ padding: 16 }}>Loading…</div>;
	}

	if (error && issues.length < 1) {
		return <div style={{ color: 'red', padding: 16 }}>{error}</div>;
	}

	return (
		<div style={{ display: 'flex', gap: 16 }}>
			<div style={{ flex: 1 }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
					<input placeholder="Search title or tags" value={query} />
					<select>
						<option value="all">All assignees</option>

						{[...uniqueAssignees].map((a) => (
							<option key={a} value={a!}>
								{a}
							</option>
						))}
					</select>
					<select>
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

				<div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
					{columns.map((col) => {
						return renderColumnWithSortedIssues(col);
					})}
				</div>
			</div>

			<div style={{ width: 280 }}>
				{loading && <div>Loading…</div>}
				{error && <div style={{ color: 'red' }}>{error}</div>}
			</div>
		</div>
	);
}

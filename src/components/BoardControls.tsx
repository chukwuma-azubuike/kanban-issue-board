import React, { ChangeEvent, useMemo } from 'react';
import { useIssuesStore } from '../stores/issuesStore';
import { issueSeverities } from '../constants/issues';
import useDebounce from '../hooks/useDebounce';

export function BoardControls() {
	const {
		issues,
		lastSync,
		query,
		assigneeFilter,
		severityFilter,
		page,
		hasMore,
		getIssues: reload,
		setQuery,
		setAssigneeFilter,
		setSeverityFilter,
		setPage,
	} = useIssuesStore();

	const debouncedQuery = useDebounce((value: string) => {
		setQuery(value);
	});

	const uniqueAssignees = useMemo(
		() => Array.from(new Set(issues.map((issue) => issue.assignee).filter(Boolean))) as string[],
		[issues]
	);

	const handleSeverityChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setSeverityFilter(e.target.value !== 'all' ? Number(e.target.value) : (e.target.value as any));
	};

	const handlePagination = () => {
		if (hasMore) {
			setPage(page + 1);
			reload({ page: page + 1, limit: 10 });
		}
	};

	const handleQuery = (e: ChangeEvent<HTMLInputElement>) => {
		debouncedQuery(e.target.value);
	};

	const handleAssigneeFilter = (e: ChangeEvent<HTMLSelectElement>) => {
		setAssigneeFilter(e.target.value as any);
	};

	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingLeft: '10px' }}>
			<input placeholder="Search title or tags" onChange={handleQuery} />
			<select value={assigneeFilter} onChange={handleAssigneeFilter}>
				<option value="all">All assignees</option>

				{uniqueAssignees.map((a) => (
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
			<button disabled={!hasMore} onClick={handlePagination}>
				{hasMore ? 'Load more' : 'No more issues to load'}
			</button>
			<div>Last sync: {lastSync ? lastSync.toLocaleTimeString() : '—'}</div>
		</div>
	);
}

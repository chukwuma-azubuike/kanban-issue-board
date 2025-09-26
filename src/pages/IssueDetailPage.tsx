import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useIssuesStore } from '../stores/issuesStore';
import { currentUser } from '../constants/currentUser';
import { saveRecentlyAccessed } from '../utils/save';

export function IssueDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { getIssue, markResolved, issues: issuesCache, loading, error } = useIssuesStore();

	const isAdmin = currentUser.role === 'admin';
	const issue = useMemo(() => issuesCache.find((issue) => issue.id === id), [issuesCache, id]);

	useEffect(() => {
		saveRecentlyAccessed(id as string);

		(async () => {
			await getIssue(id!);
		})();
	}, [id, getIssue]);

	if (error) return <div>{error ?? 'Error loading issue'}</div>;
	if (loading) return <div>Loading…</div>;
	if (!issue) return <div>Issue not found</div>;

	const handleMark = async () => {
		if (!isAdmin) {
			return alert('Permission denied');
		}
		await markResolved(issue);
	};

	return (
		<div style={{ padding: 16 }}>
			<h2>
				{issue.title} (Issue {issue.id})
			</h2>
			<div>Severity: {issue.severity}</div>
			<div>Assignee: {issue.assignee ?? 'Unassigned'}</div>
			<div>Tags: {(issue.tags || []).join(', ')}</div>
			<div>Status: {issue?.status}</div>
			<div>Priority: {issue.priority}</div>

			<div>Date created: {new Date(issue.createdAt).toDateString()}</div>

			<div style={{ marginTop: 16 }}>
				{isAdmin ? <button onClick={handleMark}>Mark as Resolved</button> : <div>Read-only view</div>}
			</div>
		</div>
	);
}

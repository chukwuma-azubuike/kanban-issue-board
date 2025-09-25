import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useIssuesStore } from '../stores/issuesStore';
import { Issue } from '../types';
import { saveRecentlyAccessed } from '../utils/save';

export function IssueDetailPage() {
	const { id } = useParams<{ id: string }>();
	const getIssue = useIssuesStore((s) => s.getIssue);
	const loading = useIssuesStore((s) => s.loading);
	const error = useIssuesStore((s) => s.error);

	const [issue, setIssue] = useState<Issue | null>(null);

	useEffect(() => {
		saveRecentlyAccessed(id as string);

		(async () => {
			const issue = await getIssue(id!);
			setIssue(issue);
		})();
	}, [id, getIssue, setIssue]);

	if (error) return <div>Error loading issue</div>;
	if (loading) return <div>Loading…</div>;
	if (!issue) return <div>Issue not found</div>;

	return (
		<div style={{ padding: 16 }}>
			<h2>{issue.title}</h2>
			<div>Severity: {issue.severity}</div>
			<div>Assignee: {issue.assignee ?? 'Unassigned'}</div>
			<div>Tags: {(issue.tags || []).join(', ')}</div>
			<div>Status: {issue.status}</div>
			<div>Priority: {issue.priority}</div>

			<div>Date created: {new Date(issue.createdAt).toDateString()}</div>
		</div>
	);
}

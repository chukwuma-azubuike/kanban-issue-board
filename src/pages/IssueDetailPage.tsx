import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIssuesStore } from '../stores/issuesStore';
import { currentUser } from '../constants/currentUser';
import { Issue } from '../types';
import { saveRecentlyAccessed } from '../utils/save';

export function IssueDetailPage() {
	const { id } = useParams<{ id: string }>();
	const getIssue = useIssuesStore((s) => s.getIssue);
	const markResolved = useIssuesStore((s) => s.markResolved);
	const loading = useIssuesStore((s) => s.loading);
	const error = useIssuesStore((s) => s.error);

	const [issue, setIssue] = useState<Issue | null>(null);
	const navigate = useNavigate();

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

	const handleMark = async () => {
		if (currentUser.role !== 'admin') {
			return alert('Permission denied');
		}
		await markResolved(issue.id);
		navigate('/board');
	};

	return (
		<div style={{ padding: 16 }}>
			<h2>{issue.title}</h2>
			<div>Severity: {issue.severity}</div>
			<div>Assignee: {issue.assignee ?? 'Unassigned'}</div>
			<div>Tags: {(issue.tags || []).join(', ')}</div>
			<div>Status: {issue.status}</div>
			<div>Priority: {issue.priority}</div>

			<div>Date created: {new Date(issue.createdAt).toDateString()}</div>

			<div style={{ marginTop: 16 }}>
				{currentUser.role === 'admin' ? (
					<button onClick={handleMark}>Mark as Resolved</button>
				) : (
					<div>Read-only view</div>
				)}
			</div>
		</div>
	);
}

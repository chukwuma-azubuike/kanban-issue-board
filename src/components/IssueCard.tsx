import React from 'react';
import { Link } from 'react-router-dom';
import { saveRecentlyAccessed } from '../utils/save';

import { useDraggable } from '@dnd-kit/core';
import { Issue } from '../types';
import useDragStyling from '../hooks/useDragStyling';
import UpdateControls from './UpdateControls';

interface IssueCardProps {
	issue: Issue;
	isAdmin: boolean;
	updateIssue: (issue: Partial<Issue>) => Promise<void>;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, isAdmin, updateIssue }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: issue.id,
		data: issue,
	});

	const dragStyling = useDragStyling(transform);

	const handleClick = () => {
		saveRecentlyAccessed(issue.id);
	};

	// disable dragging for non admin
	const dragProps = isAdmin ? { ...listeners, ...attributes } : undefined;

	return (
		<div
			ref={setNodeRef}
			{...dragProps}
			style={{
				zIndex: 1,
				padding: 8,
				borderRadius: 6,
				background: 'var(--card-bg)',
				border: '1px solid rgba(0,0,0,0.06)',
				...(isAdmin ? dragStyling : undefined),
			}}
		>
			<Link to={`/issue/${issue.id}`} onClick={handleClick}>
				<div style={{ fontWeight: 600 }}>
					{issue.title} (Issue {issue.id})
				</div>
			</Link>
			<div style={{ fontSize: 12 }}>{issue.tags?.join(', ')}</div>
			<div style={{ fontSize: 12, marginTop: 6 }}>
				Severity: {issue.severity} • {issue.assignee ?? 'Unassigned'}
			</div>
			{isAdmin && <UpdateControls issue={issue} updateIssue={updateIssue} />}
		</div>
	);
};

export default IssueCard;

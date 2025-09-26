import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveRecentlyAccessed } from '../utils/save';

import { useDraggable } from '@dnd-kit/core';
import { Issue } from '../types';
import useDragStyling from '../hooks/useDragStyling';
import UpdateControls from './UpdateControls';
import dayjs from 'dayjs';

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
	const navigate = useNavigate();

	const handleClick = (e: React.MouseEvent) => {
		navigate(`/issue/${issue.id}`);
		saveRecentlyAccessed(issue.id);
	};

	// disable dragging for non admin
	const dragProps = isAdmin ? { ...listeners, ...attributes } : undefined;

	const priorityClass =
		issue.priority === 'high'
			? 'priority-high'
			: issue.priority === 'medium'
			? 'priority-medium'
			: 'priority-low';

	return (
		<div
			{...dragProps}
			ref={setNodeRef}
			style={{
				...(isAdmin ? dragStyling : undefined),
			}}
			className="kanban-issue"
		>
			<div className="issue-top">
				<div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
					<Link
						to={`/issue/${issue.id}`}
						role="button"
						tabIndex={0}
						onMouseDown={handleClick}
						className="issue-title"
						aria-label={`Open issue ${issue.title}`}
					>
						{issue.title} (Issue {issue.id})
					</Link>
				</div>
			</div>
			<div style={{ fontSize: 12 }}>{issue.tags?.join(', ')}</div>
			<div className="issue-meta">
				<div className="text-muted">Severity: {issue.severity ?? '-'}</div>
				<div className="text-muted"> • {issue.assignee ?? 'Unassigned'}</div>
			</div>
			<div className="issue-tags">
				{isAdmin && <UpdateControls issue={issue} updateIssue={updateIssue} />}
				<div className={`badge ${priorityClass}`}>{issue.priority ?? 'low'}</div>
			</div>
			<div className="text-muted">{dayjs(issue.createdAt).toString()}</div>
		</div>
	);
};

export default memo(IssueCard);

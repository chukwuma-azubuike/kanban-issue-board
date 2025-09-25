import React from 'react';
import { Link } from 'react-router-dom';
import { saveRecentlyAccessed } from '../utils/save';

import { useDraggable } from '@dnd-kit/core';
import { Issue } from '../types';
import useDragStyling from '../hooks/useDragStyling';

interface IssueCardProps {
	issue: Issue;
	draggable?: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, draggable }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: issue.id,
		data: issue,
	});

	const dragStyling = useDragStyling(transform);

	const handleClick = () => {
		saveRecentlyAccessed(issue.id);
	};

	return (
		<div
			ref={draggable ? setNodeRef : undefined} // diable dragging for non admin
			{...listeners}
			{...attributes}
			style={{
				zIndex: 1,
				padding: 8,
				borderRadius: 6,
				background: 'var(--card-bg)',
				border: '1px solid rgba(0,0,0,0.06)',
				...dragStyling,
			}}
		>
			<Link to={`/issue/${issue.id}`} onClick={handleClick}>
				<div style={{ fontWeight: 600 }}>{issue.title}</div>
				<div style={{ fontSize: 12 }}>{issue.tags?.join(', ')}</div>
				<div style={{ fontSize: 12, marginTop: 6 }}>
					Severity: {issue.severity} • {issue.assignee ?? 'Unassigned'}
				</div>
			</Link>
		</div>
	);
};

export default IssueCard;

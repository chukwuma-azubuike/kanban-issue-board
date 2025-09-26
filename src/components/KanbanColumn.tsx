import React from 'react';
import { Column, Issue, User } from '../types';
import IssueCard from './IssueCard';
import { useDroppable } from '@dnd-kit/core';
import { useIssuesStore } from '../stores/issuesStore';

interface KanbanColumnProps {
	currentUser: User;
	column: Column;
	issues: Array<Issue>;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ currentUser, column, issues }) => {
	const id = `${column.key}:column`;
	const updateIssue = useIssuesStore((s) => s.updateIssue);

	const { setNodeRef } = useDroppable({ id });

	return (
		<div
			ref={setNodeRef}
			style={{
				width: 340,
				height: 'calc(100vh - 10rem)',
				overflowY: 'auto',
				overflowX: 'hidden',
				border: '1px solid #ddd',
				padding: 12,
				borderRadius: 6,
			}}
		>
			<div className="kanban-column-header">
				<div className="kanban-column-title">{column.label}</div>
				<div className="kanban-column-meta">{issues.length}</div>
			</div>

			{/* handle empty state */}
			{issues.length < 1 && <div className="kanban-empty"> No matching issues</div>}
			{issues.map((issue) => (
				<div key={issue.id} style={{ marginBottom: 8 }}>
					{/* issue card */}
					<IssueCard issue={issue} updateIssue={updateIssue} isAdmin={currentUser.role === 'admin'} />
				</div>
			))}
		</div>
	);
};

export default KanbanColumn;

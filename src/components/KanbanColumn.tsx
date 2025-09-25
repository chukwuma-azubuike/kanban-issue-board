import React from 'react';
import { Column, Issue, User } from '../types';
import IssueCard from './IssueCard';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
	currentUser: User;
	column: Column;
	issues: Array<Issue>;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ currentUser, column, issues }) => {
	const id = `${column.key}:column`;

	const { setNodeRef } = useDroppable({ id });

	return (
		<div ref={setNodeRef} style={{ width: 320, border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
			<h3>
				{column.label} ({issues.length})
			</h3>

			{/* handle empty state */}
			{issues.length < 1 && <div> No matching issues</div>}
			{issues.map((issue) => (
				<div key={issue.id} style={{ marginBottom: 8 }}>
					{/* issue card */}
					<IssueCard issue={issue} draggable={currentUser.role === 'admin'} />
				</div>
			))}
		</div>
	);
};

export default KanbanColumn;

import React from 'react';
import { Column, Issue, IssueStatus, User } from '../types';
import IssueCard from './IssueCard';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
	currentUser: User;
	column: Column;
	moveIssue: (issues: Issue) => void;
	issues: Array<Issue>;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ moveIssue, currentUser, column, issues }) => {
	const id = `${column.key}:column`;

	const { setNodeRef } = useDroppable({ id });

	const handleMove = (issue: Issue, status: IssueStatus) => () => {
		moveIssue({ ...issue, status });
	};

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

					{/* column specific controls */}
					{currentUser.role === 'admin' ? (
						<div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
							{column.key !== 'Backlog' && (
								<button onClick={handleMove(issue, 'Backlog')}>To Backlog</button>
							)}
							{column.key !== 'In Progress' && (
								<button onClick={handleMove(issue, 'In Progress')}>To In Progress</button>
							)}
							{column.key !== 'Done' && <button onClick={handleMove(issue, 'Done')}>To Done</button>}
						</div>
					) : null}
				</div>
			))}
		</div>
	);
};

export default KanbanColumn;

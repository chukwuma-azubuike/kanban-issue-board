import React from 'react';
import { Column, Issue, User, IssueStatus } from '../types';
import IssueCard from './IssueCard';

interface KanbanColumnProps {
	currentUser: User;
	column: Column;
	moveIssue: (id: string, status: IssueStatus) => void;
	issues: Array<Issue>;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ moveIssue, currentUser, column, issues }) => {
	const handleMove = (id: string, status: IssueStatus) => () => {
		moveIssue(id, status);
	};

	return (
		<div
			id={`${column.key}:column`}
			style={{ width: 320, border: '1px solid #ddd', padding: 12, borderRadius: 6 }}
		>
			<h3>
				{column.label} ({issues.length})
			</h3>
			{issues.map((issue) => (
				<div key={issue.id} style={{ marginBottom: 8 }}>
					{/* issue card */}
					<IssueCard issue={issue} draggable={currentUser.role === 'admin'} />

					{/* controls */}
					{currentUser.role === 'admin' ? (
						<div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
							{column.key !== 'Backlog' && (
								<button onClick={handleMove(issue.id, 'Backlog')}>To Backlog</button>
							)}
							{column.key !== 'In Progress' && (
								<button onClick={handleMove(issue.id, 'In Progress')}>To In Progress</button>
							)}
							{column.key !== 'Done' && (
								<button onClick={handleMove(issue.id, 'Done')}>To Done</button>
							)}
						</div>
					) : null}
				</div>
			))}
		</div>
	);
};

export default KanbanColumn;

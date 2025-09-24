import React from 'react';
import { Link } from 'react-router-dom';
import { saveRecentlyAccessed } from './RecentlyAccessed'; // helper export

interface IssueCardProps {
	issue: any;
	draggable?: boolean;
}
const IssueCard: React.FC<IssueCardProps> = ({ issue, draggable }) => {
	const handleClick = () => {
		saveRecentlyAccessed(issue.id);
	};

	return (
		<div
			draggable={draggable}
			id={issue.id}
			style={{
				padding: 8,
				borderRadius: 6,
				background: 'var(--card-bg)',
				border: '1px solid rgba(0,0,0,0.06)',
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

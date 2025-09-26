import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RECENT_ISSUES_KEY } from '../utils/save';

export default function RecentlyAccessed() {
	const [list, setList] = useState<string[]>([]);

	useEffect(() => {
		const raw = localStorage.getItem(RECENT_ISSUES_KEY);
		setList(raw ? (JSON.parse(raw) as string[]) : []);
	}, []);

	if (!list.length) {
		return (
			<div className="sidebar">
				<div className="panel">
					<h4>Recently Accessed</h4>
					<div style={{ color: 'var(--muted)' }}>No recent issues</div>
				</div>
			</div>
		);
	}

	return (
		<div className="sidebar">
			<div className="panel">
				<h4>Recently Accessed</h4>
				<div className="recent-list">
					{list.map((id) => (
						<Link key={id} className="recent-item" to={`/issue/${id}`}>
							<div style={{ fontWeight: 700 }}>{id}</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RECENT_ISSUES_KEY } from '../utils/save';

export default function RecentlyAccessed() {
	const [list, setList] = useState<string[]>([]);

	useEffect(() => {
		const raw = localStorage.getItem(RECENT_ISSUES_KEY);
		setList(raw ? (JSON.parse(raw) as string[]) : []);
	}, []);

	if (!list.length) return <div>No recent issues</div>;

	return (
		<div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
			<h4>Recently Accessed</h4>
			<ul>
				{list.map((id) => (
					<li key={id}>
						<Link to={`/issue/${id}`}>{id}</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

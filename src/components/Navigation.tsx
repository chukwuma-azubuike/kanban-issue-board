import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation = () => (
	<nav style={{ padding: '1rem', fontSize: 18 }}>
		<Link to="/board" className="nav-link" style={{ marginRight: '1rem' }}>
			Board
		</Link>
		<Link to="/settings" className="nav-link">
			Settings
		</Link>
	</nav>
);

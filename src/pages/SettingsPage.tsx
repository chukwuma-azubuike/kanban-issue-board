import React, { ChangeEvent } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { currentUser } from '../constants/currentUser';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
	const navigate = useNavigate();
	const { darkMode, pollingIntervalSec, setDarkMode, setPollingIntervalSec } = useSettingsStore();

	const isAdmin = currentUser.role === 'admin';

	const handleDarkMode = (e: ChangeEvent<HTMLInputElement>) => {
		setDarkMode(e.target.checked);
	};

	const handlePollingInterval = (e: ChangeEvent<HTMLInputElement>) => {
		setPollingIntervalSec(Number(e.target.value));
	};

	const handleNavigate = () => {
		navigate('/board');
	};

	return (
		<div style={{ maxWidth: 900, padding: '1rem' }}>
			<header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
				<h1 style={{ margin: 0 }}>Settings</h1>
				<div style={{ marginLeft: 'auto' }}>
					<strong>User:</strong> {currentUser.name} ({currentUser.role})
				</div>
			</header>

			<section style={{ border: '1px solid #e6e6e6', padding: 16, borderRadius: 8, marginBottom: 12 }}>
				<h3>Appearance</h3>
				<label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
					<input type="checkbox" checked={darkMode} onChange={handleDarkMode} disabled={!isAdmin} />
					Enable dark mode
				</label>
			</section>

			<section style={{ border: '1px solid #e6e6e6', padding: 16, borderRadius: 8, marginBottom: 12 }}>
				<h3>Behavior</h3>

				<div
					style={{
						gap: 12,
						marginTop: 8,
						display: 'grid',
						alignItems: 'center',
						gridTemplateColumns: '220px 1fr',
					}}
				>
					<label>Polling interval (seconds)</label>
					<div>
						<input
							min={5}
							max={60}
							type="range"
							disabled={!isAdmin}
							value={pollingIntervalSec}
							onChange={handlePollingInterval}
							style={{ appearance: 'none', WebkitAppearance: 'none' }}
						/>
						<div style={{ fontSize: 12 }}>{pollingIntervalSec} seconds</div>
					</div>
				</div>
			</section>

			<section style={{ border: '1px solid #e6e6e6', padding: 16, borderRadius: 8, marginBottom: 12 }}>
				<button onClick={handleNavigate}>Back to Board</button>
			</section>
		</div>
	);
}

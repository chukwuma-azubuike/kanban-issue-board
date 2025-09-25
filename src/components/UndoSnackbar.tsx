import React, { useEffect, useMemo, useState } from 'react';
import { UNDO_DURATION_SEC, useIssuesStore } from '../stores/issuesStore';

export default function UndoSnackbar() {
	const pending = useIssuesStore((s) => s.pending);
	const undoMove = useIssuesStore((s) => s.undoMove);
	const effectiveDuration = Math.max(1, UNDO_DURATION_SEC) * 1000;

	const pendingIds = useMemo(() => Object.keys(pending), [pending]);
	const latestId = useMemo(() => pendingIds[pendingIds.length - 1], [pendingIds]);

	const [visible, setVisible] = useState(!!latestId);

	const handleUndo = () => {
		undoMove(latestId);
	};

	useEffect(() => {
		setVisible(!!latestId);

		if (!latestId) return;

		const t = setTimeout(() => setVisible(false), effectiveDuration);

		return () => clearTimeout(t);
	}, [latestId, effectiveDuration]);

	if (!latestId || !visible) return null;

	return (
		<div
			style={{
				right: 20,
				bottom: 20,
				padding: 12,
				borderRadius: 8,
				position: 'fixed',
				background: 'var(--card-bg)',
				boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			}}
		>
			<div style={{ marginBottom: 6 }}>Updated issue {latestId}</div>
			<div style={{ display: 'flex', gap: 8 }}>
				<button onClick={handleUndo}>Undo</button>
			</div>
		</div>
	);
}

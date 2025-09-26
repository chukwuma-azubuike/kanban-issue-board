import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UNDO_DURATION_SEC, useIssuesStore } from '../stores/issuesStore';
import { toast, ToastContentProps } from 'react-toastify';

export default function useUndoToast() {
	const pending = useIssuesStore((s) => s.pending);
	const undoMove = useIssuesStore((s) => s.undoMove);
	const effectiveDuration = Math.max(1, UNDO_DURATION_SEC) * 1000;

	const pendingIds = useMemo(() => Object.keys(pending), [pending]);
	const latestId = useMemo(() => pendingIds[pendingIds.length - 1], [pendingIds]);

	const [visible, setVisible] = useState(!!latestId);

	const handleUndo = useCallback(
		(close: ToastContentProps<unknown>['closeToast']) => () => {
			undoMove(latestId);
			close();
		},
		[latestId, undoMove]
	);

	useEffect(() => {
		setVisible(!!latestId);

		if (!latestId) return;

		const t = setTimeout(() => setVisible(false), effectiveDuration);

		return () => clearTimeout(t);
	}, [latestId, effectiveDuration]);

	useEffect(() => {
		if (latestId && visible) {
			toast(({ closeToast }) => (
				<div>
					<div style={{ marginBottom: 6 }}>Updated issue {latestId}</div>
					<button onClick={handleUndo(closeToast)}>Undo</button>
				</div>
			));
		}
	}, [latestId, visible, handleUndo]);
}

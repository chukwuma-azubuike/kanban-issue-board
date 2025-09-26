import React from 'react';

export default function renderUndoContent(
	undoMove: (id: string) => void,
	closeToast: () => void,
	latestId: string
) {
	const handleUndo = () => {
		undoMove(latestId);
		closeToast();
	};

	return (
		<div>
			<div style={{ marginBottom: 6 }}>Updated issue {latestId}</div>
			<button onClick={handleUndo}>Undo</button>
		</div>
	);
}

import { useDraggable } from '@dnd-kit/core';

const useDragStyling = (transform: ReturnType<typeof useDraggable>['transform']) => {
	// transform is null when not dragging in dnd-kit
	const isDragging = !!transform;

	// small extra lift and scale while dragging
	const scale = isDragging ? 1.03 : 1;

	const style: React.CSSProperties = {
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${scale})` : undefined,
		transition: isDragging ? 'none' : 'transform 180ms cubic-bezier(.2,.9,.2,1)',
		zIndex: isDragging ? 9999 : 'initial',
		boxShadow: isDragging ? '0 12px 30px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
		cursor: isDragging ? 'grabbing' : 'grab',
		touchAction: 'none',
	};

	return style;
};

export default useDragStyling;

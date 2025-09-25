import { useDraggable } from '@dnd-kit/core';

function clamp(v: number, a: number, b: number) {
	return Math.max(a, Math.min(b, v));
}

const useDragStyling = (transform: ReturnType<typeof useDraggable>['transform']) => {
	// transform is null when not dragging in dnd-kit
	const isDragging = !!transform;

	// calculate tilt from horizontal movement (x). tweak divisor to change intensity.
	const tilt = transform ? clamp(transform.x / 18, -12, 12) : 0;

	// small extra lift and scale while dragging
	const scale = isDragging ? 1.03 : 1;

	const style: React.CSSProperties = {
		transform: transform
			? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${tilt}deg) scale(${scale})`
			: undefined,
		transition: isDragging ? 'none' : 'transform 180ms cubic-bezier(.2,.9,.2,1)',
		zIndex: isDragging ? 9999 : 'initial',
		boxShadow: isDragging ? '0 12px 30px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
		cursor: isDragging ? 'grabbing' : 'grab',
		touchAction: 'none',
	};

	return style;
};

export default useDragStyling;

import { useEffect, useRef } from 'react';

/**
 *
 * @param callback
 * @param intervalMs
 */
export function usePolling(callback: () => Promise<any> | void, intervalMs: number = 10) {
	const savedRef = useRef(callback);

	useEffect(() => {
		savedRef.current = callback;
	}, [callback]);

	useEffect(() => {
		let cancelled = false;
		let timerId: any = null;

		const run = async () => {
			if (cancelled) return;
			try {
				await savedRef.current();
			} catch (err) {
				// handle errors
			}
			timerId = setTimeout(run, intervalMs * 1000);
		};

		// start immediately
		run();

		return () => {
			cancelled = true;
			if (timerId) clearTimeout(timerId);
		};
	}, [intervalMs]);
}

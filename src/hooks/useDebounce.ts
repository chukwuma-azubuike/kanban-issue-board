import { useEffect, useMemo } from 'react';

const useDebounce = (fn: (arg?: any) => void, delay: number = 500) => {
	const debouncedSearch = useMemo(() => {
		let timeoutId: NodeJS.Timeout;

		const debounced = (value: string) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				fn(value);
			}, delay);
		};

		debounced.cancel = () => {
			clearTimeout(timeoutId);
		};

		return debounced;
	}, [fn, delay]);

	// Cleanup debounced function on unmount
	useEffect(() => {
		return () => {
			debouncedSearch.cancel();
		};
	}, [debouncedSearch]);

	return debouncedSearch;
};

export default useDebounce;

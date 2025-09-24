import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Issue as IssueType } from '../types';

interface IssuesState {
	issues: IssueType[];
	loading: boolean;
	error: string | null;
	lastSync: Date | null;
	query: string;
	page: number;
}

export const useIssuesStore = create<IssuesState>()(
	devtools((set, get) => {
		// store initial state + actions
		return {
			issues: [],
			loading: false,
			error: null,
			lastSync: null,
			pending: {},
			query: '',
		};
	})
);

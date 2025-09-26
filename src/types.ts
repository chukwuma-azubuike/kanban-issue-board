export type IssueStatus = 'Backlog' | 'In Progress' | 'Done';
export type IssuePriority = 'low' | 'medium' | 'high';
export type IssueSeverity = 1 | 2 | 3 | 4 | 5;

export interface Issue {
	id: string;
	title: string;
	tags?: string[];
	assignee?: string | null;
	status: IssueStatus;
	priority: IssuePriority;
	severity: number;
	userDefinedRank?: number;
	createdAt: string; // ISO date
}

export interface User {
	name: string;
	role: 'admin' | 'contributor';
}

export interface Column {
	key: IssueStatus;
	label: IssueStatus;
}

export interface PendingUpdate {
	id: string;
	prev: Issue;
	newStatus: IssueStatus;
	commitTimeoutId: number | null;
	cleanupTimeoutId: number | null;
	committed: boolean;
}

export interface Pagination {
	page: number;
	limit: number;
}

export type IssueStatus = 'Backlog' | 'In Progress' | 'Done';
export type IssuePriority = 'low' | 'medium' | 'high';

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

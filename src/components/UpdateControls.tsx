import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Issue, IssuePriority, IssueStatus } from '../types';
import { issuePriorities, issueStatuses } from '../constants/issues';

interface UpdateControlsProps {
	issue: Issue;
	updateIssue: (arg: Issue) => Promise<void>;
}

const UpdateControls: React.FC<UpdateControlsProps> = ({ issue, updateIssue }) => {
	const [status, setStatus] = useState<IssueStatus>(issue.status);
	const [priority, setPriority] = useState<IssuePriority>(issue.priority);

	const handlePriority = useCallback(
		async (e: ChangeEvent<HTMLSelectElement>) => {
			const priority = e.target.value as IssuePriority;
			setPriority(priority);

			await updateIssue({ ...issue, priority });
		},
		[issue, updateIssue]
	);

	const handleStatus = useCallback(
		async (e: ChangeEvent<HTMLSelectElement>) => {
			const status = e.target.value as IssueStatus;
			setStatus(status);

			await updateIssue({ ...issue, status });
		},
		[issue, updateIssue]
	);

	// update ui to with new priority state
	useEffect(() => {
		setPriority(issue.priority);
	}, [issue.priority]);

	return (
		<div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
			<div>
				Status:{' '}
				<select value={status} onChange={handleStatus}>
					{issueStatuses.map((a) => (
						<option key={a} value={a}>
							{a}
						</option>
					))}
				</select>
			</div>
			<div>
				Priority:{' '}
				<select value={priority} onChange={handlePriority}>
					{issuePriorities.map((a) => (
						<option key={a} value={a}>
							{a}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default UpdateControls;

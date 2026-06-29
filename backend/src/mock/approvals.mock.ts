export interface ApprovalHistoryEntry {
  stage: string;
  action: string;
  by: string;
  byName: string;
  reason?: string;
  timestamp: string;
}

export interface ApprovalRecord {
  id: string;
  expenseId: string;
  expenseCategory: string;
  executiveId: string;
  executiveName: string;
  amount: number;
  currentStage: 'Team Lead' | 'Manager' | 'Finance' | 'Closed';
  status: string;
  history: ApprovalHistoryEntry[];
  createdAt: string;
}

export const APPROVALS_MOCK: ApprovalRecord[] = [
  {
    id: 'apr_001',
    expenseId: 'exp_002',
    expenseCategory: 'Food',
    executiveId: 'usr_exec',
    executiveName: 'Arjun Das',
    amount: 320,
    currentStage: 'Team Lead',
    status: 'Pending Team Lead Approval',
    history: [],
    createdAt: '2024-07-02T14:00:00Z',
  },
];

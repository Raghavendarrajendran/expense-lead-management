export type ExpenseCategory =
  | 'Petrol Bill'
  | 'Bus Ticket'
  | 'Auto/Cab'
  | 'Food'
  | 'Parking'
  | 'Toll'
  | 'Lodging'
  | 'Mobile Recharge'
  | 'Miscellaneous';

export type ExpenseStatus =
  | 'Draft'
  | 'Submitted'
  | 'Team Lead Approved'
  | 'Manager Approved'
  | 'Rejected'
  | 'Finance Verified'
  | 'Paid';

export interface ApprovalHistoryEntry {
  stage: string;
  action: string;
  by: string;
  byName: string;
  reason?: string;
  timestamp: string;
}

export interface Expense {
  id: string;
  executiveId: string;
  executiveName: string;
  expenseDate: string;
  category: ExpenseCategory;
  amount: number;
  leadId?: string;
  customerName?: string;
  fromLocation: string;
  toLocation: string;
  purposeOfVisit: string;
  receiptUrl?: string;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Other';
  remarks?: string;
  status: ExpenseStatus;
  approvalHistory: ApprovalHistoryEntry[];
  // Petrol-specific
  vehicleNumber?: string;
  openingKm?: number;
  closingKm?: number;
  totalKm?: number;
  petrolPumpName?: string;
  billNumber?: string;
  // Bus-specific
  travelDate?: string;
  travelPurpose?: string;
  createdAt: string;
  updatedAt: string;
}

export const EXPENSES_MOCK: Expense[] = [
  {
    id: 'exp_001',
    executiveId: 'usr_exec',
    executiveName: 'Arjun Das',
    expenseDate: '2024-07-01',
    category: 'Petrol Bill',
    amount: 850,
    leadId: 'lead_001',
    customerName: 'Sundar Rajan',
    fromLocation: 'Chennai Office',
    toLocation: 'Anna Nagar',
    purposeOfVisit: 'Initial site visit for 5kW rooftop solar',
    receiptUrl: undefined,
    paymentMode: 'Cash',
    remarks: 'Petrol filled at HP pump',
    status: 'Manager Approved',
    approvalHistory: [
      { stage: 'Team Lead', action: 'Approved', by: 'usr_teamlead', byName: 'Priya Singh', timestamp: '2024-07-02T10:00:00Z' },
      { stage: 'Manager', action: 'Approved', by: 'usr_manager', byName: 'Ravi Kumar', timestamp: '2024-07-03T11:00:00Z' },
    ],
    vehicleNumber: 'TN09AX1234',
    openingKm: 24500,
    closingKm: 24545,
    totalKm: 45,
    petrolPumpName: 'HP Petrol Pump, Anna Nagar',
    billNumber: 'HP20240701',
    createdAt: '2024-07-01T18:00:00Z',
    updatedAt: '2024-07-03T11:00:00Z',
  },
  {
    id: 'exp_002',
    executiveId: 'usr_exec',
    executiveName: 'Arjun Das',
    expenseDate: '2024-07-02',
    category: 'Food',
    amount: 320,
    leadId: 'lead_002',
    customerName: 'Preethi Bala',
    fromLocation: 'Coimbatore',
    toLocation: 'RS Puram',
    purposeOfVisit: 'Customer meeting for commercial solar project',
    receiptUrl: undefined,
    paymentMode: 'UPI',
    remarks: 'Lunch during field visit',
    status: 'Submitted',
    approvalHistory: [],
    createdAt: '2024-07-02T14:00:00Z',
    updatedAt: '2024-07-02T14:00:00Z',
  },
  {
    id: 'exp_003',
    executiveId: 'usr_exec',
    executiveName: 'Arjun Das',
    expenseDate: '2024-06-28',
    category: 'Bus Ticket',
    amount: 180,
    leadId: 'lead_004',
    customerName: 'Nalini Devi',
    fromLocation: 'Chennai',
    toLocation: 'Trichy',
    purposeOfVisit: 'Site visit for water pump installation',
    receiptUrl: undefined,
    paymentMode: 'Cash',
    status: 'Finance Verified',
    approvalHistory: [
      { stage: 'Team Lead', action: 'Approved', by: 'usr_teamlead', byName: 'Priya Singh', timestamp: '2024-06-29T09:00:00Z' },
      { stage: 'Manager', action: 'Approved', by: 'usr_manager', byName: 'Ravi Kumar', timestamp: '2024-06-30T10:00:00Z' },
      { stage: 'Finance', action: 'Verified', by: 'usr_finance', byName: 'Meena Sharma', timestamp: '2024-07-01T10:00:00Z' },
    ],
    travelDate: '2024-06-28',
    travelPurpose: 'Site visit',
    createdAt: '2024-06-28T20:00:00Z',
    updatedAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 'exp_004',
    executiveId: 'usr_exec',
    executiveName: 'Arjun Das',
    expenseDate: '2024-06-20',
    category: 'Petrol Bill',
    amount: 650,
    leadId: 'lead_005',
    customerName: 'Green Farms Pvt Ltd',
    fromLocation: 'Chennai',
    toLocation: 'Salem',
    purposeOfVisit: 'Final inspection before conversion',
    receiptUrl: undefined,
    paymentMode: 'Cash',
    status: 'Paid',
    approvalHistory: [
      { stage: 'Team Lead', action: 'Approved', by: 'usr_teamlead', byName: 'Priya Singh', timestamp: '2024-06-21T09:00:00Z' },
      { stage: 'Manager', action: 'Approved', by: 'usr_manager', byName: 'Ravi Kumar', timestamp: '2024-06-22T10:00:00Z' },
      { stage: 'Finance', action: 'Verified', by: 'usr_finance', byName: 'Meena Sharma', timestamp: '2024-06-23T10:00:00Z' },
      { stage: 'Finance', action: 'Paid', by: 'usr_finance', byName: 'Meena Sharma', timestamp: '2024-06-25T10:00:00Z' },
    ],
    vehicleNumber: 'TN09AX1234',
    openingKm: 24320,
    closingKm: 24480,
    totalKm: 160,
    petrolPumpName: 'Indian Oil, Salem Bypass',
    createdAt: '2024-06-20T18:00:00Z',
    updatedAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'exp_005',
    executiveId: 'usr_exec',
    executiveName: 'Arjun Das',
    expenseDate: '2024-07-03',
    category: 'Toll',
    amount: 95,
    fromLocation: 'Chennai',
    toLocation: 'Madurai',
    purposeOfVisit: 'New lead prospecting at Karthik Industries',
    receiptUrl: undefined,
    paymentMode: 'Cash',
    status: 'Draft',
    approvalHistory: [],
    createdAt: '2024-07-03T20:00:00Z',
    updatedAt: '2024-07-03T20:00:00Z',
  },
];

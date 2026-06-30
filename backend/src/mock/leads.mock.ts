export interface LeadRemark {
  id: string;
  text: string;
  addedBy: string;
  addedByName: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  customerType: 'Residential' | 'Commercial' | 'Industrial';
  requirementType: 'Hardware Integration' | 'Software Setup' | 'Consulting Service' | 'Enterprise License';
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  projectBudget: number;
  projectScale: string;
  leadSource: string;
  assignedExecutiveId: string | null;
  assignedExecutiveName: string | null;
  followUpDate: string | null;
  status: 'New' | 'Assigned' | 'Contacted' | 'Field Visit Scheduled' | 'Field Visit Completed' | 'Quotation Shared' | 'Negotiation' | 'Converted' | 'Lost';
  remarks: LeadRemark[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export const LEADS_MOCK: Lead[] = [
  {
    id: 'lead_001',
    customerName: 'Sundar Rajan',
    mobile: '9876543210',
    email: 'sundar@example.com',
    customerType: 'Residential',
    requirementType: 'Hardware Integration',
    location: 'Chennai',
    address: '12, Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
    projectBudget: 3500,
    projectScale: '5 Units',
    leadSource: 'Website',
    assignedExecutiveId: 'usr_exec',
    assignedExecutiveName: 'Arjun Das',
    followUpDate: '2024-07-10',
    status: 'Field Visit Scheduled',
    remarks: [
      { id: 'rem_001', text: 'Customer interested in 5-unit system', addedBy: 'usr_exec', addedByName: 'Arjun Das', createdAt: '2024-07-01T10:00:00Z' },
    ],
    createdBy: 'usr_manager',
    createdByName: 'Ravi Kumar',
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 'lead_002',
    customerName: 'Preethi Bala',
    mobile: '9876543211',
    email: 'preethi@example.com',
    customerType: 'Commercial',
    requirementType: 'Hardware Integration',
    location: 'Coimbatore',
    address: '45, RS Puram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641002',
    projectBudget: 18000,
    projectScale: '25 Units',
    leadSource: 'Reference',
    assignedExecutiveId: 'usr_exec',
    assignedExecutiveName: 'Arjun Das',
    followUpDate: '2024-07-12',
    status: 'Contacted',
    remarks: [],
    createdBy: 'usr_teamlead',
    createdByName: 'Priya Singh',
    createdAt: '2024-07-02T09:00:00Z',
    updatedAt: '2024-07-02T09:00:00Z',
  },
  {
    id: 'lead_003',
    customerName: 'Karthik Industries',
    mobile: '9876543212',
    email: 'karthik.ind@example.com',
    customerType: 'Industrial',
    requirementType: 'Software Setup',
    location: 'Madurai',
    address: 'SIDCO Industrial Estate',
    city: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625020',
    projectBudget: 95000,
    projectScale: '100 Units',
    leadSource: 'Cold Call',
    assignedExecutiveId: null,
    assignedExecutiveName: null,
    followUpDate: null,
    status: 'New',
    remarks: [],
    createdBy: 'usr_manager',
    createdByName: 'Ravi Kumar',
    createdAt: '2024-07-03T09:00:00Z',
    updatedAt: '2024-07-03T09:00:00Z',
  },
  {
    id: 'lead_004',
    customerName: 'Nalini Devi',
    mobile: '9876543213',
    email: 'nalini@example.com',
    customerType: 'Residential',
    requirementType: 'Consulting Service',
    location: 'Trichy',
    address: '8, Srirangam',
    city: 'Trichy',
    state: 'Tamil Nadu',
    pincode: '620006',
    projectBudget: 1200,
    projectScale: '2 Units',
    leadSource: 'Exhibition',
    assignedExecutiveId: 'usr_exec',
    assignedExecutiveName: 'Arjun Das',
    followUpDate: '2024-07-08',
    status: 'Quotation Shared',
    remarks: [],
    createdBy: 'usr_teamlead',
    createdByName: 'Priya Singh',
    createdAt: '2024-06-28T09:00:00Z',
    updatedAt: '2024-07-04T09:00:00Z',
  },
  {
    id: 'lead_005',
    customerName: 'Green Farms Pvt Ltd',
    mobile: '9876543214',
    email: 'greenfarms@example.com',
    customerType: 'Commercial',
    requirementType: 'Software Setup',
    location: 'Salem',
    address: 'Omalur Main Road',
    city: 'Salem',
    state: 'Tamil Nadu',
    pincode: '636455',
    projectBudget: 42000,
    projectScale: '50 Units',
    leadSource: 'Social Media',
    assignedExecutiveId: 'usr_exec',
    assignedExecutiveName: 'Arjun Das',
    followUpDate: null,
    status: 'Converted',
    remarks: [],
    createdBy: 'usr_manager',
    createdByName: 'Ravi Kumar',
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-07-01T09:00:00Z',
  },
];

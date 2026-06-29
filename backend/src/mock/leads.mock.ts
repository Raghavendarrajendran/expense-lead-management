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
  requirementType: 'Rooftop Solar' | 'Ground Mounted' | 'Water Pump' | 'EV Charging';
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  electricityBillAmount: number;
  expectedSolarCapacity: string;
  leadSource: string;
  assignedExecutiveId: string | null;
  assignedExecutiveName: string | null;
  followUpDate: string | null;
  status: 'New' | 'Assigned' | 'Contacted' | 'Site Visit Scheduled' | 'Site Survey Completed' | 'Quotation Shared' | 'Negotiation' | 'Converted' | 'Lost';
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
    requirementType: 'Rooftop Solar',
    location: 'Chennai',
    address: '12, Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600040',
    electricityBillAmount: 3500,
    expectedSolarCapacity: '5 kW',
    leadSource: 'Website',
    assignedExecutiveId: 'usr_exec',
    assignedExecutiveName: 'Arjun Das',
    followUpDate: '2024-07-10',
    status: 'Site Visit Scheduled',
    remarks: [
      { id: 'rem_001', text: 'Customer interested in 5kW system', addedBy: 'usr_exec', addedByName: 'Arjun Das', createdAt: '2024-07-01T10:00:00Z' },
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
    requirementType: 'Rooftop Solar',
    location: 'Coimbatore',
    address: '45, RS Puram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641002',
    electricityBillAmount: 18000,
    expectedSolarCapacity: '25 kW',
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
    requirementType: 'Ground Mounted',
    location: 'Madurai',
    address: 'SIDCO Industrial Estate',
    city: 'Madurai',
    state: 'Tamil Nadu',
    pincode: '625020',
    electricityBillAmount: 95000,
    expectedSolarCapacity: '100 kW',
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
    requirementType: 'Water Pump',
    location: 'Trichy',
    address: '8, Srirangam',
    city: 'Trichy',
    state: 'Tamil Nadu',
    pincode: '620006',
    electricityBillAmount: 1200,
    expectedSolarCapacity: '2 kW',
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
    requirementType: 'Ground Mounted',
    location: 'Salem',
    address: 'Omalur Main Road',
    city: 'Salem',
    state: 'Tamil Nadu',
    pincode: '636455',
    electricityBillAmount: 42000,
    expectedSolarCapacity: '50 kW',
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

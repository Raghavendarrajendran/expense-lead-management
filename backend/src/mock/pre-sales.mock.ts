// ─────────────────────────────────────────────────────────────────────────────
// Pre-Sales Mock Data
// All entities use the 'ps_' prefix for IDs
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Pre-Sales Lead Qualification ──────────────────────────────────────────
export interface PresalesLead {
  id: string;
  // Link to original CRM lead (optional — can start fresh from pre-sales)
  leadId?: string;
  customerName: string;
  mobile: string;
  email: string;
  location: string;
  address: string;
  city: string;
  state: string;
  // Pre-Sales specific qualification fields
  leadSource: string;
  customerType: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
  customerCategory: string;
  budget: number;
  decisionMakerName: string;
  decisionMakerPhone: string;
  expectedCloseDate: string;
  probability: number; // 0-100 percentage
  competitor: string;
  requirementSummary: string;
  qualificationStatus: 'New' | 'Qualified' | 'Disqualified' | 'Site Inspection Required';
  remarks: string;
  assignedSalesExecId: string | null;
  assignedSalesExecName: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ── 2. Site Inspection Request ────────────────────────────────────────────────
export interface SiteInspectionRequest {
  id: string;
  leadId: string; // presales lead id
  customerName: string;
  requestedBy: string;
  requestedByName: string;
  assignedEngineerId: string | null;
  assignedEngineerName: string | null;
  preferredVisitDate: string;
  siteAddress: string;
  inspectionPurpose: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Requested' | 'Assigned' | 'In Progress' | 'Completed' | 'Rework Required';
  createdAt: string;
  updatedAt: string;
}

// ── 3. Engineering Survey ────────────────────────────────────────────────────
export interface EngineeringSurvey {
  id: string;
  inspectionRequestId: string;
  leadId: string;
  customerName: string;
  engineerId: string;
  engineerName: string;
  visitDate: string;
  // GPS
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  // Site details
  roofType: string;
  roofSizeInSqFt: number;
  shadowIssues: string;
  electricalLoad: number; // kW
  transformerAvailable: boolean;
  gridAvailable: boolean;
  accessConstraints: string;
  safetyRisks: string;
  engineeringRemarks: string;
  feasibilityStatus: 'Feasible' | 'Not Feasible' | 'Feasible With Conditions';
  photos: string[]; // file metadata names
  createdAt: string;
  updatedAt: string;
}

// ── 4. Array Layout ──────────────────────────────────────────────────────────
export interface ArrayLayout {
  id: string;
  leadId: string;
  customerName: string;
  plantCapacity: number; // kWp
  panelType: string;
  panelCount: number;
  inverterType: string;
  orientation: string;
  tiltAngle: number;
  layoutDrawingUpload: string; // file metadata name
  shadowAnalysisRemarks: string;
  designStatus: 'Draft' | 'Submitted' | 'Approved' | 'Revision Required';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ── 5. Sizing Report ─────────────────────────────────────────────────────────
export interface SizingReport {
  id: string;
  leadId: string;
  customerName: string;
  requiredCapacity: number; // kWp
  recommendedCapacity: number; // kWp
  annualGenerationEstimate: number; // kWh/year
  performanceRatio: number; // percentage
  moduleWattage: number; // Wp
  inverterCapacity: number; // kW
  estimatedYield: number; // kWh/kWp/year
  remarks: string;
  generatedBy: string;
  generatedByName: string;
  createdAt: string;
  updatedAt: string;
}

// ── 6. BOM ───────────────────────────────────────────────────────────────────
export interface BomLineItem {
  id: string;
  itemCategory: string;
  itemName: string;
  specification: string;
  uom: string; // unit of measure
  quantity: number;
  unitPrice: number;
  totalPrice: number; // auto-calculated
  vendorName: string;
  remarks: string;
}

export interface Bom {
  id: string;
  leadId: string;
  customerName: string;
  lineItems: BomLineItem[];
  totalAmount: number; // auto-calculated from line items
  bomStatus: 'Draft' | 'Submitted' | 'Approved' | 'Revision Required';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ── 7. Cost Estimation ───────────────────────────────────────────────────────
export interface CostEstimation {
  id: string;
  leadId: string;
  customerName: string;
  materialCost: number;
  labourCost: number;
  transportationCost: number;
  civilCost: number;
  installationCost: number;
  overheadCost: number;
  marginPercentage: number;
  taxPercentage: number;
  // Auto-calculated
  subTotal: number;
  marginAmount: number;
  totalBeforeTax: number;
  taxAmount: number;
  finalProjectCost: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ── 8. Proposal (TCO) ────────────────────────────────────────────────────────
export interface Proposal {
  id: string;
  proposalNumber: string;
  leadId: string;
  customerName: string;
  projectCapacity: number;
  scopeOfWork: string;
  technicalDetails: string;
  commercialDetails: string;
  termsAndConditions: string;
  warrantyDetails: string;
  paymentTerms: string;
  exclusions: string;
  validityDate: string;
  proposalStatus: 'Draft' | 'Submitted For Approval' | 'Approved' | 'Sent To Customer' | 'Revision Required' | 'Accepted' | 'Rejected';
  version: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ── 9. Internal Approval (for Proposal) ─────────────────────────────────────
export interface ProposalApprovalStep {
  id: string;
  proposalId: string;
  approverRole: string;
  approverUserId: string;
  approverName: string;
  stage: 'Sales Executive' | 'Manager' | 'Engineering Head' | 'Commercial Admin';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Revision Required';
  comments: string;
  actionDate: string | null;
  createdAt: string;
}

// ── 10. Proposal Revision ────────────────────────────────────────────────────
export interface ProposalRevision {
  id: string;
  proposalId: string;
  version: number;
  reason: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  revisedBy: string;
  revisedByName: string;
  revisedDate: string;
  createdAt: string;
}

// ── 11. Customer Follow-up ───────────────────────────────────────────────────
export interface CustomerFollowup {
  id: string;
  proposalId: string;
  leadId: string;
  customerName: string;
  followUpDate: string;
  communicationMode: 'Call' | 'Email' | 'Meeting' | 'WhatsApp';
  discussionSummary: string;
  customerFeedback: string;
  nextAction: string;
  nextFollowUpDate: string;
  status: 'Open' | 'Waiting For Customer' | 'Negotiation' | 'Closed';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ── 12. Order Finalization ───────────────────────────────────────────────────
export interface Order {
  id: string;
  proposalId: string;
  leadId: string;
  customerName: string;
  poNumber: string;
  poDate: string;
  poUpload: string; // file metadata name
  finalOrderValue: number;
  orderStatus: 'PO Received' | 'PI Created' | 'Advance Requested' | 'Advance Received' | 'Handover To Post Sales';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ── 13. Advance Payment ──────────────────────────────────────────────────────
export interface AdvancePayment {
  id: string;
  orderId: string;
  leadId: string;
  customerName: string;
  paymentMilestone: string;
  percentage: number;
  amount: number;
  dueDate: string;
  receivedDate: string | null;
  paymentStatus: 'Due' | 'Partially Received' | 'Received' | 'Overdue';
  paymentProofUpload: string; // file metadata name
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

// ── 14. Change Request ───────────────────────────────────────────────────────
export interface ChangeRequest {
  id: string;
  leadId: string;
  proposalId?: string;
  customerName: string;
  requestedBy: string;
  requestedByName: string;
  changeType: 'Specification Change' | 'Capacity Change' | 'Scope Change' | 'Commercial Change';
  oldValue: string;
  requestedValue: string;
  reason: string;
  impactOnBOM: string;
  impactOnCost: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  comments: string;
  reviewedBy: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── 15. Document ─────────────────────────────────────────────────────────────
export interface PresalesDocument {
  id: string;
  entityType: 'presales_lead' | 'inspection' | 'survey' | 'array_layout' | 'sizing_report' | 'bom' | 'costing' | 'proposal' | 'order' | 'payment';
  entityId: string;
  leadId: string;
  customerName: string;
  documentCategory: 'Site Photo' | 'Drawing' | 'BOM' | 'Proposal' | 'PO' | 'Payment Proof' | 'Communication' | 'Other';
  fileName: string;
  fileType: string;
  fileSizeKB: number;
  uploadedBy: string;
  uploadedByName: string;
  remarks: string;
  createdAt: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═════════════════════════════════════════════════════════════════════════════

export const PRESALES_LEADS_MOCK: PresalesLead[] = [
  {
    id: 'ps_lead_001',
    leadId: 'lead_001',
    customerName: 'Sundar Rajan',
    mobile: '9876543210',
    email: 'sundar@example.com',
    location: 'Chennai',
    address: '12, Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    leadSource: 'Website',
    customerType: 'Residential',
    customerCategory: 'Premium',
    budget: 450000,
    decisionMakerName: 'Sundar Rajan',
    decisionMakerPhone: '9876543210',
    expectedCloseDate: '2026-08-15',
    probability: 75,
    competitor: 'Tata Power Solar',
    requirementSummary: '5 kWp rooftop solar system for residential property with grid export',
    qualificationStatus: 'Site Inspection Required',
    remarks: 'Customer is keen, awaiting site feasibility report',
    assignedSalesExecId: 'usr_sales',
    assignedSalesExecName: 'Vikram Nair',
    createdBy: 'usr_sales',
    createdByName: 'Vikram Nair',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'ps_lead_002',
    leadId: 'lead_002',
    customerName: 'Preethi Bala',
    mobile: '9876543211',
    email: 'preethi@example.com',
    location: 'Coimbatore',
    address: '45, RS Puram',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    leadSource: 'Reference',
    customerType: 'Commercial',
    customerCategory: 'Enterprise',
    budget: 2800000,
    decisionMakerName: 'Balakrishnan VP',
    decisionMakerPhone: '9876543291',
    expectedCloseDate: '2026-09-30',
    probability: 60,
    competitor: 'Waaree Solar',
    requirementSummary: '25 kWp commercial solar plant for garment factory, grid connected',
    qualificationStatus: 'Qualified',
    remarks: 'Budget confirmed, awaiting proposal',
    assignedSalesExecId: 'usr_sales',
    assignedSalesExecName: 'Vikram Nair',
    createdBy: 'usr_sales',
    createdByName: 'Vikram Nair',
    createdAt: '2026-06-05T10:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 'ps_lead_003',
    customerName: 'Karthik Industries',
    mobile: '9876543212',
    email: 'karthik.ind@example.com',
    location: 'Madurai',
    address: 'SIDCO Industrial Estate',
    city: 'Madurai',
    state: 'Tamil Nadu',
    leadSource: 'Cold Call',
    customerType: 'Industrial',
    customerCategory: 'Large Industrial',
    budget: 12000000,
    decisionMakerName: 'Karthikeyan MD',
    decisionMakerPhone: '9876543292',
    expectedCloseDate: '2026-11-30',
    probability: 40,
    competitor: 'Adani Solar',
    requirementSummary: '100 kWp industrial solar plant with battery backup, captive generation',
    qualificationStatus: 'New',
    remarks: 'Initial contact, needs nurturing',
    assignedSalesExecId: null,
    assignedSalesExecName: null,
    createdBy: 'usr_manager',
    createdByName: 'Ravi Kumar',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-10T10:00:00Z',
  },
];

export const SITE_INSPECTION_REQUESTS_MOCK: SiteInspectionRequest[] = [
  {
    id: 'sir_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    requestedBy: 'usr_sales',
    requestedByName: 'Vikram Nair',
    assignedEngineerId: 'usr_engineer',
    assignedEngineerName: 'Deepak Sharma',
    preferredVisitDate: '2026-07-05',
    siteAddress: '12, Anna Nagar, Chennai - 600040',
    inspectionPurpose: 'Roof feasibility assessment for 5 kWp solar installation',
    priority: 'High',
    status: 'Assigned',
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-16T10:00:00Z',
  },
];

export const ENGINEERING_SURVEYS_MOCK: EngineeringSurvey[] = [
  {
    id: 'es_001',
    inspectionRequestId: 'sir_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    engineerId: 'usr_engineer',
    engineerName: 'Deepak Sharma',
    visitDate: '2026-07-05',
    gpsLatitude: 13.0827,
    gpsLongitude: 80.2707,
    roofType: 'RCC Flat Roof',
    roofSizeInSqFt: 800,
    shadowIssues: 'Minor shading from water tank on north side (8-9 AM only)',
    electricalLoad: 3.5,
    transformerAvailable: true,
    gridAvailable: true,
    accessConstraints: 'Staircase access only, no crane required',
    safetyRisks: 'None identified',
    engineeringRemarks: 'Site is feasible. Recommended 5 kWp south-facing installation.',
    feasibilityStatus: 'Feasible',
    photos: ['site_photo_001.jpg', 'roof_photo_001.jpg'],
    createdAt: '2026-07-05T14:00:00Z',
    updatedAt: '2026-07-05T16:00:00Z',
  },
];

export const ARRAY_LAYOUTS_MOCK: ArrayLayout[] = [
  {
    id: 'al_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    plantCapacity: 5.0,
    panelType: 'Mono PERC 540 Wp',
    panelCount: 10,
    inverterType: 'String Inverter 5 kW',
    orientation: 'South',
    tiltAngle: 12,
    layoutDrawingUpload: 'array_layout_sundar_v1.pdf',
    shadowAnalysisRemarks: 'Shadow analysis shows 97% solar access — acceptable',
    designStatus: 'Submitted',
    createdBy: 'usr_engineer',
    createdByName: 'Deepak Sharma',
    createdAt: '2026-07-06T10:00:00Z',
    updatedAt: '2026-07-06T10:00:00Z',
  },
];

export const SIZING_REPORTS_MOCK: SizingReport[] = [
  {
    id: 'sr_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    requiredCapacity: 5.0,
    recommendedCapacity: 5.0,
    annualGenerationEstimate: 7300,
    performanceRatio: 80,
    moduleWattage: 540,
    inverterCapacity: 5,
    estimatedYield: 1460,
    remarks: 'System will meet ~80% of household load. Grid export expected during peak hours.',
    generatedBy: 'usr_engineer',
    generatedByName: 'Deepak Sharma',
    createdAt: '2026-07-06T11:00:00Z',
    updatedAt: '2026-07-06T11:00:00Z',
  },
];

export const BOMS_MOCK: Bom[] = [
  {
    id: 'bom_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    lineItems: [
      {
        id: 'bi_001', itemCategory: 'Solar Module', itemName: 'Mono PERC Panel',
        specification: '540 Wp, 144 Cells, Grade A', uom: 'Nos', quantity: 10,
        unitPrice: 18000, totalPrice: 180000, vendorName: 'Waaree Energies', remarks: '',
      },
      {
        id: 'bi_002', itemCategory: 'Inverter', itemName: 'String Inverter 5 kW',
        specification: 'Single Phase, 98% efficiency, WiFi monitoring', uom: 'Nos', quantity: 1,
        unitPrice: 55000, totalPrice: 55000, vendorName: 'SolarEdge India', remarks: '',
      },
      {
        id: 'bi_003', itemCategory: 'Structure', itemName: 'GI Mounting Structure',
        specification: 'Hot-dip galvanized, 12° tilt, wind tested 150 kmph', uom: 'Set', quantity: 1,
        unitPrice: 25000, totalPrice: 25000, vendorName: 'Enerack Systems', remarks: '',
      },
      {
        id: 'bi_004', itemCategory: 'DC Cable', itemName: 'Solar DC Cable 4mm²',
        specification: 'UV resistant, XLPE insulated, 1000V rated', uom: 'Meters', quantity: 100,
        unitPrice: 80, totalPrice: 8000, vendorName: 'Havells', remarks: '',
      },
      {
        id: 'bi_005', itemCategory: 'AC Cable', itemName: 'AC Cable 6mm²',
        specification: 'Armored cable for grid connection', uom: 'Meters', quantity: 30,
        unitPrice: 120, totalPrice: 3600, vendorName: 'Polycab', remarks: '',
      },
      {
        id: 'bi_006', itemCategory: 'Earthing', itemName: 'Earthing Kit',
        specification: 'Copper bonded earth rod, clamps and accessories', uom: 'Set', quantity: 1,
        unitPrice: 3500, totalPrice: 3500, vendorName: 'Erico', remarks: '',
      },
    ],
    totalAmount: 275100,
    bomStatus: 'Submitted',
    createdBy: 'usr_engineer',
    createdByName: 'Deepak Sharma',
    createdAt: '2026-07-06T12:00:00Z',
    updatedAt: '2026-07-06T12:00:00Z',
  },
];

export const COST_ESTIMATIONS_MOCK: CostEstimation[] = [
  {
    id: 'ce_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    materialCost: 275100,
    labourCost: 30000,
    transportationCost: 5000,
    civilCost: 8000,
    installationCost: 15000,
    overheadCost: 12000,
    marginPercentage: 15,
    taxPercentage: 18,
    subTotal: 345100,
    marginAmount: 51765,
    totalBeforeTax: 396865,
    taxAmount: 71435.70,
    finalProjectCost: 468300.70,
    createdBy: 'usr_commercial',
    createdByName: 'Sunita Patel',
    createdAt: '2026-07-07T10:00:00Z',
    updatedAt: '2026-07-07T10:00:00Z',
  },
];

export const PROPOSALS_MOCK: Proposal[] = [
  {
    id: 'prop_001',
    proposalNumber: 'TCO-2026-001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    projectCapacity: 5.0,
    scopeOfWork: 'Supply, installation, and commissioning of 5 kWp grid-tied rooftop solar power plant including civil works, electrical connections, net metering application, and one year AMC.',
    technicalDetails: '10 × 540 Wp Mono PERC panels, 1 × 5 kW String Inverter, GI mounting structure, complete DC/AC wiring, earthing & lightning protection, monitoring system.',
    commercialDetails: 'Total Project Cost: ₹4,68,301. Payment terms: 50% advance, 30% at installation, 20% at commissioning.',
    termsAndConditions: '1. All materials are ISI/IEC certified.\n2. Workmanship warranty: 5 years.\n3. Panel efficiency warranty: 25 years linear.\n4. Inverter warranty: 5 years.\n5. Net metering application to be handled by customer.',
    warrantyDetails: '25-year panel output warranty (90% @ 10yr, 80% @ 25yr). 5-year inverter manufacturer warranty. 1-year comprehensive AMC included.',
    paymentTerms: '50% advance upon PO, 30% on material delivery, 20% on commissioning and net meter approval.',
    exclusions: 'Net metering fees, additional civil works beyond standard, grid upgrade costs if required by DISCOM.',
    validityDate: '2026-08-15',
    proposalStatus: 'Submitted For Approval',
    version: 1,
    createdBy: 'usr_sales',
    createdByName: 'Vikram Nair',
    createdAt: '2026-07-08T10:00:00Z',
    updatedAt: '2026-07-08T10:00:00Z',
  },
];

export const PROPOSAL_APPROVALS_MOCK: ProposalApprovalStep[] = [
  {
    id: 'pa_001',
    proposalId: 'prop_001',
    approverRole: 'sales_executive',
    approverUserId: 'usr_sales',
    approverName: 'Vikram Nair',
    stage: 'Sales Executive',
    status: 'Approved',
    comments: 'Proposal reviewed and approved for manager review.',
    actionDate: '2026-07-08T11:00:00Z',
    createdAt: '2026-07-08T10:30:00Z',
  },
  {
    id: 'pa_002',
    proposalId: 'prop_001',
    approverRole: 'manager',
    approverUserId: 'usr_manager',
    approverName: 'Ravi Kumar',
    stage: 'Manager',
    status: 'Pending',
    comments: '',
    actionDate: null,
    createdAt: '2026-07-08T11:00:00Z',
  },
];

export const PROPOSAL_REVISIONS_MOCK: ProposalRevision[] = [];

export const CUSTOMER_FOLLOWUPS_MOCK: CustomerFollowup[] = [
  {
    id: 'cf_001',
    proposalId: 'prop_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    followUpDate: '2026-07-10',
    communicationMode: 'Call',
    discussionSummary: 'Customer reviewed the proposal. Happy with technical specs but wants to negotiate on pricing.',
    customerFeedback: 'Pricing is 10% above their expectation. Comfortable with 5% discount if EMI option available.',
    nextAction: 'Prepare revised commercial offer with EMI option and 5% discount for commercial head approval.',
    nextFollowUpDate: '2026-07-15',
    status: 'Negotiation',
    createdBy: 'usr_sales',
    createdByName: 'Vikram Nair',
    createdAt: '2026-07-10T15:00:00Z',
    updatedAt: '2026-07-10T15:00:00Z',
  },
];

export const ORDERS_MOCK: Order[] = [];

export const ADVANCE_PAYMENTS_MOCK: AdvancePayment[] = [];

export const CHANGE_REQUESTS_MOCK: ChangeRequest[] = [];

export const PRESALES_DOCUMENTS_MOCK: PresalesDocument[] = [
  {
    id: 'psdoc_001',
    entityType: 'survey',
    entityId: 'es_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    documentCategory: 'Site Photo',
    fileName: 'site_photo_001.jpg',
    fileType: 'image/jpeg',
    fileSizeKB: 2048,
    uploadedBy: 'usr_engineer',
    uploadedByName: 'Deepak Sharma',
    remarks: 'Main roof area view from south',
    createdAt: '2026-07-05T14:30:00Z',
  },
  {
    id: 'psdoc_002',
    entityType: 'array_layout',
    entityId: 'al_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    documentCategory: 'Drawing',
    fileName: 'array_layout_sundar_v1.pdf',
    fileType: 'application/pdf',
    fileSizeKB: 512,
    uploadedBy: 'usr_engineer',
    uploadedByName: 'Deepak Sharma',
    remarks: 'Array layout drawing v1 — 10 panel south-facing configuration',
    createdAt: '2026-07-06T10:30:00Z',
  },
  {
    id: 'psdoc_003',
    entityType: 'proposal',
    entityId: 'prop_001',
    leadId: 'ps_lead_001',
    customerName: 'Sundar Rajan',
    documentCategory: 'Proposal',
    fileName: 'TCO-2026-001-Sundar-Rajan.pdf',
    fileType: 'application/pdf',
    fileSizeKB: 896,
    uploadedBy: 'usr_sales',
    uploadedByName: 'Vikram Nair',
    remarks: 'Technical Commercial Offer v1',
    createdAt: '2026-07-08T10:30:00Z',
  },
];

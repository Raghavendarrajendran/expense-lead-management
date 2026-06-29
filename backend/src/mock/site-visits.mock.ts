export type SiteVisitStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type FeasibilityStatus = 'Feasible' | 'Not Feasible' | 'Partially Feasible' | 'Pending Assessment';

export interface SiteVisit {
  id: string;
  leadId: string;
  customerName: string;
  assignedExecutiveId: string;
  assignedExecutiveName: string;
  visitDate: string;
  visitTime: string;
  siteAddress: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  roofType?: string;
  roofArea?: string;
  shadowObstacleDetails?: string;
  feasibilityStatus: FeasibilityStatus;
  surveyRemarks?: string;
  status: SiteVisitStatus;
  photos: string[];
  meterPhotoUrl?: string;
  roofPhotoUrl?: string;
  electricityBillUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const SITE_VISITS_MOCK: SiteVisit[] = [
  {
    id: 'sv_001',
    leadId: 'lead_001',
    customerName: 'Sundar Rajan',
    assignedExecutiveId: 'usr_exec',
    assignedExecutiveName: 'Arjun Das',
    visitDate: '2024-07-10',
    visitTime: '10:00',
    siteAddress: '12, Anna Nagar, Chennai - 600040',
    gpsLatitude: 13.0827,
    gpsLongitude: 80.2707,
    roofType: 'RCC Flat Roof',
    roofArea: '800 sq ft',
    shadowObstacleDetails: 'Water tank on north side — minor shading 8-9 AM',
    feasibilityStatus: 'Feasible',
    surveyRemarks: 'Good sun exposure from 9 AM to 5 PM. 5kW system is optimal.',
    status: 'Completed',
    photos: [],
    createdAt: '2024-07-05T09:00:00Z',
    updatedAt: '2024-07-10T12:00:00Z',
  },
  {
    id: 'sv_002',
    leadId: 'lead_002',
    customerName: 'Preethi Bala',
    assignedExecutiveId: 'usr_exec',
    assignedExecutiveName: 'Arjun Das',
    visitDate: '2024-07-15',
    visitTime: '11:00',
    siteAddress: '45, RS Puram, Coimbatore - 641002',
    feasibilityStatus: 'Pending Assessment',
    status: 'Scheduled',
    photos: [],
    createdAt: '2024-07-07T09:00:00Z',
    updatedAt: '2024-07-07T09:00:00Z',
  },
  {
    id: 'sv_003',
    leadId: 'lead_004',
    customerName: 'Nalini Devi',
    assignedExecutiveId: 'usr_exec',
    assignedExecutiveName: 'Arjun Das',
    visitDate: '2024-06-30',
    visitTime: '09:30',
    siteAddress: '8, Srirangam, Trichy - 620006',
    roofType: 'Tiled Roof',
    roofArea: '450 sq ft',
    shadowObstacleDetails: 'None',
    feasibilityStatus: 'Feasible',
    surveyRemarks: '2 kW water pump system suitable.',
    status: 'Completed',
    photos: [],
    createdAt: '2024-06-28T09:00:00Z',
    updatedAt: '2024-06-30T11:00:00Z',
  },
];

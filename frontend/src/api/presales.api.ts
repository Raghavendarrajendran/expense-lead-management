import api from './axios';

// ── 1. Pre-Sales Leads ──────────────────────────────────────────
export const getPresalesLeads = (params?: any) => api.get('/presales/leads', { params });
export const getPresalesLead = (id: string) => api.get(`/presales/leads/${id}`);
export const createPresalesLead = (data: any) => api.post('/presales/leads', data);
export const updatePresalesLead = (id: string, data: any) => api.patch(`/presales/leads/${id}`, data);
export const deletePresalesLead = (id: string) => api.delete(`/presales/leads/${id}`);
export const qualifyLead = (id: string, data: { status: string; remarks?: string; probability?: number; expectedCloseDate?: string }) => 
  api.post(`/presales/leads/${id}/qualify`, data);
export const assignLead = (id: string, data: { salesExecId: string; salesExecName: string }) => 
  api.post(`/presales/leads/${id}/assign`, data);

// ── 2. Site Inspection Requests ──────────────────────────────────
export const getSiteInspections = (params?: any) => api.get('/presales/site-inspections', { params });
export const getSiteInspection = (id: string) => api.get(`/presales/site-inspections/${id}`);
export const createSiteInspection = (data: any) => api.post('/presales/site-inspections', data);
export const updateSiteInspection = (id: string, data: any) => api.patch(`/presales/site-inspections/${id}`, data);
export const deleteSiteInspection = (id: string) => api.delete(`/presales/site-inspections/${id}`);

// ── 3. Engineering Surveys ───────────────────────────────────────
export const getEngineeringSurveys = (params?: any) => api.get('/presales/engineering-surveys', { params });
export const getEngineeringSurvey = (id: string) => api.get(`/presales/engineering-surveys/${id}`);
export const createEngineeringSurvey = (data: any) => api.post('/presales/engineering-surveys', data);
export const updateEngineeringSurvey = (id: string, data: any) => api.patch(`/presales/engineering-surveys/${id}`, data);

// ── 4. Array Layouts ─────────────────────────────────────────────
export const getArrayLayouts = (params?: any) => api.get('/presales/array-layouts', { params });
export const getArrayLayout = (id: string) => api.get(`/presales/array-layouts/${id}`);
export const createArrayLayout = (data: any) => api.post('/presales/array-layouts', data);
export const updateArrayLayout = (id: string, data: any) => api.patch(`/presales/array-layouts/${id}`, data);

// ── 5. Sizing Reports ────────────────────────────────────────────
export const getSizingReports = (params?: any) => api.get('/presales/sizing-reports', { params });
export const getSizingReport = (id: string) => api.get(`/presales/sizing-reports/${id}`);
export const createSizingReport = (data: any) => api.post('/presales/sizing-reports', data);
export const updateSizingReport = (id: string, data: any) => api.patch(`/presales/sizing-reports/${id}`, data);

// ── 6. BOM Management ────────────────────────────────────────────
export const getBoms = (params?: any) => api.get('/presales/bom', { params });
export const getBom = (id: string) => api.get(`/presales/bom/${id}`);
export const createBom = (data: any) => api.post('/presales/bom', data);
export const updateBom = (id: string, data: any) => api.patch(`/presales/bom/${id}`, data);

// ── 7. Cost Estimation ───────────────────────────────────────────
export const getCostEstimations = (params?: any) => api.get('/presales/cost-estimation', { params });
export const getCostEstimation = (id: string) => api.get(`/presales/cost-estimation/${id}`);
export const createCostEstimation = (data: any) => api.post('/presales/cost-estimation', data);
export const updateCostEstimation = (id: string, data: any) => api.patch(`/presales/cost-estimation/${id}`, data);

// ── 8. Proposals ─────────────────────────────────────────────────
export const getProposals = (params?: any) => api.get('/presales/proposals', { params });
export const getProposal = (id: string) => api.get(`/presales/proposals/${id}`);
export const createProposal = (data: any) => api.post('/presales/proposals', data);
export const updateProposal = (id: string, data: any) => api.patch(`/presales/proposals/${id}`, data);
export const deleteProposal = (id: string) => api.delete(`/presales/proposals/${id}`);
export const submitProposalForApproval = (id: string) => api.post(`/presales/proposals/${id}/submit-for-approval`);
export const sendProposalToCustomer = (id: string) => api.post(`/presales/proposals/${id}/send-to-customer`);

// ── 9. Internal Approvals ────────────────────────────────────────
export const getProposalApprovals = (params?: any) => api.get('/presales/proposal-approvals', { params });
export const getProposalApprovalsByProposal = (proposalId: string) => api.get(`/presales/proposal-approvals/by-proposal/${proposalId}`);
export const approveProposalStep = (id: string, data: { comments: string }) => api.post(`/presales/proposal-approvals/${id}/approve`, data);
export const rejectProposalStep = (id: string, data: { comments: string; requireRevision?: boolean }) => api.post(`/presales/proposal-approvals/${id}/reject`, data);

// ── 10. Revisions ────────────────────────────────────────────────
export const getProposalRevisions = (params?: any) => api.get('/presales/proposal-revisions', { params });
export const createProposalRevision = (data: any) => api.post('/presales/proposal-revisions', data);

// ── 11. Customer Follow-ups ──────────────────────────────────────
export const getCustomerFollowups = (params?: any) => api.get('/presales/followups', { params });
export const getCustomerFollowup = (id: string) => api.get(`/presales/followups/${id}`);
export const createCustomerFollowup = (data: any) => api.post('/presales/followups', data);
export const updateCustomerFollowup = (id: string, data: any) => api.patch(`/presales/followups/${id}`, data);

// ── 12. Order Finalization ───────────────────────────────────────
export const getOrders = (params?: any) => api.get('/presales/orders', { params });
export const getOrder = (id: string) => api.get(`/presales/orders/${id}`);
export const createOrder = (data: any) => api.post('/presales/orders', data);
export const updateOrder = (id: string, data: any) => api.patch(`/presales/orders/${id}`, data);

// ── 13. Advance Payments ─────────────────────────────────────────
export const getAdvancePayments = (params?: any) => api.get('/presales/payments', { params });
export const getAdvancePayment = (id: string) => api.get(`/presales/payments/${id}`);
export const createAdvancePayment = (data: any) => api.post('/presales/payments', data);
export const updateAdvancePayment = (id: string, data: any) => api.patch(`/presales/payments/${id}`, data);

// ── 14. Change Requests ──────────────────────────────────────────
export const getChangeRequests = (params?: any) => api.get('/presales/change-requests', { params });
export const getChangeRequest = (id: string) => api.get(`/presales/change-requests/${id}`);
export const createChangeRequest = (data: any) => api.post('/presales/change-requests', data);
export const updateChangeRequest = (id: string, data: any) => api.patch(`/presales/change-requests/${id}`, data);

// ── 15. Document Management ──────────────────────────────────────
export const getPresalesDocuments = (params?: any) => api.get('/presales/documents', { params });
export const uploadPresalesDocument = (data: any) => api.post('/presales/documents', data);
export const deletePresalesDocument = (id: string) => api.delete(`/presales/documents/${id}`);

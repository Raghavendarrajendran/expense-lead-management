import React, { useEffect, useState } from 'react';
import { getPresalesDocuments, uploadPresalesDocument, deletePresalesDocument, getPresalesLeads } from '../../../api/presales.api';
import { getMasters } from '../../../api/masters.api';
import { useAuth } from '../../../contexts/AuthContext';
import { Plus, Download, Trash2, FolderOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const DocumentList = () => {
  const { hasPermission } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [docCategories, setDocCategories] = useState<string[]>(['Site Photo', 'Drawing', 'BOM', 'Proposal', 'PO', 'Payment Proof', 'Other']);

  // Upload Modal
  const [activeUpload, setActiveUpload] = useState(false);
  const [formData, setFormData] = useState({
    leadId: '',
    customerName: '',
    entityType: 'presales_lead',
    entityId: 'generic',
    documentCategory: 'Drawing',
    fileName: '',
    fileType: 'application/pdf',
    fileSizeKB: 2048,
    remarks: '',
  });

  const fetchDocs = () => {
    setLoading(true);
    getPresalesDocuments({ documentCategory: category })
      .then(res => setDocuments(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getMasters()
      .then(res => {
        const m = res.data.data;
        if (m.documentCategories) setDocCategories(m.documentCategories);
      })
      .catch(err => console.error(err));

    fetchDocs();
    getPresalesLeads()
      .then(res => setLeads(res.data.data))
      .catch(err => console.error(err));
  }, [category]);

  const filteredDocs = documents.filter(d => 
    d.fileName?.toLowerCase().includes(search.toLowerCase()) ||
    d.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    d.uploadedByName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLeadChange = (leadId: string) => {
    const selected = leads.find(l => l.id === leadId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        leadId,
        customerName: selected.customerName,
      }));
    } else {
      setFormData(prev => ({ ...prev, leadId: '', customerName: '' }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadId || !formData.fileName) return;

    try {
      await uploadPresalesDocument(formData);
      toast.success('Document uploaded successfully (metadata saved)');
      setActiveUpload(false);
      setFormData({
        leadId: '',
        customerName: '',
        entityType: 'presales_lead',
        entityId: 'generic',
        documentCategory: 'Drawing',
        fileName: '',
        fileType: 'application/pdf',
        fileSizeKB: 1024,
        remarks: '',
      });
      fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deletePresalesDocument(id);
      toast.success('Document deleted');
      fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="lead-list animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Project Documents</h1>
          <p className="page-subtitle">Manage engineering schematics, site survey photos, proposals, and purchase orders.</p>
        </div>
        {hasPermission('mod_ps_documents', 'upload') && (
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setActiveUpload(true)}>
              <Plus size={16} /> Upload Document
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
        </div>
      ) : (
        <div className="card table-wrapper">
          <div className="table-toolbar">
            <div className="table-search">
              <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by file name, customer, uploader..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-row">
              <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {docCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          {filteredDocs.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px 20px', color: '#64748B', border: 'none' }}>
              No documents matching your search.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>File Name</th>
                <th>Category</th>
                <th>Project/Customer</th>
                <th>Uploaded By</th>
                <th>Size</th>
                <th>Uploaded Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderOpen size={16} style={{ color: '#2563EB' }} />
                      <div>
                        <strong>{doc.fileName}</strong>
                        {doc.remarks && <div style={{ fontSize: '11px', color: '#94A3B8' }}>"{doc.remarks}"</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-scheduled">{doc.documentCategory}</span></td>
                  <td>{doc.customerName}</td>
                  <td>{doc.uploadedByName}</td>
                  <td>{doc.fileSizeKB >= 1024 ? `${(doc.fileSizeKB / 1024).toFixed(1)} MB` : `${doc.fileSizeKB} KB`}</td>
                  <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-xs" title="Download">
                        <Download size={13} />
                      </button>
                      {hasPermission('mod_ps_documents', 'delete') && (
                        <button className="btn btn-danger btn-xs" title="Delete" onClick={() => handleDelete(doc.id)}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {activeUpload && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Upload Document Metadata</h3>
              <button className="btn-close" onClick={() => setActiveUpload(false)}>&times;</button>
            </div>
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0' }}>
              <div className="form-group">
                <label className="form-label">Select Project Lead *</label>
                <select
                  className="form-select"
                  required
                  value={formData.leadId}
                  onChange={e => handleLeadChange(e.target.value)}
                >
                  <option value="">-- Choose Lead --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.customerName}</option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Document Category</label>
                  <select
                    className="form-select"
                    value={formData.documentCategory}
                    onChange={e => setFormData({ ...formData, documentCategory: e.target.value })}
                  >
                    {docCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lifecycle Stage</label>
                  <select
                    className="form-select"
                    value={formData.entityType}
                    onChange={e => setFormData({ ...formData, entityType: e.target.value as any })}
                  >
                    <option value="presales_lead">Lead Qualification</option>
                    <option value="inspection">Site Inspection</option>
                    <option value="survey">Feasibility Survey</option>
                    <option value="array_layout">Layout Design</option>
                    <option value="proposal">TCO Proposal</option>
                    <option value="order">PO finalization</option>
                    <option value="payment">milestone payment</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">File Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. detailed_electrical_diagram.dwg"
                  value={formData.fileName}
                  onChange={e => setFormData({ ...formData, fileName: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">File Mime Type</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. application/pdf"
                    value={formData.fileType}
                    onChange={e => setFormData({ ...formData, fileType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">File Size (KB)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.fileSizeKB}
                    onChange={e => setFormData({ ...formData, fileSizeKB: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description Remarks</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter a brief tag or comment..."
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              <div className="modal-footer" style={{ borderTop: 'none', padding: '16px 0 0 0', margin: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

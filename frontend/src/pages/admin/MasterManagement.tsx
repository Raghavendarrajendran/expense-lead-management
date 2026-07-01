import React, { useEffect, useState } from 'react';
import { getMasters, updateMaster } from '../../api/masters.api';
import { Plus, Trash2, Save, Database, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface MasterGroup {
  key: string;
  label: string;
  description: string;
}

const MASTER_GROUPS: MasterGroup[] = [
  { key: 'leadSources', label: 'Lead Sources', description: 'Available acquisition channels for marketing and prospecting.' },
  { key: 'customerTypes', label: 'Customer Types', description: 'Customer segments for solar installations (Residential, Industrial, etc.).' },
  { key: 'customerCategories', label: 'Customer Categories', description: 'Customer priority tiers used for billing and SLAs.' },
  { key: 'roofTypes', label: 'Roof Types', description: 'Structure surfaces evaluated during engineering feasibility inspections.' },
  { key: 'panelTypes', label: 'Solar Panels catalog', description: 'Pre-seeded catalog of solar PV panels for array designing & BOM compilation.' },
  { key: 'inverterTypes', label: 'Inverter Units catalog', description: 'Pre-seeded catalog of DC-to-AC solar inverters for BOM compilation.' },
  { key: 'documentCategories', label: 'Document Categories', description: 'Classifications of design attachments, drawings, schematics, and PO files.' },
];

export const MasterManagement = () => {
  const [masters, setMasters] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<MasterGroup>(MASTER_GROUPS[0]);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMastersList = () => {
    setLoading(true);
    getMasters()
      .then(res => {
        setMasters(res.data.data);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load lookup master datasets');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMastersList();
  }, []);

  const items = masters[selectedGroup.key] || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    if (items.some(i => i.toLowerCase() === newItem.trim().toLowerCase())) {
      toast.error('Item already exists in this master list');
      return;
    }

    const updatedItems = [...items, newItem.trim()];
    setMasters(prev => ({
      ...prev,
      [selectedGroup.key]: updatedItems,
    }));
    setNewItem('');
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setMasters(prev => ({
      ...prev,
      [selectedGroup.key]: updatedItems,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMaster(selectedGroup.key, items);
      toast.success(`${selectedGroup.label} saved successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update master list');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '40vh' }}>
        <div className="spinner" style={{ borderColor: 'rgba(37,99,235,.2)', borderTopColor: '#2563EB', width: 30, height: 30 }} />
      </div>
    );
  }

  return (
    <div className="masters-mgmt animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Master Lookup Management</h1>
          <p className="page-subtitle">Configure dropdown options, equipment catalogs, and lookup metadata used in Pre-Sales workflows.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Side Group Selectors */}
        <div className="card" style={{ padding: '12px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '8px 12px', margin: 0, letterSpacing: '0.05em' }}>
            Lookup Datasets
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
            {MASTER_GROUPS.map(group => {
              const isSelected = selectedGroup.key === group.key;
              return (
                <button
                  key={group.key}
                  onClick={() => {
                    setSelectedGroup(group);
                    setNewItem('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(37,99,235,0.08)' : 'transparent',
                    color: isSelected ? '#1E40AF' : '#475569',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '13.5px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Database size={15} style={{ opacity: isSelected ? 1 : 0.6 }} />
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Editor panel */}
        <div className="card" style={{ padding: '24px', minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                Manage {selectedGroup.label}
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                {selectedGroup.description}
              </p>
            </div>

            {/* Info notice */}
            <div className="flex gap-2" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', alignItems: 'center' }}>
              <Info size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
              <span style={{ fontSize: '12.5px', color: '#1E3A8A', lineHeight: 1.4 }}>
                Changes made to this lookup dataset will take effect immediately for new forms across all modules. Make sure to click <strong>Save Changes</strong> after editing.
              </span>
            </div>

            {/* Add New Item Input */}
            <form onSubmit={handleAddItem} className="form-grid" style={{ gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '24px', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Add New Option Value</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`e.g. New ${selectedGroup.label.replace(' catalog', '').slice(0, -1)}`}
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ height: '40px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Option
              </button>
            </form>

            {/* Current Items List */}
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '12px' }}>
              Current Options
            </h3>
            {items.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: '13.5px', fontStyle: 'italic', padding: '16px 0' }}>
                No options defined. Add some using the input above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px 6px 14px',
                      backgroundColor: '#f1f5f9',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '30px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#334155',
                    }}
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        fontSize: '14px',
                        fontWeight: 'bold',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={saving}
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

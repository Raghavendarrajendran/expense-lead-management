import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Sun, Mail, Phone, Award } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="settings-page animate-fade">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Application Settings</h1>
          <p className="page-subtitle">Configure application preferences and view user profile details.</p>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* User Profile */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            My Profile Info
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '60px', height: '60px',
                borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 800, margin: '0 auto 0 0'
              }}>
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{user?.name}</h2>
                <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>
                  {user?.designation || 'Solar Professional'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: 'var(--color-text-muted)' }} />
                <span>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: 'var(--color-text-muted)' }} />
                <span>{user?.phone || '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} style={{ color: 'var(--color-text-muted)' }} />
                <span>Role: <strong>{user?.role?.displayName}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Application details */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', fontWeight: 700 }}>
            Aadhan Solar Portal Info
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <p>
              This Portal is designed for managing Aadhan Solar's onsite surveys, field lead lifecycle, expense allocations, approvals, and accounting payouts.
            </p>
            <div style={{ background: 'var(--color-surface-2)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>App Version:</span>
                <span>v1.0.0 (POC)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Middleware Layer:</span>
                <span>NestJS REST Backend</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Data Store:</span>
                <span>In-Memory Seeder (Temporary)</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '12px' }}>
              Aadhan Solar Inc. © {new Date().getFullYear()} — All Rights Reserved.
            </div>
          </div>
        </div>

        {/* WhatsApp Bot integration card */}
        <div className="card" style={{ gridColumn: 'span 2', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '24px' }}>💬</span>
            <h3 style={{ margin: 0, fontWeight: 700 }}>WhatsApp Bot & Automated Notifications</h3>
            <span className="badge badge-assigned" style={{ fontSize: '11px', padding: '3px 8px' }}>Coming Soon</span>
          </div>
          <p className="text-muted" style={{ marginBottom: '16px', fontSize: '13.5px' }}>
            Our upcoming WhatsApp Bot integration will enable Field Executives to log technical site survey images, roof sizes, and travel odometer logs directly via WhatsApp chat.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ padding: '12px 16px', background: 'var(--color-surface-2)', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--color-navy)' }}>⚡ Instant Survey Sync</strong>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Executives can snap and send roof photos to sync them directly to Zoho Creator.</p>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--color-surface-2)', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--color-navy)' }}>💸 WhatsApp Expense Filing</strong>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Just send "Petrol TN09AX1234 24500-24545" with receipt to submit travel bills instantly.</p>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--color-surface-2)', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--color-navy)' }}>🔔 Real-time Approval Alerts</strong>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Managers and Team Leads receive instant approval buttons on WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

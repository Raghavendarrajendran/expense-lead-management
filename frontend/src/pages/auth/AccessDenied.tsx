import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="access-denied-page animate-up">
      <div className="access-denied-icon">
        <ShieldAlert size={48} color="var(--color-danger)" />
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Access Denied</h1>
      <p className="text-muted" style={{ maxWidth: '400px' }}>
        You do not have permission to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <button className="btn btn-navy" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  );
};

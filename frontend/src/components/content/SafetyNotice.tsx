import React from 'react';
import { ShieldAlert } from 'lucide-react';

export interface SafetyNoticeProps {
  compact?: boolean;
}

export const SafetyNotice: React.FC<SafetyNoticeProps> = ({ compact = false }) => {
  return (
    <div
      className="card p-md flex items-start gap-md my-4"
      style={{ backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}
    >
      <ShieldAlert size={compact ? 20 : 26} className="text-primary" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div className="text-small" style={{ color: 'var(--text-main)' }}>
        <strong>MindCampus Non-Clinical Disclaimer:</strong> All content, recommendations, and mascot guidance provided on MindCampus are for general educational, motivational, and self-care purposes only. MindCampus is <strong>not</strong> a medical diagnosis system, <strong>not</strong> a psychiatric therapy platform, and <strong>not</strong> a replacement for emergency clinical care.
      </div>
    </div>
  );
};

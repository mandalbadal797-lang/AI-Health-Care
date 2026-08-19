import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-xs mb-2">
      <label htmlFor={checkboxId} className="flex items-center gap-2" style={{ cursor: 'pointer', userSelect: 'none' }}>
        <input
          type="checkbox"
          id={checkboxId}
          className={className}
          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          {...props}
        />
        <span className="label-text">{label}</span>
      </label>
      {helperText && <span className="form-helper" style={{ paddingLeft: '1.75rem' }}>{helperText}</span>}
    </div>
  );
};

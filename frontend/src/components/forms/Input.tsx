import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)', display: 'flex' }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`form-control ${error ? 'error' : ''} ${className}`}
          style={{
            paddingLeft: leftIcon ? '2.5rem' : undefined,
            paddingRight: rightIcon ? '2.5rem' : undefined,
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {rightIcon && (
          <span style={{ position: 'absolute', right: '0.75rem', color: 'var(--text-muted)', display: 'flex' }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <span id={`${inputId}-error`} className="form-error">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="form-helper">
          {helperText}
        </span>
      )}
    </div>
  );
};

import React from 'react';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  selectedValue?: string;
  onChange?: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="form-field">
      {label && <legend className="form-label mb-2">{label}</legend>}
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selectedValue === opt.value}
              onChange={() => onChange?.(opt.value)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <span className="label-text">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

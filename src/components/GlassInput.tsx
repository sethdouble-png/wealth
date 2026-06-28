import { InputHTMLAttributes } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const GlassInput = ({ label, className = '', ...props }: GlassInputProps) => (
  <label className="field-group">
    <span className="field-label">{label}</span>
    <input className={`glass-input ${className}`.trim()} {...props} />
  </label>
);

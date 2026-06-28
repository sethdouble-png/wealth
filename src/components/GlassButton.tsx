import { ButtonHTMLAttributes, ReactNode } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export const GlassButton = ({ children, variant = 'primary', className = '', ...props }: GlassButtonProps) => (
  <button className={`glass-button ${variant === 'secondary' ? 'secondary' : 'primary'} ${className}`.trim()} {...props}>
    {children}
  </button>
);

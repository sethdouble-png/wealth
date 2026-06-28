import { jsx as _jsx } from "react/jsx-runtime";
export const GlassButton = ({ children, variant = 'primary', className = '', ...props }) => (_jsx("button", { className: `glass-button ${variant === 'secondary' ? 'secondary' : 'primary'} ${className}`.trim(), ...props, children: children }));
//# sourceMappingURL=GlassButton.js.map
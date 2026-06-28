import { jsx as _jsx } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
const items = [
    { to: '/dashboard', label: 'Home' },
    { to: '/expenses', label: 'Spend' },
    { to: '/income', label: 'Income' },
    { to: '/budget', label: 'Budget' },
    { to: '/settings', label: 'Settings' },
];
export const Navbar = () => (_jsx("nav", { className: "bottom-nav", children: items.map((item) => (_jsx(NavLink, { to: item.to, className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, children: item.label }, item.to))) }));
//# sourceMappingURL=Navbar.js.map
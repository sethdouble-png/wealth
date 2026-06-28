import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Home' },
  { to: '/expenses', label: 'Spend' },
  { to: '/income', label: 'Income' },
  { to: '/budget', label: 'Budget' },
  { to: '/recurring', label: 'Recurring' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

export const Navbar = () => (
  <nav className="bottom-nav">
    {items.map((item) => (
      <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        {item.label}
      </NavLink>
    ))}
  </nav>
);

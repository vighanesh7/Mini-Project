import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/publishers', label: 'Publishers' },
  { to: '/authors', label: 'Authors' },
  { to: '/books', label: 'Books' },
  { to: '/inventory', label: 'Inventory' },
];

export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Link to="/" className="navbar-brand">
        <span aria-hidden="true">📚</span> Bookstore Inventory &amp; Author Catalog
      </Link>
      <span className="navbar-role">Admin</span>
    </header>
  );
}

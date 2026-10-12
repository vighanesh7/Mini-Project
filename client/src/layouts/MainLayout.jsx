import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Notifications from '../components/Notifications.jsx';

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-main" id="main-content">
          <Outlet />
        </main>
      </div>
      <Notifications />
    </div>
  );
}

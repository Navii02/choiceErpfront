import { LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout({ children, currentPath }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar user={user} currentPath={currentPath} onNavigate={(path) => navigate(path)} />

      <main className="content-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Bakery ERP</p>
            <h2>Operations overview</h2>
          </div>
          <div className="topbar-actions">
            <button type="button" className="icon-button"><Bell size={18} /></button>
            <div className="profile-pill">
              <span>{user?.name || 'User'}</span>
              <button type="button" className="logout-button" onClick={handleLogout}><LogOut size={16} /> Log out</button>
            </div>
          </div>
        </header>

        <div className="content-body">{children}</div>
      </main>
    </div>
  );
}

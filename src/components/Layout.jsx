import { useState } from 'react';
import { LogOut, Bell, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout({ children, currentPath }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={`sidebar-wrap ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          user={user}
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <main className="content-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="eyebrow">Bakery ERP</p>
              <h2>Operations overview</h2>
            </div>
          </div>
          <div className="topbar-actions">
            <button type="button" className="icon-button"><Bell size={18} /></button>
            <div className="profile-pill">
              <span className="profile-name">{user?.name || 'User'}</span>
              <button type="button" className="logout-button" onClick={handleLogout}>
                <LogOut size={16} /> <span className="logout-text">Log out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="content-body">{children}</div>
      </main>
    </div>
  );
}
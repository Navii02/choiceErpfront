import { BarChart3, Boxes, Building2, ShoppingCart, Users, Warehouse, FileText, RefreshCw, ShieldCheck, X } from 'lucide-react';

const navMap = {
  super_admin: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'POS / Billing', path: '/pos', icon: ShoppingCart },
    { label: 'Products', path: '/products', icon: Boxes },
    { label: 'Categories', path: '/categories', icon: Boxes },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Sync queue', path: '/sync', icon: RefreshCw },
  ],
  cashier: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'POS / Billing', path: '/pos', icon: ShoppingCart },
    { label: 'Products', path: '/products', icon: Boxes },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Sync queue', path: '/sync', icon: RefreshCw },
  ],
  admin: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'POS / Billing', path: '/pos', icon: ShoppingCart },
    { label: 'Products', path: '/products', icon: Boxes },
    { label: 'Categories', path: '/categories', icon: Boxes },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Sync queue', path: '/sync', icon: RefreshCw },
  ],
  production_manager: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Products', path: '/products', icon: Boxes },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Sync queue', path: '/sync', icon: RefreshCw },
  ],
  purchase_manager: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Products', path: '/products', icon: Boxes },
    { label: 'Categories', path: '/categories', icon: Boxes },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Sync queue', path: '/sync', icon: RefreshCw },
  ],
  accountant: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Sales', path: '/reports', icon: FileText },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Products', path: '/products', icon: Boxes },
    { label: 'Sync queue', path: '/sync', icon: RefreshCw },
  ],
};

export default function Sidebar({ user, currentPath, onNavigate, onClose }) {
  const items = navMap[user?.role] || navMap.cashier || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="brand-block">
          <div className="brand-badge"><Building2 size={18} /></div>
          <div>
            <h3>Bakery ERP</h3>
            <small>{user?.role?.replace('_', ' ') || 'User'}</small>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map(({ label, path, icon: Icon }) => (
          <button
            key={path}
            type="button"
            className={`nav-item ${currentPath === path ? 'active' : ''}`}
            onClick={() => onNavigate(path)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ShieldCheck size={16} />
        <span>RBAC enabled</span>
      </div>
    </aside>
  );
}
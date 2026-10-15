import { BarChart3, Boxes, Building2, CreditCard, DollarSign, FileText, Package, ShoppingCart, Users, Warehouse, Wrench, ShieldCheck } from 'lucide-react';

const navMap = {
  super_admin: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'POS / Billing', path: '/pos', icon: ShoppingCart },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: Boxes },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Reports', path: '/reports', icon: FileText },
  ],
  cashier: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'POS / Billing', path: '/pos', icon: ShoppingCart },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Reports', path: '/reports', icon: FileText },
  ],
  admin: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'POS / Billing', path: '/pos', icon: ShoppingCart },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: Boxes },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Reports', path: '/reports', icon: FileText },
  ],
  production_manager: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Reports', path: '/reports', icon: FileText },
  ],
  purchase_manager: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Categories', path: '/categories', icon: Boxes },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
  ],
  accountant: [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Sales', path: '/reports', icon: DollarSign },
    { label: 'Inventory', path: '/inventory', icon: Warehouse },
    { label: 'Products', path: '/products', icon: Package },
  ],
};

export default function Sidebar({ user, currentPath, onNavigate }) {
  const items = navMap[user?.role] || navMap.staff || [];

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-badge"><Building2 size={18} /></div>
        <div>
          <h3>Bakery ERP</h3>
          <small>{user?.role?.replace('_', ' ') || 'User'}</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(({ label, path, icon: Icon }) => (
          <button
            key={path}
            type="button"
            className={`nav-item ${currentPath === path ? 'active' : ''}`}
            onClick={() => onNavigate(path)}
          >
            <Icon size={18} />
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

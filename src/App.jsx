import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import CustomersPage from './pages/CustomersPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SyncStatusPage from './pages/SyncStatusPage';
import { startSyncEngine, stopSyncEngine } from './sync/syncEngine';

function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth();

  // Wait until the initial /auth/me check settles before deciding
  // whether to redirect. Prevents the "refresh → kicked to /login" bug.
  if (!authReady) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Bakery ERP</h1>
            <p>Restoring your session…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Wraps a page in the Layout and derives currentPath from the URL
 * so we don't have to hand-write currentPath on every route.
 */
function AppShell({ children }) {
  const { pathname } = useLocation();
  return <Layout currentPath={pathname}>{children}</Layout>;
}

/** Keeps sync engine tied to auth lifecycle. */
function SyncEngineBridge() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      stopSyncEngine();
      return undefined;
    }
    startSyncEngine();
    return () => stopSyncEngine();
  }, [user]);

  return null;
}

function AppContent() {
  const { user, authReady } = useAuth();

  return (
    <BrowserRouter>
      <SyncEngineBridge />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell><DashboardPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AppShell><ProductsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <AppShell><CategoriesPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <AppShell><CustomersPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <AppShell><POSPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <AppShell><InventoryPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppShell><ReportsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sync"
          element={
            <ProtectedRoute>
              <AppShell><SyncStatusPage /></AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            authReady ? (
              <Navigate to={user ? '/' : '/login'} replace />
            ) : (
              <div className="auth-page">
                <div className="auth-card">
                  <div className="auth-header">
                    <h1>Bakery ERP</h1>
                    <p>Loading…</p>
                  </div>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
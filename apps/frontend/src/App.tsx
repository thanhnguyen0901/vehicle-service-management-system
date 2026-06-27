import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authCheckRequest, selectIsAuthenticated } from './features/auth/authSlice';
import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { DashboardLayout } from './shared/layouts/DashboardLayout';
import { DashboardHome } from './features/dashboard/DashboardHome';
import { UserManagementPage } from './features/users/UserManagementPage';
import { CustomerListPage } from './features/customers/CustomerListPage';
import { VehicleListPage } from './features/vehicles/VehicleListPage';
import { ServiceCatalogPage } from './features/services/ServiceCatalogPage';
import { PartsPage } from './features/parts/PartsPage';
import { AppointmentListPage } from './features/appointments/AppointmentListPage';
import { WorkOrderListPage } from './features/work-orders/WorkOrderListPage';
import { InventoryTransactionsPage } from './features/inventory/InventoryTransactionsPage';
import { InvoiceListPage } from './features/invoices/InvoiceListPage';
import { MaintenanceHistoryPage } from './features/maintenance-history/MaintenanceHistoryPage';
import { ReminderListPage } from './features/reminders/ReminderListPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { AuditLogPage } from './features/audit-logs/AuditLogPage';

export default function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(authCheckRequest());
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="vehicles" element={<VehicleListPage />} />
        <Route path="appointments" element={<AppointmentListPage />} />
        <Route path="work-orders" element={<WorkOrderListPage />} />
        <Route path="services" element={<ServiceCatalogPage />} />
        <Route path="parts" element={<PartsPage />} />
        <Route path="inventory" element={<InventoryTransactionsPage />} />
        <Route path="invoices" element={<InvoiceListPage />} />
        <Route path="maintenance-history" element={<MaintenanceHistoryPage />} />
        <Route path="reminders" element={<ReminderListPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="audit-logs" element={<AuditLogPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

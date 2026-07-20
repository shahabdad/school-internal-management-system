import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Layouts
import { AuthLayout, DashboardLayout } from '../layouts';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { StudentsPage } from '../pages/StudentsPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { MembershipsPage } from '../pages/MembershipsPage';
import { CallLogsPage } from '../pages/CallLogsPage';
import { ComplaintsPage } from '../pages/ComplaintsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { UsersPage } from '../pages/UsersPage';
import { RolesPage } from '../pages/RolesPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.STUDENTS} element={<StudentsPage />} />
          <Route path={ROUTES.PAYMENTS} element={<PaymentsPage />} />
          <Route path={ROUTES.MEMBERSHIPS} element={<MembershipsPage />} />
          <Route path={ROUTES.CALL_LOGS} element={<CallLogsPage />} />
          <Route path={ROUTES.COMPLAINTS} element={<ComplaintsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.USERS} element={<UsersPage />} />
          <Route path={ROUTES.ROLES} element={<RolesPage />} />
          <Route path={ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 Fallback Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

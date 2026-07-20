import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="app-layout">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="main-wrapper">
        {/* Header Component */}
        <Header />

        {/* Main Content Outlet */}
        <main className="main-content">
          <Outlet />
        </main>

        {/* Footer Component */}
        <Footer />

        {/* Support Banner */}
        <div className="support-banner">
          <h4>Need Support?</h4>
          <p>Live support is available until 6:00 PM for all administrative agents.</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="page-footer">
      <div>© {new Date().getFullYear()} Academix Pro School Management System. All rights reserved.</div>
    </footer>
  );
};

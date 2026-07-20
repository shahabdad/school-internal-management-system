import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ROUTES } from '../constants/routes';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <AlertCircle size={56} className="text-blue-600 mb-4" />
      <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit'] mb-2">404 - Page Not Found</h1>
      <p className="text-slate-500 mb-6 max-w-md">
        The page or school management resource you are looking for does not exist or has been moved.
      </p>
      <Link to={ROUTES.DASHBOARD} className="btn-primary">
        Return to Admin Dashboard
      </Link>
    </div>
  );
};

import { Metadata } from 'next';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import { RequireAuth } from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  title: 'Security Dashboard - BuildDiaspora Zimbabwe',
  description: 'Monitor security events and alerts for the BuildDiaspora platform',
};

export default function SecurityDashboardPage() {
  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SecurityDashboard />
        </div>
      </div>
    </RequireAuth>
  );
} 
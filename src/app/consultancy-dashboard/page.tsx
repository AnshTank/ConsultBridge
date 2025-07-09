import dynamic from 'next/dynamic';

// Dynamically import the DashboardPage with no SSR
const UserDashboard = dynamic(
  () => import('../../pages/DashboardPage'),
  { ssr: false }
);

export default function ConsultancyDashboardRoute() {
  return (
    <div>
      <UserDashboard />
    </div>
  );
}
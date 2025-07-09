import dynamic from 'next/dynamic';

// Dynamically import the UserDashboard with no SSR
const UserDashboard = dynamic(
  () => import('../../pages/UserDashboard'),
  { ssr: false }
);

export default function ConsultancyDashboardRoute() {
  return (
    <div>
      <UserDashboard />
    </div>
  );
}
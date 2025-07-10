// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ConsultancyProfilePage from '../../../components/pages/ConsultancyProfilePage'

export default function ConsultancyPage({ params }: { params: { id: string } }) {
  return <ConsultancyProfilePage id={params.id} />
}
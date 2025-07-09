import ConsultancyProfilePage from '../../../pages/ConsultancyProfilePage'

export default function ConsultancyPageRoute({ params }: { params: { id: string } }) {
  return <ConsultancyProfilePage id={params.id} />
}
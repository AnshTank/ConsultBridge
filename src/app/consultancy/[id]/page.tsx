import ConsultancyProfilePage from '../../../components/pages/ConsultancyProfilePage'

interface Props {
  params: { id: string }
}

export default function ConsultancyProfilePageRoute({ params }: Props) {
  return <ConsultancyProfilePage id={params.id} />
}
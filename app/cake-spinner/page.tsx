import { CakeSpinner } from '@/components/cake-spinner'
import { getCakeEvents } from '@/lib/cake-data'

export default async function CakeSpinnerPage() {
  const events = await getCakeEvents()
  return <CakeSpinner cakeEvents={events} />
}

import { CakeCalendar } from '@/components/cake-calendar'
import { auth } from '@/lib/auth'
import { getCakeEvents, getCakeSuggestions } from '@/lib/cake-data'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  const events = await getCakeEvents()
  const suggestions = session?.user ? await getCakeSuggestions() : []
  return <CakeCalendar initialEvents={events} initialSuggestions={suggestions} isAdmin={Boolean(session?.user)} />
}
